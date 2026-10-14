'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  User,
  ChevronDown,
  Sliders,
  Activity,
  Check,
  Shield,
  Plus,
  Trash2,
  UtensilsCrossed,
  AlertCircle,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import {
  branchManagerService,
  getActiveBranchId,
  StaffAssignmentItem,
  TableItem,
} from '../../../redux/features/branchManagerApi';

const AVAILABLE_ROLES = [
  { value: 'WAITER', label: 'Waiter / Server' },
  { value: 'KITCHEN', label: 'Kitchen / Chef' },
  { value: 'MANAGER', label: 'Branch Manager' },
  { value: 'HOST', label: 'Host / Reception' },
  { value: 'BARTENDER', label: 'Bartender' },
  { value: 'CASHIER', label: 'Cashier / Billing' },
];

const AVAILABLE_PERMISSIONS = [
  'VIEW_ORDERS',
  'UPDATE_ORDER_STATUS',
  'MANAGE_TABLES',
  'CALL_WAITER',
  'PROCESS_PAYMENTS',
  'VIEW_REPORTS',
  'MANAGE_INVENTORY',
];

interface AssignedTableInfo {
  id: string;
  label: string;
  tableNumber?: string;
  capacity?: number;
  serviceStatus?: string;
  floor?: number;
  assignmentId?: string;
  sessionStart?: string;
  sessionEnd?: string;
  isActive?: boolean;
}

interface StaffDetailViewProps {
  staffId?: string;
  onBack: () => void;
  onUpdateShift?: (info: string) => void;
}

export default function StaffDetailView({
  staffId,
  onBack,
  onUpdateShift,
}: StaffDetailViewProps) {
  const [staffMember, setStaffMember] = useState<StaffAssignmentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'Active' | 'Break' | 'Off Duty'>('Active');
  const [section, setSection] = useState('Floor Dining Room');
  const [shiftSchedule, setShiftSchedule] = useState('Lunch Shift (10:00 AM - 4:00 PM)');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // Role and Permissions States (PATCH /branches/:id/staff/:staffId)
  const [selectedRole, setSelectedRole] = useState<string>('WAITER');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isUpdatingStaffAssignment, setIsUpdatingStaffAssignment] = useState(false);

  // Live Table Assignment States
  const [assignedTables, setAssignedTables] = useState<AssignedTableInfo[]>([]);
  const [allBranchTables, setAllBranchTables] = useState<TableItem[]>([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [assigningTable, setAssigningTable] = useState(false);
  const [unassigningTableId, setUnassigningTableId] = useState<string | null>(null);
  const [selectedTableToAssign, setSelectedTableToAssign] = useState<string>('');
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadAssignments = async (targetStaffId: string) => {
    try {
      setLoadingAssignments(true);
      const branchId = getActiveBranchId();
      const [assignmentsRes, tablesRes] = await Promise.all([
        branchManagerService.getWaiterAssignments(branchId, targetStaffId),
        branchManagerService.getTables(branchId),
      ]);

      const extracted: AssignedTableInfo[] = [];
      if (Array.isArray(assignmentsRes)) {
        assignmentsRes.forEach((assignment: any) => {
          if (Array.isArray(assignment.assignedTables) && assignment.assignedTables.length > 0) {
            assignment.assignedTables.forEach((t: any) => {
              if (!extracted.some((x) => x.id === t.id)) {
                extracted.push({
                  id: t.id,
                  label: t.label || t.tableNumber || `Table ${t.id.slice(0, 4)}`,
                  tableNumber: t.tableNumber || t.label,
                  capacity: t.capacity,
                  serviceStatus: t.serviceStatus || 'AVAILABLE',
                  floor: t.floor,
                  assignmentId: t.assignmentId || assignment.id,
                  sessionStart: t.sessionStart,
                  sessionEnd: t.sessionEnd,
                  isActive: t.isActive !== false,
                });
              }
            });
          } else if (assignment.tableId) {
            extracted.push({
              id: assignment.tableId,
              label: assignment.tableNumber || `Table ${assignment.tableId.slice(0, 4)}`,
              tableNumber: assignment.tableNumber,
              capacity: assignment.capacity,
              serviceStatus: assignment.serviceStatus || 'AVAILABLE',
              assignmentId: assignment.id,
              isActive: assignment.isActive !== false,
            });
          }
        });
      }
      setAssignedTables(extracted);
      if (Array.isArray(tablesRes)) {
        setAllBranchTables(tablesRes);
      }
    } catch (err: any) {
      console.warn('Could not load waiter assignments:', err);
    } finally {
      setLoadingAssignments(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    async function fetchStaffDetail() {
      try {
        setLoading(true);
        const branchId = getActiveBranchId();
        const member = await branchManagerService.getStaffMember(branchId, staffId!);
        if (isMounted && member) {
          setStaffMember(member);
          setStatus(member.isActive ? 'Active' : 'Break');
          setSelectedRole(member.role || 'WAITER');
          setSelectedPermissions(member.permissions || []);
          const targetId = member.staffId || staffId!;
          loadAssignments(targetId);
        }
      } catch (err) {
        console.warn('Could not load staff detail via findOne:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (staffId) {
      fetchStaffDetail();
    }
    return () => {
      isMounted = false;
    };
  }, [staffId]);

  const handleTogglePermission = (perm: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const handleUpdate = async () => {
    const targetStaffId = staffMember?.staffId || staffMember?.id || staffId;
    if (!targetStaffId) return;

    try {
      setIsUpdatingStaffAssignment(true);
      setActionMessage(null);
      const branchId = getActiveBranchId();
      const updated = await branchManagerService.updateStaff(branchId, targetStaffId, {
        role: selectedRole,
        permissions: selectedPermissions,
        isActive: status === 'Active',
      });

      if (updated) {
        setStaffMember((prev) =>
          prev
            ? {
                ...prev,
                ...updated,
                role: selectedRole,
                permissions: selectedPermissions,
                isActive: status === 'Active',
              }
            : updated
        );
      }
      setUpdateSuccess(true);
      setActionMessage({
        type: 'success',
        text: `Staff assignment updated! Role: ${selectedRole}, Status: ${status}`,
      });
      if (onUpdateShift) {
        onUpdateShift(`Updated role & schedule for ${staffMember?.name || 'Staff Member'} to ${selectedRole} - ${shiftSchedule}`);
      }
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (err: any) {
      setActionMessage({
        type: 'error',
        text: err?.message || 'Failed to update staff assignment',
      });
    } finally {
      setIsUpdatingStaffAssignment(false);
    }
  };

  const handleAssignTable = async () => {
    if (!selectedTableToAssign) return;
    const targetId = staffMember?.staffId || staffId;
    if (!targetId) return;

    try {
      setAssigningTable(true);
      setActionMessage(null);
      const branchId = getActiveBranchId();
      await branchManagerService.assignWaiterToTable({
        branchId,
        waiterId: targetId,
        tableId: selectedTableToAssign,
        shiftLabel: shiftSchedule,
      });

      const assignedTbl = allBranchTables.find((t) => t.id === selectedTableToAssign);
      setActionMessage({
        type: 'success',
        text: `Table ${assignedTbl?.label || selectedTableToAssign} successfully assigned!`,
      });
      setSelectedTableToAssign('');
      await loadAssignments(targetId);
    } catch (err: any) {
      setActionMessage({
        type: 'error',
        text: err?.message || 'Failed to assign table to waiter.',
      });
    } finally {
      setAssigningTable(false);
    }
  };

  const handleUnassignTable = async (table: AssignedTableInfo) => {
    const targetId = staffMember?.staffId || staffId;
    if (!targetId) return;

    try {
      setUnassigningTableId(table.id);
      setActionMessage(null);
      const branchId = getActiveBranchId();
      await branchManagerService.unassignWaiterTable({
        branchId,
        waiterId: targetId,
        tableId: table.id,
        assignmentId: table.assignmentId,
      });

      setActionMessage({
        type: 'success',
        text: `Table ${table.label} unassigned successfully.`,
      });
      await loadAssignments(targetId);
    } catch (err: any) {
      setActionMessage({
        type: 'error',
        text: err?.message || 'Failed to unassign table.',
      });
    } finally {
      setUnassigningTableId(null);
    }
  };

  const displayName = staffMember?.name || 'Staff Member';
  const displayRole = staffMember?.role ? staffMember.role.replace(/_/g, ' ') : 'Staff Member';
  const displayEmail = staffMember?.email || 'No email provided';
  const displayPhone = staffMember?.phone || 'No phone recorded';

  const unassignedBranchTables = allBranchTables.filter(
    (bt) => !assignedTables.some((at) => at.id === bt.id)
  );

  return (
    <div className="flex-1 p-6 lg:p-8 space-y-6 max-w-7xl animate-in fade-in duration-200 font-['Inter']">
      {/* Top Navigation Bar */}
      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-neutral-400 hover:text-white transition group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-neutral-400 group-hover:-translate-x-1 transition" />
          <span className="text-xs font-semibold font-['Poppins'] leading-4">Back to staff roster</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="text-neutral-500 text-sm md:text-base font-medium leading-4">
            Assigned Role:
          </span>
          <div className="px-3 py-1.5 bg-yellow-400/10 rounded-lg outline outline-1 outline-offset-[-1px] outline-yellow-400/30 flex items-center">
            <span className="text-yellow-400 text-sm font-medium uppercase">{displayRole}</span>
          </div>
        </div>
      </div>

      {/* Staff Profile Card */}
      <div className="p-5 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-800 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 bg-zinc-800 rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-800 flex items-center justify-center shrink-0">
              <User className="w-6 h-6 text-white" />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-white text-lg font-medium font-['Poppins'] leading-5">
                  {displayName}
                </span>
                <div className="px-2 py-0.5 bg-green-500/10 rounded-md flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  <span className="text-green-500 text-xs font-normal">
                    {status}
                  </span>
                </div>
              </div>
              <span className="text-neutral-400 text-xs font-normal">
                Email: {displayEmail} · Phone: {displayPhone}
              </span>
            </div>
          </div>

          <div className="relative flex items-center gap-3">
            <span className="text-neutral-500 text-sm font-semibold">Duty Status:</span>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                className="px-3 py-2 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 flex items-center gap-2 hover:bg-neutral-800 transition cursor-pointer"
              >
                <span className="text-stone-300 text-sm font-medium">{status}</span>
                <ChevronDown className="w-4 h-4 text-stone-300" />
              </button>

              {showStatusDropdown && (
                <div className="absolute right-0 mt-1 w-32 bg-neutral-900 border border-neutral-700 rounded-lg shadow-xl z-20 py-1 text-xs">
                  {(['Active', 'Break', 'Off Duty'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => {
                        setStatus(st);
                        setShowStatusDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 text-stone-200 hover:bg-neutral-800 hover:text-amber-400 transition"
                    >
                      {st}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="w-full h-px bg-neutral-800" />

        {/* 4 Summary Stats Boxes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3 bg-black/30 rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-800 flex flex-col gap-1.5">
            <span className="text-neutral-500 text-xs font-normal">
              Current Shift
            </span>
            <span className="text-stone-300 text-sm font-semibold truncate">
              {shiftSchedule}
            </span>
          </div>

          <div className="p-3 bg-black/30 rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-800 flex flex-col gap-1.5">
            <span className="text-neutral-500 text-xs font-normal">
              Assigned Section
            </span>
            <span className="text-blue-400 text-sm font-semibold truncate">
              {section}
            </span>
          </div>

          <div className="p-3 bg-black/30 rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-800 flex flex-col gap-1.5">
            <span className="text-neutral-500 text-xs font-normal">
              Assigned Tables
            </span>
            <span className="text-green-500 text-sm font-semibold truncate">
              {loadingAssignments
                ? 'Loading tables...'
                : assignedTables.length > 0
                ? `${assignedTables.length} Active (${assignedTables.map((t) => t.label).join(', ')})`
                : 'No tables assigned'}
            </span>
          </div>

          <div className="p-3 bg-black/30 rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-800 flex flex-col gap-1.5">
            <span className="text-neutral-500 text-xs font-normal">
              Staff Database ID
            </span>
            <span className="text-yellow-400 text-xs font-mono font-semibold truncate">
              {staffMember?.staffId || staffId || 'N/A'}
            </span>
          </div>
        </div>

        {/* Permissions */}
        {staffMember?.permissions && staffMember.permissions.length > 0 && (
          <div className="pt-2">
            <div className="flex items-center gap-1.5 text-xs text-neutral-400 mb-2">
              <Shield className="w-3.5 h-3.5 text-yellow-400" />
              <span>Assigned Permissions in Database:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {staffMember.permissions.map((p) => (
                <span
                  key={p}
                  className="px-2.5 py-1 bg-neutral-800/80 border border-neutral-700/60 rounded-md text-[11px] font-mono text-neutral-300"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Two Column Layout: Manager Controls & Metadata */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        {/* Controls */}
        <div className="p-5 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-800 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-white" />
              <h2 className="text-white text-base font-medium font-['Poppins']">
                Table & Floor Section Management
              </h2>
            </div>
            <button
              type="button"
              onClick={() => {
                const targetId = staffMember?.staffId || staffId;
                if (targetId) loadAssignments(targetId);
              }}
              disabled={loadingAssignments}
              className="p-1.5 text-neutral-400 hover:text-white transition rounded-md hover:bg-neutral-800 cursor-pointer disabled:opacity-50"
              title="Refresh Assignments"
            >
              <RefreshCw className={`w-4 h-4 ${loadingAssignments ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {actionMessage && (
            <div
              className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                actionMessage.type === 'success'
                  ? 'bg-emerald-950/70 border border-emerald-500/40 text-emerald-300'
                  : 'bg-red-950/70 border border-red-500/40 text-red-300'
              }`}
            >
              {actionMessage.type === 'success' ? (
                <Check className="w-4 h-4 shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              )}
              <span>{actionMessage.text}</span>
            </div>
          )}

          <div className="w-full h-px bg-neutral-800" />

          {/* Assigned Tables Section */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="text-white text-sm font-medium flex items-center gap-1.5">
                <UtensilsCrossed className="w-4 h-4 text-yellow-400" />
                <span>Assigned Tables ({assignedTables.length})</span>
              </label>
              <span className="text-xs text-neutral-400">
                Live Branch Scoped
              </span>
            </div>

            {loadingAssignments ? (
              <div className="p-4 text-center text-xs text-neutral-500 bg-neutral-950/40 rounded-lg">
                Loading assigned tables...
              </div>
            ) : assignedTables.length === 0 ? (
              <div className="p-4 text-center text-xs text-neutral-400 bg-neutral-950/40 rounded-lg border border-dashed border-neutral-800">
                No tables currently assigned to this waiter. Use the assign form below to add tables.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
                {assignedTables.map((t) => (
                  <div
                    key={t.id}
                    className="p-3 bg-neutral-950/70 rounded-lg border border-neutral-800 flex items-center justify-between gap-2 hover:border-neutral-700 transition"
                  >
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-white text-sm font-semibold truncate">
                          {t.label}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-medium uppercase ${
                            t.serviceStatus === 'OCCUPIED'
                              ? 'bg-amber-400/10 text-amber-400 border border-amber-400/20'
                              : t.serviceStatus === 'RESERVED'
                              ? 'bg-blue-400/10 text-blue-400 border border-blue-400/20'
                              : 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20'
                          }`}
                        >
                          {t.serviceStatus || 'AVAILABLE'}
                        </span>
                      </div>
                      <span className="text-neutral-400 text-[11px]">
                        Cap: {t.capacity || 4} · Floor: {t.floor || 1}
                      </span>
                    </div>

                    <button
                      type="button"
                      disabled={unassigningTableId === t.id}
                      onClick={() => handleUnassignTable(t)}
                      className="p-2 text-neutral-400 hover:text-red-400 hover:bg-red-400/10 rounded-md transition cursor-pointer disabled:opacity-50"
                      title="Unassign Table"
                    >
                      <Trash2 className={`w-3.5 h-3.5 ${unassigningTableId === t.id ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="w-full h-px bg-neutral-800" />

          {/* Assign New Table Control */}
          <div className="flex flex-col gap-2">
            <label className="text-white text-xs font-normal">
              Assign Table to Waiter
            </label>
            <div className="flex gap-2">
              <select
                value={selectedTableToAssign}
                onChange={(e) => setSelectedTableToAssign(e.target.value)}
                className="flex-1 px-3 py-2.5 bg-neutral-950/60 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 text-stone-300 text-sm focus:outline-neutral-700 cursor-pointer"
              >
                <option value="">Select an available branch table...</option>
                {unassignedBranchTables.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label || t.tableNumber || `Table ${t.id.slice(0, 4)}`} (Cap: {t.capacity || 4}, Floor {t.floor || 1})
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleAssignTable}
                disabled={!selectedTableToAssign || assigningTable}
                className="px-4 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-neutral-900 font-semibold text-xs rounded-lg transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{assigningTable ? 'Assigning...' : 'Assign'}</span>
              </button>
            </div>
          </div>

          <div className="w-full h-px bg-neutral-800" />

          {/* Role & Permissions Configuration (PATCH /branches/:id/staff/:staffId) */}
          <div className="flex flex-col gap-2">
            <label className="text-white text-xs font-semibold flex items-center justify-between">
              <span>Assigned Branch Role</span>
              <span className="text-[10px] text-yellow-400 font-mono">PATCH /branches/:id/staff/:staffId</span>
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-neutral-950/60 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 text-stone-200 text-sm focus:outline-yellow-400 cursor-pointer"
            >
              {AVAILABLE_ROLES.map((r) => (
                <option key={r.value} value={r.value} className="bg-neutral-900 text-white">
                  {r.label} ({r.value})
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-white text-xs font-semibold">
              Assignment Permissions
            </label>
            <div className="flex flex-wrap gap-1.5">
              {AVAILABLE_PERMISSIONS.map((perm) => {
                const isSelected = selectedPermissions.includes(perm);
                return (
                  <button
                    key={perm}
                    type="button"
                    onClick={() => handleTogglePermission(perm)}
                    className={`px-2.5 py-1 rounded-md text-xs font-mono transition cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-yellow-400 text-neutral-950 font-semibold shadow-sm'
                        : 'bg-neutral-950/70 border border-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-black" />}
                    <span>{perm}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="w-full h-px bg-neutral-800" />

          {/* Section & Shift Schedule */}
          <div className="flex flex-col gap-2">
            <label className="text-white text-xs font-normal">
              Dining Section Label
            </label>
            <input
              type="text"
              value={section}
              onChange={(e) => setSection(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-neutral-950/60 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 text-stone-300 text-sm focus:outline-neutral-700"
              placeholder="e.g. Floor Section A"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3.5">
            <div className="flex-1 flex flex-col gap-2">
              <label className="text-white text-xs font-normal">
                Shift Operating Hours
              </label>
              <select
                value={shiftSchedule}
                onChange={(e) => setShiftSchedule(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-neutral-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 text-stone-300 text-sm focus:outline-neutral-600 cursor-pointer"
              >
                <option value="Lunch Shift (10:00 AM - 4:00 PM)">Lunch Shift (10:00 AM - 4:00 PM)</option>
                <option value="Morning Shift (8:00 AM - 3:00 PM)">Morning Shift (8:00 AM - 3:00 PM)</option>
                <option value="Dinner Shift (4:00 PM - 11:00 PM)">Dinner Shift (4:00 PM - 11:00 PM)</option>
                <option value="Closing Shift (6:00 PM - 1:00 AM)">Closing Shift (6:00 PM - 1:00 AM)</option>
              </select>
            </div>

            <button
              type="button"
              disabled={isUpdatingStaffAssignment}
              onClick={handleUpdate}
              className="px-5 py-2.5 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-neutral-900 font-medium text-sm rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 transition flex items-center justify-center gap-1.5 active:scale-95 shrink-0 shadow-md cursor-pointer"
            >
              {isUpdatingStaffAssignment ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  <span>Saving...</span>
                </>
              ) : updateSuccess ? (
                <>
                  <Check className="w-4 h-4 text-black" />
                  <span>Saved</span>
                </>
              ) : (
                <span>Save Role &amp; Schedule</span>
              )}
            </button>
          </div>
        </div>

        {/* Activity */}
        <div className="p-5 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-800 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-white" />
            <h2 className="text-white text-base font-medium font-['Poppins']">
              Staff Member Metadata
            </h2>
          </div>

          <div className="w-full h-px bg-neutral-800" />

          <div className="flex flex-col gap-2.5 text-xs text-neutral-400">
            <div className="flex justify-between py-2 border-b border-neutral-800">
              <span>Account Status:</span>
              <span className="text-emerald-400 font-medium">Active System User</span>
            </div>
            <div className="flex justify-between py-2 border-b border-neutral-800">
              <span>Branch ID:</span>
              <span className="font-mono text-neutral-300">{staffMember?.branchId || getActiveBranchId()}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-neutral-800">
              <span>Assigned Date:</span>
              <span className="text-neutral-300">
                {staffMember?.assignedAt ? new Date(staffMember.assignedAt).toLocaleDateString() : 'Active Assignment'}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span>Role Privilege:</span>
              <span className="text-yellow-400 font-semibold">{displayRole}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
