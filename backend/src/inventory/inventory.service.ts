import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { InventoryTransactionType } from '@prisma/client';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  private isOutflow(type: InventoryTransactionType): boolean {
    return (
      type === InventoryTransactionType.SALE ||
      type === InventoryTransactionType.DAMAGE ||
      type === InventoryTransactionType.EXPIRED ||
      type === InventoryTransactionType.TRANSFER
    );
  }

  private calcStock(
    transactions: { transactionType: InventoryTransactionType; quantity: any }[],
  ): number {
    return transactions.reduce((sum, tx) => {
      const qty = Number(tx.quantity);
      return this.isOutflow(tx.transactionType)
        ? sum - Math.abs(qty)
        : sum + Math.abs(qty);
    }, 0);
  }

  async getMedicineStockLevels(params?: { search?: string }) {
    const where: any = { isActive: true, deletedAt: null };
    if (params?.search) {
      const term = params.search.trim();
      where.OR = [
        { name: { contains: term, mode: 'insensitive' } },
        { brand: { contains: term, mode: 'insensitive' } },
        { sku: { contains: term, mode: 'insensitive' } },
      ];
    }

    const medicines = await this.prisma.medicine.findMany({
      where,
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        brand: true,
        unit: true,
        sku: true,
        reorderLevel: true,
      },
    });

    if (medicines.length === 0) return [];

    const transactions = await this.prisma.inventoryTransaction.findMany({
      where: {
        medicineId: { in: medicines.map((m) => m.id) },
      },
      select: {
        medicineId: true,
        transactionType: true,
        quantity: true,
      },
    });

    const byMed = new Map<string, typeof transactions>();
    for (const tx of transactions) {
      if (!tx.medicineId) continue;
      const list = byMed.get(tx.medicineId) || [];
      list.push(tx);
      byMed.set(tx.medicineId, list);
    }

    return medicines.map((m) => {
      const currentStock = this.calcStock(byMed.get(m.id) || []);
      return {
        id: m.id,
        type: 'MEDICINE' as const,
        name: m.name,
        brand: m.brand,
        unit: m.unit,
        sku: m.sku,
        reorderLevel: m.reorderLevel,
        currentStock,
        needsReorder: currentStock <= (m.reorderLevel ?? 0),
      };
    });
  }

  async getHerbStockLevels(params?: { search?: string }) {
    const where: any = { isActive: true };
    if (params?.search) {
      const term = params.search.trim();
      where.OR = [
        { commonName: { contains: term, mode: 'insensitive' } },
        { botanicalName: { contains: term, mode: 'insensitive' } },
        {
          names: {
            some: { name: { contains: term, mode: 'insensitive' } },
          },
        },
      ];
    }

    const herbs = await this.prisma.herb.findMany({
      where,
      orderBy: { commonName: 'asc' },
      select: {
        id: true,
        commonName: true,
        botanicalName: true,
        names: true,
      },
    });

    if (herbs.length === 0) return [];

    const transactions = await this.prisma.inventoryTransaction.findMany({
      where: { herbId: { in: herbs.map((h) => h.id) } },
      select: {
        herbId: true,
        transactionType: true,
        quantity: true,
      },
    });

    const byHerb = new Map<string, typeof transactions>();
    for (const tx of transactions) {
      if (!tx.herbId) continue;
      const list = byHerb.get(tx.herbId) || [];
      list.push(tx);
      byHerb.set(tx.herbId, list);
    }

    return herbs.map((h) => {
      const currentStock = this.calcStock(byHerb.get(h.id) || []);
      const enName = h.names?.find((n) => n.languageCode === 'en')?.name;
      return {
        id: h.id,
        type: 'HERB' as const,
        name: enName || h.commonName || h.botanicalName || 'Herb',
        brand: null,
        unit: null,
        sku: null,
        reorderLevel: 0,
        currentStock,
        needsReorder: currentStock <= 0,
      };
    });
  }

  async adjustStock(dto: AdjustStockDto, userId?: string) {
    if (!dto.medicineId && !dto.herbId) {
      throw new BadRequestException('Select a medicine or a herb');
    }
    if (dto.medicineId && dto.herbId) {
      throw new BadRequestException('Choose either medicine or herb, not both');
    }

    if (dto.medicineId) {
      const medicine = await this.prisma.medicine.findFirst({
        where: { id: dto.medicineId, deletedAt: null, isActive: true },
      });
      if (!medicine) throw new NotFoundException('Medicine not found');

      if (this.isOutflow(dto.transactionType)) {
        const txs = await this.prisma.inventoryTransaction.findMany({
          where: { medicineId: dto.medicineId },
          select: { transactionType: true, quantity: true },
        });
        const stock = this.calcStock(txs);
        if (stock < dto.quantity) {
          throw new BadRequestException(
            `Insufficient stock. Available: ${stock}`,
          );
        }
      }
    }

    if (dto.herbId) {
      const herb = await this.prisma.herb.findFirst({
        where: { id: dto.herbId, isActive: true },
      });
      if (!herb) throw new NotFoundException('Herb not found');

      if (this.isOutflow(dto.transactionType)) {
        const txs = await this.prisma.inventoryTransaction.findMany({
          where: { herbId: dto.herbId },
          select: { transactionType: true, quantity: true },
        });
        const stock = this.calcStock(txs);
        if (stock < dto.quantity) {
          throw new BadRequestException(
            `Insufficient stock. Available: ${stock}`,
          );
        }
      }
    }

    return this.prisma.inventoryTransaction.create({
      data: {
        medicineId: dto.medicineId || null,
        herbId: dto.herbId || null,
        transactionType: dto.transactionType,
        quantity: dto.quantity,
        notes: dto.notes,
        createdById: userId || null,
      },
      include: {
        medicine: { select: { id: true, name: true } },
        herb: {
          select: {
            id: true,
            commonName: true,
            botanicalName: true,
            names: true,
          },
        },
      },
    });
  }

  async getTransactions(params?: {
    medicineId?: string;
    herbId?: string;
    limit?: number;
  }) {
    const where: any = {};
    if (params?.medicineId) where.medicineId = params.medicineId;
    if (params?.herbId) where.herbId = params.herbId;

    return this.prisma.inventoryTransaction.findMany({
      where,
      take: params?.limit || 50,
      orderBy: { createdAt: 'desc' },
      include: {
        medicine: { select: { id: true, name: true } },
        herb: {
          select: {
            id: true,
            commonName: true,
            botanicalName: true,
            names: true,
          },
        },
      },
    });
  }
}