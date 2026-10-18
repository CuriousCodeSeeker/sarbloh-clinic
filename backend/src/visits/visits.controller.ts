import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { VisitsService } from './visits.service';
import { CreateVisitDto } from './dto/create-visit.dto';
import { UpdateVisitDto } from './dto/update-visit.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/v1/visits')
@UseGuards(JwtAuthGuard)
export class VisitsController {
  constructor(private readonly visitsService: VisitsService) {}

  @Post()
  async create(@Body() dto: CreateVisitDto, @Request() req: any) {
    const visit = await this.visitsService.create(dto, req.user?.id);
    return { success: true, data: visit };
  }

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('patientId') patientId?: string,
  ) {
    const result = await this.visitsService.findAll({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      patientId,
    });
    return { success: true, ...result };
  }

  @Get('patient/:patientId')
  async findByPatient(@Param('patientId') patientId: string) {
    const visits = await this.visitsService.findByPatient(patientId);
    return { success: true, data: visits };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const visit = await this.visitsService.findOne(id);
    return { success: true, data: visit };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateVisitDto) {
    const visit = await this.visitsService.update(id, dto);
    return { success: true, data: visit };
  }
}
