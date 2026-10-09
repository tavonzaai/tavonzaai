'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  X,
  ChevronDown,
  Building2,
  MapPin,
  Clock,
  Phone,
  CheckCircle2,
  Search,
} from 'lucide-react';
import { toast } from 'sonner';
import { MOCK_BRANCHES, MOCK_RESTAURANTS } from '../data';
import { BranchItem } from '../types';

interface BranchesViewProps {
  onBack?: () => void;
}

export default function BranchesView({ onBack }: BranchesViewProps = {}) {
  const router = useRouter();
  const [branches, setBranches] = useState<BranchItem[]>(MOCK_BRANCHES);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<BranchItem | null>(null);
  const [deletingBranch, setDeletingBranch] = useState<BranchItem | null>(null);

  // Create Form State
  const [createForm, setCreateForm] = useState({
    restaurantId: 'rest-1',
    restaurantName: 'Tavonza Kitchen',
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
    restaurantId: '',
    restaurantName: '',
    name: '',
    address: '',
    contactNumber: '',
    manager: '',
    status: 'Active' as 'Active' | 'Setup' | 'Closed',
    openingTime: '09:00',
    closingTime: '23:00',
  });

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.push('/new-admin-dashboard/restaurants');
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (branch: BranchItem) => {
    setEditingBranch(branch);
    setEditForm({
      restaurantId: branch.restaurantId,
      restaurantName: branch.restaurantName,
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

    const matchedRest = MOCK_RESTAURANTS.find((r) => r.id === createForm.restaurantId);

    const newBranch: BranchItem = {
      id: `br-${Date.now()}`,
      restaurantId: createForm.restaurantId,
      restaurantName: matchedRest ? matchedRest.name : createForm.restaurantName,
      name: createForm.name.trim(),
      location: createForm.address.trim() || 'Cusseta, Georgia',
      manager: createForm.manager,
      hours: `${createForm.openingTime} – ${createForm.closingTime}`,
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
      restaurantId: 'rest-1',
      restaurantName: 'Tavonza Kitchen',
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

    const matchedRest = MOCK_RESTAURANTS.find((r) => r.id === editForm.restaurantId);

    setBranches((prev) =>
      prev.map((b) =>
        b.id === editingBranch.id
          ? {
              ...b,
              restaurantId: editForm.restaurantId,
              restaurantName: matchedRest ? matchedRest.name : editForm.restaurantName,
              name: editForm.name.trim(),
              location: editForm.address.trim(),
              contactNumber: editForm.contactNumber,
              manager: editForm.manager,
              status: editForm.status,
              openingTime: editForm.openingTime,
              closingTime: editForm.closingTime,
              hours: `${editForm.openingTime} – ${editForm.closingTime}`,
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

  const filteredBranches = branches.filter((b) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      b.name.toLowerCase().includes(q) ||
      b.restaurantName.toLowerCase().includes(q) ||
      b.manager.toLowerCase().includes(q) ||
      b.location.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Navigation Row: Back Button */}
      <div className="flex items-center gap-1">
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-1.5 cursor-pointer group text-neutral-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="size-4 text-neutral-400 group-hover:text-white transition-colors" />
          <span className="text-neutral-400 group-hover:text-white text-xs font-semibold font-['Poppins'] leading-4">
            Back
          </span>
        </button>
      </div>

      {/* Header Row: Title & Create Branch Button matching Figma snippet */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col justify-start items-start gap-1">
          <h1 className="text-white text-3xl font-semibold font-['Inter'] leading-9">
            Branches
          </h1>
          <p className="text-zinc-500 text-sm font-normal font-['Inter'] leading-6">
            Manage locations, operations, and branch-level configuration.
          </p>
        </div>

        <div className="flex justify-end items-start gap-2">
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-3 py-2.5 bg-yellow-400 hover:bg-yellow-300 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 flex justify-start items-center gap-1.5 transition-all text-neutral-800 text-base font-medium font-['Inter'] leading-5 shadow-sm cursor-pointer"
          >
            <Plus className="size-4 stroke-[2.5] text-neutral-900" />
            <span>Create Branch</span>
          </button>
        </div>
      </div>

      {/* Optional Search / Filter for fast lookup */}
      {branches.length > 4 && (
        <div className="relative w-full sm:w-72">
          <Search className="size-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search branches..."
            className="w-full h-9 pl-9 pr-3 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 font-sans"
          />
        </div>
      )}

      {/* Branches Table matching Figma snippet */}
      <div className="w-full overflow-x-auto pb-4">
        <div className="min-w-[960px] inline-flex justify-start items-stretch">
          {/* Column 1: Branch */}
          <div className="w-48 inline-flex flex-col justify-start items-stretch">
            {/* Header */}
            <div className="px-4 py-3 bg-zinc-900 rounded-tl-lg border-l border-t border-b border-zinc-800 flex justify-start items-center gap-2.5 h-11">
              <span className="text-white text-sm font-semibold font-['Inter'] leading-5">
                Branch
              </span>
            </div>
            {/* Rows */}
            {filteredBranches.map((branch, idx) => {
              const isLast = idx === filteredBranches.length - 1;
              return (
                <div
                  key={branch.id}
                  className={`px-4 py-4 border-l border-b border-zinc-800 flex justify-start items-center gap-2.5 h-[72px] ${
                    isLast ? 'rounded-bl-lg' : ''
                  }`}
                >
                  <div className="inline-flex flex-col justify-center items-start gap-1">
                    <span className="text-neutral-200 text-base font-medium font-['Inter'] leading-4">
                      {branch.name}
                    </span>
                    <span className="text-neutral-400 text-[10px] font-normal font-['SF_Pro'] leading-4 tracking-tight">
                      {branch.location}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Column 2: Restaurant */}
          <div className="w-52 inline-flex flex-col justify-start items-stretch">
            {/* Header */}
            <div className="px-4 py-3 bg-zinc-900 border-t border-b border-zinc-800 flex justify-start items-center gap-2.5 h-11">
              <span className="text-white text-sm font-semibold font-['Inter'] leading-5">
                Restaurant
              </span>
            </div>
            {/* Rows */}
            {filteredBranches.map((branch) => (
              <div
                key={branch.id}
                className="px-4 py-6 border-b border-zinc-800 flex justify-start items-center gap-2.5 h-[72px]"
              >
                <span className="text-neutral-200 text-base font-medium font-['Inter'] leading-4">
                  {branch.restaurantName}
                </span>
              </div>
            ))}
          </div>

          {/* Column 3: Branch Manager */}
          <div className="w-44 inline-flex flex-col justify-start items-stretch">
            {/* Header */}
            <div className="px-4 py-3 bg-zinc-900 border-t border-b border-zinc-800 flex justify-start items-center gap-2.5 h-11">
              <span className="text-white text-sm font-semibold font-['Inter'] leading-5">
                Branch Manager
              </span>
            </div>
            {/* Rows */}
            {filteredBranches.map((branch) => (
              <div
                key={branch.id}
                className="px-4 py-6 border-b border-zinc-800 flex justify-start items-center gap-2.5 h-[72px]"
              >
                <span className="text-neutral-200 text-base font-medium font-['Inter'] leading-4">
                  {branch.manager}
                </span>
              </div>
            ))}
          </div>

          {/* Column 4: Operating hours */}
          <div className="w-48 inline-flex flex-col justify-start items-stretch">
            {/* Header */}
            <div className="px-4 py-3 bg-zinc-900 border-t border-b border-zinc-800 flex justify-start items-center gap-2.5 h-11">
              <span className="text-white text-sm font-semibold font-['Inter'] leading-5">
                Operating hours
              </span>
            </div>
            {/* Rows */}
            {filteredBranches.map((branch) => (
              <div
                key={branch.id}
                className="px-4 py-6 border-b border-zinc-800 flex justify-start items-center gap-2.5 h-[72px]"
              >
                <span className="text-neutral-200 text-base font-medium font-['Inter'] leading-4">
                  {branch.hours || `${branch.openingTime || '09:00'} – ${branch.closingTime || '23:00'}`}
                </span>
              </div>
            ))}
          </div>

          {/* Column 5: Payment Status / Status */}
          <div className="w-40 inline-flex flex-col justify-start items-stretch">
            {/* Header */}
            <div className="px-4 py-3 bg-zinc-900 border-t border-b border-zinc-800 flex justify-center items-center gap-2.5 h-11">
              <span className="text-white text-sm font-semibold font-['Inter'] leading-5">
                Payment Status
              </span>
            </div>
            {/* Rows */}
            {filteredBranches.map((branch) => {
              const isActive = branch.status === 'Active';
              const isSetup = branch.status === 'Setup';

              return (
                <div
                  key={branch.id}
                  className="px-4 py-4 border-b border-zinc-800 flex justify-center items-center gap-2.5 h-[72px]"
                >
                  <div
                    className={`px-3 py-1.5 rounded-md flex justify-center items-center gap-2.5 ${
                      isActive
                        ? 'bg-green-500/10'
                        : isSetup
                        ? 'bg-orange-400/10'
                        : 'bg-red-400/10'
                    }`}
                  >
                    <span
                      className={`text-sm font-medium font-['Inter'] leading-4 ${
                        isActive
                          ? 'text-green-500'
                          : isSetup
                          ? 'text-orange-400'
                          : 'text-red-400'
                      }`}
                    >
                      {branch.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Column 6: Action */}
          <div className="w-36 inline-flex flex-col justify-start items-stretch">
            {/* Header */}
            <div className="p-3 bg-zinc-900 rounded-tr-lg border-r border-t border-b border-zinc-800 flex justify-center items-center gap-2.5 h-11">
              <span className="text-white text-sm font-semibold font-['Inter'] leading-5">
                Action
              </span>
            </div>
            {/* Rows */}
            {filteredBranches.map((branch, idx) => {
              const isLast = idx === filteredBranches.length - 1;
              return (
                <div
                  key={branch.id}
                  className={`px-3 py-6 border-r border-b border-zinc-800 flex justify-center items-center gap-4 h-[72px] ${
                    isLast ? 'rounded-br-lg' : ''
                  }`}
                >
                  {/* Edit button */}
                  <button
                    onClick={() => handleOpenEdit(branch)}
                    className="p-1 hover:text-white text-neutral-400 transition-colors cursor-pointer"
                    aria-label={`Edit ${branch.name}`}
                    title="Edit branch"
                  >
                    <Pencil className="size-4" />
                  </button>

                  {/* Delete button */}
                  <button
                    onClick={() => setDeletingBranch(branch)}
                    className="p-1 hover:text-red-400 text-neutral-400 transition-colors cursor-pointer"
                    aria-label={`Delete ${branch.name}`}
                    title="Delete branch"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CREATE BRANCH MODAL matching Figma snippet 2 */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-[560px] max-w-full p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-800 flex flex-col justify-start items-end gap-4 shadow-2xl animate-in fade-in scale-95 duration-150">
            {/* Modal Header */}
            <div className="w-full flex justify-between items-start">
              <div className="w-96 flex flex-col justify-start items-start gap-1">
                <h3 className="text-white text-lg font-medium font-['Poppins'] leading-5">
                  Create Branch
                </h3>
                <p className="text-neutral-400 text-xs font-normal font-['Poppins'] leading-4">
                  Complete the details below, then save your changes.
                </p>
              </div>

              <button
                onClick={() => setIsCreateOpen(false)}
                className="w-9 px-2.5 py-2 bg-gray-300/10 hover:bg-gray-300/20 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 flex justify-center items-center text-gray-200 transition-colors cursor-pointer"
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
                    <label className="text-white text-sm font-normal font-['Inter'] leading-4">
                      Restaurant
                    </label>
                    <div className="self-stretch relative">
                      <select
                        value={createForm.restaurantId}
                        onChange={(e) => {
                          const selected = MOCK_RESTAURANTS.find((r) => r.id === e.target.value);
                          setCreateForm({
                            ...createForm,
                            restaurantId: e.target.value,
                            restaurantName: selected ? selected.name : createForm.restaurantName,
                          });
                        }}
                        className="w-full h-11 px-3.5 py-3 bg-neutral-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 text-stone-300 text-sm font-normal font-['Inter'] appearance-none focus:outline-none focus:border-amber-400 cursor-pointer"
                      >
                        {MOCK_RESTAURANTS.map((rest) => (
                          <option key={rest.id} value={rest.id}>
                            {rest.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="size-4 text-stone-300 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div className="flex flex-col justify-start items-start gap-2">
                    <label className="text-white text-sm font-normal font-['Inter'] leading-4">
                      Branch Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Illinois Flagship"
                      value={createForm.name}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, name: e.target.value })
                      }
                      className="self-stretch h-11 px-3.5 py-3 bg-neutral-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 text-stone-200 text-sm focus:outline-none focus:border-amber-400 font-['Inter']"
                    />
                  </div>
                </div>

                {/* Row 2: Address & Contact Number */}
                <div className="self-stretch grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col justify-start items-start gap-2">
                    <label className="text-white text-sm font-normal font-['Inter'] leading-4">
                      Address
                    </label>
                    <input
                      type="text"
                      placeholder="Cusseta, Georgia"
                      value={createForm.address}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, address: e.target.value })
                      }
                      className="self-stretch h-11 px-3.5 py-3 bg-neutral-900 rounded-lg border border-neutral-800 text-stone-200 text-sm focus:outline-none focus:border-amber-400 font-['Inter']"
                    />
                  </div>

                  <div className="flex flex-col justify-start items-start gap-2">
                    <label className="text-white text-sm font-normal font-['Inter'] leading-4">
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
                      className="self-stretch h-11 px-3.5 py-3 bg-neutral-900 rounded-lg border border-neutral-800 text-stone-200 text-sm focus:outline-none focus:border-amber-400 font-['Inter']"
                    />
                  </div>
                </div>

                {/* Row 3: Branch Manager & Status */}
                <div className="self-stretch grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col justify-start items-start gap-2">
                    <label className="text-white text-sm font-normal font-['Inter'] leading-4">
                      Branch Manager
                    </label>
                    <div className="self-stretch relative">
                      <select
                        value={createForm.manager}
                        onChange={(e) =>
                          setCreateForm({ ...createForm, manager: e.target.value })
                        }
                        className="w-full h-11 px-3.5 py-3 bg-neutral-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 text-stone-300 text-sm font-normal font-['Inter'] appearance-none focus:outline-none focus:border-amber-400 cursor-pointer"
                      >
                        <option value="Nobin Mille">Nobin Mille</option>
                        <option value="Samira Khan">Samira Khan</option>
                        <option value="Mikel">Mikel</option>
                        <option value="Glory">Glory</option>
                        <option value="Robert Geo">Robert Geo</option>
                      </select>
                      <ChevronDown className="size-4 text-stone-300 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div className="flex flex-col justify-start items-start gap-2">
                    <label className="text-white text-sm font-normal font-['Inter'] leading-4">
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
                        className="w-full h-11 px-3.5 py-3 bg-neutral-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 text-stone-300 text-sm font-normal font-['Inter'] appearance-none focus:outline-none focus:border-amber-400 cursor-pointer"
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
                    <label className="text-white text-sm font-normal font-['Inter'] leading-4">
                      Opening Time
                    </label>
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
                      className="self-stretch h-11 px-3.5 py-3 bg-neutral-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 text-stone-300 text-sm font-normal font-['Inter'] focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="flex flex-col justify-start items-start gap-2">
                    <label className="text-white text-sm font-normal font-['Inter'] leading-4">
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
                      className="self-stretch h-11 px-3.5 py-3 bg-neutral-900 rounded-lg border border-neutral-800 text-stone-300 text-sm font-normal font-['Inter'] focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer Buttons */}
              <div className="inline-flex justify-end items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-3 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 text-white text-base font-medium font-['Inter'] leading-5 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-2.5 bg-yellow-400 hover:bg-yellow-300 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 text-neutral-800 text-base font-medium font-['Inter'] leading-5 transition-colors cursor-pointer shadow-sm"
                >
                  Save 
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT BRANCH MODAL */}
      {editingBranch && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-[560px] max-w-full p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-800 flex flex-col justify-start items-end gap-4 shadow-2xl animate-in fade-in scale-95 duration-150">
            {/* Modal Header */}
            <div className="w-full flex justify-between items-start">
              <div className="flex flex-col justify-start items-start gap-1">
                <h3 className="text-white text-lg font-medium font-['Poppins'] leading-5">
                  Edit Branch
                </h3>
                <p className="text-neutral-400 text-xs font-normal font-['Poppins'] leading-4">
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
                    <label className="text-white text-sm font-normal font-['Inter'] leading-4">
                      Restaurant
                    </label>
                    <div className="self-stretch relative">
                      <select
                        value={editForm.restaurantId}
                        onChange={(e) => {
                          const selected = MOCK_RESTAURANTS.find((r) => r.id === e.target.value);
                          setEditForm({
                            ...editForm,
                            restaurantId: e.target.value,
                            restaurantName: selected ? selected.name : editForm.restaurantName,
                          });
                        }}
                        className="w-full h-11 px-3.5 py-3 bg-neutral-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 text-stone-300 text-sm font-normal font-['Inter'] appearance-none focus:outline-none focus:border-amber-400 cursor-pointer"
                      >
                        {MOCK_RESTAURANTS.map((rest) => (
                          <option key={rest.id} value={rest.id}>
                            {rest.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="size-4 text-stone-300 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div className="flex flex-col justify-start items-start gap-2">
                    <label className="text-white text-sm font-normal font-['Inter'] leading-4">
                      Branch Name
                    </label>
                    <input
                      type="text"
                      required
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm({ ...editForm, name: e.target.value })
                      }
                      className="self-stretch h-11 px-3.5 py-3 bg-neutral-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 text-stone-200 text-sm focus:outline-none focus:border-amber-400 font-['Inter']"
                    />
                  </div>
                </div>

                {/* Row 2: Address & Contact Number */}
                <div className="self-stretch grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col justify-start items-start gap-2">
                    <label className="text-white text-sm font-normal font-['Inter'] leading-4">
                      Address
                    </label>
                    <input
                      type="text"
                      value={editForm.address}
                      onChange={(e) =>
                        setEditForm({ ...editForm, address: e.target.value })
                      }
                      className="self-stretch h-11 px-3.5 py-3 bg-neutral-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 text-stone-200 text-sm focus:outline-none focus:border-amber-400 font-['Inter']"
                    />
                  </div>

                  <div className="flex flex-col justify-start items-start gap-2">
                    <label className="text-white text-sm font-normal font-['Inter'] leading-4">
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
                      className="self-stretch h-11 px-3.5 py-3 bg-neutral-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 text-stone-200 text-sm focus:outline-none focus:border-amber-400 font-['Inter']"
                    />
                  </div>
                </div>

                {/* Row 3: Branch Manager & Status */}
                <div className="self-stretch grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col justify-start items-start gap-2">
                    <label className="text-white text-sm font-normal font-['Inter'] leading-4">
                      Branch Manager
                    </label>
                    <div className="self-stretch relative">
                      <select
                        value={editForm.manager}
                        onChange={(e) =>
                          setEditForm({ ...editForm, manager: e.target.value })
                        }
                        className="w-full h-11 px-3.5 py-3 bg-neutral-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 text-stone-300 text-sm font-normal font-['Inter'] appearance-none focus:outline-none focus:border-amber-400 cursor-pointer"
                      >
                        <option value="Nobin Mille">Nobin Mille</option>
                        <option value="Samira Khan">Samira Khan</option>
                        <option value="Mikel">Mikel</option>
                        <option value="Glory">Glory</option>
                        <option value="Robert Geo">Robert Geo</option>
                      </select>
                      <ChevronDown className="size-4 text-stone-300 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div className="flex flex-col justify-start items-start gap-2">
                    <label className="text-white text-sm font-normal font-['Inter'] leading-4">
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
                        className="w-full h-11 px-3.5 py-3 bg-neutral-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 text-stone-300 text-sm font-normal font-['Inter'] appearance-none focus:outline-none focus:border-amber-400 cursor-pointer"
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
                    <label className="text-white text-sm font-normal font-['Inter'] leading-4">
                      Opening Time
                    </label>
                    <input
                      type="text"
                      value={editForm.openingTime}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          openingTime: e.target.value,
                        })
                      }
                      className="self-stretch h-11 px-3.5 py-3 bg-neutral-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 text-stone-300 text-sm font-normal font-['Inter'] focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="flex flex-col justify-start items-start gap-2">
                    <label className="text-white text-sm font-normal font-['Inter'] leading-4">
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
                      className="self-stretch h-11 px-3.5 py-3 bg-neutral-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 text-stone-300 text-sm font-normal font-['Inter'] focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer Buttons */}
              <div className="inline-flex justify-end items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setEditingBranch(null)}
                  className="px-3 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 text-white text-base font-medium font-['Inter'] leading-5 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-2.5 bg-yellow-400 hover:bg-yellow-300 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 text-neutral-800 text-base font-medium font-['Inter'] leading-5 transition-colors cursor-pointer shadow-sm"
                >
                  Save Change
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE BRANCH CONFIRMATION MODAL */}
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
                  <h3 className="self-stretch text-center text-white text-lg font-medium font-['Inter'] leading-5">
                    Delete {deletingBranch.name} <br />
                    Branch?
                  </h3>
                  <p className="w-80 text-center text-neutral-400 text-xs font-normal font-['Inter'] leading-4">
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
                  className="px-3 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 text-white text-base font-medium font-['Inter'] leading-5 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-3 py-2.5 bg-red-400/10 hover:bg-red-400/20 rounded-lg outline outline-1 outline-offset-[-1px] outline-red-400/40 text-red-400 text-base font-medium font-['Inter'] leading-5 transition-colors cursor-pointer"
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
