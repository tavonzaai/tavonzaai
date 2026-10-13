// ============================================================================
// Auth Response DTOs
// ============================================================================

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { resolvePermissions, type Permission, type Scope } from '@tavonza/authorization';
import type { User } from '../../../domain/entities/user.entity';

// ─── User Profile ─────────────────────────────────────────────────────

export class UserProfileDto {
  @ApiProperty({ example: 'f0e1d2c3-b4a5-6789-0123-456789abcdef', description: 'User UUID' })
  id!: string;

  @ApiProperty({ example: 'customer@example.com', description: 'User email' })
  email!: string;

  @ApiProperty({ example: 'John Doe', description: 'Full display name' })
  name!: string;

  @ApiPropertyOptional({ example: 'John', description: 'First name' })
  firstName?: string;

  @ApiPropertyOptional({ example: 'Doe', description: 'Last name' })
  lastName?: string;

  @ApiPropertyOptional({ example: '+1-555-0199', description: 'Contact phone' })
  phone?: string | null;

  @ApiProperty({ example: 'CUSTOMER', description: 'Global role label' })
  role!: string;

  @ApiPropertyOptional({ type: [String], example: ['CREATE_ORDER', 'VIEW_ORDER'], description: 'Resolved effective permissions' })
  permissions?: Permission[];

  @ApiPropertyOptional({ type: 'array', example: ['organization:a1b2c3d4'], description: 'Assigned authorization scopes' })
  scopes?: Scope[];

  @ApiPropertyOptional({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', description: 'Organization UUID if tenant-scoped' })
  organizationId?: string | null;

  @ApiProperty({ example: true, description: 'Email verification status' })
  isEmailVerified?: boolean;

  @ApiProperty({ example: true, description: 'Phone verification status' })
  isPhoneVerified?: boolean;

  @ApiProperty({ example: '2026-10-01T12:00:00.000Z', description: 'Account registration timestamp' })
  createdAt?: Date;

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
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMGUxZDJjMy0...z', description: 'Short-lived JWT access token (15m expiry)' })
  accessToken!: string;

  @ApiProperty({ example: 'd7a1c9e8-b2f3-4567-8901-234567abcdef', description: 'Long-lived refresh token (7d expiry)' })
  refreshToken!: string;

  @ApiProperty({ type: UserProfileDto, description: 'Authenticated user profile' })
  user!: UserProfileDto;
}

// ─── Simple Message ───────────────────────────────────────────────────

export class MessageResponseDto {
  @ApiProperty({ example: 'Action performed successfully', description: 'Status message' })
  message!: string;

  @ApiPropertyOptional({ example: '48291', description: 'Generated 5-digit OTP code (only displayed in development for easy Swagger testing)' })
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


