'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface AddTenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTenantCreated?: (newTenant: any) => void;
}

export function AddTenantModal({ isOpen, onClose, onTenantCreated }: AddTenantModalProps) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [ownerName, setOwnerName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [plan, setPlan] = useState<'Starter' | 'Growth' | 'Pro' | 'Enterprise'>('Pro');
  const [billingCycle, setBillingCycle] = useState<'Monthly' | 'Yearly'>('Monthly');

  if (!isOpen) return null;

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerName.trim() || !businessName.trim() || !ownerEmail.trim()) {
      toast.error('Please complete all owner and business details.');
      return;
    }
    setStep(2);
  };

  const handleCreate = () => {
    const newTenant = {
      id: `t-${Date.now()}`,
      name: businessName,
      businessName,
      ownerName,
      email: ownerEmail,
      phone: '+1 (555) 019-2834',
      company: `${businessName} LLC`,
      plan,
      billingCycle,
      restaurantsCount: 1,
      branchesCount: 1,
      branchesMax: plan === 'Starter' ? 2 : plan === 'Growth' ? 5 : plan === 'Pro' ? 15 : 50,
      status: 'Trial' as const,
      joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      nextBillingDate: new Date(Date.now() + 14 * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      paymentMethod: 'Pending Onboarding',
      mrr: plan === 'Starter' ? 49 : plan === 'Growth' ? 149 : plan === 'Pro' ? 219 : 499,
      restaurants: [{ id: `r-${Date.now()}`, name: `${businessName} Main`, branchesCount: 1 }],
      invoices: [],
    };

    if (onTenantCreated) {
      onTenantCreated(newTenant);
    }
    toast.success(`Tenant ${businessName} created successfully.`);
    setStep(3);
  };

  const handleDone = () => {
    onClose();
    setStep(1);
    setOwnerName('');
    setBusinessName('');
    setOwnerEmail('');
  };

  const handleViewTenant = () => {
    onClose();
    router.push(`/tenants/t-1`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-[5px] flex items-center justify-center p-4">
      <div className="w-[560px] max-w-full bg-neutral-900 rounded-xl shadow-[0px_0px_20px_0px_rgba(255,255,255,0.05)] shadow-[0px_24px_80px_0px_rgba(0,0,0,0.70)] outline outline-1 outline-offset-[-1px] outline-neutral-700 flex flex-col justify-start items-start overflow-hidden font-inter animate-fade-in">
        
        {/* Modal Header matching Figma */}
        <div className="self-stretch min-h-20 px-5 py-4 border-b border-zinc-800 flex justify-between items-center">
          <div className="flex flex-col">
            <h3 className="text-white text-lg font-semibold leading-5">
              {step === 3 ? 'Tenant created' : 'Add tenant'}
            </h3>
            <span className="text-neutral-400 text-xs font-normal leading-4 pt-1">
              {step === 1 && 'Start with the owner and business details.'}
              {step === 2 && 'Choose the initial subscription.'}
              {step === 3 && 'The workspace is ready to use.'}
            </span>
          </div>

          {/* Close button with Figma styling */}
          <button
            onClick={onClose}
            className="w-9 h-9 px-2.5 py-2 bg-gray-300/10 hover:bg-gray-300/20 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 flex justify-center items-center transition"
          >
            <span className="text-gray-200 text-sm leading-none font-bold">✕</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="self-stretch px-5 py-5 flex flex-col justify-start items-start">
          
          {/* Stepper matching Figma */}
          <div className="self-stretch inline-flex justify-between items-center">
            {/* Step 1 badge */}
            <div className="size-6 bg-yellow-400 rounded-xl outline outline-1 outline-offset-[-1px] outline-yellow-400 flex justify-center items-center">
              <span className="text-neutral-800 text-xs font-medium leading-4">1</span>
            </div>

            {/* Line 1 */}
            <div className={`flex-1 h-px relative ${step >= 2 ? 'bg-yellow-400' : 'bg-neutral-700'}`} />

            {/* Step 2 badge */}
            <div
              className={`size-6 rounded-xl outline outline-1 outline-offset-[-1px] flex justify-center items-center ${
                step >= 2
                  ? 'bg-yellow-400 outline-yellow-400 text-neutral-800 font-medium'
                  : 'bg-neutral-900 outline-neutral-700 text-neutral-400 font-medium'
              }`}
            >
              <span className="text-xs leading-4">2</span>
            </div>

            {/* Line 2 */}
            <div className={`flex-1 h-px relative ${step === 3 ? 'bg-yellow-400' : 'bg-neutral-700'}`} />

            {/* Step 3 badge */}
            <div
              className={`size-6 rounded-xl outline outline-1 outline-offset-[-1px] flex justify-center items-center ${
                step === 3
                  ? 'bg-yellow-400 outline-yellow-400 text-neutral-800 font-medium'
                  : 'bg-neutral-900 outline-neutral-700 text-neutral-400 font-medium'
              }`}
            >
              <span className="text-xs leading-4">3</span>
            </div>
          </div>

          {/* Step 1 Form */}
          {step === 1 && (
            <div className="self-stretch pt-6 flex flex-col gap-4">
              {/* Owner name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-neutral-400 text-xs font-normal leading-4">Owner name</label>
                <div className="h-10 px-3 bg-neutral-950 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 flex items-center focus-within:outline-yellow-400">
                  <input
                    type="text"
                    required
                    placeholder="e.g. Samira Khan"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="w-full bg-transparent text-white placeholder-stone-300/50 text-xs font-normal focus:outline-none"
                  />
                </div>
              </div>

              {/* Business name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-neutral-400 text-xs font-normal leading-4">Business name</label>
                <div className="h-10 px-3 bg-neutral-950 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 flex items-center focus-within:outline-yellow-400">
                  <input
                    type="text"
                    required
                    placeholder="e.g. Saffron Table Co."
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full bg-transparent text-white placeholder-stone-300/50 text-xs font-normal focus:outline-none"
                  />
                </div>
              </div>

              {/* Owner email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-neutral-400 text-xs font-normal leading-4">Owner email</label>
                <div className="h-10 px-3 bg-neutral-950 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 flex items-center focus-within:outline-yellow-400">
                  <input
                    type="email"
                    required
                    placeholder="owner@business.com"
                    value={ownerEmail}
                    onChange={(e) => setOwnerEmail(e.target.value)}
                    className="w-full bg-transparent text-white placeholder-stone-300/50 text-xs font-normal focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2 Form */}
          {step === 2 && (
            <div className="self-stretch pt-6 flex flex-col gap-4">
              {/* Plan Dropdown */}
              <div className="flex flex-col gap-1.5">
                <label className="text-neutral-400 text-xs font-normal leading-4">Plan</label>
                <div className="h-10 px-3 bg-neutral-950 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 flex items-center relative">
                  <select
                    value={plan}
                    onChange={(e) => setPlan(e.target.value as any)}
                    className="w-full bg-transparent text-stone-300 text-xs font-normal focus:outline-none appearance-none cursor-pointer pr-8"
                  >
                    <option value="Starter" className="bg-neutral-900 text-white">Starter</option>
                    <option value="Growth" className="bg-neutral-900 text-white">Growth</option>
                    <option value="Pro" className="bg-neutral-900 text-white">Pro</option>
                    <option value="Enterprise" className="bg-neutral-900 text-white">Enterprise</option>
                  </select>
                  <span className="absolute right-3.5 text-stone-300 text-xs pointer-events-none">⌄</span>
                </div>
              </div>

              {/* Billing cycle Dropdown */}
              <div className="flex flex-col gap-1.5">
                <label className="text-neutral-400 text-xs font-normal leading-4">Billing cycle</label>
                <div className="h-10 px-3 bg-neutral-950 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 flex items-center relative">
                  <select
                    value={billingCycle}
                    onChange={(e) => setBillingCycle(e.target.value as any)}
                    className="w-full bg-transparent text-stone-300 text-xs font-normal focus:outline-none appearance-none cursor-pointer pr-8"
                  >
                    <option value="Monthly" className="bg-neutral-900 text-white">Monthly</option>
                    <option value="Yearly" className="bg-neutral-900 text-white">Yearly</option>
                  </select>
                  <span className="absolute right-3.5 text-stone-300 text-xs pointer-events-none">⌄</span>
                </div>
              </div>

              {/* Summary Box matching Figma */}
              <div className="p-3.5 bg-neutral-950 rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-800 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400 text-xs font-normal leading-4">Tenant</span>
                  <span className="text-white text-xs font-medium leading-4">{businessName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400 text-xs font-normal leading-4">Subscription</span>
                  <span className="text-white text-xs font-medium leading-4">{plan} &bull; {billingCycle}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400 text-xs font-normal leading-4">Trial</span>
                  <span className="text-white text-xs font-medium leading-4">14 days</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 3 Success State matching Figma */}
          {step === 3 && (
            <div className="w-full h-56 pt-6 flex flex-col justify-center items-center text-center">
              {/* Green check circle badge */}
              <div className="size-12 bg-green-500/10 rounded-3xl flex justify-center items-center mb-4">
                <span className="text-green-500 text-2xl font-normal leading-9">✓</span>
              </div>
              <h4 className="text-white text-lg font-semibold leading-5">
                {businessName} is ready
              </h4>
              <p className="w-96 max-w-full text-neutral-400 text-xs font-normal leading-5 pt-2">
                An invitation was sent to {ownerEmail}. The tenant starts on a 14-day {plan} trial.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer Actions matching Figma */}
        <div className="self-stretch h-16 px-5 py-3.5 bg-stone-950 border-t border-zinc-800 flex justify-end items-center gap-2">
          {step === 1 && (
            <>
              <button
                type="button"
                onClick={onClose}
                className="min-h-9 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 text-neutral-200 text-xs font-medium leading-5 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleContinue}
                className="min-h-9 px-3 py-2 bg-yellow-400 hover:bg-yellow-300 rounded-lg outline outline-1 outline-offset-[-1px] outline-yellow-400 text-neutral-800 text-xs font-medium leading-5 transition"
              >
                Continue
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="min-h-9 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 text-neutral-200 text-xs font-medium leading-5 transition"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleCreate}
                className="min-h-9 px-3 py-2 bg-yellow-400 hover:bg-yellow-300 rounded-lg outline outline-1 outline-offset-[-1px] outline-yellow-400 text-neutral-800 text-xs font-medium leading-5 transition"
              >
                Create tenant
              </button>
            </>
          )}

          {step === 3 && (
            <>
              <button
                type="button"
                onClick={handleDone}
                className="min-h-9 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 text-neutral-200 text-xs font-medium leading-5 transition"
              >
                Done
              </button>
              <button
                type="button"
                onClick={handleViewTenant}
                className="min-h-9 px-3 py-2 bg-yellow-400 hover:bg-yellow-300 rounded-lg outline outline-1 outline-offset-[-1px] outline-yellow-400 text-neutral-800 text-xs font-medium leading-5 transition"
              >
                View tenant
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
