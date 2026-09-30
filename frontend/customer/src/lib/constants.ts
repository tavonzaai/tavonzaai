/**
 * Shared constants with no server-only imports, so both the session helper
 * (which uses `next/headers`) and any middleware can read them.
 */

/**
 * Cookie holding the signed-in customer's JWT.
 *
 * Distinct from the backend's own `access_token`, the admin console's
 * `sa_session` and the web showcase's `guest_session`, so tokens from different
 * apps on the same host can never be mistaken for one another.
 */
export const CUSTOMER_COOKIE = "customer_session";
