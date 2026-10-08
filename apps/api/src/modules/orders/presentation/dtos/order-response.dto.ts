// ============================================================================
// Order Presentation — Response DTOs
// ============================================================================

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Order } from '../../domain/entities/order.entity';
import { OrderItemProps } from '../../domain/entities/order.entity';

// ─── Order Add-on Response ────────────────────────────────────────────

export class OrderItemAddOnDto {
  @ApiProperty({ example: 'Extra Cheddar', description: 'Add-on name' })
  name!: string;

  @ApiProperty({ example: 1.50, description: 'Price delta' })
  price!: number;
}

// ─── Order Item Response ──────────────────────────────────────────────

export class OrderItemResponseDto {
  @ApiProperty({ example: '9988443e-1122-43bb-a123-f992a7a69004', description: 'Order line item UUID' })
  id!: string;

  @ApiProperty({ example: '4455110d-8720-41ab-bc92-d667c4c36001', description: 'Menu item UUID' })
  menuItemId!: string;

  @ApiProperty({ example: 'Tavonza Signature Burger', description: 'Snapshot item name' })
  name!: string;

  @ApiProperty({ example: 14.50, description: 'Unit price snapshot' })
  unitPrice!: number;

  @ApiProperty({ example: 2, description: 'Quantity ordered' })
  quantity!: number;

  @ApiPropertyOptional({ example: 'No pickles, extra sauce on side', description: 'Kitchen instructions' })
  specialInstructions!: string | null;

  @ApiProperty({ type: [OrderItemAddOnDto], description: 'Selected add-ons list' })
  addOns!: Array<{ name: string; price: number }>;

  @ApiProperty({ example: 3.00, description: 'Total price of all selected add-ons' })
  addOnsTotal!: number;

  @ApiProperty({ example: 32.00, description: 'Total line item cost ((unitPrice + addOnsTotal) * quantity)' })
  lineTotal!: number;

  static fromProps(props: OrderItemProps): OrderItemResponseDto {
    const dto = new OrderItemResponseDto();
    dto.id = props.id;
    dto.menuItemId = props.menuItemId;
    dto.name = props.name;
    dto.unitPrice = props.unitPrice;
    dto.quantity = props.quantity;
    dto.specialInstructions = props.specialInstructions;
    dto.addOns = props.addOns;
    dto.addOnsTotal = props.addOnsTotal;
    dto.lineTotal = props.lineTotal;
    return dto;
  }
}

// ─── Cart Response ────────────────────────────────────────────────────
// Figma: "Order Summary" screen showing items, subtotal, charges, total

export class CartResponseDto {
  @ApiProperty({ example: '8877332f-4512-40bc-8012-d881e6e58003', description: 'Order identifier' })
  id!: string;

  @ApiProperty({ example: '8877332f-4512-40bc-8012-d881e6e58003', description: 'Order UUID alias' })
  orderId!: string;

  @ApiProperty({ example: 'ORD-84920', description: 'Human-readable order display number' })
  orderNumber!: string;

  @ApiProperty({ example: 'ce7b4318-5e2e-4fcd-a459-0e1bc80a6f27', description: 'Branch UUID' })
  branchId!: string;

  @ApiProperty({ example: '5298804e-5847-4e5a-bdba-73a8f06d9ed2', description: 'Table UUID' })
  tableId!: string;

  @ApiProperty({ example: 'DRAFT', description: 'Current order state', enum: ['DRAFT', 'SUBMITTED', 'ACCEPTED', 'PREPARING', 'READY', 'SERVED', 'REJECTED', 'CANCELLED'] })
  status!: string;

  @ApiProperty({ type: [OrderItemResponseDto], description: 'Items in cart' })
  items!: OrderItemResponseDto[];

  @ApiProperty({ example: 32.00, description: 'Subtotal before taxes and service charges' })
  subtotal!: number;

  @ApiProperty({ example: 0.10, description: 'Service charge percentage rate (e.g. 0.10 = 10%)' })
  serviceChargeRate!: number;

  @ApiProperty({ example: 3.20, description: 'Calculated service charge amount' })
  serviceCharge!: number;

  @ApiProperty({ example: 0.05, description: 'Tax percentage rate (e.g. 0.05 = 5%)' })
  taxRate!: number;

  @ApiProperty({ example: 1.60, description: 'Calculated tax amount' })
  tax!: number;

  @ApiProperty({ example: 1.60, description: 'Alias for tax amount' })
  taxAmount!: number;

  @ApiProperty({ example: 36.80, description: 'Total payable amount including taxes and fees' })
  total!: number;

  @ApiProperty({ example: 36.80, description: 'Alias for total amount' })
  totalAmount!: number;

  @ApiProperty({ example: 2, description: 'Total quantity of items in the cart' })
  itemCount!: number;

  static fromEntity(entity: Order): CartResponseDto {
    const dto = new CartResponseDto();
    dto.id = entity.id;
    dto.orderId = entity.id;
    dto.orderNumber = entity.orderNumber;
    dto.branchId = entity.branchId;
    dto.tableId = entity.tableId ?? '';
    dto.status = entity.status;
    dto.items = entity.items.map(OrderItemResponseDto.fromProps);
    dto.subtotal = entity.subtotal;
    dto.serviceChargeRate = entity.serviceChargeRate;
    dto.serviceCharge = entity.serviceCharge;
    dto.taxRate = entity.taxRate;
    dto.tax = entity.tax;
    dto.taxAmount = entity.tax;
    dto.total = entity.total;
    dto.totalAmount = entity.total;
    dto.itemCount = entity.items.reduce((sum, i) => sum + i.quantity, 0);
    return dto;
  }
}

// ─── Order Tracking Timeline Step ─────────────────────────────────────

export class TrackingTimelineStepDto {
  @ApiProperty({ example: 'SUBMITTED', description: 'Lifecycle milestone identifier' })
  step!: string;

  @ApiProperty({ example: true, description: 'Whether this step has been completed' })
  completed!: boolean;

  @ApiProperty({ example: false, description: 'Whether this step is currently in progress' })
  active!: boolean;
}

// ─── Order Tracking Response ──────────────────────────────────────────
// Figma: "Track Your Order" screen with timeline

export class OrderTrackingResponseDto {
  @ApiProperty({ example: '8877332f-4512-40bc-8012-d881e6e58003', description: 'Order ID' })
  id!: string;

  @ApiProperty({ example: '8877332f-4512-40bc-8012-d881e6e58003', description: 'Order ID alias' })
  orderId!: string;

  @ApiProperty({ example: 'ORD-84920', description: 'Order number' })
  orderNumber!: string;

  @ApiProperty({ example: 'ce7b4318-5e2e-4fcd-a459-0e1bc80a6f27', description: 'Branch UUID' })
  branchId!: string;

  @ApiProperty({ example: '5298804e-5847-4e5a-bdba-73a8f06d9ed2', description: 'Table UUID' })
  tableId!: string;

  @ApiProperty({ example: 'PREPARING', description: 'Raw state machine status' })
  status!: string;

  @ApiProperty({ example: 'In the Kitchen', description: 'Customer friendly display status' })
  displayStatus!: string;

  @ApiPropertyOptional({ example: 15, description: 'Estimated remaining preparation time in minutes' })
  estimatedPrepTime!: number | null;

  @ApiProperty({ type: [TrackingTimelineStepDto], description: 'Detailed timeline progression steps' })
  timeline!: TrackingTimelineStepDto[];

  @ApiProperty({ type: [OrderItemResponseDto], description: 'List of order items' })
  items!: OrderItemResponseDto[];

  @ApiProperty({ example: 36.80, description: 'Order total amount' })
  total!: number;

  @ApiProperty({ example: 36.80, description: 'Alias for order total amount' })
  totalAmount!: number;

  @ApiPropertyOptional({ example: '2026-10-08T14:35:00.000Z', description: 'Submission timestamp' })
  submittedAt!: Date | null;

  @ApiPropertyOptional({ example: '2026-10-08T14:36:10.000Z', description: 'Staff acceptance timestamp' })
  acceptedAt!: Date | null;

  @ApiPropertyOptional({ example: null, description: 'Kitchen completion timestamp' })
  readyAt!: Date | null;

  @ApiPropertyOptional({ example: null, description: 'Service at table timestamp' })
  servedAt!: Date | null;

  static fromEntity(entity: Order): OrderTrackingResponseDto {
    const dto = new OrderTrackingResponseDto();
    dto.id = entity.id;
    dto.orderId = entity.id;
    dto.orderNumber = entity.orderNumber;
    dto.branchId = entity.branchId;
    dto.tableId = entity.tableId ?? '';
    dto.status = entity.status;
    dto.displayStatus = entity.displayStatus;
    dto.estimatedPrepTime = entity.estimatedPrepTime;
    dto.timeline = entity.trackingTimeline;
    dto.items = entity.items.map(OrderItemResponseDto.fromProps);
    dto.total = entity.total;
    dto.totalAmount = entity.total;
    dto.submittedAt = entity.submittedAt;
    dto.acceptedAt = entity.acceptedAt;
    dto.readyAt = entity.readyAt;
    dto.servedAt = entity.servedAt;
    return dto;
  }
}

// ─── Order List Response (Waiter) ─────────────────────────────────────
// Figma: Waiter Home / Orders tab — order cards

export class OrderListResponseDto {
  @ApiProperty({ example: '8877332f-4512-40bc-8012-d881e6e58003', description: 'Order identifier' })
  id!: string;

  @ApiProperty({ example: '8877332f-4512-40bc-8012-d881e6e58003', description: 'Order UUID alias' })
  orderId!: string;

  @ApiProperty({ example: 'ORD-84920', description: 'Human-readable order display number' })
  orderNumber!: string;

  @ApiProperty({ example: '5298804e-5847-4e5a-bdba-73a8f06d9ed2', description: 'Table UUID' })
  tableId!: string;

  @ApiProperty({ example: 'SUBMITTED', description: 'Status code' })
  status!: string;

  @ApiProperty({ example: 'Pending Approval', description: 'Display status string' })
  displayStatus!: string;

  @ApiProperty({ example: 3, description: 'Total item quantity' })
  itemCount!: number;

  @ApiProperty({ example: 45.00, description: 'Total bill amount' })
  total!: number;

  @ApiProperty({ example: 45.00, description: 'Total bill amount alias' })
  totalAmount!: number;

  @ApiPropertyOptional({ example: 20, description: 'Estimated preparation time in minutes' })
  estimatedPrepTime!: number | null;

  @ApiProperty({ type: [OrderItemResponseDto], description: 'Items in this order' })
  items!: OrderItemResponseDto[];

  @ApiProperty({ example: 'DINE_IN', description: 'Order dining type: DINE_IN or TAKEAWAY' })
  orderType!: string;

  @ApiProperty({ example: '2026-10-08T14:32:00.000Z', description: 'Draft creation timestamp' })
  createdAt!: Date;

  @ApiPropertyOptional({ example: '2026-10-08T14:35:00.000Z', description: 'Submission timestamp' })
  submittedAt!: Date | null;

  static fromEntity(entity: Order): OrderListResponseDto {
    const dto = new OrderListResponseDto();
    dto.id = entity.id;
    dto.orderId = entity.id;
    dto.orderNumber = entity.orderNumber;
    dto.tableId = entity.tableId;
    dto.status = entity.status;
    dto.displayStatus = entity.displayStatus;
    dto.itemCount = entity.items.reduce((sum, i) => sum + i.quantity, 0);
    dto.total = entity.total;
    dto.totalAmount = entity.total;
    dto.estimatedPrepTime = entity.estimatedPrepTime;
    dto.items = entity.items ? entity.items.map(OrderItemResponseDto.fromProps) : [];
    dto.orderType = (entity as any).orderType || 'DINE_IN';
    dto.createdAt = entity.createdAt;
    dto.submittedAt = entity.submittedAt;
    return dto;
  }
}

// ─── Full Order Detail Response (Waiter) ──────────────────────────────
// Figma: Waiter Table Details — expanded order view

export class OrderDetailResponseDto {
  @ApiProperty({ example: '8877332f-4512-40bc-8012-d881e6e58003', description: 'Order UUID' })
  orderId!: string;

  @ApiProperty({ example: 'ORD-84920', description: 'Order number' })
  orderNumber!: string;

  @ApiProperty({ example: 'ce7b4318-5e2e-4fcd-a459-0e1bc80a6f27', description: 'Branch UUID' })
  branchId!: string;

  @ApiProperty({ example: '5298804e-5847-4e5a-bdba-73a8f06d9ed2', description: 'Table UUID' })
  tableId!: string;

  @ApiProperty({ example: 'ACCEPTED', description: 'Order status code' })
  status!: string;

  @ApiProperty({ example: 'Accepted by Waiter', description: 'Display status string' })
  displayStatus!: string;

  @ApiProperty({ type: [OrderItemResponseDto], description: 'Detailed list of items with modifiers' })
  items!: OrderItemResponseDto[];

  @ApiProperty({ example: 40.00, description: 'Net subtotal' })
  subtotal!: number;

  @ApiProperty({ example: 4.00, description: 'Service charge' })
  serviceCharge!: number;

  @ApiProperty({ example: 2.00, description: 'Taxes' })
  tax!: number;

  @ApiProperty({ example: 46.00, description: 'Total charge' })
  total!: number;

  @ApiPropertyOptional({ example: 15, description: 'Estimated preparation time in minutes' })
  estimatedPrepTime!: number | null;

  @ApiProperty({ example: false, description: 'Whether the order can currently be modified' })
  isEditable!: boolean;

  @ApiProperty({ example: false, description: 'Whether the order has reached terminal state (SERVED/CANCELLED)' })
  isTerminal!: boolean;

  @ApiProperty({ example: '2026-10-08T14:30:00.000Z', description: 'Creation date' })
  createdAt!: Date;

  @ApiPropertyOptional({ example: '2026-10-08T14:35:00.000Z', description: 'Submission date' })
  submittedAt!: Date | null;

  @ApiPropertyOptional({ example: '2026-10-08T14:36:00.000Z', description: 'Acceptance date' })
  acceptedAt!: Date | null;

  @ApiPropertyOptional({ example: null, description: 'Ready date' })
  readyAt!: Date | null;

  @ApiPropertyOptional({ example: null, description: 'Served date' })
  servedAt!: Date | null;

  static fromEntity(entity: Order): OrderDetailResponseDto {
    const dto = new OrderDetailResponseDto();
    dto.orderId = entity.id;
    dto.orderNumber = entity.orderNumber;
    dto.branchId = entity.branchId;
    dto.tableId = entity.tableId;
    dto.status = entity.status;
    dto.displayStatus = entity.displayStatus;
    dto.items = entity.items.map(OrderItemResponseDto.fromProps);
    dto.subtotal = entity.subtotal;
    dto.serviceCharge = entity.serviceCharge;
    dto.tax = entity.tax;
    dto.total = entity.total;
    dto.estimatedPrepTime = entity.estimatedPrepTime;
    dto.isEditable = entity.isEditable;
    dto.isTerminal = entity.isTerminal;
    dto.createdAt = entity.createdAt;
    dto.submittedAt = entity.submittedAt;
    dto.acceptedAt = entity.acceptedAt;
    dto.readyAt = entity.readyAt;
    dto.servedAt = entity.servedAt;
    return dto;
  }
}
