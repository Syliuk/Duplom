import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Budget } from './budget.entity';
import { CreateBudgetDto } from './dto/create-budget.dto';

@Injectable()
export class BudgetsService {
  constructor(
    @InjectRepository(Budget)
    private budgetsRepository: Repository<Budget>,
  ) {}

  async create(userId: number, dto: CreateBudgetDto) {
    if (Number(dto.amount) <= 0) {
      throw new BadRequestException('Budget amount must be greater than zero');
    }

    const budget = this.budgetsRepository.create({ ...dto, userId });
    return this.budgetsRepository.save(budget);
  }

  async findAll(userId: number) {
    return this.budgetsRepository.find({ where: { userId } });
  }

  async update(id: number, userId: number, dto: Partial<CreateBudgetDto>) {
    const budget = await this.budgetsRepository.findOne({ where: { id, userId } });
    if (!budget) throw new NotFoundException('Budget not found');

    if (dto.amount !== undefined && Number(dto.amount) <= 0) {
      throw new BadRequestException('Budget amount must be greater than zero');
    }

    await this.budgetsRepository.update({ id, userId }, dto);
    return this.budgetsRepository.findOne({ where: { id, userId } });
  }

  async remove(id: number, userId: number) {
    const budget = await this.budgetsRepository.findOne({ where: { id, userId } });
    if (!budget) throw new NotFoundException('Budget not found');

    await this.budgetsRepository.delete({ id, userId });
    return { message: 'Budget deleted' };
  }
}
