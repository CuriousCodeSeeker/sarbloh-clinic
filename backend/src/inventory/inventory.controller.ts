import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/v1/inventory')
@UseGuards(JwtAuthGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('stock')
  async getStockLevels(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const result = await this.inventoryService.getStockLevels({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      search,
    });
    return { success: true, ...result };
  }

  @Post('adjust')
  async adjustStock(@Body() dto: AdjustStockDto, @Request() req: any) {
    const tx = await this.inventoryService.adjustStock(dto, req.user?.id);
    return { success: true, data: tx };
  }

  @Get('transactions')
  async getTransactions(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('medicineId') medicineId?: string,
  ) {
    const result = await this.inventoryService.getTransactions({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 30,
      medicineId,
    });
    return { success: true, ...result };
  }
}