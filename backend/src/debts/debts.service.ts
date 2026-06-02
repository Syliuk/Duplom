import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Debt } from './debt.entity';
import { CreateDebtDto } from './dto/create-debt.dto';

@Injectable()
export class DebtsService {
  constructor(
    @InjectRepository(Debt)
    private debtsRepository: Repository<Debt>,
  ) {}

  async create(userId: number, dto: CreateDebtDto) {
    const debt = this.debtsRepository.create({
      ...dto,
      userId,
      currentAmount: 0,
    });
    return this.debtsRepository.save(debt);
  }

  async findAll(userId: number) {
    return this.debtsRepository.find({
      where: { userId },
      order: { dueDate: 'ASC' },
    });
  }

  async addPayment(id: number, userId: number, amount: number) {
    const debt = await this.debtsRepository.findOne({
      where: { id, userId },
    });

    if (!debt) {
      throw new NotFoundException('Борг не знайдено');
    }

    debt.currentAmount = Math.min(
      Number(debt.amount),
      Number(debt.currentAmount) + Number(amount),
    );

    return this.debtsRepository.save(debt);
  }

  async remove(id: number, userId: number) {
    await this.debtsRepository.delete({ id, userId });
    return { message: 'Борг видалено' };
  }
}