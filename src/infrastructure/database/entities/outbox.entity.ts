import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum OutboxMessageStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  FAILED = 'FAILED',
}

@Entity('outbox')
export class Outbox {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'message_id', type: 'uuid', unique: true })
  messageId: string;

  @Column({ type: 'varchar', length: 100 })
  type: string;

  @Column({ type: 'varchar', length: 100,nullable:true })
  handlerName: string;

  @Column({ type: 'jsonb', nullable: true })
  headers: object;

  @Column({ type: 'jsonb', nullable: true })
  body: object;

  @Column({
    type: 'enum',
    enum: OutboxMessageStatus,
    default: OutboxMessageStatus.PENDING,
  })
  status: OutboxMessageStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
