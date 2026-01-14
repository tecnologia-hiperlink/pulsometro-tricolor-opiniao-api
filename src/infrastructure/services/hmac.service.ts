import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class HmacService {
  private readonly pepper: string;

  constructor() {
    this.pepper = process.env.HMAC_PEPPER || 'default-pepper-change-in-production';
    if (!process.env.HMAC_PEPPER) {
      console.warn('⚠️  HMAC_PEPPER não configurado, usando valor padrão inseguro!');
    }
  }

  /**
   * Gera fingerprint global do email (para contacts)
   * HMAC(pepper, email_normalized)
   */
  generateGlobalFingerprint(emailNormalized: string): Buffer {
    const hmac = crypto.createHmac('sha256', this.pepper);
    hmac.update(emailNormalized);
    return hmac.digest();
  }

  /**
   * Gera fingerprint do email por enquete (para votes)
   * HMAC(pepper, poll_id:email_normalized)
   */
  generatePollFingerprint(pollId: number, emailNormalized: string): Buffer {
    const hmac = crypto.createHmac('sha256', this.pepper);
    hmac.update(`${pollId}:${emailNormalized}`);
    return hmac.digest();
  }

  /**
   * Compara dois fingerprints (Buffers)
   */
  compareFingerprints(fp1: Buffer, fp2: Buffer): boolean {
    return crypto.timingSafeEqual(fp1, fp2);
  }
}
