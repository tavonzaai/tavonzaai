'use client';

import React, { useState, useMemo } from 'react';
import { POSCategory, POSProduct, POSCartItem, PaymentMethod } from './types';
import { POS_PRODUCTS, INITIAL_CART_ITEMS } from './posData';
import POSHeaderControls from './components/POSHeaderControls';
import POSCategoryBar from './components/POSCategoryBar';
import POSProductGrid from './components/POSProductGrid';
import POSCartPanel from './components/POSCartPanel';
import ProcessPaymentModal from './components/ProcessPaymentModal';
import PaymentCompleteModal from './components/PaymentCompleteModal';
import SplitBillModal from './components/SplitBillModal';
import { toast } from 'sonner';

export default function POSView() {
  const [selectedTable, setSelectedTable] = useState('T-01');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<POSCategory>('All');
  const [cartItems, setCartItems] = useState<POSCartItem[]>(INITIAL_CART_ITEMS);

  // Modals state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isSplitModalOpen, setIsSplitModalOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('card');

  // Filter products by category and search term
  const filteredProducts = useMemo(() => {
    return POS_PRODUCTS.filter((product) => {
      const matchesCategory =
        activeCategory === 'All' || product.category === activeCategory;
      const matchesSearch =
        !searchQuery ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase());
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
    toast.success(`Added ${product.name} to cart`);
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
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCartItems([]);
    toast.info('Cart cleared');
  };

  // Calculations
  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );
  const tax = subtotal * 0.08;
  const totalAmount = subtotal + tax;
  const totalItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Payment Handlers
  const handleConfirmPayment = () => {
    setIsPaymentModalOpen(false);
    setIsSuccessModalOpen(true);
    toast.success('Payment successfully processed!');
  };

  const handleSplitProceed = (splitCount: number, perPersonAmount: number) => {
    setIsSplitModalOpen(false);
    setIsPaymentModalOpen(true);
    toast.info(`Split between ${splitCount} guests: $${perPersonAmount.toFixed(2)} each`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full space-y-5">
      {/* 1. Sub-Header: Search Inventory & Table Selector */}
      <POSHeaderControls
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedTable={selectedTable}
        setSelectedTable={setSelectedTable}
      />

      {/* 2. Main Work Area: Products & Cart Panel */}
      <div className="flex flex-col lg:flex-row items-start gap-6">
        {/* Left Side: Category Tabs & Product Grid */}
        <div className="flex-1 min-w-0 space-y-4 w-full">
          {/* Category Bar */}
          <POSCategoryBar
            activeCategory={activeCategory}
            onSelectCategory={setActiveCategory}
          />

          {/* Product Cards Grid */}
          <div className="w-full">
            <POSProductGrid
              products={filteredProducts}
              onAddToCart={handleAddToCart}
            />
          </div>
        </div>

        {/* Right Side: Order Cart Panel */}
        <POSCartPanel
          selectedTable={selectedTable}
          cartItems={cartItems}
          onIncrementItem={handleIncrementItem}
          onDecrementItem={handleDecrementItem}
          onRemoveItem={handleRemoveItem}
          onClearCart={handleClearCart}
          onOpenProcessPayment={() => setIsPaymentModalOpen(true)}
          onOpenSplitBill={() => setIsSplitModalOpen(true)}
          onPrintBill={handlePrint}
        />
      </div>

      {/* Dialog 1: Process Payment Modal */}
      <ProcessPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        totalAmount={totalAmount}
        tableNumber={selectedTable}
        itemsCount={totalItemsCount}
        selectedMethod={selectedPaymentMethod}
        setSelectedMethod={setSelectedPaymentMethod}
        onConfirmPayment={handleConfirmPayment}
      />

      {/* Dialog 2: Payment Complete Modal */}
      <PaymentCompleteModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        totalAmount={totalAmount}
        tableNumber={selectedTable}
        paymentMethod={selectedPaymentMethod}
        onPrintReceipt={handlePrint}
      />

      {/* Dialog 3: Split Bill Modal */}
      <SplitBillModal
        isOpen={isSplitModalOpen}
        onClose={() => setIsSplitModalOpen(false)}
        totalAmount={totalAmount}
        onProceedToPayment={handleSplitProceed}
      />
    </div>
  );
}
