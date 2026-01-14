import { IUser } from './user.entity';
import { IPage } from './page.entity';

export class IClient {
  id: string;
  name: string;
  domain: string;
  isActive: boolean;
  userId: string;
  createdBy: string;

  user: IUser;
  pages: IPage[];

  createdAt: Date;
  updatedAt: Date;
}
