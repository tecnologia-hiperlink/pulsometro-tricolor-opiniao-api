import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
  Unique,
} from 'typeorm';

@Entity('contacts')
@Unique(['emailNormalized'])
@Unique(['emailGlobalFingerprint'])
@Index(['createdAt'], { order: { createdAt: 'DESC' } })
export class ContactOrmEntity {
  @PrimaryGeneratedColumn('bigint')
  id: number;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text' })
  email: string;

  @Column({ type: 'text', name: 'email_normalized' })
  emailNormalized: string;

  @Column({ type: 'bytea', name: 'email_global_fingerprint' })
  emailGlobalFingerprint: Buffer;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;
}
