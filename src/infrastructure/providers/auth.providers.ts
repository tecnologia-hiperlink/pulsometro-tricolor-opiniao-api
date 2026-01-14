import { Provider } from '@nestjs/common';
import { UserRepository } from '../repositories';
import { IUserRepository } from '@/domain/repositories';
import { DATABASE } from '../database/database.providers';
import { UserOrmEntity } from '../database/entities/user.orm-entity';
import { IHashService } from '@/domain/services/hash.service';
import { BcryptHashService } from '../services/bcrypt-hash.service';
import { ILoginUseCase } from '@/domain/usecase/auth/login.usecase';
import { LoginUseCase } from '@/application/login/login.usecase';
import { ITokenService } from '@/domain/services/token.service';
import { JwtTokenService } from '../services/jwt-token.service';

const USER_REPOSITORY = 'USER_REPOSITORY';

export const authProviders: Provider[] = [
  {
    provide: USER_REPOSITORY,
    useFactory: (dataSource) => dataSource.getRepository(UserOrmEntity),
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
    provide: ITokenService,
    useClass: JwtTokenService,
  },
  {
    provide: ILoginUseCase,
    useClass: LoginUseCase,
  },
];
