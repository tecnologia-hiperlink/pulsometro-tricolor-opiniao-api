import {
  Entity,
  Column,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PollOrmEntity } from './poll.orm-entity';

@Entity('poll_results')
export class PollResultOrmEntity {
  @PrimaryColumn({ type: 'bigint', name: 'poll_id' })
  pollId: number;

  @ManyToOne(() => PollOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'poll_id' })
  poll: PollOrmEntity;

  @Column({ type: 'bigint', name: 'count_a', default: 0 })
  countA: number;

  @Column({ type: 'bigint', name: 'count_b', default: 0 })
  countB: number;

  @Column({ type: 'bigint', default: 0 })
  total: number;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
