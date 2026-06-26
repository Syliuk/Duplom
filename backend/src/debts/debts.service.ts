import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Debt } from './debt.entity';
import { CreateDebtDto } from './dto/create-debt.dto';
import { MAX_PLANNING_DATE, assertDateInRange, getTodayDateValue } from '../common/date-limits';
import { Transaction } from '../transactions/transaction.entity';

@Injectable()
export class DebtsService {
  constructor(
    @InjectRepository(Debt)
    private debtsRepository: Repository<Debt>,
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
  ) {}

  async create(userId: number, dto: CreateDebtDto) {
    assertDateInRange(dto.dueDate, getTodayDateValue(), MAX_PLANNING_DATE, 'Debt due date');
    if (Number(dto.amount) <= 0) {
      throw new BadRequestException('Debt amount must be greater than zero');
    }

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

  async update(id: number, userId: number, dto: Partial<CreateDebtDto>) {
    const debt = await this.findOne(id, userId);
    if (dto.dueDate) {
      assertDateInRange(dto.dueDate, getTodayDateValue(), MAX_PLANNING_DATE, 'Debt due date');
    }
    if (dto.amount !== undefined && Number(dto.amount) <= 0) {
      throw new BadRequestException('Debt amount must be greater than zero');
    }
    if (dto.amount !== undefined && Number(dto.amount) < Number(debt.currentAmount)) {
      throw new BadRequestException('Debt amount cannot be lower than already paid amount');
    }

    await this.debtsRepository.update({ id, userId }, dto);
    return this.findOne(id, userId);
  }

  async addPayment(id: number, userId: number, amount: number) {
    const debt = await this.findOne(id, userId);
    const paymentAmount = Number(amount);
    const remaining = Number(debt.amount) - Number(debt.currentAmount);

    if (paymentAmount <= 0) {
      throw new BadRequestException('Payment amount must be greater than zero');
    }
    if (paymentAmount > remaining) {
      throw new BadRequestException('Payment amount cannot exceed remaining debt amount');
    }

    debt.currentAmount = Number(debt.currentAmount) + paymentAmount;
    const savedDebt = await this.debtsRepository.save(debt);

    await this.transactionsRepository.save(
      this.transactionsRepository.create({
        userId,
        title: `Платіж по боргу: ${debt.title}`,
        amount: paymentAmount,
        type: debt.type === 'borrow' ? 'expense' : 'income',
        category: 'Debt',
        date: getTodayDateValue(),
        note: debt.person,
      }),
    );

    return savedDebt;
  }

  async remove(id: number, userId: number) {
    await this.findOne(id, userId);
    await this.debtsRepository.delete({ id, userId });
    return { message: 'Debt deleted' };
  }

  private async findOne(id: number, userId: number) {
    const debt = await this.debtsRepository.findOne({ where: { id, userId } });
    if (!debt) throw new NotFoundException('Debt not found');
    return debt;
  }
}
