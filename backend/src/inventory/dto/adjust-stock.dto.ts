import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateIf,
} from 'class-validator';
import { InventoryTransactionType } from '@prisma/client';

export class AdjustStockDto {
  @ValidateIf((o) => !o.herbId)
  @IsUUID()
  medicineId?: string;

  @ValidateIf((o) => !o.medicineId)
  @IsUUID()
  herbId?: string;

  @IsEnum(InventoryTransactionType)
  transactionType!: InventoryTransactionType;

  @IsNumber()
  @Min(0.01)
  quantity!: number;

  @IsOptional()
  @IsString()
  notes?: string;
}