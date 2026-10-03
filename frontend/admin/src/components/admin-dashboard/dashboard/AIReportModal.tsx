'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  CheckCircle2,
  Download,
  Zap,
} from 'lucide-react';

export interface AIReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AIReportModal({ isOpen, onClose }: AIReportModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'revenue' | 'costs' | 'staffing'>('overview');
  const [appliedActions, setAppliedActions] = useState<string[]>([]);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleApplyAction = (id: string) => {
    if (!appliedActions.includes(id)) {
      setAppliedActions((prev) => [...prev, id]);
    }
  };

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      alert('AI Executive Briefing Report (PDF) generated and downloaded.');
    }, 1000);
  };

  return (
    <div
      onClick={onClose}
      className="fixed top-20 left-0 md:left-64 right-0 bottom-0 z-40 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl max-h-[calc(100vh-6.5rem)] bg-zinc-950 border border-zinc-800/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col cursor-default my-auto"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-semibold text-white">Tavonza AI — Executive Briefing</h3>
                <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                  Live Engine v4.2
                </span>
              </div>
              <p className="text-sm text-zinc-400">Comprehensive diagnostic & forecasting analysis for Tuesday, July 15</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              {downloading ? 'Exporting...' : 'Export PDF'}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-zinc-800 bg-zinc-900/20">
          {[
            { id: 'overview', label: 'Executive Summary' },
            { id: 'revenue', label: 'Revenue Boosters (+$520)' },
            { id: 'costs', label: 'Cost Optimizations' },
            { id: 'staffing', label: 'Labor & Floor Schedule' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'border-amber-400 text-amber-400'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-base text-zinc-300 custom-scrollbar">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Scorecard Hero */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl font-bold text-white">91</span>
                    <span className="text-xs text-zinc-400 absolute bottom-1">/100</span>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-emerald-400 uppercase tracking-wider">Business Health</div>
                    <div className="text-base font-medium text-white mt-0.5">Top 5% in Region</div>
                    <div className="text-xs text-zinc-400 mt-1">High customer velocity & strong margin discipline</div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
                  <div className="text-sm text-zinc-400">Dinner Projected Growth</div>
                  <div className="text-3xl font-bold text-amber-400 mt-1">+14.2%</div>
                  <div className="text-xs text-emerald-400 mt-1">▲ Projected dinner intake: $8,450</div>
                </div>

                <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
                  <div className="text-sm text-zinc-400">Immediate Action Value</div>
                  <div className="text-3xl font-bold text-emerald-400 mt-1">+$340.00</div>
                  <div className="text-xs text-zinc-400 mt-1">Recoverable via lunch burgers & floor staffing</div>
                </div>
              </div>

              {/* AI Key Insights Narrative */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/5 via-zinc-900/60 to-zinc-900/60 border border-amber-500/20 space-y-3">
                <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  Primary Strategic Insights
                </div>
                <ul className="space-y-2 text-sm leading-relaxed text-zinc-300">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">1.</span>
                    <span>
                      <strong className="text-white">High Table Turnover Efficiency:</strong> Tables on Floor 1 are averaging 42 minutes turnover, 8 minutes faster than benchmark. Customer satisfaction remains high at 96%.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold">2.</span>
                    <span>
                      <strong className="text-white">Supply Chain Warning:</strong> Mozzarella cheese inventory will exhaust at 9:45 PM tonight during peak pizza ordering cycle without replenishment.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-400 font-bold">3.</span>
                    <span>
                      <strong className="text-white">Upsell Opportunity:</strong> Dessert combo conversions increased to 28% when recommended via QR ordering app. Promoting chocolate brownie can yield additional $180 revenue today.
                    </span>
                  </li>
                </ul>
              </div>

              {/* Action Plan Checklist */}
              <div>
                <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
                  Recommended One-Click Actions
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    {
                      id: 'act-1',
                      title: 'Disptach Mozzarella Emergency PO',
                      desc: 'Sends automated purchase order to Dairy & Cheese Hub for 15kg express delivery.',
                      tag: 'Urgent Inventory',
                      tagColor: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
                    },
                    {
                      id: 'act-2',
                      title: 'Push Burger Combo Promo to Floor Tablets',
                      desc: 'Highlights Signature Burger at top of QR menu with 10% complimentary beverage bundle.',
                      tag: 'Revenue +$180',
                      tagColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
                    },
                    {
                      id: 'act-3',
                      title: 'Re-assign Waiter David to Floor 2',
                      desc: 'Balances server-to-table ratio ahead of 7:00 PM rush.',
                      tag: 'Floor Ops',
                      tagColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
                    },
                    {
                      id: 'act-4',
                      title: 'Send Review Request SMS to 12 Happy Diners',
                      desc: 'Targeted SMS with direct Google Review link for 5-star predicted diners.',
                      tag: 'Marketing & Rep',
                      tagColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
                    },
                  ].map((act) => {
                    const isDone = appliedActions.includes(act.id);
                    return (
                      <div
                        key={act.id}
                        className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-start justify-between gap-3 hover:border-zinc-700 transition-all"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-white">{act.title}</span>
                            <span className={`px-1.5 py-0.5 text-[10px] font-semibold rounded border ${act.tagColor}`}>
                              {act.tag}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-400">{act.desc}</p>
                        </div>
                        <button
                          onClick={() => handleApplyAction(act.id)}
                          disabled={isDone}
                          className={`px-3 py-1.5 text-sm font-medium rounded-lg flex items-center gap-1 transition-all cursor-pointer flex-shrink-0 ${
                            isDone
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-amber-400 hover:bg-amber-300 text-white font-semibold shadow-sm'
                          }`}
                        >
                          {isDone ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Executed
                            </>
                          ) : (
                            <>
                              <Zap className="w-3.5 h-3.5" />
                              Execute
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'revenue' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-2">
                  Revenue Growth Decomposition
                </h4>
                <div className="space-y-3">
                  {[
                    { item: 'Signature Burger Upsell Bundle', est: '+$180.00', confidence: '94%', category: 'Menu Upsell' },
                    { item: 'Floor 2 Table Turn Speedup (1 Extra Waiter)', est: '+$160.00', confidence: '89%', category: 'Capacity' },
                    { item: 'Dessert Push Notification at 45m Mark', est: '+$110.00', confidence: '91%', category: 'Digital POS' },
                    { item: 'High-margin Wine Pairing Highlight', est: '+$70.00', confidence: '82%', category: 'Beverage' },
                  ].map((rev, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/80">
                      <div>
                        <div className="text-sm font-medium text-white">{rev.item}</div>
                        <div className="text-xs text-zinc-400">{rev.category} · AI Confidence: {rev.confidence}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-emerald-400">{rev.est}</div>
                        <div className="text-xs text-zinc-500">Projected today</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'costs' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-2">
                  Cost Minimization & Waste Prevention
                </h4>
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/80 flex items-start justify-between">
                    <div>
                      <div className="text-sm font-medium text-white">Food Cost Variance (28.4% vs 30% target)</div>
                      <div className="text-xs text-zinc-400">Saving $210/week by adhering to strict portion scales on pasta dishes.</div>
                    </div>
                    <span className="text-sm font-bold text-emerald-400">-$210/wk</span>
                  </div>
                  <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/80 flex items-start justify-between">
                    <div>
                      <div className="text-sm font-medium text-white">Mozzarella Stock Optimization</div>
                      <div className="text-xs text-zinc-400">Shift from 5kg blocks to shredded pre-pack saves 4% spoilage waste.</div>
                    </div>
                    <span className="text-sm font-bold text-emerald-400">-$85/wk</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'staffing' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-2">
                  Predictive Labor Efficiency
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800">
                    <div className="text-zinc-400">Lunch Peak Staffing</div>
                    <div className="text-lg font-bold text-white mt-1">4 Waiters · 3 Kitchen</div>
                    <div className="text-xs text-emerald-400 mt-1">Optimal labor ratio: 24.1%</div>
                  </div>
                  <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800">
                    <div className="text-zinc-400">Dinner Peak Staffing (6:30 PM - 9:30 PM)</div>
                    <div className="text-lg font-bold text-amber-400 mt-1">6 Waiters · 4 Kitchen</div>
                    <div className="text-xs text-zinc-400 mt-1">+1 waiter needed on Floor 2</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800 bg-zinc-900/60">
          <div className="text-sm text-zinc-400">
            Next AI update in <span className="text-white font-medium">14 minutes</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-zinc-200 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors cursor-pointer"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
}
