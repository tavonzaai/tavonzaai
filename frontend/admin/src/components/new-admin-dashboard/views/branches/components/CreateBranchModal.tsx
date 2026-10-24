import React, { useState, useEffect, useMemo } from 'react';
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
import { RestaurantItem } from '../../../types';
import { BranchFormData } from '../types';
import { useBranchManagers } from '@/lib/useBranchManagers';
import { getAvailableTimezones, getDefaultClientTimezone } from '@/lib/utils';

interface CreateBranchModalProps {
  restaurants: RestaurantItem[];
  branchId?: string;
  onClose: () => void;
  onSubmit: (form: BranchFormData) => void;
  submitting?: boolean;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const CreateBranchModal: React.FC<CreateBranchModalProps> = ({
  restaurants,
  branchId,
  onClose,
  onSubmit,
  submitting = false,
}) => {
  const { managerUsers, isLoading: loadingManagers } = useBranchManagers(branchId);
  const availableTimezones = useMemo(() => getAvailableTimezones(), []);
  const detectedTimezone = useMemo(() => getDefaultClientTimezone(), []);

  const [createForm, setCreateForm] = useState<BranchFormData>({
    restaurantId: restaurants[0]?.id || '',
    restaurantName: restaurants[0]?.name || '',
    name: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    phone: '',
    timezone: detectedTimezone || '',
    manager: '',
    managerId: '',
    status: 'Active',
    openingTime: '09:00',
    closingTime: '23:00',
  });

  const [isCustomRestId, setIsCustomRestId] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (managerUsers.length > 0 && !createForm.manager) {
      setCreateForm((prev) => ({
        ...prev,
        manager: prev.manager || managerUsers[0].name,
        managerId: prev.managerId || managerUsers[0].id,
      }));
    }
  }, [managerUsers, createForm.manager]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!createForm.restaurantId?.trim()) {
      setErrorMsg('Please select or enter a valid Restaurant ID.');
      return;
    }

    if (!createForm.name.trim() || createForm.name.trim().length < 2) {
      setErrorMsg('Branch name must be at least 2 characters long.');
      return;
    }

    if (!createForm.street.trim()) {
      setErrorMsg('Street address is required by the backend API.');
      return;
    }

    if (!createForm.city.trim()) {
      setErrorMsg('City is required by the backend API.');
      return;
    }

    if (!createForm.country.trim()) {
      setErrorMsg('Country is required by the backend API.');
      return;
    }

    // Populate legacy compatibility address string
    const fullAddress = [
      createForm.street.trim(),
      createForm.city.trim(),
      createForm.state?.trim(),
      createForm.postalCode?.trim(),
      createForm.country.trim(),
    ]
      .filter(Boolean)
      .join(', ');

    onSubmit({
      ...createForm,
      address: fullAddress,
      contactNumber: createForm.phone || createForm.contactNumber,
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
              <span>Create New Branch</span>
            </h3>
            <p className="text-neutral-400 text-xs font-normal font-sans leading-4">
              Enter branch details matching Tavonza backend specification (<code className="text-amber-400/90">POST /branches</code>).
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
            {/* 1. Restaurant Selection */}
            <div className="flex flex-col justify-start items-start gap-1.5">
              <div className="flex items-center justify-between w-full">
                <label className="text-stone-300 text-xs font-medium font-sans flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Restaurant</span>
                  <span className="text-amber-400">*</span>
                  <span className="text-[10px] text-zinc-500 font-normal">(Parent Restaurant)</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsCustomRestId((prev) => !prev)}
                  className="text-[11px] text-yellow-400 hover:underline cursor-pointer"
                >
                  {isCustomRestId ? '← Select from list' : 'Enter custom UUID →'}
                </button>
              </div>

              {isCustomRestId ? (
                <input
                  type="text"
                  required
                  placeholder="e.g. 293d1f74-9ad6-437c-b5dc-7bc362d43554"
                  value={createForm.restaurantId}
                  onChange={(e) => {
                    setErrorMsg(null);
                    setCreateForm({ ...createForm, restaurantId: e.target.value });
                  }}
                  className="w-full h-10 px-3.5 bg-neutral-900 rounded-lg border border-neutral-800 text-stone-200 text-xs font-mono focus:outline-none focus:border-amber-400 placeholder:text-zinc-600"
                />
              ) : (
                <div className="w-full relative">
                  <select
                    value={createForm.restaurantId}
                    onChange={(e) => {
                      setErrorMsg(null);
                      const selected = restaurants.find((r) => r.id === e.target.value);
                      setCreateForm({
                        ...createForm,
                        restaurantId: e.target.value,
                        restaurantName: selected ? selected.name : createForm.restaurantName,
                      });
                    }}
                    className="w-full h-10 px-3 bg-neutral-900 rounded-lg border border-neutral-800 text-stone-200 text-xs font-sans appearance-none focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    {restaurants.length === 0 ? (
                      <option value="">No restaurants found</option>
                    ) : (
                      restaurants.map((rest) => (
                        <option key={rest.id} value={rest.id}>
                          {rest.name} ({rest.id.slice(0, 8)}...)
                        </option>
                      ))
                    )}
                  </select>
                  <ChevronDown className="size-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              )}
            </div>

            {/* 2. Branch Name */}
            <div className="flex flex-col justify-start items-start gap-1.5">
              <label className="text-stone-300 text-xs font-medium font-sans flex items-center gap-1">
                <span>Branch Name</span>
                <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                required
                minLength={2}
                data-testid="branch-name"
                placeholder="e.g. Downtown Flagship & Patio"
                value={createForm.name}
                onChange={(e) => {
                  setErrorMsg(null);
                  setCreateForm({ ...createForm, name: e.target.value });
                }}
                className="w-full h-10 px-3.5 bg-neutral-900 rounded-lg border border-neutral-800 text-stone-200 text-sm focus:outline-none focus:border-amber-400 font-sans placeholder:text-zinc-600"
              />
            </div>

            {/* 3. Physical Address Section (CreateBranchDto.address) */}
            <div className="w-full p-3.5 bg-neutral-900/80 rounded-xl border border-neutral-800/90 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-stone-300 text-xs font-semibold font-sans">
                <MapPin className="w-4 h-4 text-amber-400" />
                <span>Physical Address</span>
                <span className="text-[10px] text-zinc-500 font-normal">(Required object)</span>
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
                  placeholder="e.g. 123 Main Street, Suite 400"
                  value={createForm.street}
                  onChange={(e) => {
                    setErrorMsg(null);
                    setCreateForm({ ...createForm, street: e.target.value });
                  }}
                  className="w-full h-9 px-3 bg-neutral-950 rounded-lg border border-neutral-800 text-stone-200 text-xs focus:outline-none focus:border-amber-400 font-sans placeholder:text-zinc-600"
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
                    value={createForm.city}
                    onChange={(e) => {
                      setErrorMsg(null);
                      setCreateForm({ ...createForm, city: e.target.value });
                    }}
                    className="w-full h-9 px-3 bg-neutral-950 rounded-lg border border-neutral-800 text-stone-200 text-xs focus:outline-none focus:border-amber-400 font-sans placeholder:text-zinc-600"
                  />
                </div>

                <div className="flex flex-col justify-start items-start gap-1">
                  <label className="text-stone-400 text-[11px] font-sans">
                    <span>State / Province</span>
                    <span className="text-[10px] text-zinc-500 font-normal ml-1">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. TX"
                    value={createForm.state || ''}
                    onChange={(e) => setCreateForm({ ...createForm, state: e.target.value })}
                    className="w-full h-9 px-3 bg-neutral-950 rounded-lg border border-neutral-800 text-stone-200 text-xs focus:outline-none focus:border-amber-400 font-sans placeholder:text-zinc-600"
                  />
                </div>
              </div>

              {/* Postal Code & Country */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col justify-start items-start gap-1">
                  <label className="text-stone-400 text-[11px] font-sans">
                    <span>Postal / ZIP Code</span>
                    <span className="text-[10px] text-zinc-500 font-normal ml-1">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 78701"
                    value={createForm.postalCode || ''}
                    onChange={(e) => setCreateForm({ ...createForm, postalCode: e.target.value })}
                    className="w-full h-9 px-3 bg-neutral-950 rounded-lg border border-neutral-800 text-stone-200 text-xs font-mono focus:outline-none focus:border-amber-400 placeholder:text-zinc-600"
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
                    value={createForm.country}
                    onChange={(e) => {
                      setErrorMsg(null);
                      setCreateForm({ ...createForm, country: e.target.value });
                    }}
                    className="w-full h-9 px-3 bg-neutral-950 rounded-lg border border-neutral-800 text-stone-200 text-xs focus:outline-none focus:border-amber-400 font-sans placeholder:text-zinc-600"
                  />
                </div>
              </div>
            </div>

            {/* 4. Phone & Timezone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col justify-start items-start gap-1.5">
                <label className="text-stone-300 text-xs font-medium font-sans flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Phone Number</span>
                  <span className="text-[10px] text-zinc-500 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. +1-512-555-0199"
                  value={createForm.phone || ''}
                  onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                  className="w-full h-10 px-3.5 bg-neutral-900 rounded-lg border border-neutral-800 text-stone-200 text-xs font-mono focus:outline-none focus:border-amber-400 placeholder:text-zinc-600"
                />
              </div>

              <div className="flex flex-col justify-start items-start gap-1.5">
                <label className="text-stone-300 text-xs font-medium font-sans flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Timezone</span>
                  <span className="text-[10px] text-zinc-500 font-normal">
                    {detectedTimezone ? `(Detected: ${detectedTimezone})` : '(e.g. UTC)'}
                  </span>
                </label>
                <div className="w-full relative">
                  <input
                    list="dynamic-timezones-branches-create"
                    type="text"
                    placeholder={detectedTimezone ? `Detected: ${detectedTimezone}` : 'Type or select timezone (e.g. UTC)'}
                    value={createForm.timezone || ''}
                    onChange={(e) => setCreateForm({ ...createForm, timezone: e.target.value })}
                    className="w-full h-10 px-3.5 bg-neutral-900 rounded-lg border border-neutral-800 text-stone-200 text-xs font-sans focus:outline-none focus:border-amber-400 placeholder:text-zinc-600"
                  />
                  {availableTimezones.length > 0 && (
                    <datalist id="dynamic-timezones-branches-create">
                      {availableTimezones.map((tz) => (
                        <option key={tz} value={tz} />
                      ))}
                    </datalist>
                  )}
                </div>
              </div>
            </div>

            {/* 5. Branch Manager & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col justify-start items-start gap-1.5">
                <label className="text-stone-300 text-xs font-medium font-sans flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Branch Manager</span>
                </label>
                <div className="w-full relative">
                  <select
                    value={createForm.manager}
                    onChange={(e) => {
                      const selected = managerUsers.find(
                        (u) => u.name === e.target.value || u.id === e.target.value,
                      );
                      setCreateForm({
                        ...createForm,
                        manager: selected ? selected.name : e.target.value,
                        managerId: selected ? selected.id : undefined,
                      });
                    }}
                    className="w-full h-10 px-3 bg-neutral-900 rounded-lg border border-neutral-800 text-stone-300 text-xs font-sans appearance-none focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
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
                    value={createForm.status}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
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

            {/* 6. Operating Hours */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col justify-start items-start gap-1.5">
                <label className="text-stone-300 text-xs font-medium font-sans flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Opening Time</span>
                </label>
                <input
                  type="time"
                  value={createForm.openingTime}
                  onChange={(e) => setCreateForm({ ...createForm, openingTime: e.target.value })}
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
                  value={createForm.closingTime}
                  onChange={(e) => setCreateForm({ ...createForm, closingTime: e.target.value })}
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
              data-testid="branch-submit"
              className="px-4 py-2.5 bg-yellow-400 hover:bg-yellow-300 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 text-neutral-900 text-sm font-semibold font-sans transition-colors cursor-pointer shadow-sm disabled:opacity-60"
            >
              {submitting ? 'Creating Branch…' : 'Create Branch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
