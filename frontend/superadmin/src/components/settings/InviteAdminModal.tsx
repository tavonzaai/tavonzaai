'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'Super Admin' | 'Support' | 'Billing Admin';
  status?: string;
}

interface InviteAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInviteSuccess: (newAdmin: AdminUser) => void;
}

export function InviteAdminModal({
  isOpen,
  onClose,
  onInviteSuccess,
}: InviteAdminModalProps) {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'Support' | 'Super Admin' | 'Billing Admin'>('Support');

  if (!isOpen) return null;

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      toast.error('Please enter a full name and work email.');
      return;
    }

    // Move to success step
    setStep('success');
  };

  const handleFinish = () => {
    onInviteSuccess({
      id: `admin-${Date.now()}`,
      name: fullName.trim(),
      email: email.trim(),
      role,
      status: 'Support · Invited',
    });
    toast.success(`Invitation successfully sent to ${email}`);
    // Reset state
    setFullName('');
    setEmail('');
    setRole('Support');
    setStep('form');
    onClose();
  };

  const getRoleDescription = () => {
    switch (role) {
      case 'Support':
        return 'Can view tenants and billing, assist accounts, and retry payments. Cannot change plans or policies.';
      case 'Super Admin':
        return 'Full access to all platform settings, tenants, billing, and admin management.';
      case 'Billing Admin':
        return 'Can manage plans, refund transactions, retry payments, and export financial data.';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-[5px] flex justify-center items-center p-4">
      <div className="w-full max-w-[560px] bg-neutral-900 rounded-xl shadow-[0px_0px_20px_0px_rgba(255,255,255,0.05),0px_24px_80px_0px_rgba(0,0,0,0.70)] outline outline-1 outline-offset-[-1px] outline-neutral-700 flex flex-col justify-start items-start overflow-hidden animate-fade-in font-inter">
        {step === 'form' ? (
          <>
            {/* Header */}
            <div className="w-full min-h-20 px-5 py-4 border-b border-zinc-800 flex justify-between items-center">
              <div>
                <h2 className="text-white text-lg font-semibold leading-5">Invite platform admin</h2>
                <p className="text-neutral-400 text-xs font-normal pt-1 leading-4">
                  Invite internal staff and choose their access level.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="size-9 bg-gray-300/10 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 flex justify-center items-center text-gray-200 hover:text-white cursor-pointer transition-colors"
              >
                <svg className="w-4 h-4 stroke-current" viewBox="0 0 16 16" fill="none">
                  <path d="M4 12L12 4M4 4L12 12" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSendInvite} className="w-full flex flex-col">
              <div className="px-5 py-5 flex flex-col gap-4">
                {/* Full name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-neutral-400 text-xs font-normal leading-4">
                    Full name
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Jordan Lee"
                    className="w-full h-10 px-3 bg-neutral-950 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 text-white placeholder:text-stone-300/50 text-xs focus:outline-yellow-400 transition"
                  />
                </div>

                {/* Work email */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-neutral-400 text-xs font-normal leading-4">
                    Work email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jordan@platform.com"
                    className="w-full h-10 px-3 bg-neutral-950 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 text-white placeholder:text-stone-300/50 text-xs focus:outline-yellow-400 transition"
                  />
                </div>

                {/* Role */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-neutral-400 text-xs font-normal leading-4">
                    Role
                  </label>
                  <div className="relative">
                    <select
                      value={role}
                      onChange={(e) =>
                        setRole(e.target.value as 'Support' | 'Super Admin' | 'Billing Admin')
                      }
                      className="w-full h-10 px-3 pr-8 bg-neutral-950 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 text-stone-300 text-xs focus:outline-yellow-400 transition appearance-none cursor-pointer"
                    >
                      <option value="Support">Support</option>
                      <option value="Super Admin">Super Admin</option>
                      <option value="Billing Admin">Billing Admin</option>
                    </select>
                    <div className="absolute right-3 top-3 pointer-events-none text-stone-400">
                      <svg className="w-3.5 h-3.5 stroke-current" viewBox="0 0 14 14" fill="none">
                        <path d="M3.5 5.5L7 9L10.5 5.5" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Role Callout Card */}
                <div className="p-3 bg-yellow-400/5 rounded-r-md border-l-2 border-yellow-400 flex flex-col gap-1">
                  <div className="text-yellow-400 text-xs font-normal leading-4">
                    {role}
                  </div>
                  <div className="text-neutral-400 text-xs font-normal leading-4">
                    {getRoleDescription()}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="w-full h-16 px-5 py-3.5 bg-stone-950 border-t border-zinc-800 flex justify-end items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="min-h-9 px-3 py-2 bg-zinc-800 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 text-neutral-200 text-xs font-medium cursor-pointer hover:bg-zinc-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="min-h-9 px-3 py-2 bg-yellow-400 rounded-lg outline outline-1 outline-offset-[-1px] outline-yellow-400 text-neutral-800 text-xs font-medium cursor-pointer hover:bg-yellow-300 transition"
                >
                  Send invitation
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            {/* Step 2: Success Screen */}
            <div className="w-full min-h-20 px-5 py-4 border-b border-zinc-800 flex justify-between items-center">
              <div>
                <h2 className="text-white text-lg font-semibold leading-5">Invitation sent</h2>
                <p className="text-neutral-400 text-xs font-normal pt-1 leading-4">
                  They can join the platform admin team now.
                </p>
              </div>
              <button
                type="button"
                onClick={handleFinish}
                className="size-9 bg-gray-300/10 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 flex justify-center items-center text-gray-200 hover:text-white cursor-pointer transition-colors"
              >
                <svg className="w-4 h-4 stroke-current" viewBox="0 0 16 16" fill="none">
                  <path d="M4 12L12 4M4 4L12 12" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="w-full py-8 px-5 flex flex-col justify-center items-center text-center">
              <div className="pb-4">
                <div className="size-12 bg-green-500/10 rounded-full flex justify-center items-center text-green-500 text-2xl font-normal">
                  ✓
                </div>
              </div>
              <div className="text-white text-lg font-semibold leading-5">
                Invite sent to {fullName}
              </div>
              <div className="pt-2 max-w-sm text-neutral-400 text-xs font-normal leading-5">
                {email} will receive a secure link to join as {role}. The invitation expires in 7 days.
              </div>
            </div>

            <div className="w-full h-16 px-5 py-3.5 bg-stone-950 border-t border-zinc-800 flex justify-end items-center gap-2">
              <button
                type="button"
                onClick={handleFinish}
                className="min-h-9 px-3 py-2 bg-yellow-400 rounded-lg outline outline-1 outline-offset-[-1px] outline-yellow-400 text-neutral-800 text-xs font-medium cursor-pointer hover:bg-yellow-300 transition"
              >
                Done
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
