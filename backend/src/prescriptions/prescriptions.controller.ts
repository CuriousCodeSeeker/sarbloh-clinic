import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PrescriptionsService } from './prescriptions.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/v1/prescriptions')
@UseGuards(JwtAuthGuard)
export class PrescriptionsController {
  constructor(private readonly prescriptionsService: PrescriptionsService) {}

  @Post()
  async create(@Body() dto: CreatePrescriptionDto, @Request() req: any) {
    const prescription = await this.prescriptionsService.create(
      dto,
      req.user?.id,
    );
    return { success: true, data: prescription };
  }

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('patientId') patientId?: string,
  ) {
    const result = await this.prescriptionsService.findAll({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      patientId,
    });
    return { success: true, ...result };
  }

  @Get('patient/:patientId')
  async findByPatient(@Param('patientId') patientId: string) {
    const prescriptions =
      await this.prescriptionsService.findByPatient(patientId);
    return { success: true, data: prescriptions };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const prescription = await this.prescriptionsService.findOne(id);
    return { success: true, data: prescription };
  }
}
