import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PollSuggestionOrmEntity } from '@/infrastructure/database/entities/poll-suggestion.orm-entity';
import { CreateSuggestionDto } from './dto/create-suggestion.dto';

@Injectable()
export class SuggestionsService {
  constructor(
    @InjectRepository(PollSuggestionOrmEntity)
    private suggestionRepository: Repository<PollSuggestionOrmEntity>,
  ) {}

  async create(createSuggestionDto: CreateSuggestionDto): Promise<{ message: string }> {
    // Gerar suggestionText se não fornecido (para compatibilidade)
    const suggestionText = createSuggestionDto.suggestionText || 
      `Pergunta: ${createSuggestionDto.question}\nOpção A: ${createSuggestionDto.optionA}\nOpção B: ${createSuggestionDto.optionB}`;

    const suggestion = this.suggestionRepository.create({
      name: createSuggestionDto.name,
      email: createSuggestionDto.email,
      question: createSuggestionDto.question,
      optionA: createSuggestionDto.optionA,
      optionB: createSuggestionDto.optionB,
      suggestionText,
    });

    await this.suggestionRepository.save(suggestion);

    return { message: 'Sugestão registrada com sucesso' };
  }
}
