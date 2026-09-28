// ============================================================================
// Auth Request DTOs
// Figma screens: Login, Create Account, Verify OTP, New Password
// ============================================================================

import { ApiProperty } from '@nestjs/swagger';

// ─── Register ─────────────────────────────────────────────────────────

export class RegisterDto {
  @ApiProperty({ example: 'John' })
  firstName!: string;

  @ApiProperty({ example: 'Doe' })
  lastName!: string;

  @ApiProperty({ example: 'john@example.com' })
  email!: string;

  @ApiProperty({ example: '+85512345678', required: false })
  phone?: string;

  @ApiProperty({ example: 'SecurePass123!' })
  password!: string;
}

// ─── Login ────────────────────────────────────────────────────────────

export class LoginDto {
  @ApiProperty({ example: 'john@example.com', description: 'Email address or phone number' })
  email!: string;

  @ApiProperty({ example: 'SecurePass123!' })
  password!: string;
}

// ─── Refresh Token ────────────────────────────────────────────────────

export class RefreshTokenDto {
  @ApiProperty()
  refreshToken!: string;
}

// ─── Verify OTP (Email Verification, Phone Verification, Password Reset)
// Figma: 5-digit code sent to email or phone

export class VerifyOtpDto {
  @ApiProperty({ example: 'john@example.com', description: 'Email address or phone number' })
  email!: string;

  @ApiProperty({ example: '48291', description: '5-digit verification code' })
  code!: string;

  @ApiProperty({ enum: ['email_verification', 'phone_verification', 'password_reset'] })
  type!: 'email_verification' | 'phone_verification' | 'password_reset';
}

// ─── Forgot Password ──────────────────────────────────────────────────

export class ForgotPasswordDto {
  @ApiProperty({ example: 'john@example.com' })
  email!: string;
}

// ─── Reset Password ───────────────────────────────────────────────────
// Figma: "Create New Password" screen

export class ResetPasswordDto {
  @ApiProperty({ example: 'john@example.com' })
  email!: string;

  @ApiProperty({ example: '48291', description: '5-digit OTP from email' })
  code!: string;

  @ApiProperty({ example: 'NewSecurePass123!' })
  newPassword!: string;
}
