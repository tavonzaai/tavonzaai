'use client';

import React, { useState, useMemo } from 'react';
import {
  POSHeader,
  POSSearchAndCategories,
  POSProductGrid,
  POSCartPanel,
  POSReceiptModal,
} from './components';
import { INITIAL_POS_PRODUCTS } from './posData';
import {
  POSCategory,
  POSProduct,
  POSCartItem,
  PaymentMethod,
  POSTransaction,
} from './types';
import { toast } from 'sonner';

export default function POSView() {
  const [selectedTable, setSelectedTable] = useState('T-01');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<POSCategory>('All');
  const [cartItems, setCartItems] = useState<POSCartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Card');
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<POSTransaction | null>(null);

  // Filter products by category and search query
  const filteredProducts = useMemo(() => {
    return INITIAL_POS_PRODUCTS.filter((product) => {
      const matchesCategory =
        activeCategory === 'All' || product.category === activeCategory;
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  // Cart operations
  const handleAddToCart = (product: POSProduct) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    toast.success(`Added ${product.name} to order (${selectedTable})`);
  };

  const handleIncrementItem = (productId: string) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.product.id === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const handleDecrementItem = (productId: string) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === productId);
      if (existing && existing.quantity <= 1) {
        return prev.filter((item) => item.product.id !== productId);
      }
      return prev.map((item) =>
        item.product.id === productId
          ? { ...item, quantity: item.quantity - 1 }
          : item
      );
    });
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCartItems([]);
    toast('Cart cleared');
  };

  const handleChargeOrder = () => {
    if (cartItems.length === 0) return;

    const subtotal = cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
    const tax = subtotal * 0.08;
    const total = subtotal + tax;

    const transaction: POSTransaction = {
      id: `#${Math.floor(10500 + Math.random() * 900)}`,
      table: selectedTable,
      items: [...cartItems],
      subtotal,
      tax,
      total,
      paymentMethod,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    setLastTransaction(transaction);
    setReceiptModalOpen(true);
  };

  const handleCloseReceiptModal = () => {
    setReceiptModalOpen(false);
    setCartItems([]);
    toast.success(`Ready for new order on ${selectedTable}`);
  };

  return (
    <div className="h-full flex flex-col min-h-0 w-full overflow-hidden">
      {/* 1. FIXED Top Section (Header + Search & Categories) */}
      <div className="shrink-0 space-y-4 pb-4 border-b border-zinc-800/80 bg-black">
        {/* Title, Subtitle and Table Selector */}
        <POSHeader
          selectedTable={selectedTable}
          onSelectTable={(tbl) => {
            setSelectedTable(tbl);
            toast(`Switched active order to Table ${tbl}`);
          }}
        />

        {/* Search Bar and Category Tabs */}
        <POSSearchAndCategories
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
        />
      </div>

      {/* 2. Main Content Split: Scrollable Products (Left) + Fixed Cart Panel (Right) */}
      <div className="flex-1 flex flex-col lg:flex-row items-start gap-6 min-h-0 w-full overflow-hidden pt-4">
        {/* Left / Center: ONLY THIS SCROLLS */}
        <div className="flex-1 h-full overflow-y-auto custom-scrollbar pr-2 pb-6 min-w-0">
          <POSProductGrid
            products={filteredProducts}
            onAddToCart={handleAddToCart}
          />
        </div>

        {/* Right: FIXED Cart Panel with its own internal items scroll */}
        <div className="w-full lg:w-80 h-full flex flex-col shrink-0">
          <POSCartPanel
            selectedTable={selectedTable}
            cartItems={cartItems}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            onIncrementItem={handleIncrementItem}
            onDecrementItem={handleDecrementItem}
            onRemoveItem={handleRemoveItem}
            onClearCart={handleClearCart}
            onChargeOrder={handleChargeOrder}
          />
        </div>
      </div>

      {/* 3. 2-Step Payment Modal (Confirm Payment -> Payment Successful) */}
      <POSReceiptModal
        isOpen={receiptModalOpen}
        transaction={lastTransaction}
        onClose={handleCloseReceiptModal}
      />
    </div>
  );
}



