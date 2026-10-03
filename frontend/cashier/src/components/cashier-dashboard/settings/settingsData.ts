import { AllCashierSettings } from './types';

export const initialCashierSettings: AllCashierSettings = {
  profile: {
    cashierName: 'Tavonza Downtown',
    branch: 'Downtown Branch',
  },
  preferences: {
    language: 'English',
    currency: 'USD',
    taxRate: 8,
  },
  notifications: {
    enableNotifications: true,
    paymentAlerts: true,
    soundEffects: true,
  },
  automation: {
    aiUpsellSuggestions: true,
    autoPrintReceipt: false,
    darkMode: true,
  },
};

export const availableLanguages = [
  'English',
  'Spanish (Español)',
  'French (Français)',
  'German (Deutsch)',
  'Dutch (Nederlands)',
];

export const availableCurrencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar ($)' },
  { code: 'EUR', symbol: '€', name: 'Euro (€)' },
  { code: 'GBP', symbol: '£', name: 'British Pound (£)' },
  { code: 'CAD', symbol: '$', name: 'Canadian Dollar ($)' },
];

export const availableBranches = [
  'Downtown Branch',
  'Uptown Plaza',
  'Westside Mall',
  'Airport Express',
];
