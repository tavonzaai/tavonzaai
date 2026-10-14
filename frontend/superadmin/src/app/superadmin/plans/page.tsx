'use client';

import React, { useState, useRef } from 'react';
import { SuperAdminLayout } from '@/components/layout/SuperAdminLayout';
import { toast } from 'sonner';

export interface PlanItem {
  id: string;
  name: string;
  tenantsCount: number;
  status: 'Active' | 'Disabled';
  monthlyPrice: number;
  yearlyPrice: number;
  branches: string;
  staffSeats: string;
  features: string[];
  isPopular?: boolean;
  modules: {
    posPayments: boolean;
    menuManagement: boolean;
    inventory: boolean;
    advancedReports: boolean;
    apiAccess: boolean;
  };
}

const INITIAL_PLANS: PlanItem[] = [
  {
    id: 'basic',
    name: 'Basic',
    tenantsCount: 46,
    status: 'Active',
    monthlyPrice: 199,
    yearlyPrice: 490,
    branches: '3 branches',
    staffSeats: '15 staff seats',
    features: ['✓ POS', '✓ Menu', '✓ Basic reports'],
    isPopular: false,
    modules: {
      posPayments: true,
      menuManagement: true,
      inventory: false,
      advancedReports: true,
      apiAccess: false,
    },
  },
  {
    id: 'pro',
    name: 'Pro',
    tenantsCount: 58,
    status: 'Active',
    monthlyPrice: 499,
    yearlyPrice: 1490,
    branches: '15 branches',
    staffSeats: '75 staff seats',
    features: ['✓ Everything in Starter', '✓ Inventory', '✓ Advanced reports'],
    isPopular: true,
    modules: {
      posPayments: true,
      menuManagement: true,
      inventory: true,
      advancedReports: true,
      apiAccess: false,
    },
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    tenantsCount: 24,
    status: 'Active',
    monthlyPrice: 599,
    yearlyPrice: 1790,
    branches: 'Unlimited branches',
    staffSeats: 'Unlimited staff seats',
    features: ['✓ Everything in Growth', '✓ API access', '✓ Priority support'],
    isPopular: false,
    modules: {
      posPayments: true,
      menuManagement: true,
      inventory: true,
      advancedReports: true,
      apiAccess: true,
    },
  },
];

interface ModuleOption {
  key: keyof PlanItem['modules'];
  label: string;
}

const MODULE_OPTIONS: ModuleOption[] = [
  { key: 'posPayments', label: 'POS & payments' },
  { key: 'menuManagement', label: 'Menu management' },
  { key: 'inventory', label: 'Inventory' },
  { key: 'advancedReports', label: 'Advanced reports' },
  { key: 'apiAccess', label: 'API access' },
];

export default function PlansPage() {
  const [plans, setPlans] = useState<PlanItem[]>(INITIAL_PLANS);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('edit');
  const [editingPlanId, setEditingPlanId] = useState<string | null>('pro');

  const formRef = useRef<HTMLDivElement>(null);

  // Form Fields State
  const [formState, setFormState] = useState({
    name: 'Growth',
    monthlyPrice: '$149',
    yearlyPrice: '$1,490',
    branchLimit: '15',
    staffLimit: '75',
    status: 'Active' as 'Active' | 'Disabled',
    modules: {
      posPayments: true,
      menuManagement: true,
      inventory: true,
      advancedReports: true,
      apiAccess: false,
    },
  });

  const handleOpenEdit = (plan: PlanItem) => {
    setFormMode('edit');
    setEditingPlanId(plan.id);
    setFormState({
      name: plan.name,
      monthlyPrice: `$${plan.monthlyPrice}`,
      yearlyPrice: `$${plan.yearlyPrice.toLocaleString()}`,
      branchLimit: plan.branches.replace(' branches', '').trim(),
      staffLimit: plan.staffSeats.replace(' staff seats', '').trim(),
      status: plan.status,
      modules: { ...plan.modules },
    });
    setIsFormOpen(true);

    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  };

  const handleOpenCreate = () => {
    setFormMode('create');
    setEditingPlanId(null);
    setFormState({
      name: '',
      monthlyPrice: '',
      yearlyPrice: '',
      branchLimit: '',
      staffLimit: '',
      status: 'Active',
      modules: {
        posPayments: true,
        menuManagement: true,
        inventory: false,
        advancedReports: false,
        apiAccess: false,
      },
    });
    setIsFormOpen(true);

    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
  };

  const handleToggleDisable = (planId: string) => {
    setPlans((prev) =>
      prev.map((plan) => {
        if (plan.id === planId) {
          const nextStatus = plan.status === 'Active' ? 'Disabled' : 'Active';
          if (nextStatus === 'Disabled') {
            toast.info(`Plan ${plan.name} has been disabled.`);
          } else {
            toast.success(`Plan ${plan.name} has been activated.`);
          }
          return { ...plan, status: nextStatus };
        }
        return plan;
      })
    );
  };

  const handleSave = () => {
    if (!formState.name.trim()) {
      toast.error('Please enter a plan name.');
      return;
    }

    const cleanMonthly = parseInt(formState.monthlyPrice.replace(/[^0-9]/g, ''), 10) || 0;
    const cleanYearly = parseInt(formState.yearlyPrice.replace(/[^0-9]/g, ''), 10) || 0;
    const cleanBranches = formState.branchLimit.toLowerCase().includes('unlimited')
      ? 'Unlimited branches'
      : `${formState.branchLimit.trim() || '1'} branches`;
    const cleanStaff = formState.staffLimit.toLowerCase().includes('unlimited')
      ? 'Unlimited staff seats'
      : `${formState.staffLimit.trim() || '1'} staff seats`;

    if (formMode === 'edit' && editingPlanId) {
      setPlans((prev) =>
        prev.map((plan) => {
          if (plan.id === editingPlanId) {
            return {
              ...plan,
              name: formState.name.trim(),
              monthlyPrice: cleanMonthly,
              yearlyPrice: cleanYearly,
              branches: cleanBranches,
              staffSeats: cleanStaff,
              status: formState.status,
              modules: { ...formState.modules },
            };
          }
          return plan;
        })
      );
      toast.success(`Plan "${formState.name.trim()}" updated successfully.`);
    } else {
      const newId = `plan-${Date.now()}`;
      const newPlan: PlanItem = {
        id: newId,
        name: formState.name.trim(),
        tenantsCount: 0,
        status: formState.status,
        monthlyPrice: cleanMonthly,
        yearlyPrice: cleanYearly,
        branches: cleanBranches,
        staffSeats: cleanStaff,
        features: ['✓ POS', '✓ Menu', '✓ Basic reports'],
        isPopular: false,
        modules: { ...formState.modules },
      };
      setPlans((prev) => [...prev, newPlan]);
      toast.success(`Plan "${formState.name.trim()}" created successfully.`);
    }

    setIsFormOpen(false);
  };

  return (
    <SuperAdminLayout>
      <div className="flex flex-col justify-start items-start w-full animate-fade-in font-inter text-white pb-12">
        {/* Page Header matching Figma */}
        <div className="self-stretch min-h-16 inline-flex justify-between items-center">
          <div className="w-72 inline-flex flex-col justify-start items-start">
            <div className="self-stretch flex flex-col justify-start items-start">
              <div className="justify-start text-white text-3xl font-semibold font-['Inter'] leading-9">
                Plans
              </div>
            </div>
            <div className="w-72 h-7 pt-[5px] flex flex-col justify-start items-start">
              <div className="justify-start text-zinc-500 text-sm font-normal font-['Inter'] leading-6">
                Create and manage subscription offerings.
              </div>
            </div>
          </div>
          <button
            onClick={handleOpenCreate}
            className="min-h-9 px-3 py-2 bg-yellow-400 hover:bg-yellow-300 rounded-lg outline outline-1 outline-offset-[-1px] outline-yellow-400 inline-flex flex-col justify-center items-center cursor-pointer transition shadow-sm"
          >
            <div className="text-center justify-start text-neutral-800 text-xs font-medium font-['Inter'] leading-5">
              + Create plan
            </div>
          </button>
        </div>

        {/* 3 Subscription Plan Cards Grid matching Figma */}
        <div className="self-stretch pt-7 flex flex-col justify-start items-start">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full">
            {plans.map((plan) => {
              const isPopular = plan.isPopular;

              return (
                <div
                  key={plan.id}
                  className={`p-5 rounded-xl outline outline-1 outline-offset-[-1px] flex flex-col justify-between transition-all ${
                    isPopular
                      ? 'relative bg-neutral-900 outline-yellow-400/60 shadow-[0_0_15px_rgba(250,204,21,0.06)]'
                      : 'bg-neutral-900 outline-zinc-800'
                  }`}
                >
                  {/* "Most popular" badge pill on Pro matching Figma */}
                  {isPopular && (
                    <div className="px-2.5 py-1 left-[21px] -top-2.5 absolute bg-yellow-400 rounded-xl flex flex-col justify-start items-start shadow-sm pointer-events-none">
                      <div className="justify-start text-neutral-800 text-[9px] font-semibold font-['Inter'] uppercase leading-3">
                        Most popular
                      </div>
                    </div>
                  )}

                  <div>
                    {/* Header Row: Title & Active Badge */}
                    <div className="self-stretch h-11 inline-flex justify-between items-start">
                      <div className="inline-flex flex-col justify-start items-start">
                        <div className="self-stretch flex flex-col justify-start items-start">
                          <div className="justify-start text-white text-xl font-semibold font-['Inter'] leading-5">
                            {plan.name}
                          </div>
                        </div>
                        <div className="h-5 pt-[5px] flex flex-col justify-start items-start">
                          <div className="justify-start text-neutral-400 text-xs font-normal font-['Inter'] leading-4">
                            {plan.tenantsCount} active tenants
                          </div>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div
                        className={`min-h-6 px-2 py-1 rounded-md flex justify-center items-center ${
                          plan.status === 'Active'
                            ? 'bg-green-500/10 text-green-500'
                            : 'bg-zinc-800 text-neutral-400'
                        }`}
                      >
                        <div className="justify-start text-[10px] font-medium font-['Inter'] leading-4">
                          {plan.status}
                        </div>
                      </div>
                    </div>

                    {/* Monthly Price */}
                    <div className="w-full h-16 pt-6 flex flex-col justify-start items-start">
                      <div className="justify-start">
                        <span className="text-white text-3xl font-semibold font-['Inter'] leading-10">
                          ${plan.monthlyPrice}
                        </span>
                        <span className="text-neutral-400 text-xs font-normal font-['Inter'] leading-4">
                          /month
                        </span>
                      </div>
                    </div>

                    {/* Yearly Billed */}
                    <div className="w-full h-5 pt-[5px] flex flex-col justify-start items-start">
                      <div className="justify-start text-neutral-400 text-xs font-normal font-['Inter'] leading-4">
                        ${plan.yearlyPrice.toLocaleString()} billed yearly
                      </div>
                    </div>

                    {/* Limits section with divider border */}
                    <div className="self-stretch pt-5 flex flex-col justify-start items-start">
                      <div className="self-stretch h-12 py-4 border-t border-b border-zinc-800 inline-flex justify-start items-start gap-3.5">
                        <div className="self-stretch inline-flex flex-col justify-start items-start">
                          <div className="justify-start text-stone-300 text-xs font-normal font-['Inter'] leading-4">
                            {plan.branches}
                          </div>
                        </div>
                        <div className="self-stretch inline-flex flex-col justify-start items-start">
                          <div className="justify-start text-stone-300 text-xs font-normal font-['Inter'] leading-4">
                            {plan.staffSeats}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Features list matching Figma */}
                    <div className="self-stretch min-h-28 flex flex-col justify-start items-start pt-1">
                      {plan.features.map((feature, idx) => (
                        <div key={idx} className="self-stretch flex flex-col justify-start items-start">
                          <div className="justify-start text-zinc-400 text-xs font-normal font-['Inter'] leading-8">
                            {feature}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Edit / Disable Action Buttons matching Figma */}
                  <div className="h-9 inline-flex justify-start items-start gap-2 w-full pt-4 mt-auto">
                    <button
                      onClick={() => handleOpenEdit(plan)}
                      className="flex-1 min-h-9 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 inline-flex flex-col justify-center items-center cursor-pointer transition"
                    >
                      <div className="text-center justify-start text-neutral-200 text-xs font-medium font-['Inter'] leading-5">
                        Edit
                      </div>
                    </button>
                    <button
                      onClick={() => handleToggleDisable(plan.id)}
                      className={`flex-1 min-h-9 px-3 py-2 rounded-lg outline outline-1 outline-offset-[-1px] inline-flex flex-col justify-center items-center cursor-pointer transition ${
                        plan.status === 'Active'
                          ? 'outline-zinc-800 hover:bg-zinc-800/40 text-neutral-400 hover:text-neutral-200'
                          : 'outline-green-500/30 bg-green-500/10 hover:bg-green-500/20 text-green-400'
                      }`}
                    >
                      <div className="text-center justify-start text-xs font-medium font-['Inter'] leading-5">
                        {plan.status === 'Active' ? 'Disable' : 'Enable'}
                      </div>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Inline Edit / Create Plan Card matching Figma & Screenshot 2 */}
        {isFormOpen && (
          <div ref={formRef} className="self-stretch pt-4 flex flex-col justify-start items-start w-full">
            <div className="self-stretch p-5 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-zinc-800 flex flex-col justify-start items-start shadow-xl">
              {/* Header with Title, Subtitle and × close button */}
              <div className="self-stretch inline-flex justify-between items-center">
                <div className="inline-flex flex-col justify-start items-start">
                  <div className="self-stretch flex flex-col justify-start items-start">
                    <div className="justify-start text-white text-base font-semibold font-['Inter'] leading-5">
                      {formMode === 'create' ? 'Create plan' : 'Edit plan'}
                    </div>
                  </div>
                  <div className="h-5 pt-1 flex flex-col justify-start items-start">
                    <div className="justify-start text-neutral-400 text-xs font-normal font-['Inter'] leading-4">
                      {formMode === 'create'
                        ? 'Configure new pricing tier, limits, and included modules.'
                        : 'Update pricing, limits, and included modules.'}
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleCloseForm}
                  className="size-8 inline-flex flex-col justify-center items-center hover:bg-zinc-800 rounded-lg cursor-pointer transition"
                  title="Close"
                >
                  <div className="text-center justify-start text-neutral-400 hover:text-white text-2xl font-normal font-['Inter'] leading-none">
                    ×
                  </div>
                </button>
              </div>

              {/* Form Input Fields Grid matching Figma */}
              <div className="self-stretch pt-4 flex flex-col justify-start items-start w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                  {/* Plan name */}
                  <div className="inline-flex flex-col justify-start items-start w-full">
                    <div className="self-stretch h-4 relative">
                      <label className="left-0 top-0 absolute justify-start text-neutral-400 text-xs font-normal font-['Inter'] leading-4">
                        Plan name
                      </label>
                    </div>
                    <div className="self-stretch pt-1.5 flex flex-col justify-start items-start">
                      <div className="w-full h-10 px-3 bg-neutral-950 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 flex flex-col justify-center items-start overflow-hidden focus-within:outline-zinc-500 transition">
                        <input
                          type="text"
                          value={formState.name}
                          onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                          className="w-full bg-transparent text-stone-300 text-xs font-normal font-['Inter'] leading-4 focus:outline-none"
                          placeholder="Growth"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Monthly price */}
                  <div className="inline-flex flex-col justify-start items-start w-full">
                    <div className="self-stretch h-4 relative">
                      <label className="left-0 top-0 absolute justify-start text-neutral-400 text-xs font-normal font-['Inter'] leading-4">
                        Monthly price
                      </label>
                    </div>
                    <div className="self-stretch pt-1.5 flex flex-col justify-start items-start">
                      <div className="w-full h-10 px-3 bg-neutral-950 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 flex flex-col justify-center items-start overflow-hidden focus-within:outline-zinc-500 transition">
                        <input
                          type="text"
                          value={formState.monthlyPrice}
                          onChange={(e) => setFormState({ ...formState, monthlyPrice: e.target.value })}
                          className="w-full bg-transparent text-stone-300 text-xs font-normal font-['Inter'] leading-4 focus:outline-none"
                          placeholder="$149"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Yearly price */}
                  <div className="inline-flex flex-col justify-start items-start w-full">
                    <div className="self-stretch h-4 relative">
                      <label className="left-0 top-0 absolute justify-start text-neutral-400 text-xs font-normal font-['Inter'] leading-4">
                        Yearly price
                      </label>
                    </div>
                    <div className="self-stretch pt-1.5 flex flex-col justify-start items-start">
                      <div className="w-full h-10 px-3 bg-neutral-950 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 flex flex-col justify-center items-start overflow-hidden focus-within:outline-zinc-500 transition">
                        <input
                          type="text"
                          value={formState.yearlyPrice}
                          onChange={(e) => setFormState({ ...formState, yearlyPrice: e.target.value })}
                          className="w-full bg-transparent text-stone-300 text-xs font-normal font-['Inter'] leading-4 focus:outline-none"
                          placeholder="$1,490"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Branch limit */}
                  <div className="inline-flex flex-col justify-start items-start w-full">
                    <div className="self-stretch h-4 relative">
                      <label className="left-0 top-0 absolute justify-start text-neutral-400 text-xs font-normal font-['Inter'] leading-4">
                        Branch limit
                      </label>
                    </div>
                    <div className="self-stretch pt-1.5 flex flex-col justify-start items-start">
                      <div className="w-full h-10 px-3 bg-neutral-950 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 flex flex-col justify-center items-start overflow-hidden focus-within:outline-zinc-500 transition">
                        <input
                          type="text"
                          value={formState.branchLimit}
                          onChange={(e) => setFormState({ ...formState, branchLimit: e.target.value })}
                          className="w-full bg-transparent text-stone-300 text-xs font-normal font-['Inter'] leading-4 focus:outline-none"
                          placeholder="15"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Staff seat limit */}
                  <div className="inline-flex flex-col justify-start items-start w-full">
                    <div className="self-stretch h-4 relative">
                      <label className="left-0 top-0 absolute justify-start text-neutral-400 text-xs font-normal font-['Inter'] leading-4">
                        Staff seat limit
                      </label>
                    </div>
                    <div className="self-stretch pt-1.5 flex flex-col justify-start items-start">
                      <div className="w-full h-10 px-3 bg-neutral-950 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 flex flex-col justify-center items-start overflow-hidden focus-within:outline-zinc-500 transition">
                        <input
                          type="text"
                          value={formState.staffLimit}
                          onChange={(e) => setFormState({ ...formState, staffLimit: e.target.value })}
                          className="w-full bg-transparent text-stone-300 text-xs font-normal font-['Inter'] leading-4 focus:outline-none"
                          placeholder="75"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Status Dropdown */}
                  <div className="inline-flex flex-col justify-start items-start w-full">
                    <div className="self-stretch h-4 relative">
                      <label className="left-0 top-0 absolute justify-start text-neutral-400 text-xs font-normal font-['Inter'] leading-4">
                        Status
                      </label>
                    </div>
                    <div className="self-stretch pt-1.5 flex flex-col justify-start items-start">
                      <div className="w-full h-10 min-w-32 relative bg-neutral-950 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 overflow-hidden flex items-center">
                        <select
                          value={formState.status}
                          onChange={(e) =>
                            setFormState({
                              ...formState,
                              status: e.target.value as 'Active' | 'Disabled',
                            })
                          }
                          className="w-full h-full bg-transparent text-stone-300 text-xs font-normal font-['Inter'] pl-4 pr-8 focus:outline-none appearance-none cursor-pointer"
                        >
                          <option value="Active" className="bg-neutral-900 text-white">
                            Active
                          </option>
                          <option value="Disabled" className="bg-neutral-900 text-white">
                            Disabled
                          </option>
                        </select>
                        <div className="w-5 h-9 right-3 absolute flex justify-center items-center pointer-events-none">
                          <span className="text-stone-300 text-xs">⌄</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Module Checkboxes Row matching Figma */}
              <div className="w-full pt-5 flex flex-wrap items-center gap-4">
                {MODULE_OPTIONS.map((mod) => {
                  const isChecked = formState.modules[mod.key];

                  return (
                    <button
                      key={mod.key}
                      type="button"
                      onClick={() =>
                        setFormState({
                          ...formState,
                          modules: {
                            ...formState.modules,
                            [mod.key]: !isChecked,
                          },
                        })
                      }
                      className="flex items-center gap-1.5 cursor-pointer select-none group"
                    >
                      {isChecked ? (
                        <div className="size-3 relative bg-yellow-400 rounded-xs outline outline-1 outline-offset-[-1px] outline-yellow-400 inline-flex justify-center items-center">
                          <svg
                            className="size-2 text-black"
                            viewBox="0 0 12 12"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M2.5 6.5L4.8 8.8L9.5 3.5"
                              stroke="black"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      ) : (
                        <div className="size-3 relative bg-neutral-950 rounded-xs outline outline-1 outline-offset-[-1px] outline-neutral-600 group-hover:outline-neutral-400 transition-colors" />
                      )}
                      <div className="justify-start text-neutral-400 group-hover:text-neutral-200 text-xs font-normal font-['Inter'] leading-4 transition-colors">
                        {mod.label}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Action Buttons Row matching Figma */}
              <div className="w-full pt-5 flex justify-end items-center gap-2">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="min-h-9 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 inline-flex flex-col justify-center items-center cursor-pointer transition"
                >
                  <div className="text-center justify-start text-neutral-200 text-xs font-medium font-['Inter'] leading-5">
                    Cancel
                  </div>
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="min-h-9 px-3 py-2 bg-yellow-400 hover:bg-yellow-300 rounded-lg outline outline-1 outline-offset-[-1px] outline-yellow-400 inline-flex flex-col justify-center items-center cursor-pointer transition shadow-sm"
                >
                  <div className="text-center justify-start text-neutral-800 text-xs font-medium font-['Inter'] leading-5">
                    {formMode === 'create' ? 'Create plan' : 'Save changes'}
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </SuperAdminLayout>
  );
}
