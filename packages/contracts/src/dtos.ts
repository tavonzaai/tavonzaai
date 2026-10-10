import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { schema } from '@tavonza/database';

// Export Zod schemas for all tables
export const insertOrganizationSchema = createInsertSchema(schema.organizations);
export const selectOrganizationSchema = createSelectSchema(schema.organizations);

export const insertRestaurantSchema = createInsertSchema(schema.restaurants);
export const selectRestaurantSchema = createSelectSchema(schema.restaurants);

export const insertBranchSchema = createInsertSchema(schema.branches);
export const selectBranchSchema = createSelectSchema(schema.branches);

export const insertUserSchema = createInsertSchema(schema.users);
export const selectUserSchema = createSelectSchema(schema.users);

export const insertOrderSchema = createInsertSchema(schema.orders);
export const selectOrderSchema = createSelectSchema(schema.orders);

export const insertTableSessionSchema = createInsertSchema(schema.tableSessions);
export const selectTableSessionSchema = createSelectSchema(schema.tableSessions);

export const insertGuestSessionSchema = createInsertSchema(schema.guestSessions);
export const selectGuestSessionSchema = createSelectSchema(schema.guestSessions);

export const insertPaymentSchema = createInsertSchema(schema.payments);
export const selectPaymentSchema = createSelectSchema(schema.payments);

export const insertOutboxEventSchema = createInsertSchema(schema.outboxEvents);
export const selectOutboxEventSchema = createSelectSchema(schema.outboxEvents);
