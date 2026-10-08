import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { RealtimeGateway } from './realtime.gateway';

@Global()
@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dev-secret-change-in-prod',
      signOptions: { expiresIn: '15m' as unknown as number },
    }),
  ],
  providers: [RealtimeGateway],
  exports: [RealtimeGateway, JwtModule],
})
export class RealtimeModule {}
