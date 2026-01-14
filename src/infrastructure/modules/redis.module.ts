import { Module, Global } from '@nestjs/common';
import { RedisService } from '../services/redis.service';
import { HmacService } from '../services/hmac.service';
import { EmailNormalizationService } from '../services/email-normalization.service';

@Global()
@Module({
  providers: [RedisService, HmacService, EmailNormalizationService],
  exports: [RedisService, HmacService, EmailNormalizationService],
})
export class RedisModule {}
