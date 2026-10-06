// ============================================================================
// Auth Response DTOs
// ============================================================================

import { ApiProperty } from '@nestjs/swagger';
import { resolvePermissions, type Permission, type Scope } from '@tavonza/authorization';
import type { User } from '../../../domain/entities/user.entity';

// ─── User Profile ─────────────────────────────────────────────────────

export class UserProfileDto {
  @ApiProperty() id!: string;
  @ApiProperty() email!: string;
  @ApiProperty() name!: string;
  @ApiProperty({ required: false }) firstName?: string;
  @ApiProperty({ required: false }) lastName?: string;
  @ApiProperty({ required: false }) phone?: string | null;
  @ApiProperty({ example: 'CUSTOMER', description: 'Role label (convenience bundle)' }) role!: string;
  @ApiProperty({ type: [String], description: 'Effective capabilities/permissions', required: false }) permissions?: Permission[];
  @ApiProperty({ type: 'array', description: 'Assigned authorization scopes', required: false }) scopes?: Scope[];
  @ApiProperty({ required: false }) organizationId?: string | null;
  @ApiProperty({ required: false }) isEmailVerified?: boolean;
  @ApiProperty({ required: false }) isPhoneVerified?: boolean;
  @ApiProperty({ required: false }) createdAt?: Date;

  static fromEntity(user: User): UserProfileDto {
    const dto = new UserProfileDto();
    dto.id = user.id;
    dto.email = user.email;
    dto.name = (user as any).name ?? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
    dto.firstName = user.firstName;
    dto.lastName = user.lastName;
    dto.phone = user.phone;
    dto.role = user.role;
    dto.permissions = resolvePermissions(user.role, user.permissions);
    dto.scopes = user.scopes ?? [];
    dto.organizationId = user.organizationId;
    dto.isEmailVerified = user.isEmailVerified;
    dto.isPhoneVerified = user.isPhoneVerified;
    dto.createdAt = user.createdAt;
    return dto;
  }
}

// ─── Auth Tokens ──────────────────────────────────────────────────────

export class AuthTokensDto {
  @ApiProperty({ description: 'Short-lived JWT access token' })
  accessToken!: string;

  @ApiProperty({ description: 'Long-lived refresh token' })
  refreshToken!: string;

  @ApiProperty() user!: UserProfileDto;
}

// ─── Simple Message ───────────────────────────────────────────────────

export class MessageResponseDto {
  @ApiProperty() message!: string;

  @ApiProperty({ required: false, example: '48291', description: 'Generated 5-digit OTP code (only displayed in development for easy Swagger testing)' })
  devOtp?: string;
}

// ─── Register Response ────────────────────────────────────────────────

export class RegisterResponseDto {
  @ApiProperty({ example: 'Account created successfully. Please verify your email with the OTP code sent to your email.' })
  message!: string;

  @ApiProperty({ example: 'customer@example.com' })
  email!: string;

  @ApiProperty({ required: false, example: '48291', description: 'Generated 5-digit OTP code (only displayed in development for easy Swagger testing)' })
  devOtp?: string;
}


