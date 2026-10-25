// ============================================================================
// IdentityModule — Authentication & User Management
// ============================================================================

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { NotificationsModule } from '../notifications/notifications.module';
import { OrganizationsModule } from '../organizations/organizations.module';
import { AuthService } from './application/services/auth.service';
import { UserService } from './application/services/user.service';
import { CustomerPrincipalService } from './application/services/customer-principal.service';
import { DrizzleUserRepository } from './infrastructure/persistence/drizzle-user.repository';
import { DrizzleAuthSessionRepository } from './infrastructure/persistence/drizzle-auth-session.repository';
import { DrizzleGuestPrincipalRepository } from './infrastructure/persistence/drizzle-guest-principal.repository';
import { JwtStrategy } from './infrastructure/adapters/jwt.strategy';
import { AuthController } from './presentation/http/auth.controller';
import { UserController } from './presentation/http/user.controller';
import { MeController } from './presentation/http/me.controller';
import { ACCESS_TOKEN_TTL_SECONDS, accessTokenSecret } from './domain/token-policy';

@Module({
  imports: [
    NotificationsModule,
    OrganizationsModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: accessTokenSecret(),
        signOptions: { expiresIn: ACCESS_TOKEN_TTL_SECONDS },
      }),
    }),
  ],
  controllers: [AuthController, UserController, MeController],
  providers: [
    AuthService,
    UserService,
    CustomerPrincipalService,
    DrizzleUserRepository,
    DrizzleAuthSessionRepository,
    DrizzleGuestPrincipalRepository,
    JwtStrategy,
  ],
  exports: [
    AuthService,
    UserService,
    CustomerPrincipalService,
    DrizzleUserRepository,
    DrizzleAuthSessionRepository,
    DrizzleGuestPrincipalRepository,
    JwtModule,
    PassportModule,
  ],
})
export class IdentityModule {}
