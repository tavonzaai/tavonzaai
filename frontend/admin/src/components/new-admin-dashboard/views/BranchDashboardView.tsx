'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  Pencil,
  X,
  ChevronDown,
  Building2,
  MapPin,
  Phone,
  Clock,
  TrendingUp,
  ShoppingBag,
  Users,
  Grid,
  CheckCircle2,
  UtensilsCrossed,
  CreditCard,
  UserCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { BranchItem } from '../types';
import { MOCK_RESTAURANTS } from '../data';

interface BranchDashboardViewProps {
  branch: BranchItem;
  onBack: () => void;
  onUpdateBranch?: (updated: BranchItem) => void;
}

type SubTab = 'Overview' | 'Tables' | 'Menu' | 'Staff';

export default function BranchDashboardView({
  branch: initialBranch,
  onBack,
  onUpdateBranch,
}: BranchDashboardViewProps) {
  const [branch, setBranch] = useState<BranchItem>(initialBranch);
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('Overview');
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Edit form state prefilled from branch
  const [editForm, setEditForm] = useState({
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

  const handleOpenEdit = () => {
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
    setIsEditOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.name.trim()) {
      toast.error('Branch name cannot be empty.');
      return;
    }

    const matchedRest = MOCK_RESTAURANTS.find((r) => r.id === editForm.restaurantId);
    const updated: BranchItem = {
      ...branch,
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
    };

    setBranch(updated);
    if (onUpdateBranch) {
      onUpdateBranch(updated);
    }
    toast.success(`Branch "${updated.name}" updated successfully!`);
    setIsEditOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Navigation Row: Back Button matching Figma snippet */}
      <div className="flex items-center gap-1">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 cursor-pointer group text-neutral-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="size-4 text-neutral-400 group-hover:text-white transition-colors" />
          <span className="text-neutral-400 group-hover:text-white text-xs font-semibold font-['Poppins'] leading-4">
            Back
          </span>
        </button>
      </div>

      {/* Header Row: Title & Edit Branch Button matching Figma snippet */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col justify-start items-start gap-0.5">
          <h1 className="text-white text-3xl font-semibold font-['Inter'] leading-9">
            {branch.name}
          </h1>
          <p className="text-zinc-500 text-sm font-normal font-['Inter'] leading-6">
            {branch.restaurantName} · Branch dashboard
          </p>
        </div>

        <div className="flex justify-end items-start gap-2">
          <button
            onClick={handleOpenEdit}
            className="px-3 py-2.5 bg-yellow-400 hover:bg-yellow-300 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 flex justify-start items-center gap-1.5 transition-all text-neutral-800 text-base font-medium font-['Inter'] leading-5 shadow-sm cursor-pointer"
          >
            <Pencil className="size-4 stroke-[2.5] text-neutral-900" />
            <span>Edit Branch</span>
          </button>
        </div>
      </div>

      {/* Sub Navigation Pills (Overview, Tables, Menu, Staff) matching Figma snippet */}
      <div className="inline-flex flex-wrap justify-start items-center gap-2.5">
        {(['Overview', 'Tables', 'Menu', 'Staff'] as SubTab[]).map((tab) => {
          const isActive = activeSubTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveSubTab(tab)}
              className={`px-4 py-2 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 flex justify-start items-center gap-1.5 transition-all cursor-pointer ${
                isActive
                  ? 'bg-yellow-400 text-neutral-700 font-medium'
                  : 'bg-transparent hover:bg-neutral-900 text-white font-medium'
              }`}
            >
              <span className="text-center text-sm font-['Poppins'] leading-5">
                {tab}
              </span>
            </button>
          );
        })}
      </div>

      {/* Overview Tab Content */}
      {activeSubTab === 'Overview' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Row of 4 Metric Cards matching Figma snippet */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Card 1: Today's Revenue */}
            <div className="p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-300/20 flex flex-col justify-start items-start gap-3.5 shadow-xl">
              <div className="self-stretch inline-flex justify-between items-center">
                <span className="text-white text-lg font-semibold font-['Inter']">
                  Today’s Revenue
                </span>
              </div>
              <div className="self-stretch h-0 outline outline-1 outline-offset-[-0.50px] outline-neutral-800" />
              <div className="self-stretch flex flex-col justify-start items-start gap-3">
                <span className="text-white text-2xl font-medium font-['Inter'] leading-7">
                  ৳ 184,260
                </span>
                <span className="text-green-500 text-sm font-normal font-['Poppins'] leading-4">
                  ↑ 8.4% from yesterday
                </span>
              </div>
            </div>

            {/* Card 2: Orders */}
            <div className="p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-300/20 flex flex-col justify-start items-start gap-3.5 shadow-xl">
              <div className="self-stretch inline-flex justify-between items-center">
                <span className="text-white text-lg font-semibold font-['Inter']">
                  Orders
                </span>
              </div>
              <div className="self-stretch h-0 outline outline-1 outline-offset-[-0.50px] outline-neutral-800" />
              <div className="self-stretch flex flex-col justify-start items-start gap-3">
                <span className="text-white text-2xl font-medium font-['Inter'] leading-7">
                  146
                </span>
                <span className="text-green-500 text-sm font-normal font-['Inter'] leading-4">
                  12 currently open
                </span>
              </div>
            </div>

            {/* Card 3: Tables */}
            <div className="p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-300/20 flex flex-col justify-start items-start gap-3.5 shadow-xl">
              <div className="self-stretch inline-flex justify-between items-center">
                <span className="text-white text-lg font-semibold font-['Inter']">
                  Tables
                </span>
              </div>
              <div className="self-stretch h-0 outline outline-1 outline-offset-[-0.50px] outline-neutral-800" />
              <div className="self-stretch flex flex-col justify-start items-start gap-3">
                <span className="text-white text-2xl font-medium font-['Inter'] leading-7">
                  {branch.tablesCount ? `${Math.round(branch.tablesCount * 0.75)} / ${branch.tablesCount}` : '18 / 24'}
                </span>
                <span className="text-green-500 text-sm font-normal font-['Inter'] leading-4">
                  {branch.occupancy ? `${branch.occupancy}% occupancy` : '75% occupancy'}
                </span>
              </div>
            </div>

            {/* Card 4: Staff on duty */}
            <div className="p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-300/20 flex flex-col justify-start items-start gap-3.5 shadow-xl">
              <div className="self-stretch inline-flex justify-between items-center">
                <span className="text-white text-lg font-semibold font-['Inter']">
                  Staff on duty
                </span>
              </div>
              <div className="self-stretch h-0 outline outline-1 outline-offset-[-0.50px] outline-neutral-800" />
              <div className="self-stretch flex flex-col justify-start items-start gap-3">
                <span className="text-white text-2xl font-medium font-['Inter'] leading-7">
                  16
                </span>
                <span className="text-green-500 text-sm font-normal font-['Inter'] leading-4">
                  4 shifts starting soon
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Two-Column Section matching Figma snippet */}
          <div className="flex flex-col lg:flex-row items-stretch gap-5">
            {/* Column 1 (Left): Today’s Operations */}
            <div className="flex-1 p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-800 flex flex-col justify-start items-start gap-3.5 shadow-xl">
              <div className="self-stretch flex flex-col justify-start items-start gap-2">
                <h3 className="text-white text-xl font-medium font-['Poppins'] leading-6">
                  Today’s Operations
                </h3>
                <span className="text-stone-300 text-sm font-normal font-['Inter'] leading-4">
                  Real-time branch activity
                </span>
              </div>

              <div className="self-stretch h-0 outline outline-1 outline-offset-[-0.50px] outline-neutral-800" />

              <div className="self-stretch flex flex-col justify-start items-start gap-1.5">
                {/* Kitchen Operation */}
                <div className="self-stretch px-3.5 py-3 bg-neutral-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 flex justify-between items-center gap-2">
                  <div className="flex justify-start items-center gap-2">
                    <div className="size-2 bg-amber-500 rounded-full shrink-0" />
                    <span className="text-white text-base font-medium font-['Poppins'] leading-5">
                      Kitchen
                    </span>
                  </div>
                  <span className="text-stone-300 text-base font-normal font-['Inter'] leading-5">
                    8 orders preparing
                  </span>
                </div>

                {/* Payments Operation */}
                <div className="self-stretch px-3.5 py-3 bg-neutral-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 flex justify-between items-center gap-2">
                  <div className="flex justify-start items-center gap-2">
                    <div className="size-2 bg-green-500 rounded-full shrink-0" />
                    <span className="text-white text-base font-medium font-['Poppins'] leading-5">
                      Payments
                    </span>
                  </div>
                  <span className="text-stone-300 text-base font-normal font-['Inter'] leading-5">
                    3 pending settlements
                  </span>
                </div>

                {/* Staff Operation */}
                <div className="self-stretch px-3.5 py-3 bg-neutral-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 flex justify-between items-center gap-2">
                  <div className="flex justify-start items-center gap-2">
                    <div className="size-2 bg-yellow-400 rounded-full shrink-0" />
                    <span className="text-white text-base font-medium font-['Poppins'] leading-5">
                      Staff
                    </span>
                  </div>
                  <span className="text-stone-300 text-base font-normal font-['Inter'] leading-5">
                    All shifts covered
                  </span>
                </div>
              </div>
            </div>

            {/* Column 2 (Right): Branch Information */}
            <div className="w-full lg:w-[460px] p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-800 flex flex-col justify-start items-center gap-4 shadow-xl">
              <div className="self-stretch flex flex-col justify-start items-start gap-1.5">
                <h3 className="text-white text-lg font-semibold font-['Poppins']">
                  Branch Information
                </h3>
                <span className="text-neutral-500 text-sm font-medium font-['Poppins'] leading-4">
                  Location and management details
                </span>
              </div>

              <div className="self-stretch px-4 py-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-800 flex flex-col justify-start items-center gap-3">
                {/* Manager */}
                <div className="self-stretch flex justify-between items-center">
                  <span className="text-neutral-500 text-base font-medium font-['Poppins'] leading-5">
                    Manager
                  </span>
                  <span className="text-white text-base font-medium font-['Inter'] leading-5">
                    {branch.manager}
                  </span>
                </div>

                {/* Phone */}
                <div className="self-stretch flex justify-between items-center">
                  <span className="text-neutral-500 text-base font-medium font-['Poppins'] leading-5">
                    Phone
                  </span>
                  <span className="text-white text-base font-medium font-['Inter'] leading-5">
                    {branch.contactNumber || '992548756'}
                  </span>
                </div>

                {/* Address */}
                <div className="self-stretch flex justify-between items-center">
                  <span className="text-neutral-500 text-base font-medium font-['Poppins'] leading-5">
                    Address
                  </span>
                  <span className="text-white text-base font-medium font-['Inter'] leading-5">
                    {branch.location}
                  </span>
                </div>

                {/* Operating hours */}
                <div className="self-stretch flex justify-between items-center">
                  <span className="text-neutral-500 text-base font-medium font-['Poppins'] leading-5">
                    Operating hours
                  </span>
                  <span className="text-white text-base font-medium font-['Inter'] leading-5">
                    {branch.hours || `${branch.openingTime || '09:00'} – ${branch.closingTime || '23:00'}`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tables Tab Content */}
      {activeSubTab === 'Tables' && (
        <div className="p-6 bg-neutral-900 rounded-xl outline outline-1 outline-neutral-800 space-y-4 animate-in fade-in duration-200">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-white">Live Floor Plan & Dining Tables</h3>
              <p className="text-sm text-neutral-400">Real-time occupancy for {branch.name}</p>
            </div>
            <div className="px-3 py-1.5 bg-green-500/10 text-green-400 border border-green-500/20 rounded-md text-xs font-medium">
              18 of 24 Occupied (75%)
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-2">
            {Array.from({ length: 24 }).map((_, idx) => {
              const tableNum = idx + 1;
              const isOccupied = tableNum <= 18;
              return (
                <div
                  key={tableNum}
                  className={`p-3 rounded-lg border flex flex-col items-center justify-center gap-1 transition-all ${
                    isOccupied
                      ? 'bg-amber-400/10 border-amber-400/30 text-amber-300'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                  }`}
                >
                  <span className="text-xs font-mono font-bold">T-{tableNum < 10 ? `0${tableNum}` : tableNum}</span>
                  <span className="text-[11px]">{isOccupied ? 'Guests seated' : 'Available'}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Menu Tab Content */}
      {activeSubTab === 'Menu' && (
        <div className="p-6 bg-neutral-900 rounded-xl outline outline-1 outline-neutral-800 space-y-4 animate-in fade-in duration-200">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-white">Branch Menu Availability</h3>
              <p className="text-sm text-neutral-400">Current seasonal items configured at {branch.name}</p>
            </div>
            <span className="text-xs text-neutral-400">Synchronized with central POS</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {[
              { name: 'Wood-Fired Ribeye', cat: 'Mains', price: '৳ 2,450', status: 'Available' },
              { name: 'Truffle Mushroom Risotto', cat: 'Mains', price: '৳ 1,850', status: 'Available' },
              { name: 'Charred Octopus with Romesco', cat: 'Starters', price: '৳ 1,600', status: 'Low Stock' },
              { name: 'Artisan Sourdough & Herb Butter', cat: 'Bakery', price: '৳ 650', status: 'Available' },
              { name: 'Smoked Vanilla Old Fashioned', cat: 'Bar', price: '৳ 1,200', status: 'Available' },
              { name: 'Dark Chocolate Ganache Tart', cat: 'Desserts', price: '৳ 950', status: 'Available' },
            ].map((dish, i) => (
              <div key={i} className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-medium text-white">{dish.name}</h4>
                  <span className="text-xs text-neutral-500">{dish.cat} · {dish.price}</span>
                </div>
                <span className="text-xs px-2 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/20">
                  {dish.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Staff Tab Content */}
      {activeSubTab === 'Staff' && (
        <div className="p-6 bg-neutral-900 rounded-xl outline outline-1 outline-neutral-800 space-y-4 animate-in fade-in duration-200">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-white">Active Duty Roster</h3>
              <p className="text-sm text-neutral-400">16 team members on shift at {branch.name}</p>
            </div>
            <span className="text-xs text-green-400 font-medium">All shifts covered</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
            {[
              { name: branch.manager, role: 'Branch Manager', shift: 'Morning / Evening' },
              { name: 'Chef Tariqul Islam', role: 'Head Chef', shift: '08:00 – 17:00' },
              { name: 'Nadia Rahman', role: 'Floor Supervisor', shift: '11:00 – 20:00' },
              { name: 'David Miller', role: 'Lead Bartender', shift: '15:00 – 23:30' },
            ].map((staff, idx) => (
              <div key={idx} className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg flex flex-col gap-1">
                <span className="text-sm font-semibold text-white">{staff.name}</span>
                <span className="text-xs text-amber-400">{staff.role}</span>
                <span className="text-[11px] text-neutral-500">{staff.shift}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EDIT BRANCH MODAL matching Snippet 2 */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-[560px] max-w-full p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-800 flex flex-col justify-start items-end gap-4 shadow-2xl animate-in fade-in scale-95 duration-150">
            {/* Modal Header */}
            <div className="w-full flex justify-between items-start">
              <div className="w-96 flex flex-col justify-start items-start gap-1">
                <h3 className="text-white text-lg font-medium font-['Poppins'] leading-5">
                  Edit Branch
                </h3>
                <p className="text-neutral-400 text-xs font-normal font-['Poppins'] leading-4">
                  Complete the details below, then save your changes.
                </p>
              </div>

              <button
                onClick={() => setIsEditOpen(false)}
                className="w-9 px-2.5 py-2 bg-gray-300/10 hover:bg-gray-300/20 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 flex justify-center items-center text-gray-200 transition-colors cursor-pointer"
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
                        placeholder="09:00"
                        className="w-full h-11 px-3.5 py-3 bg-neutral-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 text-stone-300 text-sm font-normal font-['Inter'] focus:outline-none focus:border-amber-400"
                      />
                      <ChevronDown className="size-4 text-stone-300 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
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
                      placeholder="23:00"
                      className="self-stretch h-11 px-3.5 py-3 bg-neutral-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 text-stone-300 text-sm font-normal font-['Inter'] focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer Buttons matching Figma snippet */}
              <div className="inline-flex justify-end items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
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
    </div>
  );
}
