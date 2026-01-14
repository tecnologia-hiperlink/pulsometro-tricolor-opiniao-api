import { AuthResponseDto, LoginDto } from '@/domain/dtos/auth.dto';
import { ILoginUseCase } from '@/domain/usecase/auth/login.usecase';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor(private readonly loginUseCase: ILoginUseCase) {}

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.loginUseCase.execute(loginDto);
  }
}
