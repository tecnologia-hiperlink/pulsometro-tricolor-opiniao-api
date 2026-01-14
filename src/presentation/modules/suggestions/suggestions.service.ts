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
    const suggestion = this.suggestionRepository.create({
      name: createSuggestionDto.name,
      email: createSuggestionDto.email,
      question: createSuggestionDto.question,
      optionA: createSuggestionDto.optionA,
      optionB: createSuggestionDto.optionB,
    });

    await this.suggestionRepository.save(suggestion);

    return { message: 'Sugestão registrada com sucesso' };
  }
}
