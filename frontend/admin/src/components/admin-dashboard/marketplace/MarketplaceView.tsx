'use client';

import React, { useState, useMemo } from 'react';
import {
  MarketplaceHeader,
  MarketplaceHeroBanner,
  MarketplaceCategoryTabs,
  MarketplaceSearchBar,
  MarketplaceGrid,
  InstallAppModal,
  ConfigureAppModal,
} from './components';
import { INITIAL_MARKETPLACE_APPS } from './marketplaceData';
import { MarketplaceApp, MarketplaceCategory } from './types';
import { CheckCircle, Sparkles } from 'lucide-react';

export default function MarketplaceView() {
  const [apps, setApps] = useState<MarketplaceApp[]>(INITIAL_MARKETPLACE_APPS);
  const [selectedCategory, setSelectedCategory] = useState<MarketplaceCategory>('All Tiers');
  const [searchQuery, setSearchQuery] = useState('');
  const [showInstalledOnly, setShowInstalledOnly] = useState(false);

  // Modals
  const [installApp, setInstallApp] = useState<MarketplaceApp | null>(null);
  const [configApp, setConfigApp] = useState<MarketplaceApp | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Installed Count
  const installedCount = useMemo(() => {
    return apps.filter((a) => a.isInstalled).length;
  }, [apps]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      'All Tiers': apps.length,
    };

    apps.forEach((app) => {
      counts[app.category] = (counts[app.category] || 0) + 1;
    });

    return counts;
  }, [apps]);

  // Filtered apps
  const filteredApps = useMemo(() => {
    return apps.filter((app) => {
      const matchesCategory =
        selectedCategory === 'All Tiers' || app.category === selectedCategory;

      const matchesSearch =
        app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.developer.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesInstalled = !showInstalledOnly || app.isInstalled;

      return matchesCategory && matchesSearch && matchesInstalled;
    });
  }, [apps, selectedCategory, searchQuery, showInstalledOnly]);

  // Handlers
  const handleConfirmInstall = (appId: string) => {
    setApps((prev) =>
      prev.map((a) =>
        a.id === appId
          ? {
              ...a,
              isInstalled: true,
              badge: '● On Shift',
              lastSync: 'Just now',
            }
          : a
      )
    );
    const target = apps.find((a) => a.id === appId);
    showToast(`Integration "${target?.name || 'App'}" installed and connected!`);
  };

  const handleUninstall = (appId: string) => {
    setApps((prev) =>
      prev.map((a) =>
        a.id === appId
          ? {
              ...a,
              isInstalled: false,
              badge: undefined,
            }
          : a
      )
    );
    const target = apps.find((a) => a.id === appId);
    showToast(`"${target?.name || 'App'}" has been disconnected.`);
  };

  const handleSaveConfig = (appId: string, updates: Partial<MarketplaceApp>) => {
    setApps((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, ...updates, lastSync: 'Just now' } : a))
    );
    showToast('Integration configuration saved successfully.');
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200 pb-20 relative">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 px-4 py-3 bg-[#18191c] border border-amber-500/50 rounded-xl shadow-2xl text-white text-sm flex items-center gap-2.5 animate-in slide-in-from-top duration-300">
          <CheckCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header (Title, Subtitle, Apps Installed Count Badge) */}
      <MarketplaceHeader installedCount={installedCount} />

      {/* 2. Glassmorphic Hero Banner ("Connect your entire restaurant stack") */}
      <MarketplaceHeroBanner onBrowseAll={() => setSelectedCategory('All Tiers')} />

      {/* 3. Category Tier Tabs */}
      <MarketplaceCategoryTabs
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        categoryCounts={categoryCounts}
      />

      {/* 4. Search Bar & Installed Filter Toggle */}
      <MarketplaceSearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        showInstalledOnly={showInstalledOnly}
        setShowInstalledOnly={setShowInstalledOnly}
        totalApps={apps.length}
      />

      {/* 5. 3-Column Marketplace App Grid */}
      <MarketplaceGrid
        apps={filteredApps}
        onInstall={(app) => setInstallApp(app)}
        onConfigure={(app) => setConfigApp(app)}
        onDelete={(app) => {
          if (app.isInstalled) {
            handleUninstall(app.id);
          } else {
            showToast(`"${app.name}" is not currently installed.`);
          }
        }}
      />

      {/* 6. Install App Modal */}
      <InstallAppModal
        app={installApp}
        isOpen={Boolean(installApp)}
        onClose={() => setInstallApp(null)}
        onConfirmInstall={handleConfirmInstall}
      />

      {/* 7. Configure App Modal */}
      <ConfigureAppModal
        app={configApp}
        isOpen={Boolean(configApp)}
        onClose={() => setConfigApp(null)}
        onUninstall={handleUninstall}
        onSaveConfig={handleSaveConfig}
      />

      {/* Floating Ask Tavonza AI CTA matching Figma */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          type="button"
          onClick={() => showToast('Tavonza AI: Ready to assist with integration setup & workflow automation!')}
          className="h-10 px-4 py-2.5 bg-gradient-to-r from-indigo-500 via-indigo-500 to-violet-500 hover:opacity-95 text-white rounded-[10px] shadow-[0px_4px_6px_-4px_rgba(99,102,241,0.30)] shadow-[0px_10px_15px_-3px_rgba(99,102,241,0.30)] inline-flex items-center gap-2 text-sm sm:text-base font-semibold font-['Inter'] cursor-pointer transition-all duration-150 active:scale-95"
        >
          <Sparkles className="w-4 h-4 text-white" />
          <span>Ask Tavonza AI</span>
        </button>
      </div>
    </div>
  );
}
