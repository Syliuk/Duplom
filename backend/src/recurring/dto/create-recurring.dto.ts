import { IsString, IsNumber, IsEnum, IsDateString, IsOptional, IsBoolean } from 'class-validator';

export class CreateRecurringDto {
  @IsString()
    title!: string;

  @IsNumber()
    amount!: number;

  @IsEnum(['income', 'expense'])
    type!: 'income' | 'expense';

  @IsString()
    category!: string;

  @IsEnum(['monthly', 'weekly', 'yearly'])
    frequency!: 'monthly' | 'weekly' | 'yearly';

  @IsDateString()
    startDate!: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}