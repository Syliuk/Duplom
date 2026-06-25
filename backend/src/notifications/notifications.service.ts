import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Budget } from '../budgets/budget.entity';
import { Debt } from '../debts/debt.entity';
import { RecurringTransaction } from '../recurring/recurring.entity';
import { Transaction } from '../transactions/transaction.entity';
import { User } from '../users/user.entity';
import { MailService } from './mail.service';
import { NotificationLog } from './notification-log.entity';

const REMINDER_WINDOW_DAYS = 3;
const CHECK_INTERVAL_MS = 6 * 60 * 60 * 1000;

const toDateValue = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

@Injectable()
export class NotificationsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(NotificationsService.name);
  private intervalId: NodeJS.Timeout | null = null;
  private isChecking = false;

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Debt)
    private readonly debtsRepository: Repository<Debt>,
    @InjectRepository(RecurringTransaction)
    private readonly recurringRepository: Repository<RecurringTransaction>,
    @InjectRepository(Budget)
    private readonly budgetsRepository: Repository<Budget>,
    @InjectRepository(Transaction)
    private readonly transactionsRepository: Repository<Transaction>,
    @InjectRepository(NotificationLog)
    private readonly logsRepository: Repository<NotificationLog>,
    private readonly mailService: MailService,
  ) {}

  onModuleInit() {
    this.intervalId = setInterval(() => void this.checkNotifications(), CHECK_INTERVAL_MS);
    setTimeout(() => void this.checkNotifications(), 5000);
  }

  onModuleDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  async checkNotifications() {
    if (this.isChecking) return;
    this.isChecking = true;

    try {
      const users = await this.usersRepository.find({ where: { emailNotifications: true } });
      for (const user of users) {
        await this.checkUserDebts(user);
        await this.checkUserRecurring(user);
        await this.checkUserBudgets(user);
      }
    } catch (error) {
      this.logger.error('Failed to check email notifications', error);
    } finally {
      this.isChecking = false;
    }
  }

  private async checkUserDebts(user: User) {
    const today = toDateValue(new Date());
    const reminderLimit = toDateValue(addDays(new Date(), REMINDER_WINDOW_DAYS));
    const debts = await this.debtsRepository.find({ where: { userId: user.id } });

    for (const debt of debts) {
      if (Number(debt.currentAmount) >= Number(debt.amount)) continue;
      if (debt.dueDate < today || debt.dueDate > reminderLimit) continue;

      const key = `debt:${user.id}:${debt.id}:${debt.dueDate}`;
      await this.sendOnce(user, key, 'debt', 'Нагадування про борг', [
        `Наближається дата повернення боргу: ${debt.title}.`,
        `Дата: ${debt.dueDate}.`,
        `Сума: ${debt.amount}.`,
      ].join('\n'));
    }
  }

  private async checkUserRecurring(user: User) {
    const today = toDateValue(new Date());
    const reminderLimit = toDateValue(addDays(new Date(), REMINDER_WINDOW_DAYS));
    const recurring = await this.recurringRepository.find({ where: { userId: user.id, isActive: true } });

    for (const item of recurring) {
      if (item.nextDate < today || item.nextDate > reminderLimit) continue;

      const key = `recurring:${user.id}:${item.id}:${item.nextDate}`;
      await this.sendOnce(user, key, 'recurring', 'Нагадування про регулярний платіж', [
        `Наближається регулярний платіж: ${item.title}.`,
        `Дата: ${item.nextDate}.`,
        `Сума: ${item.amount}.`,
      ].join('\n'));
    }
  }

  private async checkUserBudgets(user: User) {
    const budgets = await this.budgetsRepository.find({ where: { userId: user.id } });
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const yearKey = String(now.getFullYear());

    for (const budget of budgets) {
      const periodKey = budget.period === 'yearly' ? yearKey : monthKey;
      const transactions = await this.transactionsRepository.find({
        where: { userId: user.id, type: 'expense', category: budget.category },
      });

      const spent = transactions
        .filter((transaction) => transaction.date.startsWith(periodKey))
        .reduce((sum, transaction) => sum + Number(transaction.amount), 0);

      if (spent <= Number(budget.amount)) continue;

      const key = `budget:${user.id}:${budget.id}:${periodKey}`;
      await this.sendOnce(user, key, 'budget', 'Перевищено бюджет', [
        `Бюджет категорії "${budget.category}" перевищено.`,
        `Ліміт: ${budget.amount}.`,
        `Витрачено: ${spent.toFixed(2)}.`,
      ].join('\n'));
    }
  }

  private async sendOnce(user: User, key: string, type: NotificationLog['type'], subject: string, text: string) {
    const existing = await this.logsRepository.findOne({ where: { key } });
    if (existing) return;

    const sent = await this.mailService.sendMail(user.email, subject, text);
    if (!sent) return;

    await this.logsRepository.save(this.logsRepository.create({ userId: user.id, key, type }));
  }
}
