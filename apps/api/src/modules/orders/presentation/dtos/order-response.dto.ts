// ============================================================================
// Order Presentation — Response DTOs
// ============================================================================
// Response DTOs define the shape of data going OUT of the API.
// Separate DTOs for cart view, order detail, order list, and tracking.
// ============================================================================

import { Order } from '../../domain/entities/order.entity';
import { OrderItemProps } from '../../domain/entities/order.entity';

// ─── Order Item Response ──────────────────────────────────────────────

export class OrderItemResponseDto {
  id!: string;
  menuItemId!: string;
  name!: string;
  unitPrice!: number;
  quantity!: number;
  specialInstructions!: string | null;
  addOns!: Array<{ name: string; price: number }>;
  addOnsTotal!: number;
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
  orderId!: string;
  orderNumber!: string;
  items!: OrderItemResponseDto[];
  subtotal!: number;
  serviceChargeRate!: number;
  serviceCharge!: number;
  taxRate!: number;
  tax!: number;
  total!: number;
  itemCount!: number;

  static fromEntity(entity: Order): CartResponseDto {
    const dto = new CartResponseDto();
    dto.orderId = entity.id;
    dto.orderNumber = entity.orderNumber;
    dto.items = entity.items.map(OrderItemResponseDto.fromProps);
    dto.subtotal = entity.subtotal;
    dto.serviceChargeRate = entity.serviceChargeRate;
    dto.serviceCharge = entity.serviceCharge;
    dto.taxRate = entity.taxRate;
    dto.tax = entity.tax;
    dto.total = entity.total;
    dto.itemCount = entity.items.reduce((sum, i) => sum + i.quantity, 0);
    return dto;
  }
}

// ─── Order Tracking Response ──────────────────────────────────────────
// Figma: "Track Your Order" screen with timeline

export class OrderTrackingResponseDto {
  orderId!: string;
  orderNumber!: string;
  status!: string;
  displayStatus!: string;
  estimatedPrepTime!: number | null;
  timeline!: Array<{
    step: string;
    completed: boolean;
    active: boolean;
  }>;
  items!: OrderItemResponseDto[];
  total!: number;
  submittedAt!: Date | null;
  acceptedAt!: Date | null;
  readyAt!: Date | null;
  servedAt!: Date | null;

  static fromEntity(entity: Order): OrderTrackingResponseDto {
    const dto = new OrderTrackingResponseDto();
    dto.orderId = entity.id;
    dto.orderNumber = entity.orderNumber;
    dto.status = entity.status;
    dto.displayStatus = entity.displayStatus;
    dto.estimatedPrepTime = entity.estimatedPrepTime;
    dto.timeline = entity.trackingTimeline;
    dto.items = entity.items.map(OrderItemResponseDto.fromProps);
    dto.total = entity.total;
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
  orderId!: string;
  orderNumber!: string;
  tableId!: string;
  status!: string;
  displayStatus!: string;
  itemCount!: number;
  total!: number;
  estimatedPrepTime!: number | null;
  createdAt!: Date;
  submittedAt!: Date | null;

  static fromEntity(entity: Order): OrderListResponseDto {
    const dto = new OrderListResponseDto();
    dto.orderId = entity.id;
    dto.orderNumber = entity.orderNumber;
    dto.tableId = entity.tableId;
    dto.status = entity.status;
    dto.displayStatus = entity.displayStatus;
    dto.itemCount = entity.items.reduce((sum, i) => sum + i.quantity, 0);
    dto.total = entity.total;
    dto.estimatedPrepTime = entity.estimatedPrepTime;
    dto.createdAt = entity.createdAt;
    dto.submittedAt = entity.submittedAt;
    return dto;
  }
}

// ─── Full Order Detail Response (Waiter) ──────────────────────────────
// Figma: Waiter Table Details — expanded order view

export class OrderDetailResponseDto {
  orderId!: string;
  orderNumber!: string;
  branchId!: string;
  tableId!: string;
  status!: string;
  displayStatus!: string;
  items!: OrderItemResponseDto[];
  subtotal!: number;
  serviceCharge!: number;
  tax!: number;
  total!: number;
  estimatedPrepTime!: number | null;
  isEditable!: boolean;
  isTerminal!: boolean;
  createdAt!: Date;
  submittedAt!: Date | null;
  acceptedAt!: Date | null;
  readyAt!: Date | null;
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
