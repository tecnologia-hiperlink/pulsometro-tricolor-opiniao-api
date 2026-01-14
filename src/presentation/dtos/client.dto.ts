import { IsString, IsOptional, IsBoolean, IsEmail, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  CreateClientDto as DomainCreateClientDto,
  UpdateClientDto as DomainUpdateClientDto,
} from '@/domain/dtos/client.dto';

export class CreateClientDto {
  @ApiProperty({ example: 'My Company' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'https://mycompany.com' })
  @IsString()
  domain: string;

  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  static toDomain(dto: CreateClientDto, createdBy: string): DomainCreateClientDto {
    return {
      createdBy,
      name: dto.name,
      domain: dto.domain,
      userEmail: dto.email,
      userPassword: dto.password,
      userId: '', // Será preenchido após criar o usuário
    };
  }
}

export class UpdateClientDto {
  @ApiProperty({ example: 'My Company', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'https://mycompany.com', required: false })
  @IsOptional()
  @IsString()
  domain?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  static toDomain(dto: UpdateClientDto): DomainUpdateClientDto {
    return {
      name: dto.name,
      domain: dto.domain,
      isActive: dto.isActive,
    };
  }
}
