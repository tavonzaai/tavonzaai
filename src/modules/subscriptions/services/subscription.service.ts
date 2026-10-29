import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { desc, eq } from 'drizzle-orm';
import {
  DRIZZLE,
  type DrizzleDatabase,
  organizationSubscriptions,
  platformPlans,
  subscriptionInvoices,
} from '@/database';
import type { JwtPayload } from '../../identity/adapters/jwt.strategy';
import {
  organizationIdsFromActor,
  resolveRequestedOrganizationId,
} from '../../../common/auth/actor.util';

@Injectable()
export class SubscriptionService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDatabase) {}

  async getCurrentPlan(user: JwtPayload, requestedOrganizationId?: string) {
    const organizationId = resolveRequestedOrganizationId(
      user,
      organizationIdsFromActor(user),
      requestedOrganizationId,
    );

    const [row] = await this.db
      .select({
        subscriptionId: organizationSubscriptions.id,
        status: organizationSubscriptions.status,
        currentPeriodStart: organizationSubscriptions.currentPeriodStart,
        currentPeriodEnd: organizationSubscriptions.currentPeriodEnd,
        plan: platformPlans,
      })
      .from(organizationSubscriptions)
      .innerJoin(platformPlans, eq(organizationSubscriptions.planId, platformPlans.id))
      .where(eq(organizationSubscriptions.organizationId, organizationId))
      .limit(1);

    if (!row) {
      throw new NotFoundException('No subscription is configured for this organization');
    }

    return {
      organizationId,
      subscriptionId: row.subscriptionId,
      status: row.status,
      currentPeriodStart: row.currentPeriodStart,
      currentPeriodEnd: row.currentPeriodEnd,
      plan: {
        id: row.plan.id,
        code: row.plan.code,
        name: row.plan.name,
        description: row.plan.description,
        interval: row.plan.interval,
        amount: row.plan.amount,
        currency: row.plan.currency,
        features: row.plan.features ?? [],
      },
    };
  }

  async listInvoices(user: JwtPayload, requestedOrganizationId?: string) {
    const organizationId = resolveRequestedOrganizationId(
      user,
      organizationIdsFromActor(user),
      requestedOrganizationId,
    );

    const rows = await this.db
      .select()
      .from(subscriptionInvoices)
      .where(eq(subscriptionInvoices.organizationId, organizationId))
      .orderBy(desc(subscriptionInvoices.issuedAt));

    return {
      organizationId,
      data: rows.map((row) => ({
        id: row.id,
        number: row.number,
        amount: row.amount,
        currency: row.currency,
        status: row.status,
        periodStart: row.periodStart,
        periodEnd: row.periodEnd,
        issuedAt: row.issuedAt,
        paidAt: row.paidAt,
      })),
    };
  }
}
