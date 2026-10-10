import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode, type ApiFieldError } from '@tavonza/contracts';

export interface AppExceptionOptions {
  /** Field-level problems returned to the client as `errorMessages`. */
  errorMessages?: ApiFieldError[];
  /** Internal diagnostic context. Logged server-side, NEVER sent to the client. */
  details?: Record<string, unknown>;
  /** Underlying error, kept for logging and stack traces. */
  cause?: unknown;
}

/**
 * Base exception for all application-level errors.
 *
 * Prefer throwing one of the subclasses below over `throw new Error(...)` —
 * a plain `Error` is treated as an unexpected bug and always becomes a 500.
 */
export class AppException extends HttpException {
  readonly errorCode: ErrorCode;
  readonly errorMessages: ApiFieldError[];
  readonly details?: Record<string, unknown>;

  constructor(
    status: HttpStatus,
    errorCode: ErrorCode,
    message: string,
    options: AppExceptionOptions = {},
  ) {
    super({ statusCode: status, errorCode, message }, status, { cause: options.cause });
    this.errorCode = errorCode;
    this.errorMessages = options.errorMessages ?? [];
    this.details = options.details;
  }
}

/** 404 — a specific resource could not be found. */
export class ResourceNotFoundException extends AppException {
  constructor(resource: string, id?: string | number, options?: AppExceptionOptions) {
    super(
      HttpStatus.NOT_FOUND,
      ErrorCode.NOT_FOUND,
      id !== undefined ? `${resource} "${id}" was not found.` : `${resource} was not found.`,
      { ...options, details: { resource, id, ...options?.details } },
    );
  }
}

/** 409 — the request conflicts with the current state (duplicates, already-assigned, …). */
export class ResourceConflictException extends AppException {
  constructor(message: string, options?: AppExceptionOptions) {
    super(HttpStatus.CONFLICT, ErrorCode.CONFLICT, message, options);
  }
}

/** 422 — the request is well-formed but violates a domain/business rule. */
export class BusinessRuleException extends AppException {
  constructor(message: string, options?: AppExceptionOptions) {
    super(HttpStatus.UNPROCESSABLE_ENTITY, ErrorCode.BUSINESS_RULE_VIOLATION, message, options);
  }
}

/** 502 — a downstream dependency (S3, AI service, mail provider, …) failed. */
export class ExternalServiceException extends AppException {
  constructor(service: string, options?: AppExceptionOptions) {
    super(
      HttpStatus.BAD_GATEWAY,
      ErrorCode.EXTERNAL_SERVICE_ERROR,
      `The ${service} service is currently unavailable. Please try again later.`,
      { ...options, details: { service, ...options?.details } },
    );
  }
}

/**
 * 500 — an operation that should never fail did (e.g. `INSERT … RETURNING`
 * returned no row). The `internalMessage` is logged; the client gets a generic message.
 */
export class InternalOperationException extends AppException {
  constructor(internalMessage: string, options?: AppExceptionOptions) {
    super(
      HttpStatus.INTERNAL_SERVER_ERROR,
      ErrorCode.INTERNAL_ERROR,
      'An unexpected error occurred. Please try again later.',
      { ...options, details: { internalMessage, ...options?.details } },
    );
  }
}
