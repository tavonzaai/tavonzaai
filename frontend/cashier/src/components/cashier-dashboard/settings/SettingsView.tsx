'use client';

import React, { useState, useEffect } from 'react';
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
import { useAppDispatch, useAppSelector } from '@/redux/store';
import { getMe } from '@/redux/features/authApi';
import { updateMe } from '@/redux/features/userApi';

export const SettingsView: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const [settings, setSettings] = useState<AllCashierSettings>(
    initialCashierSettings
  );
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    dispatch(getMe());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      setSettings((prev) => ({
        ...prev,
        profile: {
          ...prev.profile,
          cashierName: user.name || user.firstName || prev.profile.cashierName,
          email: user.email || (prev.profile as any).email,
          phone: user.contactNo || user.phone || (prev.profile as any).phone || '',
          branch: user.assignments?.[0]?.branch?.name || prev.profile.branch,
        } as any,
      }));
    }
  }, [user]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await dispatch(
        updateMe({
          name: settings.profile.cashierName,
          contactNo: (settings.profile as any).phone || (settings.profile as any).contactNo,
        })
      );
      setIsSaving(false);
      if (updateMe.fulfilled.match(res)) {
        toast.success('Cashier profile and preferences updated successfully!');
      } else {
        toast.error((res.payload as string) || 'Failed to update cashier profile');
      }
    } catch (err: any) {
      setIsSaving(false);
      toast.error(err?.message || 'Failed to update cashier profile');
    }
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
