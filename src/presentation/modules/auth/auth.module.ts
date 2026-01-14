import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import * as dotenv from 'dotenv';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { authProviders } from '@/infrastructure/providers/auth.providers';
import { AuthService } from './auth.service';
import { DatabaseModule } from '../database.module';

dotenv.config();

@Module({
  imports: [
    DatabaseModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secret',
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
    }),
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, ...authProviders],
})
export class AuthModule {}
