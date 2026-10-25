import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateShiftDto {
  @ApiProperty({ description: 'Branch ID' })
  @IsUUID()
  branchId!: string;

  @ApiProperty({ description: 'Staff Assignment ID' })
  @IsUUID()
  staffAssignmentId!: string;

  @ApiProperty({ description: 'Shift label / title', example: 'Morning Floor Shift' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ description: 'Shift start timestamp', example: '2026-10-04T08:00:00Z' })
  @IsDateString()
  startTime!: string;

  @ApiProperty({ description: 'Shift end timestamp', example: '2026-10-04T16:00:00Z' })
  @IsDateString()
  endTime!: string;

  @ApiPropertyOptional({ description: 'Duration in minutes', example: 480 })
  @IsOptional()
  @IsInt()
  @Min(1)
  durationMin?: number;

  @ApiProperty({ description: 'Shift date (YYYY-MM-DD)', example: '2026-10-04' })
  @IsString()
  @IsNotEmpty()
  date!: string;

  @ApiPropertyOptional({ description: 'Shift notes or special instructions' })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiProperty({ description: 'Staff ID who created the shift' })
  @IsUUID()
  createdById!: string;
}

export class ClockInDto {
  @ApiPropertyOptional({ description: 'Clock-in timestamp (defaults to now)' })
  @IsOptional()
  @IsDateString()
  timestamp?: string;

  @ApiPropertyOptional({ description: 'Clock-in note' })
  @IsOptional()
  @IsString()
  note?: string;
}

export class ClockOutDto {
  @ApiPropertyOptional({ description: 'Clock-out timestamp (defaults to now)', example: '2026-10-04T16:00:00Z' })
  @IsOptional()
  @IsDateString()
  timestamp?: string;

  @ApiPropertyOptional({ description: 'Clock-out note', example: 'Covered floor table 12-18' })
  @IsOptional()
  @IsString()
  note?: string;
}

// ── Response DTOs ─────────────────────────────────────────────────────

export class WorkShiftResponseDto {
  @ApiProperty({ example: '11223344-5566-7788-99aa-bbccddeeff22', description: 'Work shift UUID' })
  id!: string;

  @ApiProperty({ example: 'ce7b4318-5e2e-4fcd-a459-0e1bc80a6f27', description: 'Branch UUID' })
  branchId!: string;

  @ApiProperty({ example: '778899aa-bbcc-ddee-ff00-112233445566', description: 'Staff Assignment UUID' })
  staffAssignmentId!: string;

  @ApiProperty({ example: 'Morning Floor Shift', description: 'Shift label' })
  name!: string;

  @ApiProperty({ example: '2026-10-04T08:00:00.000Z', description: 'Scheduled start time' })
  startTime!: Date;

  @ApiProperty({ example: '2026-10-04T16:00:00.000Z', description: 'Scheduled end time' })
  endTime!: Date;

  @ApiProperty({ example: 480, description: 'Shift duration in minutes' })
  durationMin!: number;

  @ApiProperty({ example: '2026-10-04', description: 'Shift calendar date (YYYY-MM-DD)' })
  date!: string;

  @ApiProperty({ example: 'ACTIVE', enum: ['ACTIVE', 'INACTIVE'], description: 'Shift status' })
  status!: string;

  @ApiPropertyOptional({ example: '2026-10-04T07:58:12.000Z', description: 'Actual clock-in timestamp' })
  checkInAt?: Date | null;

  @ApiPropertyOptional({ example: '2026-10-04T16:02:40.000Z', description: 'Actual clock-out timestamp' })
  checkOutAt?: Date | null;

  @ApiPropertyOptional({ example: 'Morning shift opening duties completed', description: 'Shift notes' })
  note?: string | null;

  @ApiProperty({ example: '00000001-0000-4000-8000-000000000001', description: 'Manager user UUID who created shift' })
  createdById!: string;

  @ApiProperty({ example: '2026-10-01T12:00:00.000Z', description: 'Record creation timestamp' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-10-04T16:02:40.000Z', description: 'Record update timestamp' })
  updatedAt!: Date;
}

