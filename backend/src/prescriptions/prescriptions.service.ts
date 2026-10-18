import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';

@Injectable()
export class PrescriptionsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePrescriptionDto, practitionerId?: string) {
    const patient = await this.prisma.patient.findFirst({
      where: { id: dto.patientId, deletedAt: null, isActive: true },
    });
    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('At least one prescription item is required');
    }

    // Validate items have either medicineId or medicineName
    for (const item of dto.items) {
      if (!item.medicineId && !item.medicineName?.trim()) {
        throw new BadRequestException('Each item must have a medicine name');
      }
    }

    return this.prisma.prescription.create({
      data: {
        patientId: dto.patientId,
        visitId: dto.visitId || null,
        practitionerId: practitionerId || null,
        prescriptionDate: dto.prescriptionDate
          ? new Date(dto.prescriptionDate)
          : new Date(),
        notes: dto.notes,
        followUpDate: dto.followUpDate ? new Date(dto.followUpDate) : null,
        items: {
          create: dto.items.map((item) => ({
            medicineId: item.medicineId || null,
            medicineName: item.medicineName?.trim() || null,
            dosage: item.dosage,
            frequency: item.frequency,
            duration: item.duration,
            quantity: item.quantity ?? null,
            route: item.route,
            instructions: item.instructions,
            beforeAfterFood: item.beforeAfterFood,
            notes: item.notes,
          })),
        },
      },
      include: {
        patient: {
          select: { id: true, patientCode: true, fullName: true },
        },
        practitioner: {
          select: { id: true, fullName: true },
        },
        items: true,
      },
    });
  }

  async findByPatient(patientId: string) {
    return this.prisma.prescription.findMany({
      where: { patientId },
      orderBy: { prescriptionDate: 'desc' },
      include: {
        items: true,
        practitioner: {
          select: { id: true, fullName: true },
        },
      },
    });
  }

  async findOne(id: string) {
    const prescription = await this.prisma.prescription.findUnique({
      where: { id },
      include: {
        patient: {
          select: {
            id: true,
            patientCode: true,
            fullName: true,
            ageAtRegistration: true,
            gender: true,
          },
        },
        practitioner: {
          select: { id: true, fullName: true },
        },
        items: true,
        visit: {
          select: { id: true, visitDate: true, complaint: true },
        },
      },
    });

    if (!prescription) {
      throw new NotFoundException('Prescription not found');
    }

    return prescription;
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
      this.prisma.prescription.findMany({
        where,
        skip,
        take: limit,
        orderBy: { prescriptionDate: 'desc' },
        include: {
          patient: {
            select: { id: true, patientCode: true, fullName: true },
          },
          practitioner: {
            select: { id: true, fullName: true },
          },
          items: true,
        },
      }),
      this.prisma.prescription.count({ where }),
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
