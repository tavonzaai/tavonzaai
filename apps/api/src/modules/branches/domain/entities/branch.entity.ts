// ============================================================================
// Branch & Operations Domain Entities
// ============================================================================

export interface BranchAddress {
  street: string;
  city: string;
  state?: string;
  postalCode?: string;
  country: string;
}

export interface Branch {
  id: string;
  restaurantId: string;
  name: string;
  address: BranchAddress;
  phone?: string | null;
  timezone: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BranchSettings {
  id: string;
  branchId: string;
  orderAcceptanceMode: 'AUTO_ACCEPT' | 'WAITER_APPROVAL' | 'MANAGER_APPROVAL';
  backupAccepterRoles?: string[] | null;
  hideUnavailableItems: boolean;
  allowMultipleGuestSessions: boolean;
  requireOtpPerGuest: boolean;
  allowSplitBill: boolean;
  allowGuestCheckoutWithoutAccount: boolean;
  autoCloseIdleSessionMins?: number | null;
  currency: string;
  taxPercent: number;
  serviceChargePct: number;
  tipEnabled: boolean;
  reservationsEnabled: boolean;
  waitlistEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BranchOperatingHours {
  id: string;
  branchId: string;
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

export interface BranchHoliday {
  id: string;
  branchId: string;
  date: string;
  isClosed: boolean;
  label?: string | null;
  openTime?: string | null;
  closeTime?: string | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}
