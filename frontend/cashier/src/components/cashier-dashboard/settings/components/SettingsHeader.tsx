'use client';

import React from 'react';
import { Save } from 'lucide-react';

interface SettingsHeaderProps {
  onSave: () => void;
  isSaving?: boolean;
}

export const SettingsHeader: React.FC<SettingsHeaderProps> = ({
  onSave,
  isSaving = false,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-white text-4xl font-semibold font-['Inter'] leading-9">
          Settings
        </h1>
        <p className="text-zinc-500 text-lg font-normal font-['Inter'] leading-6 mt-0.5">
          Configure your POS and checkout preferences
        </p>
      </div>

      <button
        type="button"
        onClick={onSave}
        disabled={isSaving}
        className="px-5 py-2 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-white text-sm font-semibold rounded-[10px] flex items-center gap-1.5 transition-colors cursor-pointer shadow-md font-['Inter'] self-start sm:self-auto"
      >
        <Save className="w-4 h-4" />
        <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
      </button>
    </div>
  );
};
