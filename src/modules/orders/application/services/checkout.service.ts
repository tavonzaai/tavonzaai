// ============================================================================
// Order Application — CheckoutService
// ============================================================================
// Turns the diner's server-side cart into a SUBMITTED order.
//
//   1. Idempotency-Key replays return the order created by the first request.
//   2. Table context comes from the verified guest session, or from a QR token
//      resolved server-side for signed-in customers.
//   3. In one transaction: lock the cart, re-price and re-validate every line
//      against the live catalog, deduct stock, insert the order and its items,
//      then empty the cart. Any failure rolls back and leaves the cart intact.
//   4. After commit, the existing waiter-approval / auto-accept workflow runs.
// ============================================================================

import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { and, eq, sql } from 'drizzle-orm';
import { menuItems, orderItems, orders } from '@/database';
import {
  ORDER_REPOSITORY,
  type IOrderRepository,
} from '../../domain/interfaces/order-repository.interface';
import type { Order } from '../../domain/entities/order.entity';
import {
  CartRuleError,
  assertIdempotencyKey,
  stationForCategory,
} from '../../domain/cart-rules';
import type { CustomerPrincipal } from '../../../identity/application/services/customer-principal.service';
import { DrizzleCartRepository } from '../../infrastructure/persistence/drizzle-cart.repository';
import { CartService, toCartHttpError, type PricedLine } from './cart.service';
import { OrderService } from './order.service';
import { ResourceNotFoundException } from '../../../../common/errors/app.exception';

export interface PlaceOrderInput {
  idempotencyKey: string | undefined;
  /** Required for signed-in customers without a verified guest session. */
  qrToken?: string;
}

export interface PlaceOrderResult {
  order: Order;
  /** True when the Idempotency-Key matched an order that already exists. */
  replayed: boolean;
}

interface TableContext {
  branchId: string;
  tableId: string;
  tableSessionId: string | null;
  guestSessionId: string | null;
}

@Injectable()
export class CheckoutService {
  constructor(
    private readonly cartRepo: DrizzleCartRepository,
    private readonly cartService: CartService,
    private readonly orderService: OrderService,
    @Inject(ORDER_REPOSITORY) private readonly orderRepository: IOrderRepository,
  ) {}

  async placeOrder(principal: CustomerPrincipal, input: PlaceOrderInput): Promise<PlaceOrderResult> {
    let key: string;
    try {
      key = assertIdempotencyKey(input.idempotencyKey);
    } catch (error) {
      throw toCartHttpError(error);
    }

    const replay = await this.findReplay(principal, key);
    if (replay) return replay;

    const owner = this.cartService.ownerOf(principal);
    const context = await this.resolveTableContext(principal, input.qrToken);

    let orderId: string;
    try {
      orderId = await this.cartRepo.database.transaction(async (tx) => {
        const created = await this.cartRepo.getOrCreate(owner, tx);
        const cart = (await this.cartRepo.lockCart(created.id, tx))!;
        const lines = await this.cartRepo.findItems(cart.id, tx);
        if (lines.length === 0) {
          throw new CartRuleError('CART_EMPTY', 'Your cart is empty');
        }
        if (cart.branchId !== context.branchId) {
          throw new CartRuleError(
            'BRANCH_MISMATCH',
            'Your cart was filled at a different branch than this table. Clear it and add items from this menu.',
          );
        }

        const { lines: priced, totals } = await this.cartService.priceForCheckout(cart, lines, tx);
        await this.deductStock(tx, priced);

        const [order] = await tx
          .insert(orders)
          .values({
            orderNumber: await this.nextOrderNumber(tx),
            idempotencyKey: key,
            branchId: context.branchId,
            tableId: context.tableId,
            tableSessionId: context.tableSessionId,
            guestSessionId: context.guestSessionId,
            customerId: principal.customerId,
            channel: 'DINE_IN',
            status: 'PENDING',
            subtotal: totals.subtotal,
            serviceCharge: totals.serviceCharge,
            taxAmount: totals.tax,
            totalAmount: totals.total,
            estimatedPrepTime: Math.max(15, ...priced.map((line) => line.estimatedPrepTime)),
            inventoryDeducted: true,
            specialInstructions: collectInstructions(priced),
          })
          .returning({ id: orders.id });

        await tx.insert(orderItems).values(
          priced.map((line) => ({
            orderId: order!.id,
            productId: line.menuItemId,
            productNameSnapshot: line.name,
            unitPrice: line.unitPrice,
            quantity: line.quantity,
            subtotal: line.lineTotal,
            stationType: stationForCategory(line.categoryName),
            status: 'PENDING' as const,
            estimatedPrepTime: line.estimatedPrepTime,
          })),
        );

        await this.cartRepo.clearItems(cart.id, tx);
        return order!.id;
      });
    } catch (error) {
      if (isIdempotencyConflict(error)) {
        const concurrent = await this.findReplay(principal, key);
        if (concurrent) return concurrent;
      }
      throw toCartHttpError(error);
    }

    const persisted = await this.orderRepository.findById(orderId);
    if (!persisted) {
      throw new ResourceNotFoundException('Order', orderId);
    }
    const order = await this.orderService.announceSubmittedOrder(persisted);
    return { order, replayed: false };
  }

  private async findReplay(principal: CustomerPrincipal, key: string): Promise<PlaceOrderResult | null> {
    const existing = await this.orderRepository.findByIdempotencyKey(key);
    if (!existing) return null;

    const sameOwner =
      (principal.customerId !== null && existing.customerId === principal.customerId) ||
      (principal.guestSessionId !== null && existing.guestSessionId === principal.guestSessionId);
    if (!sameOwner) {
      throw toCartHttpError(
        new CartRuleError('IDEMPOTENCY_KEY_REUSED', 'This Idempotency-Key was already used for a different order'),
      );
    }

    const order = await this.orderRepository.findById(existing.id);
    if (!order) return null;
    return { order, replayed: true };
  }

  private async resolveTableContext(principal: CustomerPrincipal, qrToken?: string): Promise<TableContext> {
    if (principal.guestSessionId && principal.tableId && principal.branchId) {
      return {
        branchId: principal.branchId,
        tableId: principal.tableId,
        tableSessionId: principal.tableSessionId,
        guestSessionId: principal.guestSessionId,
      };
    }

    const token = qrToken?.trim();
    if (!token) {
      throw toCartHttpError(
        new CartRuleError('TABLE_REQUIRED', 'Scan the QR code on your table before placing an order'),
      );
    }
    const table = await this.cartRepo.findOrderableTableByQrToken(token);
    if (!table) {
      throw new ForbiddenException('This table QR code is no longer valid. Please ask staff for help.');
    }

    const session = await this.cartRepo.findOpenTableSession(table.tableId);
    const guest =
      session && principal.customerId
        ? await this.cartRepo.findCustomerGuestSession(session.id, principal.customerId)
        : null;

    return {
      branchId: table.branchId,
      tableId: table.tableId,
      tableSessionId: session?.id ?? null,
      guestSessionId: guest?.id ?? null,
    };
  }

  private async deductStock(
    tx: Parameters<Parameters<DrizzleCartRepository['database']['transaction']>[0]>[0],
    lines: PricedLine[],
  ): Promise<void> {
    const required = new Map<string, { name: string; quantity: number }>();
    for (const line of lines) {
      if (!line.isStockTracked) continue;
      const entry = required.get(line.menuItemId) ?? { name: line.name, quantity: 0 };
      entry.quantity += line.quantity;
      required.set(line.menuItemId, entry);
    }

    for (const [menuItemId, { name, quantity }] of required) {
      const updated = await tx
        .update(menuItems)
        .set({ stockQuantity: sql`${menuItems.stockQuantity} - ${quantity}`, updatedAt: new Date() })
        .where(
          and(
            eq(menuItems.id, menuItemId),
            eq(menuItems.isStockTracked, true),
            sql`${menuItems.stockQuantity} >= ${quantity}`,
          ),
        )
        .returning({ id: menuItems.id });
      if (updated.length === 0) {
        throw new CartRuleError('INSUFFICIENT_STOCK', `Not enough "${name}" left to fulfil your order`);
      }
    }
  }

  private async nextOrderNumber(
    tx: Parameters<Parameters<DrizzleCartRepository['database']['transaction']>[0]>[0],
  ): Promise<string> {
    const [result] = await tx.select({ count: sql<number>`count(*)::int` }).from(orders);
    const seq = (result?.count ?? 0) + 1;
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return `#${10000 + seq}-${randomSuffix}`;
  }
}

function collectInstructions(lines: PricedLine[]): string | null {
  const notes = lines
    .filter((line) => line.specialInstructions)
    .map((line) => `${line.name}: ${line.specialInstructions}`);
  return notes.length > 0 ? notes.join('\n') : null;
}

function isIdempotencyConflict(error: unknown): boolean {
  const candidate = error as { code?: string; constraint?: string; cause?: { code?: string; constraint?: string } };
  const pgError = candidate?.code ? candidate : candidate?.cause;
  return pgError?.code === '23505' && pgError?.constraint === 'orders_idempotency_key_unique';
}
