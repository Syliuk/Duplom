import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecurringTransaction } from './recurring.entity';
import { CreateRecurringDto } from './dto/create-recurring.dto';
import { MAX_PLANNING_DATE, MIN_HISTORICAL_DATE, assertDateInRange } from '../common/date-limits';
import { Transaction } from '../transactions/transaction.entity';

@Injectable()
export class RecurringService {
  constructor(
    @InjectRepository(RecurringTransaction)
    private recurringRepository: Repository<RecurringTransaction>,
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
  ) {}

  async create(userId: number, dto: CreateRecurringDto) {
    assertDateInRange(dto.startDate, MIN_HISTORICAL_DATE, MAX_PLANNING_DATE, 'Recurring start date');
    if (Number(dto.amount) <= 0) {
      throw new BadRequestException('Recurring amount must be greater than zero');
    }

    const recurring = this.recurringRepository.create({
      ...dto,
      userId,
      nextDate: dto.startDate,
      isActive: dto.isActive ?? true,
    });
    const saved = await this.recurringRepository.save(recurring);

    await this.transactionsRepository.save(
      this.transactionsRepository.create({
        userId,
        title: `Регулярний платіж: ${saved.title}`,
        amount: Number(saved.amount),
        type: saved.type,
        category: saved.category,
        date: saved.startDate,
        note: saved.frequency,
      }),
    );

    return saved;
  }

  async findAll(userId: number) {
    return this.recurringRepository.find({
      where: { userId },
      order: { nextDate: 'ASC' },
    });
  }

  async update(id: number, userId: number, dto: Partial<CreateRecurringDto>) {
    const item = await this.findOne(id, userId);
    if (dto.startDate) {
      assertDateInRange(dto.startDate, MIN_HISTORICAL_DATE, MAX_PLANNING_DATE, 'Recurring start date');
    }
    if (dto.amount !== undefined && Number(dto.amount) <= 0) {
      throw new BadRequestException('Recurring amount must be greater than zero');
    }

    await this.recurringRepository.update(
      { id, userId },
      {
        ...dto,
        nextDate: dto.startDate ?? item.nextDate,
      },
    );

    return this.findOne(id, userId);
  }

  async toggleActive(id: number, userId: number) {
    const item = await this.findOne(id, userId);
    item.isActive = !item.isActive;
    return this.recurringRepository.save(item);
  }

  async remove(id: number, userId: number) {
    await this.findOne(id, userId);
    await this.recurringRepository.delete({ id, userId });
    return { message: 'Recurring payment deleted' };
  }

  private async findOne(id: number, userId: number) {
    const item = await this.recurringRepository.findOne({ where: { id, userId } });
    if (!item) throw new NotFoundException('Recurring payment not found');
    return item;
  }
}
