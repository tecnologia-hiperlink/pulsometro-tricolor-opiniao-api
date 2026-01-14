import { databaseProviders } from '@/infrastructure/database';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config();

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_DATABASE || 'spfc',
      synchronize: false,
      logging: process.env.NODE_ENV === 'development' || false,
      entities: [
        join(__dirname, '../../infrastructure/database/entities/poll*.{ts,js}'),
        join(__dirname, '../../infrastructure/database/entities/vote*.{ts,js}'),
        join(__dirname, '../../infrastructure/database/entities/contact*.{ts,js}'),
      ],
      migrations: [join(__dirname, '../../infrastructure/database/migrations/*.{ts,js}')],
    }),
  ],
  providers: [...databaseProviders],
  exports: [...databaseProviders, TypeOrmModule],
})
export class DatabaseModule {}
