'use client';

import React, { useState, useMemo } from 'react';
import {
  InventoryHeader,
  InventoryAttentionBanner,
  InventoryKPICards,
  InventoryFilters,
  InventoryTable,
  AddInventoryItemModal,
} from './components';
import { INITIAL_INVENTORY_ITEMS } from './inventoryData';
import {
  InventoryItem,
  InventoryCategory,
  StockStatusFilter,
} from './types';
import { toast } from 'sonner';

export default function InventoryView() {
  const [items, setItems] = useState<InventoryItem[]>(INITIAL_INVENTORY_ITEMS);
  const [activeCategory, setActiveCategory] = useState<InventoryCategory>('All');
  const [activeStatusFilter, setActiveStatusFilter] =
    useState<StockStatusFilter>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  // Filter items by category, stock status, and search query
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // 1. Category match
      const matchesCategory =
        activeCategory === 'All' || item.category === activeCategory;

      // 2. Status filter match
      let matchesStatus = true;
      if (activeStatusFilter === 'Critical') {
        matchesStatus = item.status === 'Critical';
      } else if (activeStatusFilter === 'Low') {
        matchesStatus = item.status === 'Low Stock';
      } else if (activeStatusFilter === 'Out') {
        matchesStatus = item.status === 'Out of Stock';
      } else if (activeStatusFilter === 'OK') {
        matchesStatus = item.status === 'In Stock';
      }

      // 3. Search query match
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.supplier.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query);

      return matchesCategory && matchesStatus && matchesSearch;
    });
  }, [items, activeCategory, activeStatusFilter, searchQuery]);

  // Paginated items for current page (10 per page)
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredItems.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredItems, currentPage, PAGE_SIZE]);

  // Reset pagination on filter change
  const handleSelectCategory = (cat: InventoryCategory) => {
    setActiveCategory(cat);
    setCurrentPage(1);
  };

  const handleSelectStatusFilter = (status: StockStatusFilter) => {
    setActiveStatusFilter(status);
    setCurrentPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  // Add Item handler
  const handleAddItem = (newItem: InventoryItem) => {
    setItems((prev) => [newItem, ...prev]);
  };

  // Reorder All Low/Critical/Out handler
  const handleReorderAll = () => {
    setItems((prev) =>
      prev.map((item) => {
        if (
          item.status === 'Critical' ||
          item.status === 'Low Stock' ||
          item.status === 'Out of Stock'
        ) {
          return {
            ...item,
            currentStock: item.maxStock,
            levelPercent: 100,
            status: 'In Stock',
            lastUpdated: 'Just now (Restocked)',
          };
        }
        return item;
      })
    );
    toast.success('Purchase order created! All low items restocked to max capacity.');
  };

  // CSV Export handler
  const handleExportCSV = () => {
    const headers = [
      'Item Name',
      'Category',
      'Current Stock',
      'Unit',
      'Min Stock',
      'Max Stock',
      'Level %',
      'Supplier',
      'Last Updated',
      'Status',
    ];
    const rows = items.map((i) => [
      `"${i.name}"`,
      `"${i.category}"`,
      i.currentStock,
      `"${i.unit}"`,
      i.minStock,
      i.maxStock,
      `${i.levelPercent}%`,
      `"${i.supplier}"`,
      `"${i.lastUpdated}"`,
      `"${i.status}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `tavonza_inventory_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Inventory exported to CSV successfully!');
  };

  // Item click handler
  const handleSelectItem = (item: InventoryItem) => {
    toast.info(`${item.name}: ${item.currentStock} ${item.unit} in stock (${item.status})`);
  };

  return (
    <div className="w-full space-y-5 animate-in fade-in duration-200 pb-12">
      {/* 1. Header with Export & Add Item CTA */}
      <InventoryHeader
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onExportCSV={handleExportCSV}
      />

      {/* 2. Attention Required Alert Banner */}
      <InventoryAttentionBanner
        items={items}
        onReorderAll={handleReorderAll}
      />

      {/* 3. 4 KPI Metric Cards */}
      <InventoryKPICards items={items} />

      {/* 4. Filter Bar (Category Tabs, Stock Status Pills, Search) */}
      <InventoryFilters
        items={items}
        activeCategory={activeCategory}
        onSelectCategory={handleSelectCategory}
        activeStatusFilter={activeStatusFilter}
        onSelectStatusFilter={handleSelectStatusFilter}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
      />

      {/* 5. Inventory Data Table with Pagination (10 per page) */}
      <InventoryTable
        items={paginatedItems}
        totalFilteredCount={filteredItems.length}
        currentPage={currentPage}
        pageSize={PAGE_SIZE}
        onPageChange={setCurrentPage}
        onSelectItem={handleSelectItem}
      />

      {/* 6. Add Inventory Item Modal */}
      <AddInventoryItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddItem={handleAddItem}
      />
    </div>
  );
}
