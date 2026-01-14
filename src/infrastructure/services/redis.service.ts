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
    });
  }

  async onModuleInit() {
    try {
      // Criar consumer group se não existir
      await this.client.xgroup('CREATE', this.STREAM_NAME, this.CONSUMER_GROUP, '0', 'MKSTREAM').catch(() => {
        // Group já existe, ignorar erro
      });
    } catch (error) {
      // Ignorar se já existe
    }
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  getClient(): Redis {
    return this.client;
  }

  // Cache operations
  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.client.setex(key, ttlSeconds, value);
    } else {
      await this.client.set(key, value);
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }

  // Set with NX (only if not exists) - usado para dedupe
  async setNX(key: string, value: string, ttlSeconds: number): Promise<boolean> {
    const result = await this.client.set(key, value, 'EX', ttlSeconds, 'NX');
    return result === 'OK';
  }

  // List operations
  async lpush(key: string, ...values: string[]): Promise<number> {
    return this.client.lpush(key, ...values);
  }

  async ltrim(key: string, start: number, stop: number): Promise<void> {
    await this.client.ltrim(key, start, stop);
  }

  async lrange(key: string, start: number, stop: number): Promise<string[]> {
    return this.client.lrange(key, start, stop);
  }

  // Stream operations
  async xadd(stream: string, fields: Record<string, string>): Promise<string> {
    const args: (string | number)[] = [stream, '*'];
    for (const [key, value] of Object.entries(fields)) {
      args.push(key, value);
    }
    return this.client.xadd(...args);
  }

  async xreadgroup(
    group: string,
    consumer: string,
    stream: string,
    count: number = 10,
    block?: number,
  ): Promise<any[]> {
    const args: (string | number)[] = ['GROUP', group, consumer, 'COUNT', count, 'STREAMS', stream, '>'];
    if (block !== undefined) {
      args.push('BLOCK', block);
    }
    const result = await this.client.xreadgroup(...args);
    return result || [];
  }

  async xack(stream: string, group: string, ...ids: string[]): Promise<number> {
    return this.client.xack(stream, group, ...ids);
  }

  getStreamName(): string {
    return this.STREAM_NAME;
  }

  getConsumerGroup(): string {
    return this.CONSUMER_GROUP;
  }
}
