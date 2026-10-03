'use client';

import React from 'react';
import { POSProduct } from '../types';
import { Plus } from 'lucide-react';

interface POSProductCardProps {
  product: POSProduct;
  onAddToCart: (product: POSProduct) => void;
  indexBadge?: string;
}

export default function POSProductCard({
  product,
  onAddToCart,
  indexBadge,
}: POSProductCardProps) {
  return (
    <div
      onClick={() => onAddToCart(product)}
      className="relative w-full h-60 bg-white/5 hover:bg-white/10 rounded-[10px] outline outline-1 outline-offset-[-1px] outline-white/30 backdrop-blur-[10.20px] overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-0.5 group shadow-lg flex flex-col justify-between"
    >
      {/* Hot badge or index badge */}
      {product.isHot && (
        <div className="absolute top-2.5 right-2.5 z-10 px-[5px] bg-stone-700/90 rounded-sm flex flex-col justify-center items-center gap-2.5 shadow-sm">
          <span className="text-yellow-500 text-[9px] font-medium font-['Inter'] leading-4">
            {product.badge || 'Hot'}
          </span>
        </div>
      )}

      {indexBadge && !product.isHot && (
        <div className="absolute top-2.5 right-2.5 z-10 px-[5px] bg-stone-700/90 rounded-sm flex flex-col justify-center items-center gap-2.5 shadow-sm">
          <span className="text-yellow-500 text-[9px] font-medium font-['Inter'] leading-4">
            {indexBadge}
          </span>
        </div>
      )}

      {/* Top Image Box */}
      <div className="p-3">
        <div className="w-full h-32 bg-neutral-900 rounded-[10px] overflow-hidden relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        {/* Name & Category Label */}
        <div className="mt-2 flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <h3 className="text-white text-base sm:text-lg font-semibold font-['Inter'] leading-6 truncate">
              {product.name}
            </h3>
            <p className="text-gray-400 text-xs font-normal font-['Inter'] leading-4 truncate">
              {product.categoryLabel}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Price Bar */}
      <div className="w-full px-3 py-1.5 border-t border-neutral-700 flex items-center justify-between bg-black/20">
        <span className="text-white text-base font-medium font-['Inter'] leading-4">
          ${product.price.toFixed(2)}
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(product);
          }}
          className="size-6 rounded-md bg-yellow-500/20 group-hover:bg-yellow-500 text-yellow-400 group-hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          title="Add to cart"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
}
