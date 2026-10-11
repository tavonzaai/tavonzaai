'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { PlanDefinition, InvoiceItem } from './subscription/types';
import { PLANS, INITIAL_INVOICES } from './subscription/data';
import {
  SubscriptionHeader,
  CurrentPlanCard,
  WorkspaceCapacity,
  PlanPricingCards,
  InvoicesTable,
  ChangeSubscriptionModal,
  InvoiceDetailModal,
} from './subscription/components';

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
      <SubscriptionHeader />

      {/* 2. Current Plan Overview Card */}
      <CurrentPlanCard currentPlan={currentPlan} />

      {/* 3. Workspace Capacity Section */}
      <WorkspaceCapacity currentPlan={currentPlan} />

      {/* 4. Choose A Plan That Fits Section */}
      <PlanPricingCards
        plans={PLANS}
        currentPlanId={currentPlanId}
        currentPlan={currentPlan}
        onOpenPlanModal={handleOpenPlanModal}
      />

      {/* 5. Invoices & Payments Table */}
      <InvoicesTable
        invoices={invoices}
        onViewInvoice={(invoice) => setViewInvoice(invoice)}
      />

      {/* 6. Modal: Subscription Change Flow */}
      {selectedPlanForModal && (
        <ChangeSubscriptionModal
          selectedPlan={selectedPlanForModal}
          currentPlan={currentPlan}
          changeStep={changeStep}
          isProcessingChange={isProcessingChange}
          onClose={() => setSelectedPlanForModal(null)}
          onSetStep={setChangeStep}
          onConfirm={handleConfirmPlanChange}
        />
      )}

      {/* 7. Modal: Digital Invoice View */}
      {viewInvoice && (
        <InvoiceDetailModal
          invoice={viewInvoice}
          onClose={() => setViewInvoice(null)}
        />
      )}
    </div>
  );
}
