// ============================================================================
// Order Domain — Order Entity
// ============================================================================
// Pure domain entity — no framework imports.
// Business logic (status validation, timeline, editability) lives here.
// ============================================================================

import {
  type OrderStatus,
  TERMINAL_STATUSES,
  canTransition,
  getDisplayLabel,
} from '../enums/order-status.enum';

// ─── OrderItem Value Object ───────────────────────────────────────────

export interface OrderItemAddOn {
  name: string;
  price: number;
}

export interface OrderItemProps {
  id: string;
  menuItemId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  specialInstructions: string | null;
  addOns: OrderItemAddOn[];
  addOnsTotal: number;
  lineTotal: number;
  estimatedPrepTime?: number | null;
}

// ─── Order Entity ─────────────────────────────────────────────────────

export interface OrderProps {
  id: string;
  orderNumber: string;
  branchId: string;
  tableId: string;
  tableLabel?: string | null;
  tableNumber?: string | null;
  tableSessionId: string | null;
  customerSessionId: string | null;
  status: OrderStatus;
  subtotal: number;
  serviceChargeRate: number;
  serviceCharge: number;
  taxRate: number;
  tax: number;
  total: number;
  estimatedPrepTime: number | null;
  items: OrderItemProps[];
  createdAt: Date;
  updatedAt: Date;
  submittedAt: Date | null;
  acceptedAt: Date | null;
  prepStartedAt?: Date | null;
  readyAt: Date | null;
  servedAt: Date | null;
  inventoryDeducted?: boolean;
  inventoryRestored?: boolean;
}

export class Order {
  readonly id: string;
  readonly orderNumber: string;
  readonly branchId: string;
  readonly tableId: string;
  readonly tableLabel: string | null;
  readonly tableNumber: string | null;
  readonly tableSessionId: string | null;
  readonly customerSessionId: string | null;
  readonly status: OrderStatus;
  readonly subtotal: number;
  readonly serviceChargeRate: number;
  readonly serviceCharge: number;
  readonly taxRate: number;
  readonly tax: number;
  readonly total: number;
  readonly estimatedPrepTime: number | null;
  readonly items: OrderItemProps[];
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly submittedAt: Date | null;
  readonly acceptedAt: Date | null;
  readonly prepStartedAt: Date | null;
  readonly readyAt: Date | null;
  readonly servedAt: Date | null;
  readonly inventoryDeducted: boolean;
  readonly inventoryRestored: boolean;

  constructor(props: OrderProps) {
    this.id = props.id;
    this.orderNumber = props.orderNumber;
    this.branchId = props.branchId;
    this.tableId = props.tableId;
    this.tableLabel = props.tableLabel ?? props.tableNumber ?? null;
    this.tableNumber = props.tableNumber ?? props.tableLabel ?? null;
    this.tableSessionId = props.tableSessionId;
    this.customerSessionId = props.customerSessionId;
    this.status = props.status;
    this.subtotal = props.subtotal;
    this.serviceChargeRate = props.serviceChargeRate;
    this.serviceCharge = props.serviceCharge;
    this.taxRate = props.taxRate;
    this.tax = props.tax;
    this.total = props.total;
    this.estimatedPrepTime = props.estimatedPrepTime;
    this.items = props.items;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.submittedAt = props.submittedAt;
    this.acceptedAt = props.acceptedAt;
    this.prepStartedAt = props.prepStartedAt ?? null;
    this.readyAt = props.readyAt;
    this.servedAt = props.servedAt;
    this.inventoryDeducted = props.inventoryDeducted ?? false;
    this.inventoryRestored = props.inventoryRestored ?? false;
  }

  // ── Domain Logic ──────────────────────────────────────────────────

  get isDraft(): boolean {
    return this.status === 'DRAFT';
  }

  get isEditable(): boolean {
    return this.status === 'DRAFT';
  }

  get isTerminal(): boolean {
    return TERMINAL_STATUSES.includes(this.status);
  }

  canTransitionTo(newStatus: OrderStatus): boolean {
    return canTransition(this.status, newStatus);
  }

  get displayStatus(): string {
    return getDisplayLabel(this.status);
  }

  /**
   * Tracking timeline for customer UI.
   *
   * Figma "Track Your Order" screen:
   *   ✅ Order Received (Completed)
   *   🔄 Preparing (In progress...)
   *   ⬜ Ready
   *   ⬜ Served
   */
  get trackingTimeline(): Array<{
    step: string;
    completed: boolean;
    active: boolean;
  }> {
    const statusOrder: OrderStatus[] = [
      'SUBMITTED',
      'PREPARING',
      'READY',
      'SERVED',
    ];

    const currentIndex = statusOrder.indexOf(this.status);

    return [
      { step: 'Order Received', completed: false, active: false },
      { step: 'Preparing', completed: false, active: false },
      { step: 'Ready', completed: false, active: false },
      { step: 'Served', completed: false, active: false },
    ].map((item, index) => ({
      ...item,
      completed: currentIndex > index,
      active: currentIndex === index,
    }));
  }
}
