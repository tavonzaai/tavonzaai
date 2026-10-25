// ============================================================================
// JWT Strategy — Passport JWT Guard for protected routes
// ============================================================================
// Accepts two principal kinds:
//   - `access` tokens for user accounts, bound to a revocable auth session
//   - `guest` tokens for diners seated through a table OTP, bound to their
//     guest session (invalid as soon as the guest or table session closes)
// Refresh tokens are never accepted here.
// ============================================================================

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import type { Permission, Scope } from '@/authorization';
import { DrizzleUserRepository } from '../persistence/drizzle-user.repository';
import { DrizzleAuthSessionRepository } from '../persistence/drizzle-auth-session.repository';
import { DrizzleGuestPrincipalRepository } from '../persistence/drizzle-guest-principal.repository';
import { TOKEN_TYPE, accessTokenSecret, isSessionUsable } from '../../domain/token-policy';

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

    const user = await this.userRepo.findById(payload.sub);
    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Account is inactive or no longer valid');
    }

    const session = await this.sessionRepo.findSession(payload.sid);
    if (!isSessionUsable(session, payload.sub, new Date())) {
      throw new UnauthorizedException('Session has ended. Please sign in again.');
    }

    return payload;
  }
}
