import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
  Unique,
} from 'typeorm';
import { PollOrmEntity } from './poll.orm-entity';

@Entity('votes')
@Unique(['pollId', 'emailFingerprint'])
@Index(['pollId', 'createdAt'], { order: { createdAt: 'DESC' } })
@Index(['pollId', 'optionSelected'])
export class VoteOrmEntity {
  @PrimaryGeneratedColumn('bigint')
  id: number;

  @Column({ type: 'bigint', name: 'poll_id' })
  pollId: number;

  @ManyToOne(() => PollOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'poll_id' })
  poll: PollOrmEntity;

  @Column({ type: 'char', length: 1, name: 'option_selected' })
  optionSelected: 'A' | 'B';

  @Column({ type: 'bytea', name: 'email_fingerprint' })
  emailFingerprint: Buffer;

  @Column({ type: 'char', length: 2, name: 'email_prefix2' })
  emailPrefix2: string;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;
}
