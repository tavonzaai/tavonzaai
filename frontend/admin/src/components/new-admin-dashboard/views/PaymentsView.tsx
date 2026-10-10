'use client';

import React, { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { PaymentItem } from './payments/types';
import { INITIAL_TRANSACTIONS } from './payments/data';
import {
  PaymentsHeader,
  PaymentsKPICards,
  PaymentMethodsCard,
  RecentTransactionsCard,
  PaymentsLedgerTable,
  ReceiptModal,
  RefundModal,
  BatchSettlementModal,
} from './payments/components';

export default function PaymentsView() {
  const [transactions, setTransactions] = useState<PaymentItem[]>(INITIAL_TRANSACTIONS);
  const [selectedBranch, setSelectedBranch] = useState<string>('Gulshan Flagship');
  const [filterMethod, setFilterMethod] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [selectedTransaction, setSelectedTransaction] = useState<PaymentItem | null>(null);
  const [refundTarget, setRefundTarget] = useState<PaymentItem | null>(null);
  const [isRefunding, setIsRefunding] = useState<boolean>(false);
  const [showBatchModal, setShowBatchModal] = useState<boolean>(false);

  // Filtered transactions for the ledger table
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchMethod = filterMethod === 'All' || t.method === filterMethod;
      const matchStatus = filterStatus === 'All' || t.status === filterStatus;
      const matchSearch =
        searchQuery.trim() === '' ||
        t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.server.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.tableNumber.toLowerCase().includes(searchQuery.toLowerCase());
      return matchMethod && matchStatus && matchSearch;
    });
  }, [transactions, filterMethod, filterStatus, searchQuery]);

  // Handle Refund submission
  const handleConfirmRefund = (target: PaymentItem, reason: string) => {
    setIsRefunding(true);

    setTimeout(() => {
      setTransactions((prev) =>
        prev.map((item) =>
          item.id === target.id ? { ...item, status: 'Refunded' } : item
        )
      );
      if (selectedTransaction?.id === target.id) {
        setSelectedTransaction((curr) => curr ? { ...curr, status: 'Refunded' } : null);
      }
      setIsRefunding(false);
      toast.success(`Refund of ${target.formattedAmount} issued for ${target.id} (${reason})`);
      setRefundTarget(null);
    }, 450);
  };

  // Handle Batch Settlement Payout
  const handleSettleBatch = () => {
    const pendingItems = transactions.filter((t) => t.status === 'Pending');
    if (pendingItems.length === 0) {
      toast.info('No pending transactions to settle at this time.');
      setShowBatchModal(false);
      return;
    }

    setTransactions((prev) =>
      prev.map((t) => (t.status === 'Pending' ? { ...t, status: 'Completed' } : t))
    );
    setShowBatchModal(false);
    toast.success('Batch settlement executed! Settled $ 5K across 24 transactions into SCB Operating Account.');
  };

  // Export CSV Settlement Report
  const handleExportCSV = () => {
    const headers = ['Transaction ID', 'Branch', 'Order', 'Table', 'Server', 'Method', 'Amount', 'Status', 'Timestamp'];
    const rows = filteredTransactions.map((t) => [
      t.id,
      t.branch,
      t.orderNumber,
      t.tableNumber,
      `"${t.server}"`,
      t.method,
      t.formattedAmount.replace('$', '').trim(),
      t.status,
      `"${t.timestamp}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `settlement_report_${selectedBranch.toLowerCase().replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Settlement CSV Report downloaded successfully.');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* 1. Header Section */}
      <PaymentsHeader
        selectedBranch={selectedBranch}
        onBranchChange={setSelectedBranch}
        onOpenBatchModal={() => setShowBatchModal(true)}
        onExportCSV={handleExportCSV}
      />

      {/* 2. Top Metrics Row (Exact 4 Cards as per Figma Specification) */}
      <PaymentsKPICards />

      {/* 3. Mid Section (Payment Methods + Recent Transactions Side-by-Side as per Figma) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <PaymentMethodsCard onViewAllMethods={() => setFilterMethod('All')} />
        <RecentTransactionsCard
          transactions={transactions}
          onSelectTransaction={setSelectedTransaction}
        />
      </div>

      {/* 4. Lower Section: Comprehensive All Transactions Ledger & Settlements Table */}
      <PaymentsLedgerTable
        transactions={transactions}
        filteredTransactions={filteredTransactions}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterMethod={filterMethod}
        onFilterMethodChange={setFilterMethod}
        filterStatus={filterStatus}
        onFilterStatusChange={setFilterStatus}
        onSelectTransaction={setSelectedTransaction}
        onOpenRefund={setRefundTarget}
      />

      {/* 5. Modal: Digital Receipt & Transaction Details */}
      <ReceiptModal
        transaction={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
        onOpenRefund={setRefundTarget}
      />

      {/* 6. Modal: Issue Refund Confirmation */}
      <RefundModal
        refundTarget={refundTarget}
        onClose={() => setRefundTarget(null)}
        onConfirmRefund={handleConfirmRefund}
        isRefunding={isRefunding}
      />

      {/* 7. Modal: Settle Batch Payout */}
      <BatchSettlementModal
        isOpen={showBatchModal}
        onClose={() => setShowBatchModal(false)}
        onConfirmSettlement={handleSettleBatch}
      />
    </div>
  );
}
