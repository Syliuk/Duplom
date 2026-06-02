import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../users/user.entity';

@Entity('transactions')
export class Transaction {
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

  @Column({ type: 'date' })
    date!: string;

  @Column({ nullable: true })
  note?: string;

  @ManyToOne(() => User, (user) => user.transactions, { onDelete: 'CASCADE' })
    user!: User;

  @Column()
    userId!: number;
}