import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ITokenService } from '@/domain/services/token.service';

@Injectable()
export class JwtTokenService implements ITokenService {
  constructor(private readonly jwt: JwtService) {}

  createToken(payload: any): string {
    return this.jwt.sign(payload);
  }

  verifyToken(token: string): any {
    return this.jwt.verify(token);
  }
}
