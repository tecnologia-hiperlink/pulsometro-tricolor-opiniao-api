import { Repository } from 'typeorm';
import { IClientRepository } from '../../domain/repositories/client.repository';
import { ClientOrmEntity } from '../database/entities/client.orm-entity';
import { IClient } from '@/domain/entities';

export class ClientRepository implements IClientRepository {
  constructor(private repo: Repository<ClientOrmEntity>) {}

  findAll(userId?: string): Promise<IClient[]> {
    if (userId) {
      return this.repo.find({ where: { userId } });
    }
    return this.repo.find();
  }

  findById(id: string): Promise<IClient | null> {
    return this.repo.findOneBy({ id });
  }

  findByDomain(domain: string): Promise<IClient | null> {
    return this.repo.findOneBy({ domain });
  }

  async create(client: Partial<IClient>): Promise<IClient> {
    const entity = this.repo.create(client);
    return this.repo.save(entity);
  }

  async update(id: string, client: Partial<IClient>): Promise<IClient> {
    await this.repo.update({ id }, client);
    return await this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete({ id });
  }
}
