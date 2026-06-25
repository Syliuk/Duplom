import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Goal } from './goal.entity';
import { CreateGoalDto } from './dto/create-goal.dto';
import { MAX_PLANNING_DATE, assertDateInRange, getTodayDateValue } from '../common/date-limits';
import { Transaction } from '../transactions/transaction.entity';

@Injectable()
export class GoalsService {
  constructor(
    @InjectRepository(Goal)
    private goalsRepository: Repository<Goal>,
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
  ) {}

  async create(userId: number, dto: CreateGoalDto) {
    assertDateInRange(dto.deadline, getTodayDateValue(), MAX_PLANNING_DATE, 'Goal deadline');
    if (Number(dto.targetAmount) <= 0) {
      throw new BadRequestException('Goal amount must be greater than zero');
    }

    const goal = this.goalsRepository.create({
      ...dto,
      userId,
      currentAmount: 0,
    });
    return this.goalsRepository.save(goal);
  }

  async findAll(userId: number) {
    return this.goalsRepository.find({
      where: { userId },
      order: { deadline: 'ASC' },
    });
  }

  async update(id: number, userId: number, dto: Partial<CreateGoalDto>) {
    const goal = await this.findOne(id, userId);
    if (dto.deadline) {
      assertDateInRange(dto.deadline, getTodayDateValue(), MAX_PLANNING_DATE, 'Goal deadline');
    }
    if (dto.targetAmount !== undefined && Number(dto.targetAmount) <= 0) {
      throw new BadRequestException('Goal amount must be greater than zero');
    }
    if (dto.targetAmount !== undefined && Number(dto.targetAmount) < Number(goal.currentAmount)) {
      throw new BadRequestException('Goal amount cannot be lower than collected amount');
    }

    await this.goalsRepository.update({ id, userId }, dto);
    return this.findOne(id, userId);
  }

  async addContribution(id: number, userId: number, amount: number) {
    const goal = await this.findOne(id, userId);
    const contributionAmount = Number(amount);
    const remaining = Number(goal.targetAmount) - Number(goal.currentAmount);

    if (contributionAmount <= 0) {
      throw new BadRequestException('Contribution amount must be greater than zero');
    }
    if (contributionAmount > remaining) {
      throw new BadRequestException('Contribution amount cannot exceed remaining goal amount');
    }

    goal.currentAmount = Number(goal.currentAmount) + contributionAmount;
    const savedGoal = await this.goalsRepository.save(goal);

    await this.transactionsRepository.save(
      this.transactionsRepository.create({
        userId,
        title: `Внесок у ціль: ${goal.title}`,
        amount: contributionAmount,
        type: 'expense',
        category: goal.category || 'Other',
        date: getTodayDateValue(),
      }),
    );

    return savedGoal;
  }
  
  async remove(id: number, userId: number) {
    await this.findOne(id, userId);
    await this.goalsRepository.delete({ id, userId });
    return { message: 'Goal deleted' };
  }

  private async findOne(id: number, userId: number) {
    const goal = await this.goalsRepository.findOne({ where: { id, userId } });
    if (!goal) throw new NotFoundException('Goal not found');
    return goal;
  }
}
