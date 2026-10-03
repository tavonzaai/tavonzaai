import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Request, Response } from 'express';
import { AppLogger, formatDuration } from '@tavonza/observability';

/**
 * HttpLoggerInterceptor
 *
 * Logs every incoming HTTP request and its outgoing response.
 * Structured output example (prod JSON):
 *
 *   {"level":"info","context":"HTTP","method":"POST","path":"/auth/register",
 *    "status":201,"duration":"42ms","ip":"203.x.x.x","userAgent":"..."}
 */
@Injectable()
export class HttpLoggerInterceptor implements NestInterceptor {
  private readonly logger = new AppLogger('HTTP');

  intercept(ctx: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req  = ctx.switchToHttp().getRequest<Request>();
    const res  = ctx.switchToHttp().getResponse<Response>();
    const start = Date.now();

    const { method, originalUrl, ip } = req;
    const userAgent = req.headers['user-agent'] ?? '';
    const requestId = req.headers['x-request-id'] as string | undefined;

    // Log the incoming request at debug level
    this.logger.debug(`→ ${method} ${originalUrl}`, {
      ip,
      requestId,
      body: this.sanitizeBody(req.body),
    });

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = formatDuration(Date.now() - start);
          const status   = res.statusCode;
          const level    = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info';

          this.logger[level](`${method} ${originalUrl} ${status}`, {
            status,
            duration,
            ip,
            userAgent,
            requestId,
          });
        },
        error: (err: unknown) => {
          const duration = formatDuration(Date.now() - start);
          const status   = (err as any)?.status ?? 500;

          this.logger.error(`${method} ${originalUrl} ${status}`, {
            status,
            duration,
            ip,
            userAgent,
            requestId,
            error: (err as any)?.message,
          });
        },
      }),
    );
  }

  /**
   * Strip sensitive fields before logging request body.
   */
  private sanitizeBody(body: unknown): unknown {
    if (!body || typeof body !== 'object') return body;
    const SENSITIVE = new Set(['password', 'token', 'secret', 'accessKey', 'privateKey', 'cardNumber']);
    return Object.fromEntries(
      Object.entries(body as Record<string, unknown>).map(([k, v]) =>
        SENSITIVE.has(k) ? [k, '[REDACTED]'] : [k, v],
      ),
    );
  }
}
