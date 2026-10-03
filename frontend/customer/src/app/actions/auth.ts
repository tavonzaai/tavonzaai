"use server";

import { revalidatePath } from "next/cache";
import { apiGet, apiPost, ApiError } from "@/lib/api";
import { createCustomerSession, deleteCustomerSession } from "@/lib/session";
import type { ActionResult } from "@/lib/types";

function toMessage(error: unknown): string {
  if (error instanceof ApiError) return error.displayMessage;
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}

export interface MeResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: MeResponse;
}

/**
 * Signs in against `POST /auth/login` and stores the token in an httpOnly cookie.
 */
export async function loginAction(email: string, password: string): Promise<ActionResult> {
  try {
    const { data } = await apiPost<any>("/auth/login", {
      email: email.trim().toLowerCase(),
      password,
    });

    const token = data?.accessToken || data?.access_token;
    if (!token) {
      return { success: false, message: "Login failed: No access token received from server." };
    }

    // Verify current user
    const me = await apiGet<MeResponse>("/auth/me", undefined, { token });
    const userRole = (me.data?.role || "").toUpperCase();

    if (userRole && userRole !== "CUSTOMER") {
      return {
        success: false,
        message: "This is the customer app. Staff and admin accounts sign in elsewhere.",
      };
    }

    await createCustomerSession(token);
    revalidatePath("/", "layout");

    const displayName = `${me.data?.firstName || ""} ${me.data?.lastName || ""}`.trim() || me.data?.email;
    return { success: true, message: `Welcome back, ${displayName}.` };
  } catch (error) {
    return { success: false, message: toMessage(error) };
  }
}

/** `POST /auth/register` — creates a customer account */
export async function registerAction(input: {
  firstName?: string;
  lastName?: string;
  name?: string;
  email: string;
  password: string;
  phone?: string;
  contactNo?: string;
}): Promise<ActionResult> {
  try {
    let fName = (input.firstName || "").trim();
    let lName = (input.lastName || "").trim();

    if (!fName && input.name) {
      const parts = input.name.trim().split(" ");
      fName = parts[0] || "Guest";
      lName = parts.slice(1).join(" ") || "User";
    }

    const phoneVal = (input.phone || input.contactNo || "").trim() || undefined;

    await apiPost("/auth/register", {
      firstName: fName || "Customer",
      lastName: lName || "User",
      email: input.email.trim().toLowerCase(),
      phone: phoneVal,
      password: input.password,
    });

    return {
      success: true,
      message: "Account created successfully. A verification code has been sent to your email.",
    };
  } catch (error) {
    return { success: false, message: toMessage(error) };
  }
}

/** `POST /auth/verify-otp` — verifies 5-digit OTP */
export async function verifyOtpAction(input: {
  email: string;
  code: string;
  type?: 'email_verification' | 'phone_verification' | 'password_reset';
}): Promise<ActionResult> {
  try {
    const res = await apiPost<any>("/auth/verify-otp", {
      email: input.email.trim().toLowerCase(),
      code: input.code.trim(),
      type: input.type || "email_verification",
    });

    return {
      success: true,
      message: res.data?.message || res.message || "Verification successful!",
    };
  } catch (error) {
    return { success: false, message: toMessage(error) };
  }
}

/** `POST /auth/resend-otp` — resends 5-digit OTP */
export async function resendOtpAction(input: {
  email: string;
  type?: 'email_verification' | 'phone_verification' | 'password_reset';
}): Promise<ActionResult> {
  try {
    const res = await apiPost<any>("/auth/resend-otp", {
      email: input.email.trim().toLowerCase(),
      type: input.type || "email_verification",
    });

    return {
      success: true,
      message: res.data?.message || res.message || "A new verification code has been sent.",
    };
  } catch (error) {
    return { success: false, message: toMessage(error) };
  }
}

/** `POST /auth/forgot-password` — sends password reset OTP */
export async function forgotPasswordAction(email: string): Promise<ActionResult> {
  try {
    const res = await apiPost<any>("/auth/forgot-password", {
      email: email.trim().toLowerCase(),
    });
    return {
      success: true,
      message: res.data?.message || res.message || "We've sent a 5-digit reset code to your email.",
    };
  } catch (error) {
    return { success: false, message: toMessage(error) };
  }
}

/** `POST /auth/reset-password` — resets password with 5-digit code */
export async function resetPasswordAction(input: {
  email: string;
  otp?: string;
  code?: string;
  password?: string;
  newPassword?: string;
  confirmPassword?: string;
}): Promise<ActionResult> {
  const chosenPass = input.newPassword || input.password || "";
  if (input.confirmPassword !== undefined && chosenPass !== input.confirmPassword) {
    return { success: false, message: "Those passwords don't match." };
  }

  const codeVal = (input.code || input.otp || "").trim();

  try {
    const res = await apiPost<any>("/auth/reset-password", {
      email: input.email.trim().toLowerCase(),
      code: codeVal,
      newPassword: chosenPass,
    });

    return {
      success: true,
      message: res.data?.message || res.message || "Password updated successfully. You can sign in now.",
    };
  } catch (error) {
    return { success: false, message: toMessage(error) };
  }
}

/** Clears the backend session and customer session cookie */
export async function logoutAction(): Promise<void> {
  try {
    await apiPost("/auth/logout");
  } catch {
    // Non-blocking
  }
  await deleteCustomerSession();
  revalidatePath("/", "layout");
}
