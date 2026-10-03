'use client';

import React from 'react';
import { AlertTriangle, RotateCcw, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface DangerZoneCardProps {
  onResetSettings: () => void;
  onClearData: () => void;
}

export const DangerZoneCard: React.FC<DangerZoneCardProps> = ({
  onResetSettings,
  onClearData,
}) => {
  const handleReset = () => {
    if (confirm('Are you sure you want to restore all settings to default?')) {
      onResetSettings();
      toast.success('All cashier settings have been reset to factory defaults.');
    }
  };

  const handleClear = () => {
    if (
      confirm(
        "Are you sure you want to clear today's local cashier session data? Active register balances will be archived."
      )
    ) {
      onClearData();
      toast.warning("Today's register session data cleared & archived.");
    }
  };

  return (
    <div className="p-4 md:p-5 bg-white/10 rounded-[10px] border border-white/5 space-y-3.5 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 bg-orange-600/10 border border-red-500/20 rounded-lg flex items-center justify-center text-red-500 shrink-0">
          <AlertTriangle className="w-4 h-4" />
        </div>
        <h2 className="text-slate-200 text-lg font-semibold font-['Plus_Jakarta_Sans'] leading-4">
          Danger Zone
        </h2>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2.5 pt-1">
        {/* Reset All Settings */}
        <button
          type="button"
          onClick={handleReset}
          className="w-full h-10 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 hover:text-red-300 text-sm font-medium font-['Plus_Jakarta_Sans'] transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset All Settings</span>
        </button>

        {/* Clear Today's Data */}
        <button
          type="button"
          onClick={handleClear}
          className="w-full h-10 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 hover:text-red-300 text-sm font-normal font-['Plus_Jakarta_Sans'] transition-colors cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Today&apos;s Data</span>
        </button>
      </div>
    </div>
  );
};
