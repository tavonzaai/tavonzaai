// ============================================================================
// Tables, Floor Layout & Dining Sessions Seeder Module
// ============================================================================
import { DrizzleDatabase } from '../../client';
import * as schema from '../../schema';

export async function seedTables(
  db: DrizzleDatabase,
  branches: {
    branch1: typeof schema.branches.$inferSelect;
    branch2: typeof schema.branches.$inferSelect;
    branch3: typeof schema.branches.$inferSelect;
  },
  staff: {
    waiter1: typeof schema.staff.$inferSelect;
    waiter2: typeof schema.staff.$inferSelect;
    manager1: typeof schema.staff.$inferSelect;
  },
  customers: {
    customer1: typeof schema.customers.$inferSelect;
    customer2: typeof schema.customers.$inferSelect;
  },
  now: Date
) {
  console.log('🪑 Provisioning Floor layouts, Tables, and Opaque QR Tokens...');

  // 1. Branch 1 (Downtown HQ) Tables (Floors 1 & 2 + Bar)
  const createdTables1 = await db.insert(schema.tables).values([
    // Floor 1: Main Dining
    {
      branchId: branches.branch1.id,
      label: 'T-01',
      capacity: 4,
      shape: 'SQUARE',
      floor: 1,
      serviceStatus: 'ORDERING',
      operationalFlag: 'NORMAL',
      qrCodeToken: 'qr_tok_dt_t01',
    },
    {
      branchId: branches.branch1.id,
      label: 'T-02',
      capacity: 2,
      shape: 'CIRCLE',
      floor: 1,
      serviceStatus: 'AVAILABLE',
      operationalFlag: 'NORMAL',
      qrCodeToken: 'qr_tok_dt_t02',
    },
    {
      branchId: branches.branch1.id,
      label: 'T-03',
      capacity: 4,
      shape: 'RECTANGLE',
      floor: 1,
      serviceStatus: 'PREPARING',
      operationalFlag: 'NORMAL',
      qrCodeToken: 'qr_tok_dt_t03',
    },
    {
      branchId: branches.branch1.id,
      label: 'T-04',
      capacity: 6,
      shape: 'RECTANGLE',
      floor: 1,
      serviceStatus: 'PAYMENT_PENDING',
      operationalFlag: 'NORMAL',
      qrCodeToken: 'qr_tok_dt_t04',
    },
    {
      branchId: branches.branch1.id,
      label: 'T-05',
      capacity: 2,
      shape: 'SQUARE',
      floor: 1,
      serviceStatus: 'OCCUPIED',
      operationalFlag: 'NORMAL',
      qrCodeToken: 'qr_tok_dt_t05',
    },
    {
      branchId: branches.branch1.id,
      label: 'T-06',
      capacity: 8,
      shape: 'RECTANGLE',
      floor: 1,
      serviceStatus: 'SERVING',
      operationalFlag: 'NORMAL',
      qrCodeToken: 'qr_tok_dt_t06',
    },
    // Floor 2: Rooftop / Patio
    {
      branchId: branches.branch1.id,
      label: 'P-01',
      capacity: 4,
      shape: 'CIRCLE',
      floor: 2,
      serviceStatus: 'AVAILABLE',
      operationalFlag: 'NORMAL',
      qrCodeToken: 'qr_tok_dt_p01',
    },
    {
      branchId: branches.branch1.id,
      label: 'P-02',
      capacity: 4,
      shape: 'HEXAGON',
      floor: 2,
      serviceStatus: 'CLOSING',
      operationalFlag: 'NORMAL',
      qrCodeToken: 'qr_tok_dt_p02',
    },
    {
      branchId: branches.branch1.id,
      label: 'P-03',
      capacity: 6,
      shape: 'RECTANGLE',
      floor: 2,
      serviceStatus: 'AVAILABLE',
      operationalFlag: 'RESERVED',
      qrCodeToken: 'qr_tok_dt_p03',
    },
    {
      branchId: branches.branch1.id,
      label: 'P-04',
      capacity: 2,
      shape: 'SQUARE',
      floor: 2,
      serviceStatus: 'AVAILABLE',
      operationalFlag: 'CLEANING',
      qrCodeToken: 'qr_tok_dt_p04',
    },
    {
      branchId: branches.branch1.id,
      label: 'P-05',
      capacity: 4,
      shape: 'CIRCLE',
      floor: 2,
      serviceStatus: 'AVAILABLE',
      operationalFlag: 'OUT_OF_SERVICE',
      qrCodeToken: 'qr_tok_dt_p05',
    },
    // Floor 1: Bar Counter
    {
      branchId: branches.branch1.id,
      label: 'BAR-01',
      capacity: 1,
      shape: 'CIRCLE',
      floor: 1,
      serviceStatus: 'OCCUPIED',
      operationalFlag: 'NORMAL',
      qrCodeToken: 'qr_tok_dt_bar01',
    },
  ]).returning();

  const [t1, t2, t3, t4, t5, t6, , , p3] = createdTables1;
  if (!t1 || !t2 || !t3 || !t4 || !t5 || !t6 || !p3) {
    throw new Error('Failed to create tables for branch1');
  }

  // 2. Branch 2 (Uptown Lounge) Tables
  const createdTables2 = await db.insert(schema.tables).values([
    {
      branchId: branches.branch2.id,
      label: 'W-01',
      capacity: 4,
      shape: 'CIRCLE',
      floor: 1,
      serviceStatus: 'ORDERING',
      operationalFlag: 'NORMAL',
      qrCodeToken: 'qr_tok_uw_w01',
    },
    {
      branchId: branches.branch2.id,
      label: 'W-02',
      capacity: 2,
      shape: 'SQUARE',
      floor: 1,
      serviceStatus: 'AVAILABLE',
      operationalFlag: 'NORMAL',
      qrCodeToken: 'qr_tok_uw_w02',
    },
    {
      branchId: branches.branch2.id,
      label: 'W-03',
      capacity: 6,
      shape: 'RECTANGLE',
      floor: 1,
      serviceStatus: 'AVAILABLE',
      operationalFlag: 'NORMAL',
      qrCodeToken: 'qr_tok_uw_w03',
    },
  ]).returning();

  const [w1] = createdTables2;
  if (!w1) throw new Error('Failed to create tables for branch2');

  // 3. Branch 3 (Apex Midtown) Tables
  await db.insert(schema.tables).values([
    {
      branchId: branches.branch3.id,
      label: 'A-01',
      capacity: 4,
      shape: 'SQUARE',
      floor: 1,
      serviceStatus: 'AVAILABLE',
      operationalFlag: 'NORMAL',
      qrCodeToken: 'qr_tok_ax_a01',
    },
    {
      branchId: branches.branch3.id,
      label: 'A-02',
      capacity: 2,
      shape: 'CIRCLE',
      floor: 1,
      serviceStatus: 'AVAILABLE',
      operationalFlag: 'NORMAL',
      qrCodeToken: 'qr_tok_ax_a02',
    },
  ]);

  // 4. Waiter Table Assignments
  const sessionStart = new Date(now.getTime() - 24 * 3600 * 1000);
  const sessionEnd = new Date(now.getTime() + 30 * 24 * 3600 * 1000);

  const waiterAssignmentsMap = new Map<string, string>();
  for (const t of createdTables1) {
    const [assignment] = await db.insert(schema.waiterTableAssignments).values({
      branchId: branches.branch1.id,
      tableId: t.id,
      waiterId: staff.waiter1.id,
      assignedById: staff.manager1.id,
      sessionStart,
      sessionEnd,
      isActive: true,
    }).returning();
    if (assignment) {
      waiterAssignmentsMap.set(t.id, assignment.id);
    }
  }

  const [w1Assignment] = await db.insert(schema.waiterTableAssignments).values({
    branchId: branches.branch2.id,
    tableId: w1.id,
    waiterId: staff.waiter2.id,
    assignedById: staff.manager1.id,
    sessionStart,
    sessionEnd,
    isActive: true,
  }).returning();
  if (w1Assignment) {
    waiterAssignmentsMap.set(w1.id, w1Assignment.id);
  }

  // 5. Table Sessions & Multi-Guest Sessions
  // 5A. Table 1 (Downtown HQ): Active Session (Sarah Jenkins dining)
  const [tableSession1] = await db.insert(schema.tableSessions).values({
    branchId: branches.branch1.id,
    tableId: t1.id,
    joinCode: 'JOIN101',
    partySize: 2,
    status: 'ACTIVE',
    openedByStaffId: staff.waiter1.id,
    startedAt: new Date(now.getTime() - 30 * 60 * 1000),
  }).returning();
  if (!tableSession1) throw new Error('Failed to create tableSession1');

  const [guestSession1] = await db.insert(schema.guestSessions).values({
    tableSessionId: tableSession1.id,
    customerId: customers.customer1.id,
    displayName: 'Sarah Jenkins',
    contact: 'customer@tavonza.ai',
    isHostGuest: true,
    otpVerifiedAt: new Date(now.getTime() - 29 * 60 * 1000),
    status: 'ACTIVE',
  }).returning();
  if (!guestSession1) throw new Error('Failed to create guestSession1');

  // 5B. Table 3 (Downtown HQ): In-kitchen prep session
  const [tableSession3] = await db.insert(schema.tableSessions).values({
    branchId: branches.branch1.id,
    tableId: t3.id,
    joinCode: 'JOIN103',
    partySize: 3,
    status: 'ACTIVE',
    openedByStaffId: staff.waiter1.id,
    startedAt: new Date(now.getTime() - 45 * 60 * 1000),
  }).returning();
  if (!tableSession3) throw new Error('Failed to create tableSession3');

  const [guestSession3Host] = await db.insert(schema.guestSessions).values({
    tableSessionId: tableSession3.id,
    displayName: 'Alex Morgan',
    contact: 'alex@example.com',
    isHostGuest: true,
    otpVerifiedAt: new Date(now.getTime() - 44 * 60 * 1000),
    status: 'ACTIVE',
  }).returning();
  if (!guestSession3Host) throw new Error('Failed to create guestSession3Host');

  // 5C. Table 4 (Downtown HQ): Multi-Guest Split-Bill Session (Bill Requested)
  const [tableSession4] = await db.insert(schema.tableSessions).values({
    branchId: branches.branch1.id,
    tableId: t4.id,
    joinCode: 'JOIN104',
    partySize: 3,
    status: 'BILL_REQUESTED',
    openedByStaffId: staff.waiter1.id,
    startedAt: new Date(now.getTime() - 90 * 60 * 1000),
  }).returning();
  if (!tableSession4) throw new Error('Failed to create tableSession4');

  const [guestSession4Host] = await db.insert(schema.guestSessions).values({
    tableSessionId: tableSession4.id,
    displayName: 'Michael Scott',
    contact: 'michael@dunder.example',
    isHostGuest: true,
    otpVerifiedAt: new Date(now.getTime() - 88 * 60 * 1000),
    status: 'ACTIVE',
  }).returning();

  const [guestSession4Dwight] = await db.insert(schema.guestSessions).values({
    tableSessionId: tableSession4.id,
    displayName: 'Dwight Schrute',
    contact: 'dwight@dunder.example',
    isHostGuest: false,
    otpVerifiedAt: new Date(now.getTime() - 85 * 60 * 1000),
    status: 'ACTIVE',
  }).returning();

  if (!guestSession4Host || !guestSession4Dwight) {
    throw new Error('Failed to create guest sessions for table 4');
  }

  // 5D. Table 5 (Downtown HQ): Occupied Seated Session (John Doe)
  const [tableSession5] = await db.insert(schema.tableSessions).values({
    branchId: branches.branch1.id,
    tableId: t5.id,
    joinCode: 'JOIN105',
    partySize: 2,
    status: 'ACTIVE',
    startedAt: new Date(now.getTime() - 10 * 60 * 1000),
  }).returning();
  if (!tableSession5) throw new Error('Failed to create tableSession5');

  const [guestSession5] = await db.insert(schema.guestSessions).values({
    tableSessionId: tableSession5.id,
    customerId: customers.customer2.id,
    displayName: 'John Doe',
    isHostGuest: true,
    otpVerifiedAt: new Date(now.getTime() - 9 * 60 * 1000),
    status: 'ACTIVE',
  }).returning();
  if (!guestSession5) throw new Error('Failed to create guestSession5');

  // 5E. Table 6 (Downtown HQ): Serving Session
  const [tableSession6] = await db.insert(schema.tableSessions).values({
    branchId: branches.branch1.id,
    tableId: t6.id,
    joinCode: 'JOIN106',
    partySize: 4,
    status: 'ACTIVE',
    openedByStaffId: staff.waiter1.id,
    startedAt: new Date(now.getTime() - 60 * 60 * 1000),
  }).returning();
  if (!tableSession6) throw new Error('Failed to create tableSession6');

  const [guestSession6] = await db.insert(schema.guestSessions).values({
    tableSessionId: tableSession6.id,
    displayName: 'Emily Blunt',
    contact: 'emily@example.com',
    isHostGuest: true,
    otpVerifiedAt: new Date(now.getTime() - 58 * 60 * 1000),
    status: 'ACTIVE',
  }).returning();
  if (!guestSession6) throw new Error('Failed to create guestSession6');

  // 5F. Table W-01 (Uptown Lounge): Active Dining Session
  const [tableSessionW1] = await db.insert(schema.tableSessions).values({
    branchId: branches.branch2.id,
    tableId: w1.id,
    joinCode: 'JOIN201',
    partySize: 2,
    status: 'ACTIVE',
    openedByStaffId: staff.waiter2.id,
    startedAt: new Date(now.getTime() - 20 * 60 * 1000),
  }).returning();
  if (!tableSessionW1) throw new Error('Failed to create tableSessionW1');

  const [guestSessionW1] = await db.insert(schema.guestSessions).values({
    tableSessionId: tableSessionW1.id,
    displayName: 'David Sterling',
    contact: 'admin2@tavonza.ai',
    isHostGuest: true,
    otpVerifiedAt: new Date(now.getTime() - 19 * 60 * 1000),
    status: 'ACTIVE',
  }).returning();
  if (!guestSessionW1) throw new Error('Failed to create guestSessionW1');

  return {
    t1,
    t2,
    t3,
    t4,
    t5,
    t6,
    p3,
    w1,
    waiterAssignmentsMap,
    tableSession1,
    tableSession3,
    tableSession4,
    tableSession5,
    tableSession6,
    tableSessionW1,
    guestSession1,
    guestSession3Host,
    guestSession4Host,
    guestSession4Dwight,
    guestSession5,
    guestSession6,
    guestSessionW1,
  };
}
