import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SuggestionsController } from './suggestions.controller';
import { SuggestionsService } from './suggestions.service';
import { PollSuggestionOrmEntity } from '@/infrastructure/database/entities/poll-suggestion.orm-entity';

@Module({
  imports: [TypeOrmModule.forFeature([PollSuggestionOrmEntity])],
  controllers: [SuggestionsController],
  providers: [SuggestionsService],
  exports: [SuggestionsService],
})
export class SuggestionsModule {}
