import type { RestaurantItem, BranchItem } from '@/components/new-admin-dashboard/types';
import type { BackendBranch, BackendRestaurant } from '@/redux/features/restaurantApi';

export function parseBranchAddress(raw: string) {
  const parts = raw
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
  return {
    street: parts[0] || raw || 'Address pending',
    city: parts[1] || parts[0] || 'Unknown',
    country: parts[2] || 'US',
  };
}

export function formatBranchAddress(address: BackendBranch['address'] | null | undefined): string {
  if (!address) return '';
  if (typeof address === 'string') return address;
  return [address.street, address.line1, address.city, address.state, address.country]
    .filter(Boolean)
    .filter((value, index, all) => all.indexOf(value) === index)
    .join(', ');
}

export function mapRestaurant(
  restaurant: BackendRestaurant,
  branchesCount = 0,
): RestaurantItem {
  return {
    id: restaurant.id,
    organizationId: restaurant.organizationId,
    name: restaurant.name,
    slug: restaurant.slug,
    logoUrl: restaurant.logoUrl ?? undefined,
    description: restaurant.description ?? undefined,
    branchesCount,
    status: restaurant.isActive ? 'Active' : 'Closed',
  };
}

export function mapBranch(
  branch: BackendBranch,
  restaurantName = '',
): BranchItem {
  return {
    id: branch.id,
    restaurantId: branch.restaurantId,
    restaurantName,
    name: branch.name,
    location: formatBranchAddress(branch.address),
    manager: '',
    contactNumber: branch.phone,
    status: branch.isActive ? 'Active' : 'Closed',
  };
}

export function unwrapList<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === 'object' && Array.isArray((payload as any).data)) {
    return (payload as any).data as T[];
  }
  return [];
}
