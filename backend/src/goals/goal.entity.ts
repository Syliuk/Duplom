import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../users/user.entity';

@Entity('goals')
export class Goal {
  @PrimaryGeneratedColumn()
    id!: number;

  @Column()
    title!: string;

  @Column('decimal', { precision: 12, scale: 2 })
    targetAmount!: number;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
    currentAmount!: number;

  @Column({ type: 'date' })
    deadline!: string;

  @Column({ default: 'Other' })
    category!: string;

  @ManyToOne(() => User, (user) => user.goals, { onDelete: 'CASCADE' })
    user!: User;

  @Column()
    userId!: number;
}