import { IClient } from './client.entity';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export class IUser {
  id: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  isActive: boolean;

  clients: IClient[];

  createdAt: Date;
  updatedAt: Date;
}
