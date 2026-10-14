'use client';

import React from 'react';
import { SubscriptionHeader } from './subscription/components';

export default function SubscriptionView() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12" data-testid="subscription-placeholder">
      <SubscriptionHeader />
      <section className="p-6 bg-neutral-900 rounded-xl border border-neutral-800 space-y-3">
        <h2 className="text-white text-xl font-semibold">SaaS billing is not provisioned</h2>
        <p className="text-zinc-400 text-sm leading-6 max-w-2xl">
          Organization subscription plans and invoices will come from Super Admin billing once that
          schema exists. This page does not invent invoices, card last-fours, or plan changes.
          Customer order payments continue to use the Payments tab and Stripe PaymentIntents.
        </p>
      </section>
    </div>
  );
}
