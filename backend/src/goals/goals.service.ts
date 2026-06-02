import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Goal } from './goal.entity';
import { CreateGoalDto } from './dto/create-goal.dto';

@Injectable()
export class GoalsService {
  constructor(
    @InjectRepository(Goal)
    private goalsRepository: Repository<Goal>,
  ) {}

  async create(userId: number, dto: CreateGoalDto) {
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

  async addContribution(id: number, userId: number, amount: number) {
    const goal = await this.goalsRepository.findOne({
      where: { id, userId },
    });

    if (!goal) {
      throw new NotFoundException('Ціль не знайдено');
    }

    goal.currentAmount =
      Number(goal.currentAmount) + Number(amount);

    return this.goalsRepository.save(goal);
  }
  
  async remove(id: number, userId: number) {
    await this.goalsRepository.delete({ id, userId });
    return { message: 'Ціль видалено' };
  }
}