import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { UpdateMedicineDto } from './dto/update-medicine.dto';

@Injectable()
export class MedicinesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateMedicineDto) {
    return this.prisma.medicine.create({
      data: {
        name: dto.name,
        brand: dto.brand,
        categoryId: dto.categoryId || null,
        unit: dto.unit,
        sku: dto.sku,
        description: dto.description,
        reorderLevel: dto.reorderLevel ?? 10,
        purchasePrice: dto.purchasePrice ?? null,
        sellingPrice: dto.sellingPrice ?? null,
      },
      include: {
        category: true,
      },
    });
  }

  async findAll(params: {
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

    const [data, total] = await Promise.all([
      this.prisma.medicine.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: { category: true },
      }),
      this.prisma.medicine.count({ where }),
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

  async findOne(id: string) {
    const medicine = await this.prisma.medicine.findFirst({
      where: { id, deletedAt: null },
      include: { category: true },
    });

    if (!medicine) {
      throw new NotFoundException('Medicine not found');
    }

    return medicine;
  }

  async update(id: string, dto: UpdateMedicineDto) {
    await this.findOne(id);

    return this.prisma.medicine.update({
      where: { id },
      data: {
        name: dto.name,
        brand: dto.brand,
        categoryId: dto.categoryId,
        unit: dto.unit,
        sku: dto.sku,
        description: dto.description,
        reorderLevel: dto.reorderLevel,
        purchasePrice: dto.purchasePrice,
        sellingPrice: dto.sellingPrice,
      },
      include: { category: true },
    });
  }

  async softDelete(id: string) {
    await this.findOne(id);

    return this.prisma.medicine.update({
      where: { id },
      data: {
        isActive: false,
        deletedAt: new Date(),
      },
    });
  }

  async getCategories() {
    return this.prisma.medicineCategory.findMany({
      orderBy: { name: 'asc' },
    });
  }
}