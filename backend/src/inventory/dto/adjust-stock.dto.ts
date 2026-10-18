import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsNumber,
  IsEnum,
  Min,
} from 'class-validator';
import { InventoryTransactionType } from '@prisma/client';

export class AdjustStockDto {
  @IsUUID()
  @IsNotEmpty()
  medicineId!: string;

  @IsEnum(InventoryTransactionType)
  transactionType!: InventoryTransactionType;

  @IsNumber()
  @Min(0.01)
  quantity!: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
