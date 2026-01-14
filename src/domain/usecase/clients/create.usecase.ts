import { CreateClientDto } from '@/domain/dtos/client.dto';
import { IClient } from '@domain/entities';

export abstract class ICreateClientUseCase {
  abstract execute(createClientDto: CreateClientDto): Promise<IClient>;
}
