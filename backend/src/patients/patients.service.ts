import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class PatientsService {
  constructor(private prisma: PrismaService) {}

  private async generatePatientCode(): Promise<string> {
    const count = await this.prisma.patient.count();
    const nextNumber = count + 1;
    return `P-${String(nextNumber).padStart(6, '0')}`;
  }

  async create(dto: CreatePatientDto) {
    const patientCode = await this.generatePatientCode();

    return this.prisma.patient.create({
      data: {
        patientCode,
        fullName: dto.fullName,
        fatherHusbandName: dto.fatherHusbandName,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
        ageAtRegistration: dto.ageAtRegistration,
        gender: dto.gender,
        maritalStatus: dto.maritalStatus,
        referredBy: dto.referredBy,
        notes: dto.notes,
        contacts: dto.contacts
          ? {
              create: dto.contacts.map((c) => ({
                type: c.type,
                value: c.value,
                isPrimary: c.isPrimary ?? false,
              })),
            }
          : undefined,
        addresses: dto.address
          ? {
              create: {
                addressLine: dto.address.addressLine,
                city: dto.address.city,
                state: dto.address.state,
                country: dto.address.country || 'India',
                pincode: dto.address.pincode,
                isPrimary: true,
              },
            }
          : undefined,
      },
      include: {
        contacts: true,
        addresses: true,
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

    const where: Prisma.PatientWhereInput = {
      deletedAt: null,
      isActive: true,
    };

    if (params.search) {
      const term = params.search.trim();
      where.OR = [
        { fullName: { contains: term, mode: 'insensitive' } },
        { patientCode: { contains: term, mode: 'insensitive' } },
        { fatherHusbandName: { contains: term, mode: 'insensitive' } },
        { contacts: { some: { value: { contains: term, mode: 'insensitive' } } } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.patient.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          contacts: true,
          addresses: true,
        },
      }),
      this.prisma.patient.count({ where }),
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
    const patient = await this.prisma.patient.findFirst({
      where: { id, deletedAt: null },
      include: {
        contacts: true,
        addresses: true,
        visits: {
          orderBy: { visitDate: 'desc' },
          take: 10,
        },
      },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    return patient;
  }

  async update(id: string, dto: UpdatePatientDto) {
    await this.findOne(id);

    return this.prisma.patient.update({
      where: { id },
      data: {
        fullName: dto.fullName,
        fatherHusbandName: dto.fatherHusbandName,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
        ageAtRegistration: dto.ageAtRegistration,
        gender: dto.gender,
        maritalStatus: dto.maritalStatus,
        referredBy: dto.referredBy,
        notes: dto.notes,
      },
      include: {
        contacts: true,
        addresses: true,
      },
    });
  }

  async softDelete(id: string) {
    await this.findOne(id);

    return this.prisma.patient.update({
      where: { id },
      data: {
        isActive: false,
        deletedAt: new Date(),
      },
    });
  }
}
