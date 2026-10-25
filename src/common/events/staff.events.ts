export interface WaiterCallAlertEvent {
  eventType: 'WaiterCallAlert';
  alertId: string;
  branchId: string;
  tableId: string;
  tableLabel: string;
  tableSessionId?: string | null;
  type: 'CALL_WAITER' | 'REQUEST_BILL' | 'WATER_REFILL' | 'CUSTOM';
  message?: string | null;
  status: 'PENDING' | 'ACKNOWLEDGED' | 'RESOLVED';
  createdAt: string;
}

export interface AlertAcknowledgedEvent {
  eventType: 'AlertAcknowledged';
  alertId: string;
  branchId: string;
  acknowledgedById: string;
  acknowledgedAt: string;
}

export type StaffAlertEvent = WaiterCallAlertEvent | AlertAcknowledgedEvent;
