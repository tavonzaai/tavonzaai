'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCookie, setCookie } from '@/redux/api/baseApi';
import { orderService } from '@/redux/features/orderApi';

export interface CartItem {
  id: string;
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

const DEFAULT_FALLBACK_BRANCH_ID = 'ce7b4318-5e2e-4fcd-a459-0e1bc80a6f27';
const DEFAULT_FALLBACK_TABLE_ID = '34489e98-b165-4f29-bc3e-38be762dedb3';

const TABLE_NUMBER_MAP: Record<string, string> = {
  't-01': '5298804e-5847-4e5a-bdba-73a8f06d9ed2',
  't-02': '34489e98-b165-4f29-bc3e-38be762dedb3',
  't-03': '646823a9-c9b4-490b-9c24-1fdb7176d8ea',
  't-04': '41fe73cd-e275-459b-9533-0b2d5098d927',
  't-05': '426eae49-6fc2-4d19-9bf9-ba2258250f36',
  'table 1': '5298804e-5847-4e5a-bdba-73a8f06d9ed2',
  'table 2': '34489e98-b165-4f29-bc3e-38be762dedb3',
  'table 3': '646823a9-c9b4-490b-9c24-1fdb7176d8ea',
  'table 4': '41fe73cd-e275-459b-9533-0b2d5098d927',
  'table 5': '426eae49-6fc2-4d19-9bf9-ba2258250f36',
  '1': '5298804e-5847-4e5a-bdba-73a8f06d9ed2',
  '2': '34489e98-b165-4f29-bc3e-38be762dedb3',
  '3': '646823a9-c9b4-490b-9c24-1fdb7176d8ea',
  '4': '41fe73cd-e275-459b-9533-0b2d5098d927',
  '5': '426eae49-6fc2-4d19-9bf9-ba2258250f36',
};

const isUUID = (val?: string | null): boolean =>
  Boolean(val && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val));

const resolveDynamicBranchId = (apiBranchId?: string | null): string => {
  if (apiBranchId && isUUID(apiBranchId)) return apiBranchId;
  const cookieBranch = getCookie('tavonza_branch_id');
  if (cookieBranch && isUUID(cookieBranch)) return cookieBranch;
  return DEFAULT_FALLBACK_BRANCH_ID;
};

const resolveDynamicTableId = (apiTableId?: string | null, activeTableNumber?: string | null): string => {
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

const syncAddItemToBackend = async (item: CartItem) => {
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
      const validMenuItemId = isUUID(item.dishId)
        ? item.dishId!
        : isUUID(item.id)
        ? item.id
        : '4455110d-db04-4cef-92c6-46bcd6a4c7e2';

      await orderService.addItem({
        orderId: draft.id,
        menuItemId: validMenuItemId,
        quantity: item.quantity || 1,
        specialInstructions: item.specialInstructions,
        addOns: item.addOns?.map((a) => ({ name: a.name, price: a.price })),
      });
    }
  } catch (err) {
    console.warn('Sync add to cart API warning:', err);
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
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + qtyToAdd,
        };
        return next;
      }
      return [...prev, fullItem];
    });

    // Trigger API call when adding product to cart
    syncAddItemToBackend(fullItem);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) => {
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
    setCart((prev) => prev.filter((item) => item.id !== id));
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
