import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Budget } from '../budgets/budget.entity';
import { Debt } from '../debts/debt.entity';
import { RecurringTransaction } from '../recurring/recurring.entity';
import { Transaction } from '../transactions/transaction.entity';
import { User } from '../users/user.entity';
import { MailService } from './mail.service';
import { NotificationLog } from './notification-log.entity';
import { NotificationsService } from './notifications.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Debt,
      RecurringTransaction,
      Budget,
      Transaction,
      NotificationLog,
    ]),
  ],
  providers: [MailService, NotificationsService],
})
export class NotificationsModule {}
