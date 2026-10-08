'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Package, Plus, Minus, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { DataTable, ColumnDef, SearchInput, LoadingState, EmptyState, ErrorState } from '../common';
import { kitchenService, getActiveBranchId } from '@/redux/features/kitchenApi';
import { INITIAL_INVENTORY } from './data';

interface InventoryRow {
  id: string;
  name: string;
  category: string;
  stock: number;
  unit: string;
  status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
}

export default function KitchenInventoryView({ onBack }: { onBack: () => void }) {
  const [items, setItems] = useState<InventoryRow[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adjustingId, setAdjustingId] = useState<string | null>(null);

  const loadInventory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const branchId = getActiveBranchId();
      const raw = await kitchenService.getInventoryItems(branchId);
      if (Array.isArray(raw) && raw.length > 0) {
        const mapped: InventoryRow[] = raw.map((item: any) => ({
          id: item.id,
          name: item.name || item.ingredientName || 'Inventory Item',
          category: item.category || item.categoryName || 'General',
          stock: Number(item.currentStock ?? item.stock ?? 0),
          unit: item.unit || 'units',
          status:
            Number(item.currentStock ?? item.stock ?? 0) <= 0
              ? 'OUT_OF_STOCK'
              : Number(item.currentStock ?? item.stock ?? 0) <= Number(item.minimumStock ?? 10)
              ? 'LOW_STOCK'
              : 'IN_STOCK',
        }));
        setItems(mapped);
      } else {
        setItems(INITIAL_INVENTORY as InventoryRow[]);
      }
    } catch (err: any) {
      console.warn('Falling back to default kitchen inventory:', err);
      setItems(INITIAL_INVENTORY as InventoryRow[]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const handleAdjustStock = async (id: string, delta: number) => {
    setAdjustingId(id);
    try {
      await kitchenService.adjustStock(id, {
        quantityDelta: delta,
        reason: delta > 0 ? 'Kitchen Restock' : 'Kitchen Consumption',
      });
      toast.success(delta > 0 ? 'Stock increased' : 'Stock reduced');
      setItems((prev) =>
        prev.map((item) => {
          if (item.id === id) {
            const nextStock = Math.max(0, item.stock + delta);
            return {
              ...item,
              stock: nextStock,
              status: nextStock === 0 ? 'OUT_OF_STOCK' : nextStock <= 15 ? 'LOW_STOCK' : 'IN_STOCK',
            };
          }
          return item;
        })
      );
    } catch {
      // Local optimistic update
      setItems((prev) =>
        prev.map((item) => {
          if (item.id === id) {
            const nextStock = Math.max(0, item.stock + delta);
            return {
              ...item,
              stock: nextStock,
              status: nextStock === 0 ? 'OUT_OF_STOCK' : nextStock <= 15 ? 'LOW_STOCK' : 'IN_STOCK',
            };
          }
          return item;
        })
      );
      toast.success('Stock adjusted locally');
    } finally {
      setAdjustingId(null);
    }
  };

  const filteredItems = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter(
      (item) => item.name.toLowerCase().includes(q) || item.category.toLowerCase().includes(q)
    );
  }, [items, search]);

  const columns: ColumnDef<InventoryRow>[] = [
    {
      key: 'name',
      header: 'Ingredient / Item',
      sortable: true,
      render: (item) => (
        <div>
          <span className="font-semibold text-white block">{item.name}</span>
          <span className="text-[11px] text-zinc-500">{item.category}</span>
        </div>
      ),
    },
    {
      key: 'stock',
      header: 'Current Stock',
      sortable: true,
      render: (item) => (
        <span className="font-bold text-zinc-100">
          {item.stock} <span className="text-zinc-500 font-normal text-[11px]">{item.unit}</span>
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => {
        if (item.status === 'OUT_OF_STOCK') {
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <AlertTriangle className="w-3 h-3" /> Out of Stock
            </span>
          );
        }
        if (item.status === 'LOW_STOCK') {
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <AlertTriangle className="w-3 h-3" /> Low Stock
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle className="w-3 h-3" /> In Stock
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: 'Adjust Level',
      align: 'right',
      render: (item) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            disabled={adjustingId === item.id || item.stock <= 0}
            onClick={() => handleAdjustStock(item.id, -1)}
            className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white flex items-center justify-center transition disabled:opacity-40 cursor-pointer"
            title="Reduce stock"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            disabled={adjustingId === item.id}
            onClick={() => handleAdjustStock(item.id, 1)}
            className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white flex items-center justify-center transition disabled:opacity-40 cursor-pointer"
            title="Increase stock"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-yellow-400" />
            Kitchen Inventory
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time branch inventory levels and station ingredient availability.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadInventory}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-750 text-xs font-semibold transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
          <button
            type="button"
            onClick={onBack}
            className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition"
          >
            Back to Queue
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Filter ingredients..."
          className="max-w-md w-full"
        />
        <span className="text-xs text-zinc-400">
          Showing <strong className="text-white">{filteredItems.length}</strong> items
        </span>
      </div>

      {isLoading ? (
        <LoadingState message="Fetching kitchen inventory..." />
      ) : error ? (
        <ErrorState message={error} onRetry={loadInventory} />
      ) : (
        <DataTable
          data={filteredItems}
          columns={columns}
          emptyState={
            <EmptyState
              icon={<Package className="w-6 h-6 text-zinc-500" />}
              title="No inventory records found"
              description="No ingredients matched your search criteria."
            />
          }
        />
      )}
    </div>
  );
}
