import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import type {
  KitchenItemStatus,
  KitchenStationType,
} from '../../../domain/entities/kitchen-ticket.entity';

const KITCHEN_ITEM_STATUSES: KitchenItemStatus[] = [
  'PENDING',
  'PREPARING',
  'READY',
  'SERVED',
  'UNAVAILABLE',
  'CANCELLED',
];

const KITCHEN_STATIONS: KitchenStationType[] = ['KITCHEN', 'BAR'];

export class UpdateKitchenItemStatusDto {
  @ApiProperty({ enum: KITCHEN_ITEM_STATUSES, example: 'READY' })
  @IsEnum(KITCHEN_ITEM_STATUSES)
  status!: KitchenItemStatus;

  @ApiPropertyOptional({ description: 'Reason if item is marked UNAVAILABLE', example: 'Out of stock' })
  @IsOptional()
  @IsString()
  unavailableReason?: string;
}

export class ToggleItemAvailabilityDto {
  @ApiProperty({ description: 'Whether the menu item is available in real-time', example: false })
  @IsBoolean()
  isAvailable!: boolean;
}

export class KitchenQueryDto {
  @ApiPropertyOptional({ enum: KITCHEN_STATIONS, description: 'Filter tickets by station type' })
  @IsOptional()
  @IsEnum(KITCHEN_STATIONS)
  station?: KitchenStationType;
}
