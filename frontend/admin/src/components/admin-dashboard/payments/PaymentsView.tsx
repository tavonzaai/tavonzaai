'use client';

import React, { useState, useMemo } from 'react';
import {
  PaymentsHeader,
  PaymentsKPICards,
  PaymentsFilters,
  PaymentsTable,
  TransactionDetailModal,
} from './components';
import { INITIAL_PAYMENTS } from './paymentsData';
import { PaymentMethod, PaymentTransaction } from './types';
import { toast } from 'sonner';

export default function PaymentsView() {
  const [payments, setPayments] = useState<PaymentTransaction[]>(INITIAL_PAYMENTS);
  const [activeMethod, setActiveMethod] = useState<PaymentMethod>('All Methods');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal
  const [selectedTxn, setSelectedTxn] = useState<PaymentTransaction | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Filter payments
  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      // 1. Method filter
      if (activeMethod !== 'All Methods' && p.method !== activeMethod) {
        return false;
      }

      // 2. Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchId = p.id.toLowerCase().includes(query);
        const matchOrder = p.orderId.toLowerCase().includes(query);
        const matchCustomer = p.customerName.toLowerCase().includes(query);
        const matchTable = p.tableId.toLowerCase().includes(query);
        const matchServer = p.server.toLowerCase().includes(query);
        const matchMethod = p.method.toLowerCase().includes(query);

        if (
          !matchId &&
          !matchOrder &&
          !matchCustomer &&
          !matchTable &&
          !matchServer &&
          !matchMethod
        ) {
          return false;
        }
      }

      return true;
    });
  }, [payments, activeMethod, searchQuery]);

  // Paginated payments
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage) || 1;
  const paginatedPayments = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredPayments.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredPayments, currentPage, itemsPerPage]);

  // Handlers
  const handleSelectMethod = (method: PaymentMethod) => {
    setActiveMethod(method);
    setCurrentPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleSelectTransaction = (txn: PaymentTransaction) => {
    setSelectedTxn(txn);
    setIsDetailModalOpen(true);
  };

  const handleRefund = (txnId: string) => {
    setPayments((prev) =>
      prev.map((p) =>
        p.id === txnId ? { ...p, status: 'refunded', tipAmount: 0 } : p
      )
    );
  };

  const handleExportReport = () => {
    const headers = ['Transaction', 'Order', 'Customer', 'Table', 'Method', 'Server', 'Time', 'Tip', 'Status', 'Amount'];
    const rows = filteredPayments.map((p) => [
      p.id,
      p.orderId,
      p.customerName,
      p.tableId,
      p.method,
      p.server,
      p.time,
      p.tipAmount ? `$${p.tipAmount.toFixed(2)}` : '$0.00',
      p.status,
      `$${p.amount.toFixed(2)}`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `payments_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Payments report exported successfully!');
  };

  return (
    <div className="w-full space-y-5 animate-in fade-in duration-200 pb-12">
      {/* 1. Header with Export CTA */}
      <PaymentsHeader onExportReport={handleExportReport} />

      {/* 2. 4 KPI Metric Cards */}
      <PaymentsKPICards payments={payments} />

      {/* 3. Method Tabs and Search Bar */}
      <PaymentsFilters
        activeMethod={activeMethod}
        onSelectMethod={handleSelectMethod}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
      />

      {/* 4. Transactions Data Table with Pagination */}
      <PaymentsTable
        payments={paginatedPayments}
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        totalResults={filteredPayments.length}
        onPageChange={setCurrentPage}
        onSelectTransaction={handleSelectTransaction}
      />

      {/* 5. Transaction Detail Receipt Modal */}
      <TransactionDetailModal
        transaction={selectedTxn}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedTxn(null);
        }}
        onRefund={handleRefund}
      />
    </div>
  );
}
