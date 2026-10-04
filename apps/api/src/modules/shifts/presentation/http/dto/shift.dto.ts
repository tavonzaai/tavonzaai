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
  @ApiPropertyOptional({ description: 'Clock-out timestamp (defaults to now)' })
  @IsOptional()
  @IsDateString()
  timestamp?: string;

  @ApiPropertyOptional({ description: 'Clock-out note' })
  @IsOptional()
  @IsString()
  note?: string;
}
