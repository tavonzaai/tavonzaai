'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCookie, setCookie } from '@/redux/api/baseApi';

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
      return [...prev, { ...item, quantity: qtyToAdd }];
    });
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
