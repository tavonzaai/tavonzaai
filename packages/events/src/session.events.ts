export interface TableSessionStartedEvent {
  eventType: 'TableSessionStarted';
  tableSessionId: string;
  tableId: string;
  tableLabel: string;
  branchId: string;
  qrToken?: string | null;
  openedAt: string;
}

export interface GuestJoinedSessionEvent {
  eventType: 'GuestJoinedSession';
  tableSessionId: string;
  guestSessionId: string;
  displayName: string;
  isHost: boolean;
  joinedAt: string;
}

export interface GuestLeftSessionEvent {
  eventType: 'GuestLeftSession';
  tableSessionId: string;
  guestSessionId: string;
  leftAt: string;
}

export interface TableSessionClosedEvent {
  eventType: 'TableSessionClosed';
  tableSessionId: string;
  tableId: string;
  tableLabel: string;
  branchId: string;
  closedById?: string | null;
  totalPaid: number;
  closedAt: string;
}

export interface TableStatusChangedEvent {
  eventType: 'TableStatusChanged';
  tableId: string;
  tableLabel: string;
  branchId: string;
  serviceStatus: string;
  operationalFlag: string;
  activeSessionId?: string | null;
  updatedAt: string;
}

export type SessionEvent =
  | TableSessionStartedEvent
  | GuestJoinedSessionEvent
  | GuestLeftSessionEvent
  | TableSessionClosedEvent
  | TableStatusChangedEvent;
