import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateMedicineDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  reorderLevel?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  purchasePrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  sellingPrice?: number;
}