import { IClient } from '../entities';

export abstract class IClientRepository {
  abstract findAll(userId?: string): Promise<IClient[]>;
  abstract findById(id: string): Promise<IClient | null>;
  abstract findByDomain(domain: string): Promise<IClient | null>;
  abstract create(client: Partial<IClient>): Promise<IClient>;
  abstract update(id: string, client: Partial<IClient>): Promise<IClient>;
  abstract delete(id: string): Promise<void>;
}
