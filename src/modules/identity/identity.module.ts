// ============================================================================
// IdentityModule — Authentication & User Management
// ============================================================================

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { NotificationsModule } from '../notifications/notifications.module';
import { OrganizationsModule } from '../organizations/organizations.module';
import { AuthService } from './services/auth.service';
import { UserService } from './services/user.service';
import { CustomerPrincipalService } from './services/customer-principal.service';
import { DrizzleUserRepository } from './repositories/drizzle-user.repository';
import { DrizzleAuthSessionRepository } from './repositories/drizzle-auth-session.repository';
import { DrizzleGuestPrincipalRepository } from './repositories/drizzle-guest-principal.repository';
import { JwtStrategy } from './adapters/jwt.strategy';
import { AuthController } from './controllers/auth.controller';
import { UserController } from './controllers/user.controller';
import { MeController } from './controllers/me.controller';
import { ACCESS_TOKEN_TTL_SECONDS, accessTokenSecret } from './services/token-policy';

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
