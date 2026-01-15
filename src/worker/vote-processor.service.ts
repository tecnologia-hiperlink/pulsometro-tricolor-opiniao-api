import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RedisService } from '@/infrastructure/services/redis.service';
import { HmacService } from '@/infrastructure/services/hmac.service';
import { EmailNormalizationService } from '@/infrastructure/services/email-normalization.service';
import { VoteOrmEntity } from '@/infrastructure/database/entities/vote.orm-entity';
import { ContactOrmEntity } from '@/infrastructure/database/entities/contact.orm-entity';
import { PollResultOrmEntity } from '@/infrastructure/database/entities/poll-result.orm-entity';
import { PollOrmEntity } from '@/infrastructure/database/entities/poll.orm-entity';

interface VoteMessage {
  pollId: number;
  option: 'A' | 'B';
  emailFingerprint: string; // base64
  emailPrefix2: string;
  name: string;
  email: string; // apenas para log, não salvar
}

@Injectable()
export class VoteProcessorService {
  constructor(
    @InjectRepository(VoteOrmEntity)
    private voteRepository: Repository<VoteOrmEntity>,
    @InjectRepository(ContactOrmEntity)
    private contactRepository: Repository<ContactOrmEntity>,
    @InjectRepository(PollResultOrmEntity)
    private pollResultRepository: Repository<PollResultOrmEntity>,
    @InjectRepository(PollOrmEntity)
    private pollRepository: Repository<PollOrmEntity>,
    private redisService: RedisService,
    private hmacService: HmacService,
    private emailNormalizationService: EmailNormalizationService,
  ) { }

  /**
   * Processa uma mensagem de voto do Redis Stream
   */
  async processVote(message: VoteMessage, messageId: string): Promise<void> {
    const { pollId, option, emailFingerprint: fpBase64, emailPrefix2, name, email } = message;

    // Converter fingerprint de base64 para Buffer
    const emailFingerprint = Buffer.from(fpBase64, 'base64');
    const emailNormalized = email ? this.emailNormalizationService.normalize(email) : '';

    try {
      // 1. Tentar inserir voto (violação UNIQUE = idempotência, ok)
      let savedVote: VoteOrmEntity;
      try {
        const vote = this.voteRepository.create({
          pollId,
          optionSelected: option,
          emailFingerprint,
          emailPrefix2,
        });
        savedVote = await this.voteRepository.save(vote);
      } catch (error: any) {
        // Se violar UNIQUE, significa que já foi processado (idempotência)
        if (error.code === '23505') {
          console.log(`Voto duplicado ignorado: pollId=${pollId}, fingerprint=${fpBase64.substring(0, 8)}...`);
          return;
        }
        throw error;
      }

      // 2. Upsert em contacts (se email foi fornecido)
      if (emailNormalized) {
        const globalFingerprint = this.hmacService.generateGlobalFingerprint(emailNormalized);
        const prefix2 = this.emailNormalizationService.getPrefix2(emailNormalized);

        await this.contactRepository
          .createQueryBuilder()
          .insert()
          .into(ContactOrmEntity)
          .values({
            name,
            email: email || '',
            emailNormalized,
            emailGlobalFingerprint: globalFingerprint,
          })
          .orIgnore() // Ignora se já existe (idempotência)
          .execute();
      }

      // 3. Atualizar poll_results (incrementar contadores)
      let result = await this.pollResultRepository.findOne({
        where: { pollId },
      });

      if (!result) {
        // Criar se não existir
        result = this.pollResultRepository.create({
          pollId,
          countA: option === 'A' ? 1 : 0,
          countB: option === 'B' ? 1 : 0,
          total: 1,
        });
      } else {
        // Incrementar contadores (converter para number para evitar concatenação de string - bigint retorna como string)
        result.countA = Number(result.countA) + (option === 'A' ? 1 : 0);
        result.countB = Number(result.countB) + (option === 'B' ? 1 : 0);
        result.total = Number(result.total) + 1;
      }

      await this.pollResultRepository.save(result);

      // 4. Stats já foram atualizados acima
      const stats = result;

      // 5. Atualizar Redis cache
      // 5.1. Atualizar poll:{id}:stats
      await this.redisService.set(
        `poll:${pollId}:stats`,
        JSON.stringify({
          countA: stats.countA,
          countB: stats.countB,
          total: stats.total,
          percentageA: stats.total > 0 ? Math.round((stats.countA / stats.total) * 100) : 0,
          percentageB: stats.total > 0 ? Math.round((stats.countB / stats.total) * 100) : 0,
        }),
        86400, // 1 dia
      );

      // 5.2. Adicionar ao histórico (poll:{id}:history) usando o ID real do voto salvo
      const historyItem = JSON.stringify({
        id: savedVote.id, // Usar o ID real do voto salvo no banco
        option,
        emailPrefix: emailPrefix2 + '**',
        createdAt: savedVote.createdAt.toISOString(),
      });
      await this.redisService.lpush(`poll:${pollId}:history`, historyItem);
      await this.redisService.ltrim(`poll:${pollId}:history`, 0, 499); // Manter últimos 500

      // 5.3. Atualizar polls:public diretamente (recarregar do banco e atualizar cache)
      await this.updatePollsPublicCache();

      // 5.4. Invalidar poll:{id}:public (será recalculado no próximo GET)
      await this.redisService.del(`poll:${pollId}:public`);

      console.log(`Voto processado: pollId=${pollId}, option=${option}, messageId=${messageId}`);
    } catch (error) {
      console.error(`Erro ao processar voto:`, error);
      throw error; // Re-throw para que o worker possa fazer retry
    }
  }

  /**
   * Atualiza o cache polls:public recarregando do banco
   */
  private async updatePollsPublicCache(): Promise<void> {
    try {
      const polls = await this.pollRepository.find({
        where: { isActive: true },
        order: { createdAt: 'DESC' },
      });

      const pollsWithStats = await Promise.all(
        polls.map(async (poll) => {
          const result = await this.pollResultRepository.findOne({
            where: { pollId: poll.id },
          });

          const stats = result || {
            countA: 0,
            countB: 0,
            total: 0,
          };

          return {
            id: poll.id,
            question: poll.title,
            optionALabel: poll.optionALabel,
            optionBLabel: poll.optionBLabel,
            votesFor: Number(stats.countA),
            votesAgainst: Number(stats.countB),
            totalVotes: Number(stats.total),
            createdAt: poll.createdAt,
          };
        }),
      );

      // Atualizar cache
      await this.redisService.set('polls:public', JSON.stringify(pollsWithStats), 300); // 5 min TTL
    } catch (error) {
      console.error('Erro ao atualizar cache polls:public:', error);
      // Não falhar o processamento do voto se o cache falhar
    }
  }
}
