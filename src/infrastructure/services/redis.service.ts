import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;
  private readonly STREAM_NAME = 'votes_stream';
  private readonly CONSUMER_GROUP = 'vote_processors';

  constructor() {
    this.client = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      lazyConnect: true, // Não conectar automaticamente
    });

    // Tratar erros de conexão
    this.client.on('error', (error) => {
      console.warn('⚠️  Redis connection error (API continuará funcionando com fallback):', error.message);
    });

    this.client.on('connect', () => {
      console.log('✓ Redis conectado');
    });
  }

  async onModuleInit() {
    try {
      // Tentar conectar ao Redis
      await this.client.connect().catch((error) => {
        console.warn('⚠️  Redis não disponível. API funcionará com fallback para PostgreSQL.');
      });

      // Criar consumer group se não existir
      await this.client.xgroup('CREATE', this.STREAM_NAME, this.CONSUMER_GROUP, '0', 'MKSTREAM').catch(() => {
        // Group já existe, ignorar erro
      });
    } catch (error) {
      // Ignorar se já existe ou se Redis não estiver disponível
      console.warn('⚠️  Redis não disponível durante inicialização.');
    }
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  getClient(): Redis {
    return this.client;
  }

  private async isConnected(): Promise<boolean> {
    try {
      return this.client.status === 'ready';
    } catch {
      return false;
    }
  }

  // Cache operations
  async get(key: string): Promise<string | null> {
    if (!(await this.isConnected())) return null;
    try {
      return await this.client.get(key);
    } catch {
      return null;
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (!(await this.isConnected())) return;
    try {
      if (ttlSeconds) {
        await this.client.setex(key, ttlSeconds, value);
      } else {
        await this.client.set(key, value);
      }
    } catch {
      // Ignorar erros do Redis
    }
  }

  async del(key: string): Promise<void> {
    if (!(await this.isConnected())) return;
    try {
      await this.client.del(key);
    } catch {
      // Ignorar erros do Redis
    }
  }

  async exists(key: string): Promise<boolean> {
    if (!(await this.isConnected())) return false;
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch {
      return false;
    }
  }

  // Set with NX (only if not exists) - usado para dedupe
  async setNX(key: string, value: string, ttlSeconds: number): Promise<boolean> {
    if (!(await this.isConnected())) return false;
    try {
      const result = await this.client.set(key, value, 'EX', ttlSeconds, 'NX');
      return result === 'OK';
    } catch {
      return false;
    }
  }

  // List operations
  async lpush(key: string, ...values: string[]): Promise<number> {
    if (!(await this.isConnected())) return 0;
    try {
      return await this.client.lpush(key, ...values);
    } catch {
      return 0;
    }
  }

  async ltrim(key: string, start: number, stop: number): Promise<void> {
    if (!(await this.isConnected())) return;
    try {
      await this.client.ltrim(key, start, stop);
    } catch {
      // Ignorar erros do Redis
    }
  }

  async lrange(key: string, start: number, stop: number): Promise<string[]> {
    if (!(await this.isConnected())) return [];
    try {
      return await this.client.lrange(key, start, stop);
    } catch {
      return [];
    }
  }

  // Stream operations
  async xadd(stream: string, fields: Record<string, string>): Promise<string> {
    if (!(await this.isConnected())) {
      throw new Error('Redis não está disponível. Não é possível registrar voto.');
    }
    try {
      const fieldArray: string[] = [];
      for (const [key, value] of Object.entries(fields)) {
        fieldArray.push(key, value);
      }
      return await this.client.xadd(stream, '*', ...fieldArray);
    } catch (error) {
      throw new Error('Erro ao publicar voto no Redis Stream');
    }
  }

  async xreadgroup(
    group: string,
    consumer: string,
    stream: string,
    count: number = 10,
    block?: number,
  ): Promise<any[]> {
    if (!(await this.isConnected())) return [];
    try {
      if (block !== undefined) {
        const result = await this.client.xreadgroup(
          'GROUP',
          group,
          consumer,
          'COUNT',
          count,
          'BLOCK',
          block,
          'STREAMS',
          stream,
          '>',
        );
        return result || [];
      } else {
        const result = await this.client.xreadgroup(
          'GROUP',
          group,
          consumer,
          'COUNT',
          count,
          'STREAMS',
          stream,
          '>',
        );
        return result || [];
      }
    } catch {
      return [];
    }
  }

  async xack(stream: string, group: string, ...ids: string[]): Promise<number> {
    if (!(await this.isConnected())) return 0;
    try {
      return await this.client.xack(stream, group, ...ids);
    } catch {
      return 0;
    }
  }

  getStreamName(): string {
    return this.STREAM_NAME;
  }

  getConsumerGroup(): string {
    return this.CONSUMER_GROUP;
  }
}
