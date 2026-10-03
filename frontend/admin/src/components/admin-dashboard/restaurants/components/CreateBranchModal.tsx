'use client';

import React, { useState } from 'react';
import {
  X,
  Check,
  Plus,
  ArrowLeft,
  Building2,
  MapPin,
  User,
  Users,
  Store,
  Phone,
  Mail,
  CheckCircle2,
} from 'lucide-react';
import { BranchItem, Manager, StaffMember, StaffRole, RestaurantBranch } from '../types';
import { MOCK_MANAGERS, MOCK_STAFF_POOL } from '../restaurantsData';

interface CreateBranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurant: RestaurantBranch | null;
  onSuccess: (newBranch: BranchItem) => void;
  onGoToRestaurants?: () => void;
}

export default function CreateBranchModal({
  isOpen,
  onClose,
  restaurant,
  onSuccess,
  onGoToRestaurants,
}: CreateBranchModalProps) {
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1: Branch Info
  const [branchName, setBranchName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');

  // Step 2: Location
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [postalCode, setPostalCode] = useState('');

  // Step 3: Staff
  const [staffRoleFilter, setStaffRoleFilter] = useState<string>('All');
  const [staffPool, setStaffPool] = useState<StaffMember[]>(MOCK_STAFF_POOL);
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>(['staff-1', 'staff-2']);
  const [isAddingNewStaff, setIsAddingNewStaff] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<StaffRole>('Cashier');

  // Step 4/5: Created branch reference
  const [createdBranch, setCreatedBranch] = useState<BranchItem | null>(null);

  if (!isOpen || !restaurant) return null;

  const handleClose = () => {
    setCurrentStep(1);
    setIsAddingNewStaff(false);
    onClose();
  };

  const toggleStaffSelection = (id: string) => {
    setSelectedStaffIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSaveNewStaff = () => {
    if (!newStaffName.trim()) return;
    const initials = newStaffName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
    const newStaff: StaffMember = {
      id: `staff-${Date.now()}`,
      name: newStaffName.trim(),
      role: newStaffRole,
      avatar: initials || 'ST',
      email: `${newStaffName.toLowerCase().replace(/\s+/g, '')}@tavonza.com`,
      shift: 'Branch Shift',
    };
    setStaffPool((prev) => [newStaff, ...prev]);
    setSelectedStaffIds((prev) => [...prev, newStaff.id]);
    setIsAddingNewStaff(false);
    setNewStaffName('');
  };

  const handleFinalCreate = () => {
    const assignedStaffMembers = staffPool.filter((s) => selectedStaffIds.includes(s.id));
    const newBranch: BranchItem = {
      id: `branch-${Date.now()}`,
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      name: branchName.trim() || `${restaurant.name} New Branch`,
      address: address.trim() || 'Main Boulevard',
      city: city.trim() || restaurant.city || 'Dhaka',
      country: country.trim() || restaurant.country || 'Bangladesh',
      postalCode: postalCode.trim() || '1000',
      phone: phoneNumber.trim() || restaurant.phone || '+880 2-0000000',
      email: emailAddress.trim() || `branch@${restaurant.name.toLowerCase().replace(/\s+/g, '')}.com`,
      status: 'Open',
      manager: restaurant.manager || MOCK_MANAGERS[0],
      staffCount: assignedStaffMembers.length || 7,
      assignedStaff: assignedStaffMembers,
      revenue: '$18,500/mo',
    };

    setCreatedBranch(newBranch);
    onSuccess(newBranch);
    setCurrentStep(5);
  };

  const filteredStaff = staffPool.filter((s) => {
    if (staffRoleFilter === 'All') return true;
    return s.role.toLowerCase() === staffRoleFilter.toLowerCase();
  });

  const staffRoleFilters = [
    'All',
    'Manager',
    'Assistant Manager',
    'Kitchen Staff',
    'Bartender',
    'Delivery Staff',
    'Waiter',
    'Cashier',
  ];

  const canContinueStep1 = branchName.trim().length > 0;
  const canContinueStep2 = address.trim().length > 0;

  return (
    <div
      className="fixed top-20 left-0 md:left-64 right-0 bottom-0 z-40 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-[500px] max-h-[calc(100vh-6.5rem)] bg-neutral-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300 my-auto ${
          currentStep === 5 ? 'max-w-[480px]' : ''
        }`}
      >
        {/* Modal Header (Steps 1 - 4) */}
        {currentStep < 5 && (
          <div className="h-16 px-6 py-3.5 border-b border-slate-800 flex items-center justify-between flex-shrink-0 bg-neutral-900">
            <div>
              <h2 className="text-xl font-medium text-white font-sans leading-5">
                Create Branch
              </h2>
              <div className="text-xs font-light text-neutral-400 leading-5">
                {restaurant.name}
              </div>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 1: BRANCH INFORMATION */}
        {/* ========================================================================= */}
        {currentStep === 1 && (
          <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh] custom-scrollbar">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-400/15 border border-yellow-400/30 rounded-[10px] text-yellow-500 text-xs font-medium">
              <Store className="w-3.5 h-3.5" />
              <span>Branch of {restaurant.name}</span>
            </div>

            <div>
              <h3 className="text-white text-base font-semibold">Branch Information</h3>
              <p className="text-slate-500 text-xs mt-0.5">
                Basic details for this branch location.
              </p>
            </div>

            {/* Branch Name */}
            <div className="space-y-2">
              <label className="text-white text-xs font-normal leading-4">Branch Name *</label>
              <div className="h-9 px-2.5 bg-zinc-800 rounded-[10px] border border-slate-800 flex items-center focus-within:border-amber-400">
                <input
                  type="text"
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  placeholder="e.g Tavonza Uttara"
                  className="w-full bg-transparent text-xs text-white placeholder-stone-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <label className="text-white text-xs font-normal leading-4">Phone Number</label>
              <div className="h-9 px-2.5 bg-zinc-800 rounded-[10px] border border-slate-800 flex items-center focus-within:border-amber-400">
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Branch phone number..."
                  className="w-full bg-transparent text-xs text-white placeholder-stone-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-2">
              <label className="text-white text-xs font-normal leading-4">Email Address</label>
              <div className="h-9 px-2.5 bg-zinc-800 rounded-[10px] border border-slate-800 flex items-center focus-within:border-amber-400">
                <input
                  type="email"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  placeholder="Branch email...."
                  className="w-full bg-transparent text-xs text-white placeholder-stone-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="pt-4 flex justify-end">
              <button
                type="button"
                disabled={!canContinueStep1}
                onClick={() => setCurrentStep(2)}
                className="h-8 px-5 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-40 text-white text-xs font-semibold rounded-[10px] transition-colors cursor-pointer shadow-md shadow-amber-500/20"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: BRANCH LOCATION */}
        {/* ========================================================================= */}
        {currentStep === 2 && (
          <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh] custom-scrollbar">
            <div>
              <h3 className="text-white text-base font-semibold">Branch Location</h3>
              <p className="text-slate-500 text-xs mt-0.5">Where is this branch located?</p>
            </div>

            {/* Full Address */}
            <div className="space-y-2">
              <label className="text-white text-xs font-normal leading-4">Full Address *</label>
              <div className="h-9 px-2.5 bg-zinc-800 rounded-[10px] border border-slate-800 flex items-center focus-within:border-amber-400">
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter full address"
                  className="w-full bg-transparent text-xs text-white placeholder-stone-400 focus:outline-none"
                />
              </div>
            </div>

            {/* City & Country */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-white text-xs font-normal leading-4">City</label>
                <div className="h-9 px-2.5 bg-zinc-800 rounded-[10px] border border-slate-800 flex items-center focus-within:border-amber-400">
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
                    className="w-full bg-transparent text-xs text-white placeholder-stone-400 focus:outline-none"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-white text-xs font-normal leading-4">Country</label>
                <div className="h-9 px-2.5 bg-zinc-800 rounded-[10px] border border-slate-800 flex items-center focus-within:border-amber-400">
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="Country"
                    className="w-full bg-transparent text-xs text-white placeholder-stone-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Postal Code */}
            <div className="space-y-2">
              <label className="text-white text-xs font-normal leading-4">Postal Code</label>
              <div className="h-9 px-2.5 bg-zinc-800 rounded-[10px] border border-slate-800 flex items-center focus-within:border-amber-400">
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="Postal Code..."
                  className="w-full bg-transparent text-xs text-white placeholder-stone-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="pt-4 flex items-center justify-between border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="h-8 px-5 rounded-[10px] border border-neutral-500 hover:bg-zinc-800 text-neutral-400 text-xs font-normal transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                disabled={!canContinueStep2}
                onClick={() => setCurrentStep(3)}
                className="h-8 px-5 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-40 text-white text-xs font-semibold rounded-[10px] transition-colors shadow-md shadow-amber-500/20"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: ASSIGN BRANCH STAFF */}
        {/* ========================================================================= */}
        {currentStep === 3 && (
          <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh] custom-scrollbar">
            <div>
              <h3 className="text-white text-base font-semibold">Assign Branch Staff</h3>
              <p className="text-slate-500 text-xs mt-0.5">
                Select or create staff for this branch.
              </p>
            </div>

            {/* Role Filter Pills */}
            <div className="space-y-1.5">
              <div className="text-white text-xs font-medium">Filter by Role</div>
              <div className="flex flex-wrap gap-1.5">
                {staffRoleFilters.map((role) => {
                  const isActive = staffRoleFilter === role;
                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setStaffRoleFilter(role)}
                      className={`h-7 px-3 rounded-[8px] text-[11px] font-medium transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-white text-stone-950 font-semibold'
                          : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
                      }`}
                    >
                      {role}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Staff List */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
              {filteredStaff.map((staff) => {
                const isChecked = selectedStaffIds.includes(staff.id);
                return (
                  <div
                    key={staff.id}
                    onClick={() => toggleStaffSelection(staff.id)}
                    className={`p-2.5 rounded-[10px] border flex items-center justify-between transition-all cursor-pointer ${
                      isChecked
                        ? 'bg-zinc-800/90 border-amber-400/80 shadow-sm'
                        : 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                          isChecked
                            ? 'bg-amber-400 border-amber-400 text-white'
                            : 'border-zinc-600'
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <div className="w-9 h-9 rounded-full bg-white text-black font-semibold text-xs flex items-center justify-center flex-shrink-0">
                        {staff.avatar}
                      </div>
                      <div>
                        <div className="text-white text-sm font-semibold">{staff.name}</div>
                        <div className="text-zinc-400 text-xs">{staff.role}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick New Staff Form */}
            {isAddingNewStaff ? (
              <div className="p-3 bg-zinc-800 border border-zinc-700 rounded-[10px] space-y-2">
                <div className="text-xs font-semibold text-white">Create Staff Member</div>
                <input
                  type="text"
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  placeholder="Staff Name"
                  className="w-full h-8 px-2.5 bg-zinc-900 border border-zinc-700 rounded text-xs text-white"
                />
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setIsAddingNewStaff(false)}
                    className="h-7 px-3 text-xs text-zinc-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveNewStaff}
                    className="h-7 px-3 bg-amber-400 text-white text-xs font-semibold rounded"
                  >
                    Add
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAddingNewStaff(true)}
                className="w-full p-2.5 rounded-[10px] border border-dashed border-zinc-600 hover:border-zinc-400 text-white text-sm flex items-center justify-center gap-2 hover:bg-zinc-800/40 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Staff</span>
              </button>
            )}

            {/* Footer */}
            <div className="pt-4 flex items-center justify-between border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="h-8 px-5 rounded-[10px] border border-neutral-500 hover:bg-zinc-800 text-neutral-400 text-xs font-normal transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="h-8 px-5 bg-yellow-500 hover:bg-yellow-400 text-white text-xs font-semibold rounded-[10px] transition-colors shadow-md shadow-amber-500/20"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 4: REVIEW & CREATE BRANCH */}
        {/* ========================================================================= */}
        {currentStep === 4 && (
          <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh] custom-scrollbar">
            <div>
              <h3 className="text-white text-base font-semibold">Review & Create Branch</h3>
              <p className="text-slate-500 text-xs mt-0.5">
                Confirm details before creating this branch.
              </p>
            </div>

            {/* Highlight Banner */}
            <div className="p-3 bg-zinc-900 border border-zinc-700 rounded-[10px] flex items-center gap-3">
              <Building2 className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <div>
                <div className="text-white text-xs font-semibold">New Branch</div>
                <div className="text-slate-400 text-xs">
                  Confirm details before creating this branch.
                </div>
              </div>
            </div>

            {/* Summary Rows */}
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-[10px] border border-neutral-800 bg-zinc-900/60 flex items-center justify-between">
                <span className="text-zinc-400">Branch Name</span>
                <span className="text-zinc-200 font-semibold">{branchName || 'Branch'}</span>
              </div>
              <div className="p-2.5 rounded-[10px] border border-neutral-800 bg-zinc-900/60 flex items-center justify-between">
                <span className="text-zinc-400">Restaurant</span>
                <span className="text-zinc-200 font-semibold">{restaurant.name}</span>
              </div>
              <div className="p-2.5 rounded-[10px] border border-neutral-800 bg-zinc-900/60 flex items-center justify-between">
                <span className="text-zinc-400">Location</span>
                <span className="text-zinc-200 font-semibold">
                  {address ? `${address}, ${city || restaurant.city}` : '--'}
                </span>
              </div>
              <div className="p-2.5 rounded-[10px] border border-neutral-800 bg-zinc-900/60 flex items-center justify-between">
                <span className="text-zinc-400">Manager</span>
                <span className="text-zinc-200 font-semibold">
                  {restaurant.manager?.name || '--'}
                </span>
              </div>
              <div className="p-2.5 rounded-[10px] border border-neutral-800 bg-zinc-900/60 flex items-center justify-between">
                <span className="text-zinc-400">Staff</span>
                <span className="text-zinc-200 font-semibold">{selectedStaffIds.length} Assigned</span>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-4 flex items-center justify-between border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="h-8 px-5 rounded-[10px] border border-neutral-500 hover:bg-zinc-800 text-neutral-400 text-xs font-normal transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleFinalCreate}
                className="h-8 px-5 bg-yellow-500 hover:bg-yellow-400 text-white text-xs font-semibold rounded-[10px] transition-colors shadow-md shadow-amber-500/20"
              >
                Create Branch
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 5: SUCCESS SCREEN (Exact Match to User Snippet) */}
        {/* ========================================================================= */}
        {currentStep === 5 && (
          <div className="p-8 flex flex-col items-center justify-center text-center space-y-6 animate-in zoom-in-95 duration-200">
            {/* Rosette Checkmark Badge */}
            <div className="relative flex items-center justify-center">
              <div className="absolute w-24 h-24 rounded-full bg-emerald-500/20 blur-xl animate-pulse" />
              <svg
                className="w-20 h-20 text-white drop-shadow-[0_0_15px_rgba(34,197,94,0.4)]"
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M20.5 4.3C22.4 3 25.6 3 27.5 4.3C28.8 5.2 30.5 5.5 32 5.1C34.3 4.5 36.8 5.9 37.6 8.2C38.1 9.7 39.4 10.9 40.9 11.4C43.2 12.2 44.6 14.7 44 17C43.6 18.5 43.9 20.2 44.8 21.5C46.1 23.4 46.1 26.6 44.8 28.5C43.9 29.8 43.6 31.5 44 33C44.6 35.3 43.2 37.8 40.9 38.6C39.4 39.1 38.1 40.3 37.6 41.8C36.8 44.1 34.3 45.5 32 44.9C30.5 44.5 28.8 44.8 27.5 45.7C25.6 47 22.4 47 20.5 45.7C19.2 44.8 17.5 44.5 16 44.9C13.7 45.5 11.2 44.1 10.4 41.8C9.9 40.3 8.6 39.1 7.1 38.6C4.8 37.8 3.4 35.3 4 33C4.4 31.5 4.1 29.8 3.2 28.5C1.9 26.6 1.9 23.4 3.2 21.5C4.1 20.2 4.4 18.5 4 17C3.4 14.7 4.8 12.2 7.1 11.4C8.6 10.9 9.9 9.7 10.4 8.2C11.2 5.9 13.7 4.5 16 5.1C17.5 5.5 19.2 5.2 20.5 4.3Z"
                  stroke="currentColor"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M16 24.5L21.5 30L32 18"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* Text */}
            <div className="space-y-1.5">
              <h2 className="text-2xl sm:text-3xl font-semibold text-white font-sans tracking-tight">
                Branch Created Successfully!
              </h2>
              <p className="text-zinc-500 text-sm sm:text-base font-normal">
                New branch has been added to {restaurant.name}.
              </p>
            </div>

            {/* Summary Box */}
            <div className="w-full max-w-[320px] bg-neutral-900 border border-zinc-800 rounded-[10px] p-4 text-left space-y-2.5 shadow-inner">
              <div className="flex items-center gap-3 text-white text-sm font-medium">
                <Building2 className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                <span className="truncate">{restaurant.name}</span>
              </div>
              <div className="flex items-center gap-3 text-white text-sm font-medium">
                <Store className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                <span className="truncate">{createdBranch?.name || 'Branch'}</span>
              </div>
              <div className="flex items-center gap-3 text-zinc-400 text-sm font-medium">
                <MapPin className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                <span className="truncate">
                  {createdBranch?.address ? `${createdBranch.city}, ${createdBranch.country}` : 'Location not set'}
                </span>
              </div>
              <div className="flex items-center gap-3 text-zinc-400 text-sm font-medium">
                <User className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                <span className="truncate">{restaurant.manager?.name || 'No manager'}</span>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-center gap-3 pt-2 w-full">
              <button
                type="button"
                onClick={handleClose}
                className="h-8 px-5 bg-white hover:bg-zinc-100 text-stone-950 text-xs font-semibold rounded-[10px] transition-colors"
              >
                View Branches
              </button>
              <button
                type="button"
                onClick={() => {
                  handleClose();
                  if (onGoToRestaurants) onGoToRestaurants();
                }}
                className="h-8 px-5 bg-yellow-500 hover:bg-yellow-400 text-white text-xs font-semibold rounded-[10px] transition-colors shadow-md shadow-amber-500/20"
              >
                Go to Restaurants
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
