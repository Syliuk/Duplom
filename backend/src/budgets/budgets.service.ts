import { Injectable, NotFoundException } from '@nestjs/common';
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
    const budget = this.budgetsRepository.create({ ...dto, userId });
    return this.budgetsRepository.save(budget);
  }

  async findAll(userId: number) {
    return this.budgetsRepository.find({ where: { userId } });
  }

  async remove(id: number, userId: number) {
    const budget = await this.budgetsRepository.findOne({ where: { id, userId } });
    if (!budget) throw new NotFoundException('Бюджет не знайдено');
    await this.budgetsRepository.delete(id);
    return { message: 'Бюджет видалено' };
  }
}