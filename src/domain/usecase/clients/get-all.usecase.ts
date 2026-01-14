import { IClient, IUser } from '@domain/entities';

export abstract class IGetAllClientsUseCase {
  abstract execute(currentUser: IUser, userId?: string): Promise<IClient[]>;
}
