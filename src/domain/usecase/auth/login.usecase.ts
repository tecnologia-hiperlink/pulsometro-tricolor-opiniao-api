import { AuthResponseDto, LoginDto } from '@/domain/dtos/auth.dto';

export abstract class ILoginUseCase {
  abstract execute(loginDto: LoginDto): Promise<AuthResponseDto>;
}
