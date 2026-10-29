import { Inject, Injectable, ForbiddenException, BadRequestException } from '@nestjs/common';
import { and, eq, gte, inArray, lte, sql } from 'drizzle-orm';
import {
  DRIZZLE,
  type DrizzleDatabase,
  restaurants,
  branches,
  tables,
  orders,
  staff,
  staffAssignments,
  waiterTableAssignments,
  payments,
  customers,
} from '@/database';
import type { JwtPayload } from '../../identity/adapters/jwt.strategy';
import {
  isOrgAdmin,
  isSuperAdmin,
  organizationIdsFromActor,
  resolveRequestedOrganizationId,
} from '../../../common/auth/actor.util';
import { BranchAccessService } from '../../authorization/services/branch-access.service';

@Injectable()
export class AnalyticsService {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDatabase,
    private readonly branchAccess: BranchAccessService,
  ) {}

  async getOverview(
    user: JwtPayload,
    query: { organizationId?: string; branchId?: string; from?: string; to?: string },
  ) {
    const organizationId = this.resolveOrganizationId(user, query.organizationId);
    if (query.branchId) {
      await this.branchAccess.assertAccess(user, query.branchId);
    }
    const tenant = this.tenantFilter(organizationId, query.branchId);
    const range = this.parseDateRange(query.from, query.to);

    const [[restaurantCount], [branchCount], [tableCount], [staffCount], [orderStats], [occupied]] =
      await Promise.all([
        this.db
          .select({ total: sql<number>`count(*)::int` })
          .from(restaurants)
          .where(and(eq(restaurants.isActive, true), tenant.restaurantWhere)),
        this.db
          .select({ total: sql<number>`count(*)::int` })
          .from(branches)
          .innerJoin(restaurants, eq(branches.restaurantId, restaurants.id))
          .where(and(eq(branches.isActive, true), tenant.branchWhere)),
        this.db
          .select({ total: sql<number>`count(*)::int` })
          .from(tables)
          .innerJoin(branches, eq(tables.branchId, branches.id))
          .innerJoin(restaurants, eq(branches.restaurantId, restaurants.id))
          .where(tenant.tableWhere),
        this.db
          .select({ total: sql<number>`count(*)::int` })
          .from(staffAssignments)
          .innerJoin(branches, eq(staffAssignments.branchId, branches.id))
          .innerJoin(restaurants, eq(branches.restaurantId, restaurants.id))
          .where(and(eq(staffAssignments.isActive, true), tenant.branchWhere)),
        this.db
          .select({
            total: sql<number>`count(*)::int`,
            pending: sql<number>`count(*) FILTER (WHERE ${orders.status} = 'PENDING')::int`,
            revenue: sql<number>`coalesce(sum(${orders.totalAmount}) FILTER (WHERE ${orders.paymentStatus} = 'PAID'), 0)`,
          })
          .from(orders)
          .innerJoin(branches, eq(orders.branchId, branches.id))
          .innerJoin(restaurants, eq(branches.restaurantId, restaurants.id))
          .where(tenant.branchWhere),
        this.db
          .select({ total: sql<number>`count(*)::int` })
          .from(tables)
          .innerJoin(branches, eq(tables.branchId, branches.id))
          .innerJoin(restaurants, eq(branches.restaurantId, restaurants.id))
          .where(and(sql`${tables.serviceStatus} <> 'AVAILABLE'`, tenant.tableWhere)),
      ]);

    const tablesTotal = tableCount?.total ?? 0;
    const occupiedTables = occupied?.total ?? 0;
    const series = await this.loadOrderRevenueSeries(tenant.branchWhere, range);

    return {
      restaurantsCount: restaurantCount?.total ?? 0,
      branchesCount: branchCount?.total ?? 0,
      tablesCount: tablesTotal,
      staffCount: staffCount?.total ?? 0,
      ordersCount: orderStats?.total ?? 0,
      pendingOrders: orderStats?.pending ?? 0,
      paidRevenue: Number(orderStats?.revenue ?? 0),
      occupancyPercent: tablesTotal > 0 ? Math.round((occupiedTables / tablesTotal) * 100) : 0,
      from: range.from.toISOString(),
      to: range.to.toISOString(),
      series,
    };
  }

  /**
   * Branch-scoped KPI snapshot for manager / branch dashboards.
   * Must be used instead of aggregating GET /orders or GET /tables on the client.
   */
  async getBranchDashboard(
    user: JwtPayload,
    query: { branchId: string; from?: string; to?: string },
  ) {
    if (!query.branchId) {
      throw new ForbiddenException('branchId is required');
    }
    await this.branchAccess.assertAccess(user, query.branchId);

    const organizationId = this.resolveOrganizationId(user, undefined);
    const tenant = this.tenantFilter(organizationId, query.branchId);

    const delayCutoff = sql`now() - interval '20 minutes'`;

    const [[tableStats], [staffCount], [orderStats]] = await Promise.all([
      this.db
        .select({
          total: sql<number>`count(*)::int`,
          available: sql<number>`count(*) FILTER (WHERE ${tables.serviceStatus} = 'AVAILABLE')::int`,
          occupied: sql<number>`count(*) FILTER (WHERE ${tables.serviceStatus} <> 'AVAILABLE')::int`,
        })
        .from(tables)
        .innerJoin(branches, eq(tables.branchId, branches.id))
        .innerJoin(restaurants, eq(branches.restaurantId, restaurants.id))
        .where(and(eq(tables.branchId, query.branchId), tenant.tableWhere)),
      this.db
        .select({ total: sql<number>`count(*)::int` })
        .from(staffAssignments)
        .innerJoin(branches, eq(staffAssignments.branchId, branches.id))
        .innerJoin(restaurants, eq(branches.restaurantId, restaurants.id))
        .where(
          and(
            eq(staffAssignments.branchId, query.branchId),
            eq(staffAssignments.isActive, true),
            tenant.branchWhere,
          ),
        ),
      this.db
        .select({
          total: sql<number>`count(*)::int`,
          pending: sql<number>`count(*) FILTER (WHERE ${orders.status} = 'PENDING')::int`,
          preparing: sql<number>`count(*) FILTER (WHERE ${orders.status} IN ('CONFIRMED', 'PREPARING'))::int`,
          ready: sql<number>`count(*) FILTER (WHERE ${orders.status} = 'READY')::int`,
          delayed: sql<number>`count(*) FILTER (
            WHERE ${orders.status} NOT IN ('SERVED', 'COMPLETED', 'CANCELLED', 'REJECTED')
              AND ${orders.createdAt} < ${delayCutoff}
          )::int`,
          unpaid: sql<number>`count(*) FILTER (
            WHERE ${orders.paymentStatus} IN ('UNPAID', 'PARTIALLY_PAID')
              AND ${orders.status} NOT IN ('CANCELLED', 'REJECTED')
          )::int`,
          unpaidAmount: sql<number>`coalesce(sum(${orders.totalAmount}) FILTER (
            WHERE ${orders.paymentStatus} IN ('UNPAID', 'PARTIALLY_PAID')
              AND ${orders.status} NOT IN ('CANCELLED', 'REJECTED')
          ), 0)`,
          paidRevenue: sql<number>`coalesce(sum(${orders.totalAmount}) FILTER (WHERE ${orders.paymentStatus} = 'PAID'), 0)`,
          todayOrders: sql<number>`count(*) FILTER (WHERE ${orders.createdAt}::date = CURRENT_DATE)::int`,
          todayRevenue: sql<number>`coalesce(sum(${orders.totalAmount}) FILTER (
            WHERE ${orders.paymentStatus} = 'PAID' AND ${orders.createdAt}::date = CURRENT_DATE
          ), 0)`,
        })
        .from(orders)
        .innerJoin(branches, eq(orders.branchId, branches.id))
        .innerJoin(restaurants, eq(branches.restaurantId, restaurants.id))
        .where(and(eq(orders.branchId, query.branchId), tenant.branchWhere)),
    ]);

    const tablesTotal = tableStats?.total ?? 0;
    const occupiedTables = tableStats?.occupied ?? 0;
    const range = this.parseDateRange(query.from, query.to);
    const series = await this.loadOrderRevenueSeries(tenant.branchWhere, range);

    return {
      branchId: query.branchId,
      tablesCount: tablesTotal,
      availableTables: tableStats?.available ?? 0,
      occupiedTables,
      occupancyPercent: tablesTotal > 0 ? Math.round((occupiedTables / tablesTotal) * 100) : 0,
      staffCount: staffCount?.total ?? 0,
      ordersCount: orderStats?.total ?? 0,
      pendingOrders: orderStats?.pending ?? 0,
      preparingOrders: orderStats?.preparing ?? 0,
      readyOrders: orderStats?.ready ?? 0,
      delayedOrders: orderStats?.delayed ?? 0,
      unpaidOrders: orderStats?.unpaid ?? 0,
      unpaidAmount: Number(orderStats?.unpaidAmount ?? 0),
      paidRevenue: Number(orderStats?.paidRevenue ?? 0),
      todayOrders: orderStats?.todayOrders ?? 0,
      todayRevenue: Number(orderStats?.todayRevenue ?? 0),
      from: range.from.toISOString(),
      to: range.to.toISOString(),
      series,
    };
  }

  /** Waiter KPIs — counts only for tables assigned to this waiter. */
  async getWaiterDashboard(user: JwtPayload, query: { branchId: string }) {
    const branchId = this.requireBranchId(query.branchId);
    await this.assertBranchAccessHint(user, branchId);
    const tableIds = await this.resolveWaiterAssignedTableIds(user.sub, branchId);
    if (tableIds.length === 0) {
      return {
        branchId,
        role: 'WAITER',
        assignedTables: 0,
        pendingOrders: 0,
        preparingOrders: 0,
        readyOrders: 0,
        servedToday: 0,
      };
    }

    const [[orderStats]] = await Promise.all([
      this.db
        .select({
          pending: sql<number>`count(*) FILTER (WHERE ${orders.status} = 'PENDING')::int`,
          preparing: sql<number>`count(*) FILTER (WHERE ${orders.status} IN ('CONFIRMED', 'PREPARING'))::int`,
          ready: sql<number>`count(*) FILTER (WHERE ${orders.status} = 'READY')::int`,
          servedToday: sql<number>`count(*) FILTER (
            WHERE ${orders.status} IN ('SERVED', 'COMPLETED')
              AND ${orders.createdAt}::date = CURRENT_DATE
          )::int`,
        })
        .from(orders)
        .where(and(eq(orders.branchId, branchId), inArray(orders.tableId, tableIds))),
    ]);

    return {
      branchId,
      role: 'WAITER',
      assignedTables: tableIds.length,
      pendingOrders: orderStats?.pending ?? 0,
      preparingOrders: orderStats?.preparing ?? 0,
      readyOrders: orderStats?.ready ?? 0,
      servedToday: orderStats?.servedToday ?? 0,
    };
  }

  /** Cashier KPIs — revenue / unpaid / refunds (never client-side getAll aggregation). */
  async getCashierDashboard(user: JwtPayload, query: { branchId: string }) {
    const branchId = this.requireBranchId(query.branchId);
    await this.assertBranchAccessHint(user, branchId);

    const [[orderStats], [paymentStats]] = await Promise.all([
      this.db
        .select({
          todayRevenue: sql<number>`coalesce(sum(${orders.totalAmount}) FILTER (
            WHERE ${orders.paymentStatus} = 'PAID' AND ${orders.createdAt}::date = CURRENT_DATE
          ), 0)`,
          todayPaidOrders: sql<number>`count(*) FILTER (
            WHERE ${orders.paymentStatus} = 'PAID' AND ${orders.createdAt}::date = CURRENT_DATE
          )::int`,
          unpaidOrders: sql<number>`count(*) FILTER (
            WHERE ${orders.paymentStatus} IN ('UNPAID', 'PARTIALLY_PAID')
              AND ${orders.status} NOT IN ('CANCELLED', 'REJECTED')
          )::int`,
          unpaidAmount: sql<number>`coalesce(sum(${orders.totalAmount}) FILTER (
            WHERE ${orders.paymentStatus} IN ('UNPAID', 'PARTIALLY_PAID')
              AND ${orders.status} NOT IN ('CANCELLED', 'REJECTED')
          ), 0)`,
        })
        .from(orders)
        .where(eq(orders.branchId, branchId)),
      this.db
        .select({
          refundsToday: sql<number>`coalesce(sum(coalesce(${payments.refundAmount}, 0)) FILTER (
            WHERE ${payments.status} = 'REFUNDED' AND ${payments.refundedAt}::date = CURRENT_DATE
          ), 0)`,
          refundCountToday: sql<number>`count(*) FILTER (
            WHERE ${payments.status} = 'REFUNDED' AND ${payments.refundedAt}::date = CURRENT_DATE
          )::int`,
          pendingOffline: sql<number>`count(*) FILTER (
            WHERE ${payments.status} IN ('UNPAID', 'FAILED') AND ${payments.method} IN ('CASH', 'CARD')
          )::int`,
        })
        .from(payments)
        .innerJoin(orders, eq(payments.orderId, orders.id))
        .where(eq(orders.branchId, branchId)),
    ]);

    return {
      branchId,
      role: 'CASHIER',
      todayRevenue: Number(orderStats?.todayRevenue ?? 0),
      todayPaidOrders: orderStats?.todayPaidOrders ?? 0,
      unpaidOrders: orderStats?.unpaidOrders ?? 0,
      unpaidAmount: Number(orderStats?.unpaidAmount ?? 0),
      refundsToday: Number(paymentStats?.refundsToday ?? 0),
      refundCountToday: paymentStats?.refundCountToday ?? 0,
      pendingOfflinePayments: paymentStats?.pendingOffline ?? 0,
    };
  }

  /** Kitchen / station queue KPIs. */
  async getKitchenDashboard(user: JwtPayload, query: { branchId: string }) {
    const branchId = this.requireBranchId(query.branchId);
    await this.assertBranchAccessHint(user, branchId);
    const delayCutoff = sql`now() - interval '20 minutes'`;

    const [[stats]] = await Promise.all([
      this.db
        .select({
          newOrders: sql<number>`count(*) FILTER (
            WHERE ${orders.status} IN ('PENDING', 'CONFIRMED')
          )::int`,
          preparing: sql<number>`count(*) FILTER (WHERE ${orders.status} = 'PREPARING')::int`,
          ready: sql<number>`count(*) FILTER (WHERE ${orders.status} = 'READY')::int`,
          overdue: sql<number>`count(*) FILTER (
            WHERE ${orders.status} IN ('PENDING', 'CONFIRMED', 'PREPARING')
              AND ${orders.createdAt} < ${delayCutoff}
          )::int`,
          activeTotal: sql<number>`count(*) FILTER (
            WHERE ${orders.status} IN ('PENDING', 'CONFIRMED', 'PREPARING', 'READY')
          )::int`,
        })
        .from(orders)
        .where(eq(orders.branchId, branchId)),
    ]);

    return {
      branchId,
      role: 'KITCHEN_STAFF',
      newOrders: stats?.newOrders ?? 0,
      preparingOrders: stats?.preparing ?? 0,
      readyOrders: stats?.ready ?? 0,
      overdueOrders: stats?.overdue ?? 0,
      activeTotal: stats?.activeTotal ?? 0,
    };
  }

  /** Bartender KPIs — same station queue shape as kitchen (drink line). */
  async getBartenderDashboard(user: JwtPayload, query: { branchId: string }) {
    const kitchen = await this.getKitchenDashboard(user, query);
    return { ...kitchen, role: 'BARTENDER' };
  }

  /** Customer home summary — authenticated guest order counts. */
  async getCustomerDashboard(user: JwtPayload) {
    const [customerRow] = await this.db
      .select({ id: customers.id })
      .from(customers)
      .where(eq(customers.userId, user.sub))
      .limit(1);

    if (!customerRow?.id) {
      return { role: 'CUSTOMER', openOrders: 0, completedOrders: 0 };
    }

    const [stats] = await this.db
      .select({
        openOrders: sql<number>`count(*) FILTER (
          WHERE ${orders.status} NOT IN ('COMPLETED', 'CANCELLED', 'REJECTED', 'SERVED')
        )::int`,
        completedOrders: sql<number>`count(*) FILTER (
          WHERE ${orders.status} IN ('COMPLETED', 'SERVED')
        )::int`,
      })
      .from(orders)
      .where(eq(orders.customerId, customerRow.id));

    return {
      role: 'CUSTOMER',
      openOrders: stats?.openOrders ?? 0,
      completedOrders: stats?.completedOrders ?? 0,
    };
  }

  async getBranchPerformance(
    user: JwtPayload,
    query: { organizationId?: string },
  ) {
    const organizationId = this.resolveOrganizationId(user, query.organizationId);
    if (!organizationId && !isSuperAdmin(user)) {
      throw new ForbiddenException('No organization is associated with this account');
    }

    const rows = await this.db
      .select({
        branchId: branches.id,
        branchName: branches.name,
        restaurantName: restaurants.name,
        ordersCount: sql<number>`count(${orders.id})::int`,
        revenue: sql<number>`coalesce(sum(${orders.totalAmount}) FILTER (WHERE ${orders.paymentStatus} = 'PAID'), 0)`,
      })
      .from(branches)
      .innerJoin(restaurants, eq(branches.restaurantId, restaurants.id))
      .leftJoin(orders, eq(orders.branchId, branches.id))
      .where(
        organizationId
          ? and(eq(restaurants.organizationId, organizationId), eq(branches.isActive, true))
          : eq(branches.isActive, true),
      )
      .groupBy(branches.id, branches.name, restaurants.name);

    const mapped = rows.map((row) => ({
      ...row,
      revenue: Number(row.revenue ?? 0),
    }));

    if (isSuperAdmin(user) || isOrgAdmin(user)) {
      return mapped;
    }

    const allowed = new Set(
      (user.scopes ?? [])
        .filter((scope) => scope.type === 'branch' && scope.id)
        .map((scope) => scope.id as string),
    );
    if (user.branchId) allowed.add(user.branchId);
    return mapped.filter((row) => allowed.has(row.branchId));
  }

  private requireBranchId(branchId?: string): string {
    if (!branchId || typeof branchId !== 'string' || branchId.trim().length < 8) {
      throw new BadRequestException('branchId is required');
    }
    return branchId.trim();
  }

  private async assertBranchAccessHint(user: JwtPayload, branchId: string): Promise<void> {
    await this.branchAccess.assertAccess(user, branchId);
  }

  private async resolveWaiterAssignedTableIds(
    userId: string,
    branchId: string,
  ): Promise<string[]> {
    const [profile] = await this.db
      .select({ id: staff.id })
      .from(staff)
      .where(eq(staff.userId, userId))
      .limit(1);

    const waiterIds = [userId, profile?.id].filter(Boolean) as string[];
    if (waiterIds.length === 0) return [];

    const rows = await this.db
      .select({ tableId: waiterTableAssignments.tableId })
      .from(waiterTableAssignments)
      .where(
        and(
          eq(waiterTableAssignments.branchId, branchId),
          eq(waiterTableAssignments.isActive, true),
          inArray(waiterTableAssignments.waiterId, waiterIds),
        ),
      );

    return [...new Set(rows.map((r) => r.tableId).filter(Boolean))];
  }

  private resolveOrganizationId(user: JwtPayload, requested?: string): string | undefined {
    if (isSuperAdmin(user)) return requested;
    const ids = organizationIdsFromActor(user);
    if (!requested && ids.length === 0) {
      throw new ForbiddenException('No organization is associated with this account');
    }
    if (!requested) {
      return user.organizationId || ids[0];
    }
    return resolveRequestedOrganizationId(user, ids, requested);
  }

  private parseDateRange(from?: string, to?: string): { from: Date; to: Date } {
    const end = to ? new Date(to) : new Date();
    const start = from ? new Date(from) : new Date(end.getTime() - 13 * 24 * 60 * 60 * 1000);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      throw new BadRequestException('Invalid date range');
    }
    if (start > end) {
      throw new BadRequestException('from must be before to');
    }
    const maxMs = 90 * 24 * 60 * 60 * 1000;
    if (end.getTime() - start.getTime() > maxMs) {
      throw new BadRequestException('Date range cannot exceed 90 days');
    }
    return { from: start, to: end };
  }

  private async loadOrderRevenueSeries(
    branchWhere: ReturnType<typeof and>,
    range: { from: Date; to: Date },
  ) {
    const rows = await this.db
      .select({
        date: sql<string>`to_char(date_trunc('day', ${orders.createdAt}), 'YYYY-MM-DD')`,
        orders: sql<number>`count(*)::int`,
        revenue: sql<number>`coalesce(sum(${orders.totalAmount}) FILTER (WHERE ${orders.paymentStatus} = 'PAID'), 0)`,
      })
      .from(orders)
      .innerJoin(branches, eq(orders.branchId, branches.id))
      .innerJoin(restaurants, eq(branches.restaurantId, restaurants.id))
      .where(
        and(
          branchWhere,
          gte(orders.createdAt, range.from),
          lte(orders.createdAt, range.to),
        ),
      )
      .groupBy(sql`date_trunc('day', ${orders.createdAt})`)
      .orderBy(sql`date_trunc('day', ${orders.createdAt})`);

    const byDate = new Map(
      rows.map((row) => [row.date, { orders: Number(row.orders ?? 0), revenue: Number(row.revenue ?? 0) }]),
    );
    const series: { date: string; orders: number; revenue: number }[] = [];
    const cursor = new Date(Date.UTC(range.from.getUTCFullYear(), range.from.getUTCMonth(), range.from.getUTCDate()));
    const end = new Date(Date.UTC(range.to.getUTCFullYear(), range.to.getUTCMonth(), range.to.getUTCDate()));
    while (cursor <= end) {
      const date = cursor.toISOString().slice(0, 10);
      const point = byDate.get(date);
      series.push({
        date,
        orders: point?.orders ?? 0,
        revenue: point?.revenue ?? 0,
      });
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
    return series;
  }

  private tenantFilter(organizationId?: string, branchId?: string) {
    const restaurantWhere = organizationId
      ? eq(restaurants.organizationId, organizationId)
      : sql`true`;
    const branchWhere = and(
      restaurantWhere,
      branchId ? eq(branches.id, branchId) : sql`true`,
    );
    const tableWhere = branchWhere;
    return { restaurantWhere, branchWhere, tableWhere };
  }
}
