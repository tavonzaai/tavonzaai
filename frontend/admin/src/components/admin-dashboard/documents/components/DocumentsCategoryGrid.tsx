'use client';

import React from 'react';
import { DocumentCategory } from '../types';
import {
  ShieldCheck,
  Scale,
  Settings2,
  Users,
  FileSignature,
  Landmark,
  Folder,
} from 'lucide-react';

interface DocumentsCategoryGridProps {
  selectedCategory: DocumentCategory | 'All';
  onSelectCategory: (cat: DocumentCategory | 'All') => void;
  categoryCounts: Record<DocumentCategory, number>;
}

export default function DocumentsCategoryGrid({
  selectedCategory,
  onSelectCategory,
  categoryCounts,
}: DocumentsCategoryGridProps) {
  const categories: { name: DocumentCategory; icon: any }[] = [
    { name: 'Compliance', icon: ShieldCheck },
    { name: 'Legal', icon: Scale },
    { name: 'Operations', icon: Settings2 },
    { name: 'HR', icon: Users },
    { name: 'Contracts', icon: FileSignature },
    { name: 'Finance', icon: Landmark },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 w-full">
      {categories.map(({ name, icon: Icon }) => {
        const isSelected = selectedCategory === name;
        const count = categoryCounts[name] || 0;

        return (
          <button
            key={name}
            type="button"
            onClick={() => onSelectCategory(isSelected ? 'All' : name)}
            className={`h-20 p-3 rounded-2xl outline outline-1 backdrop-blur-[30px] flex flex-col justify-center items-start text-left transition-all duration-200 cursor-pointer ${
              isSelected
                ? 'bg-yellow-500/15 outline-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.15)] scale-[1.02]'
                : 'bg-white/5 outline-white/20 hover:outline-white/40 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                  isSelected ? 'bg-yellow-500/20 text-yellow-400' : 'bg-white/10 text-slate-400'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>
              {isSelected && (
                <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-wider">
                  Active
                </span>
              )}
            </div>

            <div className="mt-1.5 w-full">
              <div
                className={`text-sm font-semibold font-['Inter'] leading-4 truncate ${
                  isSelected ? 'text-yellow-400' : 'text-white'
                }`}
              >
                {name}
              </div>
              <div className="text-slate-400 text-xs font-medium font-['Inter'] leading-4">
                {count} {count === 1 ? 'file' : 'files'}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
