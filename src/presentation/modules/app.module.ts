import { Module } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { AuthModule } from './auth/auth.module';
import { JwtStrategy } from '../strategies/jwt.strategy';
import { ClientsModule } from './clients/clients.module';

dotenv.config();

@Module({
  imports: [ClientsModule, AuthModule],
  providers: [JwtStrategy],
})
export class AppModule {}
