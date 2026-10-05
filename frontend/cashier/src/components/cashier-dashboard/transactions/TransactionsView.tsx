'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  TransactionsHeader,
  TransactionsFilterBar,
  TransactionsTable,
  TransactionDetailModal,
} from './components';
import { TransactionItem, TransactionStatus } from './types';
import { toast } from 'sonner';
import { cashierService, getActiveBranchId } from '@/redux/features/cashierApi';

export default function TransactionsView() {
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [activeStatus, setActiveStatus] = useState<TransactionStatus>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTx, setSelectedTx] = useState<TransactionItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    const loadTx = async () => {
      try {
        const branchId = getActiveBranchId();
        const raw = await cashierService.getOrders(branchId);
        if (mounted && Array.isArray(raw)) {
          const mapped: TransactionItem[] = raw.map((o: any) => {
            let status: TransactionStatus = 'Pending';
            if (o.paymentStatus === 'PAID') status = 'Paid';
            else if (o.status === 'CANCELLED') status = 'Failed';

            const createdDate = new Date(o.createdAt);
            const time = !isNaN(createdDate.getTime())
              ? createdDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : '12:00 PM';

            return {
              id: o.orderId || o.id,
              txId: `TX-${(o.orderId || o.id).slice(0, 8).toUpperCase()}`,
              orderNumber: o.orderNumber || `#${(o.orderId || o.id).slice(0, 5)}`,
              method: o.paymentMethod || 'Credit Card',
              cashier: o.waiterName || 'Shift Cashier',
              status,
              amount: o.totalAmount || o.total || 0,
              time,
              customerName: o.customerName || 'Walk-in Guest',
              itemsCount: Array.isArray(o.items) ? o.items.length : 1,
            };
          });
          setTransactions(mapped);
        }
      } catch (err) {
        console.error('Failed to load transactions:', err);
      }
    };
    loadTx();
    const interval = setInterval(loadTx, 8000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  // Dynamic counts for tabs
  const statusCounts = useMemo(() => {
    return {
      all: transactions.length,
      paid: transactions.filter((t) => t.status === 'Paid').length,
      pending: transactions.filter((t) => t.status === 'Pending').length,
      failed: transactions.filter((t) => t.status === 'Failed').length,
      refunded: transactions.filter((t) => t.status === 'Refunded').length,
    };
  }, [transactions]);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesStatus =
        activeStatus === 'All' || tx.status === activeStatus;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        tx.txId.toLowerCase().includes(q) ||
        tx.orderNumber.toLowerCase().includes(q) ||
        tx.method.toLowerCase().includes(q) ||
        tx.cashier.toLowerCase().includes(q) ||
        (tx.customerName && tx.customerName.toLowerCase().includes(q));

      return matchesStatus && matchesSearch;
    });
  }, [transactions, activeStatus, searchQuery]);

  // Handlers
  const handleOpenDetail = (tx: TransactionItem) => {
    setSelectedTx(tx);
    setIsModalOpen(true);
  };

  const handleCloseDetail = () => {
    setIsModalOpen(false);
    setSelectedTx(null);
  };

  const handleIssueRefund = (txId: string) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === txId ? { ...t, status: 'Refunded' } : t))
    );
    if (selectedTx && selectedTx.id === txId) {
      setSelectedTx((prev) => (prev ? { ...prev, status: 'Refunded' } : null));
    }
    toast.success(`Refund issued successfully for Transaction ${selectedTx?.txId || txId}.`);
  };

  const handleExportCSV = () => {
    const headers = ['TX ID', 'Order', 'Method', 'Cashier', 'Status', 'Amount', 'Time'];
    const rows = filteredTransactions.map((t) => [
      t.txId,
      t.orderNumber,
      t.method,
      t.cashier,
      t.status,
      t.amount.toFixed(2),
      t.time,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `transactions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Transactions exported to CSV successfully!');
  };

  const handlePrint = () => {
    toast.success('Preparing daily transactions statement for printing...');
    window.print?.();
  };

  return (
    <div className="w-full space-y-7 font-['Inter'] pb-12 animate-in fade-in duration-200">
      {/* 1. Header with Export & Print */}
      <TransactionsHeader
        totalCount={filteredTransactions.length}
        onExportCSV={handleExportCSV}
        onPrint={handlePrint}
      />

      {/* 2. Filter Bar (Status Tabs & Search) */}
      <TransactionsFilterBar
        activeStatus={activeStatus}
        setActiveStatus={setActiveStatus}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusCounts={statusCounts}
      />

      {/* 3. Transactions Table */}
      <TransactionsTable
        transactions={filteredTransactions}
        onSelectTransaction={handleOpenDetail}
      />

      {/* 4. Detail Modal */}
      <TransactionDetailModal
        transaction={selectedTx}
        isOpen={isModalOpen}
        onClose={handleCloseDetail}
        onIssueRefund={handleIssueRefund}
      />
    </div>
  );
}
