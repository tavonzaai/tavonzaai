'use client';

import React from 'react';
import {
  Zap,
  QrCode,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { AIRecommendation } from '../types';

interface AIRecommendationsCardProps {
  recommendations: AIRecommendation[];
  onInspectTransaction?: (txId: string) => void;
}

export const AIRecommendationsCard: React.FC<AIRecommendationsCardProps> = ({
  recommendations,
  onInspectTransaction,
}) => {
  const handleAction = (rec: AIRecommendation) => {
    switch (rec.type) {
      case 'peak':
        toast.success(
          'Counter 02 staff alerted for upcoming 12:00 PM rush hour!'
        );
        break;
      case 'qr':
        toast.success(
          'Prominent QR payment prompt activated on counter customer screens.'
        );
        break;
      case 'upsell':
        toast.success(
          'Smart upsell prompt ($35–$40 orders) active on checkout terminals.'
        );
        break;
      case 'verify':
        toast.warning(
          'Flagged transaction TX-10579 opened for manual review.'
        );
        if (onInspectTransaction) {
          onInspectTransaction('TX-10579');
        }
        break;
    }
  };

  const renderIcon = (type: string) => {
    switch (type) {
      case 'peak':
        return <Zap className="w-3.5 h-3.5 text-teal-400" />;
      case 'qr':
        return <QrCode className="w-3.5 h-3.5 text-blue-400" />;
      case 'upsell':
        return <TrendingUp className="w-3.5 h-3.5 text-amber-400" />;
      case 'verify':
        return <AlertTriangle className="w-3.5 h-3.5 text-red-400" />;
      default:
        return <Zap className="w-3.5 h-3.5 text-yellow-400" />;
    }
  };

  const getCardStyles = (accent: string) => {
    switch (accent) {
      case 'teal':
        return 'bg-teal-500/5 border-teal-500/10 hover:border-teal-500/25 text-teal-400';
      case 'blue':
        return 'bg-blue-500/5 border-blue-500/10 hover:border-blue-500/25 text-blue-400';
      case 'amber':
        return 'bg-amber-500/5 border-amber-500/10 hover:border-amber-500/25 text-amber-400';
      case 'red':
        return 'bg-red-500/5 border-red-500/10 hover:border-red-500/25 text-red-400';
      default:
        return 'bg-white/5 border-white/10 text-white';
    }
  };

  const getIconBg = (accent: string) => {
    switch (accent) {
      case 'teal':
        return 'bg-teal-500/10';
      case 'blue':
        return 'bg-blue-500/10';
      case 'amber':
        return 'bg-amber-500/10';
      case 'red':
        return 'bg-red-500/10';
      default:
        return 'bg-white/10';
    }
  };

  return (
    <div className="p-4 md:p-5 bg-neutral-900 rounded-[10px] border border-white/5 shadow-lg space-y-3.5">
      {/* Header */}
      <div>
        <h3 className="text-slate-200 text-base font-semibold font-['Plus_Jakarta_Sans'] leading-5">
          AI Recommendations
        </h3>
        <p className="text-slate-500 text-sm font-normal font-['Plus_Jakarta_Sans'] leading-4 mt-0.5">
          Actionable insights for this shift
        </p>
      </div>

      {/* Recommendations List */}
      <div className="space-y-2.5">
        {recommendations.map((rec) => {
          const cardStyle = getCardStyles(rec.accent);
          const iconBg = getIconBg(rec.accent);

          return (
            <div
              key={rec.id}
              className={`p-3.5 rounded-lg border transition-all flex items-start justify-between gap-3 ${cardStyle}`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div
                  className={`w-7 h-7 rounded-[5px] flex items-center justify-center shrink-0 mt-0.5 ${iconBg}`}
                >
                  {renderIcon(rec.type)}
                </div>

                <div className="space-y-1 min-w-0">
                  <div className="text-slate-200 text-sm font-semibold font-['Plus_Jakarta_Sans'] leading-4">
                    {rec.title}
                  </div>
                  <div className="text-zinc-400 text-sm font-normal font-['Plus_Jakarta_Sans'] leading-4">
                    {rec.description}
                  </div>
                </div>
              </div>

              {rec.actionLabel && (
                <button
                  type="button"
                  onClick={() => handleAction(rec)}
                  className="px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/15 border border-white/10 text-slate-200 hover:text-white text-xs font-medium font-['Plus_Jakarta_Sans'] flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                >
                  <span>{rec.actionLabel}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
