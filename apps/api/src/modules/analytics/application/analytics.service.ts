import { Inject, Injectable, ForbiddenException } from '@nestjs/common';
import { and, eq, sql } from 'drizzle-orm';
import {
  DRIZZLE,
  type DrizzleDatabase,
  restaurants,
  branches,
  tables,
  orders,
  staffAssignments,
} from '@tavonza/database';
import type { JwtPayload } from '../../identity/infrastructure/adapters/jwt.strategy';
import { isSuperAdmin } from '../../../common/auth/actor.util';

@Injectable()
export class AnalyticsService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDatabase) {}

  async getOverview(
    user: JwtPayload,
    query: { organizationId?: string; branchId?: string },
  ) {
    const organizationId = this.resolveOrganizationId(user, query.organizationId);
    const tenant = await this.tenantFilter(organizationId, query.branchId);

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

    return {
      restaurantsCount: restaurantCount?.total ?? 0,
      branchesCount: branchCount?.total ?? 0,
      tablesCount: tablesTotal,
      staffCount: staffCount?.total ?? 0,
      ordersCount: orderStats?.total ?? 0,
      pendingOrders: orderStats?.pending ?? 0,
      paidRevenue: Number(orderStats?.revenue ?? 0),
      occupancyPercent: tablesTotal > 0 ? Math.round((occupiedTables / tablesTotal) * 100) : 0,
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

    return rows.map((row) => ({
      ...row,
      revenue: Number(row.revenue ?? 0),
    }));
  }

  private resolveOrganizationId(user: JwtPayload, requested?: string): string | undefined {
    if (isSuperAdmin(user)) return requested;
    return requested || user.organizationId || undefined;
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
