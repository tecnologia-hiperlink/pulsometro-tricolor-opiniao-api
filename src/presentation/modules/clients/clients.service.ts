import { Injectable } from '@nestjs/common';
import { IGetAllClientsUseCase } from '@/domain/usecase/clients/get-all.usecase';
import { IClient, IUser } from '@/domain/entities';
import { ICreateClientUseCase } from '@/domain/usecase/clients/create.usecase';
import { CreateClientDto } from '@/domain/dtos/client.dto';

@Injectable()
export class ClientsService {
  constructor(
    private readonly getAllClientsUseCase: IGetAllClientsUseCase,
    private readonly createClientUseCase: ICreateClientUseCase,
  ) {}

  async findAll(currentUser: IUser, userId?: string): Promise<IClient[]> {
    return this.getAllClientsUseCase.execute(currentUser, userId);
  }

  async create(createClientDto: CreateClientDto): Promise<IClient> {
    return this.createClientUseCase.execute(createClientDto);
  }
}
