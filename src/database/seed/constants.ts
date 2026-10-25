// ============================================================================
// Seed Constants & Helper Utilities
// ============================================================================

// Verified Argon2id password hashes for testing:
export const SUPERADMIN_HASH = '$argon2id$v=19$m=65536,p=4,t=3$18N3tRXK/GC0Ozhb18sYow$jnqpKklyFXTy6KbTm+GZIJlw+67tMK8edrD8nhZYLwA'; // SuperAdmin@1234
export const OWNER_HASH      = '$argon2id$v=19$m=65536,p=4,t=3$TMEkugrsrGzIK/EXRJT8aQ$jKN9rfcenCaEAxrgJGPnomLcyRP7z70GsODVFS0QEX8'; // Owner@1234
export const MANAGER_HASH    = '$argon2id$v=19$m=65536,p=4,t=3$vN2/ffOGgFgpdkc/ldKWCg$34M5mZ/9G3vK+CWIdWGus9V54JDFrs6jgmzKAYfQWgo'; // Manager@1234
export const WAITER_HASH     = '$argon2id$v=19$m=65536,p=4,t=3$c0hP1AzgorMwvVdiAlbWoA$XCcQ75wlaCXI9HBWtMRsz7IQ/ohHnJHFhz09mrCzIk8'; // Waiter@1234
export const CASHIER_HASH    = '$argon2id$v=19$m=65536,p=4,t=3$N+smfOv/2C7f4IxLkj//cQ$p2wRhV/ZlY/t8j2VajXyeII5WKLEhwuTkaDaBwOpAbk'; // Cashier@1234
export const KITCHEN_HASH    = '$argon2id$v=19$m=65536,p=4,t=3$M1QFcCaN5w11y463r11sUA$QE1aokqs+Lc52Px0Fc5cRRSzkD93abkohhf5MYdL3Bw'; // Kitchen@1234
export const BARTENDER_HASH  = '$argon2id$v=19$m=65536,p=4,t=3$S68sVVcm9b562kd7arcDFA$wCRAVf1hEM8haoLtoNoWSgAWIj6ahZMgIM+sfTGAXkY'; // Bartender@1234
export const HOST_HASH       = '$argon2id$v=19$m=65536,p=4,t=3$B45VMrMZZGDFyaq3sz2iew$d/d8gqk6I2AMjiomjxo7wjeERk9EjtURdSRCXG9xNUs'; // Host@1234
export const CUSTOMER_HASH   = '$argon2id$v=19$m=65536,p=4,t=3$9xEReGfA9T3slHzmViaBSg$kz6uShvGNyojbnI1zxHzWMWhfoG5FHQluhh0OdC+CaY'; // Customer@1234

export const DEFAULT_BRANCH_ID = 'ce7b4318-5e2e-4fcd-a459-0e1bc80a6f27';

/**
 * Calculates accurate tax, service charge, and total rounded to 2 decimal places.
 */
export function calcOrderTotals(subtotal: number, taxRate = 0.08, serviceRate = 0.05) {
  const taxAmount = Math.round(subtotal * taxRate * 100) / 100;
  const serviceCharge = Math.round(subtotal * serviceRate * 100) / 100;
  const totalAmount = Math.round((subtotal + taxAmount + serviceCharge) * 100) / 100;
  return { subtotal, taxAmount, serviceCharge, totalAmount };
}
