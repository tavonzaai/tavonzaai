'use client';

import React from 'react';
import { POSCategory } from '../types';
import { POS_CATEGORIES } from '../posData';

interface POSCategoryBarProps {
  activeCategory: POSCategory;
  onSelectCategory: (category: POSCategory) => void;
}

export default function POSCategoryBar({
  activeCategory,
  onSelectCategory,
}: POSCategoryBarProps) {
  return (
    <div className="w-full overflow-x-auto custom-scrollbar pb-1">
      <div className="h-9 inline-flex items-center min-w-max">
        {POS_CATEGORIES.map((category, index) => {
          const isActive = activeCategory === category;
          const isFirst = index === 0;
          const isLast = index === POS_CATEGORIES.length - 1;

          return (
            <button
              key={category}
              type="button"
              onClick={() => onSelectCategory(category)}
              className={`h-9 px-3.5 py-2 flex items-center justify-center gap-2.5 text-base sm:text-lg font-normal font-['Inter'] leading-6 transition-colors cursor-pointer border-t border-b border-l border-white/20 ${
                isFirst ? 'rounded-tl-lg rounded-bl-lg' : ''
              } ${isLast ? 'rounded-tr-lg rounded-br-lg border-r' : ''} ${
                isActive
                  ? 'bg-yellow-500 text-white font-medium'
                  : 'bg-transparent text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>{category}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
