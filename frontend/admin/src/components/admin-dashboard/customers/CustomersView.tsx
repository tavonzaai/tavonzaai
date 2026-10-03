'use client';

import React, { useState } from 'react';
import {
  CustomersHeader,
  CustomersKPICards,
  CustomersFilters,
  CustomersTable,
  AddCustomerModal,
  CustomerProfileModal,
} from './components';
import { INITIAL_CUSTOMERS, INITIAL_CUSTOMERS_KPIS } from './customersData';
import { Customer } from './types';

export default function CustomersView() {
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [selectedSegment, setSelectedSegment] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Reset page on filter changes
  const handleSelectSegment = (segment: string) => {
    setSelectedSegment(segment);
    setCurrentPage(1);
  };

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    setCurrentPage(1);
  };

  // Modals state
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Filtered customers
  const filteredCustomers = customers.filter((cust) => {
    const matchesSegment =
      selectedSegment === 'All' ||
      cust.segment.toLowerCase() === selectedSegment.toLowerCase();

    const matchesSearch =
      !searchQuery.trim() ||
      cust.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cust.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cust.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cust.notes && cust.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesSegment && matchesSearch;
  });

  // Calculate dynamic KPIs
  const totalCustomers = customers.length;
  const vipMembers = customers.filter((c) => c.segment === 'VIP').length;
  const avgSpend = Math.round(
    customers.reduce((acc, curr) => acc + curr.totalSpent, 0) / (customers.length || 1)
  );
  const visitsToday = INITIAL_CUSTOMERS_KPIS.visitsToday;

  const kpis = {
    totalCustomers,
    vipMembers,
    avgSpend,
    visitsToday,
  };

  // Handlers
  const handleViewCustomer = (cust: Customer) => {
    setSelectedCustomer(cust);
    setIsProfileOpen(true);
  };

  const handleAddCustomer = (newCustData: Omit<Customer, 'id'>) => {
    const newCustomer: Customer = {
      ...newCustData,
      id: `cust-${Date.now()}`,
    };
    setCustomers((prev) => [newCustomer, ...prev]);
    setCurrentPage(1);
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200 pb-12">
      {/* 1. Header with Add Customer action */}
      <CustomersHeader onAddCustomer={() => setIsAddOpen(true)} />

      {/* 2. 4 Key Performance Indicator Cards */}
      <CustomersKPICards kpis={kpis} />

      {/* 3. Segment Filter Tabs & Search Bar */}
      <CustomersFilters
        selectedSegment={selectedSegment}
        onSelectSegment={handleSelectSegment}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        totalCount={customers.length}
      />

      {/* 4. Customer Master Table */}
      {filteredCustomers.length > 0 ? (
        <CustomersTable
          customers={filteredCustomers}
          currentPage={currentPage}
          itemsPerPage={10}
          onPageChange={setCurrentPage}
          onViewCustomer={handleViewCustomer}
        />
      ) : (
        <div className="w-full py-16 text-center bg-stone-950/80 rounded-[10px] border border-zinc-800 font-['Inter']">
          <p className="text-stone-300 text-base font-medium">
            No customers found matching &quot;{searchQuery || selectedSegment}&quot;
          </p>
          <button
            type="button"
            onClick={() => {
              handleSelectSegment('All');
              handleSearchChange('');
            }}
            className="mt-3 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* 5. Add Customer Modal */}
      <AddCustomerModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAdd={handleAddCustomer}
      />

      {/* 6. Customer Profile & Insights Modal */}
      <CustomerProfileModal
        customer={selectedCustomer}
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </div>
  );
}
