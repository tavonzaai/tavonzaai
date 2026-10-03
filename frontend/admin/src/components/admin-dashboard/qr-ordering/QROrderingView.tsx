'use client';

import React, { useState, useMemo } from 'react';
import {
  QRHeader,
  QRSearchAndFilters,
  QRTableGrid,
  QRTableDetailView,
  AddTableModal,
} from './components';
import { INITIAL_QR_TABLES } from './qrData';
import { QRTableItem, TableFilter } from './types';
import { toast } from 'sonner';

export default function QROrderingView() {
  const [tables, setTables] = useState<QRTableItem[]>(INITIAL_QR_TABLES);
  const [selectedTable, setSelectedTable] = useState<QRTableItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TableFilter>('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Filtered tables by search and status
  const filteredTables = useMemo(() => {
    return tables.filter((table) => {
      const matchesSearch =
        table.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        table.zone.toLowerCase().includes(searchQuery.toLowerCase()) ||
        table.server.toLowerCase().includes(searchQuery.toLowerCase()) ||
        table.url.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'All' ||
        (statusFilter === 'Occupied' && table.status === 'Busy') ||
        (statusFilter === 'Available' && table.status === 'Free');

      return matchesSearch && matchesStatus;
    });
  }, [tables, searchQuery, statusFilter]);

  const handlePrintTable = (table: QRTableItem) => {
    toast.success(`Sent QR Code for ${table.id} to connected thermal printer!`);
  };

  const handleRegenerateQR = (table: QRTableItem) => {
    const updatedVersion = 'Yes — v3.1 (Live)';
    setTables((prev) =>
      prev.map((t) =>
        t.id === table.id
          ? {
              ...t,
              qrActiveVersion: updatedVersion,
              lastScanTime: 'Just regenerated',
            }
          : t
      )
    );
    if (selectedTable && selectedTable.id === table.id) {
      setSelectedTable((prev) =>
        prev
          ? {
              ...prev,
              qrActiveVersion: updatedVersion,
              lastScanTime: 'Just regenerated',
            }
          : null
      );
    }
    toast.success(`Regenerated new dynamic QR Code for ${table.id}`);
  };

  const handleAddNewTable = (newTable: QRTableItem) => {
    setTables((prev) => [newTable, ...prev]);
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {selectedTable ? (
        /* DETAIL VIEW */
        <QRTableDetailView
          table={selectedTable}
          onBack={() => setSelectedTable(null)}
          onPrint={handlePrintTable}
          onRegenerate={handleRegenerateQR}
        />
      ) : (
        /* GRID LIST VIEW */
        <div className="space-y-6">
          {/* Header with Title, Stats & CTA */}
          <QRHeader
            tables={tables}
            onOpenGenerateModal={() => setIsAddModalOpen(true)}
          />

          {/* Search Bar & Status Filters */}
          <QRSearchAndFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
          />

          {/* 4-column Table Cards Grid */}
          <QRTableGrid
            tables={filteredTables}
            onSelectTable={(tbl) => setSelectedTable(tbl)}
            onPrintTable={handlePrintTable}
          />
        </div>
      )}

      {/* Add New Table & Auto-Generate QR Modal */}
      <AddTableModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddTable={handleAddNewTable}
      />
    </div>
  );
}
