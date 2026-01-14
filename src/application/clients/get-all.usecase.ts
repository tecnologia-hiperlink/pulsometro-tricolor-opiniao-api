import { AppError } from '../error';
import { IClient, IUser } from '@/domain/entities';
import { IClientRepository } from '@/domain/repositories';
import { IGetAllClientsUseCase } from '@/domain/usecase/clients/get-all.usecase';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GetAllClientsUseCase implements IGetAllClientsUseCase {
  constructor(private clientRepository: IClientRepository) {}

  async execute(currentUser: IUser, userId?: string): Promise<IClient[]> {
    try {
      // If not admin, filter by current user
      const filterUserId = currentUser.role === 'admin' ? userId : currentUser.id;
      return this.clientRepository.findAll(filterUserId);
    } catch (error) {
      throw new AppError(error.message || 'Error fetching clients', 500);
    }
  }
}
