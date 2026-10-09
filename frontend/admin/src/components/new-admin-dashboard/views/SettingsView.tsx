'use client';

import React, { useState } from 'react';
import {
  Building2,
  Mail,
  Phone,
  Globe,
  DollarSign,
  ChevronDown,
  Bell,
  Shield,
  Key,
  Check,
  CheckCircle2,
  Save,
  RotateCcw,
} from 'lucide-react';
import { toast } from 'sonner';

interface OrganizationSettings {
  orgName: string;
  contactEmail: string;
  contactPhone: string;
  countryCurrency: string;
  timezone: string;
  address: string;
  dailyDigest: boolean;
  orderSoundAlerts: boolean;
  lowStockAlerts: boolean;
  twoFactorAuth: boolean;
}

const DEFAULT_SETTINGS: OrganizationSettings = {
  orgName: 'Tavonza Group',
  contactEmail: 'owner@tavonza.com',
  contactPhone: '+1 (555) 234-5678',
  countryCurrency: 'USD ($)',
  timezone: 'America/New_York (UTC-5)',
  address: '742 Evergreen Terrace, Atlanta, GA',
  dailyDigest: true,
  orderSoundAlerts: true,
  lowStockAlerts: true,
  twoFactorAuth: true,
};

export default function SettingsView() {
  const [settings, setSettings] = useState<OrganizationSettings>(DEFAULT_SETTINGS);
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'notifications' | 'security'>('profile');
  const [isSaving, setIsSaving] = useState(false);

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    toast.info('Form reverted to saved settings.');
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);

    setTimeout(() => {
      setIsSaving(false);
      toast.success('Organization settings updated successfully!');
    }, 400);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* 1. Header Section (Exact Figma) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-3">
            <h1 className="text-white text-3xl font-semibold font-sans leading-9">
              Settings
            </h1>
          </div>
          <p className="text-zinc-500 text-sm font-normal font-sans leading-6">
            Organization details, notifications, and account preferences.
          </p>
        </div>

        {/* Sub-tab Pills navigation */}
        <div className="flex items-center gap-2 p-1 bg-neutral-900 border border-neutral-800 rounded-lg">
          <button
            onClick={() => setActiveSubTab('profile')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium font-sans transition-all ${
              activeSubTab === 'profile'
                ? 'bg-zinc-800 text-white'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Organization Profile
          </button>
          <button
            onClick={() => setActiveSubTab('notifications')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium font-sans transition-all ${
              activeSubTab === 'notifications'
                ? 'bg-zinc-800 text-white'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Notifications
          </button>
          <button
            onClick={() => setActiveSubTab('security')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium font-sans transition-all ${
              activeSubTab === 'security'
                ? 'bg-zinc-800 text-white'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Security &amp; Tenant
          </button>
        </div>
      </div>

      {/* 2. Organization Profile Card (Exact Figma Markup & Layout) */}
      {activeSubTab === 'profile' && (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="p-6 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-800 flex flex-col justify-start items-end gap-5 shadow-xl">
            {/* Card Header */}
            <div className="w-full pb-2 flex flex-col justify-start items-start gap-1">
              <div className="text-zinc-100 text-xl font-normal font-sans leading-6">
                Organization Profile
              </div>
              <div className="text-neutral-400 text-sm font-normal font-sans leading-4">
                Public and contact information
              </div>
            </div>

            <div className="w-full h-0 outline outline-1 outline-offset-[-0.50px] outline-neutral-800" />

            {/* Row 1: Organization Name & Contact Email */}
            <div className="w-full flex flex-col justify-start items-start">
              <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Organization Name Field */}
                <div className="flex flex-col justify-start items-start gap-2">
                  <label className="text-gray-200 text-sm font-normal font-sans leading-4">
                    Organization Name
                  </label>
                  <div className="w-full h-11 px-3 bg-black rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-600/20 flex items-center transition-colors focus-within:outline-amber-400/80">
                    <input
                      type="text"
                      value={settings.orgName}
                      onChange={(e) =>
                        setSettings((prev) => ({ ...prev, orgName: e.target.value }))
                      }
                      className="w-full bg-transparent text-zinc-100 text-sm font-normal font-sans leading-4 focus:outline-none placeholder-zinc-600"
                      placeholder="e.g. Tavonza Group"
                    />
                  </div>
                </div>

                {/* Contact Email Field */}
                <div className="flex flex-col justify-start items-start gap-2">
                  <label className="text-gray-200 text-sm font-normal font-sans leading-4">
                    Contact Email
                  </label>
                  <div className="w-full h-11 px-3 bg-black rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-600/20 flex items-center transition-colors focus-within:outline-amber-400/80">
                    <input
                      type="email"
                      value={settings.contactEmail}
                      onChange={(e) =>
                        setSettings((prev) => ({ ...prev, contactEmail: e.target.value }))
                      }
                      className="w-full bg-transparent text-zinc-100 text-sm font-normal font-sans leading-4 focus:outline-none placeholder-zinc-600"
                      placeholder="owner@tavonza.com"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Row 2: Contact Phone & Country & Currency */}
            <div className="w-full flex flex-col justify-start items-start">
              <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Contact Phone Field */}
                <div className="flex flex-col justify-start items-start gap-2">
                  <label className="text-gray-200 text-sm font-normal font-sans leading-4">
                    Contact Phone
                  </label>
                  <div className="w-full h-11 px-3 bg-black rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-600/20 flex items-center transition-colors focus-within:outline-amber-400/80">
                    <input
                      type="text"
                      value={settings.contactPhone}
                      onChange={(e) =>
                        setSettings((prev) => ({ ...prev, contactPhone: e.target.value }))
                      }
                      className="w-full bg-transparent text-zinc-100 text-sm font-normal font-sans leading-4 focus:outline-none placeholder-zinc-600"
                      placeholder="+1 (555) 234-5678"
                    />
                  </div>
                </div>

                {/* Country & Currency Dropdown */}
                <div className="flex flex-col justify-start items-start gap-2">
                  <label className="text-gray-200 text-sm font-normal font-sans leading-4">
                    Country &amp; Currency
                  </label>
                  <div className="w-full h-11 px-3 bg-black rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-600/20 relative flex items-center transition-colors focus-within:outline-amber-400/80">
                    <select
                      value={settings.countryCurrency}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          countryCurrency: e.target.value,
                        }))
                      }
                      className="w-full bg-transparent text-zinc-100 text-sm font-normal font-sans leading-4 appearance-none focus:outline-none cursor-pointer"
                    >
                      <option value="USD ($)" className="bg-neutral-900 text-white">
                        USD ($) - United States Dollar
                      </option>
                      <option value="EUR (€)" className="bg-neutral-900 text-white">
                        EUR (€) - Euro
                      </option>
                      <option value="GBP (£)" className="bg-neutral-900 text-white">
                        GBP (£) - British Pound
                      </option>
                      <option value="BDT (৳)" className="bg-neutral-900 text-white">
                        BDT (৳) - Bangladeshi Taka
                      </option>
                      <option value="CAD ($)" className="bg-neutral-900 text-white">
                        CAD ($) - Canadian Dollar
                      </option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-stone-300 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Row 3: Operating Timezone & Physical Address */}
            <div className="w-full flex flex-col justify-start items-start">
              <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col justify-start items-start gap-2">
                  <label className="text-gray-200 text-sm font-normal font-sans leading-4">
                    Default Timezone
                  </label>
                  <div className="w-full h-11 px-3 bg-black rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-600/20 relative flex items-center">
                    <select
                      value={settings.timezone}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          timezone: e.target.value,
                        }))
                      }
                      className="w-full bg-transparent text-zinc-100 text-sm font-normal font-sans leading-4 appearance-none focus:outline-none cursor-pointer"
                    >
                      <option value="America/New_York (UTC-5)" className="bg-neutral-900 text-white">
                        America/New_York (UTC-5)
                      </option>
                      <option value="Europe/London (UTC+0)" className="bg-neutral-900 text-white">
                        Europe/London (UTC+0)
                      </option>
                      <option value="Asia/Dhaka (UTC+6)" className="bg-neutral-900 text-white">
                        Asia/Dhaka (UTC+6)
                      </option>
                      <option value="Asia/Dubai (UTC+4)" className="bg-neutral-900 text-white">
                        Asia/Dubai (UTC+4)
                      </option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-stone-300 pointer-events-none" />
                  </div>
                </div>

                <div className="flex flex-col justify-start items-start gap-2">
                  <label className="text-gray-200 text-sm font-normal font-sans leading-4">
                    Headquarters Address
                  </label>
                  <div className="w-full h-11 px-3 bg-black rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-600/20 flex items-center">
                    <input
                      type="text"
                      value={settings.address}
                      onChange={(e) =>
                        setSettings((prev) => ({ ...prev, address: e.target.value }))
                      }
                      className="w-full bg-transparent text-zinc-100 text-sm font-normal font-sans leading-4 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons (Exact Figma Styling) */}
            <div className="flex justify-end items-center gap-2 pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white text-base font-medium font-sans rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-neutral-800 text-base font-semibold font-sans rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 transition-all shadow-md active:scale-95 disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* 3. Notifications Tab */}
      {activeSubTab === 'notifications' && (
        <div className="p-6 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-800 space-y-5 shadow-xl">
          <div className="pb-2 border-b border-neutral-800 flex flex-col gap-1">
            <h2 className="text-zinc-100 text-xl font-normal font-sans leading-6">
              Notifications &amp; Alerts
            </h2>
            <p className="text-neutral-400 text-sm font-normal font-sans leading-4">
              Realtime kitchen and management alerts.
            </p>
          </div>

          <div className="space-y-3">
            <div className="p-4 bg-black rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-600/20 flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-white block">
                  Daily Settlement Digest
                </span>
                <span className="text-xs text-neutral-400">
                  Receive an automated revenue and payout summary email every midnight.
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.dailyDigest}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, dailyDigest: e.target.checked }))
                }
                className="size-4 accent-amber-400 cursor-pointer"
              />
            </div>

            <div className="p-4 bg-black rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-600/20 flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-white block">
                  Kitchen Audible Chimes
                </span>
                <span className="text-xs text-neutral-400">
                  Play audible alert when ticket preparation time exceeds 15 minutes.
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.orderSoundAlerts}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, orderSoundAlerts: e.target.checked }))
                }
                className="size-4 accent-amber-400 cursor-pointer"
              />
            </div>

            <div className="p-4 bg-black rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-600/20 flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-white block">
                  Low Inventory Alerts
                </span>
                <span className="text-xs text-neutral-400">
                  Notify store manager immediately when key ingredients reach minimum reorder levels.
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.lowStockAlerts}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, lowStockAlerts: e.target.checked }))
                }
                className="size-4 accent-amber-400 cursor-pointer"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => handleSave()}
              className="px-5 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-neutral-800 text-base font-semibold font-sans rounded-lg transition-all"
            >
              Save Notification Preferences
            </button>
          </div>
        </div>
      )}

      {/* 4. Security & Tenant Tab */}
      {activeSubTab === 'security' && (
        <div className="p-6 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-800 space-y-5 shadow-xl">
          <div className="pb-2 border-b border-neutral-800 flex flex-col gap-1">
            <h2 className="text-zinc-100 text-xl font-normal font-sans leading-6">
              Security &amp; Tenant Credentials
            </h2>
            <p className="text-neutral-400 text-sm font-normal font-sans leading-4">
              Multi-factor authentication and backend tenant isolation keys.
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-black rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-600/20 flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-white block">
                  Two-Factor Authentication (2FA)
                </span>
                <span className="text-xs text-neutral-400">
                  Require 6-digit TOTP authenticator code for all Admin and Manager roles.
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.twoFactorAuth}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, twoFactorAuth: e.target.checked }))
                }
                className="size-4 accent-amber-400 cursor-pointer"
              />
            </div>

            <div className="p-4 bg-black rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-600/20 space-y-1">
              <span className="text-xs text-neutral-400 block font-mono">
                Platform Tenant Isolation Key
              </span>
              <div className="flex items-center justify-between">
                <code className="text-sm text-amber-300 font-mono">
                  org_live_tav_88a91bc023
                </code>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText('org_live_tav_88a91bc023');
                    toast.success('Tenant key copied to clipboard!');
                  }}
                  className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-300 transition-colors"
                >
                  Copy Key
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => handleSave()}
              className="px-5 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-neutral-800 text-base font-semibold font-sans rounded-lg transition-all"
            >
              Save Security Policy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
