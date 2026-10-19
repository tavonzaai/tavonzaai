'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getAuthToken, getCookie, setCookie } from '@/redux/api/baseApi';
import {
  orderService,
  fetchBranchMenuCatalog,
  resolveCatalogMenuItemId,
  isUUID,
  type CartResponse,
} from '@/redux/features/orderApi';

export interface CartItem {
  id: string;
  orderItemId?: string;
  dishId?: string;
  name: string;
  subtitle?: string;
  price: number;
  quantity: number;
  image: string;
  addOns?: { id?: string; name: string; price: number }[];
  selectedAddOnIds?: string[];
  specialInstructions?: string;
  available?: boolean;
  issue?: string | null;
}

interface CartContextType {
  cart: CartItem[];
  tableNumber: string;
  setTableNumber: (table: string) => void;
  addToCart: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  upsertCartItem: (item: CartItem, replaceDishId?: string) => void;
  getCartItemByDishId: (dishId: string) => CartItem | undefined;
  updateQuantity: (id: string, delta: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  refreshCart: () => Promise<void>;
  totalCount: number;
  subtotal: number;
  serviceCharge: number;
  tax: number;
  totalAmount: number;
  canCheckout: boolean;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const PRE_SESSION_CART_KEY = 'tavonza_customer_cart_pre_session';

export const resolveDynamicBranchId = (apiBranchId?: string | null): string | undefined => {
  if (apiBranchId && isUUID(apiBranchId)) return apiBranchId;
  const cookieBranch = getCookie('tavonza_branch_id') || getCookie('branch_id');
  if (cookieBranch && isUUID(cookieBranch)) return cookieBranch;
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const queryBranch = params.get('branchId');
    if (queryBranch && isUUID(queryBranch)) return queryBranch;
  }
  const envDefault = process.env.NEXT_PUBLIC_DEFAULT_BRANCH_ID;
  return envDefault && isUUID(envDefault) ? envDefault : undefined;
};

export const resolveDynamicTableId = (
  apiTableId?: string | null,
  activeTableNumber?: string | null,
): string | undefined => {
  if (apiTableId && isUUID(apiTableId)) return apiTableId;
  const cookieTable = getCookie('tavonza_table_id');
  if (cookieTable && isUUID(cookieTable)) return cookieTable;
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const queryTableId = params.get('tableId') || params.get('table');
    if (queryTableId && isUUID(queryTableId)) return queryTableId;
  }
  if (activeTableNumber && isUUID(activeTableNumber)) return activeTableNumber;
  return undefined;
};

function mapServerCart(view: CartResponse): {
  items: CartItem[];
  subtotal: number;
  serviceCharge: number;
  tax: number;
  totalAmount: number;
  canCheckout: boolean;
} {
  const items: CartItem[] = (view.items || []).map((line) => ({
    id: line.id,
    orderItemId: line.id,
    dishId: line.menuItemId,
    name: line.name,
    price: line.unitPrice,
    quantity: line.quantity,
    image: line.imageUrl || '',
    specialInstructions: line.specialInstructions || undefined,
    selectedAddOnIds: line.modifierIds,
    addOns: line.modifiers?.map((m) => ({ id: m.id, name: m.name, price: m.price }))
      ?? line.addOns?.map((a) => ({ name: a.name, price: a.price })),
    available: line.available !== false,
    issue: line.issue ?? null,
  }));
  return {
    items,
    subtotal: view.subtotal ?? 0,
    serviceCharge: view.serviceCharge ?? 0,
    tax: view.tax ?? view.taxAmount ?? 0,
    totalAmount: view.total ?? view.totalAmount ?? 0,
    canCheckout: view.canCheckout !== false && items.length > 0,
  };
}

function readPreSessionCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(PRE_SESSION_CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((item) => item && (item.dishId || item.id || item.name)) : [];
  } catch {
    return [];
  }
}

function writePreSessionCart(items: CartItem[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PRE_SESSION_CART_KEY, JSON.stringify(items));
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [tableNumber, setTableNumberState] = useState('');
  const [subtotal, setSubtotal] = useState(0);
  const [serviceCharge, setServiceCharge] = useState(0);
  const [tax, setTax] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [canCheckout, setCanCheckout] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverBacked, setServerBacked] = useState(false);

  const setTableNumber = (table: string) => {
    setTableNumberState(table);
    setCookie('tavonza_table', table);
  };

  const applyServerView = useCallback((view: CartResponse) => {
    const mapped = mapServerCart(view);
    setCart(mapped.items);
    setSubtotal(mapped.subtotal);
    setServiceCharge(mapped.serviceCharge);
    setTax(mapped.tax);
    setTotalAmount(mapped.totalAmount);
    setCanCheckout(mapped.canCheckout);
    setServerBacked(true);
  }, []);

  const applyLocalTotals = useCallback((items: CartItem[]) => {
    const nextSubtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const nextService = Number((nextSubtotal * 0.05).toFixed(2));
    const nextTax = Number((nextSubtotal * 0.08).toFixed(2));
    setSubtotal(nextSubtotal);
    setServiceCharge(nextService);
    setTax(nextTax);
    setTotalAmount(Number((nextSubtotal + nextService + nextTax).toFixed(2)));
    setCanCheckout(items.length > 0);
    setServerBacked(false);
  }, []);

  const mergePreSessionIntoServer = useCallback(async () => {
    const staged = readPreSessionCart();
    if (staged.length === 0) return;
    const branchId = resolveDynamicBranchId();
    const catalog = branchId ? await fetchBranchMenuCatalog(branchId) : [];
    for (const item of staged) {
      const menuItemId = resolveCatalogMenuItemId(item, catalog) || (isUUID(item.dishId) ? item.dishId! : null);
      if (!menuItemId) continue;
      try {
        await orderService.addItem({
          menuItemId,
          quantity: item.quantity || 1,
          specialInstructions: item.specialInstructions,
          modifierIds: item.selectedAddOnIds?.filter(isUUID),
          branchId: branchId || undefined,
        });
      } catch (err) {
        console.warn('Failed to merge pre-session cart item', err);
      }
    }
    writePreSessionCart([]);
  }, []);

  const refreshCart = useCallback(async () => {
    if (!getAuthToken()) {
      const local = readPreSessionCart();
      setCart(local);
      applyLocalTotals(local);
      return;
    }
    setLoading(true);
    try {
      await mergePreSessionIntoServer();
      const view = await orderService.getCart();
      applyServerView(view);
    } catch (err) {
      console.warn('Failed to load server cart', err);
    } finally {
      setLoading(false);
    }
  }, [applyLocalTotals, applyServerView, mergePreSessionIntoServer]);

  useEffect(() => {
    const cookieTable = getCookie('tavonza_table');
    if (cookieTable) setTableNumberState(cookieTable);
    void refreshCart();
  }, [refreshCart]);

  const addToCart = (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    const fullItem: CartItem = { ...item, quantity: item.quantity || 1 };
    if (!getAuthToken()) {
      setCart((prev) => {
        const existingIndex = prev.findIndex((i) => i.id === item.id || (item.dishId && i.dishId === item.dishId));
        let next: CartItem[];
        if (existingIndex > -1) {
          next = [...prev];
          next[existingIndex] = {
            ...next[existingIndex],
            quantity: next[existingIndex].quantity + (item.quantity || 1),
          };
        } else {
          next = [...prev, fullItem];
        }
        writePreSessionCart(next);
        applyLocalTotals(next);
        return next;
      });
      return;
    }

    void (async () => {
      const branchId = resolveDynamicBranchId();
      const catalog = branchId ? await fetchBranchMenuCatalog(branchId) : [];
      const menuItemId = resolveCatalogMenuItemId(fullItem, catalog) || (isUUID(fullItem.dishId) ? fullItem.dishId! : null);
      if (!menuItemId) {
        console.warn('Cannot add item: menu item id could not be resolved');
        return;
      }
      try {
        const view = await orderService.addItem({
          menuItemId,
          quantity: fullItem.quantity,
          specialInstructions: fullItem.specialInstructions,
          modifierIds: fullItem.selectedAddOnIds?.filter(isUUID) || fullItem.addOns?.map((a) => a.id).filter((id): id is string => Boolean(id && isUUID(id))),
          branchId: branchId || undefined,
        });
        applyServerView(view);
      } catch (err) {
        console.warn('Add to cart failed', err);
      }
    })();
  };

  const updateQuantity = (id: string, delta: number) => {
    const target = cart.find((i) => i.id === id);
    if (!target) return;
    const nextQty = target.quantity + delta;

    if (!getAuthToken() || !serverBacked) {
      setCart((prev) => {
        const next = prev
          .map((item) => (item.id === id ? (nextQty > 0 ? { ...item, quantity: nextQty } : null) : item))
          .filter(Boolean) as CartItem[];
        writePreSessionCart(next);
        applyLocalTotals(next);
        return next;
      });
      return;
    }

    void (async () => {
      try {
        if (nextQty <= 0) {
          const view = await orderService.removeItem({ itemId: target.orderItemId || target.id });
          applyServerView(view);
        } else {
          const view = await orderService.updateItem({
            itemId: target.orderItemId || target.id,
            quantity: nextQty,
          });
          applyServerView(view);
        }
      } catch (err) {
        console.warn('Update cart quantity failed', err);
      }
    })();
  };

  const removeFromCart = (id: string) => {
    const target = cart.find((i) => i.id === id);
    if (!target) return;

    if (!getAuthToken() || !serverBacked) {
      setCart((prev) => {
        const next = prev.filter((item) => item.id !== id);
        writePreSessionCart(next);
        applyLocalTotals(next);
        return next;
      });
      return;
    }

    void (async () => {
      try {
        const view = await orderService.removeItem({ itemId: target.orderItemId || target.id });
        applyServerView(view);
      } catch (err) {
        console.warn('Remove cart item failed', err);
      }
    })();
  };

  const clearCart = () => {
    if (!getAuthToken() || !serverBacked) {
      writePreSessionCart([]);
      setCart([]);
      applyLocalTotals([]);
      return;
    }
    void (async () => {
      try {
        const view = await orderService.clearCart();
        applyServerView(view);
      } catch (err) {
        console.warn('Clear cart failed', err);
      }
    })();
  };

  const upsertCartItem = (item: CartItem, _replaceDishId?: string) => {
    addToCart(item);
  };

  const getCartItemByDishId = (dishId: string) => {
    return cart.find((i) => i.dishId === dishId || i.id === dishId || i.id.startsWith(dishId));
  };

  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        tableNumber,
        setTableNumber,
        addToCart,
        upsertCartItem,
        getCartItemByDishId,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart,
        totalCount,
        subtotal,
        serviceCharge,
        tax,
        totalAmount,
        canCheckout,
        loading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
