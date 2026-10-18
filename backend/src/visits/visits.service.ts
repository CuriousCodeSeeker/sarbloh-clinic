import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVisitDto } from './dto/create-visit.dto';
import { UpdateVisitDto } from './dto/update-visit.dto';

@Injectable()
export class VisitsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateVisitDto, practitionerId?: string) {
    // Ensure patient exists
    const patient = await this.prisma.patient.findFirst({
      where: { id: dto.patientId, deletedAt: null, isActive: true },
    });
    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    return this.prisma.visit.create({
      data: {
        patientId: dto.patientId,
        practitionerId: practitionerId || null,
        visitDate: dto.visitDate ? new Date(dto.visitDate) : new Date(),
        complaint: dto.complaint,
        history: dto.history,
        treatmentAdvice: dto.treatmentAdvice,
        followUpDate: dto.followUpDate ? new Date(dto.followUpDate) : null,
        notes: dto.notes,
      },
      include: {
        patient: {
          select: {
            id: true,
            patientCode: true,
            fullName: true,
          },
        },
        practitioner: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });
  }

  async findByPatient(patientId: string) {
    return this.prisma.visit.findMany({
      where: { patientId },
      orderBy: { visitDate: 'desc' },
      include: {
        practitioner: {
          select: { id: true, fullName: true },
        },
      },
    });
  }

  async findOne(id: string) {
    const visit = await this.prisma.visit.findUnique({
      where: { id },
      include: {
        patient: {
          select: {
            id: true,
            patientCode: true,
            fullName: true,
            gender: true,
            ageAtRegistration: true,
          },
        },
        practitioner: {
          select: { id: true, fullName: true },
        },
      },
    });

    if (!visit) {
      throw new NotFoundException('Visit not found');
    }

    return visit;
  }

  async update(id: string, dto: UpdateVisitDto) {
    await this.findOne(id);

    return this.prisma.visit.update({
      where: { id },
      data: {
        visitDate: dto.visitDate ? new Date(dto.visitDate) : undefined,
        complaint: dto.complaint,
        history: dto.history,
        treatmentAdvice: dto.treatmentAdvice,
        followUpDate: dto.followUpDate ? new Date(dto.followUpDate) : undefined,
        notes: dto.notes,
      },
      include: {
        patient: {
          select: { id: true, patientCode: true, fullName: true },
        },
        practitioner: {
          select: { id: true, fullName: true },
        },
      },
    });
  }

  async findAll(params: { page?: number; limit?: number; patientId?: string }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.patientId) {
      where.patientId = params.patientId;
    }

    const [data, total] = await Promise.all([
      this.prisma.visit.findMany({
        where,
        skip,
        take: limit,
        orderBy: { visitDate: 'desc' },
        include: {
          patient: {
            select: { id: true, patientCode: true, fullName: true },
          },
          practitioner: {
            select: { id: true, fullName: true },
          },
        },
      }),
      this.prisma.visit.count({ where }),
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
