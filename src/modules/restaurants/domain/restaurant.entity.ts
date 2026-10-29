// ============================================================================
// Restaurant Domain Entity
// ============================================================================

export interface Restaurant {
  id: string;
  organizationId: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  description?: string | null;
  isActive: boolean;
  status: string;
  address?: any | null;
  phone?: string | null;
  email?: string | null;
  websiteUrl?: string | null;
  coverImageUrl?: string | null;
  bannerUrl?: string | null;
  images?: string[] | null;
  createdAt: Date;
  updatedAt: Date;
}
