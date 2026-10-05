/**
 * Realtime Channel Definitions & Route Builders
 * Strictly controls channel scoping across Customer, Waiter, Kitchen, Cashier, and Manager
 */

export const RealtimeChannels = {
  /** Customer dining table session room (guests at this table) */
  session: (tableSessionId: string) => `session:${tableSessionId}`,

  /** Waiter floor staff room for a branch */
  waiter: (branchId: string) => `branch:${branchId}:waiter`,

  /** Kitchen / Bar Display System (KDS) station room */
  kitchenStation: (branchId: string, stationType: 'KITCHEN' | 'BAR') =>
    `branch:${branchId}:station:${stationType}`,

  /** Cashier checkout terminal room for a branch */
  cashier: (branchId: string) => `branch:${branchId}:cashier`,

  /** Branch manager operational room */
  manager: (branchId: string) => `branch:${branchId}:manager`,
} as const;

export type RealtimeChannelType =
  | 'SESSION'
  | 'WAITER'
  | 'KITCHEN'
  | 'CASHIER'
  | 'MANAGER';
