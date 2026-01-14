import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import * as dotenv from 'dotenv';
import { AuthModule } from './auth/auth.module';
import { JwtStrategy } from '../strategies/jwt.strategy';
import { ClientsModule } from './clients/clients.module';
import { PollsModule } from './polls/polls.module';
import { SuggestionsModule } from './suggestions/suggestions.module';
import { RedisModule } from '@/infrastructure/modules/redis.module';
import { DatabaseModule } from './database.module';
import { WorkerModule } from '../../worker/worker.module';

dotenv.config();

@Module({
  imports: [
    DatabaseModule,
    RedisModule,
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000, // 1 minuto
        limit: 100, // 100 requisições por minuto
      },
      {
        name: 'vote',
        ttl: 60000, // 1 minuto
        limit: 5, // 5 votos por minuto por IP
      },
    ]),
    ClientsModule,
    AuthModule,
    PollsModule,
    SuggestionsModule,
    WorkerModule,
  ],
  providers: [
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
