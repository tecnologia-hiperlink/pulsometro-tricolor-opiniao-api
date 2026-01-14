import { Injectable } from '@nestjs/common';
import { AppError } from '../error';
import { IUserRepository } from '@/domain/repositories';
import { ILoginUseCase } from '@/domain/usecase/auth/login.usecase';
import { AuthResponseDto, LoginDto } from '@/domain/dtos/auth.dto';
import { IHashService } from '@/domain/services/hash.service';
import { ITokenService } from '@/domain/services/token.service';

@Injectable()
export class LoginUseCase implements ILoginUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly tokenService: ITokenService,
    private readonly hashService: IHashService,
  ) {}

  async execute(loginDto: LoginDto): Promise<AuthResponseDto> {
    try {
      const user = await this.userRepository.findByEmail(loginDto.email);
      if (!user) {
        throw new Error('Invalid credentials');
      }

      const isPasswordValid = await this.hashService.compare(loginDto.password, user.password);
      if (!isPasswordValid) {
        throw new Error('Invalid credentials');
      }

      if (!user.isActive) {
        throw new Error('User account is inactive');
      }

      // Verificar se o usuário tem um cliente associado
      if (!user.clients || user.clients.length === 0) {
        throw new Error('User does not have an associated client');
      }

      // Como 1 usuário só pode ter 1 cliente, pegar o primeiro
      const client = user.clients[0];

      const payload = {
        sub: user.id,
        email: user.email,
        role: user.role,
        clientId: client.id,
      };

      const { password, ...userWithoutPassword } = user;

      return {
        access_token: this.tokenService.createToken(payload),
        user: userWithoutPassword,
      };
    } catch (error) {
      throw new AppError(error.message || 'Error fetching clients', 500);
    }
  }
}
