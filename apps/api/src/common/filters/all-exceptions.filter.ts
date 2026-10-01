import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AppLogger } from '@tavonza/observability';

/**
 * AllExceptionsFilter
 *
 * Global catch-all for every thrown exception.
 * - HttpExceptions  → structured warn/error log + correct HTTP response
 * - Unknown errors  → structured error log with stack + 500 response
 *
 * Prod JSON output example:
 *   {"level":"error","context":"ExceptionFilter","message":"Internal server error",
 *    "status":500,"method":"POST","path":"/auth/register","stack":"..."}
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new AppLogger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx    = host.switchToHttp();
    const req    = ctx.getRequest<Request>();
    const res    = ctx.getResponse<Response>();

    const isHttp  = exception instanceof HttpException;
    const status  = isHttp
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const response = isHttp ? exception.getResponse() : null;

    const message =
      typeof response === 'string'
        ? response
        : (response as any)?.message ?? 'Internal server error';

    const meta: Record<string, unknown> = {
      status,
      method:    req.method,
      path:      req.originalUrl,
      requestId: req.headers['x-request-id'],
    };

    if (status >= 500) {
      // Server errors — log full stack
      meta.stack = (exception as any)?.stack;
      meta.error = (exception as any)?.message;
      this.logger.error(Array.isArray(message) ? message.join(', ') : String(message), meta);
    } else if (status >= 400) {
      // Client errors — just a warning, no stack noise
      this.logger.warn(Array.isArray(message) ? message.join(', ') : String(message), meta);
    }

    // Return a clean, consistent error payload to the client
    res.status(status).json({
      success:   false,
      statusCode: status,
      message,
      path:      req.originalUrl,
      timestamp: new Date().toISOString(),
    });
  }
}
