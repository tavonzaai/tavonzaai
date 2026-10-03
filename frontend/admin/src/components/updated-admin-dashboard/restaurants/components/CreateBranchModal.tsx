'use client';

import React, { useState } from 'react';
import {
  X,
  Check,
  ChevronLeft,
  ChevronRight,
  Search,
  MapPin,
  Store,
  User,
  Users,
  Plus,
  Building2,
  Phone,
  Mail,
  ChevronDown,
} from 'lucide-react';
import { BranchItem, Manager, StaffMember, RestaurantBranch } from '../types';
import { MOCK_MANAGERS, MOCK_STAFF_POOL } from '../restaurantsData';

interface CreateBranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurant: RestaurantBranch | null;
  onSuccess: (newBranch: BranchItem) => void;
  onGoToRestaurants?: () => void;
}

const STEP_LABELS = [
  { step: 1, title: 'BRANCH INFO' },
  { step: 2, title: 'LOCATION' },
  { step: 3, title: 'MANAGER' },
  { step: 4, title: 'STAFF' },
  { step: 5, title: 'REVIEW' },
];

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

  // Step 3: Manager
  const [managerSearch, setManagerSearch] = useState('');
  const [managersList, setManagersList] = useState<Manager[]>([
    {
      id: 'mgr-1',
      name: 'Sarah Ahmed',
      role: 'Restaurant Manager',
      email: 'sarah@tavonza.com',
      avatar: 'SA',
    },
    {
      id: 'mgr-2',
      name: 'Rafi Islam',
      role: 'Restaurant Manager',
      email: 'rafi@tavonza.com',
      avatar: 'RI',
    },
    {
      id: 'mgr-3',
      name: 'Nadia Chowdhury',
      role: 'Restaurant Manager',
      email: 'nadia@tavonza.com',
      avatar: 'NC',
    },
    {
      id: 'mgr-4',
      name: 'Arif Hossain',
      role: 'Assistant Manager',
      email: 'arif@tavonza.com',
      avatar: 'AH',
    },
  ]);
  const [selectedManager, setSelectedManager] = useState<Manager | null>(managersList[0]);
  const [isCreatingManager, setIsCreatingManager] = useState(false);
  const [newMgrName, setNewMgrName] = useState('');
  const [newMgrRole, setNewMgrRole] = useState('Branch Manager');
  const [newMgrEmail, setNewMgrEmail] = useState('');

  // Step 4: Staff
  const [staffRoleFilter, setStaffRoleFilter] = useState<string>('All');
  const [staffList, setStaffList] = useState<StaffMember[]>([
    { id: 'st-1', name: 'John Smith', role: 'Cashier', avatar: 'JS', email: 'john.smith@tavonza.com' },
    { id: 'st-2', name: 'Michael Lee', role: 'Waiter', avatar: 'ML', email: 'michael.lee@tavonza.com' },
    { id: 'st-3', name: 'David Khan', role: 'Kitchen Staff', avatar: 'DK', email: 'david.khan@tavonza.com' },
    { id: 'st-4', name: 'Emma Wilson', role: 'Bartender', avatar: 'EW', email: 'emma.w@tavonza.com' },
    { id: 'st-5', name: 'Priya Sen', role: 'Delivery Staff', avatar: 'PS', email: 'priya.s@tavonza.com' },
    { id: 'st-6', name: 'Omar Faruk', role: 'Waiter', avatar: 'OF', email: 'omar.f@tavonza.com' },
    { id: 'st-7', name: 'Lisa Park', role: 'Cashier', avatar: 'LP', email: 'lisa.p@tavonza.com' },
  ]);
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>(['st-1', 'st-2', 'st-3']);
  const [isCreatingStaff, setIsCreatingStaff] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState('Cashier');

  // Step 5: Created state
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdBranch, setCreatedBranch] = useState<BranchItem | null>(null);

  if (!isOpen || !restaurant) return null;

  const handleClose = () => {
    setCurrentStep(1);
    setIsSuccess(false);
    onClose();
  };

  const handleCreateNewManager = () => {
    if (!newMgrName.trim()) return;
    const initials = newMgrName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
    const newMgr: Manager = {
      id: `mgr-${Date.now()}`,
      name: newMgrName.trim(),
      role: newMgrRole,
      email: newMgrEmail.trim() || `${newMgrName.toLowerCase().replace(/\s+/g, '')}@tavonza.com`,
      avatar: initials || 'MG',
    };
    setManagersList((prev) => [newMgr, ...prev]);
    setSelectedManager(newMgr);
    setIsCreatingManager(false);
    setNewMgrName('');
    setNewMgrEmail('');
  };

  const toggleStaffSelection = (id: string) => {
    setSelectedStaffIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleCreateNewStaff = () => {
    if (!newStaffName.trim()) return;
    const initials = newStaffName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
    const newStaffMember: StaffMember = {
      id: `st-${Date.now()}`,
      name: newStaffName.trim(),
      role: newStaffRole,
      avatar: initials || 'ST',
      email: `${newStaffName.toLowerCase().replace(/\s+/g, '')}@tavonza.com`,
    };
    setStaffList((prev) => [newStaffMember, ...prev]);
    setSelectedStaffIds((prev) => [...prev, newStaffMember.id]);
    setIsCreatingStaff(false);
    setNewStaffName('');
  };

  const handleFinalSubmit = () => {
    const assignedStaffMembers = staffList.filter((s) => selectedStaffIds.includes(s.id));
    const newBranch: BranchItem = {
      id: `b-${restaurant.id}-${Date.now()}`,
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      name: branchName.trim() || `${restaurant.name} Uttara`,
      address: address.trim() || 'Uttara, Dhaka',
      city: city.trim() || 'Uttara',
      country: country.trim() || 'Dhaka',
      postalCode: postalCode.trim() || '1230',
      phone: phoneNumber.trim() || '+880 2-8911223',
      email: emailAddress.trim() || `uttara@tavonza.com`,
      status: 'Open',
      manager: selectedManager || MOCK_MANAGERS[0],
      staffCount: assignedStaffMembers.length || 7,
      assignedStaff: assignedStaffMembers,
      revenue: '৳24,500/day',
    };

    setCreatedBranch(newBranch);
    onSuccess(newBranch);
    setIsSuccess(true);
  };

  // Filtered managers for Step 3
  const filteredManagers = managersList.filter((m) =>
    m.name.toLowerCase().includes(managerSearch.toLowerCase()) ||
    m.role.toLowerCase().includes(managerSearch.toLowerCase()) ||
    m.email.toLowerCase().includes(managerSearch.toLowerCase())
  );

  // Filtered staff for Step 4
  const filteredStaff = staffList.filter((s) => {
    if (staffRoleFilter === 'All') return true;
    return s.role.toLowerCase() === staffRoleFilter.toLowerCase();
  });

  const staffRoleFilters = [
    'All',
    'Manager',
    'Assistant Manager',
    'Cashier',
    'Waiter',
    'Kitchen Staff',
    'Bartender',
    'Delivery Staff',
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl bg-[#FAF7F2] rounded-3xl overflow-hidden shadow-2xl border border-zinc-300 text-zinc-900 flex flex-col max-h-[92vh] my-auto animate-in zoom-in-95 duration-200"
      >
        {/* ========================================================================= */}
        {/* 1. TOP STEPPER HEADER BAR (Matches Figma Images 2 - 5) */}
        {/* ========================================================================= */}
        <div className="bg-[#FAF7F2] border-b border-[#E5E0D8] p-4 sm:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
          {/* Left: Back button + Title & Step Count */}
          <div className="flex items-center gap-3.5">
            <button
              type="button"
              onClick={() => {
                if (currentStep > 1) setCurrentStep((prev) => prev - 1);
                else handleClose();
              }}
              className="w-9 h-9 rounded-full bg-white border border-[#E5E0D8] hover:bg-zinc-100 text-zinc-800 flex items-center justify-center transition-colors cursor-pointer shadow-sm shrink-0"
              title="Back"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div>
              <h2 className="text-lg sm:text-xl font-serif font-bold text-zinc-900 tracking-tight leading-tight">
                Create Branch
              </h2>
              <p className="text-xs text-zinc-500 font-mono mt-0.5">
                {restaurant.name} · Step {currentStep} of 5
              </p>
            </div>
          </div>

          {/* Right: Stepper Progress Dots (1 to 5) */}
          <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto custom-scrollbar w-full sm:w-auto justify-between sm:justify-end py-1">
            {STEP_LABELS.map((item, index) => {
              const isDone = item.step < currentStep;
              const isActive = item.step === currentStep;

              return (
                <React.Fragment key={item.step}>
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Circle Indicator */}
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isDone
                          ? 'bg-[#D97706] text-white shadow-sm'
                          : isActive
                          ? 'bg-[#18181B] text-white shadow-md'
                          : 'bg-[#E5E0D8] text-zinc-500'
                      }`}
                    >
                      {isDone ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : item.step}
                    </div>

                    {/* Step Name Label */}
                    <span
                      className={`text-[10px] sm:text-xs font-bold font-mono tracking-wider ${
                        isActive
                          ? 'text-zinc-900'
                          : isDone
                          ? 'text-[#D97706]'
                          : 'text-zinc-400'
                      }`}
                    >
                      {item.title}
                    </span>
                  </div>

                  {/* Connecting Line */}
                  {index < STEP_LABELS.length - 1 && (
                    <div
                      className={`h-[2px] w-4 sm:w-6 rounded-full shrink-0 ${
                        item.step < currentStep ? 'bg-[#D97706]' : 'bg-[#E5E0D8]'
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. BODY CONTENT (Steps 1 to 5 or Success) */}
        {/* ========================================================================= */}
        <div className="p-6 sm:p-10 overflow-y-auto custom-scrollbar flex-1">
          {/* ======================================================================= */}
          {/* SUCCESS SCREEN */}
          {/* ======================================================================= */}
          {isSuccess ? (
            <div className="flex flex-col items-center justify-center text-center space-y-6 py-6 animate-in zoom-in-95 duration-200">
              <div className="w-20 h-20 rounded-full bg-emerald-500/15 border-2 border-emerald-500 text-emerald-600 flex items-center justify-center shadow-xl">
                <Check className="w-10 h-10 stroke-[3]" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-zinc-900">
                  Branch Created Successfully!
                </h3>
                <p className="text-zinc-500 text-sm">
                  New branch location added to {restaurant.name}.
                </p>
              </div>

              <div className="w-full max-w-md bg-white border border-[#E5E0D8] rounded-2xl p-5 text-left space-y-3 shadow-sm">
                <div className="flex items-center justify-between pb-2 border-b border-[#E5E0D8] text-xs">
                  <span className="text-zinc-400 font-medium">Branch Name</span>
                  <span className="text-zinc-900 font-bold">{createdBranch?.name}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-[#E5E0D8] text-xs">
                  <span className="text-zinc-400 font-medium">Location</span>
                  <span className="text-zinc-800 font-semibold">{createdBranch?.address}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400 font-medium">Manager</span>
                  <span className="text-zinc-900 font-semibold">{createdBranch?.manager.name}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="h-11 px-6 rounded-2xl bg-[#18181B] hover:bg-black text-white font-bold text-xs transition-all shadow-md cursor-pointer"
                >
                  View Branches
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* =================================================================== */}
              {/* STEP 1: BRANCH INFO (Figma Image 2) */}
              {/* =================================================================== */}
              {currentStep === 1 && (
                <div className="max-w-xl mx-auto space-y-6 animate-in fade-in duration-200">
                  {/* Pill Badge */}
                  <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-[#FFF9EE] border border-[#FDE68A] text-[#B45309] rounded-full text-xs font-medium shadow-sm">
                    <Store className="w-3.5 h-3.5" />
                    <span>Branch of {restaurant.name}</span>
                  </div>

                  <div>
                    <h3 className="font-serif text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
                      Branch Information
                    </h3>
                    <p className="text-zinc-500 text-xs sm:text-sm mt-1">
                      Basic details for this branch location.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Branch Name Input */}
                    <div>
                      <label className="text-xs font-semibold text-zinc-700 block mb-1.5">
                        Branch Name
                      </label>
                      <input
                        type="text"
                        value={branchName}
                        onChange={(e) => setBranchName(e.target.value)}
                        placeholder="e.g. Tavonza Uttara"
                        className="w-full h-11 px-4 bg-white border border-[#E5E0D8] rounded-xl text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-amber-500 shadow-sm"
                      />
                    </div>

                    {/* Phone Number Input */}
                    <div>
                      <label className="text-xs font-semibold text-zinc-700 block mb-1.5">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="Branch phone number"
                        className="w-full h-11 px-4 bg-white border border-[#E5E0D8] rounded-xl text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-amber-500 shadow-sm"
                      />
                    </div>

                    {/* Email Address Input */}
                    <div>
                      <label className="text-xs font-semibold text-zinc-700 block mb-1.5">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={emailAddress}
                        onChange={(e) => setEmailAddress(e.target.value)}
                        placeholder="Branch email"
                        className="w-full h-11 px-4 bg-white border border-[#E5E0D8] rounded-xl text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-amber-500 shadow-sm"
                      />
                    </div>
                  </div>

                  {/* Footer Action */}
                  <div className="pt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="h-11 px-7 bg-[#18181B] hover:bg-black text-white font-bold text-xs sm:text-sm rounded-2xl flex items-center gap-2 transition-all cursor-pointer shadow-md active:scale-95"
                    >
                      <span>Continue</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* =================================================================== */}
              {/* STEP 2: LOCATION (Figma Image 3) */}
              {/* =================================================================== */}
              {currentStep === 2 && (
                <div className="max-w-xl mx-auto space-y-6 animate-in fade-in duration-200">
                  <div>
                    <h3 className="font-serif text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
                      Branch Location
                    </h3>
                    <p className="text-zinc-500 text-xs sm:text-sm mt-1">
                      Where is this branch located?
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Full Address */}
                    <div>
                      <label className="text-xs font-semibold text-zinc-700 block mb-1.5">
                        Full Address
                      </label>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Enter full address"
                        className="w-full h-11 px-4 bg-white border border-[#E5E0D8] rounded-xl text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-amber-500 shadow-sm"
                      />
                    </div>

                    {/* City & Country Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-zinc-700 block mb-1.5">
                          City
                        </label>
                        <input
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="City"
                          className="w-full h-11 px-4 bg-white border border-[#E5E0D8] rounded-xl text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-amber-500 shadow-sm"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-zinc-700 block mb-1.5">
                          Country
                        </label>
                        <input
                          type="text"
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          placeholder="Country"
                          className="w-full h-11 px-4 bg-white border border-[#E5E0D8] rounded-xl text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-amber-500 shadow-sm"
                        />
                      </div>
                    </div>

                    {/* Postal Code */}
                    <div>
                      <label className="text-xs font-semibold text-zinc-700 block mb-1.5">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        placeholder="Postal Code"
                        className="w-full h-11 px-4 bg-white border border-[#E5E0D8] rounded-xl text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-amber-500 shadow-sm"
                      />
                    </div>

                    {/* Map Preview Box */}
                    <div className="bg-[#F4F0E8]/70 border border-[#E5E0D8] rounded-2xl p-8 flex flex-col items-center justify-center text-zinc-400 gap-2 shadow-inner">
                      <div className="w-10 h-10 rounded-full bg-white border border-[#E5E0D8] flex items-center justify-center text-zinc-400">
                        <MapPin className="w-5 h-5 text-amber-500" />
                      </div>
                      <span className="text-xs font-medium text-zinc-500">Map Preview</span>
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="pt-4 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="h-11 px-6 bg-white border border-[#E5E0D8] hover:bg-zinc-100 text-zinc-800 font-semibold text-xs rounded-xl transition-all cursor-pointer shadow-sm"
                    >
                      Back
                    </button>

                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="h-11 px-7 bg-[#18181B] hover:bg-black text-white font-bold text-xs sm:text-sm rounded-2xl flex items-center gap-2 transition-all cursor-pointer shadow-md active:scale-95"
                    >
                      <span>Continue</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* =================================================================== */}
              {/* STEP 3: MANAGER (Figma Image 4) */}
              {/* =================================================================== */}
              {currentStep === 3 && (
                <div className="max-w-xl mx-auto space-y-6 animate-in fade-in duration-200">
                  <div>
                    <h3 className="font-serif text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
                      Assign Branch Manager
                    </h3>
                    <p className="text-zinc-500 text-xs sm:text-sm mt-1">
                      Who will manage this branch's daily operations?
                    </p>
                  </div>

                  {/* Search bar */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={managerSearch}
                      onChange={(e) => setManagerSearch(e.target.value)}
                      placeholder="Search manager..."
                      className="w-full h-11 pl-10 pr-4 bg-white border border-[#E5E0D8] rounded-xl text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-amber-500 shadow-sm"
                    />
                  </div>

                  {/* Manager List */}
                  <div className="space-y-3">
                    {filteredManagers.map((mgr) => {
                      const isSelected = selectedManager?.id === mgr.id;
                      return (
                        <div
                          key={mgr.id}
                          onClick={() => setSelectedManager(mgr)}
                          className={`bg-white rounded-2xl p-4 border flex items-center justify-between gap-4 transition-all cursor-pointer shadow-sm ${
                            isSelected
                              ? 'border-amber-500 ring-2 ring-amber-400/20 bg-amber-50/30'
                              : 'border-[#E5E0D8] hover:border-zinc-400'
                          }`}
                        >
                          <div className="flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-full bg-[#F4F0E8] border border-[#E5E0D8] text-zinc-800 font-bold text-xs flex items-center justify-center shrink-0">
                              {mgr.avatar}
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-zinc-900 leading-tight">
                                {mgr.name}
                              </h4>
                              <p className="text-xs text-zinc-400 mt-0.5 font-mono">
                                {mgr.role} · {mgr.email}
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedManager(mgr);
                            }}
                            className={`h-9 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-[#18181B] text-white shadow-sm'
                                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                            }`}
                          >
                            {isSelected ? 'Selected' : 'Select'}
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Divider or Create Manager */}
                  <div className="relative py-2 flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-[#E5E0D8]" />
                    </div>
                    <span className="relative px-3 bg-[#FAF7F2] text-xs font-mono text-zinc-400 uppercase">
                      or
                    </span>
                  </div>

                  {/* Create New Manager Option */}
                  {isCreatingManager ? (
                    <div className="p-4 bg-white border-2 border-amber-400/80 rounded-2xl space-y-3 shadow-md animate-in fade-in">
                      <h4 className="text-xs font-bold text-amber-900 uppercase">Create New Manager</h4>
                      <input
                        type="text"
                        value={newMgrName}
                        onChange={(e) => setNewMgrName(e.target.value)}
                        placeholder="Manager Name"
                        className="w-full h-10 px-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900"
                      />
                      <input
                        type="email"
                        value={newMgrEmail}
                        onChange={(e) => setNewMgrEmail(e.target.value)}
                        placeholder="Manager Email"
                        className="w-full h-10 px-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900"
                      />
                      <div className="flex gap-2 justify-end pt-1">
                        <button
                          type="button"
                          onClick={() => setIsCreatingManager(false)}
                          className="h-9 px-4 bg-zinc-100 text-zinc-700 text-xs font-semibold rounded-xl"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleCreateNewManager}
                          className="h-9 px-4 bg-[#18181B] text-white text-xs font-bold rounded-xl"
                        >
                          Create & Select
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsCreatingManager(true)}
                      className="w-full p-4 border-2 border-dashed border-[#E5E0D8] hover:border-amber-500/60 rounded-2xl text-center text-xs font-semibold text-zinc-600 hover:text-zinc-900 flex items-center justify-center gap-2 transition-colors cursor-pointer bg-white/50"
                    >
                      <Plus className="w-4 h-4 text-amber-500" />
                      <span>Create New Manager</span>
                    </button>
                  )}

                  {/* Footer Actions */}
                  <div className="pt-4 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="h-11 px-6 bg-white border border-[#E5E0D8] hover:bg-zinc-100 text-zinc-800 font-semibold text-xs rounded-xl transition-all cursor-pointer shadow-sm"
                    >
                      Back
                    </button>

                    <button
                      type="button"
                      onClick={() => setCurrentStep(4)}
                      className="h-11 px-7 bg-[#18181B] hover:bg-black text-white font-bold text-xs sm:text-sm rounded-2xl flex items-center gap-2 transition-all cursor-pointer shadow-md active:scale-95"
                    >
                      <span>Continue</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* =================================================================== */}
              {/* STEP 4: STAFF (Figma Image 5) */}
              {/* =================================================================== */}
              {currentStep === 4 && (
                <div className="max-w-xl mx-auto space-y-6 animate-in fade-in duration-200">
                  <div>
                    <h3 className="font-serif text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
                      Assign Branch Staff
                    </h3>
                    <p className="text-zinc-500 text-xs sm:text-sm mt-1">
                      Select or create staff for this branch.
                    </p>
                  </div>

                  {/* Role Filter Chips */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {staffRoleFilters.map((role) => {
                      const isActive = staffRoleFilter === role;
                      return (
                        <button
                          key={role}
                          type="button"
                          onClick={() => setStaffRoleFilter(role)}
                          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                            isActive
                              ? 'bg-[#18181B] text-white shadow-sm'
                              : 'bg-white border border-[#E5E0D8] text-zinc-600 hover:bg-zinc-100'
                          }`}
                        >
                          {role}
                        </button>
                      );
                    })}
                  </div>

                  {/* Staff List with Checkboxes */}
                  <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1 custom-scrollbar">
                    {filteredStaff.map((st) => {
                      const isChecked = selectedStaffIds.includes(st.id);
                      return (
                        <div
                          key={st.id}
                          onClick={() => toggleStaffSelection(st.id)}
                          className={`bg-white rounded-2xl p-3.5 border flex items-center justify-between transition-all cursor-pointer shadow-sm ${
                            isChecked
                              ? 'border-amber-400 bg-amber-50/20'
                              : 'border-[#E5E0D8] hover:border-zinc-400'
                          }`}
                        >
                          <div className="flex items-center gap-3.5">
                            {/* Checkbox */}
                            <div
                              className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                                isChecked
                                  ? 'bg-[#18181B] border-[#18181B] text-white'
                                  : 'border-zinc-300 bg-white'
                              }`}
                            >
                              {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </div>

                            {/* Avatar */}
                            <div className="w-9 h-9 rounded-full bg-[#F4F0E8] border border-[#E5E0D8] text-zinc-800 font-bold text-xs flex items-center justify-center shrink-0">
                              {st.avatar}
                            </div>

                            {/* Info */}
                            <div>
                              <h4 className="text-sm font-bold text-zinc-900 leading-tight">
                                {st.name}
                              </h4>
                              <p className="text-xs text-zinc-400 mt-0.5">{st.role}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Divider or Create Staff */}
                  <div className="relative py-1 flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-[#E5E0D8]" />
                    </div>
                    <span className="relative px-3 bg-[#FAF7F2] text-xs font-mono text-zinc-400 uppercase">
                      or
                    </span>
                  </div>

                  {/* Create New Staff Option (Matches Figma Image) */}
                  {isCreatingStaff ? (
                    <div className="bg-white border border-[#E5E0D8] rounded-2xl p-6 shadow-md space-y-4 relative animate-in fade-in duration-200">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <h4 className="text-zinc-900 font-bold text-base sm:text-lg">
                          New Staff Member
                        </h4>
                        <button
                          type="button"
                          onClick={() => setIsCreatingStaff(false)}
                          className="text-zinc-400 hover:text-zinc-700 p-1 transition-colors cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Full Name */}
                      <div>
                        <label className="text-xs font-semibold text-zinc-700 block mb-1.5">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={newStaffName}
                          onChange={(e) => setNewStaffName(e.target.value)}
                          placeholder="Full name"
                          className="w-full h-11 px-4 bg-white border border-[#E5E0D8] rounded-xl text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-amber-500 shadow-sm"
                        />
                      </div>

                      {/* Role Dropdown */}
                      <div>
                        <label className="text-xs font-semibold text-zinc-700 block mb-1.5">
                          Role
                        </label>
                        <div className="relative">
                          <select
                            value={newStaffRole}
                            onChange={(e) => setNewStaffRole(e.target.value)}
                            className="w-full h-11 px-4 pr-10 bg-white border-2 border-amber-500 rounded-xl text-sm font-semibold text-zinc-900 focus:outline-none cursor-pointer appearance-none shadow-sm"
                          >
                            <option value="Manager">Manager</option>
                            <option value="Assistant Manager">Assistant Manager</option>
                            <option value="Cashier">Cashier</option>
                            <option value="Waiter">Waiter</option>
                            <option value="Kitchen Staff">Kitchen Staff</option>
                            <option value="Bartender">Bartender</option>
                            <option value="Delivery Staff">Delivery Staff</option>
                          </select>
                          <ChevronDown className="w-4 h-4 text-zinc-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>

                      {/* Action Button */}
                      <button
                        type="button"
                        onClick={handleCreateNewStaff}
                        className="w-full h-11 bg-[#18181B] hover:bg-black text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-95"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Create & Assign</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsCreatingStaff(true)}
                      className="w-full p-3.5 border-2 border-dashed border-[#E5E0D8] hover:border-amber-500/60 rounded-2xl text-center text-xs font-semibold text-zinc-600 hover:text-zinc-900 flex items-center justify-center gap-2 transition-colors cursor-pointer bg-white/50"
                    >
                      <Plus className="w-4 h-4 text-amber-500" />
                      <span>Create New Staff</span>
                    </button>
                  )}

                  {/* Footer Actions */}
                  <div className="pt-4 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="h-11 px-6 bg-white border border-[#E5E0D8] hover:bg-zinc-100 text-zinc-800 font-semibold text-xs rounded-xl transition-all cursor-pointer shadow-sm"
                    >
                      Back
                    </button>

                    <button
                      type="button"
                      onClick={() => setCurrentStep(5)}
                      className="h-11 px-7 bg-[#18181B] hover:bg-black text-white font-bold text-xs sm:text-sm rounded-2xl flex items-center gap-2 transition-all cursor-pointer shadow-md active:scale-95"
                    >
                      <span>Continue</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* =================================================================== */}
              {/* STEP 5: REVIEW & CREATE */}
              {/* =================================================================== */}
              {currentStep === 5 && (
                <div className="max-w-xl mx-auto space-y-6 animate-in fade-in duration-200">
                  <div>
                    <h3 className="font-serif text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
                      Review & Create Branch
                    </h3>
                    <p className="text-zinc-500 text-xs sm:text-sm mt-1">
                      Confirm details before creating this branch.
                    </p>
                  </div>

                  {/* Summary Cards */}
                  <div className="space-y-3">
                    <div className="bg-white border border-[#E5E0D8] rounded-2xl p-4 space-y-2 shadow-sm">
                      <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                        Branch Information
                      </div>
                      <div className="flex justify-between text-xs font-semibold text-zinc-900">
                        <span>Name</span>
                        <span>{branchName || `${restaurant.name} New Branch`}</span>
                      </div>
                      <div className="flex justify-between text-xs text-zinc-600">
                        <span>Phone</span>
                        <span>{phoneNumber || 'Not provided'}</span>
                      </div>
                      <div className="flex justify-between text-xs text-zinc-600">
                        <span>Email</span>
                        <span>{emailAddress || 'Not provided'}</span>
                      </div>
                    </div>

                    <div className="bg-white border border-[#E5E0D8] rounded-2xl p-4 space-y-2 shadow-sm">
                      <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                        Location
                      </div>
                      <div className="text-xs font-semibold text-zinc-900">
                        {address || 'Uttara, Dhaka'}
                      </div>
                      <div className="text-xs text-zinc-500">
                        {city || 'Uttara'}, {country || 'Dhaka'} · {postalCode || '1230'}
                      </div>
                    </div>

                    <div className="bg-white border border-[#E5E0D8] rounded-2xl p-4 flex items-center justify-between shadow-sm">
                      <div>
                        <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                          Assigned Manager
                        </div>
                        <div className="text-xs font-bold text-zinc-900 mt-1">
                          {selectedManager?.name}
                        </div>
                        <div className="text-[11px] text-zinc-500">{selectedManager?.role}</div>
                      </div>
                      <div className="w-9 h-9 rounded-full bg-[#F4F0E8] text-zinc-800 font-bold text-xs flex items-center justify-center">
                        {selectedManager?.avatar}
                      </div>
                    </div>

                    <div className="bg-white border border-[#E5E0D8] rounded-2xl p-4 space-y-2 shadow-sm">
                      <div className="flex justify-between text-xs font-bold text-zinc-400 uppercase tracking-wider">
                        <span>Assigned Staff</span>
                        <span>{selectedStaffIds.length} Members</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {staffList
                          .filter((s) => selectedStaffIds.includes(s.id))
                          .map((s) => (
                            <span
                              key={s.id}
                              className="px-2.5 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-xs font-medium text-zinc-800"
                            >
                              {s.name} ({s.role})
                            </span>
                          ))}
                      </div>
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="pt-4 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(4)}
                      className="h-11 px-6 bg-white border border-[#E5E0D8] hover:bg-zinc-100 text-zinc-800 font-semibold text-xs rounded-xl transition-all cursor-pointer shadow-sm"
                    >
                      Back
                    </button>

                    <button
                      type="button"
                      onClick={handleFinalSubmit}
                      className="h-11 px-8 bg-[#18181B] hover:bg-black text-white font-bold text-xs sm:text-sm rounded-2xl flex items-center gap-2 transition-all cursor-pointer shadow-md active:scale-95"
                    >
                      <span>Create Branch</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
