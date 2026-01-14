import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { SuggestionsService } from './suggestions.service';
import { CreateSuggestionDto } from './dto/create-suggestion.dto';

@ApiTags('suggestions')
@Controller('api/suggestions')
export class SuggestionsController {
  constructor(private readonly suggestionsService: SuggestionsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Cria uma sugestão de enquete' })
  @ApiBody({ type: CreateSuggestionDto })
  @ApiResponse({ status: 201, description: 'Sugestão criada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async create(@Body() createSuggestionDto: CreateSuggestionDto): Promise<{ message: string }> {
    return this.suggestionsService.create(createSuggestionDto);
  }
}
