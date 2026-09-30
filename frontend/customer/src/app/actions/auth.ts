"use server";

import { revalidatePath } from "next/cache";

import { apiGet, apiPost, ApiError } from "@/lib/api";
import { createCustomerSession, deleteCustomerSession } from "@/lib/session";
import type { ActionResult, GlobalRole, LoginResponse } from "@/lib/types";

function toMessage(error: unknown): string {
  if (error instanceof ApiError) return error.displayMessage;
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}

interface MeResponse {
  id: string;
  name: string;
  email: string;
  role: GlobalRole;
}

/**
 * Signs in against `POST /auth/login` and stores the token in an httpOnly cookie.
 *
 * The backend issues tokens to every role, so the role is checked here — this is
 * the customer app, and a staff account signing in would land on a dashboard
 * with nothing it can do.
 */
export async function loginAction(email: string, password: string): Promise<ActionResult> {
  try {
    const { data } = await apiPost<LoginResponse>("/auth/login", { email, password });

    if (!data?.access_token) {
      return { success: false, message: "Login failed: the API returned no token." };
    }

    // Pass the token explicitly — the cookie is not set yet at this point.
    const me = await apiGet<MeResponse>("/auth/get-me", undefined, { token: data.access_token });

    if (me.data?.role !== "CUSTOMER") {
      return {
        success: false,
        message: "This is the customer app. Staff and admin accounts sign in elsewhere.",
      };
    }

    await createCustomerSession(data.access_token);
    revalidatePath("/", "layout");

    return { success: true, message: `Welcome back, ${me.data.name}.` };
  } catch (error) {
    return { success: false, message: toMessage(error) };
  }
}

/** `POST /auth/register` — creates a CUSTOMER account. */
export async function registerAction(input: {
  name: string;
  email: string;
  password: string;
  contactNo?: string;
}): Promise<ActionResult> {
  try {
    await apiPost("/auth/register", {
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      password: input.password,
      ...(input.contactNo ? { contactNo: input.contactNo.trim() } : {}),
      // RegisterCustomerDto requires a nested `customer` object even though every
      // field inside it is optional — omitting it fails validation outright.
      customer: {},
    });

    return {
      success: true,
      message: "Account created. You can sign in now.",
    };
  } catch (error) {
    return { success: false, message: toMessage(error) };
  }
}

/** `POST /auth/forgot-password` — emails a 6-digit reset code. */
export async function forgotPasswordAction(email: string): Promise<ActionResult> {
  try {
    await apiPost("/auth/forgot-password", { email: email.trim().toLowerCase() });
    return { success: true, message: "We've sent a 6-digit code to your email." };
  } catch (error) {
    return { success: false, message: toMessage(error) };
  }
}

/**
 * `POST /auth/reset-password` — the backend takes the email, code and new
 * password in one call, so the code is only really checked here.
 */
export async function resetPasswordAction(input: {
  email: string;
  otp: string;
  password: string;
  confirmPassword?: string;
}): Promise<ActionResult> {
  if (input.confirmPassword !== undefined && input.password !== input.confirmPassword) {
    return { success: false, message: "Those passwords don't match." };
  }

  try {
    await apiPost("/auth/reset-password", {
      email: input.email.trim().toLowerCase(),
      otp: input.otp.trim(),
      password: input.password,
    });

    return { success: true, message: "Password updated — you can sign in now." };
  } catch (error) {
    return { success: false, message: toMessage(error) };
  }
}

/** `POST /auth/change-password` — requires the current password. */
export async function changePasswordAction(input: {
  prevPass: string;
  newPass: string;
  confirmPassword?: string;
}): Promise<ActionResult> {
  if (input.confirmPassword !== undefined && input.newPass !== input.confirmPassword) {
    return { success: false, message: "Those passwords don't match." };
  }

  try {
    await apiPost("/auth/change-password", {
      prevPass: input.prevPass,
      newPass: input.newPass,
    });
    return { success: true, message: "Password updated." };
  } catch (error) {
    return { success: false, message: toMessage(error) };
  }
}

/** Clears the backend session (best effort) and our own cookie. */
export async function logoutAction(): Promise<void> {
  try {
    await apiPost("/auth/logout");
  } catch {
    // The local session is what matters; a failed API logout must not block sign-out.
  }
  await deleteCustomerSession();
  revalidatePath("/", "layout");
}
