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
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import { DrizzleWaiterRepository } from '../../infrastructure/persistence/drizzle-waiter.repository';
import { DrizzleWaiterOrderRepository } from '../../infrastructure/persistence/drizzle-waiter-order.repository';
import { DrizzleAlertRepository } from '../../infrastructure/persistence/drizzle-alert.repository';
import { DrizzleUserRepository } from '../../../identity/infrastructure/persistence/drizzle-user.repository';
import {
  canWaiterTransition,
  ORDER_STATUS,
  VALID_ALERT_TYPES,
  type AlertType,
  type OrderStatus,
} from '../../domain/entities/waiter.entity';
import type {
  AssignTableDto,
  RejectOrderDto,
  CreateOrderOnBehalfDto,
  CreateAlertDto,
} from '../../presentation/http/dto/waiter-request.dto';
import { RoleLabel, ScopeType } from '@tavonza/authorization';

@Injectable()
export class WaiterService {
  constructor(
    private readonly waiterRepo: DrizzleWaiterRepository,
    private readonly orderRepo: DrizzleWaiterOrderRepository,
    private readonly alertRepo: DrizzleAlertRepository,
    private readonly userRepo: DrizzleUserRepository,
  ) {}

  // ── Slice 2: Assigned Tables ────────────────────────────────────────

  async getMyTables(waiterId: string, branchId: string): Promise<any[]> {
    const profile = await this.waiterRepo.findProfileByUserId(waiterId);
    if (!profile) throw new NotFoundException('Staff profile not found');

    const isAssigned = await this.waiterRepo.isStaffAssignedToBranch(profile.id, branchId);
    if (!isAssigned) throw new ForbiddenException('You are not assigned to this branch');

    const today = new Date().toISOString().split('T')[0] as string;
    return this.waiterRepo.findActiveTableAssignmentsForWaiter(waiterId, branchId, today);
  }

  async assignTable(dto: AssignTableDto, assignedById: string): Promise<any> {
    const today = (new Date().toISOString().split('T')[0]) as string;
    return this.waiterRepo.assignTable({
      branchId: dto.branchId,
      waiterId: dto.waiterId,
      tableId: dto.tableId,
      assignedById,
      shiftDate: today,
    });
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

    await this.orderRepo.acceptOrder(orderId);
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

    await this.orderRepo.rejectOrder(dto.orderId, dto.reason);
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
  }

  // ── Slice 5: Create Order on Behalf of Customer ─────────────────────

  async createOrderOnBehalf(dto: CreateOrderOnBehalfDto, waiterId: string): Promise<any> {
    // Verify waiter owns this table
    await this.assertWaiterOwnsTable(waiterId, dto.tableId, dto.branchId);

    // Resolve or auto-create the customer
    let customer = await this.userRepo.findByEmailOrPhone(dto.customerIdentifier);
    let customerAutoCreated = false;

    if (!customer) {
      // Auto-create thin account — waiter's JWT authorizes this action, no OTP gate
      const isEmail = dto.customerIdentifier.includes('@');
      const passwordHash = await argon2.hash('1234');

      customer = await this.userRepo.create({
        email: isEmail ? dto.customerIdentifier.toLowerCase() : `guest_${Date.now()}@tavonza.local`,
        passwordHash,
        firstName: 'Guest',
        lastName: '',
        phone: isEmail ? undefined : dto.customerIdentifier,
        role: RoleLabel.CUSTOMER,
        permissions: [],
        scopes: [{ type: ScopeType.SESSION }],
      });
      customerAutoCreated = true;

      console.log(
        `[Waiter] Auto-created customer account: ${customer.id} for identifier: ${dto.customerIdentifier}`,
      );
    }

    // Calculate totals
    const subtotal = dto.items.reduce(
      (sum: number, item: CreateOrderOnBehalfDto['items'][number]) =>
        sum + parseFloat(item.unitPrice) * item.quantity,
      0,
    );
    const serviceChargeRate = 0.05;
    const taxRate = 0.08;
    const serviceCharge = subtotal * serviceChargeRate;
    const tax = subtotal * taxRate;
    const total = subtotal + serviceCharge + tax;

    const orderNumber = `W-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const order = await this.orderRepo.createOrderOnBehalfOfCustomer({
      orderNumber,
      branchId: dto.branchId,
      tableId: dto.tableId,
      tableSessionId: dto.tableSessionId,
      waiterId,
      subtotal: subtotal.toFixed(2),
      serviceChargeRate: serviceChargeRate.toFixed(2),
      serviceCharge: serviceCharge.toFixed(2),
      taxRate: taxRate.toFixed(2),
      tax: tax.toFixed(2),
      total: total.toFixed(2),
      customerAutoCreated,
    });

    await this.orderRepo.insertOrderItems(
      dto.items.map((item: CreateOrderOnBehalfDto['items'][number]) => ({
        orderId: order.id,
        menuItemId: item.menuItemId,
        name: item.name,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        specialInstructions: item.specialInstructions,
        addOns: item.addOns,
        addOnsTotal: item.addOns
          ? item.addOns.reduce((s: number, a: { name: string; price: number }) => s + a.price, 0).toFixed(2)
          : '0.00',
        lineTotal: (parseFloat(item.unitPrice) * item.quantity).toFixed(2),
      })),
    );

    return {
      order,
      customerAutoCreated,
      customerId: customer.id,
    };
  }

  // ── Slice 5: Pending / Active Orders ───────────────────────────────

  async getPendingOrders(waiterId: string, branchId: string): Promise<any[]> {
    const tableIds = await this.getMyTableIds(waiterId, branchId);
    return this.orderRepo.findPendingOrdersForTables(tableIds);
  }

  async getActiveOrders(waiterId: string, branchId: string): Promise<any[]> {
    const tableIds = await this.getMyTableIds(waiterId, branchId);
    return this.orderRepo.findActiveOrdersForTables(tableIds);
  }

  async getOrderDetail(orderId: string, waiterId: string): Promise<any> {
    const order = await this.orderRepo.findOrderById(orderId);
    if (!order) throw new NotFoundException('Order not found');

    await this.assertWaiterOwnsTable(waiterId, order.tableId, order.branchId);

    const items = await this.orderRepo.findOrderItemsByOrderId(orderId);
    return { ...order, items };
  }

  // ── Slice 6: Alerts ─────────────────────────────────────────────────

  async createAlert(dto: CreateAlertDto): Promise<any> {
    if (!VALID_ALERT_TYPES.includes(dto.type as AlertType)) {
      throw new BadRequestException(
        `Invalid alert type. Must be one of: ${VALID_ALERT_TYPES.join(', ')}`,
      );
    }
    if (dto.type === 'custom' && !dto.message) {
      throw new BadRequestException('A message is required for custom alerts');
    }
    return this.alertRepo.create(dto as any);
  }

  async getMyAlerts(waiterId: string, branchId: string): Promise<any[]> {
    // Verify waiter is assigned to branch before showing alerts
    const profile = await this.waiterRepo.findProfileByUserId(waiterId);
    if (!profile) throw new NotFoundException('Staff profile not found');

    const isAssigned = await this.waiterRepo.isStaffAssignedToBranch(profile.id, branchId);
    if (!isAssigned) throw new ForbiddenException('You are not assigned to this branch');

    return this.alertRepo.findPendingForBranch(branchId);
  }

  async acknowledgeAlert(alertId: string, waiterId: string): Promise<void> {
    const alert = await this.alertRepo.findById(alertId);
    if (!alert) throw new NotFoundException('Alert not found');
    if (alert.status === 'resolved') {
      throw new BadRequestException('Alert is already resolved');
    }
    await this.alertRepo.acknowledge(alertId, waiterId);
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
    const today = new Date().toISOString().split('T')[0];
    const assignments = await this.waiterRepo.findActiveTableAssignmentsForWaiter(
      waiterId,
      branchId,
      today,
    );
    return assignments.map((a) => a.tableId);
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
}
