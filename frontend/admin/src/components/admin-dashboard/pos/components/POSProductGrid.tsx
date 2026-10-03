'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import { POSProduct } from '../types';

export interface POSProductGridProps {
  products: POSProduct[];
  onAddToCart: (product: POSProduct) => void;
}

export default function POSProductGrid({
  products,
  onAddToCart,
}: POSProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="w-full py-16 text-center bg-zinc-900/40 border border-zinc-800/80 rounded-2xl">
        <p className="text-zinc-400 text-base">No items found matching your filter.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5 w-full">
      {products.map((product) => (
        <div
          key={product.id}
          onClick={() => onAddToCart(product)}
          className="relative bg-white/5 hover:bg-white/10 rounded-[12px] border border-white/20 hover:border-amber-400/80 backdrop-blur-[10px] overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-0.5 flex flex-col justify-between group shadow-lg"
        >
          {/* "Hot" / Specialty Badge */}
          {product.isHot && (
            <div className="absolute top-2.5 right-2.5 z-10 px-1.5 py-0.5 bg-stone-800/90 border border-stone-700 rounded-sm shadow-sm">
              <span className="text-yellow-500 text-[10px] font-bold uppercase tracking-wider">
                {product.badge || 'Hot'}
              </span>
            </div>
          )}

          {/* Top Image Box */}
          <div className="p-3">
            <div className="w-full h-32 bg-neutral-900/90 rounded-[10px] overflow-hidden flex items-center justify-center relative">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>

            {/* Name and Category */}
            <div className="mt-3 space-y-0.5">
              <h3 className="text-white text-base sm:text-lg font-semibold font-['Inter'] leading-5 truncate">
                {product.name}
              </h3>
              <p className="text-gray-400 text-xs font-normal font-['Inter'] leading-4">
                {product.categoryLabel}
              </p>
            </div>
          </div>

          {/* Bottom Price Bar */}
          <div className="w-full px-3 py-2 bg-black/20 border-t border-neutral-700/80 flex items-center justify-between">
            <span className="text-white text-base font-medium font-['Inter']">
              ${product.price.toFixed(2)}
            </span>
            <button
              type="button"
              className="size-6 rounded-md bg-amber-400/20 group-hover:bg-amber-400 text-amber-400 group-hover:text-white flex items-center justify-center transition-colors"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
