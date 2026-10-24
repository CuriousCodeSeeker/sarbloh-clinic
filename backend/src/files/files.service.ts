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

  private assertAllowed(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    if (!ALLOWED_MIME.includes(file.mimetype)) {
      throw new BadRequestException('Only PDF, JPEG and PNG are allowed');
    }
  }

  private async createAttachment(
    entityType: AttachmentEntityType,
    entityId: string,
    file: Express.Multer.File,
    userId?: string,
  ) {
    this.assertAllowed(file);

    return this.prisma.attachment.create({
      data: {
        entityType,
        entityId,
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

  // ---- Patient reports ----

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

    return this.createAttachment(
      AttachmentEntityType.PATIENT,
      patientId,
      file,
      userId,
    );
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

  async deletePatientReport(id: string) {
    return this.deleteById(id, AttachmentEntityType.PATIENT);
  }

  // ---- Herb files ----

  async uploadHerbFile(
    herbId: string,
    file: Express.Multer.File,
    userId?: string,
  ) {
    const herb = await this.prisma.herb.findFirst({
      where: { id: herbId, isActive: true },
    });
    if (!herb) {
      throw new NotFoundException('Herb not found');
    }

    return this.createAttachment(
      AttachmentEntityType.HERB,
      herbId,
      file,
      userId,
    );
  }

  async listHerbFiles(herbId: string) {
    return this.prisma.attachment.findMany({
      where: {
        entityType: AttachmentEntityType.HERB,
        entityId: herbId,
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

  async deleteHerbFile(id: string) {
    return this.deleteById(id, AttachmentEntityType.HERB);
  }

  // ---- Shared ----

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

  private async deleteById(id: string, expectedType: AttachmentEntityType) {
    const attachment = await this.prisma.attachment.findUnique({
      where: { id },
    });
    if (!attachment) {
      throw new NotFoundException('File not found');
    }

    if (attachment.entityType !== expectedType) {
      throw new BadRequestException('Invalid attachment type');
    }

    try {
      if (fs.existsSync(attachment.storagePath)) {
        fs.unlinkSync(attachment.storagePath);
      }
    } catch {
      // ignore disk errors
    }

    await this.prisma.attachment.delete({ where: { id } });
    return { message: 'File deleted' };
  }
}