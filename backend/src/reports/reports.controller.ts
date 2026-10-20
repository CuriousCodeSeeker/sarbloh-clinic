import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/v1/reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('summary')
  async getSummary(
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const data = await this.reportsService.getSummary(from, to);
    return { success: true, data };
  }

  @Get('sales')
  async getSalesReport(
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const data = await this.reportsService.getSalesReport(from, to);
    return { success: true, data };
  }

  @Get('low-stock')
  async getLowStock() {
    const data = await this.reportsService.getLowStockReport();
    return { success: true, data };
  }

  @Get('visits')
  async getVisitsReport(
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const data = await this.reportsService.getVisitsReport(from, to);
    return { success: true, data };
  }
}
