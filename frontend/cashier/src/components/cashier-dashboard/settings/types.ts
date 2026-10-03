export interface CashierProfileSettings {
  cashierName: string;
  branch: string;
}

export interface CashierPreferencesSettings {
  language: string;
  currency: string;
  taxRate: number;
}

export interface CashierNotificationSettings {
  enableNotifications: boolean;
  paymentAlerts: boolean;
  soundEffects: boolean;
}

export interface CashierAutomationSettings {
  aiUpsellSuggestions: boolean;
  autoPrintReceipt: boolean;
  darkMode: boolean;
}

export interface AllCashierSettings {
  profile: CashierProfileSettings;
  preferences: CashierPreferencesSettings;
  notifications: CashierNotificationSettings;
  automation: CashierAutomationSettings;
}
