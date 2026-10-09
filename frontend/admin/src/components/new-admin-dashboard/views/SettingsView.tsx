'use client';

import React, { useState } from 'react';
import {
  Settings,
  Building,
  Bell,
  Lock,
  Globe,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsView() {
  const [orgName, setOrgName] = useState('Tavonza Group International');
  const [currency, setCurrency] = useState('USD ($)');
  const [timezone, setTimezone] = useState('America/New_York (UTC-5)');
  const [aiEnabled, setAiEnabled] = useState(true);
  const [kdsSound, setKdsSound] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('System settings saved successfully!');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-white text-2xl font-semibold font-sans">
          System & Enterprise Settings
        </h1>
        <p className="text-neutral-400 text-sm font-sans mt-0.5">
          Configure organization profiles, localization, neural agent parameters, and security credentials.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Organization Information */}
        <div className="p-6 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-300/20 space-y-4 shadow-xl">
          <div className="flex items-center gap-2.5 pb-2 border-b border-neutral-800">
            <Building className="size-5 text-amber-400" />
            <h2 className="text-white text-base font-semibold font-sans">
              Organization Profile
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-neutral-300 font-medium font-sans block mb-1">
                Organization Legal Name
              </label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full h-10 px-3 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-400/80 font-sans"
              />
            </div>

            <div>
              <label className="text-xs text-neutral-300 font-medium font-sans block mb-1">
                Operational Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full h-10 px-3 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-400/80 font-sans"
              >
                <option>USD ($)</option>
                <option>EUR (€)</option>
                <option>GBP (£)</option>
                <option>BDT (৳)</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-neutral-300 font-medium font-sans block mb-1">
                Default Timezone
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full h-10 px-3 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-white focus:outline-none focus:border-amber-400/80 font-sans"
              >
                <option>America/New_York (UTC-5)</option>
                <option>Europe/London (UTC+0)</option>
                <option>Asia/Dhaka (UTC+6)</option>
                <option>Asia/Dubai (UTC+4)</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-neutral-300 font-medium font-sans block mb-1">
                Platform Tenant Isolation Key
              </label>
              <input
                type="text"
                disabled
                value="org_live_tav_88a91bc023"
                className="w-full h-10 px-3 bg-neutral-950/60 border border-neutral-800 rounded-lg text-sm text-neutral-400 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Neural AI & Realtime Features */}
        <div className="p-6 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-300/20 space-y-4 shadow-xl">
          <div className="flex items-center gap-2.5 pb-2 border-b border-neutral-800">
            <Bell className="size-5 text-amber-400" />
            <h2 className="text-white text-base font-semibold font-sans">
              Neural AI & Live Mesh
            </h2>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-neutral-950 rounded-lg border border-neutral-800/80">
              <div>
                <span className="text-sm font-medium text-white font-sans block">
                  AI Table Co-Pilot Autonomous Mode
                </span>
                <span className="text-xs text-neutral-400 font-sans">
                  Allow neural agents to suggest wine pairings and table turn estimates.
                </span>
              </div>
              <input
                type="checkbox"
                checked={aiEnabled}
                onChange={(e) => setAiEnabled(e.target.checked)}
                className="size-4 accent-amber-400 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-neutral-950 rounded-lg border border-neutral-800/80">
              <div>
                <span className="text-sm font-medium text-white font-sans block">
                  High-Priority KDS & Bar Audible Bells
                </span>
                <span className="text-xs text-neutral-400 font-sans">
                  Chime audio alerts when expedited tickets exceed 15-minute preparation thresholds.
                </span>
              </div>
              <input
                type="checkbox"
                checked={kdsSound}
                onChange={(e) => setKdsSound(e.target.checked)}
                className="size-4 accent-amber-400 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="h-10 px-6 bg-amber-400 hover:bg-amber-300 text-black font-semibold text-sm rounded-lg inline-flex items-center gap-2 transition-all shadow-md shadow-amber-400/20"
          >
            <Save className="size-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
}
