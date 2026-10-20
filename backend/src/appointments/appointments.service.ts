import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { AppointmentStatus } from '@prisma/client';

@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateAppointmentDto, practitionerId?: string) {
    const patient = await this.prisma.patient.findFirst({
      where: { id: dto.patientId, deletedAt: null, isActive: true },
    });
    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    return this.prisma.appointment.create({
      data: {
        patientId: dto.patientId,
        practitionerId: practitionerId || null,
        appointmentDate: new Date(dto.appointmentDate),
        startTime: dto.startTime,
        endTime: dto.endTime,
        notes: dto.notes,
        status: dto.status || AppointmentStatus.SCHEDULED,
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

  async findAll(params: {
    page?: number;
    limit?: number;
    date?: string;
    status?: string;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params.date) {
      const start = new Date(params.date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(params.date);
      end.setHours(23, 59, 59, 999);
      where.appointmentDate = { gte: start, lte: end };
    }

    if (params.status) {
      where.status = params.status;
    }

    const [data, total] = await Promise.all([
      this.prisma.appointment.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ appointmentDate: 'asc' }, { startTime: 'asc' }],
        include: {
          patient: {
            select: { id: true, patientCode: true, fullName: true },
          },
          practitioner: {
            select: { id: true, fullName: true },
          },
        },
      }),
      this.prisma.appointment.count({ where }),
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
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: {
          select: {
            id: true,
            patientCode: true,
            fullName: true,
            contacts: true,
          },
        },
        practitioner: {
          select: { id: true, fullName: true },
        },
      },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    return appointment;
  }

  async update(id: string, dto: UpdateAppointmentDto) {
    await this.findOne(id);

    return this.prisma.appointment.update({
      where: { id },
      data: {
        appointmentDate: dto.appointmentDate
          ? new Date(dto.appointmentDate)
          : undefined,
        startTime: dto.startTime,
        endTime: dto.endTime,
        notes: dto.notes,
        status: dto.status,
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
}
