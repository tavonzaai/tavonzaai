'use client';

import React from 'react';
import { POSProduct } from '../types';
import POSProductCard from './POSProductCard';

interface POSProductGridProps {
  products: POSProduct[];
  onAddToCart: (product: POSProduct) => void;
}

export default function POSProductGrid({
  products,
  onAddToCart,
}: POSProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="w-full py-20 text-center bg-zinc-900/40 border border-zinc-800/80 rounded-2xl">
        <p className="text-zinc-400 text-base font-['Inter']">
          No menu items found for this selection.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3.5 w-full">
      {products.map((product, idx) => (
        <POSProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
          indexBadge={idx < 2 ? `0${idx + 1}` : undefined}
        />
      ))}
    </div>
  );
}
