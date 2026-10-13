// ============================================================================
// User Response DTOs
// ============================================================================

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CustomerProfileDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  userId!: string;

  @ApiPropertyOptional({ default: 0 })
  loyaltyPoints?: number;

  @ApiPropertyOptional({ type: 'object' })
  defaultAddress?: Record<string, any> | null;

  @ApiPropertyOptional()
  createdAt?: Date;

  @ApiPropertyOptional()
  updatedAt?: Date;
}

export class StaffAssignmentSummaryDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  branchId!: string;

  @ApiPropertyOptional()
  branchName?: string;

  @ApiProperty()
  role!: string;

  @ApiProperty({ type: [String] })
  permissions!: string[];

  @ApiProperty()
  isActive!: boolean;
}

export class UserDetailResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  name!: string;

  @ApiPropertyOptional()
  firstName?: string;

  @ApiPropertyOptional()
  lastName?: string;

  @ApiPropertyOptional()
  contactNo?: string | null;

  @ApiPropertyOptional({ description: 'Alias for contactNo for UI compatibility' })
  phone?: string | null;

  @ApiProperty({ example: 'CUSTOMER', description: 'Global role or effective role' })
  role!: string;

  @ApiPropertyOptional({ example: 'CUSTOMER' })
  globalRole?: string;

  @ApiProperty({ example: 'ACTIVE', enum: ['ACTIVE', 'INACTIVE', 'BANNED', 'DELETED'] })
  status!: string;

  @ApiPropertyOptional()
  avatar?: string | null;

  @ApiPropertyOptional()
  branchId?: string | null;

  @ApiPropertyOptional()
  branchName?: string | null;

  @ApiPropertyOptional()
  isEmailVerified?: boolean;

  @ApiPropertyOptional({ type: () => CustomerProfileDto })
  customer?: CustomerProfileDto | null;

  @ApiPropertyOptional({ type: () => [StaffAssignmentSummaryDto] })
  assignments?: StaffAssignmentSummaryDto[];

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  static fromRecord(user: any, customer?: any, assignments?: any[]): UserDetailResponseDto {
    const dto = new UserDetailResponseDto();
    dto.id = user.id;
    dto.email = user.email;
    dto.name = user.name || '';
    
    // Decompose name for clients expecting firstName / lastName
    const nameParts = (user.name || '').trim().split(' ');
    dto.firstName = nameParts[0] || '';
    dto.lastName = nameParts.slice(1).join(' ') || '';

    dto.contactNo = user.contactNo ?? null;
    dto.phone = user.contactNo ?? null;
    dto.role = user.role;
    dto.globalRole = user.role;
    dto.status = user.status || 'ACTIVE';
    dto.avatar = user.avatar ?? null;
    dto.isEmailVerified = user.isEmailVerified ?? false;
    dto.createdAt = user.createdAt;
    dto.updatedAt = user.updatedAt;

    if (customer || user.customer) {
      const c = customer || user.customer;
      dto.customer = {
        id: c.id,
        userId: c.userId,
        loyaltyPoints: c.loyaltyPoints ?? 0,
        defaultAddress: c.defaultAddress ?? null,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      };
    } else {
      dto.customer = null;
    }

    const assigned = assignments || user.assignments;
    if (Array.isArray(assigned)) {
      dto.assignments = assigned;
      const primary = assigned[0];
      if (primary) {
        dto.branchId = primary.branchId ?? null;
        dto.branchName = primary.branchName ?? null;
        dto.role = primary.role || user.role;
      }
    } else {
      dto.assignments = [];
      dto.branchId = null;
      dto.branchName = null;
    }

    return dto;
  }
}

export class UserPaginationMetaDto {
  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 10 })
  limit!: number;

  @ApiProperty({ example: 57 })
  total!: number;

  @ApiProperty({ example: 6 })
  totalPage!: number;
}

export class UsersListResponseDto {
  @ApiProperty({ type: [UserDetailResponseDto] })
  data!: UserDetailResponseDto[];

  @ApiProperty({ type: UserPaginationMetaDto })
  meta!: UserPaginationMetaDto;
}

export class MyAssignmentsResponseDto {
  @ApiPropertyOptional({ example: 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', nullable: true })
  staffId!: string | null;

  @ApiProperty({ type: () => [StaffAssignmentSummaryDto] })
  assignments!: StaffAssignmentSummaryDto[];
}

