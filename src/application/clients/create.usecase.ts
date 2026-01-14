import { CreateClientDto } from '@/domain/dtos/client.dto';
import { AppError } from '../error';
import { IClient, UserRole } from '@/domain/entities';
import { IClientRepository, IUserRepository } from '@/domain/repositories';
import { ICreateClientUseCase } from '@/domain/usecase/clients/create.usecase';
import { IHashService } from '@/domain/services/hash.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CreateClientUseCase implements ICreateClientUseCase {
  constructor(
    private clientRepository: IClientRepository,
    private userRepository: IUserRepository,
    private hashService: IHashService,
  ) {}

  async execute(createClientDto: CreateClientDto): Promise<IClient> {
    try {
      // Verificar se o domínio já existe
      const existingClient = await this.clientRepository.findByDomain(createClientDto.domain);
      if (existingClient) {
        throw new Error('Client already exists with this domain');
      }

      // Verificar se o email já existe
      const existingUser = await this.userRepository.findByEmail(createClientDto.userEmail);
      if (existingUser) {
        throw new Error('User already exists with this email');
      }

      // Criar o usuário primeiro
      const hashedPassword = await this.hashService.hash(createClientDto.userPassword);
      const newUser = await this.userRepository.create({
        email: createClientDto.userEmail,
        password: hashedPassword,
        name: createClientDto.name, // Usar o nome do cliente como nome do usuário
        role: UserRole.USER,
        isActive: true,
      });

      // Criar o cliente associado ao usuário
      createClientDto.userId = newUser.id;
      return this.clientRepository.create(createClientDto);
    } catch (error) {
      throw new AppError(error.message || 'Error creating client', 500);
    }
  }
}
