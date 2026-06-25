import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { MIN_TRANSACTION_DATE, assertDateInRange, getTodayDateValue } from '../common/date-limits';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
  ) {}

  async create(userId: number, dto: CreateTransactionDto) {
    assertDateInRange(dto.date, MIN_TRANSACTION_DATE, getTodayDateValue(), 'Transaction date');
    if (Number(dto.amount) <= 0) {
      throw new BadRequestException('Transaction amount must be greater than zero');
    }

    const transaction = this.transactionsRepository.create({
      ...dto,
      userId,
    });
    return this.transactionsRepository.save(transaction);
  }

  async findAll(userId: number) {
    return this.transactionsRepository.find({
      where: { userId },
      order: { date: 'DESC',
             id: 'DESC',
             },
    });
  }

  async findOne(id: number, userId: number) {
    const transaction = await this.transactionsRepository.findOne({
      where: { id, userId },
    });
    if (!transaction) throw new NotFoundException('Транзакцію не знайдено');
    return transaction;
  }

  async update(id: number, userId: number, dto: Partial<CreateTransactionDto>) {
    await this.findOne(id, userId); // перевірка існування
    if (dto.date) {
      assertDateInRange(dto.date, MIN_TRANSACTION_DATE, getTodayDateValue(), 'Transaction date');
    }
    if (dto.amount !== undefined && Number(dto.amount) <= 0) {
      throw new BadRequestException('Transaction amount must be greater than zero');
    }

    await this.transactionsRepository.update({ id, userId }, dto);
    return this.findOne(id, userId);
  }

  async remove(id: number, userId: number) {
    await this.findOne(id, userId);
    await this.transactionsRepository.delete({ id, userId });
    return { message: 'Транзакцію видалено' };
  }

  async removeAll(userId: number) {
    await this.transactionsRepository.delete({ userId });
    return { message: 'Транзакції видалено' };
  }
}
