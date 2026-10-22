import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDiseaseCategoryDto } from './dto/create-disease-category.dto';
import { UpdateDiseaseCategoryDto } from './dto/update-disease-category.dto';

@Injectable()
export class DiseaseCategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateDiseaseCategoryDto) {
    const existing = await this.prisma.diseaseCategory.findUnique({
      where: { name: dto.name.trim() },
    });
    if (existing) {
      throw new ConflictException('Category already exists');
    }

    return this.prisma.diseaseCategory.create({
      data: {
        name: dto.name.trim(),
        description: dto.description,
      },
    });
  }

  async findAll(activeOnly = true) {
    return this.prisma.diseaseCategory.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { herbs: true } },
      },
    });
  }

  async update(id: string, dto: UpdateDiseaseCategoryDto) {
    const cat = await this.prisma.diseaseCategory.findUnique({ where: { id } });
    if (!cat) throw new NotFoundException('Category not found');

    return this.prisma.diseaseCategory.update({
      where: { id },
      data: {
        name: dto.name?.trim(),
        description: dto.description,
        isActive: dto.isActive,
      },
    });
  }

  async deactivate(id: string) {
    const cat = await this.prisma.diseaseCategory.findUnique({ where: { id } });
    if (!cat) throw new NotFoundException('Category not found');

    return this.prisma.diseaseCategory.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
