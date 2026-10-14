import { rtkBaseApi } from '../api/baseApi';

export interface SuperAdminMetrics {
  activeTenants: number;
  activeTenantsGrowth: string;
  mrr: number;
  mrrGrowth: string;
  newSignups: number;
  newSignupsPeriod: string;
  pastDueAccountsCount: number;
  pastDueOutstandingAmount: number;
}

export interface MrrDataPoint {
  month: string;
  fullMonth: string;
  mrr: number;
  revenue: number;
}

export interface PastDueAccount {
  id: string;
  name: string;
  daysOverdue: number;
  amount: number;
  plan: string;
  email: string;
  status: 'overdue' | 'critical';
}

export interface RecentSignup {
  id: string;
  ownerName: string;
  businessName: string;
  plan: 'Starter' | 'Growth' | 'Pro' | 'Enterprise';
  signupDate: string;
  status: 'Active' | 'Trial' | 'Past Due';
  email: string;
  branchesCount: number;
}

export interface TenantRestaurant {
  id: string;
  name: string;
  branchesCount: number;
}

export interface TenantInvoice {
  id: string;
  date: string;
  amount: number;
  status: 'Paid' | 'Past Due' | 'Pending';
}

export interface TenantItem {
  id: string;
  name: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  company: string;
  plan: 'Starter' | 'Basic' | 'Growth' | 'Pro' | 'Enterprise';
  billingCycle: 'Monthly' | 'Yearly';
  restaurantsCount: number;
  branchesCount: number;
  branchesMax: number;
  status: 'Active' | 'Trial' | 'Past Due' | 'Suspended' | 'Cancelled';
  joinedDate: string;
  nextBillingDate: string;
  paymentMethod: string;
  mrr: number;
  restaurants: TenantRestaurant[];
  invoices: TenantInvoice[];
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  priceMonthly: number;
  priceYearly: number;
  features: string[];
  maxBranches: number;
  maxStaff: number;
  isPopular?: boolean;
}

// Initial rich sample data matching exact design
export const DEFAULT_METRICS: SuperAdminMetrics = {
  activeTenants: 128,
  activeTenantsGrowth: '+8 this month',
  mrr: 24860,
  mrrGrowth: '+12.4% vs last month',
  newSignups: 21,
  newSignupsPeriod: 'Last 30 days',
  pastDueAccountsCount: 4,
  pastDueOutstandingAmount: 596,
};

export const DEFAULT_MRR_TREND: MrrDataPoint[] = [
  { month: 'Jul', fullMonth: 'July 2023', mrr: 12400, revenue: 14200 },
  { month: 'Aug', fullMonth: 'August 2023', mrr: 13900, revenue: 15600 },
  { month: 'Sep', fullMonth: 'September 2023', mrr: 15200, revenue: 17100 },
  { month: 'Oct', fullMonth: 'October 2023', mrr: 16800, revenue: 18900 },
  { month: 'Nov', fullMonth: 'November 2023', mrr: 18400, revenue: 20500 },
  { month: 'Dec', fullMonth: 'December 2023', mrr: 19800, revenue: 22100 },
  { month: 'Jan', fullMonth: 'January 2024', mrr: 20900, revenue: 23400 },
  { month: 'Feb', fullMonth: 'February 2024', mrr: 21800, revenue: 24500 },
  { month: 'Mar', fullMonth: 'March 2024', mrr: 22900, revenue: 25800 },
  { month: 'Apr', fullMonth: 'April 2024', mrr: 23600, revenue: 26400 },
  { month: 'May', fullMonth: 'May 2024', mrr: 24200, revenue: 27100 },
  { month: 'Jun', fullMonth: 'June 2024', mrr: 24860, revenue: 28200 },
];

export const DEFAULT_PAST_DUE: PastDueAccount[] = [
  {
    id: 'pd-1',
    name: 'Common Ground Dining',
    daysOverdue: 3,
    amount: 149,
    plan: 'Growth',
    email: 'billing@commonground.com',
    status: 'overdue',
  },
  {
    id: 'pd-2',
    name: 'Juniper Hospitality',
    daysOverdue: 6,
    amount: 179,
    plan: 'Pro',
    email: 'finance@juniperhospitality.io',
    status: 'overdue',
  },
  {
    id: 'pd-3',
    name: 'Basil & Stone',
    daysOverdue: 9,
    amount: 219,
    plan: 'Pro',
    email: 'accounts@basilandstone.com',
    status: 'overdue',
  },
  {
    id: 'pd-4',
    name: 'Golden Hour Café',
    daysOverdue: 12,
    amount: 49,
    plan: 'Starter',
    email: 'owner@goldenhourcafe.net',
    status: 'critical',
  },
];

export const DEFAULT_RECENT_SIGNUPS: RecentSignup[] = [
  {
    id: 'rs-1',
    ownerName: 'Avery Morgan',
    businessName: 'Oak & Ember Group',
    plan: 'Growth',
    signupDate: 'May 24, 2024',
    status: 'Active',
    email: 'avery@oakember.com',
    branchesCount: 3,
  },
  {
    id: 'rs-2',
    ownerName: 'Priya Shah',
    businessName: 'Saffron Table Co.',
    plan: 'Pro',
    signupDate: 'Jun 8, 2024',
    status: 'Active',
    email: 'priya@saffrontable.com',
    branchesCount: 5,
  },
  {
    id: 'rs-3',
    ownerName: 'Daniel Kim',
    businessName: 'Northstar Kitchens',
    plan: 'Starter',
    signupDate: 'Jun 11, 2024',
    status: 'Trial',
    email: 'daniel@northstarkitchens.com',
    branchesCount: 1,
  },
  {
    id: 'rs-4',
    ownerName: 'Maya Bennett',
    businessName: 'Common Ground Dining',
    plan: 'Growth',
    signupDate: 'Apr 19, 2024',
    status: 'Past Due',
    email: 'maya@commonground.com',
    branchesCount: 2,
  },
];

// Exact Tenants list from the Figma Tenants design
export const DEFAULT_TENANTS: TenantItem[] = [
  {
    id: 't-1',
    name: 'Oak & Ember Group',
    businessName: 'Oak & Ember Group',
    ownerName: 'Avery Morgan',
    email: 'avery@oakandember.com',
    phone: '+1 (404) 555-0182',
    company: 'Oak & Ember Hospitality LLC',
    plan: 'Growth',
    billingCycle: 'Monthly',
    restaurantsCount: 4,
    branchesCount: 12,
    branchesMax: 15,
    status: 'Active',
    joinedDate: 'May 24, 2024',
    nextBillingDate: 'Jul 12, 2024',
    paymentMethod: 'Visa ending in 4242',
    mrr: 149,
    restaurants: [
      { id: 'r-1', name: 'Oak & Ember Midtown', branchesCount: 5 },
      { id: 'r-2', name: 'The Ember Room', branchesCount: 4 },
      { id: 'r-3', name: 'Oak House', branchesCount: 2 },
      { id: 'r-4', name: 'Little Oak Café', branchesCount: 1 },
    ],
    invoices: [
      { id: 'INV-101', date: 'Jun 12, 2024', amount: 149, status: 'Paid' },
      { id: 'INV-102', date: 'May 12, 2024', amount: 149, status: 'Paid' },
      { id: 'INV-103', date: 'Apr 12, 2024', amount: 149, status: 'Paid' },
    ],
  },
  {
    id: 't-2',
    name: 'Saffron Table Co.',
    businessName: 'Saffron Table Co.',
    ownerName: 'Priya Shah',
    email: 'priya@saffrontable.com',
    phone: '+1 (212) 555-0199',
    company: 'Saffron Dining Global Group',
    plan: 'Pro',
    billingCycle: 'Yearly',
    restaurantsCount: 7,
    branchesCount: 24,
    branchesMax: 30,
    status: 'Active',
    joinedDate: 'Jun 8, 2024',
    nextBillingDate: 'Jun 8, 2025',
    paymentMethod: 'Mastercard ending in 8891',
    mrr: 219,
    restaurants: [
      { id: 'r-21', name: 'Saffron Grand Bistro', branchesCount: 10 },
      { id: 'r-22', name: 'Saffron Express Lounge', branchesCount: 8 },
      { id: 'r-23', name: 'Cardamom & Cumin', branchesCount: 6 },
    ],
    invoices: [
      { id: 'INV-201', date: 'Jun 8, 2024', amount: 2190, status: 'Paid' },
    ],
  },
  {
    id: 't-3',
    name: 'Northstar Kitchens',
    businessName: 'Northstar Kitchens',
    ownerName: 'Daniel Kim',
    email: 'daniel@northstarkitchens.com',
    phone: '+1 (312) 555-0143',
    company: 'Northstar Dining Concepts Inc.',
    plan: 'Starter',
    billingCycle: 'Monthly',
    restaurantsCount: 1,
    branchesCount: 2,
    branchesMax: 3,
    status: 'Trial',
    joinedDate: 'Jun 11, 2024',
    nextBillingDate: 'Jun 25, 2024',
    paymentMethod: 'Visa ending in 1092',
    mrr: 49,
    restaurants: [
      { id: 'r-31', name: 'Northstar Kitchens Flagship', branchesCount: 2 },
    ],
    invoices: [],
  },
  {
    id: 't-4',
    name: 'Common Ground Dining',
    businessName: 'Common Ground Dining',
    ownerName: 'Maya Bennett',
    email: 'maya@commonground.com',
    phone: '+1 (617) 555-0177',
    company: 'Common Ground Operators LLC',
    plan: 'Growth',
    billingCycle: 'Monthly',
    restaurantsCount: 3,
    branchesCount: 8,
    branchesMax: 10,
    status: 'Past Due',
    joinedDate: 'Apr 19, 2024',
    nextBillingDate: 'Jun 19, 2024',
    paymentMethod: 'Amex ending in 3004',
    mrr: 149,
    restaurants: [
      { id: 'r-41', name: 'Common Ground Harbor', branchesCount: 4 },
      { id: 'r-42', name: 'Common Ground Plaza', branchesCount: 4 },
    ],
    invoices: [
      { id: 'INV-401', date: 'May 19, 2024', amount: 149, status: 'Paid' },
      { id: 'INV-402', date: 'Jun 19, 2024', amount: 149, status: 'Past Due' },
    ],
  },
  {
    id: 't-5',
    name: 'Juniper Hospitality',
    businessName: 'Juniper Hospitality',
    ownerName: 'Liam Chen',
    email: 'liam@juniper.com',
    phone: '+1 (415) 555-0128',
    company: 'Juniper Group Holdings',
    plan: 'Pro',
    billingCycle: 'Yearly',
    restaurantsCount: 5,
    branchesCount: 19,
    branchesMax: 20,
    status: 'Suspended',
    joinedDate: 'Mar 2, 2024',
    nextBillingDate: 'Mar 2, 2025',
    paymentMethod: 'Visa ending in 7761',
    mrr: 179,
    restaurants: [
      { id: 'r-51', name: 'Juniper Grill & Bar', branchesCount: 11 },
      { id: 'r-52', name: 'The Juniper Rooftop', branchesCount: 8 },
    ],
    invoices: [
      { id: 'INV-501', date: 'Mar 2, 2024', amount: 1790, status: 'Past Due' },
    ],
  },
  {
    id: 't-6',
    name: 'Mesa Verde Foods',
    businessName: 'Mesa Verde Foods',
    ownerName: 'Sofia Reyes',
    email: 'sofia@mesaverdefoods.com',
    phone: '+1 (512) 555-0164',
    company: 'Mesa Verde Foods LP',
    plan: 'Starter',
    billingCycle: 'Monthly',
    restaurantsCount: 1,
    branchesCount: 1,
    branchesMax: 2,
    status: 'Cancelled',
    joinedDate: 'Feb 14, 2024',
    nextBillingDate: 'N/A',
    paymentMethod: 'Mastercard ending in 5521',
    mrr: 0,
    restaurants: [
      { id: 'r-61', name: 'Mesa Verde Kitchen', branchesCount: 1 },
    ],
    invoices: [
      { id: 'INV-601', date: 'Feb 14, 2024', amount: 49, status: 'Paid' },
    ],
  },
];

export const DEFAULT_PLANS: SubscriptionPlan[] = [
  {
    id: 'plan-starter',
    name: 'Starter',
    priceMonthly: 49,
    priceYearly: 490,
    features: ['1 Branch location', 'Up to 5 Staff accounts', 'QR Code Digital Menu', 'Basic Order Management', 'Standard Support'],
    maxBranches: 1,
    maxStaff: 5,
  },
  {
    id: 'plan-growth',
    name: 'Growth',
    priceMonthly: 149,
    priceYearly: 1490,
    features: ['Up to 3 Branches', 'Up to 20 Staff accounts', 'Kitchen Display System (KDS)', 'Real-time Stock Alerts', 'Split Bill & Stripe Terminal', 'Priority Support'],
    maxBranches: 3,
    maxStaff: 20,
    isPopular: true,
  },
  {
    id: 'plan-pro',
    name: 'Pro',
    priceMonthly: 219,
    priceYearly: 2190,
    features: ['Up to 10 Branches', 'Unlimited Staff accounts', 'Autonomous AI Waiter & Barista', 'Custom Domain & White-labeling', 'Advanced Analytics & P&L', '24/7 Dedicated Account Rep'],
    maxBranches: 10,
    maxStaff: 100,
  },
  {
    id: 'plan-enterprise',
    name: 'Enterprise',
    priceMonthly: 499,
    priceYearly: 4990,
    features: ['Unlimited Multi-chain Branches', 'Custom ERP & POS Integration', 'Private Dedicated AWS Cluster', 'SLA 99.99% Uptime Guarantee', 'Custom AI Voice Training'],
    maxBranches: 999,
    maxStaff: 999,
  },
];

export const superAdminApi = rtkBaseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSuperAdminMetrics: builder.query<SuperAdminMetrics, void>({
      query: () => '/superadmin/metrics',
      transformResponse: (res: any) => res?.data || DEFAULT_METRICS,
      transformErrorResponse: () => DEFAULT_METRICS,
      providesTags: ['METRICS'],
    }),
    getMrrTrend: builder.query<MrrDataPoint[], { period?: 'monthly' | 'yearly' } | void>({
      query: (params) => ({
        url: '/superadmin/analytics/mrr-trend',
        params: params || undefined,
      }),
      transformResponse: (res: any) => (Array.isArray(res?.data) ? res.data : DEFAULT_MRR_TREND),
      transformErrorResponse: () => DEFAULT_MRR_TREND,
      providesTags: ['METRICS'],
    }),
    getPastDueAccounts: builder.query<PastDueAccount[], void>({
      query: () => '/superadmin/billing/past-due',
      transformResponse: (res: any) => (Array.isArray(res?.data) ? res.data : DEFAULT_PAST_DUE),
      transformErrorResponse: () => DEFAULT_PAST_DUE,
      providesTags: ['BILLING'],
    }),
    getRecentSignups: builder.query<RecentSignup[], void>({
      query: () => '/superadmin/tenants/recent',
      transformResponse: (res: any) => (Array.isArray(res?.data) ? res.data : DEFAULT_RECENT_SIGNUPS),
      transformErrorResponse: () => DEFAULT_RECENT_SIGNUPS,
      providesTags: ['TENANT'],
    }),
    getAllTenants: builder.query<TenantItem[], { search?: string; status?: string; plan?: string; cycle?: string } | void>({
      query: (params) => ({
        url: '/superadmin/tenants',
        params: params || undefined,
      }),
      transformResponse: (res: any) => {
        if (Array.isArray(res?.data) && res.data.length > 0) return res.data;
        return DEFAULT_TENANTS;
      },
      transformErrorResponse: () => DEFAULT_TENANTS,
      providesTags: ['TENANT'],
    }),
    getTenantById: builder.query<TenantItem, string>({
      query: (id) => `/superadmin/tenants/${id}`,
      transformResponse: (res: any, _meta, id) => {
        if (res?.data?.id) return res.data;
        return DEFAULT_TENANTS.find((t) => t.id === id) || DEFAULT_TENANTS[0];
      },
      transformErrorResponse: (_err, _meta, id) => {
        return DEFAULT_TENANTS.find((t) => t.id === id) || DEFAULT_TENANTS[0];
      },
      providesTags: ['TENANT'],
    }),
    getPlans: builder.query<SubscriptionPlan[], void>({
      query: () => '/superadmin/plans',
      transformResponse: (res: any) => (Array.isArray(res?.data) ? res.data : DEFAULT_PLANS),
      transformErrorResponse: () => DEFAULT_PLANS,
      providesTags: ['PLAN'],
    }),
    createTenant: builder.mutation<TenantItem, Partial<TenantItem>>({
      query: (body) => ({
        url: '/superadmin/tenants',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['TENANT', 'METRICS'],
    }),
    toggleSuspendTenant: builder.mutation<{ success: boolean; status: string }, { id: string }>({
      query: ({ id }) => ({
        url: `/superadmin/tenants/${id}/suspend`,
        method: 'PATCH',
      }),
      invalidatesTags: ['TENANT'],
    }),
    sendPaymentReminder: builder.mutation<{ success: boolean; message: string }, { accountId: string }>({
      query: ({ accountId }) => ({
        url: `/superadmin/billing/remind/${accountId}`,
        method: 'POST',
      }),
      invalidatesTags: ['BILLING'],
    }),
  }),
});

export const {
  useGetSuperAdminMetricsQuery,
  useGetMrrTrendQuery,
  useGetPastDueAccountsQuery,
  useGetRecentSignupsQuery,
  useGetAllTenantsQuery,
  useGetTenantByIdQuery,
  useGetPlansQuery,
  useCreateTenantMutation,
  useToggleSuspendTenantMutation,
  useSendPaymentReminderMutation,
} = superAdminApi;
