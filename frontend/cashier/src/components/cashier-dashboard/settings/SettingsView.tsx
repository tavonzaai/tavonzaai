'use client';

import React, { useState } from 'react';
import {
  SettingsHeader,
  ProfileCard,
  PreferencesCard,
  NotificationsCard,
  AIAutomationCard,
  DangerZoneCard,
} from './components';
import { AllCashierSettings } from './types';
import { initialCashierSettings } from './settingsData';
import { toast } from 'sonner';

export const SettingsView: React.FC = () => {
  const [settings, setSettings] = useState<AllCashierSettings>(
    initialCashierSettings
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Cashier preferences and POS configuration saved!');
    }, 300);
  };

  const handleResetSettings = () => {
    setSettings(initialCashierSettings);
  };

  const handleClearData = () => {
    // simulated clear
  };

  return (
    <div className="w-full space-y-6 pb-12">
      {/* 1. Header */}
      <SettingsHeader onSave={handleSave} isSaving={isSaving} />

      {/* 2. 2-Column Responsive Layout Matching Figma Coordinates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        {/* Left Column: Profile & Preferences */}
        <div className="space-y-5">
          <ProfileCard
            profile={settings.profile}
            onChange={(updated) =>
              setSettings((prev) => ({
                ...prev,
                profile: { ...prev.profile, ...updated },
              }))
            }
          />

          <PreferencesCard
            preferences={settings.preferences}
            onChange={(updated) =>
              setSettings((prev) => ({
                ...prev,
                preferences: { ...prev.preferences, ...updated },
              }))
            }
          />
        </div>

        {/* Right Column: Notifications, AI & Automation, Danger Zone */}
        <div className="space-y-5">
          <NotificationsCard
            notifications={settings.notifications}
            onChange={(updated) =>
              setSettings((prev) => ({
                ...prev,
                notifications: { ...prev.notifications, ...updated },
              }))
            }
          />

          <AIAutomationCard
            automation={settings.automation}
            onChange={(updated) =>
              setSettings((prev) => ({
                ...prev,
                automation: { ...prev.automation, ...updated },
              }))
            }
          />

          <DangerZoneCard
            onResetSettings={handleResetSettings}
            onClearData={handleClearData}
          />
        </div>
      </div>
    </div>
  );
};
