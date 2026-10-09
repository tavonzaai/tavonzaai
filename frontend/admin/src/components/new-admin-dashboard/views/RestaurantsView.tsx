'use client';

import React, { useState } from 'react';
import {
  Plus,
  GitBranch,
  Pencil,
  Trash2,
  X,
  ChevronDown,
  Building2,
  MapPin,
  Phone,
  Mail,
  User,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { MOCK_RESTAURANTS, MOCK_BRANCHES } from '../data';
import { RestaurantItem } from '../types';
import RestaurantBranchesDetailView from './RestaurantBranchesDetailView';

export default function RestaurantsView() {
  const [restaurants, setRestaurants] = useState<RestaurantItem[]>(MOCK_RESTAURANTS);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<RestaurantItem | null>(null);
  const [deletingRestaurant, setDeletingRestaurant] = useState<RestaurantItem | null>(null);
  const [detailRestaurant, setDetailRestaurant] = useState<RestaurantItem | null>(null);

  // Create form state
  const [createForm, setCreateForm] = useState({
    name: '',
    manager: 'Robert Geo',
    contactNumber: '+4045017715',
    email: 'hello@tavonza.com',
    address: 'Cusseta, Georgia',
    status: 'Active' as 'Active' | 'Setup' | 'Closed',
    description: 'Modern dining with seasonal plates.',
  });

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: '',
    manager: 'Robert Geo',
    contactNumber: '',
    email: '',
    address: '',
    status: 'Active' as 'Active' | 'Setup' | 'Closed',
    description: '',
  });

  // Open Edit Modal with prefilled values
  const handleOpenEdit = (rest: RestaurantItem) => {
    setEditingRestaurant(rest);
    setEditForm({
      name: rest.name,
      manager: rest.manager || 'Robert Geo',
      contactNumber: rest.contactNumber || '+4045017715',
      email: rest.email || 'hello@tavonza.com',
      address: rest.address || 'Cusseta, Georgia',
      status: (rest.status as 'Active' | 'Setup' | 'Closed') || 'Active',
      description: rest.description || rest.tagline || 'Modern dining with seasonal plates.',
    });
  };

  // Submit Create Restaurant
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name.trim()) {
      toast.error('Please enter a restaurant name.');
      return;
    }

    const newRest: RestaurantItem = {
      id: `rest-${Date.now()}`,
      name: createForm.name.trim(),
      description: createForm.description.trim(),
      tagline: createForm.description.trim(),
      cuisine: 'Contemporary Hospitality',
      manager: createForm.manager,
      contactNumber: createForm.contactNumber,
      email: createForm.email,
      address: createForm.address,
      city: createForm.address.split(',')[0] || 'Metro',
      branchesCount: 1,
      staffCount: 12,
      monthlyRevenue: '$35,000',
      rating: 5.0,
      status: createForm.status,
    };

    setRestaurants([newRest, ...restaurants]);
    setIsCreateOpen(false);
    setCreateForm({
      name: '',
      manager: 'Robert Geo',
      contactNumber: '+4045017715',
      email: 'hello@tavonza.com',
      address: 'Cusseta, Georgia',
      status: 'Active',
      description: 'Modern dining with seasonal plates.',
    });
    toast.success(`Restaurant "${newRest.name}" created successfully!`);
  };

  // Submit Edit Restaurant
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRestaurant) return;
    if (!editForm.name.trim()) {
      toast.error('Restaurant name cannot be empty.');
      return;
    }

    setRestaurants((prev) =>
      prev.map((r) =>
        r.id === editingRestaurant.id
          ? {
              ...r,
              name: editForm.name.trim(),
              manager: editForm.manager,
              contactNumber: editForm.contactNumber,
              email: editForm.email,
              address: editForm.address,
              status: editForm.status,
              description: editForm.description,
              tagline: editForm.description,
            }
          : r
      )
    );
    toast.success(`Restaurant "${editForm.name}" updated successfully!`);
    setEditingRestaurant(null);
  };

  // Confirm Delete Restaurant
  const handleConfirmDelete = () => {
    if (!deletingRestaurant) return;
    const deletedName = deletingRestaurant.name;
    setRestaurants((prev) => prev.filter((r) => r.id !== deletingRestaurant.id));
    toast.success(`"${deletedName}" has been permanently deleted.`);
    setDeletingRestaurant(null);
  };

  if (detailRestaurant) {
    return (
      <RestaurantBranchesDetailView
        restaurant={detailRestaurant}
        onBack={() => setDetailRestaurant(null)}
      />
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header matching user Figma snippet */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="inline-flex flex-col justify-start items-start gap-1">
          <h1 className="text-white text-3xl font-semibold font-sans leading-9">
            Restaurants
          </h1>
          <p className="text-zinc-500 text-base font-normal font-sans leading-6">
            Manage every restaurant brand within your organization.
          </p>
        </div>

        <div className="flex justify-end items-start gap-2">
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-3 py-2.5 bg-yellow-400 hover:bg-yellow-300 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 flex justify-start items-center gap-1.5 transition-all text-neutral-800 text-base font-medium font-sans leading-5 shadow-sm cursor-pointer"
          >
            <Plus className="size-4 stroke-[2.5] text-neutral-900" />
            <span>Create Restaurant</span>
          </button>
        </div>
      </div>

      {/* Restaurants Cards Row matching user snippet */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {restaurants.map((rest) => {
          const isSetup = rest.status === 'Setup';
          const isActive = rest.status === 'Active' || rest.status === 'Open';

          return (
            <div
              key={rest.id}
              className="p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-800 flex flex-col justify-start items-start gap-4 transition-all hover:border-neutral-700 shadow-xl"
            >
              {/* Card Top: Title & Status Badge */}
              <div className="self-stretch inline-flex justify-between items-center">
                <div className="flex-1 flex justify-start items-center gap-2">
                  <div className="flex-1 inline-flex flex-col justify-start items-start gap-0.5">
                    <div className="self-stretch flex flex-col justify-start items-start gap-1">
                      <div className="self-stretch flex flex-col justify-start items-start gap-0.5">
                        <h2 className="self-stretch text-white text-lg font-medium font-sans leading-5">
                          {rest.name}
                        </h2>
                      </div>
                      <p className="self-stretch text-neutral-400 text-xs font-normal font-sans leading-4">
                        {rest.description || rest.tagline || 'Modern dining with seasonal plates.'}
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className={`px-2.5 py-2 rounded-lg flex justify-center items-center gap-2.5 ${
                    isActive
                      ? 'bg-green-500/10'
                      : isSetup
                      ? 'bg-orange-500/10'
                      : 'bg-red-400/10'
                  }`}
                >
                  <span
                    className={`text-center text-xs font-medium font-sans leading-4 ${
                      isActive
                        ? 'text-green-500'
                        : isSetup
                        ? 'text-orange-500'
                        : 'text-red-400'
                    }`}
                  >
                    {rest.status}
                  </span>
                </div>
              </div>

              {/* Divider */}
              <div className="self-stretch h-0 outline outline-1 outline-offset-[-0.50px] outline-neutral-800" />

              {/* Branch count row */}
              <div className="self-stretch flex flex-col justify-start items-start gap-3.5">
                <div className="self-stretch inline-flex justify-start items-center">
                  <div className="flex justify-start items-center gap-3">
                    <div className="px-2.5 py-2 bg-yellow-500/10 rounded-lg flex justify-center items-center">
                      <GitBranch className="size-4 text-yellow-500" />
                    </div>
                    <div className="flex justify-start items-center">
                      <span className="text-yellow-500 text-lg font-normal font-sans leading-5">
                        {rest.branchesCount} branches
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="self-stretch h-0 outline outline-1 outline-offset-[-0.50px] outline-neutral-800" />

              {/* Action buttons row */}
              <div className="self-stretch inline-flex justify-start items-center gap-2">
                <button
                  onClick={() => setDetailRestaurant(rest)}
                  className="flex-1 px-2.5 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-md outline outline-1 outline-offset-[-1px] outline-neutral-700 flex justify-center items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span className="text-center text-white text-sm font-medium font-sans leading-4">
                    View details
                  </span>
                </button>

                <div className="flex justify-start items-center gap-2">
                  {/* Edit button */}
                  <button
                    onClick={() => handleOpenEdit(rest)}
                    className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-md outline outline-1 outline-offset-[-1px] outline-neutral-700 flex justify-center items-center transition-colors cursor-pointer"
                    aria-label={`Edit ${rest.name}`}
                  >
                    <Pencil className="size-4 text-stone-300" />
                  </button>

                  {/* Delete button */}
                  <button
                    onClick={() => setDeletingRestaurant(rest)}
                    className="p-2 bg-red-400/20 hover:bg-red-400/30 rounded-md outline outline-1 outline-offset-[-1px] outline-red-400/40 flex justify-center items-center transition-colors cursor-pointer"
                    aria-label={`Delete ${rest.name}`}
                  >
                    <Trash2 className="size-4 text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE RESTAURANT MODAL matching snippet 2 */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-[560px] max-w-full p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-800 flex flex-col justify-start items-end gap-4 shadow-2xl animate-in fade-in scale-95 duration-150">
            {/* Modal Header */}
            <div className="w-full flex justify-between items-start">
              <div className="flex flex-col justify-start items-start gap-1">
                <h3 className="text-white text-lg font-medium font-sans leading-5">
                  Create Restaurant
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
                {/* Row 1: Restaurant Name & Restaurant Manager */}
                <div className="self-stretch grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col justify-start items-start gap-2">
                    <label className="text-white text-sm font-normal font-sans leading-4">
                      Restaurant Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Tavonza Bistro"
                      value={createForm.name}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, name: e.target.value })
                      }
                      className="self-stretch h-11 px-3.5 py-3 bg-neutral-900 rounded-lg border border-neutral-800 text-stone-200 text-sm focus:outline-none focus:border-amber-400 font-sans"
                    />
                  </div>

                  <div className="flex flex-col justify-start items-start gap-2">
                    <label className="text-white text-sm font-normal font-sans leading-4">
                      Restaurant Manager
                    </label>
                    <div className="self-stretch relative">
                      <select
                        value={createForm.manager}
                        onChange={(e) =>
                          setCreateForm({ ...createForm, manager: e.target.value })
                        }
                        className="w-full h-11 px-3.5 py-3 bg-neutral-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 text-stone-300 text-sm font-normal font-sans appearance-none focus:outline-none focus:border-amber-400"
                      >
                        <option value="Robert Geo">Robert Geo</option>
                        <option value="Nobin Mille">Nobin Mille</option>
                        <option value="Sarah Ahmed">Sarah Ahmed</option>
                        <option value="Alex Thorne">Alex Thorne</option>
                      </select>
                      <ChevronDown className="size-4 text-stone-300 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Row 2: Contact Number & Email */}
                <div className="self-stretch grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col justify-start items-start gap-2">
                    <label className="text-white text-sm font-normal font-sans leading-4">
                      Contact Number
                    </label>
                    <input
                      type="text"
                      value={createForm.contactNumber}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, contactNumber: e.target.value })
                      }
                      placeholder="+4045017715"
                      className="self-stretch h-11 px-3.5 py-3 bg-neutral-900 rounded-lg border border-neutral-800 text-stone-200 text-sm focus:outline-none focus:border-amber-400 font-sans"
                    />
                  </div>

                  <div className="flex flex-col justify-start items-start gap-2">
                    <label className="text-white text-sm font-normal font-sans leading-4">
                      Email
                    </label>
                    <input
                      type="email"
                      value={createForm.email}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, email: e.target.value })
                      }
                      placeholder="hello@tavonza.com"
                      className="self-stretch h-11 px-3.5 py-3 bg-neutral-900 rounded-lg border border-neutral-800 text-stone-200 text-sm focus:outline-none focus:border-amber-400 font-sans"
                    />
                  </div>
                </div>

                {/* Row 3: Address & Status */}
                <div className="self-stretch grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col justify-start items-start gap-2">
                    <label className="text-white text-sm font-normal font-sans leading-4">
                      Address
                    </label>
                    <input
                      type="text"
                      value={createForm.address}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, address: e.target.value })
                      }
                      placeholder="Cusseta, Georgia"
                      className="self-stretch h-11 px-3.5 py-3 bg-neutral-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 text-stone-200 text-sm focus:outline-none focus:border-amber-400 font-sans"
                    />
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

                {/* Row 4: Description */}
                <div className="self-stretch flex flex-col justify-start items-start gap-2">
                  <label className="text-white text-sm font-normal font-sans leading-4">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={createForm.description}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, description: e.target.value })
                    }
                    placeholder="Modern dining with seasonal plates."
                    className="self-stretch h-24 px-3.5 py-3 bg-neutral-950 rounded-lg border border-neutral-800 text-stone-200 text-sm focus:outline-none focus:border-amber-400 resize-none font-sans"
                  />
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

      {/* EDIT RESTAURANT MODAL matching snippet 3 */}
      {editingRestaurant && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-[560px] max-w-full p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-800 flex flex-col justify-start items-end gap-4 shadow-2xl animate-in fade-in scale-95 duration-150">
            {/* Modal Header */}
            <div className="w-full flex justify-between items-start">
              <div className="flex flex-col justify-start items-start gap-1">
                <h3 className="text-white text-lg font-medium font-sans leading-5">
                  Edit Restaurant
                </h3>
                <p className="text-neutral-400 text-xs font-normal font-sans leading-4">
                  Complete the details below, then save your changes.
                </p>
              </div>

              <button
                onClick={() => setEditingRestaurant(null)}
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
                {/* Row 1: Restaurant Name & Restaurant Manager */}
                <div className="self-stretch grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col justify-start items-start gap-2">
                    <label className="text-white text-sm font-normal font-sans leading-4">
                      Restaurant Name
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

                  <div className="flex flex-col justify-start items-start gap-2">
                    <label className="text-white text-sm font-normal font-sans leading-4">
                      Restaurant Manager
                    </label>
                    <div className="self-stretch relative">
                      <select
                        value={editForm.manager}
                        onChange={(e) =>
                          setEditForm({ ...editForm, manager: e.target.value })
                        }
                        className="w-full h-11 px-3.5 py-3 bg-neutral-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 text-stone-300 text-sm font-normal font-sans appearance-none focus:outline-none focus:border-amber-400"
                      >
                        <option value="Robert Geo">Robert Geo</option>
                        <option value="Nobin Mille">Nobin Mille</option>
                        <option value="Sarah Ahmed">Sarah Ahmed</option>
                        <option value="Alex Thorne">Alex Thorne</option>
                      </select>
                      <ChevronDown className="size-4 text-stone-300 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Row 2: Contact Number & Email */}
                <div className="self-stretch grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col justify-start items-start gap-2">
                    <label className="text-white text-sm font-normal font-sans leading-4">
                      Contact Number
                    </label>
                    <input
                      type="text"
                      value={editForm.contactNumber}
                      onChange={(e) =>
                        setEditForm({ ...editForm, contactNumber: e.target.value })
                      }
                      className="self-stretch h-11 px-3.5 py-3 bg-neutral-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 text-stone-200 text-sm focus:outline-none focus:border-amber-400 font-sans"
                    />
                  </div>

                  <div className="flex flex-col justify-start items-start gap-2">
                    <label className="text-white text-sm font-normal font-sans leading-4">
                      Email
                    </label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) =>
                        setEditForm({ ...editForm, email: e.target.value })
                      }
                      className="self-stretch h-11 px-3.5 py-3 bg-neutral-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 text-stone-200 text-sm focus:outline-none focus:border-amber-400 font-sans"
                    />
                  </div>
                </div>

                {/* Row 3: Address & Status */}
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

                {/* Row 4: Description */}
                <div className="self-stretch flex flex-col justify-start items-start gap-2">
                  <label className="text-white text-sm font-normal font-sans leading-4">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={editForm.description}
                    onChange={(e) =>
                      setEditForm({ ...editForm, description: e.target.value })
                    }
                    className="self-stretch h-24 px-3.5 py-3 bg-neutral-950 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 text-stone-300 text-sm focus:outline-none focus:border-amber-400 resize-none font-sans"
                  />
                </div>
              </div>

              {/* Modal Footer Buttons */}
              <div className="inline-flex justify-end items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setEditingRestaurant(null)}
                  className="px-3 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 text-white text-base font-medium font-sans leading-5 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-2.5 bg-yellow-400 hover:bg-yellow-300 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 text-neutral-800 text-base font-medium font-sans leading-5 transition-colors cursor-pointer shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL matching snippet 4 */}
      {deletingRestaurant && (
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
                    Delete {deletingRestaurant.name}?
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
                  onClick={() => setDeletingRestaurant(null)}
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
