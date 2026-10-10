// ============================================================================
// Table & Reservation Domain Entities
// ============================================================================

export type TableServiceStatus =
  | 'AVAILABLE'
  | 'OCCUPIED'
  | 'ORDERING'
  | 'PREPARING'
  | 'SERVING'
  | 'PAYMENT_PENDING'
  | 'CLOSING';

export type TableOperationalFlag =
  | 'NORMAL'
  | 'RESERVED'
  | 'CLEANING'
  | 'OUT_OF_SERVICE';

export type TableShape =
  | 'CIRCLE'
  | 'SQUARE'
  | 'RECTANGLE'
  | 'TRIANGLE'
  | 'HEXAGON';

export type ReservationStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'SEATED'
  | 'CANCELLED'
  | 'NO_SHOW';

export interface AssignedWaiterInfo {
  waiterId: string;
  waiterName?: string;
  sessionStart?: Date;
  sessionEnd?: Date;
}

export interface Table {
  id: string;
  branchId: string;
  label: string;
  capacity: number;
  serviceStatus: TableServiceStatus;
  operationalFlag: TableOperationalFlag;
  qrCodeToken?: string | null;
  shape: TableShape;
  floor: number;
  assignedWaiter?: AssignedWaiterInfo | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Reservation {
  id: string;
  branchId: string;
  tableId?: string | null;
  customerId?: string | null;
  tableSessionId?: string | null;
  guestName: string;
  guestPhone: string;
  partySize: number;
  reservedFor: Date;
  durationMins: number;
  status: ReservationStatus;
  specialRequest?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
