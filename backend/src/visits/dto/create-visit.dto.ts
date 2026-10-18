import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsUUID,
} from 'class-validator';

export class CreateVisitDto {
  @IsUUID()
  @IsNotEmpty()
  patientId!: string;

  @IsOptional()
  @IsDateString()
  visitDate?: string;

  @IsOptional()
  @IsString()
  complaint?: string;

  @IsOptional()
  @IsString()
  history?: string;

  @IsOptional()
  @IsString()
  treatmentAdvice?: string;

  @IsOptional()
  @IsDateString()
  followUpDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}