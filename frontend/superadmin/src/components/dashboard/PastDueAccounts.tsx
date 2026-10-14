'use client';

import React, { useState } from 'react';
import { PastDueAccount } from '@/redux/features/superadminApi';
import { toast } from 'sonner';
import { Mail, AlertCircle, X, Check, ArrowUpRight } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface PastDueAccountsProps {
  accounts: PastDueAccount[];
}

export function PastDueAccounts({ accounts }: PastDueAccountsProps) {
  const [selectedAccount, setSelectedAccount] = useState<PastDueAccount | null>(null);
  const [isSendingReminder, setIsSendingReminder] = useState(false);

  const handleSendReminder = (account: PastDueAccount) => {
    setIsSendingReminder(true);
    setTimeout(() => {
      setIsSendingReminder(false);
      toast.success(`Payment reminder email sent to ${account.name} (${account.email})`);
      setSelectedAccount(null);
    }, 700);
  };

  return (
    <>
      <div className="w-full p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-zinc-800 flex flex-col justify-between">
        {/* Header matching Figma */}
        <div className="flex justify-between items-center w-full pb-2">
          <div className="flex flex-col">
            <h3 className="text-white text-base font-semibold font-inter leading-5">
              Past-due accounts
            </h3>
            <span className="text-neutral-400 text-xs font-normal font-inter leading-4 pt-1">
              Needs attention
            </span>
          </div>

          <div className="px-2 py-1 bg-red-400/10 border border-red-500/20 rounded-md flex items-center justify-center">
            <span className="text-red-400 text-[10px] font-medium font-inter leading-4">
              {accounts.length} open
            </span>
          </div>
        </div>

        {/* List of Accounts */}
        <div className="w-full pt-2 flex flex-col divide-y divide-zinc-800">
          {accounts.map((account) => (
            <div
              key={account.id}
              className="min-h-16 py-3 flex items-center justify-between gap-3 group hover:bg-zinc-800/20 px-1 rounded-lg transition"
            >
              {/* Account info */}
              <div className="flex-1 flex flex-col justify-start items-start gap-1 min-w-0">
                <span className="text-white text-xs font-normal font-inter leading-4 truncate max-w-full">
                  {account.name}
                </span>
                <span className="text-red-400 text-[10px] font-normal font-inter leading-4 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                  {account.daysOverdue} days overdue
                </span>
              </div>

              {/* Amount */}
              <div className="text-white text-xs font-medium font-inter leading-4 px-2">
                ${account.amount}
              </div>

              {/* View Button matching Figma */}
              <button
                onClick={() => setSelectedAccount(account)}
                className="px-3 py-1.5 rounded-lg border border-transparent hover:border-zinc-700 bg-zinc-800/40 hover:bg-zinc-800 text-neutral-400 hover:text-white text-xs font-medium font-inter transition flex items-center gap-1"
              >
                <span>View</span>
                <ArrowUpRight className="w-3 h-3 opacity-60 group-hover:opacity-100" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Account Details & Action Modal */}
      {selectedAccount && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-zinc-800 w-full max-w-md rounded-2xl p-6 shadow-2xl animate-fade-in font-inter">
            <div className="flex items-start justify-between pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-base">{selectedAccount.name}</h4>
                  <p className="text-zinc-400 text-xs">{selectedAccount.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAccount(null)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3">
              <div className="flex justify-between items-center py-2 px-3 bg-zinc-950/60 rounded-lg border border-zinc-800/80">
                <span className="text-xs text-zinc-400">Subscription Tier</span>
                <span className="text-xs font-medium text-amber-400">{selectedAccount.plan} Plan</span>
              </div>
              <div className="flex justify-between items-center py-2 px-3 bg-zinc-950/60 rounded-lg border border-zinc-800/80">
                <span className="text-xs text-zinc-400">Outstanding Balance</span>
                <span className="text-sm font-bold text-red-400">{formatCurrency(selectedAccount.amount)}</span>
              </div>
              <div className="flex justify-between items-center py-2 px-3 bg-zinc-950/60 rounded-lg border border-zinc-800/80">
                <span className="text-xs text-zinc-400">Days Overdue</span>
                <span className="text-xs font-semibold text-red-400">{selectedAccount.daysOverdue} days</span>
              </div>
              <div className="flex justify-between items-center py-2 px-3 bg-zinc-950/60 rounded-lg border border-zinc-800/80">
                <span className="text-xs text-zinc-400">Last Attempted Charge</span>
                <span className="text-xs text-zinc-300">Stripe PaymentIntent Failed (Card Expired)</span>
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-800 flex items-center gap-3">
              <button
                onClick={() => handleSendReminder(selectedAccount)}
                disabled={isSendingReminder}
                className="flex-1 py-2.5 px-4 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                <Mail className="w-4 h-4" />
                <span>{isSendingReminder ? 'Sending Notice...' : 'Send Reminder'}</span>
              </button>
              <button
                onClick={() => {
                  toast.success(`Grace period for ${selectedAccount.name} extended by 7 days.`);
                  setSelectedAccount(null);
                }}
                className="py-2.5 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded-xl transition"
              >
                Extend Grace
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
