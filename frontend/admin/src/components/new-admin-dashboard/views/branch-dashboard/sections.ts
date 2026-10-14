import type { SubTab } from './types';

export const BRANCH_SECTIONS = ['overview', 'tables', 'menu', 'staff'] as const;

export type BranchSection = (typeof BRANCH_SECTIONS)[number];

const SECTION_ALIASES: Record<string, BranchSection> = {
  menus: 'menu',
  stuffs: 'staff',
  stuff: 'staff',
};

export function isBranchSection(value: string): value is BranchSection {
  return (BRANCH_SECTIONS as readonly string[]).includes(value);
}

/** Canonical section slug, or null when the path segment is unknown. */
export function canonicalBranchSection(raw?: string | null): BranchSection | null {
  const value = (raw || '').trim().toLowerCase();
  if (!value) return null;
  if (isBranchSection(value)) return value;
  return SECTION_ALIASES[value] ?? null;
}

export function sectionToSubTab(section: BranchSection): SubTab {
  switch (section) {
    case 'tables':
      return 'Tables';
    case 'menu':
      return 'Menu';
    case 'staff':
      return 'Staff';
    default:
      return 'Overview';
  }
}

export function subTabToSection(tab: SubTab): BranchSection {
  switch (tab) {
    case 'Tables':
      return 'tables';
    case 'Menu':
      return 'menu';
    case 'Staff':
      return 'staff';
    default:
      return 'overview';
  }
}

export const STAFF_ROLE_OPTIONS = [
  { value: 'BRANCH_MANAGER', label: 'Branch Manager' },
  { value: 'HOST', label: 'Host' },
  { value: 'WAITER', label: 'Waiter' },
  { value: 'KITCHEN_STAFF', label: 'Kitchen' },
  { value: 'BARTENDER', label: 'Bartender' },
  { value: 'CASHIER', label: 'Cashier' },
] as const;

export type StaffStatusFilter = 'All' | 'Active' | 'Inactive';

export function branchDetailPath(branchId: string, section: BranchSection = 'overview') {
  return `/new-admin-dashboard/branches/${branchId}/${section}`;
}
