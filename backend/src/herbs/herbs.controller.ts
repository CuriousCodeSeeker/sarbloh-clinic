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
import { HerbsService } from './herbs.service';
import { CreateHerbDto } from './dto/create-herb.dto';
import { UpdateHerbDto } from './dto/update-herb.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/v1/herbs')
@UseGuards(JwtAuthGuard)
export class HerbsController {
  constructor(private readonly herbsService: HerbsService) {}

  @Post()
  async create(@Body() dto: CreateHerbDto) {
    const herb = await this.herbsService.create(dto);
    return { success: true, data: herb };
  }

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const result = await this.herbsService.findAll({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      search,
    });
    return { success: true, ...result };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const herb = await this.herbsService.findOne(id);
    return { success: true, data: herb };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateHerbDto) {
    const herb = await this.herbsService.update(id, dto);
    return { success: true, data: herb };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.herbsService.softDelete(id);
    return { success: true, data: { message: 'Herb deactivated' } };
  }
}
