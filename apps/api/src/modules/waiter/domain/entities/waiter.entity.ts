// ============================================================================
// Waiter Domain Entities
// ============================================================================

export type StaffStatus = 'active' | 'suspended' | 'offboarded';

export interface StaffProfile {
  id: string;
  userId: string;
  organizationId?: string;
  restaurantId?: string;
  employeeCode?: string | null;
  jobTitle?: string;
  status?: StaffStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface BranchStaffAssignment {
  id: string;
  branchId: string;
  staffId: string;
  staffProfileId?: string;
  assignedById?: string;
  role: string;
  permissions?: string[];
  isActive: boolean;
  assignedAt?: Date;
  revokedAt?: Date | null;
  createdAt: Date;
}

export interface WaiterTableAssignment {
  id: string;
  branchId: string;
  waiterId: string;
  tableId: string;
  assignedById: string;
  sessionStart: Date;
  sessionEnd: Date;
  shiftDate?: string;
  isActive: boolean;
  assignedAt?: Date;
  releasedAt?: Date | null;
  createdAt: Date;
}

// ── Alert ────────────────────────────────────────────────────────────

export type AlertType = 'call_waiter' | 'request_bill' | 'need_help' | 'custom';
export type AlertStatus = 'pending' | 'acknowledged' | 'resolved';

export const VALID_ALERT_TYPES: AlertType[] = [
  'call_waiter',
  'request_bill',
  'need_help',
  'custom',
];

export interface CustomerAlert {
  id: string;
  branchId: string;
  tableId: string;
  tableSessionId: string;
  customerSessionId?: string | null;
  type: AlertType;
  message?: string | null;
  status: AlertStatus;
  acknowledgedById?: string | null;
  acknowledgedAt?: Date | null;
  resolvedAt?: Date | null;
  createdAt: Date;
}

// ── Order (Waiter view) ───────────────────────────────────────────────

export const ORDER_STATUS = {
  DRAFT: 'DRAFT',
  SUBMITTED: 'SUBMITTED',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  KITCHEN_QUEUE: 'KITCHEN_QUEUE',
  PREPARING: 'PREPARING',
  READY: 'READY',
  SERVED: 'SERVED',
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

/** Valid waiter transitions from a given status */
export const WAITER_ALLOWED_TRANSITIONS: Partial<Record<OrderStatus, OrderStatus[]>> = {
  [ORDER_STATUS.SUBMITTED]: [ORDER_STATUS.ACCEPTED, ORDER_STATUS.REJECTED],
  [ORDER_STATUS.READY]: [ORDER_STATUS.SERVED],
};

export function canWaiterTransition(from: OrderStatus, to: OrderStatus): boolean {
  return WAITER_ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}
