'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  TablesHeader,
  TablesFilterBar,
  TableCard,
  AddTableFloorModal,
  TableActionModal,
} from './components';
import { INITIAL_TABLES_DATA } from './tablesData';
import { TableFloorItem, TableFloorFilter } from './types';
import { baseApiFetch } from '@/redux/api/baseApi';
import { branchService } from '@/redux/features/restaurantApi';

export default function TablesView() {
  const [tables, setTables] = useState<TableFloorItem[]>(INITIAL_TABLES_DATA);
  const [activeFilter, setActiveFilter] = useState<TableFloorFilter>('All Tables');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<TableFloorItem | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchLiveTables() {
      try {
        const branches = await branchService.getBranches({ limit: 1 }).catch(() => null);
        const branchId = branches?.data?.[0]?.id || (Array.isArray(branches) ? (branches as any)[0]?.id : undefined);
        if (!branchId) return;

        const rawTables = await baseApiFetch<any[]>(`/tables?branchId=${encodeURIComponent(branchId)}`).catch(() => []);
        if (isMounted && Array.isArray(rawTables) && rawTables.length > 0) {
          const mapped: TableFloorItem[] = rawTables.map((t: any) => ({
            id: t.tableNumber || t.number || `T-${t.id.slice(0, 4)}`,
            number: String(t.tableNumber || t.number || '01').replace(/^T-?/i, ''),
            capacity: Number(t.capacity) || 4,
            currentPartySize: t.status === 'OCCUPIED' ? Number(t.capacity) || 2 : 0,
            zone: 'Main Hall',
            status: t.status === 'OCCUPIED' ? 'Occupied' : t.status === 'RESERVED' ? 'Reserved' : 'Available',
            server: 'Assigned Server',
            seatedTime: t.status === 'OCCUPIED' ? 'Active' : '—',
            billAmount: 0.0,
          }));
          setTables(mapped);
        }
      } catch (err) {
        console.warn('Failed to fetch live admin floor tables:', err);
      }
    }

    fetchLiveTables();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filtered tables by status and search
  const filteredTables = useMemo(() => {
    return tables.filter((table) => {
      const matchesSearch =
        table.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        table.server.toLowerCase().includes(searchQuery.toLowerCase()) ||
        table.zone.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFilter =
        activeFilter === 'All Tables' ||
        table.status.toLowerCase() === activeFilter.toLowerCase();

      return matchesSearch && matchesFilter;
    });
  }, [tables, activeFilter, searchQuery]);

  // Add new table
  const handleAddTable = (newTable: TableFloorItem) => {
    setTables((prev) => [newTable, ...prev]);
  };

  // Update existing table
  const handleUpdateTable = (updatedTable: TableFloorItem) => {
    setTables((prev) =>
      prev.map((t) => (t.id === updatedTable.id ? updatedTable : t))
    );
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200 pb-12">
      {/* 1. Header with KPI Cards & Add CTA */}
      <TablesHeader
        tables={tables}
        onOpenAddModal={() => setIsAddModalOpen(true)}
      />

      {/* 2. Filter Bar & Search */}
      <TablesFilterBar
        tables={tables}
        activeFilter={activeFilter}
        onSelectFilter={setActiveFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* 3. 4-Column Table Floor Plan Grid */}
      {filteredTables.length === 0 ? (
        <div className="py-20 text-center text-zinc-500 bg-white/5 border border-white/10 rounded-2xl">
          <p className="text-base">No tables match your search or filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredTables.map((table) => (
            <TableCard
              key={table.id}
              table={table}
              onClickTable={(tbl) => setSelectedTable(tbl)}
            />
          ))}
        </div>
      )}

      {/* 4. Modals */}
      <AddTableFloorModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddTable={handleAddTable}
      />

      <TableActionModal
        table={selectedTable}
        isOpen={!!selectedTable}
        onClose={() => setSelectedTable(null)}
        onUpdateTable={handleUpdateTable}
      />
    </div>
  );
}
