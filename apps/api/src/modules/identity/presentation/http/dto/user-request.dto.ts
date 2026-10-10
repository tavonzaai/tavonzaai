// ============================================================================
// User Request DTOs
// ============================================================================

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsInt,
  Min,
  Max,
  IsIn,
  IsObject,
} from 'class-validator';

// ─── Update Profile (Me) ──────────────────────────────────────────────────

export class UpdateUserProfileDto {
  @ApiPropertyOptional({ example: 'John Doe', description: 'Full name of user' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'John', description: 'First name' })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Doe', description: 'Last name' })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional({ example: '+1234567890', description: 'Contact phone number' })
  @IsString()
  @IsOptional()
  contactNo?: string;

  @ApiPropertyOptional({ example: '+1234567890', description: 'Alias for contactNo' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'https://cdn.tavonza.com/avatars/user.jpg', description: 'Avatar URL' })
  @IsString()
  @IsOptional()
  avatar?: string;

  @ApiPropertyOptional({ description: 'Firebase Cloud Messaging device token for push notifications' })
  @IsString()
  @IsOptional()
  fcmToken?: string;

  @ApiPropertyOptional({
    description: 'Default address (for customer accounts)',
    example: { street: '123 Main St', city: 'London', postalCode: 'W1A 1AA', country: 'UK' },
  })
  @IsObject()
  @IsOptional()
  defaultAddress?: Record<string, any>;
}

// ─── Get Users Query / Filter ─────────────────────────────────────────────

export class GetUsersFilterDto {
  @ApiPropertyOptional({ example: 1, default: 1, description: 'Page number (1-based)' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, default: 10, description: 'Items per page (max 100)' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 10;

  @ApiPropertyOptional({
    example: 'john',
    description: 'Search term matched across name, email, and contact number',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    example: 'CUSTOMER',
    description: 'Filter by global role (e.g. SUPER_ADMIN, ADMIN, STAFF, CUSTOMER)',
  })
  @IsString()
  @IsOptional()
  role?: string;

  @ApiPropertyOptional({
    example: 'ACTIVE',
    enum: ['ACTIVE', 'INACTIVE', 'BANNED', 'DELETED'],
    description: 'Filter by user status',
  })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({
    example: 'createdAt',
    enum: ['createdAt', 'name', 'email', 'updatedAt'],
    default: 'createdAt',
    description: 'Sort field',
  })
  @IsString()
  @IsOptional()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({
    example: 'desc',
    enum: ['asc', 'desc', 'ASC', 'DESC'],
    default: 'desc',
    description: 'Sort direction',
  })
  @IsIn(['asc', 'desc', 'ASC', 'DESC'])
  @IsOptional()
  sortOrder?: 'asc' | 'desc' = 'desc';
}

// ─── Update User Status ───────────────────────────────────────────────────

export class UpdateUserStatusDto {
  @ApiPropertyOptional({
    enum: ['ACTIVE', 'INACTIVE', 'BANNED', 'DELETED'],
    example: 'ACTIVE',
    description: 'New status for the user. If omitted in toggle endpoint, status toggles ACTIVE <-> INACTIVE',
  })
  @IsIn(['ACTIVE', 'INACTIVE', 'BANNED', 'DELETED'])
  @IsOptional()
  status?: string;
}

// ─── Create Customer User ─────────────────────────────────────────────────

export class CreateCustomerUserDto {
  @ApiProperty({ example: 'Alice Smith' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'alice@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: 'SecurePassword123!' })
  @IsString()
  @IsNotEmpty()
  password!: string;

  @ApiPropertyOptional({ example: '+447911123456' })
  @IsString()
  @IsOptional()
  contactNo?: string;

  @ApiPropertyOptional({ example: 'https://cdn.tavonza.com/avatars/alice.jpg' })
  @IsString()
  @IsOptional()
  avatar?: string;

  @ApiPropertyOptional({
    example: {
      loyaltyPoints: 0,
      defaultAddress: { street: '10 Downing St', city: 'London', country: 'UK' },
    },
  })
  @IsOptional()
  customer?: {
    loyaltyPoints?: number;
    defaultAddress?: Record<string, any>;
    preferences?: Record<string, any>;
  };
}

// ─── Create Admin User (SUPER_ADMIN only) ─────────────────────────────────

export class CreateAdminUserDto {
  @ApiProperty({ example: 'Admin User' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'admin@tavonza.com' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: 'AdminSuperSecret123!' })
  @IsString()
  @IsNotEmpty()
  password!: string;

  @ApiPropertyOptional({ example: '+447911654321' })
  @IsString()
  @IsOptional()
  contactNo?: string;

  @ApiPropertyOptional({ example: 'https://cdn.tavonza.com/avatars/admin.jpg' })
  @IsString()
  @IsOptional()
  avatar?: string;
}
