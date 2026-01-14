import { Provider } from '@nestjs/common';
import { ClientOrmEntity } from '../database/entities/client.orm-entity';
import { ClientRepository } from '../repositories';
import { IClientRepository, IUserRepository } from '@/domain/repositories';
import { DATABASE } from '../database/database.providers';
import { IGetAllClientsUseCase } from '@/domain/usecase/clients/get-all.usecase';
import { GetAllClientsUseCase } from '@/application/clients/get-all.usecase';
import { ICreateClientUseCase } from '@/domain/usecase/clients/create.usecase';
import { CreateClientUseCase } from '@/application/clients/create.usecase';
import { UserOrmEntity } from '../database/entities/user.orm-entity';
import { UserRepository } from '../repositories';
import { IHashService } from '@/domain/services/hash.service';
import { BcryptHashService } from '../services/bcrypt-hash.service';

export const CLIENT_REPOSITORY = 'CLIENT_REPOSITORY';
export const USER_REPOSITORY = 'USER_REPOSITORY';

export const clientProviders: Provider[] = [
  {
    provide: CLIENT_REPOSITORY,
    useFactory: (dataSource: any) => dataSource.getRepository(ClientOrmEntity),
    inject: [DATABASE],
  },
  {
    provide: IClientRepository,
    useFactory: (repo) => new ClientRepository(repo),
    inject: [CLIENT_REPOSITORY],
  },
  {
    provide: USER_REPOSITORY,
    useFactory: (dataSource: any) => dataSource.getRepository(UserOrmEntity),
    inject: [DATABASE],
  },
  {
    provide: IUserRepository,
    useFactory: (repo) => new UserRepository(repo),
    inject: [USER_REPOSITORY],
  },
  {
    provide: IHashService,
    useClass: BcryptHashService,
  },
  {
    provide: IGetAllClientsUseCase,
    useClass: GetAllClientsUseCase,
  },
  {
    provide: ICreateClientUseCase,
    useClass: CreateClientUseCase,
  },
];
