import React, { useState, useMemo } from 'react';
import {
  X,
  ChevronDown,
  Building2,
  MapPin,
  Phone,
  Globe,
  Clock,
  UserCheck,
  AlertCircle,
} from 'lucide-react';
import { RestaurantItem, BranchItem } from '../../../types';
import { BranchFormData } from '../types';
import { useBranchManagers } from '@/lib/useBranchManagers';
import { parseBranchAddress } from '@/lib/admin-mappers';
import { getAvailableTimezones, getDefaultClientTimezone } from '@/lib/utils';

interface EditBranchModalProps {
  branch: BranchItem;
  restaurants: RestaurantItem[];
  onClose: () => void;
  onSubmit: (form: BranchFormData) => void;
  submitting?: boolean;
}

export const EditBranchModal: React.FC<EditBranchModalProps> = ({
  branch,
  restaurants,
  onClose,
  onSubmit,
  submitting = false,
}) => {
  const { managerUsers, isLoading: loadingManagers } = useBranchManagers(branch.id);
  const availableTimezones = useMemo(() => getAvailableTimezones(), []);
  const detectedTimezone = useMemo(() => getDefaultClientTimezone(), []);
  const initialAddr = parseBranchAddress((branch as any).address || branch.location);

  const [editForm, setEditForm] = useState<BranchFormData>({
    restaurantId: branch.restaurantId,
    restaurantName: branch.restaurantName,
    name: branch.name,
    street: initialAddr.street || '',
    city: initialAddr.city || '',
    state: initialAddr.state || '',
    postalCode: initialAddr.postalCode || '',
    country: initialAddr.country || '',
    phone: branch.contactNumber || (branch as any).phone || '',
    timezone: (branch as any).timezone || detectedTimezone || '',
    address: branch.location,
    contactNumber: branch.contactNumber || (branch as any).phone || '',
    manager: branch.manager,
    managerId: '',
    status: (branch.status as 'Active' | 'Setup' | 'Closed') || 'Active',
    openingTime: branch.openingTime || '09:00',
    closingTime: branch.closingTime || '23:00',
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!editForm.name.trim() || editForm.name.trim().length < 2) {
      setErrorMsg('Branch name must be at least 2 characters long.');
      return;
    }

    if (!editForm.street.trim()) {
      setErrorMsg('Street address is required.');
      return;
    }

    if (!editForm.city.trim()) {
      setErrorMsg('City is required.');
      return;
    }

    if (!editForm.country.trim()) {
      setErrorMsg('Country is required.');
      return;
    }

    const fullAddress = [
      editForm.street.trim(),
      editForm.city.trim(),
      editForm.state?.trim(),
      editForm.postalCode?.trim(),
      editForm.country.trim(),
    ]
      .filter(Boolean)
      .join(', ');

    onSubmit({
      ...editForm,
      address: fullAddress,
      contactNumber: editForm.phone || editForm.contactNumber,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-[660px] max-w-full my-auto p-5 bg-neutral-900 rounded-2xl outline outline-1 outline-offset-[-1px] outline-neutral-800 flex flex-col justify-start items-end gap-4 shadow-2xl animate-in fade-in scale-95 duration-150">
        {/* Modal Header */}
        <div className="w-full flex justify-between items-start">
          <div className="flex flex-col justify-start items-start gap-1">
            <h3 className="text-white text-lg font-semibold font-sans leading-5 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-yellow-400" />
              <span>Edit Branch</span>
            </h3>
            <p className="text-neutral-400 text-xs font-normal font-sans leading-4">
              Update branch profile, address, operating hours, and manager.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 p-2 bg-neutral-800 hover:bg-neutral-750 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 flex justify-center items-center text-gray-200 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="w-full h-0 outline outline-1 outline-offset-[-0.50px] outline-neutral-800" />

        {errorMsg && (
          <div className="w-full p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <div className="w-full p-4 bg-neutral-950/70 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-800/80 flex flex-col gap-4 max-h-[70vh] overflow-y-auto pr-2">
            {/* 1. Restaurant & Branch Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col justify-start items-start gap-1.5">
                <label className="text-stone-300 text-xs font-medium font-sans flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Restaurant</span>
                </label>
                <div className="w-full relative">
                  <select
                    value={editForm.restaurantId}
                    onChange={(e) => {
                      const selected = restaurants.find((r) => r.id === e.target.value);
                      setEditForm({
                        ...editForm,
                        restaurantId: e.target.value,
                        restaurantName: selected ? selected.name : editForm.restaurantName,
                      });
                    }}
                    className="w-full h-10 px-3 bg-neutral-900 rounded-lg border border-neutral-800 text-stone-200 text-xs font-sans appearance-none focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    {restaurants.map((rest) => (
                      <option key={rest.id} value={rest.id}>
                        {rest.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="size-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div className="flex flex-col justify-start items-start gap-1.5">
                <label className="text-stone-300 text-xs font-medium font-sans flex items-center gap-1">
                  <span>Branch Name</span>
                  <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full h-10 px-3.5 bg-neutral-900 rounded-lg border border-neutral-800 text-stone-200 text-sm focus:outline-none focus:border-amber-400 font-sans"
                />
              </div>
            </div>

            {/* 2. Physical Address */}
            <div className="w-full p-3.5 bg-neutral-900/80 rounded-xl border border-neutral-800/90 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-stone-300 text-xs font-semibold font-sans">
                <MapPin className="w-4 h-4 text-amber-400" />
                <span>Physical Address</span>
              </div>

              {/* Street */}
              <div className="flex flex-col justify-start items-start gap-1">
                <label className="text-stone-400 text-[11px] font-sans flex items-center gap-1">
                  <span>Street Address</span>
                  <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 123 Main Street"
                  value={editForm.street}
                  onChange={(e) => setEditForm({ ...editForm, street: e.target.value })}
                  className="w-full h-9 px-3 bg-neutral-950 rounded-lg border border-neutral-800 text-stone-200 text-xs focus:outline-none focus:border-amber-400 font-sans"
                />
              </div>

              {/* City & State */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col justify-start items-start gap-1">
                  <label className="text-stone-400 text-[11px] font-sans flex items-center gap-1">
                    <span>City</span>
                    <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Austin"
                    value={editForm.city}
                    onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                    className="w-full h-9 px-3 bg-neutral-950 rounded-lg border border-neutral-800 text-stone-200 text-xs focus:outline-none focus:border-amber-400 font-sans"
                  />
                </div>

                <div className="flex flex-col justify-start items-start gap-1">
                  <label className="text-stone-400 text-[11px] font-sans">State / Province</label>
                  <input
                    type="text"
                    placeholder="e.g. TX"
                    value={editForm.state || ''}
                    onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                    className="w-full h-9 px-3 bg-neutral-950 rounded-lg border border-neutral-800 text-stone-200 text-xs focus:outline-none focus:border-amber-400 font-sans"
                  />
                </div>
              </div>

              {/* Postal Code & Country */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col justify-start items-start gap-1">
                  <label className="text-stone-400 text-[11px] font-sans">Postal / ZIP Code</label>
                  <input
                    type="text"
                    placeholder="e.g. 78701"
                    value={editForm.postalCode || ''}
                    onChange={(e) => setEditForm({ ...editForm, postalCode: e.target.value })}
                    className="w-full h-9 px-3 bg-neutral-950 rounded-lg border border-neutral-800 text-stone-200 text-xs font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="flex flex-col justify-start items-start gap-1">
                  <label className="text-stone-400 text-[11px] font-sans flex items-center gap-1">
                    <span>Country</span>
                    <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. USA"
                    value={editForm.country}
                    onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                    className="w-full h-9 px-3 bg-neutral-950 rounded-lg border border-neutral-800 text-stone-200 text-xs focus:outline-none focus:border-amber-400 font-sans"
                  />
                </div>
              </div>
            </div>

            {/* 3. Phone & Timezone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col justify-start items-start gap-1.5">
                <label className="text-stone-300 text-xs font-medium font-sans flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Phone Number</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. +1-512-555-0199"
                  value={editForm.phone || ''}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full h-10 px-3.5 bg-neutral-900 rounded-lg border border-neutral-800 text-stone-200 text-xs font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex flex-col justify-start items-start gap-1.5">
                <label className="text-stone-300 text-xs font-medium font-sans flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Timezone</span>
                </label>
                <div className="w-full relative">
                  <input
                    list="dynamic-timezones-branches-edit"
                    type="text"
                    placeholder={detectedTimezone ? `Detected: ${detectedTimezone}` : 'Type or select timezone (e.g. UTC)'}
                    value={editForm.timezone || ''}
                    onChange={(e) => setEditForm({ ...editForm, timezone: e.target.value })}
                    className="w-full h-10 px-3.5 bg-neutral-900 rounded-lg border border-neutral-800 text-stone-200 text-xs font-sans focus:outline-none focus:border-amber-400 placeholder:text-zinc-600"
                  />
                  {availableTimezones.length > 0 && (
                    <datalist id="dynamic-timezones-branches-edit">
                      {availableTimezones.map((tz) => (
                        <option key={tz} value={tz} />
                      ))}
                    </datalist>
                  )}
                </div>
              </div>
            </div>

            {/* 4. Branch Manager & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col justify-start items-start gap-1.5">
                <label className="text-stone-300 text-xs font-medium font-sans flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Branch Manager</span>
                </label>
                <div className="w-full relative">
                  <select
                    value={editForm.manager}
                    onChange={(e) => {
                      const selected = managerUsers.find(
                        (u) => u.name === e.target.value || u.id === e.target.value,
                      );
                      setEditForm({
                        ...editForm,
                        manager: selected ? selected.name : e.target.value,
                        managerId: selected ? selected.id : undefined,
                      });
                    }}
                    className="w-full h-10 px-3 bg-neutral-900 rounded-lg border border-neutral-800 text-stone-300 text-xs font-sans appearance-none focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    {editForm.manager &&
                      !managerUsers.some((u) => u.name === editForm.manager) && (
                        <option value={editForm.manager}>
                          {editForm.manager} (Current)
                        </option>
                      )}
                    {loadingManagers ? (
                      <option value="" disabled>Loading managers from API...</option>
                    ) : managerUsers.length === 0 ? (
                      <option value="" disabled>No users with manager role found</option>
                    ) : (
                      managerUsers.map((user) => (
                        <option key={user.id} value={user.name}>
                          {user.name} ({user.roleLabel})
                        </option>
                      ))
                    )}
                  </select>
                  <ChevronDown className="size-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div className="flex flex-col justify-start items-start gap-1.5">
                <label className="text-stone-300 text-xs font-medium font-sans">Status</label>
                <div className="w-full relative">
                  <select
                    value={editForm.status}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        status: e.target.value as 'Active' | 'Setup' | 'Closed',
                      })
                    }
                    className="w-full h-10 px-3 bg-neutral-900 rounded-lg border border-neutral-800 text-stone-300 text-xs font-sans appearance-none focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Setup">Setup</option>
                    <option value="Closed">Closed</option>
                  </select>
                  <ChevronDown className="size-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* 5. Operating Hours */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col justify-start items-start gap-1.5">
                <label className="text-stone-300 text-xs font-medium font-sans flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Opening Time</span>
                </label>
                <input
                  type="time"
                  value={editForm.openingTime}
                  onChange={(e) => setEditForm({ ...editForm, openingTime: e.target.value })}
                  className="w-full h-10 px-3.5 bg-neutral-900 rounded-lg border border-neutral-800 text-stone-200 text-xs font-sans focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex flex-col justify-start items-start gap-1.5">
                <label className="text-stone-300 text-xs font-medium font-sans flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Closing Time</span>
                </label>
                <input
                  type="time"
                  value={editForm.closingTime}
                  onChange={(e) => setEditForm({ ...editForm, closingTime: e.target.value })}
                  className="w-full h-10 px-3.5 bg-neutral-900 rounded-lg border border-neutral-800 text-stone-200 text-xs font-sans focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>

          {/* Modal Footer Buttons */}
          <div className="inline-flex justify-end items-center gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 text-white text-sm font-medium font-sans transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2.5 bg-yellow-400 hover:bg-yellow-300 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 text-neutral-900 text-sm font-semibold font-sans transition-colors cursor-pointer shadow-sm disabled:opacity-60"
            >
              {submitting ? 'Saving Changes…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
