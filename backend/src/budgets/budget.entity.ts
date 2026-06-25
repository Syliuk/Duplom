import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../users/user.entity';

@Entity('budgets')
export class Budget {
  @PrimaryGeneratedColumn()
    id!: number;

  @Column()
    category!: string;

  @Column('decimal', { precision: 12, scale: 2 })
    amount!: number;

  @Column({ type: 'enum', enum: ['monthly', 'yearly'], default: 'monthly' })
    period!: 'monthly' | 'yearly';

  @ManyToOne(() => User, (user) => user.budgets, { onDelete: 'CASCADE' })
    user!: User;

  @Column()
    userId!: number;
}