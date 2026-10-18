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

  private signedQuantity(
    type: InventoryTransactionType,
    quantity: number,
  ): number {
    const inflow = [
      InventoryTransactionType.PURCHASE,
      InventoryTransactionType.RETURN,
      InventoryTransactionType.ADJUSTMENT,
    ];
    // ADJUSTMENT can be in or out; for simple stock-in we treat positive as in.
    // For stock-out use SALE, DAMAGE, EXPIRED, TRANSFER.
    if (
      type === InventoryTransactionType.SALE ||
      type === InventoryTransactionType.DAMAGE ||
      type === InventoryTransactionType.EXPIRED ||
      type === InventoryTransactionType.TRANSFER
    ) {
      return -Math.abs(quantity);
    }
    return Math.abs(quantity);
  }

  async getStockLevels(params: {
    page?: number;
    limit?: number;
    search?: string;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {
      deletedAt: null,
      isActive: true,
    };

    if (params.search) {
      const term = params.search.trim();
      where.OR = [
        { name: { contains: term, mode: 'insensitive' } },
        { brand: { contains: term, mode: 'insensitive' } },
        { sku: { contains: term, mode: 'insensitive' } },
      ];
    }

    const [medicines, total] = await Promise.all([
      this.prisma.medicine.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
          brand: true,
          unit: true,
          sku: true,
          reorderLevel: true,
          sellingPrice: true,
        },
      }),
      this.prisma.medicine.count({ where }),
    ]);

    const medicineIds = medicines.map((m) => m.id);

    const transactions = await this.prisma.inventoryTransaction.findMany({
      where: { medicineId: { in: medicineIds } },
      select: {
        medicineId: true,
        transactionType: true,
        quantity: true,
      },
    });

    const stockMap = new Map<string, number>();

    for (const tx of transactions) {
      const qty = this.signedQuantity(
        tx.transactionType,
        Number(tx.quantity),
      );
      stockMap.set(tx.medicineId, (stockMap.get(tx.medicineId) || 0) + qty);
    }

    const data = medicines.map((med) => {
      const currentStock = stockMap.get(med.id) || 0;
      return {
        ...med,
        currentStock,
        needsReorder: currentStock <= (med.reorderLevel || 0),
      };
    });

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async adjustStock(dto: AdjustStockDto, userId?: string) {
    const medicine = await this.prisma.medicine.findFirst({
      where: { id: dto.medicineId, deletedAt: null, isActive: true },
    });

    if (!medicine) {
      throw new NotFoundException('Medicine not found');
    }

    if (dto.quantity <= 0) {
      throw new BadRequestException('Quantity must be greater than 0');
    }

    // Prevent negative stock on outflow
        const isOutflow =
      dto.transactionType === InventoryTransactionType.SALE ||
      dto.transactionType === InventoryTransactionType.DAMAGE ||
      dto.transactionType === InventoryTransactionType.EXPIRED ||
      dto.transactionType === InventoryTransactionType.TRANSFER;

    if (isOutflow) {
      const current = await this.getCurrentStock(dto.medicineId);
      if (current < dto.quantity) {
        throw new BadRequestException(
          `Insufficient stock. Available: ${current}`,
        );
      }
    }

    return this.prisma.inventoryTransaction.create({
      data: {
        medicineId: dto.medicineId,
        transactionType: dto.transactionType,
        quantity: dto.quantity,
        notes: dto.notes,
        createdById: userId || null,
      },
      include: {
        medicine: {
          select: { id: true, name: true, unit: true },
        },
      },
    });
  }

  async getCurrentStock(medicineId: string): Promise<number> {
    const transactions = await this.prisma.inventoryTransaction.findMany({
      where: { medicineId },
      select: { transactionType: true, quantity: true },
    });

    return transactions.reduce((sum, tx) => {
      return sum + this.signedQuantity(tx.transactionType, Number(tx.quantity));
    }, 0);
  }

  async getTransactions(params: {
    page?: number;
    limit?: number;
    medicineId?: string;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 30;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.medicineId) {
      where.medicineId = params.medicineId;
    }

    const [data, total] = await Promise.all([
      this.prisma.inventoryTransaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          medicine: {
            select: { id: true, name: true, unit: true },
          },
          createdBy: {
            select: { id: true, fullName: true },
          },
        },
      }),
      this.prisma.inventoryTransaction.count({ where }),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
