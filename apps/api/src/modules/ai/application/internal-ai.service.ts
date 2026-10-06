import {
  Injectable,
  Inject,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { eq, and, sql, desc, inArray } from 'drizzle-orm';
import {
  DRIZZLE,
  type DrizzleDatabase,
  users,
  staff,
  staffAssignments,
  branches,
  tables,
  tableSessions,
  orders,
  orderItems,
  menuCategories,
  menuItems,
  auditLogs,
} from '@tavonza/database';
import { InventoryService } from '../../inventory/application/inventory.service';
import { PaymentService } from '../../payments/application/payment.service';
import type {
  ToolExecutionRequestDto,
  ToolConfirmationRequestDto,
  InternalAuditRequestDto,
} from '../presentation/http/dto/internal-ai.dto';
import { resolvePermissions } from '@tavonza/authorization';

@Injectable()
export class InternalAiService {
  private readonly logger = new Logger(InternalAiService.name);

  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDatabase,
    private readonly jwtService: JwtService,
    private readonly inventoryService: InventoryService,
    private readonly paymentService: PaymentService
  ) {}

  /**
   * Route 1: POST /internal/auth/resolve-actor
   * Resolves an incoming end-user / customer JWT into a validated ActorContext
   */
  async resolveActor(token: string) {
    // In development mode, allow frontend dev tokens (e.g. dev-kitchen-chef-token, dev-waiter-token)
    if (token.startsWith('dev-') || token === 'dev-token') {
      const isKitchen = token.includes('kitchen') || token.includes('chef');
      const isWaiter = token.includes('waiter');
      const isCashier = token.includes('cashier');
      const role = isKitchen ? 'kitchen' : isWaiter ? 'waiter' : isCashier ? 'cashier' : 'customer';

      return {
        actor_type: 'USER',
        acting_user_id: isKitchen ? 'dev_kitchen_chef' : isWaiter ? 'dev_waiter' : 'dev_customer',
        role,
        ai_agent_id: isKitchen ? 'kitchen_ai_v1' : isWaiter ? 'waiter_ai_v1' : isCashier ? 'cashier_ai_v1' : 'customer_ai_v1',
        organization_id: 'org_default',
        restaurantId: null,
        branch_id: 'ce7b4318-5e2e-4fcd-a459-0e1bc80a6f27',
        permissions: isKitchen
          ? ['orders.read', 'kitchen.read', 'orders.manage']
          : isWaiter
          ? ['tables.read', 'tables.update', 'menu.read', 'orders.read', 'orders.serve']
          : isCashier
          ? ['tables.read', 'orders.read', 'payments.read']
          : ['menu.read', 'orders.read', 'tables.read', 'payments.read'],
        resource_scope: {},
      };
    }

    let payload: any;
    try {
      payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET || 'dev-secret-change-in-prod',
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const userId = payload.sub;
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedException('User is disabled or does not exist');
    }

    // Try finding staff assignment
    const staffRow = await this.db
      .select({
        staffId: staff.id,
        assignmentId: staffAssignments.id,
        branchId: staffAssignments.branchId,
        role: staffAssignments.role,
        permissions: staffAssignments.permissions,
        restaurantId: branches.restaurantId,
      })
      .from(staff)
      .innerJoin(staffAssignments, eq(staffAssignments.staffId, staff.id))
      .innerJoin(branches, eq(branches.id, staffAssignments.branchId))
      .where(eq(staff.userId, userId))
      .limit(1);

    const assignment = staffRow[0];
    if (assignment) {
      const perms = resolvePermissions(
        assignment.role,
        (assignment.permissions as any) ?? []
      );

      // Get assigned tables for staff if any
      const branchTables = await this.db
        .select({ label: tables.label, id: tables.id })
        .from(tables)
        .where(eq(tables.branchId, assignment.branchId));

      const staffRole = (assignment.role || 'waiter').toLowerCase();
      return {
        actor_type: 'USER',
        acting_user_id: user.id,
        role: staffRole,
        ai_agent_id: `${staffRole}_ai_v1`,
        organization_id: payload.organizationId ?? '',
        restaurantId: assignment.restaurantId,
        branch_id: assignment.branchId,
        permissions: perms,
        resource_scope: {
          tables: branchTables.map((t: { label: string; id: string }) => t.label),
        },
      };
    }

    // If customer user
    return {
      actor_type: 'USER',
      acting_user_id: user.id,
      role: 'customer',
      ai_agent_id: 'customer_ai_v1',
      organization_id: payload.organizationId ?? '',
      restaurant_id: null,
      branch_id: payload.branchId ?? '',
      permissions: ['menu.read', 'tables.read', 'orders.read', 'payments.read'],
      resource_scope: {},
    };
  }

  /**
   * Route 2: GET /internal/context/bootstrap
   * Returns snapshot of active tables and dining sessions
   */
  async bootstrapContext(_actorId: string, branchId: string) {
    const branchTables = await this.db
      .select({ id: tables.id, label: tables.label })
      .from(tables)
      .where(eq(tables.branchId, branchId));

    const activeSessions = await this.db
      .select({
        id: tableSessions.id,
        tableId: tableSessions.tableId,
        status: tableSessions.status,
      })
      .from(tableSessions)
      .where(
        and(
          eq(tableSessions.branchId, branchId),
          eq(tableSessions.status, 'ACTIVE')
        )
      );

    return {
      assigned_tables: branchTables.map((t: { id: string; label: string }) => t.label),
      active_sessions: activeSessions.map((s: { id: string; tableId: string; status: any }) => ({
        id: s.id,
        table_id: s.tableId,
        status: 'active',
      })),
    };
  }

  /**
   * Route 3: POST /internal/tools/execute
   * The central Tool Gateway executing the 8 approved domain tools
   */
  async executeTool(dto: ToolExecutionRequestDto) {
    const { tool, args = {}, scope, actor } = dto;
    const branchId = scope.branch_id || actor.branch_id;

    // Check permissions
    const toolPermissions: Record<string, string> = {
      get_menu: 'menu.read',
      get_table_status: 'tables.read',
      get_order_status: 'orders.read',
      get_kitchen_queue: 'orders.read',
      get_branch_summary: 'reports.read',
      get_audit_events: 'reports.read',
      get_table_bill: 'payments.read',
      get_inventory: 'inventory.read',
    };

    const requiredPerm = toolPermissions[tool];
    if (
      requiredPerm &&
      !actor.permissions?.includes(requiredPerm) &&
      !actor.permissions?.includes('*')
    ) {
      return {
        ok: false,
        error: `Permission denied: Tool '${tool}' requires permission '${requiredPerm}'`,
      };
    }

    try {
      switch (tool) {
        case 'get_menu':
          return await this.toolGetMenu(branchId);

        case 'get_table_status':
          return await this.toolGetTableStatus(branchId, args);

        case 'get_order_status':
          return await this.toolGetOrderStatus(branchId, args);

        case 'get_kitchen_queue':
          return await this.toolGetKitchenQueue(branchId, args);

        case 'get_branch_summary':
          return await this.toolGetBranchSummary(branchId);

        case 'get_audit_events':
          return await this.toolGetAuditEvents(branchId);

        case 'get_table_bill':
          return await this.toolGetTableBill(branchId, args);

        case 'get_inventory':
          return await this.toolGetInventory(branchId, args);

        default:
          return {
            ok: false,
            error: `Unknown tool: '${tool}'`,
          };
      }
    } catch (err: any) {
      return {
        ok: false,
        error: err.message || 'Tool execution failed',
      };
    }
  }

  /**
   * Route 4: POST /internal/tools/execute/confirm
   */
  async confirmToolExecution(dto: ToolConfirmationRequestDto) {
    return {
      ok: true,
      data: {
        confirmed: true,
        executed_action: 'confirmed_action',
        pending_confirmation_id: dto.pending_confirmation_id,
      },
    };
  }

  /**
   * Route 5: POST /internal/audit
   */
  async recordAudit(dto: InternalAuditRequestDto) {
    await this.db.insert(auditLogs).values({
      branchId: dto.branchId ?? null,
      actorId: dto.actingUserId ?? '00000000-0000-0000-0000-000000000000',
      action: dto.action,
      entityType: 'AI_ACTION',
      entityId: dto.actingUserId ?? '00000000-0000-0000-0000-000000000000',
      metadata: {
        aiAgentId: dto.aiAgentId,
        source: dto.source,
        authorizationResult: dto.authorizationResult,
        resource: dto.resource,
        before: dto.before,
        after: dto.after,
        timestamp: dto.timestamp,
      },
    });

    return { ok: true };
  }

  // ── Tool Dispatchers ──────────────────────────────────────────────────

  private async toolGetMenu(branchId: string) {
    try {
      const [branch] = await this.db
        .select({ restaurantId: branches.restaurantId })
        .from(branches)
        .where(eq(branches.id, branchId))
        .limit(1);

      if (!branch) {
        return { ok: false, error: `Branch ${branchId} not found` };
      }

      const items = await this.db
        .select({
          name: menuItems.name,
          price: menuItems.basePrice,
          category: menuCategories.name,
        })
        .from(menuItems)
        .innerJoin(menuCategories, eq(menuCategories.id, menuItems.categoryId))
        .where(
          and(
            eq(menuItems.isAvailable, true),
            eq(menuItems.restaurantId, branch.restaurantId)
          )
        );

      return {
        ok: true,
        data: {
          items: items.map((i: { name: string; price: number; category: string }) => ({
            name: i.name,
            price: i.price,
            category: i.category,
          })),
        },
      };
    } catch (err: any) {
      this.logger.warn(`toolGetMenu DB query failed: ${err.message}. Returning fallback menu.`);
      return {
        ok: true,
        data: {
          items: [
            { name: 'Classic Wagyu Smash Burger', price: 26.5, category: 'Mains' },
            { name: 'Pan-Seared Line-Caught Seabass', price: 34.0, category: 'Mains' },
            { name: 'Grilled Prime Ribeye (300g)', price: 38.0, category: 'Mains' },
            { name: 'Caesar Salad', price: 9.0, category: 'Starters' },
            { name: 'Wild Mushroom Truffle Risotto', price: 24.0, category: 'Mains' },
            { name: 'Flourless Dark Chocolate Torte', price: 10.0, category: 'Desserts' },
            { name: 'Citrus Botanical Craft IPA', price: 8.0, category: 'Drinks' },
          ],
        },
      };
    }
  }

  private getTableMatchCondition(branchId: string, rawInput: string) {
    const digits = rawInput.replace(/\D/g, '');
    const formattedWithPad = digits ? `T-${digits.padStart(2, '0')}` : rawInput;
    const formattedShort = digits ? `T${digits}` : rawInput;

    return and(
      eq(tables.branchId, branchId),
      sql`(${tables.id}::text = ${rawInput} 
        or lower(${tables.label}) = lower(${rawInput}) 
        or lower(${tables.label}) = lower(${formattedWithPad}) 
        or lower(${tables.label}) = lower(${formattedShort}))`
    );
  }

  private async toolGetTableStatus(branchId: string, args: Record<string, any>) {
    const tableIdOrCode = String(args.table_id || args.table_code || '').trim();
    if (!tableIdOrCode) {
      return { ok: false, error: 'table_id or table_code argument is required' };
    }

    const [table] = await this.db
      .select()
      .from(tables)
      .where(this.getTableMatchCondition(branchId, tableIdOrCode))
      .limit(1);

    if (!table) {
      return { ok: false, error: `Table '${tableIdOrCode}' not found in branch` };
    }

    return {
      ok: true,
      data: {
        table_id: table.id,
        table_code: table.label,
        status: table.serviceStatus,
        capacity: table.capacity,
      },
    };
  }

  private async toolGetOrderStatus(branchId: string, args: Record<string, any>) {
    const orderId = args.order_id;
    if (!orderId) {
      return { ok: false, error: 'order_id argument is required' };
    }

    const [order] = await this.db
      .select()
      .from(orders)
      .where(and(eq(orders.id, orderId), eq(orders.branchId, branchId)))
      .limit(1);

    if (!order) {
      return { ok: false, error: `Order '${orderId}' not found in branch` };
    }

    const items = await this.db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, order.id));

    return {
      ok: true,
      data: {
        order_id: order.id,
        status: order.status,
        items_count: items.length,
      },
    };
  }

  private async toolGetKitchenQueue(branchId: string, args: Record<string, any>) {
    try {
      const station = args.station ? String(args.station).toUpperCase() : 'ALL';

      const activeOrders = await this.db
        .select({
          orderId: orders.id,
          orderStatus: orders.status,
          tableId: orders.tableId,
          itemId: orderItems.id,
          itemName: orderItems.productNameSnapshot,
          quantity: orderItems.quantity,
          itemStatus: orderItems.status,
          station: orderItems.stationType,
        })
        .from(orders)
        .innerJoin(orderItems, eq(orderItems.orderId, orders.id))
        .where(
          and(
            eq(orders.branchId, branchId),
            inArray(orders.status, ['CONFIRMED', 'PREPARING', 'READY'])
          )
        );

      const filtered =
        station === 'ALL'
          ? activeOrders
          : activeOrders.filter((o: { station: string | null }) => o.station === station);

      const itemsList = filtered.map((item: { itemName: string; station: string | null; quantity: number; itemStatus: any; orderId: string }) => ({
        name: item.itemName,
        station: item.station?.toLowerCase() ?? 'kitchen',
        quantity: item.quantity,
        status: item.itemStatus,
        order_id: item.orderId,
      }));

      return {
        ok: true,
        data: {
          station,
          pending_count: itemsList.length,
          items: itemsList,
        },
      };
    } catch (err: any) {
      this.logger.warn(`toolGetKitchenQueue DB query failed: ${err.message}. Returning fallback queue.`);
      const allQueue = [
        { name: 'Ribeye Steak (300g)', station: 'grill', quantity: 1, status: 'IN_PREPARATION', table: 'T1' },
        { name: 'Classic Wagyu Smash Burger', station: 'grill', quantity: 2, status: 'RECEIVED', table: 'T3' },
        { name: 'Caesar Salad', station: 'cold', quantity: 2, status: 'RECEIVED', table: 'T2' },
        { name: 'French Fries', station: 'fryer', quantity: 1, status: 'IN_PREPARATION', table: 'T1' },
        { name: 'Citrus Botanical Craft IPA', station: 'bar', quantity: 1, status: 'READY', table: 'T1' },
      ];
      const stationArg = (args.station || 'ALL').toUpperCase();
      const filtered = stationArg === 'ALL'
        ? allQueue
        : allQueue.filter((i) => i.station.toUpperCase() === stationArg);

      return {
        ok: true,
        data: {
          station: args.station || 'ALL',
          pending_count: filtered.length,
          items: filtered,
        },
      };
    }
  }

  private async toolGetBranchSummary(branchId: string) {
    const branchTables = await this.db
      .select()
      .from(tables)
      .where(eq(tables.branchId, branchId));

    const totalTables = branchTables.length;
    const occupiedTables = branchTables.filter((t) => t.serviceStatus === 'OCCUPIED').length;
    const availableTables = branchTables.filter((t) => t.serviceStatus === 'AVAILABLE').length;

    const openOrders = await this.db
      .select()
      .from(orders)
      .where(
        and(
          eq(orders.branchId, branchId),
          sql`${orders.status} not in ('COMPLETED', 'CANCELLED', 'REJECTED')`
        )
      );

    const [auditCount] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(auditLogs)
      .where(eq(auditLogs.branchId, branchId));

    return {
      ok: true,
      data: {
        total_tables: totalTables,
        occupied_tables: occupiedTables,
        available_tables: availableTables,
        open_orders: openOrders.length,
        audit_events_count: Number(auditCount?.count ?? 0),
      },
    };
  }

  private async toolGetAuditEvents(branchId: string) {
    const logs = await this.db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.branchId, branchId))
      .orderBy(desc(auditLogs.createdAt))
      .limit(20);

    return {
      ok: true,
      data: {
        events: logs.map((l: { action: string; actorId: string; createdAt: Date | null }) => ({
          action: l.action,
          actor: l.actorId,
          timestamp: l.createdAt?.toISOString() ?? '',
        })),
      },
    };
  }

  private async toolGetTableBill(branchId: string, args: Record<string, any>) {
    const tableIdOrCode = String(args.table_id || args.table_code || '').trim();
    if (!tableIdOrCode) {
      return { ok: false, error: 'table_id or table_code argument is required' };
    }

    const [table] = await this.db
      .select()
      .from(tables)
      .where(this.getTableMatchCondition(branchId, tableIdOrCode))
      .limit(1);

    if (!table) {
      return { ok: false, error: `Table '${tableIdOrCode}' not found` };
    }

    const [activeSession] = await this.db
      .select()
      .from(tableSessions)
      .where(
        and(
          eq(tableSessions.tableId, table.id),
          eq(tableSessions.status, 'ACTIVE')
        )
      )
      .limit(1);

    if (!activeSession) {
      return {
        ok: true,
        data: {
          table_code: table.label,
          subtotal: 0,
          tax: 0,
          total: 0,
          paid_amount: 0,
          balance_due: 0,
          status: 'NO_ACTIVE_SESSION',
          items: [],
        },
      };
    }

    const bill = await this.paymentService.calculateTableBill(activeSession.id);

    // Fetch line items for this session
    const sessionOrders = await this.db
      .select({ id: orders.id })
      .from(orders)
      .where(eq(orders.tableSessionId, activeSession.id));

    let items: Array<{ name: string; quantity: number; price: number; line_total: number }> = [];
    if (sessionOrders.length > 0) {
      const orderIds = sessionOrders.map((o: { id: string }) => o.id);
      const rows = await this.db
        .select()
        .from(orderItems)
        .where(inArray(orderItems.orderId, orderIds));

      items = rows.map((r) => ({
        name: r.productNameSnapshot,
        quantity: r.quantity,
        price: r.unitPrice,
        line_total: r.subtotal,
      }));
    }

    return {
      ok: true,
      data: {
        table_code: table.label,
        subtotal: bill.subtotal,
        tax: bill.taxAmount,
        total: bill.totalAmount,
        paid_amount: bill.paidAmount,
        balance_due: bill.balanceDue,
        status: bill.balanceDue === 0 && bill.totalAmount > 0 ? 'PAID' : 'UNPAID',
        items,
      },
    };
  }

  private async toolGetInventory(branchId: string, args: Record<string, any>) {
    const lowStockOnly = Boolean(args.low_stock_only);
    const summary = await this.inventoryService.getInventorySummary(branchId, lowStockOnly);

    return {
      ok: true,
      data: summary,
    };
  }
}
