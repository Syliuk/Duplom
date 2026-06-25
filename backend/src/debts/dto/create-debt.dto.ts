import { IsString, IsNumber, IsEnum, IsDateString, IsOptional } from 'class-validator';

export class CreateDebtDto {
  @IsString()
    title!: string;

  @IsNumber()
    amount!: number;

  @IsEnum(['borrow', 'lend'])
    type!: 'borrow' | 'lend';

  @IsString()
    person!: string;

  @IsDateString()
    dueDate!: string;

  @IsOptional()
  @IsString()
  note?: string;
}