import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InventoryTransactionType, SaleStatus } from '@prisma/client';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getSummary(fromDate?: string, toDate?: string) {
    const now = new Date();
    const start = fromDate
      ? new Date(fromDate)
      : new Date(now.getFullYear(), now.getMonth(), 1);
    start.setHours(0, 0, 0, 0);

    const end = toDate ? new Date(toDate) : new Date(now);
    end.setHours(23, 59, 59, 999);

    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );

    const [
      patientsTotal,
      visitsInPeriod,
      visitsToday,
      salesInPeriod,
      paymentsInPeriod,
      outstanding,
      lowStockCount,
    ] = await Promise.all([
      this.prisma.patient.count({
        where: { isActive: true, deletedAt: null },
      }),
      this.prisma.visit.count({
        where: { visitDate: { gte: start, lte: end } },
      }),
      this.prisma.visit.count({
        where: { visitDate: { gte: startOfToday } },
      }),
      this.prisma.sale.aggregate({
        where: {
          status: SaleStatus.COMPLETED,
          saleDate: { gte: start, lte: end },
        },
        _sum: { total: true, paidAmount: true, dueAmount: true },
        _count: true,
      }),
      this.prisma.payment.aggregate({
        where: { paidAt: { gte: start, lte: end } },
        _sum: { amount: true },
      }),
      this.prisma.sale.aggregate({
        where: {
          status: SaleStatus.COMPLETED,
          paymentStatus: { in: ['PENDING', 'PARTIAL'] },
        },
        _sum: { dueAmount: true },
        _count: true,
      }),
      this.getLowStockCount(),
    ]);

    return {
      period: {
        from: start.toISOString().slice(0, 10),
        to: end.toISOString().slice(0, 10),
      },
      patientsTotal,
      visitsInPeriod,
      visitsToday,
      salesCount: salesInPeriod._count,
      salesTotal: Number(salesInPeriod._sum.total || 0),
      collected: Number(paymentsInPeriod._sum.amount || 0),
      outstandingAmount: Number(outstanding._sum.dueAmount || 0),
      outstandingInvoices: outstanding._count,
      lowStockCount,
    };
  }

  private async getLowStockCount(): Promise<number> {
    const medicines = await this.prisma.medicine.findMany({
      where: { isActive: true, deletedAt: null },
      select: { id: true, reorderLevel: true },
    });

    if (medicines.length === 0) return 0;

    const transactions = await this.prisma.inventoryTransaction.findMany({
      where: { medicineId: { in: medicines.map((m) => m.id) } },
      select: { medicineId: true, transactionType: true, quantity: true },
    });

    const stockMap = new Map<string, number>();
    for (const tx of transactions) {
      if (!tx.medicineId) continue;

      const qty = Number(tx.quantity);
      const signed =
        tx.transactionType === InventoryTransactionType.SALE ||
        tx.transactionType === InventoryTransactionType.DAMAGE ||
        tx.transactionType === InventoryTransactionType.EXPIRED ||
        tx.transactionType === InventoryTransactionType.TRANSFER
          ? -Math.abs(qty)
          : Math.abs(qty);

      stockMap.set(tx.medicineId, (stockMap.get(tx.medicineId) || 0) + signed);
    }

    return medicines.filter((m) => {
      const stock = stockMap.get(m.id) || 0;
      return stock <= (m.reorderLevel || 0);
    }).length;
  }

  async getSalesReport(fromDate?: string, toDate?: string) {
    const now = new Date();
    const start = fromDate
      ? new Date(fromDate)
      : new Date(now.getFullYear(), now.getMonth(), 1);
    start.setHours(0, 0, 0, 0);
    const end = toDate ? new Date(toDate) : new Date(now);
    end.setHours(23, 59, 59, 999);

    const sales = await this.prisma.sale.findMany({
      where: {
        status: SaleStatus.COMPLETED,
        saleDate: { gte: start, lte: end },
      },
      orderBy: { saleDate: 'desc' },
      include: {
        patient: {
          select: { fullName: true, patientCode: true },
        },
        items: {
          include: {
            medicine: { select: { name: true } },
          },
        },
      },
    });

    return sales.map((s) => ({
      id: s.id,
      invoiceNumber: s.invoiceNumber,
      saleDate: s.saleDate,
      patientName: s.patient?.fullName || 'Walk-in',
      total: Number(s.total),
      paidAmount: Number(s.paidAmount),
      dueAmount: Number(s.dueAmount),
      paymentStatus: s.paymentStatus,
      itemCount: s.items.length,
    }));
  }

  async getLowStockReport() {
    const medicines = await this.prisma.medicine.findMany({
      where: { isActive: true, deletedAt: null },
      select: {
        id: true,
        name: true,
        brand: true,
        unit: true,
        reorderLevel: true,
      },
      orderBy: { name: 'asc' },
    });

    const transactions = await this.prisma.inventoryTransaction.findMany({
      where: { medicineId: { in: medicines.map((m) => m.id) } },
      select: { medicineId: true, transactionType: true, quantity: true },
    });

    const stockMap = new Map<string, number>();
    for (const tx of transactions) {
      if (!tx.medicineId) continue;

      const qty = Number(tx.quantity);
      const signed =
        tx.transactionType === InventoryTransactionType.SALE ||
        tx.transactionType === InventoryTransactionType.DAMAGE ||
        tx.transactionType === InventoryTransactionType.EXPIRED ||
        tx.transactionType === InventoryTransactionType.TRANSFER
          ? -Math.abs(qty)
          : Math.abs(qty);

      stockMap.set(tx.medicineId, (stockMap.get(tx.medicineId) || 0) + signed);
    }

    return medicines
      .map((m) => {
        const currentStock = stockMap.get(m.id) || 0;
        return {
          id: m.id,
          name: m.name,
          brand: m.brand,
          unit: m.unit,
          reorderLevel: m.reorderLevel,
          currentStock,
          needsReorder: currentStock <= (m.reorderLevel || 0),
        };
      })
      .filter((m) => m.needsReorder);
  }

  async getVisitsReport(fromDate?: string, toDate?: string) {
    const now = new Date();
    const start = fromDate
      ? new Date(fromDate)
      : new Date(now.getFullYear(), now.getMonth(), 1);
    start.setHours(0, 0, 0, 0);
    const end = toDate ? new Date(toDate) : new Date(now);
    end.setHours(23, 59, 59, 999);

    return this.prisma.visit.findMany({
      where: { visitDate: { gte: start, lte: end } },
      orderBy: { visitDate: 'desc' },
      include: {
        patient: {
          select: { fullName: true, patientCode: true },
        },
        practitioner: {
          select: { fullName: true },
        },
      },
    });
  }
}