import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { IHashService } from '@/domain/services/hash.service';

@Injectable()
export class BcryptHashService implements IHashService {
  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
