// ============================================================================
// Role & Permission Management DTOs
// ============================================================================

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsArray, IsUUID, IsObject } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({ description: 'Display name of the role', example: 'Shift Supervisor' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ description: 'Unique slug identifier', example: 'shift-supervisor' })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiPropertyOptional({ description: 'Detailed role description', example: 'Oversees dining floor and shift staff' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Array of explicit permission keys',
    example: ['orders:read', 'orders:write', 'tables:read'],
    type: [String],
  })
  @IsArray()
  @IsOptional()
  permissionKeys?: string[];

  @ApiPropertyOptional({
    description: 'Permission matrix format grouped by module name and actions',
    example: {
      orders: { read: true, write: true, update: true, delete: false },
      tables: { read: true, write: false, update: true, delete: false },
    },
  })
  @IsObject()
  @IsOptional()
  matrix?: Record<string, Record<string, boolean>>;
}

export class UpdateRoleDto {
  @ApiPropertyOptional({ description: 'Display name of the role', example: 'Senior Shift Supervisor' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Unique slug identifier', example: 'senior-shift-supervisor' })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiPropertyOptional({ description: 'Detailed role description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Array of explicit permission keys',
    example: ['orders:read', 'orders:write', 'tables:read'],
    type: [String],
  })
  @IsArray()
  @IsOptional()
  permissionKeys?: string[];

  @ApiPropertyOptional({
    description: 'Permission matrix format grouped by module name and actions',
    example: {
      orders: { read: true, write: true, update: true, delete: false },
    },
  })
  @IsObject()
  @IsOptional()
  matrix?: Record<string, Record<string, boolean>>;
}

export class AssignUserRoleDto {
  @ApiProperty({
    description: 'Role UUID to assign to the user (enforces exactly 1 role per user)',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  @IsUUID()
  @IsNotEmpty()
  roleId!: string;
}

export class RoleResponseDto {
  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  id!: string;

  @ApiProperty({ example: 'Branch Manager' })
  name!: string;

  @ApiProperty({ example: 'branch-manager' })
  slug!: string;

  @ApiPropertyOptional({ example: 'Full branch operations manager' })
  description?: string | null;

  @ApiProperty({ example: true })
  isSystem!: boolean;

  @ApiProperty({ example: 4 })
  userCount!: number;

  @ApiProperty({ example: 28 })
  permissionCount!: number;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export class RoleDetailResponseDto extends RoleResponseDto {
  @ApiProperty({
    description: 'Matrix format representation for UI checkboxes: module_name -> action -> boolean',
    example: {
      orders: { read: true, write: true, update: true, delete: false },
      menu: { read: true, write: false, update: true, delete: false },
    },
  })
  matrix!: Record<string, Record<string, boolean | undefined>>;

  @ApiProperty({
    description: 'Normalized list of assigned permission keys',
    example: ['orders:read', 'orders:write', 'orders:update', 'menu:read'],
    type: [String],
  })
  permissions!: string[];
}
