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
import * as argon2 from 'argon2';
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
import type { AuthTokensDto, RegisterResponseDto } from '../../presentation/http/dto/auth-response.dto';
import { UserProfileDto } from '../../presentation/http/dto/auth-response.dto';

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

  async register(dto: RegisterDto): Promise<RegisterResponseDto> {
    const existing = await this.userRepo.findByEmail(dto.email.toLowerCase());
    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    this.validatePassword(dto.password);

    const passwordHash = await argon2.hash(dto.password);

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

    // Send OTP for email verification (logged to console until SES/SMTP is configured)
    await this.generateAndSendOtp(user.id, 'email_verification');

    return {
      message: 'Account created successfully. Please verify your email with the OTP code sent to your email.',
      email: user.email,
    };
  }

  // ── Login ──────────────────────────────────────────────────────────────
  // Figma: Log In screen

  async login(dto: LoginDto): Promise<AuthTokensDto> {
    const user = await this.userRepo.findByEmailOrPhone(dto.email);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordMatch = await argon2.verify(user.passwordHash, dto.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Must verify either email or phone number before logging in
    if (!user.isEmailVerified && !user.isPhoneVerified) {
      throw new UnauthorizedException(
        'Account is not verified. Please verify your email or phone number before logging in.',
      );
    }

    return this.issueTokens(user);
  }

  // ── Refresh Tokens ─────────────────────────────────────────────────────

  async refreshTokens(userId: string, refreshToken: string): Promise<AuthTokensDto> {
    const user = await this.userRepo.findById(userId);
    if (!user || !user.refreshToken || !user.isActive) {
      throw new UnauthorizedException('Access denied');
    }

    const tokenMatch = await argon2.verify(user.refreshToken, refreshToken);
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
  // Figma: Verify screen — 5-digit code sent to email or phone

  async verifyOtp(dto: VerifyOtpDto): Promise<void> {
    const user = await this.userRepo.findByEmailOrPhone(dto.email);
    if (!user) throw new NotFoundException('User not found');

    const otp = await this.userRepo.findValidOtp(user.id, dto.type);
    if (!otp) {
      throw new BadRequestException('OTP code is invalid or has expired');
    }

    const codeMatch = await argon2.verify(otp.code, dto.code);
    if (!codeMatch) {
      throw new BadRequestException('Incorrect verification code');
    }

    await this.userRepo.markOtpUsed(otp.id);

    if (dto.type === 'email_verification') {
      await this.userRepo.markEmailVerified(user.id);
    } else if (dto.type === 'phone_verification') {
      await this.userRepo.markPhoneVerified(user.id);
    }
  }

  // ── Forgot Password ────────────────────────────────────────────────────

  async forgotPassword(dto: ForgotPasswordDto): Promise<void> {
    const user = await this.userRepo.findByEmailOrPhone(dto.email);
    // Always return success to prevent enumeration
    if (!user) return;

    await this.generateAndSendOtp(user.id, 'password_reset');
  }

  // ── Reset Password ─────────────────────────────────────────────────────
  // Figma: New Pass screen

  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    const user = await this.userRepo.findByEmailOrPhone(dto.email);
    if (!user) throw new NotFoundException('User not found');

    const otp = await this.userRepo.findValidOtp(user.id, 'password_reset');
    if (!otp) {
      throw new BadRequestException('OTP code is invalid or has expired');
    }

    const codeMatch = await argon2.verify(otp.code, dto.code);
    if (!codeMatch) {
      throw new BadRequestException('Incorrect verification code');
    }

    this.validatePassword(dto.newPassword);

    await this.userRepo.markOtpUsed(otp.id);
    const newHash = await argon2.hash(dto.newPassword);
    await this.userRepo.updatePassword(user.id, newHash);

    // Invalidate all refresh tokens on password reset
    await this.userRepo.updateRefreshToken(user.id, null);
  }

  // ── Resend OTP ─────────────────────────────────────────────────────────
  // Figma: "Resend" countdown on Verify screen

  async resendOtp(
    identifier: string,
    type: 'email_verification' | 'phone_verification' | 'password_reset',
  ): Promise<void> {
    const user = await this.userRepo.findByEmailOrPhone(identifier);
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

    const hashedRefresh = await argon2.hash(refreshToken);
    await this.userRepo.updateRefreshToken(user.id, hashedRefresh);

    return {
      accessToken,
      refreshToken,
      user: UserProfileDto.fromEntity(user),
    };
  }

  private async generateAndSendOtp(
    userId: string,
    type: 'email_verification' | 'phone_verification' | 'password_reset',
  ): Promise<string> {
    // Generate 5-digit code (matches Figma Verify screen)
    const code = Math.floor(10000 + Math.random() * 90000).toString();
    const codeHash = await argon2.hash(code);
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
