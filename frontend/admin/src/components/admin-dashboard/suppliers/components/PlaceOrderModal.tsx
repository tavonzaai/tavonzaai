'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Supplier } from '../types';
import { toast } from 'sonner';

export interface PlaceOrderModalProps {
  supplier: Supplier | null;
  isOpen: boolean;
  onClose: () => void;
  onOrderSubmitted?: (supplierId: string, orderTotal: number) => void;
}

interface OrderLineItem {
  id: string;
  name: string;
  qty: number;
  unitPrice: number;
}

export default function PlaceOrderModal({
  supplier,
  isOpen,
  onClose,
  onOrderSubmitted,
}: PlaceOrderModalProps) {
  const [items, setItems] = useState<OrderLineItem[]>([
    { id: '1', name: 'Item 1', qty: 10, unitPrice: 5.5 },
    { id: '2', name: 'Item 2', qty: 5, unitPrice: 12.0 },
  ]);
  const [deliveryNote, setDeliveryNote] = useState('');

  // Pre-fill with supplier's products if available
  useEffect(() => {
    if (supplier?.products && supplier.products.length >= 2) {
      setItems(
        supplier.products.slice(0, 2).map((p, idx) => ({
          id: idx.toString(),
          name: p.name,
          qty: p.defaultQty,
          unitPrice: p.unitPrice,
        }))
      );
    } else {
      setItems([
        { id: '1', name: 'Item 1', qty: 10, unitPrice: 5.5 },
        { id: '2', name: 'Item 2', qty: 5, unitPrice: 12.0 },
      ]);
    }
    setDeliveryNote('');
  }, [supplier, isOpen]);

  if (!isOpen || !supplier) return null;

  // Calculate order total
  const orderTotal = items.reduce(
    (acc, item) => acc + (item.qty || 0) * (item.unitPrice || 0),
    0
  );

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name: `Item ${prev.length + 1}`,
        qty: 1,
        unitPrice: 10.0,
      },
    ]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleItemChange = (
    id: string,
    field: keyof OrderLineItem,
    value: string | number
  ) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderTotal <= 0) {
      toast.error('Order total must be greater than $0');
      return;
    }

    onOrderSubmitted?.(supplier.id, orderTotal);
    toast.success(
      `Purchase order of $${orderTotal.toFixed(2)} sent to ${supplier.name}!`
    );
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#18181b]/95 border border-white/20 rounded-2xl backdrop-blur-2xl p-6 shadow-2xl space-y-4 text-white relative animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-3.5">
          <div>
            <h3 className="text-white text-lg font-bold font-['Plus_Jakarta_Sans'] leading-6">
              Place Order
            </h3>
            <p className="text-slate-500 text-sm font-normal font-['Inter'] mt-0.5">
              {supplier.name} · {supplier.category}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="size-8 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4 text-amber-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Item Headers */}
          <div>
            <div className="grid grid-cols-12 gap-2 text-xs font-semibold font-['Inter'] uppercase tracking-tight text-white/70 px-1 pb-1.5">
              <div className="col-span-6">Item Name</div>
              <div className="col-span-3 text-center">Qty</div>
              <div className="col-span-3 text-center">$/Unit</div>
            </div>

            {/* Line Item Inputs */}
            <div className="space-y-2 max-h-40 overflow-y-auto no-scrollbar pr-1">
              {items.map((item) => (
                <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-6">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) =>
                        handleItemChange(item.id, 'name', e.target.value)
                      }
                      className="w-full h-8 px-3 bg-white/5 rounded-[5px] border border-white/10 text-white text-sm font-normal font-['Inter'] focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      type="number"
                      min="1"
                      value={item.qty}
                      onChange={(e) =>
                        handleItemChange(
                          item.id,
                          'qty',
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="w-full h-8 px-2 bg-white/5 rounded-[5px] border border-white/10 text-white text-sm font-normal font-['Inter'] text-center focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div className="col-span-3 flex items-center gap-1">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={item.unitPrice}
                      onChange={(e) =>
                        handleItemChange(
                          item.id,
                          'unitPrice',
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="w-full h-8 px-2 bg-white/5 rounded-[5px] border border-white/10 text-white text-sm font-normal font-['Inter'] text-center focus:outline-none focus:border-amber-400"
                    />
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-zinc-500 hover:text-red-400 p-1 transition cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* + Add Item CTA */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 text-sm font-medium font-['Inter'] transition cursor-pointer"
              >
                <Plus className="w-3 h-3 stroke-[2.5]" />
                <span>Add Item</span>
              </button>
            </div>
          </div>

          {/* Delivery Note */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-white font-['Inter']">
              Delivery Note
            </label>
            <textarea
              rows={2}
              value={deliveryNote}
              onChange={(e) => setDeliveryNote(e.target.value)}
              placeholder="Any special instructions..."
              className="w-full p-2.5 bg-white/5 rounded-xl border border-white/10 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-amber-400 resize-none font-['Inter']"
            />
          </div>

          {/* Order Total Box */}
          <div className="px-3.5 py-3 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between">
            <span className="text-white text-base font-normal font-['Inter']">
              Order Total
            </span>
            <span className="text-green-500 text-lg font-bold font-['Plus_Jakarta_Sans']">
              ${orderTotal.toFixed(2)}
            </span>
          </div>

          {/* Actions: Cancel & Send Order */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 rounded-xl border border-slate-800 hover:bg-white/5 text-slate-400 text-base font-medium font-['Inter'] transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2.5 bg-yellow-500 hover:bg-yellow-400 active:scale-[0.99] rounded-xl text-white text-base font-semibold font-['Inter'] transition cursor-pointer shadow-lg shadow-yellow-500/20"
            >
              Send Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
