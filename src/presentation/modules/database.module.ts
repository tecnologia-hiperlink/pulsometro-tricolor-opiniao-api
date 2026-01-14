import { databaseProviders } from '@/infrastructure/database';
import { Module } from '@nestjs/common';

@Module({
  providers: [...databaseProviders],
  exports: [...databaseProviders],
})
export class DatabaseModule {}
