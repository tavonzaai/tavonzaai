// ============================================================================
// Waiter Service — Core Waiter Business Logic
// ============================================================================
//
// Covers:
//   - Slice 2: Assigned tables
//   - Slice 3: Accept / Reject orders
//   - Slice 4: Mark order as served
//   - Slice 5: Create order on behalf of customer (auto-create if needed)
//   - Slice 6: Customer alerts
// ============================================================================

import {
  Inject,
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { and, eq, inArray, sql } from 'drizzle-orm';
import { DrizzleWaiterRepository } from '../repositories/drizzle-waiter.repository';
import { DrizzleWaiterOrderRepository } from '../repositories/drizzle-waiter-order.repository';
import { DrizzleAlertRepository } from '../repositories/drizzle-alert.repository';
import { DrizzleUserRepository } from '../../identity/repositories/drizzle-user.repository';
import { isUUID } from '@/common/shared';
import {
  DRIZZLE,
  type DrizzleDatabase,
  menuItems,
  menuCategories,
  modifiers,
  modifierGroups,
  branchSettings,
  restaurants,
  branches,
  customers,
  guestSessions,
  tableSessions,
} from '@/database';
import {
  assertItemOrderable,
  assertQuantity,
  computeTotals,
  priceLine,
  roundMoney,
  snapshotName,
  stationForCategory,
  type CatalogItem,
  type CatalogModifier,
} from '../../orders/domain/cart-rules';
import type { JwtPayload } from '../../identity/adapters/jwt.strategy';
import { isCustomerPayload } from '../../identity/services/customer-principal.service';
import {
  canWaiterTransition,
  ORDER_STATUS,
  VALID_ALERT_TYPES,
  type AlertType,
  type OrderStatus,
} from '../domain/waiter.entity';
import type {
  AssignTableDto,
  UnassignTableDto,
  RejectOrderDto,
  CreateOrderOnBehalfDto,
  CreateAlertDto,
} from '../dto/waiter-request.dto';
import { GlobalRole } from '@/authorization';
import { OutboxService } from '@/database';

@Injectable()
export class WaiterService {
  constructor(
    private readonly waiterRepo: DrizzleWaiterRepository,
    private readonly orderRepo: DrizzleWaiterOrderRepository,
    private readonly alertRepo: DrizzleAlertRepository,
    private readonly userRepo: DrizzleUserRepository,
    private readonly outboxService: OutboxService,
    @Inject(DRIZZLE) private readonly db: DrizzleDatabase,
  ) {}

  // ── Slice 2: Assigned Tables ────────────────────────────────────────

  async getMyTables(waiterId: string, branchId?: string): Promise<any[]> {
    const profile = await this.waiterRepo.findProfileByUserId(waiterId);
    if (!profile) throw new NotFoundException('Staff profile not found');

    let resolvedBranchId = branchId;
    if (!resolvedBranchId || !isUUID(resolvedBranchId)) {
      const branches = await this.waiterRepo.findActiveBranchesForStaff(profile.id);
      const firstBranchId = branches?.[0]?.branchId;
      if (firstBranchId && isUUID(firstBranchId)) {
        resolvedBranchId = firstBranchId;
      } else {
        throw new BadRequestException('A valid branch UUID is required');
      }
    }


    const isAssigned = await this.waiterRepo.isStaffAssignedToBranch(profile.id, resolvedBranchId);
    if (!isAssigned) throw new ForbiddenException('You are not assigned to this branch');

    return this.waiterRepo.findActiveTableAssignmentsForWaiter(waiterId, resolvedBranchId, profile.id);
  }

  async getAssignedTableIds(waiterId: string, branchId: string): Promise<string[]> {
    return this.waiterRepo.findAssignedTableIds(waiterId, branchId);
  }

  async isTableAssigned(waiterId: string, tableId: string, branchId: string): Promise<boolean> {
    return this.waiterRepo.isTableAssignedToWaiter(waiterId, tableId, branchId);
  }

  async getTableDetail(waiterId: string, tableId: string, branchId?: string) {
    const detail = await this.waiterRepo.findTableDetail(tableId);
    if (!detail) {
      throw new NotFoundException(`Table with ID "${tableId}" not found`);
    }

    const resolvedBranchId = branchId || detail.table.branchId;
    if (detail.table.branchId !== resolvedBranchId) {
      throw new ForbiddenException('Table does not belong to this branch');
    }

    const assigned = await this.waiterRepo.isTableAssignedToWaiter(
      waiterId,
      tableId,
      detail.table.branchId,
    );
    if (!assigned) {
      throw new ForbiddenException('You are not assigned to this table');
    }

    return {
      id: detail.table.id,
      branchId: detail.table.branchId,
      label: detail.table.label,
      tableNumber: detail.table.label,
      capacity: detail.table.capacity,
      serviceStatus: detail.table.serviceStatus,
      operationalFlag: detail.table.operationalFlag,
      floor: detail.table.floor,
      shape: detail.table.shape,
      session: detail.session
        ? {
            id: detail.session.id,
            status: detail.session.status,
            partySize: detail.session.partySize,
            startedAt: detail.session.startedAt,
            guests: detail.guests,
          }
        : null,
    };
  }


  async assignTable(dto: AssignTableDto, assignedById: string): Promise<any> {
    const start = dto.sessionStart ? new Date(dto.sessionStart) : new Date();
    const end = dto.sessionEnd ? new Date(dto.sessionEnd) : new Date(Date.now() + 8 * 60 * 60 * 1000);

    // Resolve waiter staff ID (dto.waiterId could be staff.id or users.id)
    let waiterStaffId = dto.waiterId;
    const waiterByUserId = await this.waiterRepo.findProfileByUserId(dto.waiterId);
    if (waiterByUserId) {
      waiterStaffId = waiterByUserId.id;
    }

    // Resolve assigner staff ID (assignedById from JWT is user.sub)
    let assignerStaffId = assignedById;
    const assignerProfile = await this.waiterRepo.findProfileByUserId(assignedById);
    if (assignerProfile) {
      assignerStaffId = assignerProfile.id;
    } else {
      const created = await this.waiterRepo.createProfile({ userId: assignedById, jobTitle: 'MANAGER' });
      assignerStaffId = created.id;
    }

    return this.waiterRepo.assignTable({
      branchId: dto.branchId,
      waiterId: waiterStaffId,
      tableId: dto.tableId,
      tableIds: dto.tableIds,
      assignedById: assignerStaffId,
      sessionStart: start,
      sessionEnd: end,
    });
  }

  async unassignTable(dto: UnassignTableDto): Promise<any> {
    return this.waiterRepo.unassignTable({
      branchId: dto.branchId,
      waiterId: dto.waiterId,
      tableId: dto.tableId,
      tableIds: dto.tableIds,
      assignmentId: dto.assignmentId,
    });
  }

  async releaseAssignment(assignmentId: string): Promise<void> {
    return this.waiterRepo.releaseTable(assignmentId);
  }

  async getBranchAssignments(branchId: string, waiterId?: string): Promise<any[]> {
    return this.waiterRepo.findAssignmentsForBranch(branchId, waiterId);
  }

  // ── Slice 3: Accept Order ───────────────────────────────────────────

  async acceptOrder(orderId: string, waiterId: string): Promise<void> {
    const order = await this.orderRepo.findOrderById(orderId);
    if (!order) throw new NotFoundException('Order not found');

    // Enforce waiter owns this table
    await this.assertWaiterOwnsTable(waiterId, order.tableId, order.branchId);

    if (!canWaiterTransition(order.status as OrderStatus, ORDER_STATUS.ACCEPTED)) {
      throw new BadRequestException(
        `Cannot accept order in status "${order.status}". Order must be in SUBMITTED status.`,
      );
    }

    const profile = await this.waiterRepo.findProfileByUserId(waiterId);
    await this.orderRepo.acceptOrder(orderId, profile?.id);

    if (order.tableId) {
      await this.waiterRepo.updateTableStatus(order.tableId, 'PREPARING');
      await this.outboxService.publishEvent({
        aggregateType: 'TABLE',
        aggregateId: order.tableId,
        eventType: 'TableStatusChanged',
        branchId: order.branchId,
        payload: {
          tableId: order.tableId,
          tableLabel: 'Table',
          branchId: order.branchId,
          serviceStatus: 'PREPARING',
          operationalFlag: 'NORMAL',
          activeSessionId: order.tableSessionId,
          updatedAt: new Date().toISOString(),
        },
      });
    }

    await this.outboxService.publishEvent({
      aggregateType: 'ORDER',
      aggregateId: order.id,
      eventType: 'OrderAccepted',
      branchId: order.branchId,
      payload: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        branchId: order.branchId,
        tableId: order.tableId,
        tableSessionId: order.tableSessionId,
        acceptedById: waiterId,
        acceptedAt: new Date().toISOString(),
      },
    });
  }

  // ── Slice 3: Reject Order ───────────────────────────────────────────

  async rejectOrder(dto: RejectOrderDto, waiterId: string): Promise<void> {
    const order = await this.orderRepo.findOrderById(dto.orderId);
    if (!order) throw new NotFoundException('Order not found');

    await this.assertWaiterOwnsTable(waiterId, order.tableId, order.branchId);

    if (!canWaiterTransition(order.status as OrderStatus, ORDER_STATUS.REJECTED)) {
      throw new BadRequestException(
        `Cannot reject order in status "${order.status}". Order must be in SUBMITTED status.`,
      );
    }

    const profile = await this.waiterRepo.findProfileByUserId(waiterId);
    const reasonCode = dto.rejectionReasonCode ?? dto.reasonCode ?? 'OTHER';
    await this.orderRepo.rejectOrder(dto.orderId, dto.reason, reasonCode, profile?.id);

    await this.outboxService.publishEvent({
      aggregateType: 'ORDER',
      aggregateId: order.id,
      eventType: 'OrderRejected',
      branchId: order.branchId,
      payload: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        branchId: order.branchId,
        tableSessionId: order.tableSessionId,
        rejectedById: waiterId,
        rejectionReasonCode: reasonCode,
        rejectionReason: dto.reason,
        rejectedAt: new Date().toISOString(),
      },
    });
  }

  // ── Slice 4: Serve Order ────────────────────────────────────────────

  async serveOrder(orderId: string, waiterId: string): Promise<void> {
    const order = await this.orderRepo.findOrderById(orderId);
    if (!order) throw new NotFoundException('Order not found');

    await this.assertWaiterOwnsTable(waiterId, order.tableId, order.branchId);

    if (!canWaiterTransition(order.status as OrderStatus, ORDER_STATUS.SERVED)) {
      throw new BadRequestException(
        `Cannot serve order in status "${order.status}". Order must be in READY status.`,
      );
    }

    await this.orderRepo.markServed(orderId);

    await this.outboxService.publishEvent({
      aggregateType: 'ORDER',
      aggregateId: order.id,
      eventType: 'OrderServed',
      branchId: order.branchId,
      payload: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        branchId: order.branchId,
        tableSessionId: order.tableSessionId,
        servedById: waiterId,
        servedAt: new Date().toISOString(),
      },
    });
  }

  // ── Slice 5: Create Order on Behalf of Customer ─────────────────────

  async createOrderOnBehalf(dto: CreateOrderOnBehalfDto, waiterId: string): Promise<any> {
    await this.assertWaiterOwnsTable(waiterId, dto.tableId, dto.branchId);

    const [branch] = await this.db
      .select({
        id: branches.id,
        restaurantId: branches.restaurantId,
        organizationId: restaurants.organizationId,
      })
      .from(branches)
      .innerJoin(restaurants, eq(restaurants.id, branches.restaurantId))
      .where(eq(branches.id, dto.branchId))
      .limit(1);
    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    const menuItemIds = [...new Set(dto.items.map((item) => item.menuItemId))];
    const catalogRows = await this.db
      .select({
        id: menuItems.id,
        name: menuItems.name,
        basePrice: menuItems.basePrice,
        isAvailable: menuItems.isAvailable,
        isStockTracked: menuItems.isStockTracked,
        stockQuantity: menuItems.stockQuantity,
        restaurantId: menuItems.restaurantId,
        estimatedPrepTime: menuItems.estimatedPrepTime,
        categoryName: menuCategories.name,
      })
      .from(menuItems)
      .leftJoin(menuCategories, eq(menuCategories.id, menuItems.categoryId))
      .where(inArray(menuItems.id, menuItemIds));

    const catalogById = new Map(catalogRows.map((row) => [row.id, row]));
    const pricedItems: Array<{
      menuItemId: string;
      name: string;
      unitPrice: number;
      quantity: number;
      stationType: 'KITCHEN' | 'BAR';
      estimatedPrepTime: number;
      isStockTracked: boolean;
      specialInstructions?: string;
    }> = [];

    for (const line of dto.items) {
      assertQuantity(line.quantity);
      const catalog = catalogById.get(line.menuItemId);
      if (!catalog) {
        throw new BadRequestException(`Menu item ${line.menuItemId} was not found`);
      }
      if (catalog.restaurantId !== branch.restaurantId) {
        throw new BadRequestException(`"${catalog.name}" is not on this branch's menu`);
      }
      const item: CatalogItem = {
        id: catalog.id,
        name: catalog.name,
        basePrice: Number(catalog.basePrice),
        isAvailable: catalog.isAvailable,
        isStockTracked: catalog.isStockTracked,
        stockQuantity: catalog.stockQuantity,
        restaurantId: catalog.restaurantId,
      };
      assertItemOrderable(item, line.quantity);

      const availableModifiers = await this.loadItemModifiers(catalog.id);
      const selected = this.resolveAddOns(item, line.addOns ?? [], availableModifiers);
      const priced = priceLine(item, selected, line.quantity);
      pricedItems.push({
        menuItemId: catalog.id,
        name: snapshotName(item, selected),
        unitPrice: priced.unitPrice,
        quantity: line.quantity,
        stationType: stationForCategory(catalog.categoryName),
        estimatedPrepTime: catalog.estimatedPrepTime ?? 15,
        isStockTracked: Boolean(catalog.isStockTracked),
        specialInstructions: line.specialInstructions,
      });
    }

    const [settings] = await this.db
      .select({
        taxPercent: branchSettings.taxPercent,
        serviceChargePct: branchSettings.serviceChargePct,
      })
      .from(branchSettings)
      .where(eq(branchSettings.branchId, dto.branchId))
      .limit(1);
    const subtotal = roundMoney(
      pricedItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
    );
    const totals = computeTotals(subtotal, {
      taxPercent: settings?.taxPercent ?? 0,
      serviceChargePercent: settings?.serviceChargePct ?? 0,
    });

    let customerId: string | null = null;
    const existingUser = await this.userRepo.findByEmailOrPhone(dto.customerIdentifier);
    if (existingUser && existingUser.role === GlobalRole.CUSTOMER) {
      customerId = await this.userRepo.ensureCustomerProfile(existingUser.id);
    }
    const identifier = dto.customerIdentifier.trim();
    const guestPhone = identifier.includes('@') ? null : identifier;
    const guestName = existingUser?.name ?? (identifier.includes('@') ? identifier.split('@')[0] : identifier);

    const [sessionGuest] = await this.db
      .select({ id: guestSessions.id })
      .from(guestSessions)
      .where(
        and(
          eq(guestSessions.tableSessionId, dto.tableSessionId),
          eq(guestSessions.status, 'ACTIVE'),
        ),
      )
      .limit(1);

    await this.db.transaction(async (tx) => {
      for (const line of pricedItems) {
        if (!line.isStockTracked) continue;
        const updated = await tx
          .update(menuItems)
          .set({
            stockQuantity: sql`${menuItems.stockQuantity} - ${line.quantity}`,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(menuItems.id, line.menuItemId),
              eq(menuItems.isStockTracked, true),
              sql`${menuItems.stockQuantity} >= ${line.quantity}`,
            ),
          )
          .returning({ id: menuItems.id });
        if (updated.length === 0) {
          throw new BadRequestException(`Not enough "${line.name}" left to fulfil this order`);
        }
      }
    });

    const orderNumber = `W-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const notes = pricedItems
      .filter((item) => item.specialInstructions)
      .map((item) => `${item.name}: ${item.specialInstructions}`)
      .join('\n') || null;

    const order = await this.orderRepo.createOrderOnBehalfOfCustomer({
      orderNumber,
      branchId: dto.branchId,
      tableId: dto.tableId,
      tableSessionId: dto.tableSessionId,
      waiterId,
      customerId,
      guestSessionId: sessionGuest?.id ?? null,
      guestName,
      guestPhone,
      specialInstructions: notes,
      subtotal: totals.subtotal.toFixed(2),
      serviceCharge: totals.serviceCharge.toFixed(2),
      tax: totals.tax.toFixed(2),
      total: totals.total.toFixed(2),
    });

    await this.orderRepo.insertOrderItems(
      pricedItems.map((item) => ({
        orderId: order.id,
        menuItemId: item.menuItemId,
        name: item.name,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        stationType: item.stationType,
        estimatedPrepTime: item.estimatedPrepTime,
      })),
    );

    await this.outboxService.publishEvent({
      aggregateType: 'ORDER',
      aggregateId: order.id,
      eventType: 'OrderSubmitted',
      branchId: dto.branchId,
      payload: {
        orderId: order.id,
        orderNumber,
        branchId: dto.branchId,
        tableId: dto.tableId,
        tableLabel: 'Table',
        tableSessionId: dto.tableSessionId,
        itemsCount: pricedItems.length,
        subtotal: totals.subtotal,
        totalAmount: totals.total,
        items: pricedItems.map((item) => ({
          id: item.menuItemId,
          productName: item.name,
          quantity: item.quantity,
          stationType: item.stationType,
          specialInstructions: item.specialInstructions,
        })),
        occurredAt: new Date().toISOString(),
      },
    });

    return {
      order,
      customerAutoCreated: false,
      customerId,
    };
  }

  // ── Slice 5: Pending / Active Orders ───────────────────────────────

  async getOrders(
    waiterId: string,
    branchId: string,
    filters: { scope?: string; status?: string; tableId?: string; search?: string },
  ): Promise<any[]> {
    const tableIds = await this.getMyTableIds(waiterId, branchId);
    // Force assigned-table scope. ALL_TABLES is never allowed for waiters.
    const { scope: _ignoredScope, ...rest } = filters;
    return this.orderRepo.findOrdersForTables(tableIds, branchId, {
      ...rest,
      scope: 'MY_TABLES',
    });
  }

  async getPendingOrders(waiterId: string, branchId: string): Promise<any[]> {
    const tableIds = await this.getMyTableIds(waiterId, branchId);
    return this.orderRepo.findPendingOrdersForTables(tableIds, branchId);
  }

  async getActiveOrders(waiterId: string, branchId: string): Promise<any[]> {
    const tableIds = await this.getMyTableIds(waiterId, branchId);
    return this.orderRepo.findActiveOrdersForTables(tableIds, branchId);
  }

  async getOrderDetail(orderId: string, waiterId: string): Promise<any> {
    const order = await this.orderRepo.findOrderById(orderId);
    if (!order) throw new NotFoundException('Order not found');

    await this.assertWaiterOwnsTable(waiterId, order.tableId, order.branchId);

    const items = await this.orderRepo.findOrderItemsByOrderId(orderId);
    return { ...order, items };
  }

  // ── Slice 6: Alerts ─────────────────────────────────────────────────

  async createAlert(dto: CreateAlertDto, actor: JwtPayload): Promise<any> {
    if (!VALID_ALERT_TYPES.includes(dto.type as AlertType)) {
      throw new BadRequestException(
        `Invalid alert type. Must be one of: ${VALID_ALERT_TYPES.join(', ')}`,
      );
    }
    if (dto.type === 'custom' && !dto.message) {
      throw new BadRequestException('A message is required for custom alerts');
    }
    await this.assertCustomerCanAlert(actor, dto);
    const alert = await this.alertRepo.create(dto as any);

    await this.outboxService.publishEvent({
      aggregateType: 'ALERT',
      aggregateId: alert.id,
      eventType: 'WaiterCallAlert',
      branchId: alert.branchId,
      payload: {
        alertId: alert.id,
        branchId: alert.branchId,
        tableId: alert.tableId,
        tableLabel: 'Table',
        tableSessionId: alert.tableSessionId,
        type: (dto.type === 'call_waiter' ? 'CALL_WAITER' : dto.type === 'request_bill' || dto.type === 'bill' ? 'REQUEST_BILL' : dto.type === 'water' ? 'WATER_REFILL' : 'CUSTOM') as any,
        message: alert.message,
        status: 'PENDING',
        createdAt: alert.createdAt.toISOString(),
      },
    });

    if (dto.type === 'request_bill') {
      await this.waiterRepo.updateTableStatus(dto.tableId, 'PAYMENT_PENDING');
      await this.outboxService.publishEvent({
        aggregateType: 'TABLE',
        aggregateId: dto.tableId,
        eventType: 'TableStatusChanged',
        branchId: dto.branchId,
        payload: {
          tableId: dto.tableId,
          tableLabel: 'Table',
          branchId: dto.branchId,
          serviceStatus: 'PAYMENT_PENDING',
          operationalFlag: 'NORMAL',
          activeSessionId: dto.tableSessionId,
          updatedAt: new Date().toISOString(),
        },
      });
    }

    return alert;
  }

  async getMyAlerts(waiterId: string, branchId: string): Promise<any[]> {
    // Verify waiter is assigned to branch before showing alerts
    const profile = await this.waiterRepo.findProfileByUserId(waiterId);
    if (!profile) throw new NotFoundException('Staff profile not found');

    const isAssigned = await this.waiterRepo.isStaffAssignedToBranch(profile.id, branchId);
    if (!isAssigned) throw new ForbiddenException('You are not assigned to this branch');

    const tableIds = await this.getMyTableIds(waiterId, branchId);
    return this.alertRepo.findPendingForBranch(branchId, tableIds);
  }

  async acknowledgeAlert(alertId: string, waiterId: string): Promise<void> {
    const alert = await this.alertRepo.findById(alertId);
    if (!alert) throw new NotFoundException('Alert not found');
    if (alert.status === 'resolved') {
      throw new BadRequestException('Alert is already resolved');
    }
    await this.assertWaiterOwnsTable(waiterId, alert.tableId, alert.branchId);
    await this.alertRepo.acknowledge(alertId, waiterId);

    await this.outboxService.publishEvent({
      aggregateType: 'ALERT',
      aggregateId: alertId,
      eventType: 'AlertAcknowledged',
      branchId: alert.branchId,
      payload: {
        alertId,
        branchId: alert.branchId,
        acknowledgedById: waiterId,
        acknowledgedAt: new Date().toISOString(),
      },
    });
  }

  async resolveAlert(alertId: string, _waiterId: string): Promise<void> {
    const alert = await this.alertRepo.findById(alertId);
    if (!alert) throw new NotFoundException('Alert not found');
    if (alert.status === 'resolved') {
      throw new BadRequestException('Alert is already resolved');
    }
    await this.alertRepo.resolve(alertId);
  }

  // ── Internal Helpers ────────────────────────────────────────────────

  private async getMyTableIds(waiterId: string, branchId: string): Promise<string[]> {
    const profile = await this.waiterRepo.findProfileByUserId(waiterId);
    const assignments = await this.waiterRepo.findActiveTableAssignmentsForWaiter(
      waiterId,
      branchId,
      profile?.id,
    );
    const ids = assignments
      .map((a) => a.tableId)
      .filter((id): id is string => typeof id === 'string' && id.length > 0);
    return [...new Set(ids)];
  }

  private async assertWaiterOwnsTable(
    waiterId: string,
    tableId: string,
    branchId: string,
  ): Promise<void> {
    const owns = await this.waiterRepo.isTableAssignedToWaiter(waiterId, tableId, branchId);
    if (!owns) {
      throw new ForbiddenException('You are not assigned to this table');
    }
  }

  private async loadItemModifiers(menuItemId: string): Promise<CatalogModifier[]> {
    const rows = await this.db
      .select({
        id: modifiers.id,
        name: modifiers.name,
        priceDelta: modifiers.priceDelta,
        isAvailable: modifiers.isAvailable,
        menuItemId: modifierGroups.menuItemId,
        groupName: modifierGroups.name,
      })
      .from(modifiers)
      .innerJoin(modifierGroups, eq(modifierGroups.id, modifiers.modifierGroupId))
      .where(eq(modifierGroups.menuItemId, menuItemId));
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      priceDelta: row.priceDelta,
      isAvailable: row.isAvailable,
      menuItemId: row.menuItemId,
      groupName: row.groupName,
    }));
  }

  private resolveAddOns(
    item: CatalogItem,
    requested: Array<{ name: string; price?: number }>,
    available: CatalogModifier[],
  ): CatalogModifier[] {
    if (requested.length === 0) return [];
    const byName = new Map(available.map((modifier) => [modifier.name.toLowerCase(), modifier]));
    return requested.map((addon) => {
      const match = byName.get(addon.name.toLowerCase());
      if (!match || match.isAvailable === false) {
        throw new BadRequestException(`Add-on "${addon.name}" is not available for "${item.name}"`);
      }
      return match;
    });
  }

  private async assertCustomerCanAlert(actor: JwtPayload, dto: CreateAlertDto): Promise<void> {
    const [session] = await this.db
      .select()
      .from(tableSessions)
      .where(eq(tableSessions.id, dto.tableSessionId))
      .limit(1);
    if (!session) {
      throw new NotFoundException('Table session not found');
    }
    if (session.branchId !== dto.branchId || session.tableId !== dto.tableId) {
      throw new ForbiddenException('Alert does not match the table session');
    }

    if (actor.typ === 'guest') {
      if (actor.tableSessionId !== dto.tableSessionId) {
        throw new ForbiddenException('You do not have access to this table session');
      }
      return;
    }

    if (!isCustomerPayload(actor)) {
      throw new ForbiddenException('Only seated customers can send table alerts');
    }

    const guests = await this.db
      .select({ id: guestSessions.id, customerId: guestSessions.customerId })
      .from(guestSessions)
      .where(eq(guestSessions.tableSessionId, dto.tableSessionId));
    const isParticipant = guests.some(
      (guest) =>
        guest.id === actor.guestSessionId ||
        (actor.customerId && guest.customerId === actor.customerId),
    );
    if (!isParticipant) {
      throw new ForbiddenException('You do not have access to this table session');
    }
  }
}
