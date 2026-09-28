// ============================================================================
// IdentityModule — Authentication & User Management
// ============================================================================

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './application/services/auth.service';
import { DrizzleUserRepository } from './infrastructure/persistence/drizzle-user.repository';
import { JwtStrategy } from './infrastructure/adapters/jwt.strategy';
import { AuthController } from './presentation/http/auth.controller';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'dev-secret-change-in-prod',
      signOptions: { expiresIn: '15m' as unknown as number },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, DrizzleUserRepository, JwtStrategy],
  exports: [AuthService, JwtModule, PassportModule],
})
export class IdentityModule {}
