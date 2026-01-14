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
@Index('idx_contacts_created_at_desc', ['createdAt'])
export class ContactOrmEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
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
