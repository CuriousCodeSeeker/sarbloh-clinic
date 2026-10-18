import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsDateString,
  IsArray,
  ValidateNested,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PrescriptionItemDto {
  @IsOptional()
  @IsUUID()
  medicineId?: string;

  @IsOptional()
  @IsString()
  medicineName?: string;

  @IsOptional()
  @IsString()
  dosage?: string;

  @IsOptional()
  @IsString()
  frequency?: string;

  @IsOptional()
  @IsString()
  duration?: string;

  @IsOptional()
  @IsNumber()
  quantity?: number;

  @IsOptional()
  @IsString()
  route?: string;

  @IsOptional()
  @IsString()
  instructions?: string;

  @IsOptional()
  @IsString()
  beforeAfterFood?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreatePrescriptionDto {
  @IsUUID()
  @IsNotEmpty()
  patientId!: string;

  @IsOptional()
  @IsUUID()
  visitId?: string;

  @IsOptional()
  @IsDateString()
  prescriptionDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsDateString()
  followUpDate?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PrescriptionItemDto)
  items!: PrescriptionItemDto[];
}