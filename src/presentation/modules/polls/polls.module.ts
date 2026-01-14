import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PollsController } from './polls.controller';
import { PollsService } from './polls.service';
import { PollOrmEntity } from '@/infrastructure/database/entities/poll.orm-entity';
import { PollResultOrmEntity } from '@/infrastructure/database/entities/poll-result.orm-entity';
import { VoteOrmEntity } from '@/infrastructure/database/entities/vote.orm-entity';
import { RedisModule } from '@/infrastructure/modules/redis.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PollOrmEntity, PollResultOrmEntity, VoteOrmEntity]),
    RedisModule,
  ],
  controllers: [PollsController],
  providers: [PollsService],
  exports: [PollsService],
})
export class PollsModule {}
