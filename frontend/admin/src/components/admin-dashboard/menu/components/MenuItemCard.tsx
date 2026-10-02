'use client';

import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { MenuItem } from '../types';

export interface MenuItemCardProps {
  item: MenuItem;
  onToggleActive: (item: MenuItem) => void;
  onEdit: (item: MenuItem) => void;
  onDelete: (item: MenuItem) => void;
}

export default function MenuItemCard({
  item,
  onToggleActive,
  onEdit,
  onDelete,
}: MenuItemCardProps) {
  return (
    <div
      className={`w-full h-72 relative bg-white/5 rounded-[10px] border border-white/20 backdrop-blur-[10.20px] overflow-hidden p-3.5 flex flex-col justify-between hover:border-amber-400/50 transition-all duration-200 group ${
        !item.isActive ? 'opacity-60' : ''
      }`}
    >
      {/* Top Image Preview Container */}
      <div className="w-full h-32 bg-neutral-900 rounded-[10px] overflow-hidden relative">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              '/assets/costomerpages/steak-rating-card.png';
          }}
        />
        {!item.isActive && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider bg-zinc-900/90 px-2 py-0.5 rounded border border-zinc-700">
              Hidden
            </span>
          </div>
        )}
      </div>

      {/* Item Details */}
      <div className="space-y-1">
        {/* Title & Active Toggle Switch */}
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-white text-lg font-semibold font-['Inter'] leading-6 truncate">
            {item.name}
          </h3>

          {/* Yellow Toggle Switch */}
          <button
            type="button"
            onClick={() => onToggleActive(item)}
            className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${
              item.isActive ? 'bg-yellow-500' : 'bg-zinc-700'
            }`}
            title={item.isActive ? 'Item is Active (click to hide)' : 'Item is Hidden (click to activate)'}
          >
            <div
              className={`size-4 bg-white rounded-full shadow-sm transform transition-transform ${
                item.isActive ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Category Subtitle & Vegetarian Tag */}
        <div className="flex items-center gap-2">
          <p className="text-gray-400 text-xs font-normal font-['Inter'] leading-4 truncate">
            {item.categoryLabel || item.category}
          </p>
          {item.isVegetarian && (
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.2 rounded font-medium shrink-0">
              Veg 🌱
            </span>
          )}
        </div>

        {/* Price & Margin Row */}
        <div className="flex items-center gap-2 pt-0.5">
          <span className="text-white text-sm font-semibold font-['Inter'] leading-4">
            ${item.price.toFixed(2)}
          </span>

          <span className="px-1.5 py-0.5 bg-neutral-800 rounded-[5px] text-green-500 text-[9px] font-medium font-['Inter'] leading-4">
            {item.marginPercent}% margin
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="w-full border-t border-neutral-700/70" />

      {/* Bottom Footer Row: Sold Today & Actions */}
      <div className="flex items-center justify-between gap-2 pt-0.5">
        {/* Live Status from Database */}
        <span className="text-zinc-500 text-xs font-normal font-['Inter'] leading-4">
          Status: <strong className={item.isActive ? 'text-emerald-400 font-medium' : 'text-zinc-500 font-medium'}>{item.isActive ? 'Available' : 'Hidden'}</strong>
        </span>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Edit Button */}
          <button
            type="button"
            onClick={() => onEdit(item)}
            className="w-7 h-6 p-1.5 bg-neutral-800 hover:bg-neutral-700 rounded-[5px] border border-neutral-700 flex justify-center items-center text-gray-400 hover:text-white transition cursor-pointer"
            title="Edit item"
          >
            <Pencil className="w-3 h-3" />
          </button>

          {/* Delete Button */}
          <button
            type="button"
            onClick={() => onDelete(item)}
            className="w-7 h-6 p-1.5 bg-neutral-800 hover:bg-red-950/80 rounded-[5px] border border-neutral-700 hover:border-orange-600/60 flex justify-center items-center text-orange-600 hover:text-red-400 transition cursor-pointer"
            title="Delete item"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
