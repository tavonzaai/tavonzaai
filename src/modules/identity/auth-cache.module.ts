import { Global, Module } from '@nestjs/common';
import { AuthCacheService } from './services/auth-cache.service';

@Global()
@Module({
  providers: [AuthCacheService],
  exports: [AuthCacheService],
})
export class AuthCacheModule {}

