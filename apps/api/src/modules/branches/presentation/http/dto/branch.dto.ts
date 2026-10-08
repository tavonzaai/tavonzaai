import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class BranchAddressDto {
  @ApiProperty({ example: '123 Main Street' })
  @IsString()
  @IsNotEmpty()
  street!: string;

  @ApiProperty({ example: 'New York' })
  @IsString()
  @IsNotEmpty()
  city!: string;

  @ApiPropertyOptional({ example: 'NY' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({ example: '10001' })
  @IsOptional()
  @IsString()
  postalCode?: string;

  @ApiProperty({ example: 'USA' })
  @IsString()
  @IsNotEmpty()
  country!: string;
}

export class CreateBranchDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', description: 'Restaurant ID owning this branch' })
  @IsUUID()
  @IsNotEmpty()
  restaurantId!: string;

  @ApiProperty({ example: 'Downtown Branch' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ type: BranchAddressDto })
  @IsObject()
  @ValidateNested()
  @Type(() => BranchAddressDto)
  address!: BranchAddressDto;

  @ApiPropertyOptional({ example: '+1-555-0199' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'America/New_York', default: 'UTC' })
  @IsOptional()
  @IsString()
  timezone?: string;
}

export class UpdateBranchDto {
  @ApiPropertyOptional({ example: 'Downtown Branch & Patio' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ type: BranchAddressDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => BranchAddressDto)
  address?: BranchAddressDto;

  @ApiPropertyOptional({ example: '+1-555-0199' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'America/New_York' })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateBranchSettingsDto {
  @ApiPropertyOptional({ enum: ['AUTO_ACCEPT', 'WAITER_APPROVAL', 'MANAGER_APPROVAL'] })
  @IsOptional()
  @IsEnum(['AUTO_ACCEPT', 'WAITER_APPROVAL', 'MANAGER_APPROVAL'])
  orderAcceptanceMode?: 'AUTO_ACCEPT' | 'WAITER_APPROVAL' | 'MANAGER_APPROVAL';

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  hideUnavailableItems?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  allowMultipleGuestSessions?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  requireOtpPerGuest?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  allowSplitBill?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  allowGuestCheckoutWithoutAccount?: boolean;

  @ApiPropertyOptional({ example: 60 })
  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(720)
  autoCloseIdleSessionMins?: number;

  @ApiPropertyOptional({ example: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ example: 8.875 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  taxPercent?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  serviceChargePct?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  tipEnabled?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  reservationsEnabled?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  waitlistEnabled?: boolean;
}

export class OperatingHourSlotDto {
  @ApiProperty({ example: 1, description: 'Day of week: 0 (Sunday) to 6 (Saturday)' })
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek!: number;

  @ApiProperty({ example: '09:00', description: 'HH:mm' })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'openTime must be in HH:mm format' })
  openTime!: string;

  @ApiProperty({ example: '22:00', description: 'HH:mm' })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'closeTime must be in HH:mm format' })
  closeTime!: string;
}

export class SetOperatingHoursDto {
  @ApiProperty({ type: [OperatingHourSlotDto] })
  @ValidateNested({ each: true })
  @Type(() => OperatingHourSlotDto)
  hours!: OperatingHourSlotDto[];
}

export class CreateHolidayDto {
  @ApiProperty({ example: '2026-12-25', description: 'YYYY-MM-DD' })
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'date must be in YYYY-MM-DD format' })
  date!: string;

  @ApiPropertyOptional({ example: 'Christmas Day' })
  @IsOptional()
  @IsString()
  label?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isClosed?: boolean;

  @ApiPropertyOptional({ example: '10:00' })
  @IsOptional()
  @IsString()
  openTime?: string;

  @ApiPropertyOptional({ example: '16:00' })
  @IsOptional()
  @IsString()
  closeTime?: string;
}

export class BranchResponseDto {
  @ApiProperty({ example: 'ce7b4318-5e2e-4fcd-a459-0e1bc80a6f27', description: 'Branch UUID' })
  id!: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', description: 'Restaurant ID owning this branch' })
  restaurantId!: string;

  @ApiProperty({ example: 'Downtown Branch', description: 'Branch display name' })
  name!: string;

  @ApiProperty({ type: BranchAddressDto, description: 'Physical address object' })
  address!: BranchAddressDto;

  @ApiPropertyOptional({ example: '+1-555-0199', description: 'Branch contact telephone' })
  phone?: string | null;

  @ApiProperty({ example: 'America/New_York', description: 'IANA Timezone' })
  timezone!: string;

  @ApiProperty({ example: true, description: 'Whether the branch is active' })
  isActive!: boolean;

  @ApiProperty({ example: '2026-10-01T12:00:00.000Z', description: 'Branch creation timestamp' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-10-01T12:00:00.000Z', description: 'Branch last update timestamp' })
  updatedAt!: Date;
}

export class BranchSettingsResponseDto {
  @ApiProperty({ example: 'ee112233-4455-6677-8899-aabbccddeeff', description: 'Settings ID' })
  id!: string;

  @ApiProperty({ example: 'ce7b4318-5e2e-4fcd-a459-0e1bc80a6f27', description: 'Branch UUID' })
  branchId!: string;

  @ApiProperty({ example: 'AUTO_ACCEPT', enum: ['AUTO_ACCEPT', 'WAITER_APPROVAL', 'MANAGER_APPROVAL'], description: 'Order workflow acceptance policy' })
  orderAcceptanceMode!: 'AUTO_ACCEPT' | 'WAITER_APPROVAL' | 'MANAGER_APPROVAL';

  @ApiProperty({ example: false, description: 'Hide out-of-stock items from customer digital menu' })
  hideUnavailableItems!: boolean;

  @ApiProperty({ example: true, description: 'Allow multiple guests to join the same table session' })
  allowMultipleGuestSessions!: boolean;

  @ApiProperty({ example: true, description: 'Require SMS or table OTP code per guest to join session' })
  requireOtpPerGuest!: boolean;

  @ApiProperty({ example: true, description: 'Enable split-bill payment calculation' })
  allowSplitBill!: boolean;

  @ApiProperty({ example: true, description: 'Allow guest checkout without requiring user account' })
  allowGuestCheckoutWithoutAccount!: boolean;

  @ApiProperty({ example: 60, description: 'Auto close idle sessions after N minutes' })
  autoCloseIdleSessionMins!: number;

  @ApiProperty({ example: 'USD', description: 'Branch default transaction currency' })
  currency!: string;

  @ApiProperty({ example: 8.875, description: 'Default sales tax percent' })
  taxPercent!: number;

  @ApiProperty({ example: 10, description: 'Default service charge percent' })
  serviceChargePct!: number;

  @ApiProperty({ example: true, description: 'Whether gratuity tips are enabled' })
  tipEnabled!: boolean;

  @ApiProperty({ example: true, description: 'Whether table reservations are enabled' })
  reservationsEnabled!: boolean;

  @ApiProperty({ example: true, description: 'Whether digital waitlist is enabled' })
  waitlistEnabled!: boolean;

  @ApiProperty({ example: '2026-10-01T12:00:00.000Z', description: 'Settings creation timestamp' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-10-01T12:00:00.000Z', description: 'Settings update timestamp' })
  updatedAt!: Date;
}

export class BranchOperatingHoursResponseDto {
  @ApiProperty({ example: '66778899-0011-2233-4455-667788990011', description: 'Operating hour record ID' })
  id!: string;

  @ApiProperty({ example: 'ce7b4318-5e2e-4fcd-a459-0e1bc80a6f27', description: 'Branch UUID' })
  branchId!: string;

  @ApiProperty({ example: 1, description: 'Day of week (0=Sunday ... 6=Saturday)' })
  dayOfWeek!: number;

  @ApiProperty({ example: '09:00', description: 'Opening time (HH:mm)' })
  openTime!: string;

  @ApiProperty({ example: '22:00', description: 'Closing time (HH:mm)' })
  closeTime!: string;

  @ApiProperty({ example: '2026-10-01T12:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-10-01T12:00:00.000Z' })
  updatedAt!: Date;
}

export class BranchHolidayResponseDto {
  @ApiProperty({ example: '77889900-1122-3344-5566-778899001122', description: 'Holiday record ID' })
  id!: string;

  @ApiProperty({ example: 'ce7b4318-5e2e-4fcd-a459-0e1bc80a6f27', description: 'Branch UUID' })
  branchId!: string;

  @ApiProperty({ example: '2026-12-25', description: 'Holiday date YYYY-MM-DD' })
  date!: string;

  @ApiPropertyOptional({ example: 'Christmas Day', description: 'Holiday label' })
  label?: string | null;

  @ApiProperty({ example: true, description: 'Whether branch is entirely closed on this date' })
  isClosed!: boolean;

  @ApiPropertyOptional({ example: '10:00', description: 'Special opening time HH:mm' })
  openTime?: string | null;

  @ApiPropertyOptional({ example: '16:00', description: 'Special closing time HH:mm' })
  closeTime?: string | null;

  @ApiProperty({ example: '2026-10-01T12:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-10-01T12:00:00.000Z' })
  updatedAt!: Date;
}

export class BranchStaffMemberResponseDto {
  @ApiProperty({ example: '88990011-2233-4455-6677-889900112233', description: 'Staff assignment ID' })
  id!: string;

  @ApiProperty({ example: '11223344-5566-7788-9900-aabbccddeeff', description: 'Staff member UUID' })
  staffId!: string;

  @ApiProperty({ example: 'ce7b4318-5e2e-4fcd-a459-0e1bc80a6f27', description: 'Branch UUID' })
  branchId!: string;

  @ApiProperty({ example: 'WAITER', description: 'Branch role assignment' })
  role!: string;

  @ApiProperty({ example: ['VIEW_ORDERS', 'UPDATE_ORDER_STATUS'], description: 'Assigned permissions' })
  permissions!: string[];

  @ApiProperty({ example: true, description: 'Active assignment status' })
  isActive!: boolean;

  @ApiProperty({ example: '2026-10-01T12:00:00.000Z', description: 'Assignment date' })
  assignedAt!: Date;

  @ApiProperty({ example: 'Jane Waiter', description: 'Staff user full name' })
  name!: string;

  @ApiProperty({ example: 'jane@restaurant.com', description: 'Staff user email' })
  email!: string;

  @ApiPropertyOptional({ example: '+1-555-1234', description: 'Staff telephone' })
  phone?: string | null;
}

export class AssignBranchStaffDto {
  @ApiProperty({ example: '11223344-5566-7788-9900-aabbccddeeff', description: 'Existing staff member UUID' })
  @IsUUID()
  @IsNotEmpty()
  staffId!: string;

  @ApiProperty({ example: 'WAITER', description: 'Branch role to assign' })
  @IsString()
  @IsNotEmpty()
  role!: string;

  @ApiPropertyOptional({ example: ['VIEW_ORDERS', 'UPDATE_ORDER_STATUS'], description: 'Explicit permissions granted' })
  @IsOptional()
  permissions?: string[];
}

export class CreateBranchStaffDto {
  @ApiProperty({ example: 'Jane Waiter' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'jane@restaurant.com' })
  @IsString()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: 'StaffPass123!' })
  @IsString()
  @IsNotEmpty()
  password!: string;

  @ApiPropertyOptional({ example: '+1-555-1234' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'WAITER' })
  @IsString()
  @IsNotEmpty()
  role!: string;

  @ApiPropertyOptional({ example: ['VIEW_ORDERS', 'UPDATE_ORDER_STATUS'] })
  @IsOptional()
  permissions?: string[];
}

export class UpdateBranchStaffDto {
  @ApiPropertyOptional({ example: 'WAITER' })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiPropertyOptional({ example: ['VIEW_ORDERS'] })
  @IsOptional()
  permissions?: string[];

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class QueryBranchDto {
  @ApiPropertyOptional({ description: 'Filter by restaurant UUID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @IsOptional()
  @IsUUID()
  restaurantId?: string;

  @ApiPropertyOptional({ description: 'Search term for branch name or phone', example: 'Downtown' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ default: 1, example: 1 })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ default: 10, example: 10 })
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ default: 'createdAt', example: 'createdAt' })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc', example: 'desc' })
  @IsOptional()
  sortOrder?: 'asc' | 'desc';

  @ApiPropertyOptional({ default: false, example: false, description: 'Whether to include soft-deleted records' })
  @IsOptional()
  includeDeleted?: boolean;
}

