// ============================================================================
// Auth Request DTOs
// Figma screens: Login, Create Account, Verify OTP, New Password
// ============================================================================

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsIn } from 'class-validator';
import { AUTH_CLIENTS, type AuthClient } from '../../../domain/token-policy';

// ─── Register ─────────────────────────────────────────────────────────

export class RegisterDto {
  @ApiProperty({ example: 'John' })
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsString()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: '+85512345678', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: 'SecurePass123!' })
  @IsString()
  @IsNotEmpty()
  password!: string;
}

// ─── Login ────────────────────────────────────────────────────────────

export class LoginDto {
  @ApiProperty({ example: 'john@example.com', description: 'Email address or phone number' })
  @IsString()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: 'SecurePass123!' })
  @IsString()
  @IsNotEmpty()
  password!: string;

  @ApiPropertyOptional({
    enum: AUTH_CLIENTS,
    description: 'Browser app identifier. When set, the refresh token is issued as an HttpOnly cookie instead of in the response body.',
  })
  @IsOptional()
  @IsIn(AUTH_CLIENTS)
  client?: AuthClient;
}

// ─── Refresh Token ────────────────────────────────────────────────────

export class RefreshTokenDto {
  @ApiPropertyOptional({ description: 'Refresh token for non-browser clients. Browser apps send `client` and rely on the HttpOnly cookie.' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  refreshToken?: string;

  @ApiPropertyOptional({ enum: AUTH_CLIENTS })
  @IsOptional()
  @IsIn(AUTH_CLIENTS)
  client?: AuthClient;
}

// ─── Verify OTP (Email Verification, Phone Verification, Password Reset)
// Figma: 5-digit code sent to email or phone

export class VerifyOtpDto {
  @ApiProperty({ example: 'john@example.com', description: 'Email address or phone number' })
  @IsString()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: '48291', description: '5-digit verification code' })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiProperty({ enum: ['email_verification', 'phone_verification', 'password_reset'] })
  @IsIn(['email_verification', 'phone_verification', 'password_reset'])
  type!: 'email_verification' | 'phone_verification' | 'password_reset';
}

// ─── Forgot Password ──────────────────────────────────────────────────

export class ForgotPasswordDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsString()
  @IsNotEmpty()
  email!: string;
}

// ─── Reset Password ───────────────────────────────────────────────────
// Figma: "Create New Password" screen

export class ResetPasswordDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsString()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: '48291', description: '5-digit OTP from email' })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiProperty({ example: 'NewSecurePass123!' })
  @IsString()
  @IsNotEmpty()
  newPassword!: string;
}

// ─── Resend OTP ────────────────────────────────────────────────────────

export class ResendOtpDto {
  @ApiProperty({ example: 'john@example.com', description: 'User email address' })
  @IsString()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({
    enum: ['email_verification', 'phone_verification', 'password_reset'],
    example: 'email_verification',
    description: 'Type of OTP code to regenerate and resend',
  })
  @IsIn(['email_verification', 'phone_verification', 'password_reset'])
  type!: 'email_verification' | 'phone_verification' | 'password_reset';
}

// ─── Change Password ──────────────────────────────────────────────────

export class ChangePasswordDto {
  @ApiPropertyOptional({ example: 'CurrentPass123!' })
  @IsString()
  @IsOptional()
  oldPassword?: string;

  @ApiPropertyOptional({ example: 'CurrentPass123!' })
  @IsString()
  @IsOptional()
  currentPassword?: string;

  @ApiProperty({ example: 'NewSecurePass123!' })
  @IsString()
  @IsNotEmpty()
  newPassword!: string;
}

