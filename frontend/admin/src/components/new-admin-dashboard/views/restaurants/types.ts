export interface RestaurantFormData {
  organizationId?: string;
  name: string;
  slug?: string;
  logoUrl?: string;
  status: 'Active' | 'Setup' | 'Closed';
  description: string;
}
