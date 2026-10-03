'use client';

import React, { useState } from 'react';
import {
  ShiftReportHeader,
  ShiftStatCards,
  RevenueByHourCard,
  WeeklyPerformanceCard,
  TopPerformingItemsCard,
  CloseShiftModal,
  PrintReportModal,
} from './components';
import {
  initialShiftInfo,
  initialShiftStats,
  initialHourlyRevenue,
  initialWeeklyPerformance,
  initialTopItems,
} from './shiftData';
import { toast } from 'sonner';

interface ShiftReportViewProps {
  onShiftClosed?: () => void;
}

export const ShiftReportView: React.FC<ShiftReportViewProps> = ({
  onShiftClosed,
}) => {
  const [shiftInfo] = useState(initialShiftInfo);
  const [stats] = useState(initialShiftStats);
  const [hourlyData] = useState(initialHourlyRevenue);
  const [weeklyData] = useState(initialWeeklyPerformance);
  const [topItems] = useState(initialTopItems);

  // Modals state
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const handleExportPDF = () => {
    // Generate downloadable CSV or open print view for PDF saving
    const headers = ['Category', 'Metric', 'Value'];
    const rows = [
      ['Shift Info', 'Cashier', `"${shiftInfo.cashierName}"`],
      ['Shift Info', 'Date', `"${shiftInfo.date}"`],
      ['Shift Info', 'Start Time', shiftInfo.startTime],
      ['Shift Info', 'Hours Worked', stats.cashierHours],
      ['Financials', 'Total Revenue', `$${stats.totalRevenue.toFixed(2)}`],
      ['Financials', 'Transactions Count', stats.transactionsCount.toString()],
      ['Financials', 'Average Ticket', `$${stats.avgSpend.toFixed(2)}`],
      ['Tenders', 'Cash Collected', `$${stats.cashCollected.toFixed(2)}`],
      ['Tenders', 'Card Payments', `$${stats.cardPayments.toFixed(2)}`],
      ['Tenders', 'QR Payments', `$${stats.qrPayments.toFixed(2)}`],
      ...topItems.map((item) => [
        'Top Sellers',
        `#${item.rank} ${item.name} (${item.quantitySold}x)`,
        `$${item.revenue.toFixed(2)}`,
      ]),
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `shift_report_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Exported Shift Report audit summary successfully!');
  };

  return (
    <div className="w-full space-y-6 pb-12">
      {/* 1. Header with metadata and actions */}
      <ShiftReportHeader
        shiftInfo={shiftInfo}
        onPrint={() => setIsPrintModalOpen(true)}
        onExportPDF={handleExportPDF}
        onCloseShift={() => setIsCloseModalOpen(true)}
      />

      {/* 2. 8 KPI Stat Cards (2 rows of 4) */}
      <ShiftStatCards stats={stats} />

      {/* 3. Performance Charts (Revenue by Hour + Weekly Performance) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RevenueByHourCard data={hourlyData} />
        <WeeklyPerformanceCard data={weeklyData} />
      </div>

      {/* 4. Top Performing Items Table */}
      <TopPerformingItemsCard items={topItems} />

      {/* 5. Close Register Shift Reconciliation Modal */}
      <CloseShiftModal
        isOpen={isCloseModalOpen}
        onClose={() => setIsCloseModalOpen(false)}
        shiftInfo={shiftInfo}
        stats={stats}
        onShiftClosed={() => {
          if (onShiftClosed) onShiftClosed();
        }}
      />

      {/* 6. Print Thermal Slip / X-Report Modal */}
      <PrintReportModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        shiftInfo={shiftInfo}
        stats={stats}
        topItems={topItems}
      />
    </div>
  );
};
