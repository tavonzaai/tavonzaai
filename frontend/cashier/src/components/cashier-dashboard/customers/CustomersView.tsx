'use client';

import React, { useState, useMemo } from 'react';
import {
  CustomersHeader,
  CustomerStatCards,
  CustomerSearchBar,
  CustomersTable,
  CustomerDetailModal,
  AddCustomerModal,
} from './components';
import { INITIAL_CUSTOMERS } from './customersData';
import { CashierCustomer, CustomerStats } from './types';
import { toast } from 'sonner';

interface CustomersViewProps {
  onNavigateToPOS?: () => void;
}

export default function CustomersView({ onNavigateToPOS }: CustomersViewProps) {
  const [customers, setCustomers] = useState<CashierCustomer[]>(INITIAL_CUSTOMERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<CashierCustomer | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CashierCustomer | null>(null);

  // Dynamic statistics
  const stats = useMemo<CustomerStats>(() => {
    const total = customers.length;
    const gold = customers.filter((c) => c.tier === 'Gold').length;
    const totalSpentSum = customers.reduce((acc, c) => acc + c.totalSpent, 0);
    const avgSpent = total > 0 ? Math.round(totalSpentSum / total) : 0;

    return {
      totalCustomers: total,
      goldMembers: gold,
      avgLifetimeValue: avgSpent,
    };
  }, [customers]);

  // Filter customers by search term
  const filteredCustomers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return customers;

    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.tier.toLowerCase().includes(q)
    );
  }, [customers, searchQuery]);

  // Handlers
  const handleSelectCustomer = (customer: CashierCustomer) => {
    setSelectedCustomer(customer);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setSelectedCustomer(null);
  };

  const handleOpenAddModal = () => {
    setEditingCustomer(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (customer: CashierCustomer) => {
    setIsDetailOpen(false);
    setEditingCustomer(customer);
    setIsAddModalOpen(true);
  };

  const handleSaveCustomer = (
    data: Omit<CashierCustomer, 'id' | 'visits' | 'totalSpent' | 'lastVisit'>
  ) => {
    if (editingCustomer) {
      setCustomers((prev) =>
        prev.map((c) => (c.id === editingCustomer.id ? { ...c, ...data } : c))
      );
      toast.success(`Updated customer profile for ${data.name}.`);
    } else {
      const newCust: CashierCustomer = {
        id: `cust-${Date.now()}`,
        ...data,
        visits: 1,
        totalSpent: 0,
        lastVisit: 'Today',
      };
      setCustomers((prev) => [newCust, ...prev]);
      toast.success(`Customer ${data.name} added successfully!`);
    }
  };

  const handleNewOrder = (customer: CashierCustomer) => {
    setIsDetailOpen(false);
    toast.success(`Starting new order for ${customer.name}...`);
    if (onNavigateToPOS) {
      onNavigateToPOS();
    }
  };

  const handleExportCSV = () => {
    const headers = ['Customer', 'Contact', 'Phone', 'Visits', 'Total Spent', 'Last Visit', 'Tier'];
    const rows = filteredCustomers.map((c) => [
      c.name,
      c.email,
      c.phone,
      c.visits,
      c.totalSpent,
      c.lastVisit,
      c.tier,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `customers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Customer directory exported to CSV!');
  };

  return (
    <div className="w-full space-y-7 font-['Inter'] pb-12 animate-in fade-in duration-200">
      {/* 1. Header with Export & Add Customer */}
      <CustomersHeader
        customerCount={filteredCustomers.length}
        onExport={handleExportCSV}
        onAddCustomer={handleOpenAddModal}
      />

      {/* 2. Top 3 Stat Cards */}
      <CustomerStatCards stats={stats} />

      {/* 3. Search Bar */}
      <CustomerSearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* 4. Customers Table */}
      <CustomersTable
        customers={filteredCustomers}
        onSelectCustomer={handleSelectCustomer}
      />

      {/* 5. Customer Detail Modal */}
      <CustomerDetailModal
        customer={selectedCustomer}
        isOpen={isDetailOpen}
        onClose={handleCloseDetail}
        onNewOrder={handleNewOrder}
        onEditProfile={handleOpenEditModal}
      />

      {/* 6. Add/Edit Customer Modal */}
      <AddCustomerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveCustomer}
        initialCustomer={editingCustomer}
      />
    </div>
  );
}
