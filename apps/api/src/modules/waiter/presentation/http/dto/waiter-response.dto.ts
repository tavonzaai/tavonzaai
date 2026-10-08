// ============================================================================
// Waiter Response DTOs
// ============================================================================

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ── Table Assignment ──────────────────────────────────────────────────

export class TableAssignmentDto {
  @ApiProperty({ example: '778899aa-bbcc-ddee-ff00-112233445566', description: 'Table assignment UUID' })
  id!: string;

  @ApiProperty({ example: 'ce7b4318-5e2e-4fcd-a459-0e1bc80a6f27', description: 'Branch UUID' })
  branchId!: string;

  @ApiProperty({ example: '00000001-0000-4000-8000-000000000002', description: 'Assigned Waiter User UUID' })
  waiterId!: string;

  @ApiProperty({ example: '5298804e-5847-4e5a-bdba-73a8f06d9ed2', description: 'Assigned Table UUID' })
  tableId!: string;

  @ApiPropertyOptional({ example: 'Table 08', description: 'Table label' })
  tableNumber?: string;

  @ApiPropertyOptional({ example: 4, description: 'Table seating capacity' })
  capacity?: number;

  @ApiPropertyOptional({ example: 'OCCUPIED', description: 'Current table service status' })
  serviceStatus?: string;

  @ApiPropertyOptional({ example: '2026-10-08', description: 'Assigned shift date' })
  shiftDate?: string;

  @ApiProperty({ example: true, description: 'Whether assignment is currently active' })
  isActive!: boolean;

  @ApiPropertyOptional({ example: '2026-10-08T08:00:00.000Z', description: 'Assignment creation timestamp' })
  assignedAt?: Date;
}

// ── Order Summary (Waiter view) ───────────────────────────────────────

export class WaiterOrderItemDto {
  @ApiProperty({ example: '9988443e-1122-43bb-a123-f992a7a69004', description: 'Order line item UUID' })
  id!: string;

  @ApiProperty({ example: '4455110d-8720-41ab-bc92-d667c4c36001', description: 'Menu item UUID' })
  menuItemId!: string;

  @ApiProperty({ example: 'Tavonza Signature Burger', description: 'Item name' })
  name!: string;

  @ApiProperty({ example: 2, description: 'Quantity ordered' })
  quantity!: number;

  @ApiProperty({ example: 14.50, description: 'Unit price' })
  unitPrice!: number;

  @ApiPropertyOptional({ example: 'Extra crispy fries', description: 'Special instructions' })
  specialInstructions?: string | null;

  @ApiProperty({ example: 'PREPARING', description: 'Kitchen preparation status' })
  status!: string;
}

export class WaiterOrderSummaryDto {
  @ApiProperty({ example: '8877332f-4512-40bc-8012-d881e6e58003', description: 'Order UUID' })
  id!: string;

  @ApiProperty({ example: 'ORD-84920', description: 'Order number label' })
  orderNumber!: string;

  @ApiProperty({ example: '5298804e-5847-4e5a-bdba-73a8f06d9ed2', description: 'Table UUID' })
  tableId!: string;

  @ApiProperty({ example: '8877332f-4512-40bc-8012-d881e6e58003', description: 'Table session UUID' })
  tableSessionId!: string;

  @ApiProperty({ example: 'SUBMITTED', description: 'Lifecycle status' })
  status!: string;

  @ApiProperty({ example: '36.80', description: 'Total monetary bill' })
  total!: string;

  @ApiPropertyOptional({ example: null, description: 'Staff member UUID who placed order on behalf' })
  placedByWaiterId?: string | null;

  @ApiProperty({ example: false, description: 'True if guest profile was auto-provisioned' })
  customerAutoCreated!: boolean;

  @ApiPropertyOptional({ example: null, description: 'Reason if order was rejected' })
  rejectionReason?: string | null;

  @ApiProperty({ example: '2026-10-08T14:35:00.000Z', description: 'Submission timestamp' })
  submittedAt!: Date;

  @ApiPropertyOptional({ example: '2026-10-08T14:36:00.000Z', description: 'Acceptance timestamp' })
  acceptedAt?: Date | null;

  @ApiPropertyOptional({ example: null, description: 'Serving timestamp' })
  servedAt?: Date | null;
}

export class WaiterOrderDetailDto extends WaiterOrderSummaryDto {
  @ApiProperty({ type: [WaiterOrderItemDto], description: 'Line items in order' })
  items!: WaiterOrderItemDto[];
}

// ── Create Order Response ─────────────────────────────────────────────

export class CreateOrderOnBehalfResponseDto {
  @ApiProperty({ type: WaiterOrderSummaryDto, description: 'Created order summary' })
  order!: WaiterOrderSummaryDto;

  @ApiProperty({ example: true, description: 'True if a new customer account was auto-created' })
  customerAutoCreated!: boolean;

  @ApiProperty({ example: '11223344-5566-7788-99aa-bbccddeeff00', description: 'Customer UUID' })
  customerId!: string;
}

// ── Alert ─────────────────────────────────────────────────────────────

export class CustomerAlertDto {
  @ApiProperty({ example: 'aa112233-4455-6677-8899-00aabbccddee', description: 'Alert UUID' })
  id!: string;

  @ApiProperty({ example: 'ce7b4318-5e2e-4fcd-a459-0e1bc80a6f27', description: 'Branch UUID' })
  branchId!: string;

  @ApiProperty({ example: '5298804e-5847-4e5a-bdba-73a8f06d9ed2', description: 'Table UUID' })
  tableId!: string;

  @ApiProperty({ example: '8877332f-4512-40bc-8012-d881e6e58003', description: 'Table session UUID' })
  tableSessionId!: string;

  @ApiPropertyOptional({ example: '11223344-5566-7788-99aa-bbccddeeff00', description: 'Customer session UUID' })
  customerSessionId?: string | null;

  @ApiProperty({ enum: ['call_waiter', 'request_bill', 'need_help', 'custom'], example: 'call_waiter', description: 'Type of alert' })
  type!: string;

  @ApiPropertyOptional({ example: 'Customer requested extra napkins', description: 'Customer note or reason' })
  message?: string | null;

  @ApiProperty({ enum: ['pending', 'acknowledged', 'resolved'], example: 'pending', description: 'Resolution workflow status' })
  status!: string;

  @ApiPropertyOptional({ example: null, description: 'Staff member UUID who acknowledged the alert' })
  acknowledgedById?: string | null;

  @ApiPropertyOptional({ example: null, description: 'Acknowledgment timestamp' })
  acknowledgedAt?: Date | null;

  @ApiPropertyOptional({ example: null, description: 'Resolution timestamp' })
  resolvedAt?: Date | null;

  @ApiProperty({ example: '2026-10-08T14:38:00.000Z', description: 'Alert creation timestamp' })
  createdAt!: Date;
}

// ── Simple Message ─────────────────────────────────────────────────────

export class WaiterMessageDto {
  @ApiProperty({ example: 'Order accepted successfully and dispatched to kitchen', description: 'Action result message' })
  message!: string;
}
