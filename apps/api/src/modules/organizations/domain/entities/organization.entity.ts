// ============================================================================
// Organization Domain Entity
// ============================================================================

export interface Organization {
  id: string;
  name: string;
  ownerId: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}
