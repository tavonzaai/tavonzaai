'use client';

import React, { useState, useEffect } from 'react';
import { X, Minus, Plus, ChevronDown } from 'lucide-react';
import { OrderRow } from '../types';
import { toast } from 'sonner';

export interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddOrder: (order: OrderRow) => void;
}

interface MenuProduct {
  id: string;
  name: string;
  price: number;
}

const MENU_PRODUCTS: MenuProduct[] = [
  { id: '1', name: 'Classic Burger', price: 18.5 },
  { id: '2', name: 'BBQ Bacon Burger', price: 18.5 },
  { id: '3', name: 'Margherita Pizza', price: 18.5 },
  { id: '4', name: 'Chicken BBQ Pizza', price: 18.5 },
  { id: '5', name: 'Alfredo Pasta', price: 18.5 },
  { id: '6', name: 'Caesar Salad', price: 18.5 },
  { id: '7', name: 'Chocolate Cake', price: 18.5 },
  { id: '8', name: 'Tiramisu', price: 18.5 },
  { id: '9', name: 'Fresh Lemonade', price: 18.5 },
  { id: '10', name: 'Iced Coffee', price: 18.5 },
  { id: '11', name: 'Sparkling Water', price: 18.5 },
  { id: '12', name: 'Spaghetti Bolognese', price: 18.5 },
];

const TABLES = [
  'T-01', 'T-02', 'T-03', 'T-04', 'T-05',
  'T-06', 'T-07', 'T-08', 'T-09', 'T-10',
  'T-11', 'T-12', 'T-13', 'T-14', 'T-15',
];

const SERVERS = ['Jake R.', 'Maria L.', 'Aisha B.', 'Carlos M.', 'Priya S.'];

export default function NewOrderModal({
  isOpen,
  onClose,
  onAddOrder,
}: NewOrderModalProps) {
  const [step, setStep] = useState<'details' | 'items' | 'confirm'>('details');
  const [orderId, setOrderId] = useState('#10483');

  // Step 1: Details state
  const [table, setTable] = useState('T-01');
  const [seatingCapacity, setSeatingCapacity] = useState('4 seats');
  const [zone, setZone] = useState('Main Hall');
  const [customerName, setCustomerName] = useState('');
  const [server, setServer] = useState('Jake R.');

  // Step 2: Selected items state (map productId -> quantity)
  const [cartQuantities, setCartQuantities] = useState<Record<string, number>>({});

  const resetForm = () => {
    setOrderId(`#${Math.floor(10480 + Math.random() * 50)}`);
    setStep('details');
    setTable('T-01');
    setSeatingCapacity('4 seats');
    setZone('Main Hall');
    setCustomerName('');
    setServer('Jake R.');
    setCartQuantities({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && isOpen) {
        handleClose();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  if (!isOpen) return null;


  // Helpers
  const handleToggleItem = (product: MenuProduct) => {
    setCartQuantities((prev) => {
      const current = prev[product.id] || 0;
      if (current === 0) {
        return { ...prev, [product.id]: 1 };
      }
      return prev;
    });
  };

  const handleIncrement = (productId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCartQuantities((prev) => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1,
    }));
  };

  const handleDecrement = (productId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCartQuantities((prev) => {
      const current = prev[productId] || 0;
      if (current <= 1) {
        const next = { ...prev };
        delete next[productId];
        return next;
      }
      return { ...prev, [productId]: current - 1 };
    });
  };

  const selectedProducts = MENU_PRODUCTS.filter(
    (p) => (cartQuantities[p.id] || 0) > 0
  );

  const totalItemsCount = Object.values(cartQuantities).reduce(
    (acc, qty) => acc + qty,
    0
  );

  const totalPrice = selectedProducts.reduce((acc, p) => {
    return acc + p.price * (cartQuantities[p.id] || 0);
  }, 0);

  const handlePlaceOrder = () => {
    const newOrder: OrderRow = {
      id: orderId,
      table,
      customer: customerName.trim() || 'Walk-in',
      items: String(totalItemsCount).padStart(2, '0'),
      server,
      time: 'Just now',
      status: 'Pending',
      total: `$${totalPrice.toFixed(2)}`,
    };

    onAddOrder(newOrder);
    toast.success(`Order ${orderId} created for ${table}!`, {
      description: `Assigned to ${server} • Total: $${totalPrice.toFixed(2)}`,
    });
    handleClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
      onClick={handleClose}
    >
      <div
        className="bg-[#121214] border border-zinc-800 rounded-3xl p-5 md:p-6 w-full max-w-[460px] shadow-2xl space-y-5 text-white animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Title, Subtitle, Close Button & Step Pills */}
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-lg md:text-xl font-bold text-white tracking-tight">
                New Order — {orderId}
              </h3>
              <p className="text-sm text-zinc-400 mt-0.5">
                A QR code will be generated automatically.
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white bg-zinc-900/90 border border-zinc-800 hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4 text-amber-400" />
            </button>
          </div>

          {/* Breadcrumb Step Navigation */}
          <div className="flex items-center gap-2 pt-1 text-sm">
            <button
              type="button"
              onClick={() => setStep('details')}
              className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                step === 'details'
                  ? 'bg-amber-400 text-white shadow-sm'
                  : 'bg-zinc-900/90 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
              }`}
            >
              Details
            </button>
            <span className="text-zinc-600 text-sm">›</span>
            <button
              type="button"
              onClick={() => setStep('items')}
              className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                step === 'items'
                  ? 'bg-amber-400 text-white shadow-sm'
                  : 'bg-zinc-900/90 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
              }`}
            >
              Items
            </button>
            <span className="text-zinc-600 text-sm">›</span>
            <button
              type="button"
              onClick={() => {
                if (totalItemsCount > 0) setStep('confirm');
              }}
              className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                step === 'confirm'
                  ? 'bg-amber-400 text-white shadow-sm'
                  : 'bg-zinc-900/90 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
              }`}
            >
              Confirm
            </button>
          </div>
        </div>

        {/* STEP 1: DETAILS */}
        {step === 'details' && (
          <div className="space-y-4 text-sm">
            {/* Table Grid */}
            <div>
              <label className="block text-sm font-semibold text-zinc-300 mb-2">
                Table
              </label>
              <div className="grid grid-cols-5 gap-2">
                {TABLES.map((tbl) => (
                  <button
                    key={tbl}
                    type="button"
                    onClick={() => setTable(tbl)}
                    className={`py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                      table === tbl
                        ? 'bg-amber-400 text-white shadow-md shadow-amber-400/20 font-bold'
                        : 'bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 border border-zinc-800/80'
                    }`}
                  >
                    {tbl}
                  </button>
                ))}
              </div>
            </div>

            {/* Capacity & Zone */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-1.5">
                  Seating Capacity
                </label>
                <div className="relative">
                  <select
                    value={seatingCapacity}
                    onChange={(e) => setSeatingCapacity(e.target.value)}
                    className="w-full bg-zinc-900/90 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-white appearance-none focus:outline-none focus:border-amber-400 cursor-pointer pr-8"
                  >
                    <option value="1 seat">1 seat</option>
                    <option value="2 seats">2 seats</option>
                    <option value="4 seats">4 seats</option>
                    <option value="6 seats">6 seats</option>
                    <option value="8 seats">8 seats</option>
                    <option value="10+ seats">10+ seats</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-1.5">
                  Zone / Section
                </label>
                <div className="relative">
                  <select
                    value={zone}
                    onChange={(e) => setZone(e.target.value)}
                    className="w-full bg-zinc-900/90 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-white appearance-none focus:outline-none focus:border-amber-400 cursor-pointer pr-8"
                  >
                    <option value="Main Hall">Main Hall</option>
                    <option value="Terrace / Patio">Terrace / Patio</option>
                    <option value="VIP Lounge">VIP Lounge</option>
                    <option value="Bar Area">Bar Area</option>
                    <option value="Rooftop">Rooftop</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Customer Name */}
            <div>
              <label className="block text-sm font-semibold text-zinc-300 mb-1.5">
                Customer Name <span className="text-zinc-500 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                placeholder="Walk-in or guest name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-zinc-900/90 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-400 transition"
              />
            </div>

            {/* Assigned Server */}
            <div>
              <label className="block text-sm font-semibold text-zinc-300 mb-2">
                Assigned Server
              </label>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {SERVERS.map((srv) => (
                  <button
                    key={srv}
                    type="button"
                    onClick={() => setServer(srv)}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      server === srv
                        ? 'bg-amber-400 text-white shadow-sm font-bold'
                        : 'bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 border border-zinc-800/80'
                    }`}
                  >
                    {srv}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 1 Actions */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-sm font-semibold text-zinc-300 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setStep('items')}
                className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 rounded-xl text-sm font-bold text-white shadow-lg shadow-amber-400/20 transition-colors cursor-pointer"
              >
                Add Items
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: ITEMS */}
        {step === 'items' && (
          <div className="space-y-3.5 text-sm">
            {/* Products Grid */}
            <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
              {MENU_PRODUCTS.map((prod) => {
                const qty = cartQuantities[prod.id] || 0;
                const isSelected = qty > 0;
                return (
                  <div
                    key={prod.id}
                    onClick={() => handleToggleItem(prod)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer select-none flex items-start justify-between ${
                      isSelected
                        ? 'bg-zinc-800/90 border-2 border-white shadow-md'
                        : 'bg-zinc-900/80 hover:bg-zinc-850 border-zinc-800/80'
                    }`}
                  >
                    <div className="min-w-0 pr-1">
                      <div className="text-sm font-semibold text-white truncate">
                        {prod.name}
                      </div>
                      <div className="text-xs text-zinc-400 mt-1 font-medium">
                        ${prod.price.toFixed(2)}
                      </div>
                    </div>
                    {isSelected && (
                      <span className="size-5 rounded-full bg-amber-400 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                        {qty}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Quick Cart summary if items selected */}
            {totalItemsCount > 0 && (
              <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3 space-y-2 max-h-28 overflow-y-auto custom-scrollbar">
                <div className="text-xs font-semibold text-zinc-300 flex justify-between items-center">
                  <span>Cart ({totalItemsCount} items)</span>
                  <span className="text-amber-400 font-bold">${totalPrice.toFixed(2)}</span>
                </div>
                <div className="space-y-1.5">
                  {selectedProducts.map((prod) => {
                    const qty = cartQuantities[prod.id] || 0;
                    return (
                      <div
                        key={prod.id}
                        className="flex items-center justify-between text-sm text-zinc-300"
                      >
                        <span className="truncate max-w-[150px]">{prod.name}</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => handleDecrement(prod.id, e)}
                            className="size-5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center font-bold text-xs cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-semibold text-white text-sm w-3 text-center">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => handleIncrement(prod.id, e)}
                            className="size-5 rounded bg-zinc-800 hover:bg-zinc-700 text-amber-400 flex items-center justify-center font-bold text-xs cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <span className="font-semibold text-zinc-100 ml-1.5 w-12 text-right">
                            ${(prod.price * qty).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 2 Actions */}
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => setStep('details')}
                className="w-1/3 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-sm font-semibold text-zinc-300 transition-colors cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                disabled={totalItemsCount === 0}
                onClick={() => setStep('confirm')}
                className={`w-2/3 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                  totalItemsCount > 0
                    ? 'bg-amber-400 hover:bg-amber-300 text-white shadow-lg shadow-amber-400/20'
                    : 'bg-amber-400/40 text-white/70 cursor-not-allowed'
                }`}
              >
                Review Order ({totalItemsCount} items)
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: CONFIRM */}
        {step === 'confirm' && (
          <div className="space-y-3.5 text-sm">
            {/* Summary Box 1: Meta details */}
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3.5 space-y-2.5">
              <div className="flex justify-between items-center text-zinc-400">
                <span>Order ID</span>
                <span className="font-bold text-white">{orderId}</span>
              </div>
              <div className="flex justify-between items-center text-zinc-400">
                <span>Table</span>
                <span className="font-bold text-white">{table}</span>
              </div>
              <div className="flex justify-between items-center text-zinc-400">
                <span>Customer</span>
                <span className="font-bold text-white">
                  {customerName.trim() || 'Walk-in'}
                </span>
              </div>
              <div className="flex justify-between items-center text-zinc-400">
                <span>Server</span>
                <span className="font-bold text-white">{server}</span>
              </div>
              <div className="flex justify-between items-center text-zinc-400">
                <span>Items</span>
                <span className="font-bold text-white">{totalItemsCount} items</span>
              </div>
            </div>

            {/* Summary Box 2: Itemized breakdown */}
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3.5 space-y-2">
              <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1 custom-scrollbar">
                {selectedProducts.map((prod) => {
                  const qty = cartQuantities[prod.id] || 0;
                  return (
                    <div
                      key={prod.id}
                      className="flex justify-between items-center text-zinc-300"
                    >
                      <span>
                        {prod.name} ×{qty}
                      </span>
                      <span className="font-medium text-white">
                        ${(prod.price * qty).toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-zinc-800 pt-2 flex justify-between items-center">
                <span className="text-base font-bold text-white">Total</span>
                <span className="text-base font-bold text-white">
                  ${totalPrice.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Step 3 Actions */}
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => setStep('items')}
                className="w-1/3 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-sm font-semibold text-zinc-300 transition-colors cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handlePlaceOrder}
                className="w-2/3 py-2.5 bg-amber-400 hover:bg-amber-300 rounded-xl text-sm font-bold text-white shadow-lg shadow-amber-400/20 transition-colors cursor-pointer"
              >
                Place Order
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

