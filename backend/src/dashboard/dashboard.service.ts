import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InventoryTransactionType } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  private async countMedicinesToReorder(): Promise<number> {
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
      return stock <= (m.reorderLevel ?? 0);
    }).length;
  }

  async getStats() {
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const in7Days = new Date(now);
    in7Days.setDate(in7Days.getDate() + 7);

    const [
      registeredPatients,
      visitsToday,
      visitsThisMonth,
      collectedThisMonth,
      medicinesToReorder,
      followUpsIn7Days,
      todaysAppointments,
      outstanding,
    ] = await Promise.all([
      this.prisma.patient.count({
        where: { isActive: true, deletedAt: null },
      }),

      this.prisma.visit.count({
        where: { visitDate: { gte: startOfToday } },
      }),

      this.prisma.visit.count({
        where: { visitDate: { gte: startOfMonth } },
      }),

      this.prisma.payment.aggregate({
        where: { paidAt: { gte: startOfMonth } },
        _sum: { amount: true },
      }),

      this.countMedicinesToReorder(),

      this.prisma.visit.count({
        where: {
          followUpDate: {
            gte: startOfToday,
            lte: in7Days,
          },
        },
      }),

      this.prisma.appointment.count({
        where: {
          appointmentDate: {
            gte: startOfToday,
            lt: new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000),
          },
          status: { in: ['SCHEDULED', 'CONFIRMED'] },
        },
      }),

      this.prisma.sale.aggregate({
        where: {
          status: 'COMPLETED',
          paymentStatus: { in: ['PENDING', 'PARTIAL'] },
        },
        _sum: { dueAmount: true },
      }),
    ]);

    return {
      registeredPatients,
      visitsToday,
      visitsThisMonth,
      collectedThisMonth: Number(collectedThisMonth._sum.amount || 0),
      medicinesToReorder,
      followUpsIn7Days,
      todaysAppointments,
      outstanding: Number(outstanding._sum.dueAmount || 0),
    };
  }
}