import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AttachmentEntityType } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const ALLOWED_MIME = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/jpg',
];

@Injectable()
export class FilesService {
  constructor(private prisma: PrismaService) {}

  async uploadPatientReport(
    patientId: string,
    file: Express.Multer.File,
    userId?: string,
  ) {
    const patient = await this.prisma.patient.findFirst({
      where: { id: patientId, deletedAt: null },
    });
    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (!ALLOWED_MIME.includes(file.mimetype)) {
      throw new BadRequestException('Only PDF, JPEG and PNG are allowed');
    }

    return this.prisma.attachment.create({
      data: {
        entityType: AttachmentEntityType.PATIENT,
        entityId: patientId,
        fileName: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        fileType: file.mimetype,
        fileSize: file.size,
        storagePath: file.path,
        uploadedById: userId || null,
      },
    });
  }

  async listPatientReports(patientId: string) {
    return this.prisma.attachment.findMany({
      where: {
        entityType: AttachmentEntityType.PATIENT,
        entityId: patientId,
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        fileName: true,
        originalName: true,
        mimeType: true,
        fileType: true,
        fileSize: true,
        createdAt: true,
      },
    });
  }

  async getFile(id: string) {
    const attachment = await this.prisma.attachment.findUnique({
      where: { id },
    });
    if (!attachment) {
      throw new NotFoundException('File not found');
    }

    const fullPath = path.resolve(attachment.storagePath);
    if (!fs.existsSync(fullPath)) {
      throw new NotFoundException('File missing on disk');
    }

    return { attachment, fullPath };
  }

  async deletePatientReport(id: string) {
    const attachment = await this.prisma.attachment.findUnique({
      where: { id },
    });
    if (!attachment) {
      throw new NotFoundException('File not found');
    }

    if (attachment.entityType !== AttachmentEntityType.PATIENT) {
      throw new BadRequestException('Not a patient report');
    }

    try {
      if (fs.existsSync(attachment.storagePath)) {
        fs.unlinkSync(attachment.storagePath);
      }
    } catch {
      // ignore disk errors; still remove DB record
    }

    await this.prisma.attachment.delete({ where: { id } });
    return { message: 'File deleted' };
  }
}