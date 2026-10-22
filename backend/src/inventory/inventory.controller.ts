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
  async getStock(@Query('search') search?: string) {
    const data = await this.inventoryService.getMedicineStockLevels({ search });
    return { success: true, data };
  }

  @Get('herbs/stock')
  async getHerbStock(@Query('search') search?: string) {
    const data = await this.inventoryService.getHerbStockLevels({ search });
    return { success: true, data };
  }

  @Post('adjust')
  async adjust(@Body() dto: AdjustStockDto, @Request() req: any) {
    const data = await this.inventoryService.adjustStock(dto, req.user?.id);
    return { success: true, data };
  }

  @Get('transactions')
  async transactions(
    @Query('medicineId') medicineId?: string,
    @Query('herbId') herbId?: string,
    @Query('limit') limit?: string,
  ) {
    const data = await this.inventoryService.getTransactions({
      medicineId,
      herbId,
      limit: limit ? parseInt(limit, 10) : 50,
    });
    return { success: true, data };
  }
}