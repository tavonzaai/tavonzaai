'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { TableItem, TableStatus } from '../types';
import {
  Clock,
  User,
  QrCode,
  X,
  Download,
  Copy,
  Check,
  Plus,
  RefreshCw,
  Calendar,
  CalendarPlus,
  LayoutGrid,
  Eye,
  Trash2,
  Phone,
  Users,
  Pencil,
} from 'lucide-react';
import {
  buildTableQrCodeUrl,
  getCustomerTableUrl as resolveCustomerTableUrl,
  branchManagerService,
  getActiveBranchId,
  markTableDeletedLocally,
  isTableDeletedLocally,
  ReservationItem,
  BranchSessionItem,
} from '../../../redux/features/branchManagerApi';
import AddTableModal, { NewTableData } from '../config/AddTableModal';
import EditTableModal from './EditTableModal';
import { confirmDeleteTable, showDeleteSuccess, showDeleteError } from '../../../lib/swal';

interface TablesViewProps {
  initialFilter?: string;
  onSelectTable: (tableId: string) => void;
  tablesData: TableItem[];
  onTableCreated?: (table: TableItem) => void;
  onRefresh?: () => void;
}

export default function TablesView({
  initialFilter = 'all',
  onSelectTable,
  tablesData,
  onTableCreated,
  onRefresh,
}: TablesViewProps) {
  const [filter, setFilter] = useState<string>(initialFilter);
  const [selectedQrTable, setSelectedQrTable] = useState<TableItem | null>(null);
  const [copied, setCopied] = useState(false);
  const [isAddTableOpen, setIsAddTableOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<TableItem | null>(null);
  const [isEditTableOpen, setIsEditTableOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Subtab toggle: Floor Tables vs Reservations
  const [activeSubTab, setActiveSubTab] = useState<'tables' | 'reservations'>('tables');
  const [reservations, setReservations] = useState<ReservationItem[]>([]);
  const [branchSessions, setBranchSessions] = useState<BranchSessionItem[]>([]);
  const [resFilter, setResFilter] = useState<string>('ALL');
  const [isLoadingReservations, setIsLoadingReservations] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<ReservationItem | null>(null);
  const [isAddReservationOpen, setIsAddReservationOpen] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [newResForm, setNewResForm] = useState({
    guestName: '',
    guestPhone: '',
    partySize: 2,
    reservedForDate: new Date().toISOString().split('T')[0],
    reservedForTime: '19:00',
    durationMins: 90,
    tableId: '',
    specialRequest: '',
  });

  const filterTabs = [
    { id: 'all', label: 'ALL' },
    { id: 'available', label: 'Available' },
    { id: 'occupied', label: 'Occupied' },
    { id: 'preparing', label: 'Preparing' },
    { id: 'ready', label: 'Ready' },
    { id: 'need_attention', label: 'Needs Attention' },
    { id: 'payment', label: 'Payment Pending' },
  ];

  const activeTables = useMemo(() => {
    return tablesData.filter((table) => {
      if (!table || !table.id) return false;
      if (isTableDeletedLocally(table.id)) return false;
      const flag = String(table.operationalFlag || '').toUpperCase();
      const serv = String(table.serviceStatus || '').toUpperCase();
      const isDeletedFlag = Boolean((table as any).isDeleted || (table as any).deletedAt);
      const isInactive = (table as any).isActive === false;
      return flag !== 'OUT_OF_SERVICE' && serv !== 'OUT_OF_SERVICE' && !isDeletedFlag && !isInactive;
    });
  }, [tablesData]);

  const filteredTables = activeTables.filter((table) => {
    if (filter === 'all') return true;
    return table.status === filter;
  });

  const getStatusBadge = (status: TableStatus) => {
    switch (status) {
      case 'available':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Available
          </span>
        );
      case 'occupied':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
            Occupied
          </span>
        );
      case 'preparing':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20">
            Preparing
          </span>
        );
      case 'ready':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-teal-500/10 text-teal-400 border border-teal-500/20">
            Ready
          </span>
        );
      case 'need_attention':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-red-500/10 text-red-400 border border-red-500/20">
            Needs Attention
          </span>
        );
      case 'payment':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
            Payment Pending
          </span>
        );
      default:
        return null;
    }
  };

  const getTableQrUrl = (table: TableItem) => {
    return buildTableQrCodeUrl(table.qrCodeToken || table.id);
  };

  const getCustomerTableUrl = (table: TableItem) => {
    const token = table.qrCodeToken || table.id;
    return resolveCustomerTableUrl(token);
  };

  const handleCopyLink = (table: TableItem) => {
    const url = getCustomerTableUrl(table);
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveNewTable = async (data: NewTableData) => {
    try {
      setIsCreating(true);
      const branchId = getActiveBranchId();
      const created = await branchManagerService.createTable({
        branchId,
        label: data.number,
        capacity: Number(data.capacity) || 4,
        shape: data.shape || 'SQUARE',
        floor: Number(data.floor) || 1,
      });

      const qrToken = created.qrCodeToken || created.id;
      const qrCodeUrl = buildTableQrCodeUrl(qrToken);
      const mappedTable: TableItem = {
        id: created.id,
        number: created.label || data.number,
        status: 'available',
        capacity: created.capacity || Number(data.capacity) || 4,
        qrCodeUrl,
        qrCodeToken: qrToken,
        shape: data.shape || 'SQUARE',
        floor: Number(data.floor) || 1,
        waiter: 'Floor Staff',
      };

      setToastMessage(`Table "${data.number}" created successfully with live QR code!`);
      setTimeout(() => setToastMessage(null), 5000);

      if (onTableCreated) {
        onTableCreated(mappedTable);
      }
      if (onRefresh) {
        onRefresh();
      }
      return mappedTable;
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenEdit = (table: TableItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTable(table);
    setIsEditTableOpen(true);
  };

  const handleUpdateTable = async (updated: TableItem) => {
    setToastMessage(`Table "${updated.number || updated.label}" updated successfully!`);
    setTimeout(() => setToastMessage(null), 5000);
    setIsEditTableOpen(false);
    setEditingTable(null);
    if (onRefresh) {
      onRefresh();
    }
  };

  const handleDeleteTable = async (tableId: string) => {
    markTableDeletedLocally(tableId);
    setIsEditTableOpen(false);
    setEditingTable(null);
    await showDeleteSuccess('Table');
    if (onRefresh) {
      onRefresh();
    }
  };

  const handleDeleteTableDirect = async (table: TableItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmed = await confirmDeleteTable(table.number || table.label || 'this table');
    if (!confirmed) return;
    try {
      markTableDeletedLocally(table.id);
      await branchManagerService.deleteTable(table.id);
      await showDeleteSuccess(table.number || table.label || 'Table');
      if (onRefresh) {
        onRefresh();
      }
    } catch (err: any) {
      console.error('Failed to delete table:', err);
      await showDeleteError(err?.message || 'Failed to delete table.');
    }
  };

  const fetchReservations = async () => {
    try {
      setIsLoadingReservations(true);
      const branchId = getActiveBranchId();
      const data = await branchManagerService.getReservations(branchId);
      setReservations(data);
    } catch (err: any) {
      console.warn('Failed to load reservations:', err);
    } finally {
      setIsLoadingReservations(false);
    }
  };

  const fetchSessions = async () => {
    try {
      const branchId = getActiveBranchId();
      const sessions = await branchManagerService.getBranchSessions(branchId);
      setBranchSessions(sessions);
    } catch {}
  };

  useEffect(() => {
    fetchSessions();
    if (activeSubTab === 'reservations') {
      fetchReservations();
    }
  }, [activeSubTab]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await branchManagerService.updateReservationStatus(id, newStatus);
      setToastMessage(`Reservation updated to ${newStatus}`);
      setTimeout(() => setToastMessage(null), 4000);
      fetchReservations();
      if (selectedReservation?.id === id) {
        setSelectedReservation((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update reservation status');
    }
  };

  const handleDeleteReservation = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this reservation?')) return;
    try {
      await branchManagerService.deleteReservation(id);
      setToastMessage('Reservation cancelled successfully');
      setTimeout(() => setToastMessage(null), 4000);
      fetchReservations();
      if (selectedReservation?.id === id) {
        setSelectedReservation(null);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to cancel reservation');
    }
  };

  const handleViewReservation = async (id: string) => {
    try {
      const item = await branchManagerService.getReservation(id);
      setSelectedReservation(item);
    } catch (err: any) {
      alert(err.message || 'Failed to load reservation details');
    }
  };

  const handleCreateReservationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResForm.guestName.trim() || !newResForm.guestPhone.trim()) {
      alert('Guest name and phone number are required');
      return;
    }
    try {
      setIsBooking(true);
      const branchId = getActiveBranchId();
      const reservedIso = new Date(`${newResForm.reservedForDate}T${newResForm.reservedForTime}`).toISOString();
      await branchManagerService.createReservation({
        branchId,
        guestName: newResForm.guestName.trim(),
        guestPhone: newResForm.guestPhone.trim(),
        partySize: Number(newResForm.partySize) || 2,
        reservedFor: reservedIso,
        durationMins: Number(newResForm.durationMins) || 90,
        tableId: newResForm.tableId || undefined,
        specialRequest: newResForm.specialRequest.trim() || undefined,
      });
      setToastMessage(`Reservation booked for ${newResForm.guestName}!`);
      setTimeout(() => setToastMessage(null), 5000);
      setIsAddReservationOpen(false);
      setNewResForm({
        guestName: '',
        guestPhone: '',
        partySize: 2,
        reservedForDate: new Date().toISOString().split('T')[0],
        reservedForTime: '19:00',
        durationMins: 90,
        tableId: '',
        specialRequest: '',
      });
      fetchReservations();
    } catch (err: any) {
      alert(err.message || 'Failed to book reservation');
    } finally {
      setIsBooking(false);
    }
  };

  const formatReservationTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const getReservationBadge = (status: string) => {
    switch ((status || '').toUpperCase()) {
      case 'CONFIRMED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            Confirmed
          </span>
        );
      case 'SEATED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30">
            Seated
          </span>
        );
      case 'PENDING':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            Pending
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
            Cancelled
          </span>
        );
      case 'NO_SHOW':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-neutral-800 text-neutral-400 border border-neutral-700">
            No-Show
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-neutral-800 text-neutral-300">
            {status}
          </span>
        );
    }
  };

  const reservationFilterTabs = ['ALL', 'PENDING', 'CONFIRMED', 'SEATED', 'CANCELLED', 'NO_SHOW'];
  const filteredReservations = reservations.filter((r) => {
    if (resFilter === 'ALL') return true;
    return (r.status || '').toUpperCase() === resFilter;
  });

  return (
    <div className="flex-1 p-6 lg:p-8 space-y-6 max-w-7xl animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-4 py-3 rounded-xl flex items-center justify-between text-sm animate-in fade-in shadow-lg">
          <div className="flex items-center gap-2.5">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium">{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-emerald-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header with Title, Mode Switcher & Add Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white font-['Poppins']">
            {activeSubTab === 'tables' ? 'Dining Floor Tables' : 'Guest Table Reservations'}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 font-['Inter'] mt-0.5">
            {activeSubTab === 'tables'
              ? `Live table monitoring, QR contactless ordering & floor layout (${activeTables.length} tables total)`
              : `Bookings, guest arrivals, seating states & cancellations (${reservations.length} reservations total)`}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {branchSessions.length > 0 && (
            <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{branchSessions.length} Active Table Sessions</span>
            </div>
          )}

          <button
            type="button"
            onClick={activeSubTab === 'tables' ? onRefresh : fetchReservations}
            title="Refresh from backend"
            className="p-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 transition flex items-center justify-center cursor-pointer shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingReservations ? 'animate-spin' : ''}`} />
          </button>

          {activeSubTab === 'tables' ? (
            <button
              type="button"
              onClick={() => setIsAddTableOpen(true)}
              className="px-4 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-neutral-950 font-bold rounded-xl flex items-center gap-2 text-sm shadow-md transition cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add Table</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsAddReservationOpen(true)}
              className="px-4 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-neutral-950 font-bold rounded-xl flex items-center gap-2 text-sm shadow-md transition cursor-pointer active:scale-95"
            >
              <CalendarPlus className="w-4 h-4 stroke-[2.5]" />
              <span>Book Reservation</span>
            </button>
          )}
        </div>
      </div>

      {/* Subtab Toggle */}
      <div className="flex items-center gap-1.5 bg-neutral-900/80 p-1 rounded-xl border border-neutral-800 w-fit">
        <button
          type="button"
          onClick={() => setActiveSubTab('tables')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold font-['Poppins'] transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'tables'
              ? 'bg-yellow-400 text-neutral-950 shadow-sm'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>Floor Tables ({activeTables.length})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveSubTab('reservations');
            fetchReservations();
          }}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold font-['Poppins'] transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'reservations'
              ? 'bg-yellow-400 text-neutral-950 shadow-sm'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Reservations ({reservations.length})</span>
        </button>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. FLOOR TABLES VIEW                                          */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeSubTab === 'tables' && (
        <>
          {/* Filter Tabs matching Figma */}
          <div className="flex flex-wrap items-center gap-2">
            {filterTabs.map((tab) => {
              const isActive = filter === tab.id;
              const count =
                tab.id === 'all'
                  ? activeTables.length
                  : activeTables.filter((t) => t.status === tab.id).length;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilter(tab.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium font-['Poppins'] transition border flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-yellow-400 text-neutral-900 border-yellow-400 font-semibold shadow-sm'
                      : 'bg-neutral-900/60 text-neutral-300 border-neutral-800 hover:bg-neutral-800/80 hover:text-white'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isActive ? 'bg-neutral-900/20 text-neutral-900' : 'bg-neutral-800 text-neutral-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Tables Grid or Empty State */}
          {filteredTables.length === 0 ? (
            <div className="bg-neutral-900/40 border border-neutral-800/80 rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-neutral-800/80 border border-neutral-700/60 flex items-center justify-center text-yellow-400 mb-1 shadow-inner">
                <Plus className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-white font-['Poppins']">
                {filter === 'all' ? 'No dining tables configured yet' : `No tables found for status "${filter}"`}
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 max-w-md font-['Inter'] leading-relaxed">
                {filter === 'all'
                  ? 'Add your branch dining tables to start receiving contactless customer orders, waiter calls, and live kitchen dispatch.'
                  : 'Try switching to another filter tab or create a new table for your branch floor plan.'}
              </p>
              <button
                type="button"
                onClick={() => setIsAddTableOpen(true)}
                className="mt-2 px-5 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-neutral-950 font-bold rounded-xl flex items-center gap-2 text-sm shadow-md transition cursor-pointer active:scale-95"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Add New Table</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredTables.map((table) => {
                const isAvailable = table.status === 'available';

                return (
                  <div
                    key={table.id}
                    onClick={() => onSelectTable(table.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between h-48 shadow-sm ${
                      isAvailable
                        ? 'bg-neutral-900/60 border-neutral-800/80 hover:border-neutral-700'
                        : 'bg-neutral-900 border-neutral-800 hover:border-amber-400/50 hover:bg-neutral-900/90'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-white font-semibold text-lg font-['Inter']">
                        {table.number}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          title="View Table QR Code"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedQrTable(table);
                          }}
                          className="p-1 rounded-md bg-neutral-800 hover:bg-amber-400 hover:text-neutral-950 text-amber-400 border border-neutral-700 transition flex items-center justify-center cursor-pointer"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          title="Edit Table Details"
                          onClick={(e) => handleOpenEdit(table, e)}
                          className="p-1 rounded-md bg-neutral-800 hover:bg-amber-400 hover:text-neutral-950 text-neutral-300 border border-neutral-700 transition flex items-center justify-center cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          title="Delete Table"
                          onClick={(e) => handleDeleteTableDirect(table, e)}
                          className="p-1 rounded-md bg-neutral-800 hover:bg-red-500 hover:text-white text-neutral-400 hover:border-red-500 border border-neutral-700 transition flex items-center justify-center cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        {getStatusBadge(table.status)}
                      </div>
                    </div>

                    {!isAvailable ? (
                      <div className="flex flex-col gap-1 text-xs font-['Inter']">
                        <div className="flex items-center gap-1.5 text-neutral-300">
                          <User className="w-3.5 h-3.5 text-neutral-500" />
                          <span>
                            Waiter: <strong className="text-white font-medium">{table.waiter}</strong>
                          </span>
                        </div>
                        <span className="text-amber-400/90 font-medium">
                          {table.orderNumber} ({table.itemsCount} items)
                        </span>
                      </div>
                    ) : (
                      <div className="text-xs text-neutral-400 font-['Inter'] flex items-center gap-1.5">
                        <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
                        <span>Ready for guest seating · QR active</span>
                      </div>
                    )}

                    <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between text-xs text-neutral-500 font-['Inter']">
                      <span>Capacity: {table.capacity}p</span>
                      <div className="flex items-center gap-2.5">
                        <button
                          type="button"
                          onClick={(e) => handleOpenEdit(table, e)}
                          className="text-[11px] text-neutral-300 hover:text-amber-400 font-medium flex items-center gap-1 transition cursor-pointer"
                        >
                          <Pencil className="w-3 h-3 text-amber-400" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedQrTable(table);
                          }}
                          className="text-[11px] text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 transition cursor-pointer"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>View QR</span>
                        </button>
                        {!isAvailable && table.orderTime && (
                          <div className="flex items-center gap-1 text-neutral-400">
                            <Clock className="w-3.5 h-3.5 text-neutral-500" />
                            <span>{table.orderTime}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. RESERVATIONS VIEW                                          */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeSubTab === 'reservations' && (
        <div className="space-y-4">
          {/* Status Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {reservationFilterTabs.map((s) => {
              const isActive = resFilter === s;
              const count =
                s === 'ALL'
                  ? reservations.length
                  : reservations.filter((r) => (r.status || '').toUpperCase() === s).length;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setResFilter(s)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium font-['Poppins'] transition border flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-yellow-400 text-neutral-900 border-yellow-400 font-semibold shadow-sm'
                      : 'bg-neutral-900/60 text-neutral-300 border-neutral-800 hover:bg-neutral-800/80 hover:text-white'
                  }`}
                >
                  <span>{s}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isActive ? 'bg-neutral-900/20 text-neutral-900' : 'bg-neutral-800 text-neutral-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* List or Empty State */}
          {filteredReservations.length === 0 ? (
            <div className="bg-neutral-900/40 border border-neutral-800/80 rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-neutral-800/80 border border-neutral-700/60 flex items-center justify-center text-yellow-400 mb-1 shadow-inner">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-white font-['Poppins']">
                {resFilter === 'ALL'
                  ? 'No reservations found for this branch'
                  : `No reservations with status "${resFilter}"`}
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 max-w-md font-['Inter'] leading-relaxed">
                Book in advance for walk-ins, phone reservations, or VIP concierge table locks.
              </p>
              <button
                type="button"
                onClick={() => setIsAddReservationOpen(true)}
                className="mt-2 px-5 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-neutral-950 font-bold rounded-xl flex items-center gap-2 text-sm shadow-md transition cursor-pointer active:scale-95"
              >
                <CalendarPlus className="w-4 h-4 stroke-[2.5]" />
                <span>Create New Reservation</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredReservations.map((res) => {
                const assignedTable = tablesData.find((t) => t.id === res.tableId);
                const tableLabel = assignedTable?.number || res.tableLabel || (res.tableId ? 'Table Assigned' : 'Unassigned Table');

                return (
                  <div
                    key={res.id}
                    className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/80 hover:border-neutral-700 transition flex flex-col justify-between gap-3 shadow-md"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-col">
                        <span className="text-white font-semibold text-base font-['Poppins']">
                          {res.guestName}
                        </span>
                        <div className="flex items-center gap-2 text-neutral-400 text-xs mt-0.5">
                          <Phone className="w-3 h-3 text-neutral-500" />
                          <span>{res.guestPhone}</span>
                        </div>
                      </div>
                      {getReservationBadge(res.status)}
                    </div>

                    <div className="bg-neutral-950 p-2.5 rounded-lg border border-neutral-800/80 flex flex-col gap-1.5 text-xs">
                      <div className="flex items-center justify-between text-neutral-300">
                        <span className="flex items-center gap-1 text-neutral-400">
                          <Clock className="w-3.5 h-3.5 text-yellow-400" />
                          <span>Reserved Time:</span>
                        </span>
                        <span className="font-semibold text-white">
                          {formatReservationTime(res.reservedFor)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-neutral-300">
                        <span className="flex items-center gap-1 text-neutral-400">
                          <Users className="w-3.5 h-3.5 text-yellow-400" />
                          <span>Party & Duration:</span>
                        </span>
                        <span className="text-neutral-200">
                          {res.partySize} guests ({res.durationMins || 90}m)
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-neutral-300">
                        <span className="text-neutral-400">Table:</span>
                        <span className="font-mono text-amber-400">{tableLabel}</span>
                      </div>

                      {res.specialRequest && (
                        <div className="pt-1 border-t border-neutral-800 text-[11px] text-neutral-400 line-clamp-2">
                          <strong className="text-neutral-300">Request:</strong> {res.specialRequest}
                        </div>
                      )}
                    </div>

                    {/* Quick action controls */}
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-neutral-800/80">
                      <button
                        type="button"
                        onClick={() => handleViewReservation(res.id)}
                        className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition flex items-center gap-1 text-xs cursor-pointer"
                        title="View details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Details</span>
                      </button>

                      <div className="flex items-center gap-1.5">
                        {res.status === 'PENDING' && (
                          <button
                            type="button"
                            onClick={() => handleStatusChange(res.id, 'CONFIRMED')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-medium transition cursor-pointer"
                          >
                            Confirm
                          </button>
                        )}

                        {res.status === 'CONFIRMED' && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleStatusChange(res.id, 'SEATED')}
                              className="px-2.5 py-1 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 text-xs font-medium transition cursor-pointer"
                            >
                              Seat
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStatusChange(res.id, 'NO_SHOW')}
                              className="px-2 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 text-xs transition cursor-pointer"
                            >
                              No-Show
                            </button>
                          </>
                        )}

                        {res.status !== 'CANCELLED' && (
                          <button
                            type="button"
                            onClick={() => handleDeleteReservation(res.id)}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition cursor-pointer"
                            title="Cancel reservation"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODALS                                                        */}
      {/* ───────────────────────────────────────────────────────────── */}

      {/* Single Reservation Detail Modal */}
      {selectedReservation && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setSelectedReservation(null)}
        >
          <div
            className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl relative text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div>
                <h3 className="text-lg font-bold font-['Poppins']">Reservation Details</h3>
                <p className="text-xs text-neutral-400 font-mono">ID: {selectedReservation.id.slice(0, 8)}...</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReservation(null)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">Guest Name:</span>
                <span className="font-semibold text-white text-sm">{selectedReservation.guestName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">Contact Phone:</span>
                <span className="font-mono text-neutral-200">{selectedReservation.guestPhone}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">Scheduled Time:</span>
                <span className="font-semibold text-yellow-400">{formatReservationTime(selectedReservation.reservedFor)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">Party Size:</span>
                <span>{selectedReservation.partySize} guests</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">Allocated Duration:</span>
                <span>{selectedReservation.durationMins || 90} minutes</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">Status:</span>
                <div>{getReservationBadge(selectedReservation.status)}</div>
              </div>
              {selectedReservation.specialRequest && (
                <div className="p-2.5 bg-neutral-950 rounded-xl border border-neutral-800 text-neutral-300">
                  <span className="font-semibold text-neutral-400 block mb-1">Special Requests:</span>
                  {selectedReservation.specialRequest}
                </div>
              )}
            </div>

            {/* Quick Status Modifiers */}
            <div className="pt-3 border-t border-neutral-800 space-y-2">
              <span className="text-xs font-semibold text-neutral-400 block">Change Status:</span>
              <div className="grid grid-cols-3 gap-2">
                {['CONFIRMED', 'SEATED', 'CANCELLED'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    disabled={selectedReservation.status === st}
                    onClick={() => handleStatusChange(selectedReservation.id, st)}
                    className="py-1.5 px-2 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 text-xs font-medium rounded-lg transition text-center cursor-pointer"
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedReservation(null)}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-medium transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Book New Reservation Modal */}
      {isAddReservationOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setIsAddReservationOpen(false)}
        >
          <div
            className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 max-w-md w-full shadow-2xl relative text-white space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div>
                <h3 className="text-lg font-bold font-['Poppins']">Book New Reservation</h3>
                <p className="text-xs text-neutral-400">Lock table & seating for arriving guests</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddReservationOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReservationSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1 font-medium">Guest Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Connor"
                  value={newResForm.guestName}
                  onChange={(e) => setNewResForm({ ...newResForm, guestName: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none focus:border-yellow-400"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1 font-medium">Guest Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="+1-555-0199"
                  value={newResForm.guestPhone}
                  onChange={(e) => setNewResForm({ ...newResForm, guestPhone: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none focus:border-yellow-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1 font-medium">Party Size</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={newResForm.partySize}
                    onChange={(e) => setNewResForm({ ...newResForm, partySize: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none focus:border-yellow-400"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1 font-medium">Duration (Mins)</label>
                  <select
                    value={newResForm.durationMins}
                    onChange={(e) => setNewResForm({ ...newResForm, durationMins: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none focus:border-yellow-400"
                  >
                    <option value={60}>60 mins (1 hr)</option>
                    <option value={90}>90 mins (1.5 hrs)</option>
                    <option value={120}>120 mins (2 hrs)</option>
                    <option value={180}>180 mins (3 hrs)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1 font-medium">Date</label>
                  <input
                    type="date"
                    required
                    value={newResForm.reservedForDate}
                    onChange={(e) => setNewResForm({ ...newResForm, reservedForDate: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none focus:border-yellow-400"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1 font-medium">Time</label>
                  <input
                    type="time"
                    required
                    value={newResForm.reservedForTime}
                    onChange={(e) => setNewResForm({ ...newResForm, reservedForTime: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none focus:border-yellow-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1 font-medium">Pre-assign Table (Optional)</label>
                <select
                  value={newResForm.tableId}
                  onChange={(e) => setNewResForm({ ...newResForm, tableId: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none focus:border-yellow-400"
                >
                  <option value="">No table pre-assigned</option>
                  {tablesData.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.number} (Capacity: {t.capacity}p)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1 font-medium">Special Requests</label>
                <textarea
                  rows={2}
                  placeholder="Window seat, anniversary flowers, dietary restrictions..."
                  value={newResForm.specialRequest}
                  onChange={(e) => setNewResForm({ ...newResForm, specialRequest: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white focus:outline-none focus:border-yellow-400 resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddReservationOpen(false)}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-medium transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isBooking}
                  className="px-5 py-2 bg-yellow-400 hover:bg-yellow-300 text-neutral-950 font-bold rounded-xl text-xs transition cursor-pointer disabled:opacity-60"
                >
                  {isBooking ? 'Booking...' : 'Confirm Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {selectedQrTable && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setSelectedQrTable(null)}
        >
          <div
            className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 max-w-sm w-full space-y-5 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white font-['Poppins']">
                  {selectedQrTable.number} Access Pass
                </h3>
                <p className="text-xs text-neutral-400">Customer Dine-In & Ordering QR</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedQrTable(null)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-white p-4 rounded-xl flex items-center justify-center shadow-inner">
              <img
                src={getTableQrUrl(selectedQrTable)}
                alt={`QR code for ${selectedQrTable.number}`}
                className="w-48 h-48 object-contain"
              />
            </div>

            <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800/80 space-y-1.5 text-xs">
              <div className="flex justify-between items-center text-neutral-400">
                <span>Table Token:</span>
                <span className="font-mono text-neutral-200">
                  {selectedQrTable.qrCodeToken ? `${selectedQrTable.qrCodeToken.slice(0, 12)}...` : 'Active'}
                </span>
              </div>
              <div className="flex justify-between items-center text-neutral-400">
                <span>Customer Order URL:</span>
                <span className="font-mono text-amber-400 truncate max-w-[180px]">
                  /t/{selectedQrTable.qrCodeToken || selectedQrTable.id}
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 pt-1 leading-normal">
                Scanning this QR code automatically routes the guest to this table and logs customer activity to your branch terminal.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleCopyLink(selectedQrTable)}
                className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Link'}</span>
              </button>
              <a
                href={getTableQrUrl(selectedQrTable)}
                download={`qr-${selectedQrTable.number}.png`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-2 bg-yellow-400 hover:bg-yellow-300 text-neutral-950 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save QR</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Add Table Modal */}
      <AddTableModal
        isOpen={isAddTableOpen}
        onClose={() => setIsAddTableOpen(false)}
        onSaveTable={handleSaveNewTable}
        isLoading={isCreating}
      />

      {/* Edit Table Modal */}
      <EditTableModal
        isOpen={isEditTableOpen}
        table={editingTable}
        onClose={() => {
          setIsEditTableOpen(false);
          setEditingTable(null);
        }}
        onTableUpdated={handleUpdateTable}
        onTableDeleted={handleDeleteTable}
      />
    </div>
  );
}

