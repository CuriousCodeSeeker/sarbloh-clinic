import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import {
  InventoryTransactionType,
  PaymentMethod,
  PaymentStatus,
  SaleStatus,
} from '@prisma/client';
import { CreateConsultancyDto } from './dto/create-consultancy.dto';

@Injectable()
export class SalesService {
  constructor(private prisma: PrismaService) {}

  private async generateInvoiceNumber(): Promise<string> {
    const count = await this.prisma.sale.count();
    const next = count + 1;
    const date = new Date();
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    return `INV-${y}${m}-${String(next).padStart(5, '0')}`;
  }

  private async getCurrentStock(medicineId: string): Promise<number> {
    const transactions = await this.prisma.inventoryTransaction.findMany({
      where: { medicineId },
      select: { transactionType: true, quantity: true },
    });

    return transactions.reduce((sum, tx) => {
      const qty = Number(tx.quantity);
      if (
        tx.transactionType === InventoryTransactionType.SALE ||
        tx.transactionType === InventoryTransactionType.DAMAGE ||
        tx.transactionType === InventoryTransactionType.EXPIRED ||
        tx.transactionType === InventoryTransactionType.TRANSFER
      ) {
        return sum - Math.abs(qty);
      }
      return sum + Math.abs(qty);
    }, 0);
  }

  async create(dto: CreateSaleDto, userId?: string) {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('At least one item is required');
    }

    for (const item of dto.items) {
      const medicine = await this.prisma.medicine.findFirst({
        where: { id: item.medicineId, deletedAt: null, isActive: true },
      });
      if (!medicine) {
        throw new NotFoundException(`Medicine not found: ${item.medicineId}`);
      }

      const stock = await this.getCurrentStock(item.medicineId);
      if (stock < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for ${medicine.name}. Available: ${stock}`,
        );
      }
    }

    if (dto.patientId) {
      const patient = await this.prisma.patient.findFirst({
        where: { id: dto.patientId, deletedAt: null },
      });
      if (!patient) {
        throw new NotFoundException('Patient not found');
      }
    }

    const subtotal = dto.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0,
    );
    const discount = dto.discount || 0;
    const tax = dto.tax || 0;
    const total = subtotal - discount + tax;
    const paidAmount = dto.paidAmount || 0;
    const dueAmount = Math.max(total - paidAmount, 0);

    let paymentStatus: PaymentStatus = PaymentStatus.PENDING;
    if (paidAmount >= total && total > 0) {
      paymentStatus = PaymentStatus.PAID;
    } else if (paidAmount > 0) {
      paymentStatus = PaymentStatus.PARTIAL;
    }

    const invoiceNumber = await this.generateInvoiceNumber();

    return this.prisma.$transaction(async (tx) => {
      const created = await tx.sale.create({
        data: {
          invoiceNumber,
          patientId: dto.patientId || null,
          subtotal,
          discount,
          tax,
          total,
          paidAmount,
          dueAmount,
          paymentStatus,
          paymentMethod: dto.paymentMethod || null,
          status: SaleStatus.COMPLETED,
          notes: dto.notes,
          createdById: userId || null,
          items: {
            create: dto.items.map((item) => ({
              medicineId: item.medicineId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              total: item.quantity * item.unitPrice,
            })),
          },
        },
        include: {
          patient: {
            select: { id: true, patientCode: true, fullName: true },
          },
          items: {
            include: {
              medicine: {
                select: { id: true, name: true, unit: true },
              },
            },
          },
          payments: true,
        },
      });

      if (paidAmount > 0 && dto.paymentMethod) {
        await tx.payment.create({
          data: {
            saleId: created.id,
            amount: paidAmount,
            method: dto.paymentMethod,
          },
        });
      }

      for (const item of dto.items) {
        await tx.inventoryTransaction.create({
          data: {
            medicineId: item.medicineId,
            transactionType: InventoryTransactionType.SALE,
            quantity: item.quantity,
            referenceType: 'SALE',
            referenceId: created.id,
            notes: `Sale ${invoiceNumber}`,
            createdById: userId || null,
          },
        });
      }

      return created;
    });
  }

  async findAll(params: { page?: number; limit?: number; search?: string }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {
      status: { not: SaleStatus.CANCELLED },
    };

    if (params.search) {
      const term = params.search.trim();
      where.OR = [
        { invoiceNumber: { contains: term, mode: 'insensitive' } },
        {
          patient: {
            fullName: { contains: term, mode: 'insensitive' },
          },
        },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.sale.findMany({
        where,
        skip,
        take: limit,
        orderBy: { saleDate: 'desc' },
        include: {
          patient: {
            select: { id: true, patientCode: true, fullName: true },
          },
          items: {
            include: {
              medicine: {
                select: { id: true, name: true },
              },
            },
          },
        },
      }),
      this.prisma.sale.count({ where }),
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

    async createConsultancy(dto: CreateConsultancyDto, userId?: string) {
    if (dto.fee < 0) {
      throw new BadRequestException('Fee cannot be negative');
    }

    if (dto.patientId) {
      const patient = await this.prisma.patient.findFirst({
        where: { id: dto.patientId, deletedAt: null },
      });
      if (!patient) {
        throw new NotFoundException('Patient not found');
      }
    }

    const total = dto.fee;
    const paidAmount = dto.paidAmount || 0;
    const dueAmount = Math.max(total - paidAmount, 0);

    let paymentStatus: PaymentStatus = PaymentStatus.PENDING;
    if (paidAmount >= total && total > 0) {
      paymentStatus = PaymentStatus.PAID;
    } else if (paidAmount > 0) {
      paymentStatus = PaymentStatus.PARTIAL;
    }

    const invoiceNumber = await this.generateInvoiceNumber();

    return this.prisma.$transaction(async (tx) => {
      const created = await tx.sale.create({
        data: {
          invoiceNumber,
          patientId: dto.patientId || null,
          saleType: 'CONSULTANCY' as any,
          subtotal: total,
          discount: 0,
          tax: 0,
          total,
          paidAmount,
          dueAmount,
          paymentStatus,
          paymentMethod: dto.paymentMethod || null,
          status: SaleStatus.COMPLETED,
          notes: dto.notes || 'Consultancy fee',
          createdById: userId || null,
        },
        include: {
          patient: {
            select: { id: true, patientCode: true, fullName: true },
          },
          items: true,
          payments: true,
        },
      });

      if (paidAmount > 0 && dto.paymentMethod) {
        await tx.payment.create({
          data: {
            saleId: created.id,
            amount: paidAmount,
            method: dto.paymentMethod,
          },
        });
      }

      return created;
    });
  }

  async findOne(id: string) {
    const sale = await this.prisma.sale.findUnique({
      where: { id },
      include: {
        patient: {
          select: { id: true, patientCode: true, fullName: true },
        },
        items: {
          include: {
            medicine: {
              select: { id: true, name: true, unit: true },
            },
          },
        },
        payments: true,
        createdBy: {
          select: { id: true, fullName: true },
        },
      },
    });

    if (!sale) {
      throw new NotFoundException('Sale not found');
    }

    return sale;
  }

  async recordPayment(
    id: string,
    dto: { amount: number; method: PaymentMethod; notes?: string },
  ) {
    const sale = await this.prisma.sale.findUnique({ where: { id } });

    if (!sale) {
      throw new NotFoundException('Sale not found');
    }

    if (sale.status !== SaleStatus.COMPLETED) {
      throw new BadRequestException(
        'Payment can only be recorded on a completed sale',
      );
    }

    const due = Number(sale.dueAmount);
    if (due <= 0) {
      throw new BadRequestException('This invoice is already fully paid');
    }

    if (dto.amount > due) {
      throw new BadRequestException(
        `Amount cannot be more than due amount (${due})`,
      );
    }

    const paidAmount = Number(sale.paidAmount) + dto.amount;
    const dueAmount = Math.max(Number(sale.total) - paidAmount, 0);

    let paymentStatus: PaymentStatus = PaymentStatus.PENDING;
    if (dueAmount <= 0) {
      paymentStatus = PaymentStatus.PAID;
    } else if (paidAmount > 0) {
      paymentStatus = PaymentStatus.PARTIAL;
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.payment.create({
        data: {
          saleId: id,
          amount: dto.amount,
          method: dto.method,
          notes: dto.notes,
        },
      });

      return tx.sale.update({
        where: { id },
        data: {
          paidAmount,
          dueAmount,
          paymentStatus,
          paymentMethod: dto.method,
        },
        include: {
          patient: {
            select: { id: true, patientCode: true, fullName: true },
          },
          items: {
            include: {
              medicine: { select: { id: true, name: true, unit: true } },
            },
          },
          payments: true,
        },
      });
    });
  }
}