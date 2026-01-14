import { Controller, Get, Query, UseGuards, Request, Post, Body } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '@presentation/guards/jwt-auth.guard';
import { ClientsService } from './clients.service';
import { CreateClientDto } from '@/presentation/dtos';

@ApiTags('Clients')
@Controller('clients')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ClientsController {
  constructor(private readonly clientService: ClientsService) {}

  @Get()
  @ApiQuery({ name: 'userId', required: false, type: String })
  async findAll(@Query('userId') userId?: string, @Request() req?) {
    return this.clientService.findAll(req.user, userId);
  }

  @Post()
  async create(@Body() createClientDto: CreateClientDto, @Request() req) {
    try {
      if (req.user.role !== 'admin') {
        throw new Error('You are not authorized to create a client');
      }

      const domainDto = CreateClientDto.toDomain(createClientDto, req.user.id);
      return await this.clientService.create(domainDto);
    } catch (error) {
      throw new Error(error.message);
    }
  }
}
