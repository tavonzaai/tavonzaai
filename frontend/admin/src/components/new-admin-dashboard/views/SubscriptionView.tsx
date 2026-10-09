'use client';

import React, { useState } from 'react';
import {
  Check,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  Download,
  FileText,
  CreditCard,
  Building,
  Store,
  Users,
  ShieldCheck,
  AlertCircle,
  X,
  Printer,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

interface PlanDefinition {
  id: 'basic' | 'pro' | 'enterprise';
  name: string;
  price: number;
  billingPeriod: string;
  tagline: string;
  restaurantsLimit: number | 'Unlimited';
  branchesLimit: number | 'Unlimited';
  staffLimit: number | 'Unlimited';
  features: string[];
}

const PLANS: PlanDefinition[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 199,
    billingPeriod: 'month',
    tagline: 'The essentials for a growing restaurant.',
    restaurantsLimit: 1,
    branchesLimit: 5,
    staffLimit: 15,
    features: [
      '1 restaurant',
      '5 branches',
      '15 staff members',
      'Core order management',
      'Standard reports',
      'Email support',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 499,
    billingPeriod: 'month',
    tagline: 'More control for multi-branch teams.',
    restaurantsLimit: 5,
    branchesLimit: 20,
    staffLimit: 50,
    features: [
      '5 restaurants',
      '20 branches',
      '50 staff members',
      'Advanced analytics',
      'Inventory automation',
      'Priority support',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 599,
    billingPeriod: 'month',
    tagline: 'Scale operations without compromise.',
    restaurantsLimit: 'Unlimited',
    branchesLimit: 'Unlimited',
    staffLimit: 200,
    features: [
      'Unlimited restaurants',
      'Unlimited branches',
      '200 staff members',
      'Custom roles & access',
      'API integrations',
      'Dedicated manager',
    ],
  },
];

interface InvoiceItem {
  id: string;
  date: string;
  plan: string;
  amount: string;
  status: 'Paid';
  paymentMethod: string;
  subtotal: string;
  vat: string;
}

const INITIAL_INVOICES: InvoiceItem[] = [
  {
    id: 'INV-2026-10-15',
    date: '15 Oct 2026',
    plan: 'Pro Plan',
    amount: '$499',
    status: 'Paid',
    paymentMethod: 'Visa ending in 4242',
    subtotal: '$475.24',
    vat: '$23.76',
  },
  {
    id: 'INV-2026-09-15',
    date: '15 Sep 2026',
    plan: 'Pro Plan',
    amount: '$499',
    status: 'Paid',
    paymentMethod: 'Visa ending in 4242',
    subtotal: '$475.24',
    vat: '$23.76',
  },
  {
    id: 'INV-2026-08-15',
    date: '15 Aug 2026',
    plan: 'Pro Plan',
    amount: '$499',
    status: 'Paid',
    paymentMethod: 'Visa ending in 4242',
    subtotal: '$475.24',
    vat: '$23.76',
  },
  {
    id: 'INV-2026-07-15',
    date: '15 Jul 2026',
    plan: 'Pro Plan',
    amount: '$499',
    status: 'Paid',
    paymentMethod: 'Visa ending in 4242',
    subtotal: '$475.24',
    vat: '$23.76',
  },
];

export default function SubscriptionView() {
  const [currentPlanId, setCurrentPlanId] = useState<'basic' | 'pro' | 'enterprise'>('pro');
  const [invoices, setInvoices] = useState<InvoiceItem[]>(INITIAL_INVOICES);

  // Modal State for Subscription Change Flow (Step 1 -> Step 2 -> Step 3)
  const [selectedPlanForModal, setSelectedPlanForModal] = useState<PlanDefinition | null>(null);
  const [changeStep, setChangeStep] = useState<1 | 2 | 3>(1);
  const [isProcessingChange, setIsProcessingChange] = useState<boolean>(false);

  // Modal State for Invoice View
  const [viewInvoice, setViewInvoice] = useState<InvoiceItem | null>(null);

  const currentPlan = PLANS.find((p) => p.id === currentPlanId) || PLANS[1];

  // Workspace capacity counts
  const restaurantsUsed = 2;
  const restaurantsMax = typeof currentPlan.restaurantsLimit === 'number' ? currentPlan.restaurantsLimit : 10;
  const restaurantsAvail = typeof currentPlan.restaurantsLimit === 'number' ? currentPlan.restaurantsLimit - restaurantsUsed : 'Unlimited';

  const branchesUsed = 6;
  const branchesMax = typeof currentPlan.branchesLimit === 'number' ? currentPlan.branchesLimit : 50;
  const branchesAvail = typeof currentPlan.branchesLimit === 'number' ? currentPlan.branchesLimit - branchesUsed : 'Unlimited';

  const staffUsed = 24;
  const staffMax = typeof currentPlan.staffLimit === 'number' ? currentPlan.staffLimit : 200;
  const staffAvail = typeof currentPlan.staffLimit === 'number' ? currentPlan.staffLimit - staffUsed : 'Unlimited';

  const handleOpenPlanModal = (plan: PlanDefinition) => {
    if (plan.id === currentPlanId) {
      toast.info(`You are currently on the ${plan.name} Plan.`);
      return;
    }
    setSelectedPlanForModal(plan);
    setChangeStep(1);
  };

  const handleConfirmPlanChange = () => {
    if (!selectedPlanForModal) return;
    setIsProcessingChange(true);

    setTimeout(() => {
      setCurrentPlanId(selectedPlanForModal.id);
      setIsProcessingChange(false);
      setSelectedPlanForModal(null);
      setChangeStep(1);

      // Prepend newly generated invoice
      const newInvoice: InvoiceItem = {
        id: `INV-${Date.now().toString().slice(-6)}`,
        date: 'Today',
        plan: `${selectedPlanForModal.name} Plan`,
        amount: `$${selectedPlanForModal.price}`,
        status: 'Paid',
        paymentMethod: 'Visa ending in 4242',
        subtotal: `$${(selectedPlanForModal.price * 0.95).toFixed(2)}`,
        vat: `$${(selectedPlanForModal.price * 0.05).toFixed(2)}`,
      };
      setInvoices((prev) => [newInvoice, ...prev]);

      toast.success(`Successfully switched to ${selectedPlanForModal.name} Plan!`);
    }, 500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-3">
            <h1 className="text-white text-3xl font-semibold font-sans leading-9">
              Subscription &amp; Billing
            </h1>
          </div>
          <p className="text-zinc-500 text-sm font-normal font-sans leading-6">
            Manage your plan, monitor usage and access your billing documents.
          </p>
        </div>

        {/* Subscription Active Badge (Exact Figma) */}
        <div className="flex items-center">
          <div className="px-3.5 py-2.5 bg-green-500/10 rounded-md outline outline-1 outline-offset-[-1px] outline-green-700/70 flex justify-center items-center gap-2">
            <div className="size-2.5 bg-green-500 rounded-full animate-pulse" />
            <div className="text-green-500 text-sm font-medium font-sans leading-4">
              Subscription Active
            </div>
          </div>
        </div>
      </div>

      {/* 2. Current Plan Overview Card (Exact Figma Layout & Typography) */}
      <div className="p-5 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-800 flex flex-col justify-start items-start gap-4">
        <div className="w-full pb-2 flex flex-col justify-start items-start gap-1">
          <div className="text-zinc-500 text-sm font-medium font-sans leading-4 tracking-wide">
            Current plan
          </div>
          <div className="text-zinc-100 text-2xl font-normal font-sans leading-7">
            {currentPlan.name} Plan
          </div>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-gray-200 text-xl font-bold font-sans leading-7">
              ${currentPlan.price}
            </span>
            <span className="text-zinc-500 text-xs font-medium font-sans leading-4">
              /month
            </span>
          </div>
        </div>

        <div className="w-full h-0 outline outline-1 outline-offset-[-0.50px] outline-neutral-800" />

        {/* Billing details grid: Billing cycle, Started on, Next renewal */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-neutral-800 pt-1">
          <div className="py-2 sm:py-0 sm:px-4 first:pl-0 flex flex-col gap-1">
            <span className="text-zinc-500 text-sm font-medium font-sans tracking-wide">
              Billing cycle
            </span>
            <span className="text-zinc-100 text-base font-normal font-sans">
              Monthly
            </span>
          </div>

          <div className="py-2 sm:py-0 sm:px-4 flex flex-col gap-1">
            <span className="text-zinc-500 text-sm font-medium font-sans tracking-wide">
              Started on
            </span>
            <span className="text-zinc-100 text-base font-normal font-sans">
              15 Jan 2026
            </span>
          </div>

          <div className="py-2 sm:py-0 sm:px-4 flex flex-col gap-1">
            <span className="text-zinc-500 text-sm font-medium font-sans tracking-wide">
              Next renewal
            </span>
            <span className="text-zinc-100 text-base font-normal font-sans">
              15 Nov 2026
            </span>
          </div>
        </div>
      </div>

      {/* 3. Workspace Capacity Section */}
      <div className="space-y-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-zinc-100 text-xl font-normal font-sans leading-6">
            Your workspace capacity
          </h2>
          <p className="text-neutral-400 text-sm font-normal font-sans leading-4">
            Usage updates in real time across your organization.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Restaurants */}
          <div className="p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-800 flex flex-col justify-start items-start gap-2.5">
            <div className="w-full flex justify-between items-start">
              <span className="text-zinc-100 text-base font-normal font-sans leading-5 tracking-tight">
                Restaurants
              </span>
              <div className="flex items-center">
                <span className="text-neutral-50 text-sm font-medium font-sans leading-4">
                  {restaurantsUsed}{' '}
                </span>
                <span className="text-zinc-500 text-sm font-medium font-sans leading-4">
                  / {currentPlan.restaurantsLimit}
                </span>
              </div>
            </div>

            {/* Capacity Progress Bar */}
            <div className="w-full h-1.5 bg-neutral-700/60 rounded-[999px] overflow-hidden relative">
              <div
                className="h-full bg-yellow-500 rounded-[999px] transition-all duration-500"
                style={{
                  width: `${typeof currentPlan.restaurantsLimit === 'number' ? (restaurantsUsed / currentPlan.restaurantsLimit) * 100 : 25}%`,
                }}
              />
            </div>

            <div className="text-zinc-500 text-sm font-medium font-sans leading-4">
              {restaurantsAvail} available
            </div>
          </div>

          {/* Card 2: Branches */}
          <div className="p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-800 flex flex-col justify-start items-start gap-2.5">
            <div className="w-full flex justify-between items-start">
              <span className="text-zinc-100 text-base font-normal font-sans leading-5 tracking-tight">
                Branches
              </span>
              <div className="flex items-center">
                <span className="text-neutral-50 text-sm font-medium font-sans leading-4">
                  {branchesUsed}{' '}
                </span>
                <span className="text-zinc-500 text-sm font-medium font-sans leading-4">
                  / {currentPlan.branchesLimit}
                </span>
              </div>
            </div>

            {/* Capacity Progress Bar */}
            <div className="w-full h-1.5 bg-neutral-700/60 rounded-[999px] overflow-hidden relative">
              <div
                className="h-full bg-yellow-500 rounded-[999px] transition-all duration-500"
                style={{
                  width: `${typeof currentPlan.branchesLimit === 'number' ? (branchesUsed / currentPlan.branchesLimit) * 100 : 30}%`,
                }}
              />
            </div>

            <div className="text-zinc-500 text-sm font-medium font-sans leading-4">
              {branchesAvail} available
            </div>
          </div>

          {/* Card 3: Staff members */}
          <div className="p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-800 flex flex-col justify-start items-start gap-2.5">
            <div className="w-full flex justify-between items-start">
              <span className="text-zinc-100 text-base font-normal font-sans leading-5 tracking-tight">
                Staff members
              </span>
              <div className="flex items-center">
                <span className="text-neutral-50 text-sm font-medium font-sans leading-4">
                  {staffUsed}{' '}
                </span>
                <span className="text-zinc-500 text-sm font-medium font-sans leading-4">
                  / {currentPlan.staffLimit}
                </span>
              </div>
            </div>

            {/* Capacity Progress Bar */}
            <div className="w-full h-1.5 bg-neutral-700/60 rounded-[999px] overflow-hidden relative">
              <div
                className="h-full bg-yellow-500 rounded-[999px] transition-all duration-500"
                style={{
                  width: `${typeof currentPlan.staffLimit === 'number' ? (staffUsed / currentPlan.staffLimit) * 100 : 48}%`,
                }}
              />
            </div>

            <div className="text-zinc-500 text-sm font-medium font-sans leading-4">
              {staffAvail} available
            </div>
          </div>
        </div>
      </div>

      {/* 4. Choose A Plan That Fits Section (3 Pricing Cards) */}
      <div className="space-y-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-zinc-100 text-xl font-normal font-sans leading-6">
            Choose a plan that fits
          </h2>
          <p className="text-neutral-400 text-sm font-normal font-sans leading-4">
            Upgrade or switch anytime. Changes take effect immediately.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PLANS.map((plan) => {
            const isCurrent = plan.id === currentPlanId;

            return (
              <div
                key={plan.id}
                className={`p-6 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] flex flex-col justify-between gap-6 transition-all ${
                  isCurrent
                    ? 'outline-yellow-400/50 shadow-[0_0_20px_rgba(250,204,21,0.06)]'
                    : 'outline-neutral-800 hover:outline-neutral-700'
                }`}
              >
                {/* Top Plan Header & Pricing */}
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <div className="text-white text-lg font-semibold font-sans leading-7">
                      {plan.name}
                    </div>
                    <div className="text-gray-400 text-xs font-normal font-sans leading-4 min-h-[32px]">
                      {plan.tagline}
                    </div>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-white text-2xl font-bold font-sans leading-9">
                      $ {plan.price}
                    </span>
                    <span className="text-gray-400 text-xs font-medium font-sans leading-4">
                      / month
                    </span>
                  </div>

                  {/* Plan Action Button */}
                  {isCurrent ? (
                    <div className="w-full px-3 py-2 bg-white/5 rounded-md outline outline-1 outline-offset-[-1px] outline-neutral-700 flex justify-center items-center gap-1.5 cursor-default">
                      <span className="text-white text-sm font-medium font-sans leading-5">
                        Your current plan
                      </span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleOpenPlanModal(plan)}
                      className="w-full px-3 py-2 bg-yellow-400 hover:bg-yellow-300 text-neutral-800 text-sm font-semibold font-sans rounded-md outline outline-1 outline-offset-[-1px] outline-neutral-700 flex justify-center items-center gap-1.5 transition-all shadow-md active:scale-95"
                    >
                      <span>{plan.price > currentPlan.price ? 'Upgrade plan' : 'Choose plan'}</span>
                      <ArrowRight className="size-4 text-neutral-800" />
                    </button>
                  )}
                </div>

                {/* Plan Includes Feature List */}
                <div className="flex flex-col gap-3 pt-3 border-t border-neutral-800/80">
                  <div className="text-white text-base font-medium font-sans leading-7">
                    Plan includes
                  </div>
                  <div className="flex flex-col gap-2.5">
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="size-4 rounded-full border border-green-500/80 flex items-center justify-center shrink-0">
                          <Check className="size-2.5 text-green-500 stroke-[3]" />
                        </div>
                        <span className="text-neutral-300 text-sm font-normal font-sans leading-4">
                          {feat}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Invoices & Payments Table */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col gap-1">
          <h2 className="text-zinc-100 text-xl font-normal font-sans leading-6">
            Invoices &amp; payments
          </h2>
          <p className="text-neutral-400 text-sm font-normal font-sans leading-4">
            Review and download your past invoices.
          </p>
        </div>

        {/* Invoices Table Container */}
        <div className="overflow-x-auto rounded-lg border border-zinc-800 bg-neutral-950/60 shadow-xl">
          <table className="w-full text-left font-sans">
            <thead>
              <tr className="bg-zinc-900 border-b border-zinc-800 text-white text-sm font-semibold">
                <th className="px-5 py-3.5">Date</th>
                <th className="px-5 py-3.5">Plan</th>
                <th className="px-5 py-3.5 text-center">Amount</th>
                <th className="px-5 py-3.5 text-center">Status</th>
                <th className="px-5 py-3.5 text-right">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {invoices.map((inv) => (
                <tr
                  key={inv.id}
                  className="hover:bg-neutral-900/60 transition-colors group"
                >
                  {/* Date Column */}
                  <td className="px-5 py-4">
                    <span className="text-neutral-200 text-base font-medium font-sans leading-4">
                      {inv.date}
                    </span>
                  </td>

                  {/* Plan Column */}
                  <td className="px-5 py-4">
                    <span className="text-neutral-200 text-base font-medium font-sans leading-4">
                      {inv.plan}
                    </span>
                  </td>

                  {/* Amount Column */}
                  <td className="px-5 py-4 text-center">
                    <span className="text-neutral-200 text-base font-medium font-sans leading-4 font-mono">
                      {inv.amount}
                    </span>
                  </td>

                  {/* Status Column */}
                  <td className="px-5 py-4 text-center">
                    <span className="inline-flex px-3 py-1.5 bg-green-500/10 text-green-500 rounded-md text-sm font-medium font-sans leading-4">
                      {inv.status}
                    </span>
                  </td>

                  {/* Action Column */}
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => setViewInvoice(inv)}
                      className="inline-flex items-center gap-1.5 text-neutral-400 hover:text-white transition-colors"
                    >
                      <FileText className="size-4 text-neutral-400 group-hover:text-amber-400 transition-colors" />
                      <span className="text-xs font-normal font-sans leading-4 underline-offset-2 hover:underline">
                        View invoice
                      </span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Modal: Subscription Change Flow (Step 1 Details & Step 2 Confirm) */}
      {selectedPlanForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-[560px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-neutral-800 flex items-start justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-yellow-400 text-xs font-normal font-sans">
                  Change subscription
                </span>
                <h3 className="text-white text-lg font-medium font-sans">
                  {changeStep === 1
                    ? `${selectedPlanForModal.name} Plan details`
                    : 'Confirm your change'}
                </h3>
              </div>
              <button
                onClick={() => setSelectedPlanForModal(null)}
                className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Stepper (1 Details, 2 Confirm, 3 Payment) */}
              <div className="flex items-center justify-between px-2">
                {/* Step 1 Indicator */}
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={`size-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                      changeStep >= 1
                        ? 'bg-yellow-400 text-black'
                        : 'border border-zinc-600 text-zinc-600'
                    }`}
                  >
                    1
                  </div>
                  <span
                    className={`text-xs font-normal ${
                      changeStep >= 1 ? 'text-yellow-400' : 'text-neutral-500'
                    }`}
                  >
                    Details
                  </span>
                </div>

                <div
                  className={`flex-1 h-0.5 mx-3 ${
                    changeStep >= 2 ? 'bg-yellow-400' : 'bg-neutral-800'
                  }`}
                />

                {/* Step 2 Indicator */}
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={`size-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                      changeStep >= 2
                        ? 'bg-yellow-400 text-black'
                        : 'border border-zinc-600 text-zinc-600'
                    }`}
                  >
                    2
                  </div>
                  <span
                    className={`text-xs font-normal ${
                      changeStep >= 2 ? 'text-yellow-400' : 'text-neutral-500'
                    }`}
                  >
                    Confirm
                  </span>
                </div>

                <div
                  className={`flex-1 h-0.5 mx-3 ${
                    changeStep === 3 ? 'bg-yellow-400' : 'bg-neutral-800'
                  }`}
                />

                {/* Step 3 Indicator */}
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={`size-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                      changeStep === 3
                        ? 'bg-yellow-400 text-black'
                        : 'border border-zinc-600 text-zinc-600'
                    }`}
                  >
                    3
                  </div>
                  <span className="text-xs font-normal text-neutral-500">
                    Payment
                  </span>
                </div>
              </div>

              {/* Step 1 Content: Selected Plan Details */}
              {changeStep === 1 && (
                <div className="space-y-4">
                  {/* Selected Plan Summary Banner */}
                  <div className="px-4 py-3 bg-neutral-800 rounded-lg border border-neutral-800 flex justify-between items-center">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-neutral-500 text-xs font-normal">
                        Selected plan
                      </span>
                      <span className="text-white text-lg font-medium">
                        {selectedPlanForModal.name} Plan
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-white text-lg font-medium">
                        $ {selectedPlanForModal.price}
                      </span>
                      <span className="text-neutral-500 text-xs">/month</span>
                    </div>
                  </div>

                  {/* Feature checklist */}
                  <div className="space-y-3 pt-1">
                    <div className="text-white text-sm font-normal">
                      {selectedPlanForModal.tagline}
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      {selectedPlanForModal.features.map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs">
                          <div className="size-4 rounded-full border border-green-500 flex items-center justify-center shrink-0">
                            <Check className="size-2.5 text-green-500 stroke-[3]" />
                          </div>
                          <span className="text-neutral-300">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2 Content: Comparison & Proration Notice (Exact Figma) */}
              {changeStep === 2 && (
                <div className="space-y-4">
                  {/* Before vs After Card Row */}
                  <div className="flex items-center justify-between gap-3">
                    {/* Current Plan Card */}
                    <div className="flex-1 p-3.5 bg-neutral-800 rounded-lg border border-neutral-800 flex flex-col gap-1">
                      <span className="text-neutral-500 text-[10px] font-normal uppercase tracking-wider">
                        Current
                      </span>
                      <span className="text-white text-base font-medium">
                        {currentPlan.name} Plan
                      </span>
                      <span className="text-zinc-400 text-xs font-normal">
                        $ {currentPlan.price}/month
                      </span>
                    </div>

                    {/* Arrow Divider */}
                    <div className="p-2 rounded-full bg-neutral-800 text-white shrink-0">
                      <ArrowRight className="size-4" />
                    </div>

                    {/* New Plan Card */}
                    <div className="flex-1 p-3.5 bg-neutral-800 rounded-lg border border-neutral-800 flex flex-col gap-1">
                      <span className="text-neutral-500 text-[10px] font-normal uppercase tracking-wider">
                        New plan
                      </span>
                      <span className="text-white text-base font-medium">
                        {selectedPlanForModal.name} Plan
                      </span>
                      <span className="text-zinc-400 text-xs font-normal">
                        $ {selectedPlanForModal.price}/month
                      </span>
                    </div>
                  </div>

                  {/* Proration Notice Banner (Exact Figma) */}
                  <div className="px-4 py-3 bg-yellow-400/10 rounded-lg border border-yellow-400/20 text-xs text-yellow-400 leading-relaxed">
                    <span className="font-semibold">Your new plan starts today. </span>
                    <span>
                      A prorated amount will be charged now. Your next full payment is due 15 November 2026.
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-neutral-950 border-t border-neutral-800 flex items-center justify-end gap-2.5">
              <button
                onClick={() => {
                  if (changeStep === 2) {
                    setChangeStep(1);
                  } else {
                    setSelectedPlanForModal(null);
                  }
                }}
                className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {changeStep === 2 ? 'Back' : 'Cancel'}
              </button>

              {changeStep === 1 ? (
                <button
                  onClick={() => setChangeStep(2)}
                  className="px-4 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-neutral-800 text-sm font-medium rounded-lg flex items-center gap-1.5 transition-all active:scale-95 shadow-md"
                >
                  <span>Continue</span>
                  <ArrowRight className="size-4 text-neutral-800" />
                </button>
              ) : (
                <button
                  onClick={handleConfirmPlanChange}
                  disabled={isProcessingChange}
                  className="px-4 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-neutral-800 text-sm font-medium rounded-lg flex items-center gap-1.5 transition-all active:scale-95 shadow-md disabled:opacity-50"
                >
                  <span>{isProcessingChange ? 'Updating plan...' : 'Confirm change'}</span>
                  <ArrowRight className="size-4 text-neutral-800" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 7. Modal: Digital Invoice View */}
      {viewInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-amber-400/10 text-amber-400">
                  <FileText className="size-5" />
                </div>
                <div>
                  <h3 className="text-white text-base font-semibold">Official Tax Invoice</h3>
                  <p className="text-xs text-neutral-400">{viewInvoice.id}</p>
                </div>
              </div>
              <button
                onClick={() => setViewInvoice(null)}
                className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="flex justify-between items-start pb-4 border-b border-neutral-800">
                <div>
                  <span className="text-neutral-500 block">Billed to:</span>
                  <strong className="text-white text-sm block">Tavonza Kitchen Ltd.</strong>
                  <span className="text-neutral-400">Robert Geo (Admin)</span>
                </div>
                <div className="text-right">
                  <span className="text-neutral-500 block">Invoice Date:</span>
                  <span className="text-white font-mono">{viewInvoice.date}</span>
                </div>
              </div>

              <div className="space-y-2 py-2 border-b border-neutral-800">
                <div className="flex justify-between text-neutral-400">
                  <span>Subscription Service:</span>
                  <span className="text-white">{viewInvoice.plan}</span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>Payment Method:</span>
                  <span className="text-white">{viewInvoice.paymentMethod}</span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>Subtotal:</span>
                  <span className="text-white font-mono">{viewInvoice.subtotal}</span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>VAT / Sales Tax (5%):</span>
                  <span className="text-white font-mono">{viewInvoice.vat}</span>
                </div>
                <div className="flex justify-between text-white font-bold text-sm pt-2 border-t border-neutral-800">
                  <span>Total Paid:</span>
                  <span className="text-amber-400 font-mono">{viewInvoice.amount}</span>
                </div>
              </div>

              <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-800 text-[11px] text-neutral-400 flex justify-between items-center">
                <span>Payment Status</span>
                <span className="px-2 py-0.5 rounded bg-green-500/10 text-green-500 font-semibold">
                  Paid in full
                </span>
              </div>
            </div>

            <div className="p-4 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between">
              <button
                onClick={() => {
                  toast.success('Downloading official PDF receipt...');
                  window.print();
                }}
                className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-neutral-950 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
              >
                <Printer className="size-3.5 text-neutral-950" />
                <span>Print / Download PDF</span>
              </button>

              <button
                onClick={() => setViewInvoice(null)}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-xs font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
