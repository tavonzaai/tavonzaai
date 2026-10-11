export interface PlanDefinition {
  id: 'basic' | 'pro' | 'enterprise';
  name: string;
  price: number;
  billingPeriod: string;
  tagline: string;
  restaurantsLimit: number | 'Unlimited';
  branchesLimit: number | 'Unlimited';
  staffLimit: number | 'Unlimited';
  features: string[];
}

export interface InvoiceItem {
  id: string;
  date: string;
  plan: string;
  amount: string;
  status: 'Paid';
  paymentMethod: string;
  subtotal: string;
  vat: string;
}
