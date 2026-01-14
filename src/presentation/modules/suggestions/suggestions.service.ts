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
    // Formatar texto da sugestão com nome e email
    const formattedText = `Nome: ${createSuggestionDto.name}\nEmail: ${createSuggestionDto.email}\n\n${createSuggestionDto.suggestionText}`;

    const suggestion = this.suggestionRepository.create({
      suggestionText: formattedText,
    });

    await this.suggestionRepository.save(suggestion);

    return { message: 'Sugestão registrada com sucesso' };
  }
}
