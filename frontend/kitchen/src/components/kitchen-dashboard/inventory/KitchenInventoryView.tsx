'use client';

import React, { useState, useMemo } from 'react';
import {
  Package,
  AlertTriangle,
  AlertCircle,
  Plus,
  Download,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Pencil,
  RotateCcw,
  CheckCircle2,
  X,
  Send,
  Building2,
  DollarSign,
  Layers,
  Sparkles,
  ArrowUpDown
} from 'lucide-react';
import { toast } from 'sonner';

export type InventoryCategory = 'All' | 'Dairy' | 'Proteins' | 'Bakery' | 'Produce' | 'Pantry';
export type StockStatus = 'Low Stock' | 'Running Low' | 'In Stock' | 'Reorder Soon';

export interface InventoryItem {
  id: string;
  name: string;
  category: 'Dairy' | 'Proteins' | 'Bakery' | 'Produce' | 'Pantry';
  stockLevel: number; // in kg or units
  unit: string; // 'kg', 'L', 'packs'
  parLevel: number;
  reorderAt: number;
  status: StockStatus;
  supplier: string;
  costPerUnit: number;
  lastRestocked?: string;
}

export const initialInventoryData: InventoryItem[] = [
  {
    id: 'inv-1',
    name: 'Mozzarella',
    category: 'Dairy',
    stockLevel: 2.4,
    unit: 'kg',
    parLevel: 10,
    reorderAt: 7,
    status: 'Low Stock',
    supplier: 'Fresh Dairy Co.',
    costPerUnit: 12.5,
  },
  {
    id: 'inv-2',
    name: 'Chicken Breast',
    category: 'Proteins',
    stockLevel: 4.8,
    unit: 'kg',
    parLevel: 11,
    reorderAt: 6,
    status: 'Running Low',
    supplier: 'Prime Meats',
    costPerUnit: 12.5,
  },
  {
    id: 'inv-3',
    name: 'Burger Buns',
    category: 'Bakery',
    stockLevel: 14.0,
    unit: 'kg',
    parLevel: 16,
    reorderAt: 6,
    status: 'In Stock',
    supplier: 'City Bakery',
    costPerUnit: 12.5,
  },
  {
    id: 'inv-4',
    name: 'French Fries',
    category: 'Produce',
    stockLevel: 5.0,
    unit: 'kg',
    parLevel: 18,
    reorderAt: 4,
    status: 'Reorder Soon',
    supplier: 'FreshFarm',
    costPerUnit: 12.5,
  },
  {
    id: 'inv-5',
    name: 'Olive Oil',
    category: 'Pantry',
    stockLevel: 3.5,
    unit: 'kg',
    parLevel: 15,
    reorderAt: 5,
    status: 'Low Stock',
    supplier: 'Fresh Dairy Co.',
    costPerUnit: 12.5,
  },
  {
    id: 'inv-6',
    name: 'Beef Patties',
    category: 'Proteins',
    stockLevel: 11.2,
    unit: 'kg',
    parLevel: 14,
    reorderAt: 8,
    status: 'In Stock',
    supplier: 'MedOil Imports',
    costPerUnit: 12.5,
  },
  {
    id: 'inv-7',
    name: 'Pizza Dough',
    category: 'Bakery',
    stockLevel: 6.0,
    unit: 'kg',
    parLevel: 15,
    reorderAt: 4,
    status: 'Running Low',
    supplier: 'City Bakery',
    costPerUnit: 12.5,
  },
  {
    id: 'inv-8',
    name: 'Roma Tomatoes',
    category: 'Produce',
    stockLevel: 10.2,
    unit: 'kg',
    parLevel: 11,
    reorderAt: 9,
    status: 'In Stock',
    supplier: 'FreshFarm',
    costPerUnit: 12.5,
  },
  {
    id: 'inv-9',
    name: 'Heavy Cream',
    category: 'Dairy',
    stockLevel: 12.5,
    unit: 'kg',
    parLevel: 15,
    reorderAt: 7,
    status: 'In Stock',
    supplier: 'Fresh Dairy Co.',
    costPerUnit: 12.5,
  },
  {
    id: 'inv-10',
    name: 'Salmon Fillet',
    category: 'Proteins',
    stockLevel: 1.5,
    unit: 'kg',
    parLevel: 19,
    reorderAt: 8,
    status: 'Low Stock',
    supplier: 'Ocean Fresh',
    costPerUnit: 12.5,
  },
  {
    id: 'inv-11',
    name: 'Garlic',
    category: 'Pantry',
    stockLevel: 12.0,
    unit: 'kg',
    parLevel: 14,
    reorderAt: 7,
    status: 'In Stock',
    supplier: 'FreshFarm',
    costPerUnit: 12.5,
  },
  {
    id: 'inv-12',
    name: 'Parmesan',
    category: 'Dairy',
    stockLevel: 6.5,
    unit: 'kg',
    parLevel: 19,
    reorderAt: 5,
    status: 'Reorder Soon',
    supplier: 'Fresh Dairy Co.',
    costPerUnit: 12.5,
  },
];

export default function KitchenInventoryView() {
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventoryData);
  const [selectedCategory, setSelectedCategory] = useState<InventoryCategory>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  // Modals
  const [reorderingItem, setReorderingItem] = useState<InventoryItem | null>(null);
  const [reorderAmount, setReorderAmount] = useState<number>(10);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);

  // Filtered Items
  const filteredItems = useMemo(() => {
    return inventory.filter((item) => {
      // Category filter
      if (selectedCategory !== 'All' && item.category !== selectedCategory) {
        return false;
      }
      // Status filter
      if (statusFilter !== 'All' && item.status !== statusFilter) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesCategory = item.category.toLowerCase().includes(query);
        const matchesSupplier = item.supplier.toLowerCase().includes(query);
        return matchesName || matchesCategory || matchesSupplier;
      }
      return true;
    });
  }, [inventory, selectedCategory, statusFilter, searchQuery]);

  // Total pages
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));

  // Current paginated items
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredItems.slice(startIndex, startIndex + pageSize);
  }, [filteredItems, currentPage, pageSize]);

  // Adjust page if out of range after filters change
  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  // Reset to page 1 on filter/search
  const handleCategoryChange = (cat: InventoryCategory) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
  };

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    setCurrentPage(1);
  };

  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  // Status Badge styles
  const getStatusBadge = (status: StockStatus) => {
    switch (status) {
      case 'Low Stock':
        return (
          <span className="px-2 py-0.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded text-xs font-semibold tracking-wide">
            Low Stock
          </span>
        );
      case 'Running Low':
        return (
          <span className="px-2 py-0.5 bg-amber-500/20 text-yellow-500 border border-amber-500/30 rounded text-xs font-medium tracking-wide">
            Running Low
          </span>
        );
      case 'Reorder Soon':
        return (
          <span className="px-2 py-0.5 bg-orange-500/20 text-amber-500 border border-orange-500/30 rounded text-xs font-medium tracking-wide">
            Reorder Soon
          </span>
        );
      case 'In Stock':
      default:
        return (
          <span className="px-2 py-0.5 bg-green-500/20 text-emerald-500 border border-green-500/30 rounded text-xs font-medium tracking-wide">
            In Stock
          </span>
        );
    }
  };

  // Stock Progress Bar color
  const getBarFill = (item: InventoryItem) => {
    const percent = Math.min(100, Math.round((item.stockLevel / item.parLevel) * 100));
    let colorClass = 'bg-emerald-500';
    if (item.status === 'Low Stock' || percent <= 25) {
      colorClass = 'bg-red-500';
    } else if (item.status === 'Running Low' || percent <= 50) {
      colorClass = 'bg-yellow-500';
    } else if (item.status === 'Reorder Soon') {
      colorClass = 'bg-amber-500';
    }
    return { percent, colorClass };
  };

  // Handle Quick Reorder
  const handleOpenReorder = (item: InventoryItem) => {
    const suggested = Math.max(1, item.parLevel - item.stockLevel);
    setReorderingItem(item);
    setReorderAmount(Number(suggested.toFixed(1)));
  };

  const handleConfirmReorder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reorderingItem) return;

    setInventory((prev) =>
      prev.map((i) =>
        i.id === reorderingItem.id
          ? {
              ...i,
              stockLevel: Number((i.stockLevel + reorderAmount).toFixed(1)),
              status: 'In Stock',
            }
          : i
      )
    );

    toast.success(`Purchase Order dispatched to ${reorderingItem.supplier}!`, {
      description: `Ordered +${reorderAmount}${reorderingItem.unit} of ${reorderingItem.name}. Estimated Delivery: Tomorrow 7:00 AM.`,
    });
    setReorderingItem(null);
  };

  // Handle Edit Save
  const handleSaveEdit = (updated: InventoryItem) => {
    setInventory((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
    setEditingItem(null);
    toast.success(`Inventory record for "${updated.name}" updated!`);
  };

  // Handle Add Item
  const handleAddItem = (newItem: Omit<InventoryItem, 'id'>) => {
    const itemWithId: InventoryItem = {
      ...newItem,
      id: `inv-${Date.now()}`,
    };
    setInventory((prev) => [itemWithId, ...prev]);
    setIsAddItemModalOpen(false);
    toast.success(`Added "${itemWithId.name}" to kitchen stock database!`);
  };

  // Export Data
  const handleExport = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Item,Category,StockLevel,ParLevel,ReorderAt,Status,Supplier,CostPerUnit']
        .concat(
          inventory.map(
            (i) =>
              `"${i.name}","${i.category}",${i.stockLevel},${i.parLevel},${i.reorderAt},"${i.status}","${i.supplier}",$${i.costPerUnit}`
          )
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `kitchen_inventory_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Inventory report exported as CSV!');
  };

  return (
    <div className="space-y-5">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER & PRIMARY ACTIONS                                           */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight font-['Inter']">
            Kitchen Inventory
          </h1>
          <p className="text-zinc-500 text-base sm:text-lg font-normal font-['Inter'] mt-1">
            Track stock levels, reorder points, and supplier information.
          </p>
        </div>

        {/* Action Buttons: Export & Add Item */}
        <div className="flex items-center gap-2">
          {/* Export Button */}
          <button
            type="button"
            onClick={handleExport}
            className="px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-md outline outline-1 outline-offset-[-1px] outline-white/10 flex items-center gap-1.5 transition-colors cursor-pointer text-slate-200 text-sm font-medium font-['Inter']"
          >
            <Download className="w-3.5 h-3.5 text-slate-300" />
            <span>Export</span>
          </button>

          {/* Add Item Button */}
          <button
            type="button"
            onClick={() => setIsAddItemModalOpen(true)}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-white font-semibold text-sm font-['Inter'] rounded-md flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20 cursor-pointer active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 text-white stroke-[2.5]" />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. CRITICAL LOW STOCK WARNING BANNERS (RED NOTIFICATIONS)                 */}
      {/* ========================================================================= */}
      <div className="space-y-2.5">
        {/* Banner 1: Mozzarella Cheese */}
        <div className="p-3 bg-red-500/10 rounded-lg outline outline-1 outline-offset-[-1px] outline-red-500/30 flex items-center justify-between gap-3 transition-all hover:bg-red-500/15">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center shrink-0">
              <AlertCircle className="w-3.5 h-3.5 text-red-400" />
            </div>
            <p className="text-red-400 text-sm font-normal font-['Inter'] leading-4">
              <span className="font-semibold text-red-400">Mozzarella Cheese</span> is critically low (16%). Current stock: 2.4kg. Reorder immediately.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              const mozz = inventory.find((i) => i.name.toLowerCase().includes('mozzarella'));
              if (mozz) handleOpenReorder(mozz);
              else if (inventory[0]) handleOpenReorder(inventory[0]);
            }}
            className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-white rounded-sm outline outline-1 outline-offset-[-1px] outline-red-500/30 text-xs font-medium font-['Inter'] transition-colors whitespace-nowrap cursor-pointer shrink-0"
          >
            Reorder Now
          </button>
        </div>

        {/* Banner 2: Salmon Fillet */}
        <div className="p-3 bg-red-500/10 rounded-lg outline outline-1 outline-offset-[-1px] outline-red-500/30 flex items-center justify-between gap-3 transition-all hover:bg-red-500/15">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center shrink-0">
              <AlertCircle className="w-3.5 h-3.5 text-red-400" />
            </div>
            <p className="text-red-400 text-sm font-normal font-['Inter'] leading-4">
              <span className="font-semibold text-red-400">Salmon Fillet</span> is critically low (15%). Current stock: 1.5kg. Reorder immediately.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              const salmon = inventory.find((i) => i.name.toLowerCase().includes('salmon'));
              if (salmon) handleOpenReorder(salmon);
              else { const target = inventory[1] || inventory[0]; if (target) handleOpenReorder(target); }
            }}
            className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-white rounded-sm outline outline-1 outline-offset-[-1px] outline-red-500/30 text-xs font-medium font-['Inter'] transition-colors whitespace-nowrap cursor-pointer shrink-0"
          >
            Reorder Now
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. CATEGORY STOCK CARDS ROW (5 Glow Cards from Figma)                     */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-1">
        {/* Card 1: Dairy */}
        <div
          onClick={() => handleCategoryChange(selectedCategory === 'Dairy' ? 'All' : 'Dairy')}
          className={`p-4 bg-neutral-900 rounded-[10px] shadow-[0px_0px_2px_0px_rgba(255,185,0,1.00)] outline outline-1 outline-offset-[-1px] outline-black/5 cursor-pointer hover:bg-neutral-800/80 transition-all flex flex-col justify-between ${
            selectedCategory === 'Dairy' ? 'ring-2 ring-amber-400' : ''
          }`}
        >
          <div>
            <div className="text-white text-2xl font-bold font-['Inter'] leading-5">3</div>
            <div className="text-neutral-200 text-sm font-semibold font-['Inter'] leading-5 mt-1">Dairy</div>
          </div>
          <div className="text-orange-600 text-base font-medium font-['Inter'] mt-2">2 low</div>
        </div>

        {/* Card 2: Proteins */}
        <div
          onClick={() => handleCategoryChange(selectedCategory === 'Proteins' ? 'All' : 'Proteins')}
          className={`p-4 bg-neutral-900 rounded-[10px] shadow-[0px_0px_2px_0px_rgba(255,185,0,1.00)] outline outline-1 outline-offset-[-1px] outline-black/5 cursor-pointer hover:bg-neutral-800/80 transition-all flex flex-col justify-between ${
            selectedCategory === 'Proteins' ? 'ring-2 ring-amber-400' : ''
          }`}
        >
          <div>
            <div className="text-white text-2xl font-bold font-['Inter'] leading-5">$61,200</div>
            <div className="text-neutral-200 text-sm font-semibold font-['Inter'] leading-5 mt-1">Proteins</div>
          </div>
          <div className="text-orange-600 text-base font-medium font-['Inter'] mt-2">2 low</div>
        </div>

        {/* Card 3: Bakery */}
        <div
          onClick={() => handleCategoryChange(selectedCategory === 'Bakery' ? 'All' : 'Bakery')}
          className={`p-4 bg-neutral-900 rounded-[10px] shadow-[0px_0px_2px_0px_rgba(255,185,0,1.00)] outline outline-1 outline-offset-[-1px] outline-black/5 cursor-pointer hover:bg-neutral-800/80 transition-all flex flex-col justify-between ${
            selectedCategory === 'Bakery' ? 'ring-2 ring-amber-400' : ''
          }`}
        >
          <div>
            <div className="text-white text-2xl font-bold font-['Inter'] leading-5">2</div>
            <div className="text-neutral-200 text-sm font-semibold font-['Inter'] leading-5 mt-1">Bakery</div>
          </div>
          <div className="text-emerald-400 text-base font-medium font-['Inter'] mt-2">Optimal</div>
        </div>

        {/* Card 4: Produce */}
        <div
          onClick={() => handleCategoryChange(selectedCategory === 'Produce' ? 'All' : 'Produce')}
          className={`p-4 bg-neutral-900 rounded-[10px] shadow-[0px_0px_2px_0px_rgba(255,185,0,1.00)] outline outline-1 outline-offset-[-1px] outline-black/5 cursor-pointer hover:bg-neutral-800/80 transition-all flex flex-col justify-between ${
            selectedCategory === 'Produce' ? 'ring-2 ring-amber-400' : ''
          }`}
        >
          <div>
            <div className="text-white text-2xl font-bold font-['Inter'] leading-5">03</div>
            <div className="text-neutral-200 text-sm font-semibold font-['Inter'] leading-5 mt-1">Produce</div>
          </div>
          <div className="text-amber-500 text-base font-medium font-['Inter'] mt-2">1 low</div>
        </div>

        {/* Card 5: Pantry */}
        <div
          onClick={() => handleCategoryChange(selectedCategory === 'Pantry' ? 'All' : 'Pantry')}
          className={`p-4 bg-neutral-900 rounded-[10px] shadow-[0px_0px_2px_0px_rgba(255,185,0,1.00)] outline outline-1 outline-offset-[-1px] outline-black/5 cursor-pointer hover:bg-neutral-800/80 transition-all flex flex-col justify-between ${
            selectedCategory === 'Pantry' ? 'ring-2 ring-amber-400' : ''
          }`}
        >
          <div>
            <div className="text-white text-2xl font-bold font-['Inter'] leading-5">1</div>
            <div className="text-neutral-200 text-sm font-semibold font-['Inter'] leading-5 mt-1">Pantry</div>
          </div>
          <div className="text-red-400 text-base font-medium font-['Inter'] mt-2">1 low</div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. FILTER CONTROLS & SEARCH BAR                                           */}
      {/* ========================================================================= */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-2">
        {/* Category Tabs */}
        <div className="inline-flex items-center rounded-lg border border-white/20 bg-zinc-900/60 p-0.5 overflow-x-auto max-w-full">
          {(['All', 'Dairy', 'Proteins', 'Bakery', 'Produce', 'Pantry'] as InventoryCategory[]).map((cat, idx) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`h-8 px-3.5 text-sm font-medium font-['Inter'] transition-all whitespace-nowrap flex items-center justify-center cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-white font-semibold rounded-md shadow-sm'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                } ${idx > 0 && !isActive ? 'border-l border-white/10' : ''}`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Search and Status Dropdown */}
        <div className="flex items-center gap-2.5 w-full lg:w-auto">
          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="h-8 px-3 py-1 bg-zinc-900/90 hover:bg-zinc-800 text-sm font-medium text-zinc-300 border border-zinc-700/60 rounded-lg outline-none cursor-pointer appearance-none pr-7 transition-colors"
            >
              <option value="All">All Statuses</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Running Low">Running Low</option>
              <option value="In Stock">In Stock</option>
              <option value="Reorder Soon">Reorder Soon</option>
            </select>
            <Filter className="w-3 h-3 text-zinc-500 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

          {/* Search Box */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search items, suppliers..."
              className="w-full h-8 pl-8 pr-4 bg-zinc-900/90 text-sm text-white placeholder-zinc-500 border border-zinc-700/60 rounded-lg focus:outline-none focus:border-amber-500/80 transition-all font-['Inter']"
            />
            {searchQuery && (
              <button
                onClick={() => handleSearchChange('')}
                className="absolute right-2.5 top-2 text-zinc-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. MAIN INVENTORY TABLE WITH GLASSMORPHIC CONTAINER                       */}
      {/* ========================================================================= */}
      <div className="bg-white/5 rounded-[10px] outline outline-1 outline-offset-[-1px] outline-white/10 backdrop-blur-lg overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[950px]">
            {/* Table Header */}
            <thead>
              <tr className="bg-zinc-900 h-14 border-b border-zinc-800">
                <th className="px-5 py-3 text-white text-sm font-semibold font-['Inter']">Items</th>
                <th className="px-4 py-3 text-white text-sm font-semibold font-['Inter']">Category</th>
                <th className="px-5 py-3 text-white text-sm font-semibold font-['Inter']">Stock Level</th>
                <th className="px-4 py-3 text-white text-sm font-semibold font-['Inter']">Par Level</th>
                <th className="px-4 py-3 text-white text-sm font-semibold font-['Inter']">Reorder At</th>
                <th className="px-4 py-3 text-white text-sm font-semibold font-['Inter']">Status</th>
                <th className="px-4 py-3 text-white text-sm font-semibold font-['Inter']">Supplier</th>
                <th className="px-4 py-3 text-white text-sm font-semibold font-['Inter']">Cost/Unit</th>
                <th className="px-5 py-3 text-white text-sm font-semibold font-['Inter'] text-right">Action</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-zinc-800">
              {paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-zinc-500 text-sm">
                    <Package className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                    No inventory records match the selected criteria.
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item) => {
                  const { percent, colorClass } = getBarFill(item);

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-white/[0.03] transition-colors group"
                    >
                      {/* 1. Item Name */}
                      <td className="px-5 py-4">
                        <span className="text-white text-sm font-semibold font-['Inter'] block group-hover:text-amber-400 transition-colors">
                          {item.name}
                        </span>
                      </td>

                      {/* 2. Category */}
                      <td className="px-4 py-4">
                        <span className="text-zinc-300 text-sm font-normal font-['Inter']">
                          {item.category}
                        </span>
                      </td>

                      {/* 3. Stock Level (Quantity + Progress Bar) */}
                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          <span className="text-gray-200 text-xs font-medium font-mono block">
                            {item.stockLevel} {item.unit}
                          </span>
                          <div className="w-24 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${colorClass}`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* 4. Par Level */}
                      <td className="px-4 py-4">
                        <span className="text-white text-sm font-semibold font-mono">
                          {item.parLevel} {item.unit}
                        </span>
                      </td>

                      {/* 5. Reorder At */}
                      <td className="px-4 py-4">
                        <span className="text-white text-sm font-semibold font-mono">
                          {item.reorderAt} {item.unit}
                        </span>
                      </td>

                      {/* 6. Status Badge */}
                      <td className="px-4 py-4">
                        {getStatusBadge(item.status)}
                      </td>

                      {/* 7. Supplier */}
                      <td className="px-4 py-4">
                        <span className="text-white text-sm font-medium font-['Inter']">
                          {item.supplier}
                        </span>
                      </td>

                      {/* 8. Cost/Unit */}
                      <td className="px-4 py-4">
                        <span className="text-white text-sm font-semibold font-mono">
                          ${item.costPerUnit.toFixed(2)}
                        </span>
                      </td>

                      {/* 9. Action (Reorder & Edit) */}
                      <td className="px-5 py-4 text-right">
                        <div className="inline-flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenReorder(item)}
                            className="text-orange-500 hover:text-orange-400 text-sm font-medium font-['Inter'] transition-colors cursor-pointer"
                          >
                            Reorder
                          </button>

                          <button
                            type="button"
                            onClick={() => setEditingItem(item)}
                            title="Edit Stock Record"
                            className="size-6 rounded-sm outline outline-1 outline-offset-[-1px] outline-white/10 hover:bg-white/10 inline-flex justify-center items-center text-gray-400 hover:text-white transition-colors cursor-pointer"
                          >
                            <Pencil className="w-3 h-3 text-gray-400 group-hover:text-white" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ========================================================================= */}
        {/* 6. PAGINATION CONTROLS (Pixel-Matched to app standard)                    */}
        {/* ========================================================================= */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Results Summary */}
          <div className="flex items-center gap-3">
            <span className="text-zinc-500 text-sm font-medium font-['Inter']">
              Showing {filteredItems.length > 0 ? `${(currentPage - 1) * pageSize + 1}-${Math.min(currentPage * pageSize, filteredItems.length)}` : '0'} of {filteredItems.length} results
            </span>

            {/* Page Size Selector */}
            <div className="flex items-center gap-1 text-xs text-zinc-500">
              <span>Per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-zinc-900 border border-zinc-800 rounded px-1.5 py-0.5 text-zinc-300 text-xs outline-none cursor-pointer"
              >
                <option value={6}>6</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
              </select>
            </div>
          </div>

          {/* Page Buttons */}
          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            {/* Previous Page */}
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 rounded-lg border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors cursor-pointer bg-zinc-900/50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Numeric Pages */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded-lg text-sm font-semibold flex items-center justify-center transition-all cursor-pointer ${
                  currentPage === page
                    ? 'bg-amber-400 text-white shadow-md shadow-amber-400/20 font-bold'
                    : 'border border-zinc-800 text-zinc-400 hover:text-white hover:bg-white/5 bg-zinc-900/50'
                }`}
              >
                {page}
              </button>
            ))}

            {/* Next Page */}
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="w-8 h-8 rounded-lg border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors cursor-pointer bg-zinc-900/50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 7. MODAL: QUICK REORDER PO MODAL                                          */}
      {/* ========================================================================= */}
      {reorderingItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white font-['Inter']">Dispatch Reorder PO</h3>
                  <p className="text-sm text-zinc-400">{reorderingItem.name}</p>
                </div>
              </div>
              <button
                onClick={() => setReorderingItem(null)}
                className="w-7 h-7 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 flex items-center justify-center"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleConfirmReorder} className="space-y-4 pt-4 text-sm">
              <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-2">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Supplier:</span>
                  <span className="text-white font-medium">{reorderingItem.supplier}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Current Stock:</span>
                  <span className="text-amber-400 font-mono">
                    {reorderingItem.stockLevel} {reorderingItem.unit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Target Par Level:</span>
                  <span className="text-zinc-200 font-mono">
                    {reorderingItem.parLevel} {reorderingItem.unit}
                  </span>
                </div>
                <div className="flex justify-between border-t border-zinc-800/80 pt-1.5">
                  <span className="text-zinc-500">Unit Price:</span>
                  <span className="text-zinc-200 font-mono">${reorderingItem.costPerUnit.toFixed(2)}</span>
                </div>
              </div>

              <div>
                <label className="text-zinc-400 font-medium block mb-1">
                  Reorder Amount ({reorderingItem.unit})
                </label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  required
                  value={reorderAmount}
                  onChange={(e) => setReorderAmount(parseFloat(e.target.value) || 1)}
                  className="w-full h-9 px-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white font-mono text-base focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/25 rounded-xl flex justify-between items-center">
                <span className="text-amber-300 font-medium">Estimated PO Total:</span>
                <span className="text-lg font-bold font-mono text-amber-400">
                  ${(reorderAmount * reorderingItem.costPerUnit).toFixed(2)}
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setReorderingItem(null)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg font-medium text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-white font-semibold rounded-lg text-sm transition-all shadow-md shadow-amber-500/20"
                >
                  Confirm & Send PO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. MODAL: EDIT INVENTORY ITEM                                             */}
      {/* ========================================================================= */}
      {editingItem && (
        <EditItemModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSave={handleSaveEdit}
        />
      )}

      {/* ========================================================================= */}
      {/* 9. MODAL: ADD NEW ITEM                                                    */}
      {/* ========================================================================= */}
      {isAddItemModalOpen && (
        <AddItemModal
          onClose={() => setIsAddItemModalOpen(false)}
          onAdd={handleAddItem}
        />
      )}
    </div>
  );
}

// -----------------------------------------------------------------------------
// Helper Component: Edit Item Modal
// -----------------------------------------------------------------------------
interface EditItemModalProps {
  item: InventoryItem;
  onClose: () => void;
  onSave: (updated: InventoryItem) => void;
}

function EditItemModal({ item, onClose, onSave }: EditItemModalProps) {
  const [formData, setFormData] = useState<InventoryItem>({ ...item });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <h3 className="text-lg font-bold text-white font-['Inter'] flex items-center gap-2">
            <Pencil className="w-4 h-4 text-amber-400" />
            Edit: {item.name}
          </h3>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 flex items-center justify-center"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4 text-sm">
          <div>
            <label className="text-zinc-400 font-medium block mb-1">Item Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full h-9 px-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-zinc-400 font-medium block mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full h-9 px-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500"
              >
                <option value="Dairy">Dairy</option>
                <option value="Proteins">Proteins</option>
                <option value="Bakery">Bakery</option>
                <option value="Produce">Produce</option>
                <option value="Pantry">Pantry</option>
              </select>
            </div>

            <div>
              <label className="text-zinc-400 font-medium block mb-1">Supplier</label>
              <input
                type="text"
                required
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                className="w-full h-9 px-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-zinc-400 font-medium block mb-1">Stock Level</label>
              <input
                type="number"
                step="0.1"
                min="0"
                required
                value={formData.stockLevel}
                onChange={(e) => setFormData({ ...formData, stockLevel: parseFloat(e.target.value) || 0 })}
                className="w-full h-9 px-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-sm font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-zinc-400 font-medium block mb-1">Par Level</label>
              <input
                type="number"
                step="0.1"
                min="1"
                required
                value={formData.parLevel}
                onChange={(e) => setFormData({ ...formData, parLevel: parseFloat(e.target.value) || 1 })}
                className="w-full h-9 px-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-sm font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-zinc-400 font-medium block mb-1">Reorder At</label>
              <input
                type="number"
                step="0.1"
                min="0"
                required
                value={formData.reorderAt}
                onChange={(e) => setFormData({ ...formData, reorderAt: parseFloat(e.target.value) || 0 })}
                className="w-full h-9 px-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-sm font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-zinc-400 font-medium block mb-1">Cost Per Unit ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.costPerUnit}
                onChange={(e) => setFormData({ ...formData, costPerUnit: parseFloat(e.target.value) || 0 })}
                className="w-full h-9 px-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-sm font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-zinc-400 font-medium block mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as StockStatus })}
                className="w-full h-9 px-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500"
              >
                <option value="In Stock">In Stock</option>
                <option value="Running Low">Running Low</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Reorder Soon">Reorder Soon</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg font-medium text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-white font-semibold rounded-lg text-sm transition-all shadow-md shadow-amber-500/20"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Helper Component: Add Item Modal
// -----------------------------------------------------------------------------
interface AddItemModalProps {
  onClose: () => void;
  onAdd: (item: Omit<InventoryItem, 'id'>) => void;
}

function AddItemModal({ onClose, onAdd }: AddItemModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'Dairy' | 'Proteins' | 'Bakery' | 'Produce' | 'Pantry'>('Dairy');
  const [stockLevel, setStockLevel] = useState(5.0);
  const [unit, setUnit] = useState('kg');
  const [parLevel, setParLevel] = useState(15.0);
  const [reorderAt, setReorderAt] = useState(6.0);
  const [status, setStatus] = useState<StockStatus>('In Stock');
  const [supplier, setSupplier] = useState('FreshFarm');
  const [costPerUnit, setCostPerUnit] = useState(12.5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAdd({
      name,
      category,
      stockLevel,
      unit,
      parLevel,
      reorderAt,
      status,
      supplier,
      costPerUnit,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <h3 className="text-lg font-bold text-white font-['Inter'] flex items-center gap-2">
            <Plus className="w-4 h-4 text-amber-400" />
            Add Inventory Item
          </h3>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 flex items-center justify-center"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4 text-sm">
          <div>
            <label className="text-zinc-400 font-medium block mb-1">Item Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Sourdough Loaf"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-9 px-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-zinc-400 font-medium block mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full h-9 px-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500"
              >
                <option value="Dairy">Dairy</option>
                <option value="Proteins">Proteins</option>
                <option value="Bakery">Bakery</option>
                <option value="Produce">Produce</option>
                <option value="Pantry">Pantry</option>
              </select>
            </div>

            <div>
              <label className="text-zinc-400 font-medium block mb-1">Supplier</label>
              <input
                type="text"
                required
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                className="w-full h-9 px-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-zinc-400 font-medium block mb-1">Current Stock</label>
              <input
                type="number"
                step="0.1"
                min="0"
                required
                value={stockLevel}
                onChange={(e) => setStockLevel(parseFloat(e.target.value) || 0)}
                className="w-full h-9 px-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-sm font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-zinc-400 font-medium block mb-1">Par Level</label>
              <input
                type="number"
                step="0.1"
                min="1"
                required
                value={parLevel}
                onChange={(e) => setParLevel(parseFloat(e.target.value) || 1)}
                className="w-full h-9 px-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-sm font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-zinc-400 font-medium block mb-1">Reorder At</label>
              <input
                type="number"
                step="0.1"
                min="0"
                required
                value={reorderAt}
                onChange={(e) => setReorderAt(parseFloat(e.target.value) || 0)}
                className="w-full h-9 px-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-sm font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-zinc-400 font-medium block mb-1">Cost Per Unit ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={costPerUnit}
                onChange={(e) => setCostPerUnit(parseFloat(e.target.value) || 0)}
                className="w-full h-9 px-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-sm font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-zinc-400 font-medium block mb-1">Initial Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as StockStatus)}
                className="w-full h-9 px-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500"
              >
                <option value="In Stock">In Stock</option>
                <option value="Running Low">Running Low</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Reorder Soon">Reorder Soon</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg font-medium text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-white font-semibold rounded-lg text-sm transition-all shadow-md shadow-amber-500/20"
            >
              Add Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
