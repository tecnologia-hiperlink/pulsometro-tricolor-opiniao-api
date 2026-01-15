import { Controller, Get, Post, Param, Body, ParseIntPipe, Query, HttpCode, HttpStatus, UseGuards, DefaultValuePipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiBody } from '@nestjs/swagger';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';
import { PollsService } from './polls.service';
import { PollListItemDto, PollHistoryResponseDto } from './dto/poll-response.dto';
import { VotePollDto } from './dto/vote-poll.dto';

@ApiTags('polls')
@Controller('api/polls')
export class PollsController {
  constructor(private readonly pollsService: PollsService) { }

  @Get()
  @ApiOperation({ summary: 'Lista todas as enquetes' })
  @ApiResponse({ status: 200, description: 'Lista de enquetes', type: [PollListItemDto] })
  @Throttle({ default: { limit: 120, ttl: 60000 } }) // 120 requisições por minuto por IP para leitura
  async findAll(): Promise<PollListItemDto[]> {
    return this.pollsService.findAll();
  }

  @Get(':id')
  @Throttle({ default: { limit: 120, ttl: 60000 } }) // 120 requisições por minuto por IP para leitura
  @ApiOperation({ summary: 'Busca detalhes de uma enquete com histórico' })
  @ApiParam({ name: 'id', type: Number, description: 'ID da enquete' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Página do histórico (padrão: 1)' })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, description: 'Itens por página (padrão: 50)' })
  @ApiResponse({ status: 200, description: 'Detalhes da enquete com histórico', type: PollHistoryResponseDto })
  @ApiResponse({ status: 404, description: 'Enquete não encontrada' })
  async findOne(
    @Param('id', new ParseIntPipe()) id: number,
    @Query('page', new DefaultValuePipe(1), new ParseIntPipe()) page: number,
    @Query('pageSize', new DefaultValuePipe(50), new ParseIntPipe()) pageSize: number,
  ): Promise<PollHistoryResponseDto> {
    return this.pollsService.findOne(id, page, pageSize);
  }

  @Post(':id/vote')
  @UseGuards(ThrottlerGuard)
  @Throttle({ vote: { limit: 100, ttl: 60000 } }) // 100 votos por minuto por IP
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Registra um voto em uma enquete' })
  @ApiParam({ name: 'id', type: Number, description: 'ID da enquete' })
  @ApiBody({ type: VotePollDto })
  @ApiResponse({ status: 202, description: 'Voto aceito e será processado' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 404, description: 'Enquete não encontrada' })
  @ApiResponse({ status: 409, description: 'E-mail já votou nesta enquete' })
  async vote(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() voteDto: VotePollDto,
  ): Promise<{ message: string }> {
    await this.pollsService.vote(id, voteDto);
    return { message: 'Voto registrado com sucesso' };
  }
}
