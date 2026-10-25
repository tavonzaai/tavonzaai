import {
  Injectable,
  Logger,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  ServiceUnavailableException,
  Optional,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomInt, randomUUID } from 'node:crypto';
import * as argon2 from 'argon2';
import { GlobalRole, resolvePermissions, type Scope } from '@/authorization';
import { DrizzleUserRepository } from '../repositories/drizzle-user.repository';
import { DrizzleAuthSessionRepository } from '../repositories/drizzle-auth-session.repository';
import {
  ACCESS_TOKEN_TTL_SECONDS,
  REFRESH_TOKEN_TTL_SECONDS,
  TOKEN_TYPE,
  API_CLIENT,
  accessTokenSecret,
  refreshTokenSecret,
  evaluateRefreshToken,
} from './token-policy';
import { DrizzleRbacRepository } from '../../authorization/repositories/drizzle-rbac.repository';
import { DrizzleOrganizationRepository } from '../../organizations/repositories/drizzle-organization.repository';
import { MailService } from '../../notifications/services/mail.service';
import type {
  RegisterDto,
  LoginDto,
  VerifyOtpDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
} from '../dto/auth-request.dto';
import type {
  AuthTokensDto,
  RegisterResponseDto,
  UserProfileDto,
} from '../dto/auth-response.dto';

const OTP_EXPIRY_MINUTES = 10;

export interface SessionContext {
  client?: string;
  userAgent?: string | null;
  ipAddress?: string | null;
}

interface RefreshTokenClaims {
  sub: string;
  sid: string;
  jti: string;
  typ: string;
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userRepo: DrizzleUserRepository,
    private readonly orgRepo: DrizzleOrganizationRepository,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly sessionRepo: DrizzleAuthSessionRepository,
    @Optional() private readonly rbacRepo?: DrizzleRbacRepository,
  ) {}

  async register(dto: RegisterDto): Promise<RegisterResponseDto> {
    const existing = await this.userRepo.findByEmail(dto.email.toLowerCase());
    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    if (dto.phone) {
      const existingPhone = await this.userRepo.findByEmailOrPhone(dto.phone.trim());
      if (existingPhone) {
        throw new ConflictException('This phone number is already in use.');
      }
    }

    this.validatePassword(dto.password);
    const passwordHash = await argon2.hash(dto.password);

    const user = await this.userRepo.create({
      email: dto.email.toLowerCase(),
      passwordHash,
      name: `${dto.firstName.trim()} ${dto.lastName.trim()}`,
      contactNo: dto.phone,
      role: GlobalRole.CUSTOMER,
    });

    await this.generateAndSendOtp(
      user.email,
      'email_verification',
      dto.firstName.trim(),
    );

    return {
      message: 'Account created successfully. Please verify your email with the OTP code sent to your email.',
      email: user.email,
    };
  }

  async login(dto: LoginDto, context: SessionContext = {}): Promise<AuthTokensDto> {
    const user = await this.userRepo.findByEmailOrPhone(dto.email);
    if (!user || user.status !== 'ACTIVE' || !user.password) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordMatch = await argon2.verify(user.password, dto.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const sessionId = randomUUID();
    const refreshTokenId = randomUUID();
    const refreshToken = this.signRefreshToken(user.id, sessionId, refreshTokenId);
    await this.sessionRepo.createSessionWithToken({
      sessionId,
      userId: user.id,
      client: context.client ?? API_CLIENT,
      userAgent: context.userAgent,
      ipAddress: context.ipAddress,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000),
      refreshTokenId,
      tokenHash: hashToken(refreshToken),
    });

    return this.buildTokens(user, sessionId, refreshToken);
  }

  /**
   * Validates and rotates a refresh token. Replaying a rotated token outside
   * the grace window revokes the whole session (token theft).
   */
  async refreshTokens(refreshToken: string | undefined): Promise<AuthTokensDto> {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    const claims = this.verifyRefreshToken(refreshToken);
    const found = await this.sessionRepo.findRefreshToken(claims.jti);
    const decision = evaluateRefreshToken({
      record: found?.token ?? null,
      session: found?.session ?? null,
      subject: claims.sub,
      presentedHash: hashToken(refreshToken),
      now: new Date(),
    });

    if (decision.outcome === 'reuse') {
      await this.sessionRepo.revokeSession(claims.sid, 'REUSE_DETECTED');
      this.logger.warn(`Refresh token reuse detected; session ${claims.sid} revoked`);
      throw new UnauthorizedException('Session has been revoked. Please sign in again.');
    }
    if (decision.outcome === 'reject') {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.userRepo.findById(claims.sub);
    if (!user || user.status !== 'ACTIVE') {
      await this.sessionRepo.revokeSession(claims.sid, 'ACCOUNT_DISABLED');
      throw new UnauthorizedException('Account is inactive or no longer valid');
    }

    const newId = randomUUID();
    const nextRefreshToken = this.signRefreshToken(user.id, claims.sid, newId);
    const rotated = await this.sessionRepo.rotate({
      oldId: claims.jti,
      sessionId: claims.sid,
      newId,
      newHash: hashToken(nextRefreshToken),
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000),
    });
    if (!rotated) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    return this.buildTokens(user, claims.sid, nextRefreshToken);
  }

  /** Revokes the session identified by the refresh token or the access token's `sid`. */
  async logout(input: { refreshToken?: string; sessionId?: string; userId?: string }): Promise<void> {
    let sessionId = input.sessionId;
    if (!sessionId && input.refreshToken) {
      try {
        sessionId = this.verifyRefreshToken(input.refreshToken, { ignoreExpiration: true }).sid;
      } catch {
        sessionId = undefined;
      }
    }
    if (!sessionId) return;

    const session = await this.sessionRepo.findSession(sessionId);
    if (!session || (input.userId && session.userId !== input.userId)) return;
    await this.sessionRepo.revokeSession(sessionId, 'LOGOUT');
  }

  async changePassword(userId: string, dto: ChangePasswordDto, currentSessionId?: string): Promise<void> {
    const user = await this.userRepo.findById(userId);
    if (!user || !user.password) {
      throw new BadRequestException('User account not found or has no local password');
    }

    const currentPass = dto.currentPassword || dto.oldPassword;
    if (!currentPass) {
      throw new BadRequestException('Current password is required');
    }

    const match = await argon2.verify(user.password, currentPass);
    if (!match) {
      throw new BadRequestException('Current password does not match');
    }

    this.validatePassword(dto.newPassword);
    const newHash = await argon2.hash(dto.newPassword);
    await this.userRepo.updatePassword(user.id, newHash);
    await this.sessionRepo.revokeAllForUser(user.id, 'PASSWORD_CHANGED', currentSessionId);
  }

  async getMe(userId: string): Promise<UserProfileDto> {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const assignments = await this.userRepo.findStaffAssignments(user.id);
    const primaryAssignment = assignments[0];
    const effectiveRole = primaryAssignment?.role || user.role;
    const branchId = primaryAssignment?.branchId ?? null;
    const branchName = primaryAssignment?.branchName ?? null;
    const ownedOrgs = await this.orgRepo.findByOwnerId(user.id);
    const organizationId = ownedOrgs[0]?.id ?? null;

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: effectiveRole,
      globalRole: user.role,
      organizationId,
      branchId,
      branchName,
      assignments,
      phone: user.contactNo ?? null,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
    } as any;
  }

  async verifyOtp(dto: VerifyOtpDto): Promise<void> {
    if (dto.type === 'phone_verification') {
      throw new BadRequestException('Phone verification is not supported');
    }

    const email = dto.email.trim().toLowerCase();
    const otp = await this.userRepo.findValidAuthOtp(email, dto.type);
    if (!otp) throw new BadRequestException('OTP code is invalid or has expired');
    if (otp.otp !== dto.code) throw new BadRequestException('Incorrect verification code');

    if (dto.type === 'email_verification') {
      const consumed = await this.userRepo.consumeAuthOtp(email, dto.type, dto.code);
      if (!consumed) throw new BadRequestException('OTP code is invalid or has expired');
      await this.userRepo.markEmailVerified(email);
    }
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<void> {
    const user = await this.userRepo.findByEmailOrPhone(dto.email);
    if (!user) return;

    await this.generateAndSendOtp(
      user.email,
      'password_reset',
      user.name.split(' ')[0],
    );
  }

  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    const user = await this.userRepo.findByEmailOrPhone(dto.email);
    if (!user) throw new NotFoundException('User not found');

    const otp = await this.userRepo.findValidAuthOtp(user.email, 'password_reset');
    if (!otp) throw new BadRequestException('OTP code is invalid or has expired');
    if (otp.otp !== dto.code) throw new BadRequestException('Incorrect verification code');

    this.validatePassword(dto.newPassword);
    const newHash = await argon2.hash(dto.newPassword);
    const consumed = await this.userRepo.consumeAuthOtp(
      user.email,
      'password_reset',
      dto.code,
    );
    if (!consumed) throw new BadRequestException('OTP code is invalid or has expired');
    await this.userRepo.updatePassword(user.id, newHash);
    await this.sessionRepo.revokeAllForUser(user.id, 'PASSWORD_CHANGED');
  }

  async resendOtp(
    identifier: string,
    type: 'email_verification' | 'phone_verification' | 'password_reset',
  ): Promise<void> {
    if (type === 'phone_verification') {
      throw new BadRequestException('Phone verification is not supported');
    }
    const user = await this.userRepo.findByEmailOrPhone(identifier);
    if (!user) return;

    await this.generateAndSendOtp(
      user.email,
      type,
      user.name.split(' ')[0],
    );
  }

  private signRefreshToken(userId: string, sessionId: string, tokenId: string): string {
    return this.jwtService.sign(
      { sub: userId, sid: sessionId, typ: TOKEN_TYPE.REFRESH },
      {
        jwtid: tokenId,
        expiresIn: REFRESH_TOKEN_TTL_SECONDS,
        secret: refreshTokenSecret(),
      },
    );
  }

  private verifyRefreshToken(
    token: string,
    options: { ignoreExpiration?: boolean } = {},
  ): RefreshTokenClaims {
    let claims: Partial<RefreshTokenClaims>;
    try {
      claims = this.jwtService.verify(token, {
        secret: refreshTokenSecret(),
        ignoreExpiration: options.ignoreExpiration ?? false,
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
    if (claims.typ !== TOKEN_TYPE.REFRESH || !claims.sub || !claims.sid || !claims.jti) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
    return claims as RefreshTokenClaims;
  }

  private async buildTokens(user: any, sessionId: string, refreshToken: string): Promise<AuthTokensDto> {
    let effectiveRole = user.role;
    let effectivePermissions: string[] = [];

    // 1. Resolve dynamic database-backed role & permissions if assigned
    if (this.rbacRepo) {
      try {
        const dynamicRole = await this.rbacRepo.getUserRole(user.id);
        if (dynamicRole) {
          effectiveRole = dynamicRole.roleName.toUpperCase().replace(/\s+/g, '_');
          effectivePermissions = await this.rbacRepo.getUserPermissions(user.id);
        }
      } catch {
        // Fallback to legacy assignments on error
      }
    }

    // 2. Fallback to branch staff assignments and static role resolutions
    const assignments = await this.userRepo.findStaffAssignments(user.id);
    const primaryAssignment = assignments[0];
    if (!effectivePermissions || effectivePermissions.length === 0) {
      effectiveRole = primaryAssignment?.role || user.role;
      effectivePermissions = resolvePermissions(
        effectiveRole,
        (primaryAssignment?.permissions as any) ?? [],
      ) as string[];
    }

    const branchId = primaryAssignment?.branchId ?? null;
    const branchName = primaryAssignment?.branchName ?? null;
    const ownedOrgs = await this.orgRepo.findByOwnerId(user.id);
    const organizationId = ownedOrgs[0]?.id ?? null;

    const scopes: Scope[] = [];
    if (user.role === GlobalRole.SUPER_ADMIN) {
      scopes.push({ type: 'global' });
    }
    if (organizationId) {
      scopes.push({ type: 'organization', id: organizationId });
    }
    for (const assignment of assignments) {
      if (assignment?.isActive === false || !assignment?.branchId) {
        continue;
      }
      scopes.push({ type: 'branch', id: assignment.branchId });
    }

    const payload = {
      sub: user.id,
      sid: sessionId,
      typ: TOKEN_TYPE.ACCESS,
      email: user.email,
      role: effectiveRole,
      globalRole: user.role,
      organizationId,
      branchId,
      permissions: effectivePermissions,
      scopes,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: ACCESS_TOKEN_TTL_SECONDS,
      secret: accessTokenSecret(),
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: effectiveRole,
        globalRole: user.role,
        organizationId,
        branchId,
        branchName,
        assignments,
        permissions: effectivePermissions,
        scopes,
      } as any,
    };
  }

  private async generateAndSendOtp(
    email: string,
    type: 'email_verification' | 'phone_verification' | 'password_reset',
    firstName: string,
  ): Promise<string> {
    if (type === 'phone_verification') {
      throw new BadRequestException('Phone verification is not supported');
    }

    const code = randomInt(10000, 100000).toString();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await this.userRepo.createAuthOtp(email, code, type, expiresAt);

    const mailResult = type === 'password_reset'
      ? await this.mailService.sendPasswordResetCode(email, firstName, code)
      : await this.mailService.sendVerificationCode(email, firstName, code);

    if (!mailResult.success) {
      if (process.env.NODE_ENV !== 'production') {
        this.logger.warn(`Mail delivery failed in dev mode, but OTP was generated: ${code}`);
        return code;
      }
      await this.userRepo.deleteAuthOtp(email, type, code);
      throw new ServiceUnavailableException('Unable to send the OTP email. Please try again.');
    }

    return code;
  }

  private validatePassword(password: string): void {
    if (password.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters');
    }
  }
}
