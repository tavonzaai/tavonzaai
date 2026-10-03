'use client';

import React, { useState } from 'react';
import {
  AIInsightsHeader,
  AIMetricCards,
  AIPerformanceChartCard,
  TavonzaAIChatCard,
  AIRecommendationsCard,
} from './components';
import {
  initialAIMetrics,
  initialAIPerformancePoints,
  initialAIRecommendations,
} from './aiInsightsData';
import { CloseShiftModal } from '../shift-report/components/CloseShiftModal';
import { initialShiftInfo, initialShiftStats } from '../shift-report/shiftData';
import { toast } from 'sonner';

interface AIInsightsViewProps {
  onNavigateToTransactions?: () => void;
  onShiftClosed?: () => void;
}

export const AIInsightsView: React.FC<AIInsightsViewProps> = ({
  onNavigateToTransactions,
  onShiftClosed,
}) => {
  const [metrics] = useState(initialAIMetrics);
  const [chartData] = useState(initialAIPerformancePoints);
  const [recommendations] = useState(initialAIRecommendations);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);

  const handleExportPDF = () => {
    const headers = ['Category', 'Insight', 'Metric / Value'];
    const rows = [
      ...metrics.map((m) => ['Forecast Metric', m.label, `${m.value} (${m.subtext})`]),
      ...recommendations.map((r) => [
        'AI Recommendation',
        r.title,
        `"${r.description}"`,
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
      `ai_insights_briefing_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Exported AI Insights briefing successfully!');
  };

  const handleInspectTransaction = (txId: string) => {
    toast.info(`Opening transaction record ${txId}...`);
    if (onNavigateToTransactions) {
      onNavigateToTransactions();
    }
  };

  return (
    <div className="w-full space-y-6 pb-12">
      {/* 1. Header */}
      <AIInsightsHeader
        onPrint={() => window.print()}
        onExportPDF={handleExportPDF}
        onCloseShift={() => setIsCloseModalOpen(true)}
      />

      {/* 2. Balanced 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Metrics + Performance Curve (7 cols on lg) */}
        <div className="lg:col-span-6 space-y-5">
          <AIMetricCards metrics={metrics} />
          <AIPerformanceChartCard data={chartData} />
        </div>

        {/* Right Column: AI Chat + Recommendations (5 cols on lg) */}
        <div className="lg:col-span-6 space-y-5">
          <TavonzaAIChatCard />
          <AIRecommendationsCard
            recommendations={recommendations}
            onInspectTransaction={handleInspectTransaction}
          />
        </div>
      </div>

      {/* Close Shift Modal */}
      <CloseShiftModal
        isOpen={isCloseModalOpen}
        onClose={() => setIsCloseModalOpen(false)}
        shiftInfo={initialShiftInfo}
        stats={initialShiftStats}
        onShiftClosed={() => {
          if (onShiftClosed) onShiftClosed();
        }}
      />
    </div>
  );
};
