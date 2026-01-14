import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database.module';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';
import { clientProviders } from '@/infrastructure/providers/client.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [ClientsController],
  providers: [ClientsService, ...clientProviders],
})
export class ClientsModule {}
