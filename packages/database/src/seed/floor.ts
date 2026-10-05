import { createHash } from 'crypto';
import { minutesAgo, uid } from './constants';
import type { IdentityContext, StaffRef } from './identity';
import { one, schema, type Tx } from './types';

type ServiceStatus = (typeof schema.tableServiceStatusEnum.enumValues)[number];
type OpFlag = (typeof schema.tableOperationalFlagEnum.enumValues)[number];
type Shape = (typeof schema.shapeEnum.enumValues)[number];
type SessionStatus = (typeof schema.tableSessionStatusEnum.enumValues)[number];

export interface GuestRef {
  id: string;
  name: string;
  customerId: string | null;
}

export interface TableRef {
  label: string;
  tableId: string;
  qrCodeToken: string;
  waiter: StaffRef | null;
  waiterAssignmentId: string | null;
  sessionId: string | null;
  joinCode: string | null;
  guests: GuestRef[];
  serviceStatus: ServiceStatus;
  flag: OpFlag;
}

export type FloorContext = Record<string, TableRef>;

interface TableSpec {
  label: string;
  capacity: number;
  shape: Shape;
  floor: number;
  status: ServiceStatus;
  flag: OpFlag;
  waiter: keyof IdentityContext['waiters'] | null;
  session?: { status: SessionStatus; partySize: number; startedMinsAgo: number; guests: { name: string; customer?: 'sarah' | 'jordan' }[] };
}

const SPECS: TableSpec[] = [
  { label: 'T-01', capacity: 4, shape: 'SQUARE', floor: 1, status: 'OCCUPIED', flag: 'NORMAL', waiter: 'david',
    session: { status: 'ACTIVE', partySize: 2, startedMinsAgo: 18, guests: [{ name: 'Sarah Jenkins', customer: 'sarah' }] } },
  { label: 'T-02', capacity: 2, shape: 'CIRCLE', floor: 1, status: 'AVAILABLE', flag: 'NORMAL', waiter: 'david' },
  { label: 'T-03', capacity: 4, shape: 'RECTANGLE', floor: 1, status: 'PREPARING', flag: 'NORMAL', waiter: 'david',
    session: { status: 'ACTIVE', partySize: 4, startedMinsAgo: 40, guests: [{ name: 'Alex Morgan' }, { name: 'Priya Nair' }] } },
  { label: 'T-04', capacity: 6, shape: 'RECTANGLE', floor: 1, status: 'PAYMENT_PENDING', flag: 'NORMAL', waiter: 'david',
    session: { status: 'BILL_REQUESTED', partySize: 3, startedMinsAgo: 85, guests: [{ name: 'Michael Scott' }] } },
  { label: 'T-05', capacity: 4, shape: 'CIRCLE', floor: 1, status: 'SERVING', flag: 'NORMAL', waiter: 'david',
    session: { status: 'ACTIVE', partySize: 2, startedMinsAgo: 55, guests: [{ name: 'Pam Beesly' }] } },
  { label: 'T-06', capacity: 2, shape: 'SQUARE', floor: 1, status: 'ORDERING', flag: 'NORMAL', waiter: 'david',
    session: { status: 'ACTIVE', partySize: 2, startedMinsAgo: 4, guests: [{ name: 'Jim Halpert' }] } },
  { label: 'T-07', capacity: 4, shape: 'SQUARE', floor: 1, status: 'PREPARING', flag: 'NORMAL', waiter: 'sara',
    session: { status: 'ACTIVE', partySize: 4, startedMinsAgo: 60, guests: [{ name: 'Dwight Schrute' }] } },
  { label: 'T-08', capacity: 8, shape: 'RECTANGLE', floor: 2, status: 'AVAILABLE', flag: 'RESERVED', waiter: 'sara' },
  { label: 'T-09', capacity: 4, shape: 'HEXAGON', floor: 2, status: 'CLOSING', flag: 'NORMAL', waiter: 'sara',
    session: { status: 'CLOSING', partySize: 2, startedMinsAgo: 95, guests: [{ name: 'Sarah Jenkins', customer: 'sarah' }, { name: 'Jordan Lee', customer: 'jordan' }] } },
  { label: 'T-10', capacity: 2, shape: 'CIRCLE', floor: 2, status: 'AVAILABLE', flag: 'CLEANING', waiter: 'sara' },
  { label: 'T-11', capacity: 4, shape: 'SQUARE', floor: 2, status: 'OCCUPIED', flag: 'NORMAL', waiter: 'mike',
    session: { status: 'ACTIVE', partySize: 3, startedMinsAgo: 30, guests: [{ name: 'Angela Martin' }] } },
  { label: 'T-12', capacity: 6, shape: 'RECTANGLE', floor: 2, status: 'AVAILABLE', flag: 'OUT_OF_SERVICE', waiter: null },
];

/** Stable opaque token per table (not guessable from the label alone, but identical across reseeds). */
const qrToken = (label: string) => createHash('sha256').update(`tavonza-seed-qr:${label}`).digest('hex').slice(0, 32);
const joinCodeFor = (i: number) => `TVZ${(1000 + i * 37).toString(36).toUpperCase()}`.slice(0, 8);

export const seedFloor = async (tx: Tx, id: IdentityContext, now: Date): Promise<FloorContext> => {
  const floor: FloorContext = {};
  const shiftStart = minutesAgo(now, 4 * 60);
  const shiftEnd = new Date(now.getTime() + 6 * 3600_000);

  for (const [i, spec] of SPECS.entries()) {
    const table = one(
      await tx.insert(schema.tables).values({
        id: uid(20, i + 1), branchId: id.branchId, label: spec.label, capacity: spec.capacity, shape: spec.shape,
        floor: spec.floor, serviceStatus: spec.status, operationalFlag: spec.flag, qrCodeToken: qrToken(spec.label),
      }).returning(),
      `table ${spec.label}`,
    );

    const waiter = spec.waiter ? id.waiters[spec.waiter] : null;
    let waiterAssignmentId: string | null = null;
    if (waiter) {
      const a = one(
        await tx.insert(schema.waiterTableAssignments).values({
          id: uid(21, i + 1), branchId: id.branchId, tableId: table.id, waiterId: waiter.staffId,
          assignedById: id.manager.staffId, sessionStart: shiftStart, sessionEnd: shiftEnd, isActive: true,
        }).returning(),
        `assignment ${spec.label}`,
      );
      waiterAssignmentId = a.id;
    }

    let sessionId: string | null = null;
    let joinCode: string | null = null;
    const guests: GuestRef[] = [];
    if (spec.session) {
      joinCode = joinCodeFor(i + 1);
      const session = one(
        await tx.insert(schema.tableSessions).values({
          id: uid(22, i + 1), tableId: table.id, branchId: id.branchId, joinCode, partySize: spec.session.partySize,
          status: spec.session.status, openedByStaffId: waiter?.staffId ?? id.manager.staffId,
          startedAt: minutesAgo(now, spec.session.startedMinsAgo),
        }).returning(),
        `session ${spec.label}`,
      );
      sessionId = session.id;

      for (const [g, guest] of spec.session.guests.entries()) {
        const customerId = guest.customer ? id.customers[guest.customer].customerId : null;
        const row = one(
          await tx.insert(schema.guestSessions).values({
            id: uid(23, (i + 1) * 10 + g), tableSessionId: session.id, customerId, displayName: guest.name,
            seatLabel: `Seat ${g + 1}`, isHostGuest: g === 0, status: 'ACTIVE',
            otpVerifiedAt: minutesAgo(now, spec.session.startedMinsAgo - 1),
            joinedAt: minutesAgo(now, spec.session.startedMinsAgo - g),
          }).returning(),
          `guest ${guest.name}`,
        );
        guests.push({ id: row.id, name: guest.name, customerId });
      }
    }

    floor[spec.label] = {
      label: spec.label, tableId: table.id, qrCodeToken: table.qrCodeToken ?? qrToken(spec.label), waiter, waiterAssignmentId,
      sessionId, joinCode, guests, serviceStatus: spec.status, flag: spec.flag,
    };
  }

  // A completed historical session per day is created by the orders module for past orders.
  console.log(`🪑 Seeded ${SPECS.length} tables with QR tokens, waiter assignments and live sessions`);
  return floor;
};
