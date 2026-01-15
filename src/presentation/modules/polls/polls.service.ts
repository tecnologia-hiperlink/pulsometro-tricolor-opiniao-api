import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RedisService } from '@/infrastructure/services/redis.service';
import { HmacService } from '@/infrastructure/services/hmac.service';
import { EmailNormalizationService } from '@/infrastructure/services/email-normalization.service';
import { PollOrmEntity } from '@/infrastructure/database/entities/poll.orm-entity';
import { PollResultOrmEntity } from '@/infrastructure/database/entities/poll-result.orm-entity';
import { VoteOrmEntity } from '@/infrastructure/database/entities/vote.orm-entity';
import {
  PollListItemDto,
  PollDetailDto,
  PollStatsDto,
  VoteHistoryDto,
  PollHistoryResponseDto,
} from './dto/poll-response.dto';
import { VotePollDto } from './dto/vote-poll.dto';

@Injectable()
export class PollsService {
  constructor(
    @InjectRepository(PollOrmEntity)
    private pollRepository: Repository<PollOrmEntity>,
    @InjectRepository(PollResultOrmEntity)
    private pollResultRepository: Repository<PollResultOrmEntity>,
    @InjectRepository(VoteOrmEntity)
    private voteRepository: Repository<VoteOrmEntity>,
    private redisService: RedisService,
    private hmacService: HmacService,
    private emailNormalizationService: EmailNormalizationService,
  ) { }

  /**
   * Lista todas as enquetes (lê do Redis cache)
   */
  async findAll(): Promise<PollListItemDto[]> {
    const cached = await this.redisService.get('polls:public');
    if (cached && cached.trim() !== '' && cached !== '[]') {
      try {
        return JSON.parse(cached);
      } catch {
        // Se falhar ao parsear, continuar com fallback
      }
    }

    // Fallback: buscar do banco e popular cache
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

    // Popular cache
    await this.redisService.set('polls:public', JSON.stringify(pollsWithStats), 300); // 5 min TTL

    return pollsWithStats;
  }

  /**
   * Busca detalhes de uma enquete com histórico paginado (lê do Redis)
   */
  async findOne(id: number, page: number = 1, pageSize: number = 50): Promise<PollHistoryResponseDto> {
    const poll = await this.pollRepository.findOne({ where: { id, isActive: true } });
    if (!poll) {
      throw new NotFoundException(`Enquete com ID ${id} não encontrada`);
    }

    // Tentar buscar do cache
    const cachedDetail = await this.redisService.get(`poll:${id}:public`);
    const cachedHistory = await this.redisService.lrange(`poll:${id}:history`, 0, pageSize - 1);

    let stats: PollStatsDto;
    let history: VoteHistoryDto[] = [];

    if (cachedDetail && cachedHistory.length > 0) {
      // Usar cache, mas validar que os dados estão consistentes
      const detail = JSON.parse(cachedDetail);
      stats = detail.stats;
      // Remover duplicados do histórico do cache baseado no ID
      const historyMap = new Map<number, VoteHistoryDto>();
      cachedHistory.forEach((item) => {
        const parsed = JSON.parse(item);
        // Usar ID numérico como chave para evitar duplicados
        const voteId = typeof parsed.id === 'string' ? parseInt(parsed.id) : parsed.id;
        if (!historyMap.has(voteId)) {
          historyMap.set(voteId, parsed);
        }
      });
      history = Array.from(historyMap.values());
    } else {
      // Fallback: buscar do banco
      const result = await this.pollResultRepository.findOne({
        where: { pollId: id },
      });

      const dbStats = result || {
        countA: 0,
        countB: 0,
        total: 0,
      };

      const total = Number(dbStats.total);
      const countA = Number(dbStats.countA);
      const countB = Number(dbStats.countB);
      stats = {
        countA,
        countB,
        total,
        percentageA: total > 0 ? Math.round((countA / total) * 100) : 0,
        percentageB: total > 0 ? Math.round((countB / total) * 100) : 0,
      };

      // Buscar histórico do banco
      const votes = await this.voteRepository.find({
        where: { pollId: id },
        order: { createdAt: 'DESC' },
        take: pageSize,
        skip: (page - 1) * pageSize,
      });

      history = votes.map((vote) => ({
        id: vote.id,
        option: vote.optionSelected,
        emailPrefix: vote.emailPrefix2 + '**',
        createdAt: vote.createdAt,
      }));

      // Popular cache
      await this.redisService.set(
        `poll:${id}:public`,
        JSON.stringify({
          id: poll.id,
          question: poll.title,
          optionALabel: poll.optionALabel,
          optionBLabel: poll.optionBLabel,
          stats,
          createdAt: poll.createdAt,
        }),
        300,
      );

      // Popular histórico no cache (últimos 500)
      if (votes.length > 0) {
        const historyJson = votes.map((v) =>
          JSON.stringify({
            id: v.id,
            option: v.optionSelected,
            emailPrefix: v.emailPrefix2 + '**',
            createdAt: v.createdAt,
          }),
        );
        await this.redisService.lpush(`poll:${id}:history`, ...historyJson);
        await this.redisService.ltrim(`poll:${id}:history`, 0, 499);
      }
    }

    return {
      poll: {
        id: poll.id,
        question: poll.title,
        optionALabel: poll.optionALabel,
        optionBLabel: poll.optionBLabel,
        stats,
        createdAt: poll.createdAt,
      },
      history: history.slice((page - 1) * pageSize, page * pageSize),
      page,
      pageSize,
      total: stats.total,
    };
  }

  /**
   * Registra um voto (publica no Redis Stream)
   */
  async vote(pollId: number, voteDto: VotePollDto): Promise<void> {
    // 1. Verificar se a enquete existe e está ativa
    const poll = await this.pollRepository.findOne({
      where: { id: pollId, isActive: true },
    });

    if (!poll) {
      throw new NotFoundException(`Enquete com ID ${pollId} não encontrada ou inativa`);
    }

    // 2. Validar email
    if (!this.emailNormalizationService.isValid(voteDto.email)) {
      throw new BadRequestException('E-mail inválido');
    }

    // 3. Normalizar email
    const emailNormalized = this.emailNormalizationService.normalize(voteDto.email);
    const emailPrefix2 = this.emailNormalizationService.getPrefix2(emailNormalized);

    // 4. Calcular fingerprint
    const emailFingerprint = this.hmacService.generatePollFingerprint(pollId, emailNormalized);
    const fingerprintBase64 = emailFingerprint.toString('base64');

    // 5. Verificar dedupe no Redis (barreira rápida)
    const dedupeKey = `vote:poll:${pollId}:fp:${fingerprintBase64}`;
    const alreadyVoted = await this.redisService.exists(dedupeKey);

    if (alreadyVoted) {
      throw new ConflictException('Este e-mail já votou nesta enquete');
    }

    // 6. Marcar como votado no Redis (TTL 1 ano = 31536000 segundos)
    await this.redisService.setNX(dedupeKey, '1', 31536000);

    // 7. Publicar no Redis Stream
    await this.redisService.xadd(this.redisService.getStreamName(), {
      poll_id: pollId.toString(),
      option: voteDto.option,
      email_fingerprint: fingerprintBase64,
      email_prefix2: emailPrefix2,
      name: voteDto.name,
      email: emailNormalized, // Enviar normalizado para o worker
    });
  }
}
