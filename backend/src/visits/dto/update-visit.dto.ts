import { IsString, IsOptional, IsDateString } from 'class-validator';

export class UpdateVisitDto {
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