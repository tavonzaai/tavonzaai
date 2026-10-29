import { DrizzleDatabase } from '../../client';
import * as schema from '../../schema';

export async function seedSubscriptions(
  db: DrizzleDatabase,
  orgs: {
    org1: typeof schema.organizations.$inferSelect;
    org2: typeof schema.organizations.$inferSelect;
  },
): Promise<void> {
  console.log('💳 Seeding platform plans and organization subscriptions...');

  const [plan] = await db
    .insert(schema.platformPlans)
    .values({
      code: 'standard',
      name: 'Standard',
      description: 'Organization plan with restaurants, branches, and staff operations',
      interval: 'month',
      amount: 99,
      currency: 'USD',
      features: ['restaurants', 'branches', 'staff', 'analytics'],
      isActive: true,
    })
    .returning();
  if (!plan) throw new Error('Failed to seed platform plan');

  const periodStart = new Date();
  const periodEnd = new Date(periodStart);
  periodEnd.setMonth(periodEnd.getMonth() + 1);

  for (const [index, org] of [orgs.org1, orgs.org2].entries()) {
    const [subscription] = await db
      .insert(schema.organizationSubscriptions)
      .values({
        organizationId: org.id,
        planId: plan.id,
        status: 'ACTIVE',
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
      })
      .returning();
    if (!subscription) throw new Error(`Failed to seed subscription for ${org.slug}`);

    await db.insert(schema.subscriptionInvoices).values({
      organizationId: org.id,
      subscriptionId: subscription.id,
      number: `INV-2026-${String(index + 1).padStart(4, '0')}`,
      amount: plan.amount,
      currency: plan.currency,
      status: 'PAID',
      periodStart,
      periodEnd,
      issuedAt: periodStart,
      paidAt: periodStart,
    });
  }
}
