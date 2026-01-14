import { Repository } from 'typeorm';
import { IUserRepository } from '../../domain/repositories/user.repository';
import { UserOrmEntity } from '../database/entities/user.orm-entity';
import { IUser } from '@/domain/entities';

export class UserRepository implements IUserRepository {
  constructor(private repo: Repository<UserOrmEntity>) {}

  findAll(): Promise<IUser[]> {
    return this.repo.find();
  }

  async findById(id: string): Promise<IUser | null> {
    const user = await this.repo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.clients', 'client', 'client.userId = user.id')
      .where('user.id = :id', { id })
      .getOne();

    return user;
  }

  async findByEmail(email: string): Promise<IUser | null> {
    const user = await this.repo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.clients', 'client', 'client.userId = user.id')
      .where('user.email = :email', { email })
      .getOne();

    return user;
  }

  async create(user: Partial<IUser>): Promise<IUser> {
    const entity = this.repo.create(user);
    return this.repo.save(entity);
  }

  async update(id: string, user: Partial<IUser>): Promise<IUser> {
    // Remover propriedades relacionais antes do update
    const { clients, ...updateData } = user;
    await this.repo.update({ id }, updateData as any);
    return await this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete({ id });
  }
}
