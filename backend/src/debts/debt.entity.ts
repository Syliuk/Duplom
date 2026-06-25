import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../users/user.entity';

@Entity('debts')
export class Debt {
  @PrimaryGeneratedColumn()
    id!: number;

  @Column()
    title!: string;

  @Column('decimal', { precision: 12, scale: 2 })
    amount!: number;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
    currentAmount!: number;

  @Column({ type: 'enum', enum: ['borrow', 'lend'] })
    type!: 'borrow' | 'lend';

  @Column()
    person!: string;

  @Column({ type: 'date' })
    dueDate!: string;

  @Column({ nullable: true })
  note?: string;

  @ManyToOne(() => User, (user) => user.debts, { onDelete: 'CASCADE' })
    user!: User;

  @Column()
    userId!: number;
}