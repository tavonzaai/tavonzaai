// ============================================================================
// Schema Index — Re-exports all table definitions and relations
// ============================================================================
// This single entry point is used by:
//   1. drizzle.config.ts — for migration generation
//   2. DrizzleService — for typed query builder
// ============================================================================

export * from './menu.schema';
export * from './order.schema';
export * from './user.schema';
export * from './session.schema';
export * from './staff.schema';
export * from './alert.schema';


