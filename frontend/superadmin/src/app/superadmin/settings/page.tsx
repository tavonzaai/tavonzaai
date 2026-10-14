'use client';

import React, { useState } from 'react';
import { SuperAdminLayout } from '@/components/layout/SuperAdminLayout';
import { InviteAdminModal, AdminUser } from '@/components/settings/InviteAdminModal';
import { toast } from 'sonner';

interface AuditLogEntry {
  id: string;
  admin: string;
  action: string;
  when: string;
}

const INITIAL_ADMINS: AdminUser[] = [
  {
    id: 'admin-1',
    name: 'Alex Morgan',
    email: 'alex@platform.com',
    role: 'Super Admin',
  },
  {
    id: 'admin-2',
    name: 'Jamie Patel',
    email: 'jamie@platform.com',
    role: 'Support',
  },
];

const INITIAL_AUDIT_LOG: AuditLogEntry[] = [
  {
    id: 'log-1',
    admin: 'Alex Morgan',
    action: 'Changed Growth plan branch limit',
    when: 'Today, 10:42 AM',
  },
  {
    id: 'log-2',
    admin: 'Jamie Patel',
    action: 'Retried payment for Juniper Hospitality',
    when: 'Yesterday, 4:18 PM',
  },
  {
    id: 'log-3',
    admin: 'Alex Morgan',
    action: 'Suspended Mesa Verde Foods',
    when: 'Jun 10, 2:06 PM',
  },
  {
    id: 'log-4',
    admin: 'System',
    action: 'Updated failed payment policy',
    when: 'Jun 8, 9:30 AM',
  },
];

export default function SettingsPage() {
  const [admins, setAdmins] = useState<AdminUser[]>(INITIAL_ADMINS);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [trialDays, setTrialDays] = useState('14');
  const [trialAction, setTrialAction] = useState('Restrict access');
  const [gracePeriod, setGracePeriod] = useState('7');

  const handleSave = () => {
    toast.success('Platform settings successfully updated.');
  };

  const handleExportAudit = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Admin,Action,When']
        .concat(INITIAL_AUDIT_LOG.map((log) => `"${log.admin}","${log.action}","${log.when}"`))
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `platform-audit-log.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Audit log exported successfully.');
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <SuperAdminLayout>
      <div className="flex flex-col gap-7 w-full font-inter animate-fade-in text-white pb-12">
        {/* Header with Save Changes */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-white text-3xl font-semibold leading-9">Settings</h1>
            <p className="text-zinc-500 text-sm font-normal pt-[5px] leading-6">
              Manage platform access and subscription policies.
            </p>
          </div>
          <button
            onClick={handleSave}
            className="min-h-9 px-3.5 py-2 bg-yellow-400 rounded-lg outline outline-1 outline-offset-[-1px] outline-yellow-400 text-neutral-800 text-xs font-medium cursor-pointer hover:bg-yellow-300 transition-colors shadow-sm"
          >
            Save changes
          </button>
        </div>

        {/* 3 Core Settings Cards */}
        <div className="flex flex-col gap-4">
          {/* Card 1: Platform Admins */}
          <div className="p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-zinc-800 flex flex-col justify-start items-start">
            <div className="w-full flex justify-between items-center pb-3">
              <div>
                <h2 className="text-white text-base font-semibold leading-5">Platform admins</h2>
                <p className="text-neutral-400 text-xs font-normal pt-1 leading-4">
                  Internal staff with access to this panel.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsInviteOpen(true)}
                className="min-h-9 px-3 py-2 bg-zinc-800 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 text-neutral-200 text-xs font-medium cursor-pointer hover:bg-zinc-700 transition"
              >
                + Invite admin
              </button>
            </div>

            {/* Admins List */}
            <div className="w-full divide-y divide-zinc-800 pt-1">
              {admins.map((adm) => (
                <div
                  key={adm.id}
                  className="min-h-14 py-3 border-t border-zinc-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-8 bg-amber-400 rounded-2xl flex justify-center items-center text-zinc-800 text-xs font-semibold">
                      {getInitials(adm.name)}
                    </div>
                    <div>
                      <div className="text-white text-sm font-normal leading-5">{adm.name}</div>
                      <div className="text-neutral-400 text-[10px] font-normal leading-4">
                        {adm.email}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="px-2 py-1 bg-neutral-400/10 rounded-md flex justify-center items-center">
                      <span className="text-neutral-400 text-[10px] font-medium leading-4">
                        {adm.status || adm.role}
                      </span>
                    </div>
                    <button
                      onClick={() => toast.info(`Viewing privileges for ${adm.name}`)}
                      className="text-yellow-400 text-xs font-normal cursor-pointer hover:underline transition"
                    >
                      Manage
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: Trial Settings */}
          <div className="p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-zinc-800 flex flex-col justify-start items-start gap-4">
            <h2 className="text-white text-base font-semibold leading-5">Trial settings</h2>

            {/* Trial length */}
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-neutral-400 text-xs font-normal leading-4">
                Trial length (days)
              </label>
              <div className="w-80">
                <input
                  type="number"
                  value={trialDays}
                  onChange={(e) => setTrialDays(e.target.value)}
                  className="w-full h-10 px-3 bg-neutral-950 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 text-stone-300 text-xs focus:outline-yellow-400 transition"
                />
              </div>
            </div>

            {/* When a trial ends */}
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-neutral-400 text-xs font-normal leading-4">
                When a trial ends
              </label>
              <div className="w-80 relative">
                <select
                  value={trialAction}
                  onChange={(e) => setTrialAction(e.target.value)}
                  className="w-full h-10 px-3 pr-8 bg-neutral-950 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 text-stone-300 text-xs focus:outline-yellow-400 transition appearance-none cursor-pointer"
                >
                  <option value="Restrict access">Restrict access</option>
                  <option value="Downgrade to Free tier">Downgrade to Free tier</option>
                  <option value="Suspend account">Suspend account</option>
                </select>
                <div className="absolute right-3 top-3 pointer-events-none text-stone-400">
                  <svg className="w-3.5 h-3.5 stroke-current" viewBox="0 0 14 14" fill="none">
                    <path d="M3.5 5.5L7 9L10.5 5.5" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Failed Payment Policy */}
          <div className="p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-zinc-800 flex flex-col justify-start items-start gap-4">
            <div>
              <h2 className="text-white text-base font-semibold leading-5">Failed payment policy</h2>
              <p className="text-neutral-400 text-xs font-normal pt-1 leading-4">
                Set the grace period before an account is automatically suspended.
              </p>
            </div>

            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-neutral-400 text-xs font-normal leading-4">
                Grace period (days)
              </label>
              <div className="w-80">
                <input
                  type="number"
                  value={gracePeriod}
                  onChange={(e) => setGracePeriod(e.target.value)}
                  className="w-full h-10 px-3 bg-neutral-950 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 text-stone-300 text-xs focus:outline-yellow-400 transition"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Audit Log */}
        <div className="p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-zinc-800 flex flex-col justify-start items-start">
          <div className="w-full flex justify-between items-center pb-4">
            <div>
              <h2 className="text-white text-base font-semibold leading-5">Audit log</h2>
              <p className="text-neutral-400 text-xs font-normal pt-1 leading-4">
                Recent actions taken by platform administrators.
              </p>
            </div>
            <button
              onClick={handleExportAudit}
              className="px-3 py-2 bg-zinc-800 rounded-md outline outline-1 outline-offset-[-1px] outline-neutral-700 text-white text-xs font-medium cursor-pointer hover:bg-zinc-700 transition"
            >
              Export
            </button>
          </div>

          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-900 border-b border-zinc-800">
                  <th className="px-3.5 py-3 text-zinc-400 text-xs font-semibold w-1/4">Admin</th>
                  <th className="px-3.5 py-3 text-zinc-400 text-xs font-semibold w-1/2">Action</th>
                  <th className="px-3.5 py-3 text-zinc-400 text-xs font-semibold w-1/4">When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {INITIAL_AUDIT_LOG.map((entry) => (
                  <tr key={entry.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-3.5 py-3.5 text-zinc-100 text-xs font-medium">
                      {entry.admin}
                    </td>
                    <td className="px-3.5 py-3.5 text-zinc-300 text-xs font-normal">
                      {entry.action}
                    </td>
                    <td className="px-3.5 py-3.5 text-zinc-300 text-xs font-normal">
                      {entry.when}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Invite Admin Modal */}
        <InviteAdminModal
          isOpen={isInviteOpen}
          onClose={() => setIsInviteOpen(false)}
          onInviteSuccess={(newAdmin) => {
            setAdmins((prev) => [...prev, newAdmin]);
          }}
        />
      </div>
    </SuperAdminLayout>
  );
}
