import { cookies } from "next/headers";

import { CUSTOMER_COOKIE } from "./constants";
import type { Meta } from "./types";

/**
 * Server-side client for the Tavonza API.
 *
 * Importing `next/headers` keeps this module out of the browser bundle, so the
 * customer's token is never exposed to client JavaScript and no CORS is involved.
 */

function getCleanApiBaseUrl(): string {
  let url = (
    process.env["NEXT_PUBLIC_API_URL"] ??
    process.env["NEXT_PUBLIC_API_BASE_URL"] ??
    process.env["API_BASE_URL"] ??
    "https://prod-api.tavonza.com"
  ).trim();
  url = url.replace(/\/docs(-json)?\/?$/, "").replace(/\/$/, "");
  return url || "https://prod-api.tavonza.com";
}

const API_BASE_URL = getCleanApiBaseUrl();

export interface BackendFieldError {
  path: string;
  message: string;
}

/** A non-2xx response, carrying the API's own human-readable message. */
export class ApiError extends Error {
  readonly status: number;
  readonly fieldErrors: BackendFieldError[];

  constructor(status: number, message: string, fieldErrors: BackendFieldError[] = []) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }

  /**
   * DTO rejections arrive as a generic "Validation failed" with the useful text
   * in `errorMessages`, so prefer those when the top-level message is generic.
   */
  get displayMessage(): string {
    const details = this.fieldErrors.map((entry) => entry.message).filter(Boolean);
    if (details.length > 0 && (!this.message || this.message === "Validation failed")) {
      return details.join(". ");
    }
    return this.message || "Something went wrong. Please try again.";
  }
}

interface Envelope<T> {
  success?: boolean;
  message?: string;
  meta?: Meta | null;
  data?: T | null;
  errorMessages?: BackendFieldError[];
}

export interface ApiResult<T> {
  data: T;
  meta: Meta | null;
  message: string;
}

interface RequestOptions extends Omit<RequestInit, "headers"> {
  headers?: Record<string, string>;
  /** Use this token instead of the cookie — needed right after login. */
  token?: string | null;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<ApiResult<T>> {
  const { token: explicitToken, headers, ...init } = options;

  const token =
    explicitToken !== undefined
      ? explicitToken
      : (await cookies()).get(CUSTOMER_COOKIE)?.value;

  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${cleanPath}`, {
      ...init,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      cache: "no-store",
    });
  } catch (err: any) {
    throw new ApiError(0, err?.message || "Cannot reach the Tavonza API server.");
  }

  const rawJson = (await response.json().catch(() => null)) as any;

  if (!response.ok) {
    let errorMsg = `Request failed with status ${response.status}`;
    if (rawJson?.message) {
      errorMsg = Array.isArray(rawJson.message) ? rawJson.message.join(". ") : rawJson.message;
    } else if (rawJson?.error) {
      errorMsg = rawJson.error;
    }
    throw new ApiError(
      response.status,
      errorMsg,
      rawJson?.errorMessages ?? [],
    );
  }

  const dataPayload = (rawJson && typeof rawJson === "object" && "data" in rawJson)
    ? rawJson.data
    : rawJson;

  return {
    data: dataPayload as T,
    meta: rawJson?.meta ?? null,
    message: rawJson?.message ?? "Success",
  };
}

type QueryValue = string | number | boolean | undefined | null;

function toQueryString(params?: Record<string, QueryValue>): string {
  if (!params) return "";
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}

export function apiGet<T>(
  path: string,
  params?: Record<string, QueryValue>,
  options?: RequestOptions,
): Promise<ApiResult<T>> {
  return request<T>(`${path}${toQueryString(params)}`, { ...options, method: "GET" });
}

export function apiPost<T>(
  path: string,
  body?: unknown,
  options?: RequestOptions,
): Promise<ApiResult<T>> {
  return request<T>(path, {
    ...options,
    method: "POST",
    headers: { "Content-Type": "application/json", ...options?.headers },
    body: JSON.stringify(body ?? {}),
  });
}

export function apiPatch<T>(
  path: string,
  body?: unknown,
  options?: RequestOptions,
): Promise<ApiResult<T>> {
  return request<T>(path, {
    ...options,
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...options?.headers },
    body: JSON.stringify(body ?? {}),
  });
}
