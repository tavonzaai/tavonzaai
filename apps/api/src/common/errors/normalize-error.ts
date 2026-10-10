import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode, type ApiFieldError } from '@tavonza/contracts';
import { AppException } from './app.exception';
import { mapDatabaseError, type MappedDatabaseError } from './database-error.mapper';

export interface NormalizedError {
  status: number;
  errorCode: ErrorCode;
  message: string;
  errorMessages: ApiFieldError[];
  details?: Record<string, unknown>;
  diagnostics?: MappedDatabaseError['diagnostics'];
  logLevel: 'error' | 'warn' | 'info';
  cause?: unknown;
}

/** Map HTTP status codes to stable ErrorCode tokens when standard HttpExceptions are thrown. */
function mapHttpStatusToErrorCode(status: number): ErrorCode {
  switch (status) {
    case HttpStatus.BAD_REQUEST:
      return ErrorCode.BAD_REQUEST;
    case HttpStatus.UNAUTHORIZED:
      return ErrorCode.UNAUTHORIZED;
    case HttpStatus.FORBIDDEN:
      return ErrorCode.FORBIDDEN;
    case HttpStatus.NOT_FOUND:
      return ErrorCode.NOT_FOUND;
    case HttpStatus.METHOD_NOT_ALLOWED:
      return ErrorCode.METHOD_NOT_ALLOWED;
    case HttpStatus.CONFLICT:
      return ErrorCode.CONFLICT;
    case HttpStatus.UNPROCESSABLE_ENTITY:
      return ErrorCode.BUSINESS_RULE_VIOLATION;
    case HttpStatus.PAYLOAD_TOO_LARGE:
      return ErrorCode.PAYLOAD_TOO_LARGE;
    case HttpStatus.UNSUPPORTED_MEDIA_TYPE:
      return ErrorCode.UNSUPPORTED_MEDIA_TYPE;
    case HttpStatus.TOO_MANY_REQUESTS:
      return ErrorCode.RATE_LIMITED;
    case HttpStatus.BAD_GATEWAY:
      return ErrorCode.EXTERNAL_SERVICE_ERROR;
    case HttpStatus.SERVICE_UNAVAILABLE:
      return ErrorCode.SERVICE_UNAVAILABLE;
    default:
      return status >= 500 ? ErrorCode.INTERNAL_ERROR : ErrorCode.BAD_REQUEST;
  }
}

/**
 * Normalizes any error thrown in the NestJS application into a standard structure.
 */
export function normalizeError(err: unknown): NormalizedError {
  // 1. First-class custom application exception
  if (err instanceof AppException) {
    return {
      status: err.getStatus(),
      errorCode: err.errorCode,
      message: err.message,
      errorMessages: err.errorMessages,
      details: err.details,
      logLevel: err.getStatus() >= 500 ? 'error' : 'warn',
      cause: err.cause,
    };
  }

  // 2. Database errors (PostgreSQL / node-postgres / Drizzle)
  const dbError = mapDatabaseError(err);
  if (dbError) {
    return {
      status: dbError.status,
      errorCode: dbError.errorCode,
      message: dbError.message,
      errorMessages: dbError.errorMessages,
      diagnostics: dbError.diagnostics,
      logLevel: dbError.status >= 500 ? 'error' : 'warn',
      cause: err,
    };
  }

  // 3. NestJS built-in HttpExceptions (BadRequestException, NotFoundException, etc.)
  if (err instanceof HttpException) {
    const status = err.getStatus();
    const res = err.getResponse();

    let message = err.message;
    let errorMessages: ApiFieldError[] = [];
    let errorCode = mapHttpStatusToErrorCode(status);

    if (typeof res === 'string') {
      message = res;
    } else if (res && typeof res === 'object') {
      const r = res as Record<string, any>;
      if (r.errorCode && typeof r.errorCode === 'string') {
        errorCode = r.errorCode as ErrorCode;
      }
      if (Array.isArray(r.errorMessages)) {
        errorMessages = r.errorMessages;
      }
      if (Array.isArray(r.message)) {
        // Typical class-validator default message array
        errorMessages = r.message.map((msg: string) => ({
          path: typeof msg === 'string' ? msg.split(' ')[0] || 'field' : 'field',
          message: String(msg),
        }));
        message = 'Validation failed';
        errorCode = ErrorCode.VALIDATION_FAILED;
      } else if (typeof r.message === 'string') {
        message = r.message;
      }
    }

    return {
      status,
      errorCode,
      message,
      errorMessages,
      logLevel: status >= 500 ? 'error' : 'warn',
      cause: err.cause,
    };
  }

  // 4. Express / Body-parser syntax and size errors
  const anyErr = err as Record<string, any> | undefined;
  if (anyErr?.type === 'entity.parse.failed') {
    return {
      status: HttpStatus.BAD_REQUEST,
      errorCode: ErrorCode.BAD_REQUEST,
      message: 'Malformed JSON payload in request body.',
      errorMessages: [],
      logLevel: 'warn',
      cause: err,
    };
  }

  if (anyErr?.type === 'entity.too.large' || anyErr?.code === 'LIMIT_FILE_SIZE') {
    return {
      status: HttpStatus.PAYLOAD_TOO_LARGE,
      errorCode: ErrorCode.PAYLOAD_TOO_LARGE,
      message: 'The requested payload or file exceeds the maximum allowed size.',
      errorMessages: [],
      logLevel: 'warn',
      cause: err,
    };
  }

  // 5. Catch-all for unhandled generic JavaScript errors or unexpected bugs
  const internalMessage = anyErr?.message || String(err);
  return {
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    errorCode: ErrorCode.INTERNAL_ERROR,
    message: 'An internal server error occurred. Please try again later.',
    errorMessages: [],
    details: {
      rawMessage: internalMessage,
    },
    logLevel: 'error',
    cause: err,
  };
}
