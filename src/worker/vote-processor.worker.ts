import { NestFactory } from '@nestjs/core';
import { AppModule } from '../presentation/modules/app.module';
import { VoteProcessorService } from './vote-processor.service';
import { RedisService } from '../infrastructure/services/redis.service';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const voteProcessor = app.get(VoteProcessorService);
  const redisService = app.get(RedisService);

  const CONSUMER_NAME = `worker-${process.pid}`;
  const STREAM_NAME = redisService.getStreamName();
  const GROUP_NAME = redisService.getConsumerGroup();
  const BATCH_SIZE = 10;
  const BLOCK_TIME = 5000; // 5 segundos

  console.log(`🚀 Worker iniciado: ${CONSUMER_NAME}`);
  console.log(`📡 Consumindo stream: ${STREAM_NAME}, grupo: ${GROUP_NAME}`);

  while (true) {
    try {
      // Ler mensagens do stream
      const messages = await redisService.xreadgroup(
        GROUP_NAME,
        CONSUMER_NAME,
        STREAM_NAME,
        BATCH_SIZE,
        BLOCK_TIME,
      );

      if (messages && messages.length > 0) {
        for (const streamData of messages) {
          const [stream, entries] = streamData;
          if (entries && entries.length > 0) {
            for (const [messageId, fields] of entries) {
              try {
                // Converter array de campos para objeto
                const message: any = {};
                for (let i = 0; i < fields.length; i += 2) {
                  message[fields[i]] = fields[i + 1];
                }

                // Processar voto
                await voteProcessor.processVote(
                  {
                    pollId: parseInt(message.poll_id),
                    option: message.option as 'A' | 'B',
                    emailFingerprint: message.email_fingerprint,
                    emailPrefix2: message.email_prefix2,
                    name: message.name || '',
                    email: message.email || '',
                  },
                  messageId,
                );

                // ACK da mensagem
                await redisService.xack(STREAM_NAME, GROUP_NAME, messageId);
              } catch (error) {
                console.error(`Erro ao processar mensagem ${messageId}:`, error);
                // Mensagem não será ACKada, então será reprocessada
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Erro no loop do worker:', error);
      // Aguardar antes de tentar novamente
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}

bootstrap().catch((error) => {
  console.error('Erro fatal no worker:', error);
  process.exit(1);
});
