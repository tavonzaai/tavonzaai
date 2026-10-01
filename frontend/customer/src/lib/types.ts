export interface Meta {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
}

export type GlobalRole = "SUPER_ADMIN" | "ADMIN" | "RESTAURANT_OWNER" | "STAFF" | "CUSTOMER";

export type UserStatus = "ACTIVE" | "INACTIVE" | "BANNED" | "DELETED";

/**
 * The subset of `GET /auth/get-me` that is safe to render.
 *
 * The endpoint returns the raw Prisma user row, which includes the bcrypt hash on
 * `password`; it is dropped in the DAL so it can never reach a component.
 */
export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: GlobalRole;
  status: UserStatus;
  avatar?: string | null;
  contactNo?: string | null;
  createdAt: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
}

/** Result shape every server action returns to its form. */
export interface ActionResult {
  success: boolean;
  message: string;
}
