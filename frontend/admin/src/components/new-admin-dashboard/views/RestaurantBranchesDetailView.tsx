'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Plus,
  GitBranch,
  Pencil,
  Trash2,
  X,
  ChevronDown,
  Building2,
  MapPin,
  Clock,
  Phone,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import { RestaurantItem, BranchItem } from '../types';
import { MOCK_BRANCHES } from '../data';

interface RestaurantBranchesDetailViewProps {
  restaurant: RestaurantItem;
  onBack: () => void;
  onOpenBranchDashboard?: (branch: BranchItem) => void;
}

export default function RestaurantBranchesDetailView({
  restaurant,
  onBack,
  onOpenBranchDashboard,
}: RestaurantBranchesDetailViewProps) {
  const router = useRouter();
  // Load branches associated with this restaurant
  const [branches, setBranches] = useState<BranchItem[]>(() => {
    const matched = MOCK_BRANCHES.filter(
      (b) =>
        b.restaurantId === restaurant.id ||
        b.restaurantName.toLowerCase().includes(restaurant.name.toLowerCase().slice(0, 7))
    );
    if (matched.length > 0) return matched;
    // Fallback default branches for any restaurant
    return [
      {
        id: `br-${restaurant.id}-1`,
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        name: 'Georgia Flagship',
        location: restaurant.address || 'Cusseta, Georgia',
        manager: 'Nobin Mille',
        hours: '09:00–23:00',
        openingTime: '09:00',
        closingTime: '23:00',
        contactNumber: '992548756',
        tablesCount: 18,
        occupancy: 78,
        status: 'Active',
      },
      {
        id: `br-${restaurant.id}-2`,
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        name: 'Florida Flagship',
        location: 'Pompano Beach, Florida',
        manager: 'Samira Khan',
        hours: '10:00–22:30',
        openingTime: '10:00',
        closingTime: '22:30',
        contactNumber: '+19545558910',
        tablesCount: 14,
        occupancy: 64,
        status: 'Active',
      },
    ];
  });

  // Modal States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<BranchItem | null>(null);
  const [deletingBranch, setDeletingBranch] = useState<BranchItem | null>(null);

  // Create Form State
  const [createForm, setCreateForm] = useState({
    name: '',
    address: 'Cusseta, Georgia',
    contactNumber: '992548756',
    manager: 'Nobin Mille',
    status: 'Active' as 'Active' | 'Setup' | 'Closed',
    openingTime: '09:00',
    closingTime: '23:00',
  });

  // Edit Form State
  const [editForm, setEditForm] = useState({
    name: '',
    address: '',
    contactNumber: '',
    manager: '',
    status: 'Active' as 'Active' | 'Setup' | 'Closed',
    openingTime: '09:00',
    closingTime: '23:00',
  });

  // Open Edit Modal
  const handleOpenEdit = (branch: BranchItem) => {
    setEditingBranch(branch);
    setEditForm({
      name: branch.name,
      address: branch.location,
      contactNumber: branch.contactNumber || '992548756',
      manager: branch.manager,
      status: (branch.status as 'Active' | 'Setup' | 'Closed') || 'Active',
      openingTime: branch.openingTime || '09:00',
      closingTime: branch.closingTime || '23:00',
    });
  };

  // Submit Create Branch
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name.trim()) {
      toast.error('Please enter a branch name.');
      return;
    }

    const newBranch: BranchItem = {
      id: `br-${Date.now()}`,
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      name: createForm.name.trim(),
      location: createForm.address.trim() || 'Cusseta, Georgia',
      manager: createForm.manager,
      hours: `${createForm.openingTime}–${createForm.closingTime}`,
      openingTime: createForm.openingTime,
      closingTime: createForm.closingTime,
      contactNumber: createForm.contactNumber,
      status: createForm.status,
      tablesCount: 16,
      occupancy: 60,
      kitchenSync: 'Online',
      monthlyRevenue: '$45,000',
    };

    setBranches([newBranch, ...branches]);
    setIsCreateOpen(false);
    setCreateForm({
      name: '',
      address: 'Cusseta, Georgia',
      contactNumber: '992548756',
      manager: 'Nobin Mille',
      status: 'Active',
      openingTime: '09:00',
      closingTime: '23:00',
    });
    toast.success(`Branch "${newBranch.name}" created successfully!`);
  };

  // Submit Edit Branch
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBranch) return;
    if (!editForm.name.trim()) {
      toast.error('Branch name cannot be empty.');
      return;
    }

    setBranches((prev) =>
      prev.map((b) =>
        b.id === editingBranch.id
          ? {
              ...b,
              name: editForm.name.trim(),
              location: editForm.address.trim(),
              contactNumber: editForm.contactNumber,
              manager: editForm.manager,
              status: editForm.status,
              openingTime: editForm.openingTime,
              closingTime: editForm.closingTime,
              hours: `${editForm.openingTime}–${editForm.closingTime}`,
            }
          : b
      )
    );
    toast.success(`Branch "${editForm.name}" updated successfully!`);
    setEditingBranch(null);
  };

  // Confirm Delete Branch
  const handleConfirmDelete = () => {
    if (!deletingBranch) return;
    const deletedName = deletingBranch.name;
    setBranches((prev) => prev.filter((b) => b.id !== deletingBranch.id));
    toast.success(`"${deletedName}" branch permanently deleted.`);
    setDeletingBranch(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Navigation Row: Back Button */}
      <div className="flex items-center gap-1">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 cursor-pointer group text-neutral-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="size-4 text-neutral-400 group-hover:text-white transition-colors" />
          <span className="text-neutral-400 group-hover:text-white text-xs font-semibold font-sans leading-4">
            Back
          </span>
        </button>
      </div>

      {/* Header Row: Title & Create Branch Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col justify-start items-start gap-1">
          <h1 className="text-white text-3xl font-semibold font-sans leading-9">
            {restaurant.name}
          </h1>
          <p className="text-zinc-500 text-sm font-normal font-sans leading-6">
            Restaurant details and branch management.
          </p>
        </div>

        <div className="flex justify-end items-start gap-2">
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-3 py-2.5 bg-yellow-400 hover:bg-yellow-300 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 flex justify-start items-center gap-1.5 transition-all text-neutral-800 text-base font-medium font-sans leading-5 shadow-sm cursor-pointer"
          >
            <Plus className="size-4 stroke-[2.5] text-neutral-900" />
            <span>Create Branch</span>
          </button>
        </div>
      </div>

      {/* Restaurant Summary Card matching Figma spec */}
      <div className="w-full px-4 py-3.5 bg-neutral-900 rounded-xl inline-flex flex-col justify-start items-start gap-3 outline outline-1 outline-offset-[-1px] outline-neutral-800 shadow-lg">
        <div className="self-stretch inline-flex justify-between items-center gap-3">
          <div className="flex-1 inline-flex flex-col justify-start items-start gap-1.5">
            <div className="self-stretch inline-flex justify-start items-center gap-3">
              <span className="text-white text-lg font-semibold font-sans">
                {restaurant.description || 'Modern all-day dining with seasonal plates.'}
              </span>
              <div className="px-2.5 py-1 bg-green-500/10 rounded-md outline outline-1 outline-offset-[-1px] outline-green-500 flex justify-center items-center gap-2.5">
                <span className="text-center text-green-500 text-xs font-medium font-sans leading-4">
                  {restaurant.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="self-stretch inline-flex flex-wrap justify-start items-start gap-4 text-stone-400 text-sm font-normal font-sans tracking-wide">
          <span>{restaurant.email || 'hello@tavonza.com'}</span>
          <span>{restaurant.contactNumber || '+4045017715'}</span>
          <span>{restaurant.address || 'Cusseta, Georgia'}</span>
        </div>
      </div>

      {/* Manage Branches Section Title */}
      <div className="flex flex-col justify-start items-start gap-1 pt-2">
        <h2 className="text-white text-lg font-semibold font-sans">
          Manage Branches
        </h2>
        <p className="text-zinc-500 text-sm font-normal font-sans leading-6">
          {branches.length} locations connected to this restaurant
        </p>
      </div>

      {/* Branch Cards Row matching user snippet */}
      <div className="flex flex-wrap items-start gap-5">
        {branches.map((branch) => {
          const isActive = branch.status === 'Active';

          return (
            <div
              key={branch.id}
              className="w-full sm:w-[360px] p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-800 inline-flex flex-col justify-start items-start gap-4 transition-all hover:border-neutral-700 shadow-xl"
            >
              {/* Branch Header: Icon + Name & Location + Status Badge */}
              <div className="self-stretch inline-flex justify-start items-center gap-3">
                <div className="px-2.5 py-2 bg-yellow-500/10 rounded-lg flex justify-center items-center">
                  <GitBranch className="size-4 text-yellow-500" />
                </div>

                <div className="flex-1 flex justify-between items-center">
                  <div className="flex-1 flex flex-col justify-start items-start gap-0.5">
                    <h3 className="self-stretch text-white text-lg font-medium font-sans leading-5">
                      {branch.name}
                    </h3>
                    <span className="self-stretch text-neutral-400 text-xs font-normal font-sans leading-4">
                      {branch.location}
                    </span>
                  </div>

                  <div className="px-2.5 py-2 bg-green-500/10 rounded-lg flex justify-center items-center gap-2.5">
                    <span className="text-center text-green-500 text-xs font-medium font-sans leading-4">
                      {branch.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="self-stretch h-0 outline outline-1 outline-offset-[-0.50px] outline-neutral-800" />

              {/* Branch Metadata: Manager & Hours */}
              <div className="self-stretch flex flex-col justify-start items-start gap-1">
                <div className="self-stretch inline-flex justify-between items-center">
                  <span className="text-zinc-400 text-base font-medium font-sans leading-9">
                    Manager
                  </span>
                  <span className="text-neutral-200 text-base font-normal font-sans leading-4">
                    {branch.manager}
                  </span>
                </div>

                <div className="self-stretch inline-flex justify-between items-center">
                  <span className="text-zinc-400 text-base font-medium font-sans leading-9">
                    Hours
                  </span>
                  <span className="text-neutral-200 text-base font-normal font-sans leading-4">
                    {branch.hours || `${branch.openingTime || '09:00'}–${branch.closingTime || '23:00'}`}
                  </span>
                </div>
              </div>

              {/* Divider */}
              <div className="self-stretch h-0 outline outline-1 outline-offset-[-0.50px] outline-neutral-800" />

              {/* Bottom Actions Row */}
              <div className="self-stretch inline-flex justify-start items-center gap-2">
                <button
                  onClick={() => {
                    if (onOpenBranchDashboard) {
                      onOpenBranchDashboard(branch);
                    } else {
                      router.push('/new-admin-dashboard/branches');
                    }
                  }}
                  className="flex-1 px-2.5 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-md outline outline-1 outline-offset-[-1px] outline-neutral-700 flex justify-center items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span className="text-center text-white text-sm font-medium font-sans leading-4">
                    Open branch dashboard
                  </span>
                </button>

                <div className="flex justify-start items-center gap-2">
                  {/* Edit button */}
                  <button
                    onClick={() => handleOpenEdit(branch)}
                    className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-md outline outline-1 outline-offset-[-1px] outline-neutral-700 flex justify-center items-center transition-colors cursor-pointer"
                    aria-label={`Edit ${branch.name}`}
                  >
                    <Pencil className="size-4 text-stone-300" />
                  </button>

                  {/* Delete button */}
                  <button
                    onClick={() => setDeletingBranch(branch)}
                    className="p-2 bg-red-400/20 hover:bg-red-400/30 rounded-md outline outline-1 outline-offset-[-1px] outline-red-400/40 flex justify-center items-center transition-colors cursor-pointer"
                    aria-label={`Delete ${branch.name}`}
                  >
                    <Trash2 className="size-4 text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE BRANCH MODAL matching Snippet 2 */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-[560px] max-w-full p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-800 flex flex-col justify-start items-end gap-4 shadow-2xl animate-in fade-in scale-95 duration-150">
            {/* Modal Header */}
            <div className="w-full flex justify-between items-start">
              <div className="flex flex-col justify-start items-start gap-1">
                <h3 className="text-white text-lg font-medium font-sans leading-5">
                  Create Branch
                </h3>
                <p className="text-neutral-400 text-xs font-normal font-sans leading-4">
                  Complete the details below, then save your changes.
                </p>
              </div>

              <button
                onClick={() => setIsCreateOpen(false)}
                className="w-9 h-9 p-2 bg-gray-300/10 hover:bg-gray-300/20 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 flex justify-center items-center text-gray-200 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Divider */}
            <div className="w-full h-0 outline outline-1 outline-offset-[-0.50px] outline-neutral-800" />

            {/* Form Container */}
            <form onSubmit={handleCreateSubmit} className="w-full flex flex-col gap-4">
              <div className="w-full p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-800 flex flex-col justify-start items-center gap-4">
                {/* Row 1: Restaurant & Branch Name */}
                <div className="self-stretch grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col justify-start items-start gap-2">
                    <label className="text-white text-sm font-normal font-sans leading-4">
                      Restaurant
                    </label>
                    <div className="self-stretch px-3.5 py-3 bg-neutral-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 flex justify-between items-center">
                      <span className="text-stone-300 text-sm font-normal font-sans leading-4">
                        {restaurant.name}
                      </span>
                      <ChevronDown className="size-4 text-stone-300 pointer-events-none" />
                    </div>
                  </div>

                  <div className="flex flex-col justify-start items-start gap-2">
                    <label className="text-white text-sm font-normal font-sans leading-4">
                      Branch Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Georgia Flagship"
                      value={createForm.name}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, name: e.target.value })
                      }
                      className="self-stretch h-11 px-3.5 py-3 bg-neutral-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 text-stone-200 text-sm focus:outline-none focus:border-amber-400 font-sans"
                    />
                  </div>
                </div>

                {/* Row 2: Address & Contact Number */}
                <div className="self-stretch grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col justify-start items-start gap-2">
                    <label className="text-white text-sm font-normal font-sans leading-4">
                      Address
                    </label>
                    <input
                      type="text"
                      placeholder="Cusseta, Georgia"
                      value={createForm.address}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, address: e.target.value })
                      }
                      className="self-stretch h-11 px-3.5 py-3 bg-neutral-900 rounded-lg border border-neutral-800 text-stone-200 text-sm focus:outline-none focus:border-amber-400 font-sans"
                    />
                  </div>

                  <div className="flex flex-col justify-start items-start gap-2">
                    <label className="text-white text-sm font-normal font-sans leading-4">
                      Contact Number
                    </label>
                    <input
                      type="text"
                      placeholder="992548756"
                      value={createForm.contactNumber}
                      onChange={(e) =>
                        setCreateForm({
                          ...createForm,
                          contactNumber: e.target.value,
                        })
                      }
                      className="self-stretch h-11 px-3.5 py-3 bg-neutral-900 rounded-lg border border-neutral-800 text-stone-200 text-sm focus:outline-none focus:border-amber-400 font-sans"
                    />
                  </div>
                </div>

                {/* Row 3: Manager & Status */}
                <div className="self-stretch grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col justify-start items-start gap-2">
                    <label className="text-white text-sm font-normal font-sans leading-4">
                      Manager
                    </label>
                    <div className="self-stretch relative">
                      <select
                        value={createForm.manager}
                        onChange={(e) =>
                          setCreateForm({ ...createForm, manager: e.target.value })
                        }
                        className="w-full h-11 px-3.5 py-3 bg-neutral-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 text-stone-300 text-sm font-normal font-sans appearance-none focus:outline-none focus:border-amber-400"
                      >
                        <option value="Nobin Mille">Nobin Mille</option>
                        <option value="Samira Khan">Samira Khan</option>
                        <option value="Robert Geo">Robert Geo</option>
                        <option value="Sarah Ahmed">Sarah Ahmed</option>
                      </select>
                      <ChevronDown className="size-4 text-stone-300 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div className="flex flex-col justify-start items-start gap-2">
                    <label className="text-white text-sm font-normal font-sans leading-4">
                      Status
                    </label>
                    <div className="self-stretch relative">
                      <select
                        value={createForm.status}
                        onChange={(e) =>
                          setCreateForm({
                            ...createForm,
                            status: e.target.value as 'Active' | 'Setup' | 'Closed',
                          })
                        }
                        className="w-full h-11 px-3.5 py-3 bg-neutral-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 text-stone-300 text-sm font-normal font-sans appearance-none focus:outline-none focus:border-amber-400"
                      >
                        <option value="Active">Active</option>
                        <option value="Setup">Setup</option>
                        <option value="Closed">Closed</option>
                      </select>
                      <ChevronDown className="size-4 text-stone-300 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Row 4: Opening Time & Closing Time */}
                <div className="self-stretch grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col justify-start items-start gap-2">
                    <label className="text-white text-sm font-normal font-sans leading-4">
                      Opening Time
                    </label>
                    <div className="self-stretch relative">
                      <input
                        type="text"
                        value={createForm.openingTime}
                        onChange={(e) =>
                          setCreateForm({
                            ...createForm,
                            openingTime: e.target.value,
                          })
                        }
                        placeholder="09:00"
                        className="w-full h-11 px-3.5 py-3 bg-neutral-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 text-stone-300 text-sm font-normal font-sans focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col justify-start items-start gap-2">
                    <label className="text-white text-sm font-normal font-sans leading-4">
                      Closing Time
                    </label>
                    <input
                      type="text"
                      value={createForm.closingTime}
                      onChange={(e) =>
                        setCreateForm({
                          ...createForm,
                          closingTime: e.target.value,
                        })
                      }
                      placeholder="23:00"
                      className="self-stretch h-11 px-3.5 py-3 bg-neutral-900 rounded-lg border border-neutral-800 text-stone-300 text-sm font-normal font-sans focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer Buttons */}
              <div className="inline-flex justify-end items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-3 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 text-white text-base font-medium font-sans leading-5 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-2.5 bg-yellow-400 hover:bg-yellow-300 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 text-neutral-800 text-base font-medium font-sans leading-5 transition-colors cursor-pointer shadow-sm"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT BRANCH MODAL matching Snippet 3 */}
      {editingBranch && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-[560px] max-w-full p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-800 flex flex-col justify-start items-end gap-4 shadow-2xl animate-in fade-in scale-95 duration-150">
            {/* Modal Header */}
            <div className="w-full flex justify-between items-start">
              <div className="flex flex-col justify-start items-start gap-1">
                <h3 className="text-white text-lg font-medium font-sans leading-5">
                  Edit Branch
                </h3>
                <p className="text-neutral-400 text-xs font-normal font-sans leading-4">
                  Complete the details below, then save your changes.
                </p>
              </div>

              <button
                onClick={() => setEditingBranch(null)}
                className="w-9 h-9 p-2 bg-gray-300/10 hover:bg-gray-300/20 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 flex justify-center items-center text-gray-200 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Divider */}
            <div className="w-full h-0 outline outline-1 outline-offset-[-0.50px] outline-neutral-800" />

            {/* Form Container */}
            <form onSubmit={handleEditSubmit} className="w-full flex flex-col gap-4">
              <div className="w-full p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-800 flex flex-col justify-start items-center gap-4">
                {/* Row 1: Restaurant & Branch Name */}
                <div className="self-stretch grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col justify-start items-start gap-2">
                    <label className="text-white text-sm font-normal font-sans leading-4">
                      Restaurant
                    </label>
                    <div className="self-stretch px-3.5 py-3 bg-neutral-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 flex justify-between items-center">
                      <span className="text-stone-300 text-sm font-normal font-sans leading-4">
                        {restaurant.name}
                      </span>
                      <ChevronDown className="size-4 text-stone-300 pointer-events-none" />
                    </div>
                  </div>

                  <div className="flex flex-col justify-start items-start gap-2">
                    <label className="text-white text-sm font-normal font-sans leading-4">
                      Branch Name
                    </label>
                    <input
                      type="text"
                      required
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm({ ...editForm, name: e.target.value })
                      }
                      className="self-stretch h-11 px-3.5 py-3 bg-neutral-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 text-stone-200 text-sm focus:outline-none focus:border-amber-400 font-sans"
                    />
                  </div>
                </div>

                {/* Row 2: Address & Contact Number */}
                <div className="self-stretch grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col justify-start items-start gap-2">
                    <label className="text-white text-sm font-normal font-sans leading-4">
                      Address
                    </label>
                    <input
                      type="text"
                      value={editForm.address}
                      onChange={(e) =>
                        setEditForm({ ...editForm, address: e.target.value })
                      }
                      className="self-stretch h-11 px-3.5 py-3 bg-neutral-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 text-stone-200 text-sm focus:outline-none focus:border-amber-400 font-sans"
                    />
                  </div>

                  <div className="flex flex-col justify-start items-start gap-2">
                    <label className="text-white text-sm font-normal font-sans leading-4">
                      Contact Number
                    </label>
                    <input
                      type="text"
                      value={editForm.contactNumber}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          contactNumber: e.target.value,
                        })
                      }
                      className="self-stretch h-11 px-3.5 py-3 bg-neutral-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 text-stone-200 text-sm focus:outline-none focus:border-amber-400 font-sans"
                    />
                  </div>
                </div>

                {/* Row 3: Manager & Status */}
                <div className="self-stretch grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col justify-start items-start gap-2">
                    <label className="text-white text-sm font-normal font-sans leading-4">
                      Manager
                    </label>
                    <div className="self-stretch relative">
                      <select
                        value={editForm.manager}
                        onChange={(e) =>
                          setEditForm({ ...editForm, manager: e.target.value })
                        }
                        className="w-full h-11 px-3.5 py-3 bg-neutral-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 text-stone-300 text-sm font-normal font-sans appearance-none focus:outline-none focus:border-amber-400"
                      >
                        <option value="Nobin Mille">Nobin Mille</option>
                        <option value="Samira Khan">Samira Khan</option>
                        <option value="Robert Geo">Robert Geo</option>
                        <option value="Sarah Ahmed">Sarah Ahmed</option>
                      </select>
                      <ChevronDown className="size-4 text-stone-300 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div className="flex flex-col justify-start items-start gap-2">
                    <label className="text-white text-sm font-normal font-sans leading-4">
                      Status
                    </label>
                    <div className="self-stretch relative">
                      <select
                        value={editForm.status}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            status: e.target.value as 'Active' | 'Setup' | 'Closed',
                          })
                        }
                        className="w-full h-11 px-3.5 py-3 bg-neutral-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 text-stone-300 text-sm font-normal font-sans appearance-none focus:outline-none focus:border-amber-400"
                      >
                        <option value="Active">Active</option>
                        <option value="Setup">Setup</option>
                        <option value="Closed">Closed</option>
                      </select>
                      <ChevronDown className="size-4 text-stone-300 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Row 4: Opening Time & Closing Time */}
                <div className="self-stretch grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col justify-start items-start gap-2">
                    <label className="text-white text-sm font-normal font-sans leading-4">
                      Opening Time
                    </label>
                    <div className="self-stretch relative">
                      <input
                        type="text"
                        value={editForm.openingTime}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            openingTime: e.target.value,
                          })
                        }
                        className="w-full h-11 px-3.5 py-3 bg-neutral-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 text-stone-300 text-sm font-normal font-sans focus:outline-none focus:border-amber-400"
                      />
                      <ChevronDown className="size-4 text-stone-300 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div className="flex flex-col justify-start items-start gap-2">
                    <label className="text-white text-sm font-normal font-sans leading-4">
                      Closing Time
                    </label>
                    <input
                      type="text"
                      value={editForm.closingTime}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          closingTime: e.target.value,
                        })
                      }
                      className="self-stretch h-11 px-3.5 py-3 bg-neutral-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 text-stone-300 text-sm font-normal font-sans focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer Buttons */}
              <div className="inline-flex justify-end items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setEditingBranch(null)}
                  className="px-3 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 text-white text-base font-medium font-sans leading-5 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-2.5 bg-yellow-400 hover:bg-yellow-300 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 text-neutral-800 text-base font-medium font-sans leading-5 transition-colors cursor-pointer shadow-sm"
                >
                  Save Change
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE BRANCH CONFIRMATION MODAL matching Snippet 4 */}
      {deletingBranch && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-[452px] max-w-full px-5 py-6 bg-neutral-900 rounded-[10px] inline-flex flex-col justify-start items-center gap-6 shadow-2xl animate-in fade-in scale-95 duration-150 border border-neutral-800">
            {/* Modal Body */}
            <div className="self-stretch flex flex-col justify-center items-center gap-5">
              <div className="self-stretch flex flex-col justify-start items-center gap-4">
                {/* Danger Trash Icon */}
                <div className="p-3 bg-red-400/20 rounded-md outline outline-1 outline-offset-[-1px] outline-red-400/40 inline-flex justify-center items-center gap-1.5">
                  <Trash2 className="size-8 text-red-400 stroke-[1.75]" />
                </div>

                <div className="self-stretch flex flex-col justify-start items-center gap-2.5">
                  <h3 className="self-stretch text-center text-white text-lg font-medium font-sans leading-5">
                    Delete {deletingBranch.name} <br />
                    Branch?
                  </h3>
                  <p className="w-80 text-center text-neutral-400 text-xs font-normal font-sans leading-4">
                    This action cannot be undone. The item will be permanently removed.
                  </p>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="self-stretch h-0 outline outline-1 outline-offset-[-0.50px] outline-neutral-800" />

            {/* Footer Buttons */}
            <div className="self-stretch inline-flex justify-center items-start gap-2">
              <div className="flex justify-start items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDeletingBranch(null)}
                  className="px-3 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 text-white text-base font-medium font-sans leading-5 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-3 py-2.5 bg-red-400/10 hover:bg-red-400/20 rounded-lg outline outline-1 outline-offset-[-1px] outline-red-400/40 text-red-400 text-base font-medium font-sans leading-5 transition-colors cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
