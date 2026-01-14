import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserOrmEntity } from './user.orm-entity';
import { IClient } from '@/domain/entities';

@Entity('clients')
export class ClientOrmEntity implements IClient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  domain: string;

  @Column({ default: true })
  isActive: boolean;

  @Column('uuid')
  userId: string;

  @Column('uuid')
  createdBy: string;

  @ManyToOne(() => UserOrmEntity, (user) => user.clients)
  @JoinColumn({ name: 'userId' })
  user: UserOrmEntity;

  // Propriedade opcional para compatibilidade com IClient
  pages?: any[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
