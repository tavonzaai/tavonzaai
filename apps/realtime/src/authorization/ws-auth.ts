import jwt from 'jsonwebtoken';
import type { IncomingMessage } from 'http';
import { URL } from 'url';

export interface AuthenticatedClientContext {
  actorType: 'USER' | 'CUSTOMER' | 'ANONYMOUS';
  userId?: string;
  email?: string;
  role?: string;
  permissions?: string[];
  organizationId?: string;
  branchId?: string;
  tableSessionId?: string;
  guestSessionId?: string;
}

export function authenticateWsRequest(req: IncomingMessage): AuthenticatedClientContext | null {
  try {
    const rawUrl = req.url || '/';
    const parsedUrl = new URL(rawUrl, 'http://localhost');
    const token =
      parsedUrl.searchParams.get('token') ||
      (req.headers['sec-websocket-protocol'] as string | undefined);

    if (!token) {
      return null;
    }

    const secret = process.env.JWT_SECRET || 'dev-secret-change-in-prod';
    const payload = jwt.verify(token, secret) as any;

    if (!payload || !payload.sub) {
      return null;
    }

    return {
      actorType: payload.role === 'CUSTOMER' ? 'CUSTOMER' : 'USER',
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
      permissions: payload.permissions || [],
      organizationId: payload.organizationId,
      branchId: payload.branchId,
      tableSessionId: payload.tableSessionId,
      guestSessionId: payload.guestSessionId,
    };
  } catch {
    return null;
  }
}
