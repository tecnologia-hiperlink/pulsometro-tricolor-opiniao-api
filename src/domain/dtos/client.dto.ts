export class ClientDto {
  id: string;
  name: string;
  domain: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class CreateClientDto {
  createdBy: string;
  name: string;
  domain: string;
  userId: string;
  userEmail: string;
  userPassword: string;
}

export class UpdateClientDto {
  name?: string;
  domain?: string;
  isActive?: boolean;
}
