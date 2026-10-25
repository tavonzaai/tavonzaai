import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { schema } from '../../database';

// Export Zod schemas for all tables
export const insertOrganizationSchema = createInsertSchema(schema.organizations as any);
export const selectOrganizationSchema = createSelectSchema(schema.organizations as any);

export const insertRestaurantSchema = createInsertSchema(schema.restaurants as any);
export const selectRestaurantSchema = createSelectSchema(schema.restaurants as any);

export const insertBranchSchema = createInsertSchema(schema.branches as any);
export const selectBranchSchema = createSelectSchema(schema.branches as any);

export const insertUserSchema = createInsertSchema(schema.users as any);
export const selectUserSchema = createSelectSchema(schema.users as any);

export const insertOrderSchema = createInsertSchema(schema.orders as any);
export const selectOrderSchema = createSelectSchema(schema.orders as any);

export const insertTableSessionSchema = createInsertSchema(schema.tableSessions as any);
export const selectTableSessionSchema = createSelectSchema(schema.tableSessions as any);

export const insertGuestSessionSchema = createInsertSchema(schema.guestSessions as any);
export const selectGuestSessionSchema = createSelectSchema(schema.guestSessions as any);

export const insertPaymentSchema = createInsertSchema(schema.payments as any);
export const selectPaymentSchema = createSelectSchema(schema.payments as any);

export const insertOutboxEventSchema = createInsertSchema(schema.outboxEvents as any);
export const selectOutboxEventSchema = createSelectSchema(schema.outboxEvents as any);
