import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/v1/settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  async getAll() {
    const data = await this.settingsService.getAll();
    return { success: true, data };
  }

  @Put()
  async update(@Body() body: Record<string, string>) {
    const data = await this.settingsService.update(body);
    return { success: true, data };
  }
}
