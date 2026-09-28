// ============================================================================
// Auth Service — Core Authentication Logic
// ============================================================================
//
// Handles:
//   - register (Create Account screen)
//   - login (Log In screen)
//   - refresh token rotation
//   - logout
//   - email OTP verification (Verify screen — 5-digit code)
//   - forgot password & reset password (New Pass screen)
// ============================================================================

import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { RoleLabel, ScopeType, resolvePermissions } from '@tavonza/authorization';
import { DrizzleUserRepository } from '../../infrastructure/persistence/drizzle-user.repository';
import type { User } from '../../domain/entities/user.entity';
import type {
  RegisterDto,
  LoginDto,
  VerifyOtpDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from '../../presentation/http/dto/auth-request.dto';
import type { AuthTokensDto } from '../../presentation/http/dto/auth-response.dto';
import { UserProfileDto } from '../../presentation/http/dto/auth-response.dto';

const SALT_ROUNDS = 12;
const OTP_EXPIRY_MINUTES = 10;

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepo: DrizzleUserRepository,
    private readonly jwtService: JwtService,
  ) {}

  // ── Register ───────────────────────────────────────────────────────────
  // Figma: Create Account screen (Customer Ordering Experience)
  // Per .agent architecture: Public self-registration is EXCLUSIVELY for customers.
  // Staff/operators are provisioned through internal administration/staff assignment.

  async register(dto: RegisterDto): Promise<AuthTokensDto> {
    const existing = await this.userRepo.findByEmail(dto.email.toLowerCase());
    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    this.validatePassword(dto.password);

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);

    const user = await this.userRepo.create({
      email: dto.email.toLowerCase(),
      passwordHash,
      firstName: dto.firstName.trim(),
      lastName: dto.lastName.trim(),
      phone: dto.phone,
      role: RoleLabel.CUSTOMER,
      permissions: [],
      scopes: [{ type: ScopeType.SESSION }],
    });

    // Send OTP for email verification (fire-and-forget in production)
    await this.generateAndSendOtp(user.id, 'email_verification');

    return this.issueTokens(user);
  }

  // ── Login ──────────────────────────────────────────────────────────────
  // Figma: Log In screen

  async login(dto: LoginDto): Promise<AuthTokensDto> {
    const user = await this.userRepo.findByEmail(dto.email.toLowerCase());
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.issueTokens(user);
  }

  // ── Refresh Tokens ─────────────────────────────────────────────────────

  async refreshTokens(userId: string, refreshToken: string): Promise<AuthTokensDto> {
    const user = await this.userRepo.findById(userId);
    if (!user || !user.refreshToken || !user.isActive) {
      throw new UnauthorizedException('Access denied');
    }

    const tokenMatch = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!tokenMatch) {
      throw new UnauthorizedException('Access denied');
    }

    return this.issueTokens(user);
  }

  // ── Logout ─────────────────────────────────────────────────────────────

  async logout(userId: string): Promise<void> {
    await this.userRepo.updateRefreshToken(userId, null);
  }

  // ── Get Current User ───────────────────────────────────────────────────

  async getMe(userId: string): Promise<UserProfileDto> {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    return UserProfileDto.fromEntity(user);
  }

  // ── Verify OTP ─────────────────────────────────────────────────────────
  // Figma: Verify screen — 5-digit code sent to email

  async verifyOtp(dto: VerifyOtpDto): Promise<void> {
    const user = await this.userRepo.findByEmail(dto.email.toLowerCase());
    if (!user) throw new NotFoundException('User not found');

    const otp = await this.userRepo.findValidOtp(user.id, dto.type);
    if (!otp) {
      throw new BadRequestException('OTP code is invalid or has expired');
    }

    const codeMatch = await bcrypt.compare(dto.code, otp.code);
    if (!codeMatch) {
      throw new BadRequestException('Incorrect verification code');
    }

    await this.userRepo.markOtpUsed(otp.id);

    if (dto.type === 'email_verification') {
      await this.userRepo.markEmailVerified(user.id);
    }
  }

  // ── Forgot Password ────────────────────────────────────────────────────

  async forgotPassword(dto: ForgotPasswordDto): Promise<void> {
    const user = await this.userRepo.findByEmail(dto.email.toLowerCase());
    // Always return success to prevent email enumeration
    if (!user) return;

    await this.generateAndSendOtp(user.id, 'password_reset');
  }

  // ── Reset Password ─────────────────────────────────────────────────────
  // Figma: New Pass screen

  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    const user = await this.userRepo.findByEmail(dto.email.toLowerCase());
    if (!user) throw new NotFoundException('User not found');

    const otp = await this.userRepo.findValidOtp(user.id, 'password_reset');
    if (!otp) {
      throw new BadRequestException('OTP code is invalid or has expired');
    }

    const codeMatch = await bcrypt.compare(dto.code, otp.code);
    if (!codeMatch) {
      throw new BadRequestException('Incorrect verification code');
    }

    this.validatePassword(dto.newPassword);

    await this.userRepo.markOtpUsed(otp.id);
    const newHash = await bcrypt.hash(dto.newPassword, SALT_ROUNDS);
    await this.userRepo.updatePassword(user.id, newHash);

    // Invalidate all refresh tokens on password reset
    await this.userRepo.updateRefreshToken(user.id, null);
  }

  // ── Resend OTP ─────────────────────────────────────────────────────────
  // Figma: "Resend" countdown on Verify screen

  async resendOtp(email: string, type: 'email_verification' | 'password_reset'): Promise<void> {
    const user = await this.userRepo.findByEmail(email.toLowerCase());
    if (!user) return; // Prevent enumeration

    await this.generateAndSendOtp(user.id, type);
  }

  // ── Internal Helpers ───────────────────────────────────────────────────

  private async issueTokens(user: User): Promise<AuthTokensDto> {
    const permissions = resolvePermissions(user.role, user.permissions);
    const scopes = user.scopes ?? [];

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      permissions,
      scopes,
      organizationId: user.organizationId,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: (process.env.JWT_EXPIRATION ?? '15m') as unknown as number,
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: (process.env.REFRESH_TOKEN_EXPIRATION ?? '7d') as unknown as number,
      secret: process.env.JWT_REFRESH_SECRET ?? process.env.JWT_SECRET,
    });

    const hashedRefresh = await bcrypt.hash(refreshToken, SALT_ROUNDS);
    await this.userRepo.updateRefreshToken(user.id, hashedRefresh);

    return {
      accessToken,
      refreshToken,
      user: UserProfileDto.fromEntity(user),
    };
  }

  private async generateAndSendOtp(
    userId: string,
    type: 'email_verification' | 'password_reset',
  ): Promise<string> {
    // Generate 5-digit code (matches Figma Verify screen)
    const code = Math.floor(10000 + Math.random() * 90000).toString();
    const codeHash = await bcrypt.hash(code, SALT_ROUNDS);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await this.userRepo.createOtp({ userId, code: codeHash, type, expiresAt });

    // TODO: Wire up email service to send the OTP code
    // In development, log to console
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[DEV OTP] userId=${userId} type=${type} code=${code}`);
    }

    return code;
  }

  private validatePassword(password: string): void {
    // Figma: "Your password should be at least contain upper character"
    if (password.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters');
    }
    if (!/[A-Z]/.test(password)) {
      throw new BadRequestException('Password must contain at least one uppercase character');
    }
    if (!/[0-9]/.test(password)) {
      throw new BadRequestException('Password must contain at least one number');
    }
  }
}
