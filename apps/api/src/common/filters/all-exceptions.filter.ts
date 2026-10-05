import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AppLogger } from '@tavonza/observability';
import { type ApiErrorResponse } from '@tavonza/contracts';
import { normalizeError } from '../errors/normalize-error';

/**
 * AllExceptionsFilter
 *
 * Catches all thrown exceptions across the NestJS API application,
 * normalizes them (including PostgreSQL database constraint violations),
 * logs them with structured metadata, and returns a consistent ApiErrorResponse.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new AppLogger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    // If headers were already sent, delegate to Express default handler
    if (res.headersSent) {
      return;
    }

    const normalized = normalizeError(exception);
    const requestId =
      (req.headers['x-request-id'] as string) ||
      (res.getHeader('x-request-id') as string) ||
      'unknown-req-id';

    const isProduction = process.env.NODE_ENV === 'production';

    // Structured logging payload
    const logMeta: Record<string, unknown> = {
      statusCode: normalized.status,
      errorCode: normalized.errorCode,
      method: req.method,
      path: req.originalUrl,
      requestId,
      clientIp: req.ip,
      ...(normalized.details || {}),
      ...(normalized.diagnostics || {}),
    };

    if (normalized.status >= 500) {
      const stack = (exception as any)?.stack || (normalized.cause as any)?.stack;
      logMeta.stack = stack;
      this.logger.error(`[${normalized.errorCode}] ${normalized.message}`, logMeta);
    } else {
      this.logger.warn(`[${normalized.errorCode}] ${normalized.message}`, logMeta);
    }

    const responsePayload: ApiErrorResponse = {
      success: false,
      statusCode: normalized.status,
      errorCode: normalized.errorCode,
      message: normalized.message,
      errorMessages: normalized.errorMessages,
      path: req.originalUrl,
      method: req.method,
      requestId,
      timestamp: new Date().toISOString(),
      ...(!isProduction
        ? {
            debug: {
              name: (exception as any)?.name,
              detail: normalized.diagnostics?.detail,
              sqlState: normalized.diagnostics?.sqlState,
              constraint: normalized.diagnostics?.constraint,
              table: normalized.diagnostics?.table,
              stack: (exception as any)?.stack,
            },
          }
        : {}),
    };

    res.status(normalized.status).json(responsePayload);
  }
}
