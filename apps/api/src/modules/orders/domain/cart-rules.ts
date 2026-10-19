// ============================================================================
// Cart Rules — pure validation & pricing for the customer cart
// ============================================================================
// Prices are always recomputed from the catalog; nothing the client sends is
// trusted as a price.
// ============================================================================

import { createHash } from 'node:crypto';

export const MAX_LINE_QUANTITY = 50;
export const MAX_CART_LINES = 50;
export const MAX_INSTRUCTIONS_LENGTH = 500;

export class CartRuleError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = 'CartRuleError';
    this.code = code;
  }
}

export function normalizeInstructions(value: string | null | undefined): string | null {
  const trimmed = (value ?? '').trim();
  if (!trimmed) return null;
  if (trimmed.length > MAX_INSTRUCTIONS_LENGTH) {
    throw new CartRuleError(
      'INSTRUCTIONS_TOO_LONG',
      `Special instructions must be ${MAX_INSTRUCTIONS_LENGTH} characters or fewer`,
    );
  }
  return trimmed;
}

/** Identical menu item + modifiers + instructions collapse into one cart line. */
export function buildLineKey(
  menuItemId: string,
  modifierIds: readonly string[],
  instructions: string | null,
): string {
  const canonical = JSON.stringify([
    menuItemId,
    [...new Set(modifierIds)].sort(),
    instructions ?? '',
  ]);
  return createHash('sha256').update(canonical).digest('hex');
}

export function assertQuantity(quantity: number): void {
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new CartRuleError('INVALID_QUANTITY', 'Quantity must be a whole number of at least 1');
  }
  if (quantity > MAX_LINE_QUANTITY) {
    throw new CartRuleError(
      'QUANTITY_LIMIT',
      `You can order at most ${MAX_LINE_QUANTITY} of a single item`,
    );
  }
}

export interface CatalogItem {
  id: string;
  name: string;
  basePrice: number;
  isAvailable: boolean | null;
  isStockTracked: boolean | null;
  stockQuantity: number | null;
  restaurantId: string;
}

export interface CatalogModifier {
  id: string;
  name: string;
  priceDelta: number | null;
  isAvailable: boolean | null;
  menuItemId: string;
  groupName: string;
}

export function assertItemOrderable(item: CatalogItem, quantity: number): void {
  if (!item.isAvailable) {
    throw new CartRuleError('ITEM_UNAVAILABLE', `"${item.name}" is currently unavailable`);
  }
  if (item.isStockTracked && (item.stockQuantity ?? 0) < quantity) {
    throw new CartRuleError(
      'INSUFFICIENT_STOCK',
      `Only ${Math.max(item.stockQuantity ?? 0, 0)} of "${item.name}" available`,
    );
  }
}

/** Resolves requested modifier ids against the item's own, available modifiers. */
export function resolveModifiers(
  item: CatalogItem,
  requestedIds: readonly string[],
  available: readonly CatalogModifier[],
): CatalogModifier[] {
  const unique = [...new Set(requestedIds)];
  const byId = new Map(available.map((modifier) => [modifier.id, modifier]));
  return unique.map((id) => {
    const modifier = byId.get(id);
    if (!modifier || modifier.menuItemId !== item.id) {
      throw new CartRuleError('INVALID_MODIFIER', `An add-on selected for "${item.name}" is not offered for this item`);
    }
    if (!modifier.isAvailable) {
      throw new CartRuleError('MODIFIER_UNAVAILABLE', `Add-on "${modifier.name}" is currently unavailable`);
    }
    return modifier;
  });
}

export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export function priceLine(
  item: CatalogItem,
  modifiers: readonly CatalogModifier[],
  quantity: number,
): { unitPrice: number; lineTotal: number } {
  const addOns = modifiers.reduce((sum, modifier) => sum + Math.max(modifier.priceDelta ?? 0, 0), 0);
  const unitPrice = roundMoney(item.basePrice + addOns);
  return { unitPrice, lineTotal: roundMoney(unitPrice * quantity) };
}

export function computeTotals(
  subtotal: number,
  rates: { taxPercent: number; serviceChargePercent: number },
): { subtotal: number; serviceCharge: number; tax: number; total: number } {
  const roundedSubtotal = roundMoney(subtotal);
  const serviceCharge = roundMoney(roundedSubtotal * (rates.serviceChargePercent / 100));
  const tax = roundMoney(roundedSubtotal * (rates.taxPercent / 100));
  return {
    subtotal: roundedSubtotal,
    serviceCharge,
    tax,
    total: roundMoney(roundedSubtotal + serviceCharge + tax),
  };
}

export function assertItemServedAtBranch(item: CatalogItem, branchRestaurantId: string): void {
  if (item.restaurantId !== branchRestaurantId) {
    throw new CartRuleError('ITEM_NOT_ON_MENU', `"${item.name}" is not on this branch's menu`);
  }
}

/** A cart is pinned to one branch; adding from another branch is rejected while it has items. */
export function assertSameBranch(cartBranchId: string | null, hasItems: boolean, branchId: string): void {
  if (hasItems && cartBranchId && cartBranchId !== branchId) {
    throw new CartRuleError(
      'BRANCH_MISMATCH',
      'Your cart has items from another restaurant branch. Place or clear that order first.',
    );
  }
}

export function snapshotName(item: CatalogItem, modifiers: readonly CatalogModifier[]): string {
  if (modifiers.length === 0) return item.name;
  const names = modifiers.map((modifier) => modifier.name).join(', ');
  return `${item.name} (${names})`.slice(0, 255);
}

export function stationForCategory(categoryName: string | null | undefined): 'KITCHEN' | 'BAR' {
  return categoryName && /drink|beverage|bar|cocktail|wine|beer|water|juice/i.test(categoryName) ? 'BAR' : 'KITCHEN';
}

/** Codes that describe a conflict with current catalog/cart state rather than a malformed request. */
export const CONFLICT_RULE_CODES: ReadonlySet<string> = new Set([
  'BRANCH_MISMATCH',
  'INSUFFICIENT_STOCK',
  'ITEM_UNAVAILABLE',
  'MODIFIER_UNAVAILABLE',
  'CART_CHANGED',
  'IDEMPOTENCY_KEY_REUSED',
]);

const IDEMPOTENCY_KEY_PATTERN = /^[A-Za-z0-9_-]{16,100}$/;

export function assertIdempotencyKey(key: string | undefined): string {
  if (!key || !IDEMPOTENCY_KEY_PATTERN.test(key)) {
    throw new CartRuleError(
      'IDEMPOTENCY_KEY_REQUIRED',
      'An Idempotency-Key header (16-100 letters, digits, "-" or "_") is required to place an order',
    );
  }
  return key;
}
