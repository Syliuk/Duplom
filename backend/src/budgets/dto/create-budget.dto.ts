import { IsString, IsNumber, IsEnum, IsOptional } from 'class-validator';

export class CreateBudgetDto {
  @IsString()
    category!: string;

  @IsNumber()
    amount!: number;

  @IsEnum(['monthly', 'yearly'])
  @IsOptional()
  period?: 'monthly' | 'yearly';
}