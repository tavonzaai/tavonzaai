'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCookie, setCookie } from '@/redux/api/baseApi';
import { orderService } from '@/redux/features/orderApi';

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
  totalCount: number;
  subtotal: number;
  serviceCharge: number;
  tax: number;
  totalAmount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const DEFAULT_FALLBACK_BRANCH_ID = 'ce7b4318-5e2e-4fcd-a459-0e1bc80a6f27';
export const DEFAULT_FALLBACK_TABLE_ID = '00000014-0000-4000-8000-000000000008';

export const TABLE_NUMBER_MAP: Record<string, string> = {
  't-01': '00000014-0000-4000-8000-000000000001',
  't-02': '00000014-0000-4000-8000-000000000002',
  't-03': '00000014-0000-4000-8000-000000000003',
  't-04': '00000014-0000-4000-8000-000000000004',
  't-05': '00000014-0000-4000-8000-000000000005',
  't-06': '00000014-0000-4000-8000-000000000006',
  't-07': '00000014-0000-4000-8000-000000000007',
  't-08': '00000014-0000-4000-8000-000000000008',
  't-09': '00000014-0000-4000-8000-000000000009',
  't-10': '00000014-0000-4000-8000-00000000000a',
  't-11': '00000014-0000-4000-8000-00000000000b',
  't-12': '00000014-0000-4000-8000-00000000000c',
  'table 1': '00000014-0000-4000-8000-000000000001',
  'table 2': '00000014-0000-4000-8000-000000000002',
  'table 3': '00000014-0000-4000-8000-000000000003',
  'table 4': '00000014-0000-4000-8000-000000000004',
  'table 5': '00000014-0000-4000-8000-000000000005',
  'table 6': '00000014-0000-4000-8000-000000000006',
  'table 7': '00000014-0000-4000-8000-000000000007',
  'table 8': '00000014-0000-4000-8000-000000000008',
  'table 9': '00000014-0000-4000-8000-000000000009',
  'table 10': '00000014-0000-4000-8000-00000000000a',
  'table 11': '00000014-0000-4000-8000-00000000000b',
  'table 12': '00000014-0000-4000-8000-00000000000c',
  'table 01': '00000014-0000-4000-8000-000000000001',
  'table 02': '00000014-0000-4000-8000-000000000002',
  'table 03': '00000014-0000-4000-8000-000000000003',
  'table 04': '00000014-0000-4000-8000-000000000004',
  'table 05': '00000014-0000-4000-8000-000000000005',
  'table 06': '00000014-0000-4000-8000-000000000006',
  'table 07': '00000014-0000-4000-8000-000000000007',
  'table 08': '00000014-0000-4000-8000-000000000008',
  'table 09': '00000014-0000-4000-8000-000000000009',
  '1': '00000014-0000-4000-8000-000000000001',
  '2': '00000014-0000-4000-8000-000000000002',
  '3': '00000014-0000-4000-8000-000000000003',
  '4': '00000014-0000-4000-8000-000000000004',
  '5': '00000014-0000-4000-8000-000000000005',
  '6': '00000014-0000-4000-8000-000000000006',
  '7': '00000014-0000-4000-8000-000000000007',
  '8': '00000014-0000-4000-8000-000000000008',
  '9': '00000014-0000-4000-8000-000000000009',
  '10': '00000014-0000-4000-8000-00000000000a',
  '11': '00000014-0000-4000-8000-00000000000b',
  '12': '00000014-0000-4000-8000-00000000000c',
};

export const isUUID = (val?: string | null): boolean =>
  Boolean(val && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val));

export const resolveDynamicBranchId = (apiBranchId?: string | null): string => {
  if (apiBranchId && isUUID(apiBranchId)) return apiBranchId;
  const cookieBranch = getCookie('tavonza_branch_id');
  if (cookieBranch && isUUID(cookieBranch)) return cookieBranch;
  return DEFAULT_FALLBACK_BRANCH_ID;
};

export const resolveDynamicTableId = (apiTableId?: string | null, activeTableNumber?: string | null): string => {
  if (apiTableId && isUUID(apiTableId)) return apiTableId;
  const cookieTable = getCookie('tavonza_table_id');
  if (cookieTable && isUUID(cookieTable)) return cookieTable;
  const rawTable = getCookie('tavonza_table');
  const tableKey = (activeTableNumber || rawTable || '').trim().toLowerCase();
  if (tableKey && TABLE_NUMBER_MAP[tableKey]) {
    return TABLE_NUMBER_MAP[tableKey];
  }
  return DEFAULT_FALLBACK_TABLE_ID;
};

const syncAddItemToBackend = async (item: CartItem): Promise<string | undefined> => {
  try {
    const branchId = resolveDynamicBranchId();
    const tableId = resolveDynamicTableId();

    let draft: any = null;
    try {
      draft = await orderService.getCartFromSession(branchId, tableId);
    } catch {
      draft = await orderService.getCart(branchId, tableId);
    }

    if (draft?.id) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('tavonza_active_cart_id', draft.id);
      }
      const validMenuItemId = isUUID(item.dishId)
        ? item.dishId!
        : isUUID(item.id)
        ? item.id
        : '0000000b-0000-4000-8000-000000000004';

      const res = await orderService.addItem({
        orderId: draft.id,
        menuItemId: validMenuItemId,
        quantity: item.quantity || 1,
        specialInstructions: item.specialInstructions,
        addOns: item.addOns?.map((a) => ({ name: a.name, price: a.price })),
      });

      const added = res?.items?.find((i) => i.menuItemId === validMenuItemId);
      return added?.id;
    }
  } catch (err) {
    console.warn('Sync add to cart API warning:', err);
  }
  return undefined;
};

const syncUpdateItemBackend = async (item: CartItem, newQty: number) => {
  try {
    const branchId = resolveDynamicBranchId();
    const tableId = resolveDynamicTableId();

    let draft: any = null;
    try {
      draft = await orderService.getCartFromSession(branchId, tableId);
    } catch {
      draft = await orderService.getCart(branchId, tableId);
    }

    if (!draft?.id) return;

    const backendItem = draft.items?.find(
      (bi: any) => bi.id === item.orderItemId || bi.menuItemId === item.dishId || bi.menuItemId === item.id
    );

    if (backendItem?.id) {
      await orderService.updateItem({
        orderId: draft.id,
        itemId: backendItem.id,
        quantity: newQty,
      });
    }
  } catch (err) {
    console.warn('Sync update cart item API warning:', err);
  }
};

const syncRemoveItemBackend = async (item: CartItem) => {
  try {
    const branchId = resolveDynamicBranchId();
    const tableId = resolveDynamicTableId();

    let draft: any = null;
    try {
      draft = await orderService.getCartFromSession(branchId, tableId);
    } catch {
      draft = await orderService.getCart(branchId, tableId);
    }

    if (!draft?.id) return;

    const backendItem = draft.items?.find(
      (bi: any) => bi.id === item.orderItemId || bi.menuItemId === item.dishId || bi.menuItemId === item.id
    );

    if (backendItem?.id) {
      await orderService.removeItem({
        orderId: draft.id,
        itemId: backendItem.id,
      });
    }
  } catch (err) {
    console.warn('Sync remove cart item API warning:', err);
  }
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [tableNumber, setTableNumberState] = useState('');

  const setTableNumber = (table: string) => {
    setTableNumberState(table);
    setCookie('tavonza_table', table);
  };

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('tavonza_customer_cart');
      if (savedCart) {
        try {
          const parsed = JSON.parse(savedCart);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const isUUID = (val?: string | null) =>
              Boolean(val && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val));
            const sanitized = parsed.map((item: CartItem) => {
              if (item.dishId === 'item' || !isUUID(item.dishId)) {
                return {
                  ...item,
                  dishId: '4455110d-db04-4cef-92c6-46bcd6a4c7e2',
                };
              }
              return item;
            });
            setCart(sanitized);
          }
        } catch {
          // ignore parsing error
        }
      }

      const cookieTable = getCookie('tavonza_table');
      const savedTable = cookieTable || localStorage.getItem('tavonza_table');
      if (savedTable) {
        setTableNumber(savedTable);
      }
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('tavonza_customer_cart', JSON.stringify(cart));
    }
  }, [cart]);

  const addToCart = (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    const fullItem: CartItem = { ...item, quantity: item.quantity || 1 };
    setCart((prev) => {
      const existingIndex = prev.findIndex((i) => i.id === item.id);
      const qtyToAdd = item.quantity || 1;
      if (existingIndex > -1) {
        const next = [...prev];
        const updatedQty = next[existingIndex].quantity + qtyToAdd;
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: updatedQty,
        };
        syncUpdateItemBackend(next[existingIndex], updatedQty);
        return next;
      }
      return [...prev, fullItem];
    });

    // Trigger API call when adding product to cart
    syncAddItemToBackend(fullItem).then((backendItemId) => {
      if (backendItemId) {
        setCart((prev) =>
          prev.map((i) => (i.id === fullItem.id ? { ...i, orderItemId: backendItemId } : i))
        );
      }
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) => {
      const target = prev.find((i) => i.id === id);
      if (target) {
        const nextQty = target.quantity + delta;
        if (nextQty > 0) {
          syncUpdateItemBackend(target, nextQty);
        } else {
          syncRemoveItemBackend(target);
        }
      }
      return prev
        .map((item) => {
          if (item.id === id) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => {
      const target = prev.find((i) => i.id === id);
      if (target) {
        syncRemoveItemBackend(target);
      }
      return prev.filter((item) => item.id !== id);
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  const upsertCartItem = (item: CartItem, replaceDishId?: string) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex((i) => {
        if (i.id === item.id) return true;
        if (
          replaceDishId &&
          (i.dishId === replaceDishId ||
            i.id.startsWith(replaceDishId) ||
            i.name.toLowerCase() === item.name.toLowerCase())
        ) {
          return true;
        }
        if (
          item.dishId &&
          (i.dishId === item.dishId ||
            i.id.startsWith(item.dishId) ||
            i.name.toLowerCase() === item.name.toLowerCase())
        ) {
          return true;
        }
        return false;
      });

      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = item;
        return next;
      }
      return [...prev, item];
    });

    // Trigger API call when adding/updating product in cart
    syncAddItemToBackend(item);
  };

  const getCartItemByDishId = (dishId: string) => {
    return cart.find(
      (i) => i.dishId === dishId || i.id === dishId || i.id.startsWith(dishId)
    );
  };

  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const serviceCharge = Number((subtotal * 0.05).toFixed(2));
  const tax = Number((subtotal * 0.08).toFixed(2));
  const totalAmount = Number((subtotal + serviceCharge + tax).toFixed(2));

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
        totalCount,
        subtotal,
        serviceCharge,
        tax,
        totalAmount,
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
