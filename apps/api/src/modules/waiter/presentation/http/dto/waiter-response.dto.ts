// ============================================================================
// Waiter Response DTOs
// ============================================================================

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ── Table Assignment ──────────────────────────────────────────────────

export class TableAssignmentDto {
  @ApiProperty() id!: string;
  @ApiProperty() branchId!: string;
  @ApiProperty() waiterId!: string;
  @ApiProperty() tableId!: string;
  @ApiPropertyOptional() tableNumber?: string;
  @ApiPropertyOptional() capacity?: number;
  @ApiPropertyOptional() serviceStatus?: string;
  @ApiPropertyOptional() shiftDate?: string;
  @ApiProperty() isActive!: boolean;
  @ApiPropertyOptional() assignedAt?: Date;
}

// ── Order Summary (Waiter view) ───────────────────────────────────────

export class WaiterOrderSummaryDto {
  @ApiProperty() id!: string;
  @ApiProperty() orderNumber!: string;
  @ApiProperty() tableId!: string;
  @ApiProperty() tableSessionId!: string;
  @ApiProperty() status!: string;
  @ApiProperty() total!: string;
  @ApiPropertyOptional() placedByWaiterId?: string | null;
  @ApiProperty() customerAutoCreated!: boolean;
  @ApiPropertyOptional() rejectionReason?: string | null;
  @ApiProperty() submittedAt!: Date;
  @ApiPropertyOptional() acceptedAt?: Date | null;
  @ApiPropertyOptional() servedAt?: Date | null;
}

export class WaiterOrderDetailDto extends WaiterOrderSummaryDto {
  @ApiProperty({ type: 'array' }) items!: any[];
}

// ── Create Order Response ─────────────────────────────────────────────

export class CreateOrderOnBehalfResponseDto {
  @ApiProperty() order!: WaiterOrderSummaryDto;
  @ApiProperty({ description: 'true if a new customer account was auto-created' })
  customerAutoCreated!: boolean;
  @ApiProperty() customerId!: string;
}

// ── Alert ─────────────────────────────────────────────────────────────

export class CustomerAlertDto {
  @ApiProperty() id!: string;
  @ApiProperty() branchId!: string;
  @ApiProperty() tableId!: string;
  @ApiProperty() tableSessionId!: string;
  @ApiPropertyOptional() customerSessionId?: string | null;
  @ApiProperty({ enum: ['call_waiter', 'request_bill', 'need_help', 'custom'] }) type!: string;
  @ApiPropertyOptional() message?: string | null;
  @ApiProperty({ enum: ['pending', 'acknowledged', 'resolved'] }) status!: string;
  @ApiPropertyOptional() acknowledgedById?: string | null;
  @ApiPropertyOptional() acknowledgedAt?: Date | null;
  @ApiPropertyOptional() resolvedAt?: Date | null;
  @ApiProperty() createdAt!: Date;
}

// ── Simple Message ─────────────────────────────────────────────────────

export class WaiterMessageDto {
  @ApiProperty() message!: string;
}
