import { pgEnum } from 'drizzle-orm/pg-core';

// Role & Identity Enums
export const globalRoleEnum = pgEnum('global_role', [
  'SUPER_ADMIN',
  'ADMIN',
  'STAFF',
  'CUSTOMER'
]);

export const staffRoleEnum = pgEnum('staff_role', [
  'BRANCH_MANAGER',
  'HOST',
  'WAITER',
  'KITCHEN_STAFF',
  'BARTENDER',
  'CASHIER'
]);

export const userStatusEnum = pgEnum('user_status', [
  'ACTIVE',
  'INACTIVE',
  'BANNED',
  'DELETED'
]);

export const permissionActionEnum = pgEnum('permission_action', [
  'MANAGE_MENU',
  'MANAGE_TABLES',
  'MANAGE_STAFF',
  'MANAGE_RESERVATIONS',
  'VIEW_ORDERS',
  'UPDATE_ORDER_STATUS',
  'MANAGE_PAYMENTS',
  'APPLY_DISCOUNTS',
  'VIEW_REPORTS',
  'MANAGE_BRANCH_SETTINGS'
]);

// Table & Physical Space Enums
export const tableServiceStatusEnum = pgEnum('table_service_status', [
  'AVAILABLE',
  'OCCUPIED',
  'ORDERING',
  'PREPARING',
  'SERVING',
  'PAYMENT_PENDING',
  'CLOSING'
]);

export const tableOperationalFlagEnum = pgEnum('table_operational_flag', [
  'NORMAL',
  'RESERVED',
  'CLEANING',
  'OUT_OF_SERVICE'
]);

export const shapeEnum = pgEnum('table_shape', [
  'CIRCLE',
  'SQUARE',
  'RECTANGLE',
  'TRIANGLE',
  'HEXAGON'
]);

// Session Lifecycle Enums
export const tableSessionStatusEnum = pgEnum('table_session_status', [
  'ACTIVE',
  'BILL_REQUESTED',
  'CLOSING',
  'COMPLETED',
  'ABANDONED'
]);

export const guestSessionStatusEnum = pgEnum('guest_session_status', [
  'ACTIVE',
  'LEFT',
  'CLOSED'
]);

// Order & Production Enums
export const orderChannelEnum = pgEnum('order_channel', [
  'DINE_IN',
  'QR_SELF_ORDER',
  'POS',
  'SELF_SERVICE_KIOSK',
  'TAKEAWAY',
  'DELIVERY',
  'MOBILE_APP',
  'WEB'
]);

export const orderAcceptanceModeEnum = pgEnum('order_acceptance_mode', [
  'AUTO_ACCEPT',
  'WAITER_APPROVAL',
  'MANAGER_APPROVAL'
]);

export const orderRejectionReasonEnum = pgEnum('order_rejection_reason', [
  'ITEM_UNAVAILABLE',
  'KITCHEN_CAPACITY',
  'MODIFICATION_IMPOSSIBLE',
  'ALLERGY_CONCERN',
  'RESTAURANT_CLOSING',
  'OTHER'
]);

export const orderStatusEnum = pgEnum('order_status', [
  'DRAFT',
  'PENDING',
  'CONFIRMED',
  'PREPARING',
  'READY',
  'SERVED',
  'COMPLETED',
  'CANCELLED',
  'REJECTED'
]);

export const orderItemStatusEnum = pgEnum('order_item_status', [
  'PENDING',
  'PREPARING',
  'READY',
  'SERVED',
  'UNAVAILABLE',
  'CANCELLED'
]);

export const stationTypeEnum = pgEnum('station_type', [
  'KITCHEN',
  'BAR'
]);

// Payment & Financial Enums
export const paymentStatusEnum = pgEnum('payment_status', [
  'UNPAID',
  'PARTIALLY_PAID',
  'PAID',
  'REFUNDED',
  'FAILED'
]);

export const paymentMethodEnum = pgEnum('payment_method', [
  'CASH',
  'CARD',
  'MOBILE_WALLET',
  'ONLINE_GATEWAY'
]);

export const paymentScopeEnum = pgEnum('payment_scope', [
  'ORDER',
  'ORDER_ITEMS',
  'GUEST_SESSION',
  'TABLE_SESSION'
]);

export const discountTypeEnum = pgEnum('discount_type', [
  'PERCENTAGE',
  'FIXED_AMOUNT'
]);

// Operational & Logistics Enums
export const reservationStatusEnum = pgEnum('reservation_status', [
  'PENDING',
  'CONFIRMED',
  'SEATED',
  'COMPLETED',
  'CANCELLED',
  'NO_SHOW'
]);

export const shiftSlotStatusEnum = pgEnum('shift_slot_status', [
  'ACTIVE',
  'INACTIVE'
]);

export const inventoryUnitEnum = pgEnum('inventory_unit', [
  'KG',
  'GRAM',
  'LITER',
  'ML',
  'PIECE',
  'BOX',
  'PACKET'
]);

export const otpPurposeEnum = pgEnum('otp_purpose', [
  'TABLE_AUTH',
  'PASSWORD_RESET'
]);
