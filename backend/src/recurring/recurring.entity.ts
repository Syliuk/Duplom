import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../users/user.entity';

@Entity('recurring_transactions')
export class RecurringTransaction {
  @PrimaryGeneratedColumn()
    id!: number;

  @Column()
    title!: string;

  @Column('decimal', { precision: 12, scale: 2 })
    amount!: number;

  @Column({ type: 'enum', enum: ['income', 'expense'] })
    type!: 'income' | 'expense';

  @Column()
    category!: string;

  @Column({ type: 'enum', enum: ['monthly', 'weekly', 'yearly'] })
    frequency!: 'monthly' | 'weekly' | 'yearly';

  @Column({ type: 'date' })
    startDate!: string;

  @Column({ type: 'date' })
    nextDate!: string;

  @Column({ default: true })
    isActive!: boolean;

  @Column({ nullable: true })
  note?: string;

  @ManyToOne(() => User, (user) => user.recurring, { onDelete: 'CASCADE' })
    user!: User;

  @Column()
    userId!: number;
}