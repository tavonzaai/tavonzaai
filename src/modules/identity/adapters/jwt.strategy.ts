// ============================================================================
// JWT Strategy — Passport JWT Guard for protected routes
// ============================================================================
// Accepts two principal kinds:
//   - `access` tokens for user accounts, bound to a revocable auth session
//   - `guest` tokens for diners seated through a table OTP, bound to their
//     guest session (invalid as soon as the guest or table session closes)
// Refresh tokens are never accepted here.
// ============================================================================

import { Injectable, UnauthorizedException, Optional } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import type { Permission, Scope } from '@/authorization';
import { DrizzleUserRepository } from '../repositories/drizzle-user.repository';
import { DrizzleAuthSessionRepository } from '../repositories/drizzle-auth-session.repository';
import { DrizzleGuestPrincipalRepository } from '../repositories/drizzle-guest-principal.repository';
import { TOKEN_TYPE, accessTokenSecret, isSessionUsable } from '../services/token-policy';
import { AuthCacheService } from '../services/auth-cache.service';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  globalRole?: string;
  branchId?: string | null;
  permissions?: Permission[];
  scopes?: Scope[];
  organizationId?: string | null;
  /** Auth session id (account tokens). */
  sid?: string;
  typ?: string;
  /** Guest principal claims (table OTP tokens). */
  guestSessionId?: string;
  tableSessionId?: string;
  tableId?: string;
  customerId?: string | null;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly userRepo: DrizzleUserRepository,
    private readonly sessionRepo: DrizzleAuthSessionRepository,
    private readonly guestRepo: DrizzleGuestPrincipalRepository,
    @Optional() private readonly authCache?: AuthCacheService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: accessTokenSecret(),
    });
  }

  async validate(payload: JwtPayload): Promise<JwtPayload> {
    if (!payload.sub) {
      throw new UnauthorizedException();
    }

    if (payload.typ === TOKEN_TYPE.GUEST) {
      const guest = payload.guestSessionId
        ? await this.guestRepo.findOpenGuestSession(payload.guestSessionId)
        : null;
      if (!guest || guest.guestSessionId !== payload.sub) {
        throw new UnauthorizedException('Your table session has ended. Please scan the table QR code again.');
      }
      return {
        ...payload,
        role: 'CUSTOMER',
        guestSessionId: guest.guestSessionId,
        tableSessionId: guest.tableSessionId,
        tableId: guest.tableId,
        branchId: guest.branchId,
        customerId: guest.customerId,
        permissions: [],
        scopes: [],
      };
    }

    if (payload.typ !== TOKEN_TYPE.ACCESS || !payload.sid) {
      throw new UnauthorizedException('Invalid access token');
    }

    // 1. Validate User Active status with Redis cache fallback
    let isUserActive = await this.authCache?.isUserActive(payload.sub);
    if (isUserActive === null || isUserActive === undefined) {
      const user = await this.userRepo.findById(payload.sub);
      isUserActive = !!user && user.status === 'ACTIVE';
      await this.authCache?.setUserActive(payload.sub, isUserActive);
    }

    if (!isUserActive) {
      throw new UnauthorizedException('Account is inactive or no longer valid');
    }

    // 2. Validate Session Usability with Redis cache fallback
    let sessionUsable = await this.authCache?.isSessionUsable(payload.sid);
    if (sessionUsable === null || sessionUsable === undefined) {
      const session = await this.sessionRepo.findSession(payload.sid);
      sessionUsable = isSessionUsable(session, payload.sub, new Date());
      await this.authCache?.setSessionUsable(payload.sid, sessionUsable);
    }

    if (!sessionUsable) {
      throw new UnauthorizedException('Session has ended. Please sign in again.');
    }

    return payload;
  }
}
