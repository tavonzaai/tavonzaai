'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  UserCheck,
  KeyRound,
  Lock,
  Plus,
  CheckCircle,
  AlertTriangle,
  Users,
} from 'lucide-react';
import { MOCK_PERMISSIONS } from '../data';

export default function PermissionsView() {
  const [roles] = useState(MOCK_PERMISSIONS);
  const [activeRole, setActiveRole] = useState(roles[0].id);

  const selectedRole = roles.find((r) => r.id === activeRole) || roles[0];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-white text-2xl font-semibold font-sans">
            Roles & Capability Matrix
          </h1>
          <p className="text-neutral-400 text-sm font-sans mt-0.5">
            Strict capability-based access control engine across organization, restaurant, and branch scopes.
          </p>
        </div>

        <button className="h-10 px-4 bg-amber-400 hover:bg-amber-300 text-black font-semibold text-sm rounded-lg inline-flex items-center gap-2 transition-all shadow-md shadow-amber-400/20">
          <Plus className="size-4 stroke-[3]" />
          <span>New Custom Role</span>
        </button>
      </div>

      {/* Grid: Left Role List, Right Capability Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Role Selector (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <h2 className="text-sm font-semibold text-neutral-300 font-sans uppercase tracking-wider">
            Defined System Roles
          </h2>

          <div className="space-y-2.5">
            {roles.map((role) => {
              const isSelected = activeRole === role.id;
              return (
                <div
                  key={role.id}
                  onClick={() => setActiveRole(role.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-neutral-900 border-amber-400/50 shadow-lg shadow-amber-500/5'
                      : 'bg-neutral-950/60 border-neutral-800 hover:bg-neutral-900 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-white text-sm font-semibold font-sans">
                      {role.title}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${role.badgeColor}`}
                    >
                      {role.usersCount} users
                    </span>
                  </div>

                  <p className="text-xs text-neutral-400 font-sans mt-2 line-clamp-2">
                    {role.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Role Capabilities Inspector (7 cols) */}
        <div className="lg:col-span-7 p-6 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-300/20 flex flex-col gap-6 shadow-xl">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-5 text-amber-400" />
                <h3 className="text-white text-lg font-semibold font-sans">
                  {selectedRole.title}
                </h3>
              </div>
              <p className="text-xs text-neutral-400 font-sans mt-1">
                {selectedRole.description}
              </p>
            </div>

            <span
              className={`text-xs font-semibold px-3 py-1 rounded-full border ${selectedRole.badgeColor}`}
            >
              {selectedRole.usersCount} Active Accounts
            </span>
          </div>

          <div className="h-0 outline outline-1 outline-offset-[-0.5px] outline-neutral-800" />

          {/* Capabilities List */}
          <div>
            <h4 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider font-sans mb-3">
              Assigned Capabilities & Scopes
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {selectedRole.capabilities.map((cap, i) => (
                <div
                  key={i}
                  className="p-3 bg-neutral-950 rounded-lg border border-neutral-800/80 flex items-center gap-2.5 text-xs text-neutral-200 font-sans"
                >
                  <CheckCircle className="size-4 text-emerald-400 shrink-0" />
                  <span>{cap}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Security Notice */}
          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3">
            <Lock className="size-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-neutral-300 font-sans">
              <strong className="text-amber-300 block mb-0.5">
                Backend Authority Enforced
              </strong>
              All capability checks are strictly verified on API requests. Scope elevation requires multi-signature platform owner approval.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
