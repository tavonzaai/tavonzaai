'use client';

import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import {
  SuppliersHeader,
  SuppliersKPICards,
  SuppliersTable,
  SupplierDetailModal,
  PlaceOrderModal,
  SupplierOrderHistoryModal,
  AddSupplierModal,
} from './components';
import { INITIAL_SUPPLIERS } from './suppliersData';
import { Supplier } from './types';

export default function SuppliersView() {
  const [suppliers, setSuppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [placeOrderSupplier, setPlaceOrderSupplier] = useState<Supplier | null>(null);
  const [isPlaceOrderModalOpen, setIsPlaceOrderModalOpen] = useState(false);

  const [historySupplier, setHistorySupplier] = useState<Supplier | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Filter suppliers by search query
  const filteredSuppliers = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return suppliers;

    return suppliers.filter(
      (s) =>
        s.name.toLowerCase().includes(query) ||
        s.contactPerson.toLowerCase().includes(query) ||
        s.category.toLowerCase().includes(query) ||
        s.location.toLowerCase().includes(query)
    );
  }, [suppliers, searchQuery]);

  // Handlers
  const handleSelectSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsDetailModalOpen(true);
  };

  const handleOpenPlaceOrder = (supplier: Supplier) => {
    setPlaceOrderSupplier(supplier);
    setIsPlaceOrderModalOpen(true);
  };

  const handleOpenOrderHistory = (supplier: Supplier) => {
    setHistorySupplier(supplier);
    setIsHistoryModalOpen(true);
  };

  const handleAddSupplier = (newSupplier: Supplier) => {
    setSuppliers((prev) => [newSupplier, ...prev]);
  };

  const handleOrderSubmitted = (supplierId: string, orderTotal: number) => {
    setSuppliers((prev) =>
      prev.map((s) => {
        if (s.id === supplierId) {
          const newOrder = {
            id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
            date: 'Today',
            itemsCount: 4,
            totalAmount: orderTotal,
            status: 'Pending' as const,
          };
          return {
            ...s,
            lastOrder: 'Today',
            nextDelivery: 'In 2 days',
            orderHistory: [newOrder, ...(s.orderHistory || [])],
          };
        }
        return s;
      })
    );
  };

  return (
    <div className="w-full space-y-5 animate-in fade-in duration-200 pb-12">
      {/* 1. Header with Add Supplier button */}
      <SuppliersHeader onOpenAddModal={() => setIsAddModalOpen(true)} />

      {/* 2. 4 KPI Metric Cards */}
      <SuppliersKPICards suppliers={suppliers} />

      {/* 3. Search Bar */}
      <div className="w-full h-10 px-4 bg-zinc-900 rounded-[5px] border border-neutral-800 flex items-center gap-3.5 focus-within:border-amber-400/60 transition-colors">
        <Search className="w-4 h-4 text-stone-400 shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search Suppliers by name, contact, category, location..."
          className="w-full bg-transparent text-base text-white placeholder:text-zinc-500 focus:outline-none font-['Inter']"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="text-xs text-zinc-400 hover:text-white px-2 py-0.5 rounded bg-zinc-800 cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

      {/* 4. Suppliers Data Table */}
      <SuppliersTable
        suppliers={filteredSuppliers}
        onSelectSupplier={handleSelectSupplier}
      />

      {/* 5. Supplier Detail Modal (Screenshot 3) */}
      <SupplierDetailModal
        supplier={selectedSupplier}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedSupplier(null);
        }}
        onOpenPlaceOrder={handleOpenPlaceOrder}
        onOpenOrderHistory={handleOpenOrderHistory}
      />

      {/* 6. Place Order Modal (Screenshot 2) */}
      <PlaceOrderModal
        supplier={placeOrderSupplier}
        isOpen={isPlaceOrderModalOpen}
        onClose={() => {
          setIsPlaceOrderModalOpen(false);
          setPlaceOrderSupplier(null);
        }}
        onOrderSubmitted={handleOrderSubmitted}
      />

      {/* 7. Order History Modal (Screenshot 1) */}
      <SupplierOrderHistoryModal
        supplier={historySupplier}
        isOpen={isHistoryModalOpen}
        onClose={() => {
          setIsHistoryModalOpen(false);
          setHistorySupplier(null);
        }}
      />

      {/* 8. Add Supplier Modal */}
      <AddSupplierModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddSupplier={handleAddSupplier}
      />
    </div>
  );
}
