// ============================================================================
// Auth Response DTOs
// ============================================================================

import { ApiProperty } from '@nestjs/swagger';
import type { User } from '../../../domain/entities/user.entity';

// ─── User Profile ─────────────────────────────────────────────────────

export class UserProfileDto {
  @ApiProperty() id!: string;
  @ApiProperty() email!: string;
  @ApiProperty() firstName!: string;
  @ApiProperty() lastName!: string;
  @ApiProperty({ required: false }) phone?: string | null;
  @ApiProperty() role!: string;
  @ApiProperty({ required: false }) organizationId?: string | null;
  @ApiProperty() isEmailVerified!: boolean;
  @ApiProperty() createdAt!: Date;

  static fromEntity(user: User): UserProfileDto {
    const dto = new UserProfileDto();
    dto.id = user.id;
    dto.email = user.email;
    dto.firstName = user.firstName;
    dto.lastName = user.lastName;
    dto.phone = user.phone;
    dto.role = user.role;
    dto.organizationId = user.organizationId;
    dto.isEmailVerified = user.isEmailVerified;
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
}
