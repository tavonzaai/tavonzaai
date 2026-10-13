import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  IsDateString,
} from 'class-validator';
import type {
  TableServiceStatus,
  TableOperationalFlag,
  TableShape,
  ReservationStatus,
} from '../../../domain/entities/table.entity';

const TABLE_SHAPES: TableShape[] = ['CIRCLE', 'SQUARE', 'RECTANGLE', 'TRIANGLE', 'HEXAGON'];

const TABLE_SERVICE_STATUSES: TableServiceStatus[] = [
  'AVAILABLE',
  'OCCUPIED',
  'ORDERING',
  'PREPARING',
  'SERVING',
  'PAYMENT_PENDING',
  'CLOSING',
];

const TABLE_OPERATIONAL_FLAGS: TableOperationalFlag[] = [
  'NORMAL',
  'RESERVED',
  'CLEANING',
  'OUT_OF_SERVICE',
];

export class CreateTableDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', description: 'Branch ID' })
  @IsUUID()
  @IsNotEmpty()
  branchId!: string;

  @ApiProperty({ example: 'T-12', description: 'Table label / display name' })
  @IsString()
  @IsNotEmpty()
  label!: string;

  @ApiProperty({ example: 4, description: 'Seating capacity' })
  @IsInt()
  @Min(1)
  @Max(100)
  capacity!: number;

  @ApiPropertyOptional({ enum: TABLE_SHAPES, default: 'SQUARE' })
  @IsOptional()
  @IsEnum(TABLE_SHAPES)
  shape?: TableShape;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  floor?: number;
}

export class UpdateTableDto {
  @ApiPropertyOptional({ example: 'T-12' })
  @IsOptional()
  @IsString()
  label?: string;

  @ApiPropertyOptional({ example: 6 })
  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number;

  @ApiPropertyOptional({ enum: TABLE_SERVICE_STATUSES })
  @IsOptional()
  @IsEnum(TABLE_SERVICE_STATUSES)
  serviceStatus?: TableServiceStatus;

  @ApiPropertyOptional({ enum: TABLE_OPERATIONAL_FLAGS })
  @IsOptional()
  @IsEnum(TABLE_OPERATIONAL_FLAGS)
  operationalFlag?: TableOperationalFlag;

  @ApiPropertyOptional({ enum: TABLE_SHAPES })
  @IsOptional()
  @IsEnum(TABLE_SHAPES)
  shape?: TableShape;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsInt()
  floor?: number;
}

export class AssignedWaiterDto {
  @ApiProperty({ example: '11223344-5566-7788-9900-aabbccddeeff', description: 'Assigned waiter staff UUID' })
  waiterId!: string;

  @ApiPropertyOptional({ example: 'Jane Waiter', description: 'Assigned waiter display name' })
  waiterName?: string;

  @ApiPropertyOptional({ example: '2026-10-08T12:00:00.000Z', description: 'Session assignment start timestamp' })
  sessionStart?: Date;

  @ApiPropertyOptional({ example: null, description: 'Session assignment completion timestamp' })
  sessionEnd?: Date;
}

export class TableResponseDto {
  @ApiProperty({ example: 'e7b1a2c3-d4e5-6789-0123-456789abcdef', description: 'Table UUID' })
  id!: string;

  @ApiProperty({ example: 'ce7b4318-5e2e-4fcd-a459-0e1bc80a6f27', description: 'Branch UUID' })
  branchId!: string;

  @ApiProperty({ example: 'T-12', description: 'Physical table identifier label' })
  label!: string;

  @ApiProperty({ example: 4, description: 'Seating capacity' })
  capacity!: number;

  @ApiProperty({
    enum: TABLE_SERVICE_STATUSES,
    example: 'AVAILABLE',
    description: 'Live table service lifecycle status'
  })
  serviceStatus!: string;

  @ApiProperty({
    enum: TABLE_OPERATIONAL_FLAGS,
    example: 'NORMAL',
    description: 'Operational flag indicating table readiness'
  })
  operationalFlag!: string;

  @ApiPropertyOptional({ example: 'qr_tok_live_998877665544332211', description: 'Opaque encrypted QR token' })
  qrCodeToken?: string | null;

  @ApiProperty({ enum: TABLE_SHAPES, example: 'SQUARE', description: 'Floor map table shape' })
  shape!: string;

  @ApiProperty({ example: 1, description: 'Floor / zone number' })
  floor!: number;

  @ApiPropertyOptional({ type: AssignedWaiterDto, description: 'Currently assigned floor waiter' })
  assignedWaiter?: AssignedWaiterDto | null;

  @ApiProperty({ example: '2026-10-01T12:00:00.000Z', description: 'Creation timestamp' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-10-08T14:30:00.000Z', description: 'Last state change timestamp' })
  updatedAt!: Date;
}

export class CreateReservationDto {
  @ApiProperty({ example: 'ce7b4318-5e2e-4fcd-a459-0e1bc80a6f27', description: 'Branch ID' })
  @IsUUID()
  @IsNotEmpty()
  branchId!: string;

  @ApiPropertyOptional({ example: 'e7b1a2c3-d4e5-6789-0123-456789abcdef', description: 'Specific table ID if pre-assigned' })
  @IsOptional()
  @IsUUID()
  tableId?: string;

  @ApiProperty({ example: 'John Doe', description: 'Guest name' })
  @IsString()
  @IsNotEmpty()
  guestName!: string;

  @ApiProperty({ example: '+1-555-0199', description: 'Guest contact phone' })
  @IsString()
  @IsNotEmpty()
  guestPhone!: string;

  @ApiProperty({ example: 4, description: 'Number of guests in party' })
  @IsInt()
  @Min(1)
  @Max(50)
  partySize!: number;

  @ApiProperty({ example: '2026-10-15T19:00:00.000Z', description: 'Reservation time in ISO 8601' })
  @IsDateString()
  reservedFor!: string;

  @ApiPropertyOptional({ example: 90, default: 90, description: 'Reservation duration in minutes' })
  @IsOptional()
  @IsInt()
  @Min(15)
  @Max(360)
  durationMins?: number;

  @ApiPropertyOptional({ example: 'Window seat preferred', description: 'Special guest requests' })
  @IsOptional()
  @IsString()
  specialRequest?: string;
}

export class UpdateReservationStatusDto {
  @ApiProperty({
    enum: ['PENDING', 'CONFIRMED', 'SEATED', 'CANCELLED', 'NO_SHOW'],
    example: 'CONFIRMED',
    description: 'Updated reservation status'
  })
  @IsEnum(['PENDING', 'CONFIRMED', 'SEATED', 'CANCELLED', 'NO_SHOW'])
  status!: ReservationStatus;
}

export class ReservationResponseDto {
  @ApiProperty({ example: 'fa01b2c3-d4e5-6789-0123-456789abcdef', description: 'Reservation UUID' })
  id!: string;

  @ApiProperty({ example: 'ce7b4318-5e2e-4fcd-a459-0e1bc80a6f27', description: 'Branch UUID' })
  branchId!: string;

  @ApiPropertyOptional({ example: 'e7b1a2c3-d4e5-6789-0123-456789abcdef', description: 'Pre-assigned Table UUID if any' })
  tableId?: string | null;

  @ApiProperty({ example: 'John Doe', description: 'Guest full name' })
  guestName!: string;

  @ApiProperty({ example: '+1-555-0199', description: 'Guest contact phone' })
  guestPhone!: string;

  @ApiProperty({ example: 4, description: 'Number of guests in the party' })
  partySize!: number;

  @ApiProperty({ example: '2026-10-15T19:00:00.000Z', description: 'Scheduled reservation datetime' })
  reservedFor!: Date;

  @ApiProperty({ example: 90, description: 'Allocated duration in minutes' })
  durationMins!: number;

  @ApiProperty({
    enum: ['PENDING', 'CONFIRMED', 'SEATED', 'CANCELLED', 'NO_SHOW'],
    example: 'CONFIRMED',
    description: 'Current reservation status'
  })
  status!: string;

  @ApiPropertyOptional({ example: 'Window seat preferred', description: 'Guest special dietary or seating request' })
  specialRequest?: string | null;

  @ApiProperty({ example: '2026-10-08T12:00:00.000Z', description: 'Reservation creation timestamp' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-10-08T12:00:00.000Z', description: 'Reservation update timestamp' })
  updatedAt!: Date;
}
