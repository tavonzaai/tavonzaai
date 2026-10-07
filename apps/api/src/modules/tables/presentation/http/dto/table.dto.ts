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
  @ApiProperty() waiterId!: string;
  @ApiPropertyOptional() waiterName?: string;
  @ApiPropertyOptional() sessionStart?: Date;
  @ApiPropertyOptional() sessionEnd?: Date;
}

export class TableResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() branchId!: string;
  @ApiProperty() label!: string;
  @ApiProperty() capacity!: number;
  @ApiProperty() serviceStatus!: string;
  @ApiProperty() operationalFlag!: string;
  @ApiPropertyOptional() qrCodeToken?: string | null;
  @ApiProperty() shape!: string;
  @ApiProperty() floor!: number;
  @ApiPropertyOptional({ type: AssignedWaiterDto }) assignedWaiter?: AssignedWaiterDto | null;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
}

export class CreateReservationDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', description: 'Branch ID' })
  @IsUUID()
  @IsNotEmpty()
  branchId!: string;

  @ApiPropertyOptional({ description: 'Specific table ID if pre-assigned' })
  @IsOptional()
  @IsUUID()
  tableId?: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  guestName!: string;

  @ApiProperty({ example: '+1-555-0199' })
  @IsString()
  @IsNotEmpty()
  guestPhone!: string;

  @ApiProperty({ example: 4 })
  @IsInt()
  @Min(1)
  @Max(50)
  partySize!: number;

  @ApiProperty({ example: '2026-10-05T19:00:00.000Z' })
  @IsDateString()
  reservedFor!: string;

  @ApiPropertyOptional({ example: 90, default: 90 })
  @IsOptional()
  @IsInt()
  @Min(15)
  @Max(360)
  durationMins?: number;

  @ApiPropertyOptional({ example: 'Window seat preferred' })
  @IsOptional()
  @IsString()
  specialRequest?: string;
}

export class ReservationResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() branchId!: string;
  @ApiPropertyOptional() tableId?: string | null;
  @ApiProperty() guestName!: string;
  @ApiProperty() guestPhone!: string;
  @ApiProperty() partySize!: number;
  @ApiProperty() reservedFor!: Date;
  @ApiProperty() durationMins!: number;
  @ApiProperty() status!: string;
  @ApiPropertyOptional() specialRequest?: string | null;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
}
