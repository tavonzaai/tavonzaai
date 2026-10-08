'use client';

import React, { useState } from 'react';
import {
  X,
  Check,
  Search,
  Plus,
  ArrowLeft,
  Store,
  MapPin,
  User,
  Users,
  Clock,
  CheckCircle2,
  Building2,
  Sparkles,
  Phone,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import {
  RestaurantBranch,
  RestaurantType,
  StaffRole,
  Manager,
  StaffMember,
  DaySchedule,
} from '../types';
import {
  MOCK_MANAGERS,
  MOCK_STAFF_POOL,
  DEFAULT_OPERATING_HOURS,
} from '../restaurantsData';
import { restaurantService } from '@/redux/features/restaurantApi';

interface CreateRestaurantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newRestaurant: RestaurantBranch) => void;
}

export default function CreateRestaurantModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateRestaurantModalProps) {
  // Step state: 1 to 7 (7 is Success)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1: Basic Info
  const [restaurantName, setRestaurantName] = useState('');
  const [restaurantType, setRestaurantType] = useState<RestaurantType>('Restaurant');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');

  // Step 2: Location
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [postalCode, setPostalCode] = useState('');

  // Step 3: Details & Hours
  const [operatingHours, setOperatingHours] = useState<DaySchedule[]>(DEFAULT_OPERATING_HOURS);
  const [selectedServices, setSelectedServices] = useState<string[]>([
    'Dine-In',
    'Takeaway',
    'Delivery',
  ]);

  // Step 4: Assign Manager
  const [managerSearch, setManagerSearch] = useState('');
  const [managersList, setManagersList] = useState<Manager[]>(MOCK_MANAGERS);
  const [selectedManager, setSelectedManager] = useState<Manager | null>(MOCK_MANAGERS[0]);
  const [isAddingNewManager, setIsAddingNewManager] = useState(false);
  const [newManagerName, setNewManagerName] = useState('');
  const [newManagerEmail, setNewManagerEmail] = useState('');
  const [newManagerPhone, setNewManagerPhone] = useState('');

  // Step 5: Assign Staff
  const [staffRoleFilter, setStaffRoleFilter] = useState<string>('All');
  const [staffPool, setStaffPool] = useState<StaffMember[]>(MOCK_STAFF_POOL);
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>(['staff-1', 'staff-2', 'staff-3']);
  const [isAddingNewStaff, setIsAddingNewStaff] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<StaffRole>('Cashier');

  // Created restaurant reference for Step 7
  const [createdRestaurant, setCreatedRestaurant] = useState<RestaurantBranch | null>(null);

  if (!isOpen) return null;

  // Reset form when modal closes
  const handleClose = () => {
    setCurrentStep(1);
    setIsAddingNewManager(false);
    setIsAddingNewStaff(false);
    onClose();
  };

  // Step 1 validation
  const canContinueStep1 = restaurantName.trim().length > 0;

  // Step 2 validation
  const canContinueStep2 = address.trim().length > 0 && city.trim().length > 0;

  // Step 3 Service Toggle
  const toggleService = (service: string) => {
    setSelectedServices((prev) =>
      prev.includes(service) ? prev.filter((s) => s !== service) : [...prev, service]
    );
  };

  // Step 3 Hours updater
  const updateHour = (dayIndex: number, field: 'openTime' | 'closeTime', value: string) => {
    setOperatingHours((prev) => {
      const copy = [...prev];
      copy[dayIndex] = { ...copy[dayIndex], [field]: value };
      return copy;
    });
  };

  // Copy Monday hours to all
  const copyMondayToAll = () => {
    const monday = operatingHours[0];
    setOperatingHours((prev) =>
      prev.map((day) => ({
        ...day,
        openTime: monday.openTime,
        closeTime: monday.closeTime,
      }))
    );
  };

  // Step 4: Handle new manager creation
  const handleSaveNewManager = () => {
    if (!newManagerName.trim()) return;
    const initials = newManagerName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
    const newMgr: Manager = {
      id: `mgr-${Date.now()}`,
      name: newManagerName.trim(),
      role: 'Restaurant Manager',
      email: newManagerEmail.trim() || `${newManagerName.toLowerCase().replace(/\s+/g, '')}@tavonza.com`,
      phone: newManagerPhone.trim() || '+880 1700-000000',
      avatar: initials || 'MG',
    };
    setManagersList((prev) => [newMgr, ...prev]);
    setSelectedManager(newMgr);
    setIsAddingNewManager(false);
    setNewManagerName('');
    setNewManagerEmail('');
    setNewManagerPhone('');
  };

  // Step 5: Toggle staff selection
  const toggleStaffSelection = (id: string) => {
    setSelectedStaffIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Step 5: Handle new staff creation
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
      shift: 'Flexible Shift',
    };
    setStaffPool((prev) => [newStaff, ...prev]);
    setSelectedStaffIds((prev) => [...prev, newStaff.id]);
    setIsAddingNewStaff(false);
    setNewStaffName('');
  };

  // Step 6 -> Step 7: Final Create Action
  const handleFinalCreate = async () => {
    let finalId = `rest-${Date.now()}`;
    try {
      const orgs = await restaurantService.getOrganizations().catch(() => []);
      const orgId = orgs[0]?.id || 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
      const createdBackend = await restaurantService
        .createRestaurant({
          organizationId: orgId,
          name: restaurantName.trim() || 'Tavonza New Restaurant',
          slug: (restaurantName.trim() || 'tavonza-restaurant')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-'),
          description: `${restaurantType} dining experience.`,
        })
        .catch((e) => {
          console.warn('Backend restaurant creation warning:', e);
          return null;
        });

      if (createdBackend?.id) {
        finalId = createdBackend.id;
        await restaurantService
          .createBranch({
            restaurantId: createdBackend.id,
            name: `${restaurantName.trim()} Flagship`,
            address: {
              line1: address.trim() || 'Dhanmondi, Road 27',
              city: city.trim() || 'Dhaka',
              country: country.trim() || 'Bangladesh',
            },
            phone: phoneNumber.trim() || '+880 1711-000000',
          })
          .catch(() => null);
      }
    } catch (err) {
      console.warn('Backend restaurant creation caught error:', err);
    }

    const assignedStaffMembers = staffPool.filter((s) => selectedStaffIds.includes(s.id));
    const newRestaurant: RestaurantBranch = {
      id: finalId,
      name: restaurantName.trim() || 'Tavonza New Branch',
      type: restaurantType,
      address: address.trim() || 'Main Boulevard',
      city: city.trim() || 'Dhaka',
      country: country.trim() || 'Bangladesh',
      postalCode: postalCode.trim() || '1000',
      phone: phoneNumber.trim() || '+880 2-0000000',
      email: emailAddress.trim() || 'info@tavonza.com',
      status: 'Open',
      manager: selectedManager || MOCK_MANAGERS[0],
      staffCount: assignedStaffMembers.length,
      assignedStaff: assignedStaffMembers,
      operatingHours,
      services: selectedServices,
      branchesCount: 1,
      revenue: '$0/mo',
      rating: 5.0,
      tablesCount: 20,
    };

    setCreatedRestaurant(newRestaurant);
    onSuccess(newRestaurant);
    // Transition to Step 7 (Success view)
    setCurrentStep(7);
  };

  // Filtered managers for step 4
  const filteredManagers = managersList.filter((m) =>
    m.name.toLowerCase().includes(managerSearch.toLowerCase()) ||
    m.email.toLowerCase().includes(managerSearch.toLowerCase())
  );

  // Filtered staff for step 5
  const filteredStaff = staffPool.filter((s) => {
    if (staffRoleFilter === 'All') return true;
    return s.role.toLowerCase() === staffRoleFilter.toLowerCase();
  });

  const restaurantTypes: RestaurantType[] = ['Restaurant', 'Café', 'Bar', 'Fast Food', 'Bakery'];
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

  if (!isOpen) return null;

  return (
    <div
      className="fixed top-20 left-0 md:left-64 right-0 bottom-0 z-40 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-[520px] max-h-[calc(100vh-6.5rem)] bg-neutral-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300 my-auto ${
          currentStep === 7 ? 'max-w-[500px]' : ''
        }`}
      >
        {/* ========================================================================= */}
        {/* MODAL HEADER (Steps 1 - 6) */}
        {/* ========================================================================= */}
        {currentStep < 7 && (
          <div className="h-16 px-6 py-3.5 border-b border-slate-800 flex items-center justify-between flex-shrink-0 bg-neutral-900">
            <div>
              <h2 className="text-xl font-bold text-white font-sans leading-6">
                Create Restaurant
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-amber-400 font-medium">
                  Step {currentStep} of 6
                </span>
                <span className="text-zinc-600 text-xs">•</span>
                <span className="text-xs text-zinc-400">
                  {currentStep === 1 && 'Basic Information'}
                  {currentStep === 2 && 'Location'}
                  {currentStep === 3 && 'Restaurant Details'}
                  {currentStep === 4 && 'Assign Manager'}
                  {currentStep === 5 && 'Assign Staff'}
                  {currentStep === 6 && 'Review & Create'}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 1: BASIC INFORMATION */}
        {/* ========================================================================= */}
        {currentStep === 1 && (
          <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh] custom-scrollbar">
            <div>
              <h3 className="text-white text-base font-semibold">Basic Information</h3>
              <p className="text-slate-400 text-xs mt-0.5">Tell us about your restaurant.</p>
            </div>

            {/* Restaurant Name */}
            <div className="space-y-2">
              <label className="text-white text-xs font-medium">Restaurant Name *</label>
              <div className="h-10 px-3 bg-zinc-800 rounded-[10px] border border-slate-700/80 flex items-center focus-within:border-amber-400 transition-colors">
                <input
                  type="text"
                  value={restaurantName}
                  onChange={(e) => setRestaurantName(e.target.value)}
                  placeholder="Enter Restaurant Name...."
                  className="w-full bg-transparent text-sm text-white placeholder-stone-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Restaurant Type */}
            <div className="space-y-2">
              <label className="text-white text-xs font-medium">Restaurant Type</label>
              <div className="flex flex-wrap gap-2">
                {restaurantTypes.map((type) => {
                  const isSelected = restaurantType === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setRestaurantType(type)}
                      className={`h-8 px-3.5 rounded-[10px] text-xs font-medium transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-white text-stone-950 shadow-md font-semibold'
                          : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
                      }`}
                    >
                      {type}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <label className="text-white text-xs font-medium">Phone Number</label>
              <div className="h-10 px-3 bg-zinc-800 rounded-[10px] border border-slate-700/80 flex items-center focus-within:border-amber-400 transition-colors">
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Enter Restaurant Phone Number...."
                  className="w-full bg-transparent text-sm text-white placeholder-stone-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-2">
              <label className="text-white text-xs font-medium">Email Address</label>
              <div className="h-10 px-3 bg-zinc-800 rounded-[10px] border border-slate-700/80 flex items-center focus-within:border-amber-400 transition-colors">
                <input
                  type="email"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  placeholder="Enter Restaurant Email...."
                  className="w-full bg-transparent text-sm text-white placeholder-stone-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Action Footer */}
            <div className="pt-4 flex justify-end">
              <button
                type="button"
                disabled={!canContinueStep1}
                onClick={() => setCurrentStep(2)}
                className="h-9 px-6 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-[10px] transition-colors cursor-pointer shadow-md shadow-amber-500/20"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: LOCATION (No Map as requested) */}
        {/* ========================================================================= */}
        {currentStep === 2 && (
          <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh] custom-scrollbar">
            <div>
              <h3 className="text-white text-base font-semibold">Location</h3>
              <p className="text-slate-400 text-xs mt-0.5">Where is your restaurant located?</p>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <label className="text-white text-xs font-medium">Restaurant Address *</label>
              <div className="h-10 px-3 bg-zinc-800 rounded-[10px] border border-slate-700/80 flex items-center focus-within:border-amber-400 transition-colors">
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter Full address...."
                  className="w-full bg-transparent text-sm text-white placeholder-stone-400 focus:outline-none"
                />
              </div>
            </div>

            {/* City & Country side by side */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-white text-xs font-medium">City *</label>
                <div className="h-10 px-3 bg-zinc-800 rounded-[10px] border border-slate-700/80 flex items-center focus-within:border-amber-400 transition-colors">
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
                    className="w-full bg-transparent text-sm text-white placeholder-stone-400 focus:outline-none"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-white text-xs font-medium">Country</label>
                <div className="h-10 px-3 bg-zinc-800 rounded-[10px] border border-slate-700/80 flex items-center focus-within:border-amber-400 transition-colors">
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="Country"
                    className="w-full bg-transparent text-sm text-white placeholder-stone-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Postal Code */}
            <div className="space-y-2">
              <label className="text-white text-xs font-medium">Postal Code</label>
              <div className="h-10 px-3 bg-zinc-800 rounded-[10px] border border-slate-700/80 flex items-center focus-within:border-amber-400 transition-colors">
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="Postal Code..."
                  className="w-full bg-transparent text-sm text-white placeholder-stone-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Action Footer */}
            <div className="pt-4 flex items-center justify-between border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="h-9 px-5 rounded-[10px] border border-neutral-600 hover:bg-zinc-800 text-neutral-300 text-xs font-medium transition-colors cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                disabled={!canContinueStep2}
                onClick={() => setCurrentStep(3)}
                className="h-9 px-6 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-[10px] transition-colors cursor-pointer shadow-md shadow-amber-500/20"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: RESTAURANT DETAILS & HOURS */}
        {/* ========================================================================= */}
        {currentStep === 3 && (
          <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh] custom-scrollbar">
            <div>
              <h3 className="text-white text-base font-semibold">Restaurant Details</h3>
              <p className="text-slate-400 text-xs mt-0.5">Set hours and services offered.</p>
            </div>

            {/* Opening Hours Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-white text-xs font-medium">Opening Hours</label>
                <button
                  type="button"
                  onClick={copyMondayToAll}
                  className="text-[11px] text-amber-400 hover:underline cursor-pointer"
                >
                  Apply Monday hours to all
                </button>
              </div>

              {/* Day schedule rows matching design */}
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                {operatingHours.map((schedule, idx) => (
                  <div
                    key={schedule.day}
                    className="flex items-center gap-2 p-2 bg-zinc-800/80 rounded-[10px] border border-zinc-700/60"
                  >
                    <div className="w-24 px-2 py-1 bg-zinc-700/60 rounded text-center text-xs font-medium text-white">
                      {schedule.day}
                    </div>
                    <input
                      type="text"
                      value={schedule.openTime}
                      onChange={(e) => updateHour(idx, 'openTime', e.target.value)}
                      className="w-20 px-2 py-1 bg-zinc-900 border border-zinc-600 rounded text-[11px] text-center text-white focus:outline-none focus:border-amber-400"
                    />
                    <span className="text-zinc-400 text-xs">-</span>
                    <input
                      type="text"
                      value={schedule.closeTime}
                      onChange={(e) => updateHour(idx, 'closeTime', e.target.value)}
                      className="w-20 px-2 py-1 bg-zinc-900 border border-zinc-600 rounded text-[11px] text-center text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Services Offered */}
            <div className="space-y-2 pt-2">
              <label className="text-white text-xs font-medium">Services Offered</label>
              <div className="grid grid-cols-2 gap-2">
                {['Dine-In', 'Takeaway', 'Delivery', 'Catering'].map((service) => {
                  const isChecked = selectedServices.includes(service);
                  return (
                    <button
                      key={service}
                      type="button"
                      onClick={() => toggleService(service)}
                      className={`h-9 px-3 rounded-[10px] border text-xs font-medium flex items-center justify-between transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-amber-400/15 border-amber-400 text-white'
                          : 'bg-zinc-800/60 border-zinc-700/70 text-zinc-300 hover:bg-zinc-800'
                      }`}
                    >
                      <span>{service}</span>
                      {isChecked ? (
                        <div className="w-4 h-4 rounded bg-amber-400 flex items-center justify-center text-white">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-4 h-4 rounded border border-zinc-600" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Footer */}
            <div className="pt-4 flex items-center justify-between border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="h-9 px-5 rounded-[10px] border border-neutral-600 hover:bg-zinc-800 text-neutral-300 text-xs font-medium transition-colors cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="h-9 px-6 bg-yellow-500 hover:bg-yellow-400 text-white text-xs font-semibold rounded-[10px] transition-colors cursor-pointer shadow-md shadow-amber-500/20"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 4: ASSIGN MANAGER */}
        {/* ========================================================================= */}
        {currentStep === 4 && (
          <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh] custom-scrollbar">
            <div>
              <h3 className="text-white text-base font-semibold">Assign Manager</h3>
              <p className="text-slate-400 text-xs mt-0.5">
                Assign a manager responsible for daily operations.
              </p>
            </div>

            {/* Search Manager */}
            <div className="h-10 px-3 bg-zinc-900 rounded-lg border border-zinc-700 flex items-center gap-2">
              <Search className="w-4 h-4 text-zinc-400 flex-shrink-0" />
              <input
                type="text"
                value={managerSearch}
                onChange={(e) => setManagerSearch(e.target.value)}
                placeholder="Search Manager..."
                className="w-full bg-transparent text-sm text-white placeholder-neutral-500 focus:outline-none"
              />
            </div>

            {/* Manager Cards List */}
            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
              {filteredManagers.map((mgr) => {
                const isSelected = selectedManager?.id === mgr.id;
                return (
                  <div
                    key={mgr.id}
                    onClick={() => setSelectedManager(mgr)}
                    className={`p-3 rounded-[10px] border flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-zinc-800/90 border-amber-400/80 shadow-sm'
                        : 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-white text-black font-semibold text-sm flex items-center justify-center flex-shrink-0">
                        {mgr.avatar}
                      </div>
                      <div>
                        <div className="text-white text-sm font-semibold">{mgr.name}</div>
                        <div className="text-zinc-400 text-xs">{mgr.role}</div>
                        <div className="text-slate-500 text-[11px]">{mgr.email}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      className={`h-7 px-3.5 rounded-[8px] text-xs font-medium transition-colors ${
                        isSelected
                          ? 'bg-amber-500 text-white font-semibold'
                          : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                      }`}
                    >
                      {isSelected ? 'Selected' : 'Select'}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Quick Inline New Manager Creation Form */}
            {isAddingNewManager ? (
              <div className="p-3.5 bg-zinc-800/70 border border-zinc-700 rounded-[10px] space-y-3">
                <div className="text-xs font-semibold text-white">Create New Manager</div>
                <input
                  type="text"
                  value={newManagerName}
                  onChange={(e) => setNewManagerName(e.target.value)}
                  placeholder="Manager Full Name"
                  className="w-full h-8 px-2.5 bg-zinc-900 border border-zinc-700 rounded text-xs text-white focus:outline-none focus:border-amber-400"
                />
                <input
                  type="email"
                  value={newManagerEmail}
                  onChange={(e) => setNewManagerEmail(e.target.value)}
                  placeholder="Email Address"
                  className="w-full h-8 px-2.5 bg-zinc-900 border border-zinc-700 rounded text-xs text-white focus:outline-none focus:border-amber-400"
                />
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setIsAddingNewManager(false)}
                    className="h-7 px-3 text-xs text-zinc-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveNewManager}
                    className="h-7 px-3 bg-amber-400 hover:bg-amber-300 text-white text-xs font-semibold rounded"
                  >
                    Save & Select
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAddingNewManager(true)}
                className="w-full p-2.5 rounded-[10px] border border-dashed border-zinc-600 hover:border-zinc-400 text-white text-sm flex items-center justify-center gap-2 hover:bg-zinc-800/40 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Manager</span>
              </button>
            )}

            {/* Action Footer */}
            <div className="pt-4 flex items-center justify-between border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="h-9 px-5 rounded-[10px] border border-neutral-600 hover:bg-zinc-800 text-neutral-300 text-xs font-medium transition-colors cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(5)}
                className="h-9 px-6 bg-yellow-500 hover:bg-yellow-400 text-white text-xs font-semibold rounded-[10px] transition-colors cursor-pointer shadow-md shadow-amber-500/20"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 5: ASSIGN STAFF */}
        {/* ========================================================================= */}
        {currentStep === 5 && (
          <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh] custom-scrollbar">
            <div>
              <h3 className="text-white text-base font-semibold">Assign Staff</h3>
              <p className="text-slate-400 text-xs mt-0.5">
                Select or create staff members for this restaurant.
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

            {/* Staff Members List */}
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

            {/* Quick Inline New Staff Form */}
            {isAddingNewStaff ? (
              <div className="p-3.5 bg-zinc-800/70 border border-zinc-700 rounded-[10px] space-y-3">
                <div className="text-xs font-semibold text-white">Create New Staff Member</div>
                <input
                  type="text"
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  placeholder="Staff Full Name"
                  className="w-full h-8 px-2.5 bg-zinc-900 border border-zinc-700 rounded text-xs text-white focus:outline-none focus:border-amber-400"
                />
                <select
                  value={newStaffRole}
                  onChange={(e) => setNewStaffRole(e.target.value as StaffRole)}
                  className="w-full h-8 px-2 bg-zinc-900 border border-zinc-700 rounded text-xs text-white focus:outline-none"
                >
                  <option value="Cashier">Cashier</option>
                  <option value="Waiter">Waiter</option>
                  <option value="Kitchen Staff">Kitchen Staff</option>
                  <option value="Bartender">Bartender</option>
                  <option value="Delivery Staff">Delivery Staff</option>
                  <option value="Assistant Manager">Assistant Manager</option>
                </select>
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
                    className="h-7 px-3 bg-amber-400 hover:bg-amber-300 text-white text-xs font-semibold rounded"
                  >
                    Add & Select
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAddingNewStaff(true)}
                className="w-full p-2.5 rounded-[10px] border border-dashed border-zinc-600 hover:border-zinc-400 text-white text-sm flex items-center justify-center gap-2 hover:bg-zinc-800/40 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Staff</span>
              </button>
            )}

            {/* Action Footer */}
            <div className="pt-4 flex items-center justify-between border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="h-9 px-5 rounded-[10px] border border-neutral-600 hover:bg-zinc-800 text-neutral-300 text-xs font-medium transition-colors cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(6)}
                className="h-9 px-6 bg-yellow-500 hover:bg-yellow-400 text-white text-xs font-semibold rounded-[10px] transition-colors cursor-pointer shadow-md shadow-amber-500/20"
              >
                Assign Selected Staff ({selectedStaffIds.length})
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 6: REVIEW & CREATE */}
        {/* ========================================================================= */}
        {currentStep === 6 && (
          <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh] custom-scrollbar">
            <div>
              <h3 className="text-white text-xl font-medium">Review & Create</h3>
              <p className="text-neutral-400 text-xs mt-0.5">
                Review your restaurant details before creating.
              </p>
            </div>

            {/* Summary Details Rows matching design */}
            <div className="space-y-2">
              <div className="px-3.5 py-2.5 rounded-[10px] border border-neutral-800 bg-zinc-900/60 flex items-center justify-between text-xs">
                <span className="text-zinc-400 font-medium">Restaurant</span>
                <span className="text-white font-semibold">{restaurantName || 'Tavonza Restaurant'}</span>
              </div>
              <div className="px-3.5 py-2.5 rounded-[10px] border border-neutral-800 bg-zinc-900/60 flex items-center justify-between text-xs">
                <span className="text-zinc-400 font-medium">Type</span>
                <span className="text-white font-semibold">{restaurantType}</span>
              </div>
              <div className="px-3.5 py-2.5 rounded-[10px] border border-neutral-800 bg-zinc-900/60 flex items-center justify-between text-xs">
                <span className="text-zinc-400 font-medium">Location</span>
                <span className="text-white font-semibold">
                  {address ? `${address}, ${city}` : '--'}
                </span>
              </div>
              <div className="px-3.5 py-2.5 rounded-[10px] border border-neutral-800 bg-zinc-900/60 flex items-center justify-between text-xs">
                <span className="text-zinc-400 font-medium">Manager</span>
                <span className="text-white font-semibold">
                  {selectedManager ? selectedManager.name : '--'}
                </span>
              </div>
              <div className="px-3.5 py-2.5 rounded-[10px] border border-neutral-800 bg-zinc-900/60 flex items-center justify-between text-xs">
                <span className="text-zinc-400 font-medium">Staff Assigned</span>
                <span className="text-white font-semibold">
                  {selectedStaffIds.length} Members
                </span>
              </div>
              <div className="px-3.5 py-2.5 rounded-[10px] border border-neutral-800 bg-zinc-900/60 flex items-center justify-between text-xs">
                <span className="text-zinc-400 font-medium">Services</span>
                <span className="text-white font-semibold">
                  {selectedServices.join(', ') || '--'}
                </span>
              </div>
            </div>

            {/* Action Footer */}
            <div className="pt-4 flex items-center justify-between border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setCurrentStep(5)}
                className="h-9 px-5 rounded-[10px] border border-neutral-600 hover:bg-zinc-800 text-neutral-300 text-xs font-medium transition-colors cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleFinalCreate}
                className="h-9 px-6 bg-yellow-500 hover:bg-yellow-400 text-white text-xs font-semibold rounded-[10px] transition-colors cursor-pointer shadow-md shadow-amber-500/20"
              >
                Create Restaurant
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 7: SUCCESS SCREEN (Exact match to User Image & Snippet) */}
        {/* ========================================================================= */}
        {currentStep === 7 && (
          <div className="p-8 flex flex-col items-center justify-center text-center space-y-6 animate-in zoom-in-95 duration-200">
            {/* Rosette/Scallop Green Checkmark Badge */}
            <div className="relative flex items-center justify-center">
              {/* Glowing ring effect */}
              <div className="absolute w-24 h-24 rounded-full bg-emerald-500/20 blur-xl animate-pulse" />
              <div className="w-20 h-20 relative flex items-center justify-center">
                {/* SVG Rosette / Scallop badge icon matching the uploaded image */}
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
            </div>

            {/* Title & Subtitle */}
            <div className="space-y-1.5">
              <h2 className="text-2xl sm:text-3xl font-semibold text-white font-sans tracking-tight">
                Restaurant Created Successfully!
              </h2>
              <p className="text-zinc-500 text-sm sm:text-base font-normal">
                Your restaurant has been successfully created.
              </p>
            </div>

            {/* Summary Box matching screenshot */}
            <div className="w-full max-w-[320px] bg-neutral-900 border border-zinc-800 rounded-[10px] p-4 text-left space-y-2.5 shadow-inner">
              <div className="flex items-center gap-3 text-white text-sm font-medium">
                <Users className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                <span className="truncate">{createdRestaurant?.name || 'Restaurant'}</span>
              </div>
              <div className="flex items-center gap-3 text-zinc-400 text-sm font-medium">
                <MapPin className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                <span className="truncate">
                  {createdRestaurant?.address
                    ? `${createdRestaurant.city}, ${createdRestaurant.country}`
                    : 'Location not set'}
                </span>
              </div>
              <div className="flex items-center gap-3 text-zinc-400 text-sm font-medium">
                <User className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                <span className="truncate">
                  {createdRestaurant?.manager?.name || 'No manager'}
                </span>
              </div>
            </div>

            {/* Action Buttons matching screenshot */}
            <div className="flex items-center justify-center gap-3 pt-2 w-full">
              <button
                type="button"
                onClick={handleClose}
                className="h-9 px-5 bg-white hover:bg-zinc-100 text-stone-950 text-xs font-semibold rounded-[10px] transition-colors cursor-pointer shadow-sm"
              >
                View Restaurant
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="h-9 px-5 bg-yellow-500 hover:bg-yellow-400 text-white text-xs font-semibold rounded-[10px] transition-colors cursor-pointer shadow-md shadow-amber-500/20"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
