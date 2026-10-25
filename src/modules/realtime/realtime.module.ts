import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { RealtimeGateway } from './realtime.gateway';
import { ACCESS_TOKEN_TTL_SECONDS, accessTokenSecret } from '../identity/services/token-policy';

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: accessTokenSecret(),
        signOptions: { expiresIn: ACCESS_TOKEN_TTL_SECONDS },
      }),
    }),
  ],
  providers: [RealtimeGateway],
  exports: [RealtimeGateway, JwtModule],
})
export class RealtimeModule {}
