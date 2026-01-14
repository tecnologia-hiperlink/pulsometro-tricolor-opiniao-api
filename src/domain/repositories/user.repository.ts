import { IUser } from '../entities';

export abstract class IUserRepository {
  abstract findAll(): Promise<IUser[]>;
  abstract findById(id: string): Promise<IUser | null>;
  abstract findByEmail(email: string): Promise<IUser | null>;
  abstract create(user: Partial<IUser>): Promise<IUser>;
  abstract update(id: string, user: Partial<IUser>): Promise<IUser>;
  abstract delete(id: string): Promise<void>;
}
