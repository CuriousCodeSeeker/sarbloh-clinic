import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/v1/users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  private assertAdmin(req: any) {
    if (req.user?.role !== 'ADMIN') {
      throw new ForbiddenException('Admin access required');
    }
  }

  @Get()
  async findAll(@Request() req: any) {
    this.assertAdmin(req);
    const data = await this.usersService.findAll();
    return { success: true, data };
  }

  @Post()
  async create(@Body() dto: CreateUserDto, @Request() req: any) {
    this.assertAdmin(req);
    const data = await this.usersService.create(dto);
    return { success: true, data };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @Request() req: any,
  ) {
    this.assertAdmin(req);
    const data = await this.usersService.update(id, dto);
    return { success: true, data };
  }

  @Delete(':id')
  async deactivate(@Param('id') id: string, @Request() req: any) {
    this.assertAdmin(req);
    const data = await this.usersService.deactivate(id, req.user.id);
    return { success: true, data };
  }
}
