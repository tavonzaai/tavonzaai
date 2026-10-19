import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Request, Response } from 'express';
import {
  AppLogger,
  extractHttpRequestMeta,
  formatHttpTraceSummary,
  type HttpTraceOptions,
} from '@tavonza/observability';

/**
 * Custom actor context for Tavonza AI HTTP logging.
 */
interface TavonzaUserContext {
  id?: string;
  email?: string;
  role?: string;
  organizationId?: string | null;
  branchId?: string | null;
}

/**
 * Consuming application options passed into the generic @tavonza/observability package.
 */
const TRACE_OPTIONS: HttpTraceOptions<TavonzaUserContext> = {
  extractUser: (req) => {
    const user = (req as any).user;
    if (!user) return undefined;
    return {
      id: user.sub || user.id,
      email: user.email,
      role: user.role || user.globalRole,
      organizationId: user.organizationId,
      branchId: user.branchId,
    };
  },
  formatUserLabel: (u) => u.email || u.id,
};

/**
 * HttpLoggerInterceptor
 *
 * Lightweight NestJS HTTP interceptor.
 * Delegates metric calculations, IP tracing, and byte sizing to @tavonza/observability.
 */
@Injectable()
export class HttpLoggerInterceptor implements NestInterceptor {
  private readonly logger = new AppLogger('HTTP');

  intercept(ctx: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = ctx.switchToHttp().getRequest<Request>();
    const res = ctx.switchToHttp().getResponse<Response>();
    const start = Date.now();

    // Track response payload bytes
    let resPayloadBytes = 0;
    const originalSend = res.send;
    res.send = function (body: any) {
      if (body !== undefined && body !== null) {
        resPayloadBytes = Buffer.isBuffer(body)
          ? body.length
          : Buffer.byteLength(typeof body === 'string' ? body : JSON.stringify(body));
      }
      return originalSend.apply(res, arguments as any);
    };

    // Log incoming request at debug level
    const inMeta = extractHttpRequestMeta(req, res, TRACE_OPTIONS);
    this.logger.debug(
      `→ ${inMeta.method} ${inMeta.path} [IP: ${inMeta.clientIp}] [ReqHeaders: ${inMeta.requestHeaderSize}] [ReqBody: ${inMeta.requestPayloadSize}]`,
      inMeta,
    );

    return next.handle().pipe(
      tap({
        next: () => {
          const durationMs = Date.now() - start;
          const meta = extractHttpRequestMeta(req, res, durationMs, resPayloadBytes, TRACE_OPTIONS);
          const status = meta.statusCode || 200;
          const level = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info';

          this.logger[level](formatHttpTraceSummary(meta, TRACE_OPTIONS.formatUserLabel), meta);
        },
        error: () => {
          const durationMs = Date.now() - start;
          const meta = extractHttpRequestMeta(req, res, durationMs, resPayloadBytes, TRACE_OPTIONS);

          this.logger.debug(
            `${meta.method} ${meta.path} failed in ${meta.duration} [IP: ${meta.clientIp}]`,
            meta,
          );
        },
      }),
    );
  }
}
