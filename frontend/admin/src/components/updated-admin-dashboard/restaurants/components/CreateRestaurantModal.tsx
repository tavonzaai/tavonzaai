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
  Clock,
  Sparkles,
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

const STEP_LABELS = [
  { step: 1, title: 'BASIC INFO' },
  { step: 2, title: 'LOCATION' },
  { step: 3, title: 'DETAILS' },
  { step: 4, title: 'MANAGER' },
  { step: 5, title: 'STAFF' },
  { step: 6, title: 'REVIEW' },
];

export default function CreateRestaurantModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateRestaurantModalProps) {
  // Step state: 1 to 6 (7 is Success view)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSuccess, setIsSuccess] = useState(false);

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
    setIsSuccess(false);
    setIsAddingNewManager(false);
    setIsAddingNewStaff(false);
    onClose();
  };

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

  // Step 6 -> Final Create Action
  const handleFinalCreate = async () => {
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

      const finalId = createdBackend?.id || `rest-${Date.now()}`;
      if (createdBackend?.id) {
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

      const assignedStaffMembers = staffPool.filter((s) => selectedStaffIds.includes(s.id));
      const newRestaurant: RestaurantBranch = {
        id: finalId,
        name: restaurantName.trim() || 'Tavonza New Restaurant',
        type: restaurantType,
        address: address.trim() || 'Dhanmondi, Road 27',
        city: city.trim() || 'Dhaka',
        country: country.trim() || 'Bangladesh',
        postalCode: postalCode.trim() || '1209',
        phone: phoneNumber.trim() || '+880 1711-000000',
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
      setIsSuccess(true);
    } catch (err) {
      console.error('Failed to create restaurant:', err);
    }
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
        {/* 1. TOP STEPPER HEADER BAR (Matches Figma Image 2) */}
        {/* ========================================================================= */}
        {!isSuccess && (
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
                  Create Restaurant
                </h2>
                <p className="text-xs text-zinc-500 font-mono mt-0.5">
                  Step {currentStep} of 6
                </p>
              </div>
            </div>

            {/* Right: Stepper Progress Indicators (1 to 6) */}
            <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto custom-scrollbar w-full sm:w-auto justify-between sm:justify-end py-1">
              {STEP_LABELS.map((item, index) => {
                const isDone = item.step < currentStep;
                const isActive = item.step === currentStep;

                return (
                  <React.Fragment key={item.step}>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Circle Indicator */}
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          isDone
                            ? 'bg-[#18181B] text-white shadow-sm'
                            : isActive
                            ? 'bg-[#18181B] text-white shadow-md ring-2 ring-zinc-400'
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
                            ? 'text-zinc-700'
                            : 'text-zinc-400'
                        }`}
                      >
                        {item.title}
                      </span>
                    </div>

                    {/* Connecting Line */}
                    {index < STEP_LABELS.length - 1 && (
                      <div
                        className={`h-[2px] w-3 sm:w-5 rounded-full shrink-0 ${
                          item.step < currentStep ? 'bg-[#18181B]' : 'bg-[#E5E0D8]'
                        }`}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. BODY CONTENT (Steps 1 to 6 or Success) */}
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
                  Restaurant Created Successfully!
                </h3>
                <p className="text-zinc-500 text-sm">
                  Your new restaurant location is ready to accept operations.
                </p>
              </div>

              <div className="w-full max-w-md bg-white border border-[#E5E0D8] rounded-2xl p-5 text-left space-y-3 shadow-sm">
                <div className="flex items-center justify-between pb-2 border-b border-[#E5E0D8] text-xs">
                  <span className="text-zinc-400 font-medium">Restaurant Name</span>
                  <span className="text-zinc-900 font-bold">{createdRestaurant?.name}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-[#E5E0D8] text-xs">
                  <span className="text-zinc-400 font-medium">Type</span>
                  <span className="text-zinc-800 font-semibold">{createdRestaurant?.type}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-[#E5E0D8] text-xs">
                  <span className="text-zinc-400 font-medium">Location</span>
                  <span className="text-zinc-800 font-semibold">{createdRestaurant?.address}, {createdRestaurant?.city}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400 font-medium">Manager</span>
                  <span className="text-zinc-900 font-semibold">{createdRestaurant?.manager.name}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="h-11 px-6 rounded-2xl bg-[#18181B] hover:bg-black text-white font-bold text-xs transition-all shadow-md cursor-pointer"
                >
                  View Restaurant
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* =================================================================== */}
              {/* STEP 1: BASIC INFO (Figma Image 2) */}
              {/* =================================================================== */}
              {currentStep === 1 && (
                <div className="max-w-xl mx-auto space-y-6 animate-in fade-in duration-200">
                  <div>
                    <h3 className="font-serif text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
                      Basic Information
                    </h3>
                    <p className="text-zinc-500 text-xs sm:text-sm mt-1">
                      Tell us about your restaurant.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Restaurant Name */}
                    <div>
                      <label className="text-xs font-semibold text-zinc-700 block mb-1.5">
                        Restaurant Name
                      </label>
                      <input
                        type="text"
                        value={restaurantName}
                        onChange={(e) => setRestaurantName(e.target.value)}
                        placeholder="Enter restaurant name"
                        className="w-full h-11 px-4 bg-white border border-[#E5E0D8] rounded-xl text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-amber-500 shadow-sm"
                      />
                    </div>

                    {/* Restaurant Type Pills (Matching Figma Image 2) */}
                    <div>
                      <label className="text-xs font-semibold text-zinc-700 block mb-2">
                        Restaurant Type
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {restaurantTypes.map((type) => {
                          const isSelected = restaurantType === type;
                          return (
                            <button
                              key={type}
                              type="button"
                              onClick={() => setRestaurantType(type)}
                              className={`h-9 px-4 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-[#18181B] text-white shadow-md'
                                  : 'bg-white border border-[#E5E0D8] text-zinc-700 hover:bg-zinc-100'
                              }`}
                            >
                              {type}
                            </button>
                          );
                        })}
                      </div>
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
                        placeholder="Enter restaurant phone number"
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
                        placeholder="Enter restaurant email"
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
              {/* STEP 2: LOCATION */}
              {/* =================================================================== */}
              {currentStep === 2 && (
                <div className="max-w-xl mx-auto space-y-6 animate-in fade-in duration-200">
                  <div>
                    <h3 className="font-serif text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
                      Location
                    </h3>
                    <p className="text-zinc-500 text-xs sm:text-sm mt-1">
                      Tell us where your restaurant is located.
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
              {/* STEP 3: DETAILS & OPERATING HOURS */}
              {/* =================================================================== */}
              {currentStep === 3 && (
                <div className="max-w-xl mx-auto space-y-6 animate-in fade-in duration-200">
                  <div>
                    <h3 className="font-serif text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
                      Restaurant Details
                    </h3>
                    <p className="text-zinc-500 text-xs sm:text-sm mt-1">
                      Set operating hours and services offered.
                    </p>
                  </div>

                  {/* Opening Hours Section */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-zinc-700 block">
                        Opening Hours
                      </label>
                      <button
                        type="button"
                        onClick={copyMondayToAll}
                        className="text-xs text-amber-600 hover:underline font-semibold cursor-pointer"
                      >
                        Apply Monday hours to all
                      </button>
                    </div>

                    {/* Day Schedule Rows */}
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                      {operatingHours.map((schedule, idx) => (
                        <div
                          key={schedule.day}
                          className="flex items-center gap-2 p-2.5 bg-white rounded-xl border border-[#E5E0D8] shadow-sm"
                        >
                          <div className="w-24 px-2 py-1 bg-zinc-100 rounded-lg text-center text-xs font-bold text-zinc-800">
                            {schedule.day}
                          </div>
                          <input
                            type="text"
                            value={schedule.openTime}
                            onChange={(e) => updateHour(idx, 'openTime', e.target.value)}
                            className="w-24 px-2 py-1 bg-zinc-50 border border-zinc-300 rounded-lg text-xs text-center text-zinc-900 focus:outline-none focus:border-amber-500"
                          />
                          <span className="text-zinc-400 text-xs">-</span>
                          <input
                            type="text"
                            value={schedule.closeTime}
                            onChange={(e) => updateHour(idx, 'closeTime', e.target.value)}
                            className="w-24 px-2 py-1 bg-zinc-50 border border-zinc-300 rounded-lg text-xs text-center text-zinc-900 focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Services Offered */}
                  <div className="space-y-2 pt-2">
                    <label className="text-xs font-semibold text-zinc-700 block">
                      Services Offered
                    </label>
                    <div className="grid grid-cols-2 gap-2.5">
                      {['Dine-In', 'Takeaway', 'Delivery', 'Catering'].map((service) => {
                        const isChecked = selectedServices.includes(service);
                        return (
                          <button
                            key={service}
                            type="button"
                            onClick={() => toggleService(service)}
                            className={`h-11 px-4 rounded-xl border text-xs font-bold flex items-center justify-between transition-all cursor-pointer shadow-sm ${
                              isChecked
                                ? 'bg-amber-50/50 border-amber-500 text-zinc-900 ring-1 ring-amber-400/20'
                                : 'bg-white border-[#E5E0D8] text-zinc-700 hover:bg-zinc-50'
                            }`}
                          >
                            <span>{service}</span>
                            {isChecked ? (
                              <div className="w-5 h-5 rounded-md bg-[#18181B] flex items-center justify-center text-white">
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </div>
                            ) : (
                              <div className="w-5 h-5 rounded-md border border-zinc-300 bg-white" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

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
              {/* STEP 4: ASSIGN MANAGER */}
              {/* =================================================================== */}
              {currentStep === 4 && (
                <div className="max-w-xl mx-auto space-y-6 animate-in fade-in duration-200">
                  <div>
                    <h3 className="font-serif text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
                      Assign Manager
                    </h3>
                    <p className="text-zinc-500 text-xs sm:text-sm mt-1">
                      Assign a manager responsible for daily operations.
                    </p>
                  </div>

                  {/* Search Manager */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={managerSearch}
                      onChange={(e) => setManagerSearch(e.target.value)}
                      placeholder="Search Manager..."
                      className="w-full h-11 pl-10 pr-4 bg-white border border-[#E5E0D8] rounded-xl text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-amber-500 shadow-sm"
                    />
                  </div>

                  {/* Manager List Cards */}
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
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

                  {/* Create Manager Toggle Form */}
                  {isAddingNewManager ? (
                    <div className="p-4 bg-white border-2 border-amber-400/80 rounded-2xl space-y-3 shadow-md animate-in fade-in">
                      <h4 className="text-xs font-bold text-amber-900 uppercase">Create New Manager</h4>
                      <input
                        type="text"
                        value={newManagerName}
                        onChange={(e) => setNewManagerName(e.target.value)}
                        placeholder="Manager Full Name"
                        className="w-full h-10 px-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900"
                      />
                      <input
                        type="email"
                        value={newManagerEmail}
                        onChange={(e) => setNewManagerEmail(e.target.value)}
                        placeholder="Manager Email"
                        className="w-full h-10 px-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900"
                      />
                      <div className="flex gap-2 justify-end pt-1">
                        <button
                          type="button"
                          onClick={() => setIsAddingNewManager(false)}
                          className="h-9 px-4 bg-zinc-100 text-zinc-700 text-xs font-semibold rounded-xl"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveNewManager}
                          className="h-9 px-4 bg-[#18181B] text-white text-xs font-bold rounded-xl"
                        >
                          Save & Select
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsAddingNewManager(true)}
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
              {/* STEP 5: ASSIGN STAFF */}
              {/* =================================================================== */}
              {currentStep === 5 && (
                <div className="max-w-xl mx-auto space-y-6 animate-in fade-in duration-200">
                  <div>
                    <h3 className="font-serif text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
                      Assign Staff
                    </h3>
                    <p className="text-zinc-500 text-xs sm:text-sm mt-1">
                      Select or create staff members for this restaurant.
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
                  <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1 custom-scrollbar">
                    {filteredStaff.map((staff) => {
                      const isChecked = selectedStaffIds.includes(staff.id);
                      return (
                        <div
                          key={staff.id}
                          onClick={() => toggleStaffSelection(staff.id)}
                          className={`bg-white rounded-2xl p-3.5 border flex items-center justify-between transition-all cursor-pointer shadow-sm ${
                            isChecked
                              ? 'border-amber-400 bg-amber-50/20'
                              : 'border-[#E5E0D8] hover:border-zinc-400'
                          }`}
                        >
                          <div className="flex items-center gap-3.5">
                            <div
                              className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                                isChecked
                                  ? 'bg-[#18181B] border-[#18181B] text-white'
                                  : 'border-zinc-300 bg-white'
                              }`}
                            >
                              {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </div>

                            <div className="w-9 h-9 rounded-full bg-[#F4F0E8] border border-[#E5E0D8] text-zinc-800 font-bold text-xs flex items-center justify-center shrink-0">
                              {staff.avatar}
                            </div>

                            <div>
                              <h4 className="text-sm font-bold text-zinc-900 leading-tight">
                                {staff.name}
                              </h4>
                              <p className="text-xs text-zinc-400 mt-0.5">{staff.role}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Create New Staff Inline Form */}
                  {isAddingNewStaff ? (
                    <div className="bg-white border border-[#E5E0D8] rounded-2xl p-6 shadow-md space-y-4 relative animate-in fade-in duration-200">
                      <div className="flex items-center justify-between">
                        <h4 className="text-zinc-900 font-bold text-base sm:text-lg">
                          New Staff Member
                        </h4>
                        <button
                          type="button"
                          onClick={() => setIsAddingNewStaff(false)}
                          className="text-zinc-400 hover:text-zinc-700 p-1 transition-colors cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

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

                      <div>
                        <label className="text-xs font-semibold text-zinc-700 block mb-1.5">
                          Role
                        </label>
                        <div className="relative">
                          <select
                            value={newStaffRole}
                            onChange={(e) => setNewStaffRole(e.target.value as StaffRole)}
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

                      <button
                        type="button"
                        onClick={handleSaveNewStaff}
                        className="w-full h-11 bg-[#18181B] hover:bg-black text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-95"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Create & Assign</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsAddingNewStaff(true)}
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
                      onClick={() => setCurrentStep(4)}
                      className="h-11 px-6 bg-white border border-[#E5E0D8] hover:bg-zinc-100 text-zinc-800 font-semibold text-xs rounded-xl transition-all cursor-pointer shadow-sm"
                    >
                      Back
                    </button>

                    <button
                      type="button"
                      onClick={() => setCurrentStep(6)}
                      className="h-11 px-7 bg-[#18181B] hover:bg-black text-white font-bold text-xs sm:text-sm rounded-2xl flex items-center gap-2 transition-all cursor-pointer shadow-md active:scale-95"
                    >
                      <span>Continue</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* =================================================================== */}
              {/* STEP 6: REVIEW & CREATE */}
              {/* =================================================================== */}
              {currentStep === 6 && (
                <div className="max-w-xl mx-auto space-y-6 animate-in fade-in duration-200">
                  <div>
                    <h3 className="font-serif text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
                      Review & Create
                    </h3>
                    <p className="text-zinc-500 text-xs sm:text-sm mt-1">
                      Review your restaurant details before creating.
                    </p>
                  </div>

                  {/* Summary Cards */}
                  <div className="space-y-3">
                    <div className="bg-white border border-[#E5E0D8] rounded-2xl p-4 space-y-2 shadow-sm">
                      <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                        Restaurant Information
                      </div>
                      <div className="flex justify-between text-xs font-semibold text-zinc-900">
                        <span>Name</span>
                        <span>{restaurantName || 'Tavonza New Restaurant'}</span>
                      </div>
                      <div className="flex justify-between text-xs text-zinc-600">
                        <span>Type</span>
                        <span>{restaurantType}</span>
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
                        {address || 'Dhanmondi, Road 27'}
                      </div>
                      <div className="text-xs text-zinc-500">
                        {city || 'Dhaka'}, {country || 'Bangladesh'} · {postalCode || '1209'}
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
                        {staffPool
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
                      onClick={() => setCurrentStep(5)}
                      className="h-11 px-6 bg-white border border-[#E5E0D8] hover:bg-zinc-100 text-zinc-800 font-semibold text-xs rounded-xl transition-all cursor-pointer shadow-sm"
                    >
                      Back
                    </button>

                    <button
                      type="button"
                      onClick={handleFinalCreate}
                      className="h-11 px-7 bg-[#18181B] hover:bg-black text-white font-bold text-xs sm:text-sm rounded-2xl flex items-center gap-2 transition-all cursor-pointer shadow-md active:scale-95"
                    >
                      <span>Create Restaurant</span>
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
