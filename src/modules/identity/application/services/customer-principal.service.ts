// ============================================================================
// CustomerPrincipalService — server-side customer identity for customer APIs
// ============================================================================
// Customer-facing endpoints never accept a customer id from the client. The
// owner of carts, orders and payments is derived here from the verified JWT.
// ============================================================================

import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { GlobalRole } from '@/authorization';
import { DrizzleUserRepository } from '../../infrastructure/persistence/drizzle-user.repository';
import type { JwtPayload } from '../../infrastructure/adapters/jwt.strategy';
import { TOKEN_TYPE } from '../../domain/token-policy';

export interface CustomerPrincipal {
  /** Registered account, when the diner is signed in. */
  userId: string | null;
  customerId: string | null;
  /** Seated guest session, when the diner verified a table OTP. */
  guestSessionId: string | null;
  tableSessionId: string | null;
  tableId: string | null;
  branchId: string | null;
}

export function isCustomerPayload(user: JwtPayload | null | undefined): boolean {
  if (!user) return false;
  if (user.typ === TOKEN_TYPE.GUEST) return true;
  return user.globalRole === GlobalRole.CUSTOMER || (!user.globalRole && user.role === GlobalRole.CUSTOMER);
}

@Injectable()
export class CustomerPrincipalService {
  constructor(private readonly userRepo: DrizzleUserRepository) {}

  async resolve(user: JwtPayload | null | undefined): Promise<CustomerPrincipal> {
    if (!user) {
      throw new UnauthorizedException('Please sign in to continue');
    }

    if (user.typ === TOKEN_TYPE.GUEST) {
      return {
        userId: null,
        customerId: user.customerId ?? null,
        guestSessionId: user.guestSessionId ?? null,
        tableSessionId: user.tableSessionId ?? null,
        tableId: user.tableId ?? null,
        branchId: user.branchId ?? null,
      };
    }

    if (!isCustomerPayload(user)) {
      throw new ForbiddenException('This action is only available to customer accounts');
    }

    const customerId = await this.userRepo.ensureCustomerProfile(user.sub);
    return {
      userId: user.sub,
      customerId,
      guestSessionId: null,
      tableSessionId: null,
      tableId: null,
      branchId: null,
    };
  }
}
