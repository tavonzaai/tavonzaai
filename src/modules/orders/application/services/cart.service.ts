// ============================================================================
// Order Application — CartService
// ============================================================================
// Server-side cart for customers. The cart owner is always derived from the
// verified JWT (CustomerPrincipal); clients never send a customer or cart id.
// Prices shown in the cart are recomputed from the catalog on every read.
// ============================================================================

import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import type { CustomerPrincipal } from '../../../identity/application/services/customer-principal.service';
import {
  BusinessRuleException,
  ResourceConflictException,
  ResourceNotFoundException,
} from '../../../../common/errors/app.exception';
import {
  CONFLICT_RULE_CODES,
  CartRuleError,
  MAX_CART_LINES,
  assertItemOrderable,
  assertItemServedAtBranch,
  assertQuantity,
  assertSameBranch,
  buildLineKey,
  computeTotals,
  normalizeInstructions,
  priceLine,
  resolveModifiers,
  roundMoney,
  snapshotName,
  type CatalogModifier,
} from '../../domain/cart-rules';
import {
  DrizzleCartRepository,
  type CartCatalogItem,
  type CartItemRow,
  type CartOwner,
  type CartRow,
} from '../../infrastructure/persistence/drizzle-cart.repository';

export interface CartModifierView {
  id: string;
  name: string;
  price: number;
}

export interface CartLineView {
  id: string;
  menuItemId: string;
  name: string;
  imageUrl: string | null;
  basePrice: number;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  specialInstructions: string | null;
  modifierIds: string[];
  modifiers: CartModifierView[];
  /** False when the item, an add-on or the branch can no longer be ordered. */
  available: boolean;
  issue: string | null;
}

export interface CartView {
  id: string;
  branchId: string | null;
  items: CartLineView[];
  itemCount: number;
  subtotal: number;
  serviceChargeRate: number;
  serviceCharge: number;
  taxRate: number;
  tax: number;
  total: number;
  canCheckout: boolean;
}

/** Validated, catalog-priced line ready to become an order item. */
export interface PricedLine {
  cartItemId: string;
  menuItemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  specialInstructions: string | null;
  estimatedPrepTime: number;
  categoryName: string | null;
  isStockTracked: boolean;
}

export interface AddCartItemInput {
  menuItemId: string;
  quantity: number;
  modifierIds?: string[];
  specialInstructions?: string | null;
  branchId?: string;
}

export interface UpdateCartItemInput {
  quantity?: number;
  specialInstructions?: string | null;
}

type Executor = Parameters<DrizzleCartRepository['findItems']>[1];

export function toCartHttpError(error: unknown): unknown {
  if (!(error instanceof CartRuleError)) return error;
  const options = { details: { rule: error.code } };
  return CONFLICT_RULE_CODES.has(error.code)
    ? new ResourceConflictException(error.message, options)
    : new BusinessRuleException(error.message, options);
}

@Injectable()
export class CartService {
  constructor(private readonly repo: DrizzleCartRepository) {}

  ownerOf(principal: CustomerPrincipal): CartOwner {
    if (principal.userId && principal.customerId) return { customerId: principal.customerId };
    if (principal.guestSessionId) return { guestSessionId: principal.guestSessionId };
    throw new UnauthorizedException('Please sign in to use your cart');
  }

  async getCart(principal: CustomerPrincipal): Promise<CartView> {
    const cart = await this.repo.getOrCreate(this.ownerOf(principal));
    return this.buildView(cart);
  }

  async addItem(principal: CustomerPrincipal, input: AddCartItemInput): Promise<CartView> {
    const branchId = this.resolveBranchId(principal, input.branchId);
    const owner = this.ownerOf(principal);

    try {
      assertQuantity(input.quantity);
      const instructions = normalizeInstructions(input.specialInstructions);

      const branch = await this.repo.findActiveBranch(branchId);
      if (!branch) {
        throw new BusinessRuleException('This branch is not accepting orders right now');
      }

      const item = (await this.repo.findCatalogItems([input.menuItemId])).get(input.menuItemId);
      if (!item) {
        throw new ResourceNotFoundException('Menu item', input.menuItemId);
      }
      assertItemServedAtBranch(item, branch.restaurantId);
      assertItemOrderable(item, input.quantity);

      const available = await this.repo.findModifiersForItems([item.id]);
      const chosen = resolveModifiers(item, input.modifierIds ?? [], available);
      const modifierIds = chosen.map((modifier) => modifier.id);
      const lineKey = buildLineKey(item.id, modifierIds, instructions);

      await this.repo.database.transaction(async (tx) => {
        const created = await this.repo.getOrCreate(owner, tx);
        const cart = (await this.repo.lockCart(created.id, tx))!;
        const lines = await this.repo.findItems(cart.id, tx);

        assertSameBranch(cart.branchId, lines.length > 0, branchId);

        const existing = lines.find((line) => line.lineKey === lineKey);
        if (existing) {
          const quantity = existing.quantity + input.quantity;
          assertQuantity(quantity);
          assertItemOrderable(item, this.totalQuantityFor(lines, item.id) + input.quantity);
          await this.repo.updateItem(existing.id, { quantity }, tx);
        } else {
          if (lines.length >= MAX_CART_LINES) {
            throw new CartRuleError('CART_LINE_LIMIT', `A cart can hold at most ${MAX_CART_LINES} different items`);
          }
          assertItemOrderable(item, this.totalQuantityFor(lines, item.id) + input.quantity);
          await this.repo.insertItem(
            {
              cartId: cart.id,
              menuItemId: item.id,
              lineKey,
              quantity: input.quantity,
              modifierIds,
              specialInstructions: instructions,
            },
            tx,
          );
        }

        if (cart.branchId !== branchId) {
          await this.repo.setBranch(cart.id, branchId, tx);
        }
      });
    } catch (error) {
      throw toCartHttpError(error);
    }

    return this.getCart(principal);
  }

  async updateItem(principal: CustomerPrincipal, itemId: string, input: UpdateCartItemInput): Promise<CartView> {
    const owner = this.ownerOf(principal);

    try {
      await this.repo.database.transaction(async (tx) => {
        const created = await this.repo.getOrCreate(owner, tx);
        const cart = (await this.repo.lockCart(created.id, tx))!;
        const line = await this.repo.findItem(cart.id, itemId, tx);
        if (!line) {
          throw new ResourceNotFoundException('Cart item', itemId);
        }

        const quantity = input.quantity ?? line.quantity;
        assertQuantity(quantity);

        if (input.quantity !== undefined && input.quantity > line.quantity) {
          const item = (await this.repo.findCatalogItems([line.menuItemId], tx)).get(line.menuItemId);
          if (!item) {
            throw new ResourceNotFoundException('Menu item', line.menuItemId);
          }
          const lines = await this.repo.findItems(cart.id, tx);
          assertItemOrderable(item, this.totalQuantityFor(lines, item.id) - line.quantity + quantity);
        }

        const instructions =
          input.specialInstructions === undefined
            ? line.specialInstructions
            : normalizeInstructions(input.specialInstructions);
        const lineKey = buildLineKey(line.menuItemId, line.modifierIds, instructions);

        if (lineKey !== line.lineKey) {
          const twin = await this.repo.findLineByKey(cart.id, lineKey, tx);
          if (twin) {
            const merged = twin.quantity + quantity;
            assertQuantity(merged);
            await this.repo.deleteItem(line.id, tx);
            await this.repo.updateItem(twin.id, { quantity: merged }, tx);
            return;
          }
        }

        await this.repo.updateItem(line.id, { quantity, lineKey, specialInstructions: instructions }, tx);
      });
    } catch (error) {
      throw toCartHttpError(error);
    }

    return this.getCart(principal);
  }

  async removeItem(principal: CustomerPrincipal, itemId: string): Promise<CartView> {
    const owner = this.ownerOf(principal);
    await this.repo.database.transaction(async (tx) => {
      const created = await this.repo.getOrCreate(owner, tx);
      const cart = (await this.repo.lockCart(created.id, tx))!;
      const line = await this.repo.findItem(cart.id, itemId, tx);
      if (!line) {
        throw new ResourceNotFoundException('Cart item', itemId);
      }
      await this.repo.deleteItem(line.id, tx);
      const remaining = await this.repo.findItems(cart.id, tx);
      if (remaining.length === 0) {
        await this.repo.setBranch(cart.id, null, tx);
      }
    });
    return this.getCart(principal);
  }

  async clear(principal: CustomerPrincipal): Promise<CartView> {
    const cart = await this.repo.getOrCreate(this.ownerOf(principal));
    await this.repo.clearItems(cart.id);
    return this.buildView({ ...cart, branchId: null });
  }

  /**
   * Validates every line against the live catalog and prices it. Throws a
   * CartRuleError on the first line that can no longer be ordered.
   */
  async priceForCheckout(
    cart: CartRow,
    lines: CartItemRow[],
    executor: Executor,
  ): Promise<{ lines: PricedLine[]; totals: ReturnType<typeof computeTotals> }> {
    if (!cart.branchId) {
      throw new CartRuleError('CART_EMPTY', 'Your cart is empty');
    }
    const branch = await this.repo.findActiveBranch(cart.branchId, executor);
    if (!branch) {
      throw new CartRuleError('BRANCH_UNAVAILABLE', 'This branch is not accepting orders right now');
    }

    const catalog = await this.repo.findCatalogItems(unique(lines.map((line) => line.menuItemId)), executor);
    const modifierCatalog = await this.repo.findModifiersForItems([...catalog.keys()], executor);

    const priced = lines.map((line) => {
      const item = catalog.get(line.menuItemId);
      if (!item) {
        throw new CartRuleError('ITEM_UNAVAILABLE', 'An item in your cart is no longer on the menu');
      }
      assertItemServedAtBranch(item, branch.restaurantId);
      assertItemOrderable(item, this.totalQuantityFor(lines, item.id));
      const chosen = resolveModifiers(item, line.modifierIds, modifierCatalog);
      const { unitPrice, lineTotal } = priceLine(item, chosen, line.quantity);
      return {
        cartItemId: line.id,
        menuItemId: item.id,
        name: snapshotName(item, chosen),
        quantity: line.quantity,
        unitPrice,
        lineTotal,
        specialInstructions: line.specialInstructions,
        estimatedPrepTime: item.estimatedPrepTime ?? 15,
        categoryName: item.categoryName,
        isStockTracked: item.isStockTracked === true,
      };
    });

    const rates = await this.repo.findBranchRates(cart.branchId, executor);
    const subtotal = priced.reduce((sum, line) => sum + line.lineTotal, 0);
    return { lines: priced, totals: computeTotals(subtotal, rates) };
  }

  private async buildView(cart: CartRow): Promise<CartView> {
    const lines = await this.repo.findItems(cart.id);
    const catalog = await this.repo.findCatalogItems(unique(lines.map((line) => line.menuItemId)));
    const modifierCatalog = await this.repo.findModifiersForItems([...catalog.keys()]);
    const branch = cart.branchId ? await this.repo.findActiveBranch(cart.branchId) : null;
    const rates = cart.branchId
      ? await this.repo.findBranchRates(cart.branchId)
      : { taxPercent: 0, serviceChargePercent: 0 };

    const items = lines.flatMap((line) => {
      const item = catalog.get(line.menuItemId);
      return item ? [this.toLineView(line, item, modifierCatalog, branch, lines)] : [];
    });

    const subtotal = items.reduce((sum, line) => sum + line.lineTotal, 0);
    const totals = computeTotals(subtotal, rates);

    return {
      id: cart.id,
      branchId: cart.branchId,
      items,
      itemCount: items.reduce((sum, line) => sum + line.quantity, 0),
      subtotal: totals.subtotal,
      serviceChargeRate: rates.serviceChargePercent / 100,
      serviceCharge: totals.serviceCharge,
      taxRate: rates.taxPercent / 100,
      tax: totals.tax,
      total: totals.total,
      canCheckout: items.length > 0 && items.every((line) => line.available),
    };
  }

  private toLineView(
    line: CartItemRow,
    item: CartCatalogItem,
    modifierCatalog: CatalogModifier[],
    branch: { restaurantId: string } | null,
    lines: CartItemRow[],
  ): CartLineView {
    const known = new Map(modifierCatalog.map((modifier) => [modifier.id, modifier]));
    const chosen = line.modifierIds.flatMap((id) => {
      const modifier = known.get(id);
      return modifier && modifier.menuItemId === item.id ? [modifier] : [];
    });

    let issue: string | null = null;
    try {
      if (!branch) {
        throw new CartRuleError('BRANCH_UNAVAILABLE', 'This branch is not accepting orders right now');
      }
      assertItemServedAtBranch(item, branch.restaurantId);
      assertItemOrderable(item, this.totalQuantityFor(lines, item.id));
      resolveModifiers(item, line.modifierIds, modifierCatalog);
    } catch (error) {
      if (!(error instanceof CartRuleError)) throw error;
      issue = error.message;
    }

    const { unitPrice, lineTotal } = priceLine(item, chosen, line.quantity);
    return {
      id: line.id,
      menuItemId: item.id,
      name: item.name,
      imageUrl: item.imageUrl,
      basePrice: roundMoney(item.basePrice),
      unitPrice,
      quantity: line.quantity,
      lineTotal,
      specialInstructions: line.specialInstructions,
      modifierIds: chosen.map((modifier) => modifier.id),
      modifiers: chosen.map((modifier) => ({
        id: modifier.id,
        name: modifier.name,
        price: roundMoney(Math.max(modifier.priceDelta ?? 0, 0)),
      })),
      available: issue === null,
      issue,
    };
  }

  private resolveBranchId(principal: CustomerPrincipal, requested?: string): string {
    if (principal.branchId) {
      if (requested && requested !== principal.branchId) {
        throw new ForbiddenException('You can only order from the branch of your current table');
      }
      return principal.branchId;
    }
    if (!requested) {
      throw new BusinessRuleException('branchId is required to add items to your cart');
    }
    return requested;
  }

  private totalQuantityFor(lines: CartItemRow[], menuItemId: string): number {
    return lines.filter((line) => line.menuItemId === menuItemId).reduce((sum, line) => sum + line.quantity, 0);
  }
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}
