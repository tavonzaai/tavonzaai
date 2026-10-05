'use client';

import React, { useState } from 'react';
import { X, UserPlus, Lock, Mail, User, Phone, ShieldCheck, Check } from 'lucide-react';
import { branchManagerService, getActiveBranchId, CreateStaffPayload } from '../../../redux/features/branchManagerApi';

interface AddStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStaffCreated: () => void;
}

const AVAILABLE_ROLES = [
  { value: 'WAITER', label: 'Waiter / Server', defaultPerms: ['VIEW_ORDERS', 'UPDATE_ORDER_STATUS', 'MANAGE_TABLES'] },
  { value: 'KITCHEN_STAFF', label: 'Kitchen / Line Cook', defaultPerms: ['VIEW_ORDERS', 'UPDATE_ORDER_STATUS'] },
  { value: 'CASHIER', label: 'Cashier / POS Operator', defaultPerms: ['MANAGE_PAYMENTS', 'VIEW_ORDERS', 'APPLY_DISCOUNTS'] },
  { value: 'BARTENDER', label: 'Bartender', defaultPerms: ['VIEW_ORDERS', 'UPDATE_ORDER_STATUS'] },
  { value: 'BRANCH_MANAGER', label: 'Assistant Branch Manager', defaultPerms: ['MANAGE_MENU', 'MANAGE_TABLES', 'MANAGE_STAFF', 'VIEW_ORDERS', 'UPDATE_ORDER_STATUS', 'MANAGE_PAYMENTS', 'VIEW_REPORTS'] },
];

const ALL_PERMISSIONS = [
  { key: 'VIEW_ORDERS', label: 'View Orders' },
  { key: 'UPDATE_ORDER_STATUS', label: 'Update Order Status' },
  { key: 'MANAGE_TABLES', label: 'Manage Tables & Seating' },
  { key: 'MANAGE_PAYMENTS', label: 'Manage Payments & Settlements' },
  { key: 'APPLY_DISCOUNTS', label: 'Apply Discounts & Comps' },
  { key: 'MANAGE_MENU', label: 'Manage Menu Items' },
  { key: 'MANAGE_STAFF', label: 'Manage Staff Roster' },
  { key: 'VIEW_REPORTS', label: 'View Analytics & Reports' },
];

export default function AddStaffModal({ isOpen, onClose, onStaffCreated }: AddStaffModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedRole, setSelectedRole] = useState('WAITER');
  const [permissions, setPermissions] = useState<string[]>(['VIEW_ORDERS', 'UPDATE_ORDER_STATUS', 'MANAGE_TABLES']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRoleChange = (newRole: string) => {
    setSelectedRole(newRole);
    const roleDef = AVAILABLE_ROLES.find((r) => r.value === newRole);
    if (roleDef) {
      setPermissions(roleDef.defaultPerms);
    }
  };

  const togglePermission = (permKey: string) => {
    setPermissions((prev) =>
      prev.includes(permKey) ? prev.filter((p) => p !== permKey) : [...prev, permKey]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Staff member full name is required');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('A valid work email is required');
      return;
    }
    if (!password || password.length < 8) {
      setError('Temporary password must be at least 8 characters long');
      return;
    }

    try {
      setLoading(true);
      const branchId = getActiveBranchId();
      const payload: CreateStaffPayload = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        phone: phone.trim() || undefined,
        role: selectedRole,
        permissions,
      };

      await branchManagerService.createStaff(branchId, payload);
      onStaffCreated();
      onClose();
      // Reset form
      setName('');
      setEmail('');
      setPassword('');
      setPhone('');
      setSelectedRole('WAITER');
      setPermissions(['VIEW_ORDERS', 'UPDATE_ORDER_STATUS', 'MANAGE_TABLES']);
    } catch (err: any) {
      console.error('Failed to create staff member:', err);
      setError(err?.message || 'Failed to create staff member. Verify email is unique.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-6 sm:p-7 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center text-yellow-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white font-['Poppins']">Add New Staff Member</h2>
              <p className="text-xs text-neutral-400 font-['Inter']">
                Create login credentials and assign branch station permissions
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-['Inter']">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4 font-['Inter']">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">Full Name *</label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-neutral-500" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Maria Gonzalez"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-neutral-950/80 border border-neutral-800 rounded-xl text-white text-sm focus:outline-none focus:border-yellow-400/60"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">Work Email *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-neutral-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="staff@tavonza.ai"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-neutral-950/80 border border-neutral-800 rounded-xl text-white text-sm focus:outline-none focus:border-yellow-400/60"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">Initial Password * (min 8 chars)</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-neutral-500" />
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-neutral-950/80 border border-neutral-800 rounded-xl text-white text-sm focus:outline-none focus:border-yellow-400/60"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">Phone Number (optional)</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 w-4 h-4 text-neutral-500" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-neutral-950/80 border border-neutral-800 rounded-xl text-white text-sm focus:outline-none focus:border-yellow-400/60"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">Assign Branch Role *</label>
            <select
              value={selectedRole}
              onChange={(e) => handleRoleChange(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-neutral-950/80 border border-neutral-800 rounded-xl text-white text-sm focus:outline-none focus:border-yellow-400/60 cursor-pointer"
            >
              {AVAILABLE_ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-yellow-400" />
              <label className="text-xs font-medium text-neutral-300">Role Permissions</label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 bg-neutral-950/60 border border-neutral-800 rounded-xl max-h-44 overflow-y-auto">
              {ALL_PERMISSIONS.map((perm) => {
                const checked = permissions.includes(perm.key);
                return (
                  <label
                    key={perm.key}
                    onClick={() => togglePermission(perm.key)}
                    className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-neutral-800/60 cursor-pointer text-xs transition"
                  >
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center transition ${
                        checked ? 'bg-yellow-400 border-yellow-400 text-neutral-950' : 'border-neutral-600 bg-transparent'
                      }`}
                    >
                      {checked && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span className={checked ? 'text-white' : 'text-neutral-400'}>{perm.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-neutral-950 font-semibold text-sm rounded-xl shadow-lg transition active:scale-95 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin" />
                  <span>Creating Staff...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Create Staff Member</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
