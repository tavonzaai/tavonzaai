import { DEFAULT_BRANCH_ID, HASH, PRICING, uid } from './constants';
import { one, schema, type Tx } from './types';

type StaffRole = (typeof schema.staffRoleEnum.enumValues)[number];

export interface StaffRef {
  key: string;
  userId: string;
  staffId: string;
  assignmentId: string;
  name: string;
  email: string;
  role: StaffRole;
}

export interface IdentityContext {
  ownerUserId: string;
  restaurantId: string;
  branchId: string;
  manager: StaffRef;
  waiters: { david: StaffRef; sara: StaffRef; mike: StaffRef; mello: StaffRef };
  cashier: StaffRef;
  kitchen: StaffRef;
  customers: { sarah: { userId: string; customerId: string; name: string }; jordan: { userId: string; customerId: string; name: string } };
  allStaff: StaffRef[];
}

const PERMS: Record<StaffRole, string[]> = {
  BRANCH_MANAGER: [
    'MANAGE_MENU', 'MANAGE_TABLES', 'MANAGE_STAFF', 'MANAGE_RESERVATIONS', 'VIEW_ORDERS',
    'UPDATE_ORDER_STATUS', 'MANAGE_PAYMENTS', 'APPLY_DISCOUNTS', 'MANAGE_BRANCH_SETTINGS', 'VIEW_REPORTS',
  ],
  WAITER: ['VIEW_ORDERS', 'UPDATE_ORDER_STATUS', 'MANAGE_TABLES'],
  CASHIER: ['MANAGE_PAYMENTS', 'VIEW_ORDERS', 'APPLY_DISCOUNTS'],
  KITCHEN_STAFF: ['VIEW_ORDERS', 'UPDATE_ORDER_STATUS'],
  BARTENDER: ['VIEW_ORDERS', 'UPDATE_ORDER_STATUS'],
  HOST: ['MANAGE_TABLES', 'MANAGE_RESERVATIONS', 'VIEW_ORDERS'],
};

export const seedHierarchyAndIdentity = async (tx: Tx): Promise<IdentityContext> => {
  // ── Platform owner ────────────────────────────────────────────────
  const owner = one(
    await tx.insert(schema.users).values({
      id: uid(1, 1), email: 'owner@tavonza.ai', name: 'Platform Owner', password: HASH.OWNER, role: 'ADMIN', status: 'ACTIVE',
    }).returning(),
    'owner user',
  );
  await tx.insert(schema.admins).values({ userId: owner.id, intro: 'System Super Administrator' });
  await tx.insert(schema.owners).values({ userId: owner.id });

  // ── Org → restaurant → branch ─────────────────────────────────────
  const org = one(
    await tx.insert(schema.organizations).values({ id: uid(2, 1), name: 'Tavonza Global', ownerId: owner.id, slug: 'tavonza-global' }).returning(),
    'organization',
  );
  const restaurant = one(
    await tx.insert(schema.restaurants).values({
      id: uid(2, 2), organizationId: org.id, name: 'Tavonza Fine Dining', slug: 'tavonza-fine-dining',
      description: 'Modern grill, fresh salads and a craft cocktail bar.',
    }).returning(),
    'restaurant',
  );
  const branch = one(
    await tx.insert(schema.branches).values({
      id: DEFAULT_BRANCH_ID, restaurantId: restaurant.id, name: 'Downtown HQ',
      address: { line1: '742 Evergreen Terrace', city: 'Metropolis', country: 'US' },
      phone: '+1 (555) 234-5678', timezone: 'Asia/Dhaka',
    }).returning(),
    'branch',
  );

  await tx.insert(schema.branchSettings).values({
    branchId: branch.id,
    orderAcceptanceMode: 'WAITER_APPROVAL',
    backupAccepterRoles: ['BRANCH_MANAGER'],
    currency: PRICING.currency,
    taxPercent: PRICING.taxPercent,
    serviceChargePct: PRICING.serviceChargePct,
    allowSplitBill: true,
    allowGuestCheckoutWithoutAccount: true,
    allowMultipleGuestSessions: true,
    requireOtpPerGuest: false,
    autoCloseIdleSessionMins: 180,
  });

  await tx.insert(schema.branchOperatingHours).values(
    [0, 1, 2, 3, 4, 5, 6].map((dayOfWeek) => ({
      branchId: branch.id,
      dayOfWeek,
      openTime: dayOfWeek === 6 ? '08:30' : '09:00',
      closeTime: dayOfWeek === 5 || dayOfWeek === 6 ? '23:30' : '22:00',
    })),
  );

  const nextYear = new Date().getFullYear() + 1;
  await tx.insert(schema.branchHolidays).values([
    { branchId: branch.id, date: `${nextYear}-01-01`, isClosed: true, label: "New Year's Day" },
    { branchId: branch.id, date: `${nextYear}-12-24`, isClosed: false, label: 'Christmas Eve (short hours)', openTime: '12:00', closeTime: '18:00' },
  ]);

  // ── Staff ─────────────────────────────────────────────────────────
  let n = 10;
  const makeStaff = async (key: string, name: string, email: string, password: string, role: StaffRole, contactNo?: string): Promise<StaffRef> => {
    n += 1;
    const user = one(
      await tx.insert(schema.users).values({ id: uid(1, n), email, name, password, role: 'STAFF', status: 'ACTIVE', contactNo }).returning(),
      `${key} user`,
    );
    const staff = one(await tx.insert(schema.staff).values({ id: uid(3, n), userId: user.id }).returning(), `${key} staff`);
    const assignment = one(
      await tx.insert(schema.staffAssignments).values({
        id: uid(4, n), staffId: staff.id, branchId: branch.id, role, permissions: PERMS[role], isActive: true,
      }).returning(),
      `${key} assignment`,
    );
    return { key, userId: user.id, staffId: staff.id, assignmentId: assignment.id, name, email, role };
  };

  const manager = await makeStaff('manager', 'Marcus Vance', 'manager@tavonza.ai', HASH.MANAGER, 'BRANCH_MANAGER', '+1 (555) 111-2233');
  const david = await makeStaff('david', 'David Chen', 'waiter@tavonza.ai', HASH.WAITER, 'WAITER');
  const sara = await makeStaff('sara', 'Sara Ahmed', 'sara@tavonza.ai', HASH.WAITER, 'WAITER');
  const mike = await makeStaff('mike', 'Mike Rossi', 'mike@tavonza.ai', HASH.WAITER, 'WAITER');
  const mello = await makeStaff('mello', 'Mello Park', 'mello@tavonza.ai', HASH.WAITER, 'WAITER');
  const cashier = await makeStaff('cashier', 'Emma Watson', 'cashier@tavonza.ai', HASH.CASHIER, 'CASHIER');
  const kitchen = await makeStaff('kitchen', 'Chef Gordon', 'kitchen@tavonza.ai', HASH.KITCHEN, 'KITCHEN_STAFF');

  // ── Customers ─────────────────────────────────────────────────────
  const makeCustomer = async (i: number, name: string, email: string, contactNo: string, loyaltyPoints: number) => {
    const user = one(
      await tx.insert(schema.users).values({ id: uid(1, 100 + i), email, name, password: HASH.CUSTOMER, role: 'CUSTOMER', status: 'ACTIVE', contactNo }).returning(),
      `${email} user`,
    );
    const customer = one(
      await tx.insert(schema.customers).values({
        id: uid(5, i), userId: user.id, loyaltyPoints,
        defaultAddress: { line1: '12 Park Avenue', city: 'Metropolis', country: 'US' },
      }).returning(),
      `${email} customer`,
    );
    return { userId: user.id, customerId: customer.id, name };
  };

  const sarah = await makeCustomer(1, 'Sarah Jenkins', 'customer@tavonza.ai', '+1234567890', 120);
  const jordan = await makeCustomer(2, 'Jordan Lee', 'guest2@tavonza.ai', '+1234567891', 40);

  console.log('👥 Seeded hierarchy, 7 staff, 2 customers');

  return {
    ownerUserId: owner.id,
    restaurantId: restaurant.id,
    branchId: branch.id,
    manager,
    waiters: { david, sara, mike, mello },
    cashier,
    kitchen,
    customers: { sarah, jordan },
    allStaff: [manager, david, sara, mike, mello, cashier, kitchen],
  };
};
