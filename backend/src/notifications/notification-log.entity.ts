import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('notification_logs')
export class NotificationLog {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  userId!: number;

  @Index({ unique: true })
  @Column()
  key!: string;

  @Column()
  type!: 'debt' | 'recurring' | 'budget';

  @CreateDateColumn()
  createdAt!: Date;
}
