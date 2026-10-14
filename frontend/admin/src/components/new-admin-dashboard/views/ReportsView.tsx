'use client';

import React, { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { BranchPerformanceRecord } from './reports/types';
import { useOrganizationId } from '@/hooks/useOrganizationId';
import { useGetBranchPerformanceQuery } from '@/redux/features/adminApi';
import {
  ReportsHeader,
  ReportsFiltersBar,
  SalesReportKPICards,
  BranchPerformanceTable,
  BranchIntelligenceModal,
  ExportPDFModal,
} from './reports/components';

export default function ReportsView() {
  const [dateRange, setDateRange] = useState<string>('Last 30 days');
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>('All Restaurants');
  const [selectedBranch, setSelectedBranch] = useState<string>('All Branches');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('All Methods');

  // Modal inspection state
  const organizationId = useOrganizationId();
  const { data: performance = [] } = useGetBranchPerformanceQuery(
    { organizationId: organizationId || undefined },
    { skip: !organizationId },
  );

  const [inspectBranch, setInspectBranch] = useState<BranchPerformanceRecord | null>(null);
  const [showExportPDFModal, setShowExportPDFModal] = useState<boolean>(false);

  const records: BranchPerformanceRecord[] = useMemo(
    () =>
      performance.map((row: any) => {
        const orders = Number(row.ordersCount || 0);
        const revenue = Number(row.revenue || 0);
        const avg = orders > 0 ? revenue / orders : 0;
        return {
          id: row.branchId,
          name: row.branchName,
          restaurant: row.restaurantName,
          location: '',
          orders,
          revenue,
          revenueFormatted: `$${revenue.toFixed(2)}`,
          avgOrder: avg,
          avgOrderFormatted: `$${avg.toFixed(2)}`,
          growth: 0,
          growthFormatted: '—',
          performance: revenue > 0 ? 'Strong' : 'Review',
          topItem: '—',
          cardSplit: 0,
          cashSplit: 0,
        } as BranchPerformanceRecord;
      }),
    [performance],
  );

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const matchRestaurant =
        selectedRestaurant === 'All Restaurants' || r.restaurant === selectedRestaurant;
      const matchBranch = selectedBranch === 'All Branches' || r.name === selectedBranch;
      return matchRestaurant && matchBranch;
    });
  }, [records, selectedRestaurant, selectedBranch]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Branch', 'Restaurant', 'Location', 'Orders', 'Revenue', 'Avg Order', 'Growth', 'Performance'];
    const rows = filteredRecords.map((r) => [
      `"${r.name}"`,
      `"${r.restaurant}"`,
      `"${r.location}"`,
      r.orders,
      `"${r.revenueFormatted}"`,
      `"${r.avgOrderFormatted}"`,
      `"${r.growthFormatted}"`,
      r.performance,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sales_report_${dateRange.toLowerCase().replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Sales Report exported as CSV successfully.');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* 1. Header Section */}
      <ReportsHeader
        onExportPDF={() => setShowExportPDFModal(true)}
        onExportCSV={handleExportCSV}
      />

      {/* 2. Filters Bar Card */}
      <ReportsFiltersBar
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        selectedRestaurant={selectedRestaurant}
        onRestaurantChange={setSelectedRestaurant}
        selectedBranch={selectedBranch}
        onBranchChange={setSelectedBranch}
        selectedPaymentMethod={selectedPaymentMethod}
        onPaymentMethodChange={setSelectedPaymentMethod}
      />

      {/* 3. Sales Report KPI Cards */}
      <SalesReportKPICards dateRange={dateRange} />

      {/* 4. Branch Performance Comparison Table */}
      <BranchPerformanceTable
        records={filteredRecords}
        totalRecordsCount={records.length}
        onInspectBranch={(branch) => setInspectBranch(branch)}
      />

      {/* 5. Modal: Branch Detailed Analytics Breakdown */}
      {inspectBranch && (
        <BranchIntelligenceModal
          branch={inspectBranch}
          onClose={() => setInspectBranch(null)}
        />
      )}

      {/* 6. Modal: Export PDF Document Preview */}
      {showExportPDFModal && (
        <ExportPDFModal
          dateRange={dateRange}
          selectedRestaurant={selectedRestaurant}
          selectedBranch={selectedBranch}
          onClose={() => setShowExportPDFModal(false)}
        />
      )}
    </div>
  );
}
