import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MedicinesService } from './medicines.service';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { UpdateMedicineDto } from './dto/update-medicine.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/v1/medicines')
@UseGuards(JwtAuthGuard)
export class MedicinesController {
  constructor(private readonly medicinesService: MedicinesService) {}

  @Post()
  async create(@Body() dto: CreateMedicineDto) {
    const medicine = await this.medicinesService.create(dto);
    return { success: true, data: medicine };
  }

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const result = await this.medicinesService.findAll({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      search,
    });
    return { success: true, ...result };
  }

  @Get('categories')
  async getCategories() {
    const categories = await this.medicinesService.getCategories();
    return { success: true, data: categories };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const medicine = await this.medicinesService.findOne(id);
    return { success: true, data: medicine };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateMedicineDto) {
    const medicine = await this.medicinesService.update(id, dto);
    return { success: true, data: medicine };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.medicinesService.softDelete(id);
    return { success: true, data: { message: 'Medicine deactivated' } };
  }
}