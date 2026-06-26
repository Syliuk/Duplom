import { IsString, IsNumber, IsEnum, IsDateString, IsOptional } from 'class-validator';

export class CreateTransactionDto {
  @IsString()
    title!: string;

  @IsNumber()
    amount!: number;

  @IsEnum(['income', 'expense'])
    type!: 'income' | 'expense';

  @IsString()
    category!: string;

  @IsDateString()
    date!: string;

  @IsOptional()
  @IsString()
  note?: string;
}