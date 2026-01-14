import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VoteProcessorService } from './vote-processor.service';
import { VoteOrmEntity } from '@/infrastructure/database/entities/vote.orm-entity';
import { ContactOrmEntity } from '@/infrastructure/database/entities/contact.orm-entity';
import { PollResultOrmEntity } from '@/infrastructure/database/entities/poll-result.orm-entity';
import { PollOrmEntity } from '@/infrastructure/database/entities/poll.orm-entity';
import { RedisModule } from '@/infrastructure/modules/redis.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([VoteOrmEntity, ContactOrmEntity, PollResultOrmEntity, PollOrmEntity]),
    RedisModule,
  ],
  providers: [VoteProcessorService],
  exports: [VoteProcessorService],
})
export class WorkerModule {}
