'use client';

import React, { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { PaymentItem } from './payments/types';
import { useOrganizationId } from '@/hooks/useOrganizationId';
import { useGetPaymentsQuery, useRefundPaymentMutation } from '@/redux/features/adminApi';
import { ErrorState, LoadingState } from '@/components/common';
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

function mapMethod(method?: string): PaymentItem['method'] {
  const value = String(method || '').toUpperCase();
  if (value === 'CASH') return 'Cash';
  if (value === 'ONLINE_GATEWAY') return 'Stripe';
  if (value === 'MOBILE_WALLET') return 'Apple Pay';
  return 'Card';
}

function mapStatus(status?: string): PaymentItem['status'] {
  const value = String(status || '').toUpperCase();
  if (value === 'PAID') return 'Completed';
  if (value === 'REFUNDED') return 'Refunded';
  return 'Pending';
}

export default function PaymentsView() {
  const organizationId = useOrganizationId();
  const { data, isLoading, isError, error, refetch } = useGetPaymentsQuery(
    { organizationId: organizationId || undefined, page: 1, limit: 50 },
    { skip: !organizationId },
  );
  const [refundPayment, { isLoading: isRefunding }] = useRefundPaymentMutation();

  const transactions: PaymentItem[] = useMemo(
    () =>
      (data?.data || []).map((row: any) => ({
        id: row.id,
        orderNumber: row.orderNumber || '—',
        restaurant: row.restaurantName || '—',
        branch: row.branchName || '—',
        tableNumber: '—',
        server: '—',
        amount: Number(row.amount || 0),
        formattedAmount: `$${Number(row.amount || 0).toFixed(2)}`,
        method: mapMethod(row.method),
        status: mapStatus(row.status),
        timestamp: row.paidAt || row.createdAt || '',
        date: row.paidAt || row.createdAt || '',
      })),
    [data],
  );

  const [selectedBranch, setSelectedBranch] = useState<string>('All');
  const [filterMethod, setFilterMethod] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [selectedTransaction, setSelectedTransaction] = useState<PaymentItem | null>(null);
  const [refundTarget, setRefundTarget] = useState<PaymentItem | null>(null);
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
  const handleConfirmRefund = async (target: PaymentItem, reason: string) => {
    try {
      await refundPayment({
        id: target.id,
        body: { refundAmount: target.amount, reason },
      }).unwrap();
      toast.success(`Refund of ${target.formattedAmount} issued for ${target.orderNumber}`);
      setRefundTarget(null);
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Unable to refund payment.');
    }
  };

  // Handle Batch Settlement Payout
  const handleSettleBatch = () => {
    const pendingItems = transactions.filter((t) => t.status === 'Pending');
    if (pendingItems.length === 0) {
      toast.info('No pending transactions to settle at this time.');
      setShowBatchModal(false);
      return;
    }

    setShowBatchModal(false);
    toast.info('Customer order payments settle individually. Platform SaaS billing is on the Subscription tab.');
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
      {isLoading && <LoadingState message="Loading customer payments..." />}
      {isError && (
        <ErrorState
          message={(error as any)?.data?.message || 'Unable to load payments.'}
          onRetry={() => refetch()}
        />
      )}
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
