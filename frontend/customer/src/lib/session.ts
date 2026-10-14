import { cookies } from "next/headers";

import { CUSTOMER_COOKIE } from "./constants";

export { CUSTOMER_COOKIE };

/** Matches the backend's 7d access-token lifetime (JWT_EXPIRES_IN). */
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export async function createCustomerSession(accessToken: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(CUSTOMER_COOKIE, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function getCustomerToken(): Promise<string | undefined> {
  return (await cookies()).get(CUSTOMER_COOKIE)?.value;
}

export async function deleteCustomerSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(CUSTOMER_COOKIE);
  cookieStore.delete("access_token");
  cookieStore.delete("refresh_token");
  cookieStore.delete("tavonza_customer_session_id");
}
