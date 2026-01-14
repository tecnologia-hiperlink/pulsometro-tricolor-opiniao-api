import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailNormalizationService {
  /**
   * Normaliza email: lower(trim(email))
   */
  normalize(email: string): string {
    return email.trim().toLowerCase();
  }

  /**
   * Extrai os 2 primeiros caracteres do email normalizado
   */
  getPrefix2(emailNormalized: string): string {
    return emailNormalized.substring(0, 2);
  }

  /**
   * Valida formato de email
   */
  isValid(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
