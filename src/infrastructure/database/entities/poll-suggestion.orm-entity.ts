import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('poll_suggestions')
export class PollSuggestionOrmEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'text', nullable: true })
  question: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'option_a' })
  optionA: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'option_b' })
  optionB: string;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;
}
