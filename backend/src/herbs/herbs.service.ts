import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHerbDto } from './dto/create-herb.dto';
import { UpdateHerbDto } from './dto/update-herb.dto';

@Injectable()
export class HerbsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateHerbDto) {
    return this.prisma.herb.create({
      data: {
        botanicalName: dto.botanicalName,
        commonName: dto.commonName,
        description: dto.description,
        benefits: dto.benefits,
        uses: dto.uses,
        partsUsed: dto.partsUsed,
        preparation: dto.preparation,
        dosage: dto.dosage,
        contraindications: dto.contraindications,
        names: dto.names?.length
          ? {
              create: dto.names.map((n) => ({
                languageCode: n.languageCode,
                name: n.name,
              })),
            }
          : undefined,
      },
      include: { names: true },
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

    const where: any = { isActive: true };

    if (params.search) {
      const term = params.search.trim();
      where.OR = [
        { botanicalName: { contains: term, mode: 'insensitive' } },
        { commonName: { contains: term, mode: 'insensitive' } },
        { names: { some: { name: { contains: term, mode: 'insensitive' } } } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.herb.findMany({
        where,
        skip,
        take: limit,
        orderBy: { commonName: 'asc' },
        include: { names: true },
      }),
      this.prisma.herb.count({ where }),
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
    const herb = await this.prisma.herb.findFirst({
      where: { id, isActive: true },
      include: { names: true },
    });

    if (!herb) {
      throw new NotFoundException('Herb not found');
    }

    return herb;
  }

  async update(id: string, dto: UpdateHerbDto) {
    await this.findOne(id);

    // Replace names if provided
    if (dto.names) {
      await this.prisma.herbName.deleteMany({ where: { herbId: id } });
    }

    return this.prisma.herb.update({
      where: { id },
      data: {
        botanicalName: dto.botanicalName,
        commonName: dto.commonName,
        description: dto.description,
        benefits: dto.benefits,
        uses: dto.uses,
        partsUsed: dto.partsUsed,
        preparation: dto.preparation,
        dosage: dto.dosage,
        contraindications: dto.contraindications,
        names: dto.names?.length
          ? {
              create: dto.names.map((n) => ({
                languageCode: n.languageCode,
                name: n.name,
              })),
            }
          : undefined,
      },
      include: { names: true },
    });
  }

  async softDelete(id: string) {
    await this.findOne(id);

    return this.prisma.herb.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
