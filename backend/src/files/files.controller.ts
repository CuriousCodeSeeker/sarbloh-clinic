import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Request,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Response } from 'express';
import { FilesService } from './files.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { randomUUID } from 'crypto';

const fileFilter = (_req: any, file: Express.Multer.File, cb: any) => {
  const allowed = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/jpg',
  ];
  if (!allowed.includes(file.mimetype)) {
    return cb(
      new BadRequestException('Only PDF, JPEG and PNG allowed') as any,
      false,
    );
  }
  cb(null, true);
};

@Controller('api/v1/files')
@UseGuards(JwtAuthGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  // ---- Patients ----

  @Post('patients/:patientId/reports')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/patients',
        filename: (_req, file, cb) => {
          cb(null, `${randomUUID()}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter,
    }),
  )
  async uploadPatientReport(
    @Param('patientId') patientId: string,
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
  ) {
    const data = await this.filesService.uploadPatientReport(
      patientId,
      file,
      req.user?.id,
    );
    return { success: true, data };
  }

  @Get('patients/:patientId/reports')
  async listPatientReports(@Param('patientId') patientId: string) {
    const data = await this.filesService.listPatientReports(patientId);
    return { success: true, data };
  }

  // ---- Herbs ----

  @Post('herbs/:herbId/files')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/herbs',
        filename: (_req, file, cb) => {
          cb(null, `${randomUUID()}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter,
    }),
  )
  async uploadHerbFile(
    @Param('herbId') herbId: string,
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
  ) {
    const data = await this.filesService.uploadHerbFile(
      herbId,
      file,
      req.user?.id,
    );
    return { success: true, data };
  }

  @Get('herbs/:herbId/files')
  async listHerbFiles(@Param('herbId') herbId: string) {
    const data = await this.filesService.listHerbFiles(herbId);
    return { success: true, data };
  }

  // ---- Shared download / delete ----

  @Get(':id/download')
  async download(@Param('id') id: string, @Res() res: Response) {
    const { attachment, fullPath } = await this.filesService.getFile(id);
    const contentType =
      (attachment as any).mimeType || (attachment as any).fileType;
    const downloadName =
      (attachment as any).originalName || (attachment as any).fileName;

    res.setHeader('Content-Type', contentType);
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${downloadName}"`,
    );
    return res.sendFile(fullPath);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    // Works for both patient reports and herb files
    try {
      const data = await this.filesService.deleteHerbFile(id);
      return { success: true, data };
    } catch {
      const data = await this.filesService.deletePatientReport(id);
      return { success: true, data };
    }
  }
}