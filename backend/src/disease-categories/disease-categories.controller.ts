import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DiseaseCategoriesService } from './disease-categories.service';
import { CreateDiseaseCategoryDto } from './dto/create-disease-category.dto';
import { UpdateDiseaseCategoryDto } from './dto/update-disease-category.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/v1/disease-categories')
@UseGuards(JwtAuthGuard)
export class DiseaseCategoriesController {
  constructor(private readonly service: DiseaseCategoriesService) {}

  @Post()
  async create(@Body() dto: CreateDiseaseCategoryDto) {
    const data = await this.service.create(dto);
    return { success: true, data };
  }

  @Get()
  async findAll(@Query('all') all?: string) {
    const data = await this.service.findAll(all !== 'true');
    return { success: true, data };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateDiseaseCategoryDto) {
    const data = await this.service.update(id, dto);
    return { success: true, data };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const data = await this.service.deactivate(id);
    return { success: true, data };
  }
}
