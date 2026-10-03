'use client';

import React from 'react';
import { MarketplaceApp } from '../types';
import { Star, Trash2 } from 'lucide-react';

interface MarketplaceAppCardProps {
  app: MarketplaceApp;
  onInstall: (app: MarketplaceApp) => void;
  onConfigure: (app: MarketplaceApp) => void;
  onDelete?: (app: MarketplaceApp) => void;
}

export default function MarketplaceAppCard({
  app,
  onInstall,
  onConfigure,
  onDelete,
}: MarketplaceAppCardProps) {
  const getBadgeStyle = (badge?: string) => {
    switch (badge) {
      case '● On Shift':
      case 'On Shift':
      case 'Popular':
      case 'Top Rated':
        return 'bg-[#0c2417] border border-[#17462a] text-[#22c55e]';
      default:
        return 'bg-[#241c0e] border border-[#423214] text-[#f59e0b]';
    }
  };

  const getCleanBadgeText = (badge?: string) => {
    if (!badge) return '';
    return badge.replace(/^●\s*/, '');
  };

  return (
    <div className="w-full bg-[#0f1013] border border-[#1e2026] hover:border-[#2f333e] rounded-2xl p-6 flex flex-col justify-between transition-all duration-200 shadow-2xl group">
      <div>
        {/* 1. Header: Title & Category on Left, Status Badge on Right */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col min-w-0">
            <h3
              onClick={() => onConfigure(app)}
              className="text-white text-lg font-bold font-['Inter'] leading-snug group-hover:text-amber-400 transition-colors truncate cursor-pointer"
            >
              {app.name}
            </h3>
            <span className="text-[#f59e0b] text-sm font-semibold font-['Inter'] mt-1">
              {app.category}
            </span>
          </div>

          {app.badge && (
            <div
              className={`px-3 py-1 rounded-xl text-sm font-medium font-['Inter'] flex items-center gap-1.5 flex-shrink-0 shadow-sm ${getBadgeStyle(
                app.badge
              )}`}
            >
              <span className="w-2 h-2 rounded-full bg-[#22c55e] flex-shrink-0" />
              <span>{getCleanBadgeText(app.badge)}</span>
            </div>
          )}
        </div>

        {/* 2. Description */}
        <p
          onClick={() => onConfigure(app)}
          className="mt-4 text-[#8b92a5] text-sm sm:text-base font-normal font-['Inter'] leading-relaxed line-clamp-2 min-h-[40px] cursor-pointer"
        >
          {app.description}
        </p>

        {/* 3. Price & Star Rating */}
        <div className="mt-5 flex items-center justify-between">
          <span className="text-[#9ca3af] text-sm sm:text-base font-normal font-['Inter']">
            {app.price}
          </span>

          <div className="flex items-center gap-1.5 text-sm sm:text-base font-bold font-['Inter'] text-[#f59e0b]">
            <Star className="w-3.5 h-3.5 fill-[#f59e0b] text-[#f59e0b]" />
            <span>{app.rating.toFixed(1)}</span>
          </div>
        </div>
      </div>

      {/* 4. Divider */}
      <div className="mt-5 border-t border-[#1e2026]" />

      {/* 5. Bottom Action Buttons matching screenshot */}
      <div className="mt-5 flex items-center gap-3">
        {app.isInstalled ? (
          <button
            type="button"
            onClick={() => onConfigure(app)}
            className="flex-1 h-12 bg-[#0c2417] hover:bg-[#122e1e] border border-[#17462a] text-[#22c55e] font-semibold text-base font-['Inter'] rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
          >
            <span>Configured</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onInstall(app)}
            className="flex-1 h-12 bg-[#1c1d22] hover:bg-[#25272e] border border-[#2b2d35] text-white font-semibold text-base font-['Inter'] rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
          >
            <span>Install</span>
          </button>
        )}

        {/* Trash / More Button on Right */}
        <button
          type="button"
          onClick={() => {
            if (onDelete) {
              onDelete(app);
            } else {
              onConfigure(app);
            }
          }}
          title={app.isInstalled ? 'Disconnect integration' : 'Remove / Settings'}
          className="w-12 h-12 rounded-xl bg-[#15161a] hover:bg-[#1c1d22] border border-[#242630] hover:border-[#383b47] text-[#6b7280] hover:text-rose-400 flex items-center justify-center transition-colors cursor-pointer flex-shrink-0"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
