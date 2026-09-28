// ============================================================================
// Menu Domain — Diet Types
// ============================================================================
// Using `as const` instead of TypeScript enum for flexibility.
// The values are just strings — no rigid enum constraint.
// ============================================================================

export const DIET_TYPES = ['VEGETARIAN', 'VEGAN', 'GLUTEN_FREE'] as const;

export type DietType = (typeof DIET_TYPES)[number];
