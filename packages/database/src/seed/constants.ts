/**
 * Fixed identifiers, credentials and pricing rules shared by every seed module.
 * IDs are deterministic so that test URLs, QR links and bookmarks survive a reseed.
 */

/** Deterministic UUID: `<group>` picks the entity family, `<n>` the row. */
export const uid = (group: number, n: number): string =>
  `${group.toString(16).padStart(8, '0')}-0000-4000-8000-${n.toString(16).padStart(12, '0')}`;

// Must match DEFAULT_BRANCH_ID used by the manager / waiter / customer frontends.
export const DEFAULT_BRANCH_ID = 'ce7b4318-5e2e-4fcd-a459-0e1bc80a6f27';

// Verified Argon2id hashes (same values as the original seed).
export const HASH = {
  OWNER: '$argon2id$v=19$m=65536,p=4,t=3$TMEkugrsrGzIK/EXRJT8aQ$jKN9rfcenCaEAxrgJGPnomLcyRP7z70GsODVFS0QEX8', // Owner@1234
  MANAGER: '$argon2id$v=19$m=65536,p=4,t=3$vN2/ffOGgFgpdkc/ldKWCg$34M5mZ/9G3vK+CWIdWGus9V54JDFrs6jgmzKAYfQWgo', // Manager@1234
  CUSTOMER: '$argon2id$v=19$m=65536,p=4,t=3$9xEReGfA9T3slHzmViaBSg$kz6uShvGNyojbnI1zxHzWMWhfoG5FHQluhh0OdC+CaY', // Customer@1234
  WAITER: '$argon2id$v=19$m=65536,p=4,t=3$c0hP1AzgorMwvVdiAlbWoA$XCcQ75wlaCXI9HBWtMRsz7IQ/ohHnJHFhz09mrCzIk8', // Waiter@1234
  CASHIER: '$argon2id$v=19$m=65536,p=4,t=3$N+smfOv/2C7f4IxLkj//cQ$p2wRhV/ZlY/t8j2VajXyeII5WKLEhwuTkaDaBwOpAbk', // Cashier@1234
  KITCHEN: '$argon2id$v=19$m=65536,p=4,t=3$M1QFcCaN5w11y463r11sUA$QE1aokqs+Lc52Px0Fc5cRRSzkD93abkohhf5MYdL3Bw', // Kitchen@1234
} as const;

export const PRICING = {
  currency: 'USD',
  taxPercent: 8,
  serviceChargePct: 5,
} as const;

export const round2 = (n: number): number => Math.round(n * 100) / 100;

/** Computes order money fields from line items so totals always reconcile. */
export const priceOrder = (lines: { unitPrice: number; quantity: number }[], discountAmount = 0) => {
  const subtotal = round2(lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0));
  const taxable = Math.max(0, subtotal - discountAmount);
  const taxAmount = round2((taxable * PRICING.taxPercent) / 100);
  const serviceCharge = round2((taxable * PRICING.serviceChargePct) / 100);
  const totalAmount = round2(taxable + taxAmount + serviceCharge);
  return { subtotal, discountAmount, taxAmount, serviceCharge, totalAmount };
};

export const minutesAgo = (now: Date, m: number) => new Date(now.getTime() - m * 60_000);
export const daysAgo = (now: Date, d: number, hour = 13) => {
  const x = new Date(now);
  x.setDate(x.getDate() - d);
  x.setHours(hour, 0, 0, 0);
  return x;
};
export const isoDate = (d: Date) => d.toISOString().slice(0, 10);

/** Public customer app base URL used for printed QR / test links. */
export const CUSTOMER_APP_URL = process.env.SEED_CUSTOMER_APP_URL || 'http://localhost:3100';
