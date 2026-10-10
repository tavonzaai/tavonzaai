// ============================================================================
// IdentityModule — Authentication & User Management
// ============================================================================

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { NotificationsModule } from '../notifications/notifications.module';
import { AuthService } from './application/services/auth.service';
import { UserService } from './application/services/user.service';
import { DrizzleUserRepository } from './infrastructure/persistence/drizzle-user.repository';
import { JwtStrategy } from './infrastructure/adapters/jwt.strategy';
import { AuthController } from './presentation/http/auth.controller';
import { UserController } from './presentation/http/user.controller';
import { MeController } from './presentation/http/me.controller';

@Module({
  imports: [
    NotificationsModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'dev-secret-change-in-prod',
      signOptions: { expiresIn: '15m' as unknown as number },
    }),
  ],
  controllers: [AuthController, UserController, MeController],
  providers: [AuthService, UserService, DrizzleUserRepository, JwtStrategy],
  exports: [AuthService, UserService, DrizzleUserRepository, JwtModule, PassportModule],
})
export class IdentityModule {}
