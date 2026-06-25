import { IsString, IsNumber, IsDateString, IsOptional } from 'class-validator';

export class CreateGoalDto {
  @IsString()
    title!: string;

  @IsNumber()
    targetAmount!: number;

  @IsDateString()
    deadline!: string;

  @IsString()
  @IsOptional()
  category?: string;
}