// ============================================================================
// Order Domain — Repository Interface (Port)
// ============================================================================
// Same pattern as the Menu repository interface.
// Defines WHAT the domain needs from persistence.
// ============================================================================

import { Order } from '../entities/order.entity';
import { OrderStatus } from '../enums/order-status.enum';

export const ORDER_REPOSITORY = Symbol('ORDER_REPOSITORY');

/** Input for creating a new draft order (cart). */
export interface CreateOrderInput {
  branchId: string;
  tableId: string;
  tableSessionId?: string;
  customerSessionId?: string;
}

/** Input for adding an item to a draft order. */
export interface AddOrderItemInput {
  orderId: string;
  menuItemId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  specialInstructions?: string;
  addOns?: Array<{ name: string; price: number }>;
}

/** Input for updating an existing order item. */
export interface UpdateOrderItemInput {
  quantity?: number;
  specialInstructions?: string;
}

export interface IOrderRepository {
  // ── CRUD ────────────────────────────────────────────────────────────

  /** Create a new order in DRAFT status (= new cart). */
  create(input: CreateOrderInput): Promise<Order>;

  /** Find an order by ID, including all items. */
  findById(id: string): Promise<Order | null>;

  /** Find the active DRAFT order for a table (= current cart). */
  findDraftByTable(branchId: string, tableId: string): Promise<Order | null>;

  /** Find orders by branch, optionally filtered by status. */
  findByBranch(
    branchId: string,
    filters?: { status?: OrderStatus; tableId?: string },
  ): Promise<Order[]>;

  // ── Items ───────────────────────────────────────────────────────────

  /** Add an item to an order and recalculate totals. */
  addItem(input: AddOrderItemInput): Promise<Order>;

  /** Update an item's quantity or special instructions. */
  updateItem(itemId: string, input: UpdateOrderItemInput): Promise<Order>;

  /** Remove an item from the order and recalculate totals. */
  removeItem(itemId: string): Promise<Order>;

  // ── Status Transitions ──────────────────────────────────────────────

  /** Update order status and record timestamps. */
  updateStatus(orderId: string, newStatus: OrderStatus): Promise<Order>;
}
