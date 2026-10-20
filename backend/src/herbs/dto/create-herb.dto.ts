import {
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

export class HerbNameDto {
  @IsString()
  @IsNotEmpty()
  languageCode!: string; // en, hi, pa, etc.

  @IsString()
  @IsNotEmpty()
  name!: string;
}

export class CreateHerbDto {
  @IsOptional()
  @IsString()
  botanicalName?: string;

  @IsOptional()
  @IsString()
  commonName?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  benefits?: string;

  @IsOptional()
  @IsString()
  uses?: string;

  @IsOptional()
  @IsString()
  partsUsed?: string;

  @IsOptional()
  @IsString()
  preparation?: string;

  @IsOptional()
  @IsString()
  dosage?: string;

  @IsOptional()
  @IsString()
  contraindications?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HerbNameDto)
  names?: HerbNameDto[];
}
