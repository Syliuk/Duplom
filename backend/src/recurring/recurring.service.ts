import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecurringTransaction } from './recurring.entity';
import { CreateRecurringDto } from './dto/create-recurring.dto';

@Injectable()
export class RecurringService {
  constructor(
    @InjectRepository(RecurringTransaction)
    private recurringRepository: Repository<RecurringTransaction>,
  ) {}

  async create(userId: number, dto: CreateRecurringDto) {
    const recurring = this.recurringRepository.create({
      ...dto,
      userId,
      nextDate: dto.startDate,
      isActive: dto.isActive ?? true,
    });
    return this.recurringRepository.save(recurring);
  }

  async findAll(userId: number) {
    return this.recurringRepository.find({
      where: { userId },
      order: { nextDate: 'ASC' },
    });
  }

  async toggleActive(id: number, userId: number) {
    const item = await this.recurringRepository.findOne({ where: { id, userId } });
    if (!item) throw new NotFoundException('Запис не знайдено');

    item.isActive = !item.isActive;
    return this.recurringRepository.save(item);
  }

  async remove(id: number, userId: number) {
    await this.recurringRepository.delete({ id, userId });
    return { message: 'Регулярний платіж видалено' };
  }
}