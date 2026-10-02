'use client';

import React from 'react';
import { UploadCloud, ShieldCheck } from 'lucide-react';

interface DocumentsHeaderProps {
  onUploadClick: () => void;
}

export default function DocumentsHeader({ onUploadClick }: DocumentsHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <h1 className="text-white text-3xl sm:text-4xl font-semibold font-['Inter'] tracking-tight">
            Documents
          </h1>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-amber-400" />
            Encrypted Vault
          </span>
        </div>
        <p className="text-slate-400 text-base sm:text-lg font-normal font-['Inter']">
          Store and manage business documents securely.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onUploadClick}
          className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 active:scale-95 transition-all text-white text-sm font-semibold font-['Inter'] rounded-[10px] shadow-[0px_1px_2px_-1px_rgba(255,214,168,1.00)] shadow-[0px_1px_3px_0px_rgba(255,214,168,1.00)] inline-flex items-center gap-1.5 cursor-pointer"
        >
          <UploadCloud className="w-4 h-4 stroke-[2.5]" />
          <span>Upload Document</span>
        </button>
      </div>
    </div>
  );
}
