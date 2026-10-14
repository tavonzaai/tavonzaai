// ============================================================================
// JWT Strategy — Passport JWT Guard for protected routes
// ============================================================================

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import type { Permission, Scope } from '@tavonza/authorization';
import { DrizzleUserRepository } from '../persistence/drizzle-user.repository';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  globalRole?: string;
  branchId?: string | null;
  permissions?: Permission[];
  scopes?: Scope[];
  organizationId?: string | null;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly userRepo: DrizzleUserRepository) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'dev-secret-change-in-prod',
    });
  }

  async validate(payload: JwtPayload): Promise<JwtPayload> {
    if (!payload.sub) {
      throw new UnauthorizedException();
    }

    const user = await this.userRepo.findById(payload.sub);
    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Account is inactive or no longer valid');
    }

    return payload;
  }
}
