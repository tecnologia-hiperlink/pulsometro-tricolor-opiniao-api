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
@Index('idx_votes_poll_created_at_desc', ['pollId', 'createdAt'])
@Index('idx_votes_poll_option', ['pollId', 'optionSelected'])
export class VoteOrmEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
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
