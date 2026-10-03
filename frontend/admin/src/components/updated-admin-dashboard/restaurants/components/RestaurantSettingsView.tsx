'use client';

import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronDown,
  CreditCard,
  Smartphone,
  MessageCircle,
  BarChart3,
  Bike,
  Check,
} from 'lucide-react';
import { RestaurantBranch } from '../types';

interface RestaurantSettingsViewProps {
  restaurant: RestaurantBranch;
  onBack: () => void;
  onSave?: (updated: RestaurantBranch) => void;
  onDeleteRestaurant?: (id: string) => void;
}

type SettingsTab = 'general' | 'notifications' | 'integrations' | 'permissions' | 'danger';

export default function RestaurantSettingsView({
  restaurant,
  onBack,
  onSave,
  onDeleteRestaurant,
}: RestaurantSettingsViewProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');

  // General tab state
  const [restaurantName, setRestaurantName] = useState(restaurant.name || 'Tavonza Downtown');
  const [restaurantCode, setRestaurantCode] = useState(
    restaurant.codeId || restaurant.settings?.restaurantCode || 'REST-0001'
  );
  const [timezone, setTimezone] = useState(
    restaurant.settings?.timezone || 'Asia/Dhaka (UTC+6)'
  );
  const [currency, setCurrency] = useState(
    restaurant.settings?.currency || 'BDT — Bangladeshi Taka'
  );
  const [language, setLanguage] = useState(restaurant.settings?.language || 'English');
  const [autoAcceptOrders, setAutoAcceptOrders] = useState(
    restaurant.settings?.autoAcceptOrders ?? false
  );
  const [qrOrderingEnabled, setQrOrderingEnabled] = useState(
    restaurant.settings?.qrOrderingEnabled ?? true
  );

  // Notifications tab state
  const [notifNewOrders, setNotifNewOrders] = useState(
    restaurant.settings?.notifications?.newOrders ?? true
  );
  const [notifStaffActivity, setNotifStaffActivity] = useState(
    restaurant.settings?.notifications?.staffActivity ?? true
  );
  const [notifDailyReports, setNotifDailyReports] = useState(
    restaurant.settings?.notifications?.dailyReports ?? true
  );
  const [notifCustomerReviews, setNotifCustomerReviews] = useState(
    restaurant.settings?.notifications?.customerReviews ?? false
  );

  // Integrations tab state
  const [paymentConnected, setPaymentConnected] = useState(
    restaurant.settings?.integrations?.paymentGateway ?? true
  );
  const [smsConnected, setSmsConnected] = useState(
    restaurant.settings?.integrations?.smsService ?? true
  );
  const [whatsAppConnected, setWhatsAppConnected] = useState(
    restaurant.settings?.integrations?.whatsAppBusiness ?? false
  );
  const [analyticsConnected, setAnalyticsConnected] = useState(
    restaurant.settings?.integrations?.googleAnalytics ?? false
  );
  const [deliveryConnected, setDeliveryConnected] = useState(
    restaurant.settings?.integrations?.deliveryPartner ?? true
  );

  // Feedback toast state
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const showFeedback = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  const handleSaveSettings = () => {
    const updated: RestaurantBranch = {
      ...restaurant,
      name: restaurantName.trim() || restaurant.name,
      codeId: restaurantCode.trim(),
      settings: {
        restaurantCode: restaurantCode.trim(),
        timezone,
        currency,
        language,
        autoAcceptOrders,
        qrOrderingEnabled,
        notifications: {
          newOrders: notifNewOrders,
          staffActivity: notifStaffActivity,
          dailyReports: notifDailyReports,
          customerReviews: notifCustomerReviews,
        },
        integrations: {
          paymentGateway: paymentConnected,
          smsService: smsConnected,
          whatsAppBusiness: whatsAppConnected,
          googleAnalytics: analyticsConnected,
          deliveryPartner: deliveryConnected,
        },
      },
    };

    onSave?.(updated);
    showFeedback('Settings saved successfully!');
  };

  return (
    <div className="w-full min-h-[calc(100vh-6rem)] bg-black text-zinc-100 rounded-3xl p-4 sm:p-8 border border-zinc-800 shadow-2xl animate-in fade-in duration-200">
      {/* Toast feedback */}
      {feedbackMessage && (
        <div className="fixed top-24 right-8 z-50 bg-zinc-900 border border-amber-500/40 text-amber-300 px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-in slide-in-from-top duration-200">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex items-center gap-3.5 mb-6">
        <button
          type="button"
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 flex items-center justify-center text-zinc-300 hover:text-white transition-colors shadow-sm cursor-pointer shrink-0"
          title="Back to Restaurants"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-serif text-white tracking-tight leading-tight">
            Restaurant Settings
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">{restaurantName}</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-6 sm:gap-8 border-b border-zinc-800 mb-8 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab('general')}
          className={`pb-3 text-xs font-semibold transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
            activeTab === 'general'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          General
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('notifications')}
          className={`pb-3 text-xs font-semibold transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
            activeTab === 'notifications'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          Notifications
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('integrations')}
          className={`pb-3 text-xs font-semibold transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
            activeTab === 'integrations'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          Integrations
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('permissions')}
          className={`pb-3 text-xs font-semibold transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
            activeTab === 'permissions'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          Permissions
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('danger')}
          className={`pb-3 text-xs font-semibold transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
            activeTab === 'danger'
              ? 'border-rose-500 text-rose-400'
              : 'border-transparent text-zinc-400 hover:text-rose-400'
          }`}
        >
          Danger Zone
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: GENERAL */}
      {/* ========================================================================= */}
      {activeTab === 'general' && (
        <div className="space-y-6 max-w-xl mx-auto animate-in fade-in duration-200">
          {/* Identity Card */}
          <div className="bg-zinc-900/90 rounded-2xl border border-zinc-800 p-6 space-y-4 shadow-md">
            <h2 className="text-sm font-bold text-white">Identity</h2>

            {/* Restaurant Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">Restaurant Name</label>
              <input
                type="text"
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
                className="w-full h-10 px-3.5 bg-zinc-800/80 border border-zinc-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>

            {/* Restaurant Code */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">Restaurant Code</label>
              <input
                type="text"
                value={restaurantCode}
                onChange={(e) => setRestaurantCode(e.target.value)}
                className="w-full h-10 px-3.5 bg-zinc-800/80 border border-zinc-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>

            {/* Timezone */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">Timezone</label>
              <div className="relative">
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full h-10 pl-3.5 pr-8 bg-zinc-800/80 border border-zinc-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 transition-colors appearance-none cursor-pointer"
                >
                  <option value="Asia/Dhaka (UTC+6)" className="bg-zinc-900 text-white">Asia/Dhaka (UTC+6)</option>
                  <option value="Europe/Amsterdam (UTC+1)" className="bg-zinc-900 text-white">Europe/Amsterdam (UTC+1)</option>
                  <option value="America/New_York (UTC-5)" className="bg-zinc-900 text-white">America/New_York (UTC-5)</option>
                  <option value="Europe/London (UTC+0)" className="bg-zinc-900 text-white">Europe/London (UTC+0)</option>
                  <option value="Asia/Dubai (UTC+4)" className="bg-zinc-900 text-white">Asia/Dubai (UTC+4)</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Currency */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">Currency</label>
              <div className="relative">
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full h-10 pl-3.5 pr-8 bg-zinc-800/80 border border-zinc-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 transition-colors appearance-none cursor-pointer"
                >
                  <option value="BDT — Bangladeshi Taka" className="bg-zinc-900 text-white">BDT — Bangladeshi Taka</option>
                  <option value="USD — US Dollar" className="bg-zinc-900 text-white">USD — US Dollar</option>
                  <option value="EUR — Euro" className="bg-zinc-900 text-white">EUR — Euro</option>
                  <option value="GBP — British Pound" className="bg-zinc-900 text-white">GBP — British Pound</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Language */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">Language</label>
              <div className="relative">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full h-10 pl-3.5 pr-8 bg-zinc-800/80 border border-zinc-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 transition-colors appearance-none cursor-pointer"
                >
                  <option value="English" className="bg-zinc-900 text-white">English</option>
                  <option value="Bengali" className="bg-zinc-900 text-white">Bengali</option>
                  <option value="Dutch" className="bg-zinc-900 text-white">Dutch</option>
                  <option value="French" className="bg-zinc-900 text-white">French</option>
                  <option value="Spanish" className="bg-zinc-900 text-white">Spanish</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Order Preferences Card */}
          <div className="bg-zinc-900/90 rounded-2xl border border-zinc-800 p-6 space-y-5 shadow-md">
            <h2 className="text-sm font-bold text-white">Order Preferences</h2>

            {/* Auto-accept orders */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-xs font-semibold text-zinc-200">Auto-accept orders</div>
                <div className="text-[11px] text-zinc-400 mt-0.5">
                  Automatically confirm incoming orders without manual review
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAutoAcceptOrders(!autoAcceptOrders)}
                className={`w-11 h-6 rounded-full transition-colors cursor-pointer relative shrink-0 p-0.5 ${
                  autoAcceptOrders ? 'bg-amber-400' : 'bg-zinc-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform shadow-sm ${
                    autoAcceptOrders ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* QR ordering enabled */}
            <div className="flex items-center justify-between gap-4 pt-3 border-t border-zinc-800">
              <div>
                <div className="text-xs font-semibold text-zinc-200">QR ordering enabled</div>
                <div className="text-[11px] text-zinc-400 mt-0.5">
                  Allow customers to scan QR codes to place orders
                </div>
              </div>
              <button
                type="button"
                onClick={() => setQrOrderingEnabled(!qrOrderingEnabled)}
                className={`w-11 h-6 rounded-full transition-colors cursor-pointer relative shrink-0 p-0.5 ${
                  qrOrderingEnabled ? 'bg-amber-400' : 'bg-zinc-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform shadow-sm ${
                    qrOrderingEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Save Settings Button */}
          <button
            type="button"
            onClick={handleSaveSettings}
            className="w-full h-11 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black font-bold text-xs rounded-xl transition-all shadow-lg shadow-amber-500/15 active:scale-[0.99] cursor-pointer"
          >
            Save Settings
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: NOTIFICATIONS */}
      {/* ========================================================================= */}
      {activeTab === 'notifications' && (
        <div className="max-w-xl mx-auto animate-in fade-in duration-200">
          <div className="bg-zinc-900/90 rounded-2xl border border-zinc-800 p-6 space-y-4 shadow-md">
            <h2 className="text-sm font-bold text-white pb-2">Notifications</h2>

            {/* New orders */}
            <div className="flex items-center justify-between gap-4 py-3 border-b border-zinc-800">
              <div>
                <div className="text-xs font-semibold text-zinc-200">New orders</div>
                <div className="text-[11px] text-zinc-400 mt-0.5">
                  Alert when a new order is placed at any location
                </div>
              </div>
              <button
                type="button"
                onClick={() => setNotifNewOrders(!notifNewOrders)}
                className={`w-11 h-6 rounded-full transition-colors cursor-pointer relative shrink-0 p-0.5 ${
                  notifNewOrders ? 'bg-amber-400' : 'bg-zinc-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform shadow-sm ${
                    notifNewOrders ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Staff activity */}
            <div className="flex items-center justify-between gap-4 py-3 border-b border-zinc-800">
              <div>
                <div className="text-xs font-semibold text-zinc-200">Staff activity</div>
                <div className="text-[11px] text-zinc-400 mt-0.5">
                  Check-ins, check-outs, and leave requests
                </div>
              </div>
              <button
                type="button"
                onClick={() => setNotifStaffActivity(!notifStaffActivity)}
                className={`w-11 h-6 rounded-full transition-colors cursor-pointer relative shrink-0 p-0.5 ${
                  notifStaffActivity ? 'bg-amber-400' : 'bg-zinc-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform shadow-sm ${
                    notifStaffActivity ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Daily reports */}
            <div className="flex items-center justify-between gap-4 py-3 border-b border-zinc-800">
              <div>
                <div className="text-xs font-semibold text-zinc-200">Daily reports</div>
                <div className="text-[11px] text-zinc-400 mt-0.5">
                  End-of-day revenue and order summary via email
                </div>
              </div>
              <button
                type="button"
                onClick={() => setNotifDailyReports(!notifDailyReports)}
                className={`w-11 h-6 rounded-full transition-colors cursor-pointer relative shrink-0 p-0.5 ${
                  notifDailyReports ? 'bg-amber-400' : 'bg-zinc-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform shadow-sm ${
                    notifDailyReports ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Customer reviews */}
            <div className="flex items-center justify-between gap-4 py-3">
              <div>
                <div className="text-xs font-semibold text-zinc-200">Customer reviews</div>
                <div className="text-[11px] text-zinc-400 mt-0.5">
                  Get notified on new reviews and ratings
                </div>
              </div>
              <button
                type="button"
                onClick={() => setNotifCustomerReviews(!notifCustomerReviews)}
                className={`w-11 h-6 rounded-full transition-colors cursor-pointer relative shrink-0 p-0.5 ${
                  notifCustomerReviews ? 'bg-amber-400' : 'bg-zinc-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform shadow-sm ${
                    notifCustomerReviews ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: INTEGRATIONS */}
      {/* ========================================================================= */}
      {activeTab === 'integrations' && (
        <div className="max-w-xl mx-auto space-y-3 animate-in fade-in duration-200">
          {/* Payment Gateway */}
          <div className="bg-zinc-900/90 rounded-2xl border border-zinc-800 p-4 flex items-center justify-between gap-4 shadow-md">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Payment Gateway</div>
                <div className="text-[11px] text-zinc-400 mt-0.5">
                  {paymentConnected ? 'SSLCommerz — Connected' : 'Not connected'}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setPaymentConnected(!paymentConnected);
                showFeedback(
                  paymentConnected ? 'Disconnected SSLCommerz' : 'Connected to SSLCommerz'
                );
              }}
              className={`h-8 px-4 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                paymentConnected
                  ? 'border border-zinc-700 hover:bg-zinc-800 text-zinc-300'
                  : 'bg-amber-400 hover:bg-amber-300 text-black font-bold shadow-md shadow-amber-500/20'
              }`}
            >
              {paymentConnected ? 'Disconnect' : 'Connect'}
            </button>
          </div>

          {/* SMS Service */}
          <div className="bg-zinc-900/90 rounded-2xl border border-zinc-800 p-4 flex items-center justify-between gap-4 shadow-md">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">SMS Service</div>
                <div className="text-[11px] text-zinc-400 mt-0.5">
                  {smsConnected ? 'Banglalink SMS API — Connected' : 'Not connected'}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setSmsConnected(!smsConnected);
                showFeedback(
                  smsConnected ? 'Disconnected Banglalink SMS' : 'Connected Banglalink SMS'
                );
              }}
              className={`h-8 px-4 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                smsConnected
                  ? 'border border-zinc-700 hover:bg-zinc-800 text-zinc-300'
                  : 'bg-amber-400 hover:bg-amber-300 text-black font-bold shadow-md shadow-amber-500/20'
              }`}
            >
              {smsConnected ? 'Disconnect' : 'Connect'}
            </button>
          </div>

          {/* WhatsApp Business */}
          <div className="bg-zinc-900/90 rounded-2xl border border-zinc-800 p-4 flex items-center justify-between gap-4 shadow-md">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">WhatsApp Business</div>
                <div className="text-[11px] text-zinc-400 mt-0.5">
                  {whatsAppConnected ? 'Connected' : 'Not connected'}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setWhatsAppConnected(!whatsAppConnected);
                showFeedback(
                  whatsAppConnected
                    ? 'Disconnected WhatsApp Business'
                    : 'Connected WhatsApp Business'
                );
              }}
              className={`h-8 px-4 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                whatsAppConnected
                  ? 'border border-zinc-700 hover:bg-zinc-800 text-zinc-300'
                  : 'bg-amber-400 hover:bg-amber-300 text-black font-bold shadow-md shadow-amber-500/20'
              }`}
            >
              {whatsAppConnected ? 'Disconnect' : 'Connect'}
            </button>
          </div>

          {/* Google Analytics */}
          <div className="bg-zinc-900/90 rounded-2xl border border-zinc-800 p-4 flex items-center justify-between gap-4 shadow-md">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Google Analytics</div>
                <div className="text-[11px] text-zinc-400 mt-0.5">
                  {analyticsConnected ? 'Connected' : 'Not connected'}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setAnalyticsConnected(!analyticsConnected);
                showFeedback(
                  analyticsConnected
                    ? 'Disconnected Google Analytics'
                    : 'Connected Google Analytics'
                );
              }}
              className={`h-8 px-4 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                analyticsConnected
                  ? 'border border-zinc-700 hover:bg-zinc-800 text-zinc-300'
                  : 'bg-amber-400 hover:bg-amber-300 text-black font-bold shadow-md shadow-amber-500/20'
              }`}
            >
              {analyticsConnected ? 'Disconnect' : 'Connect'}
            </button>
          </div>

          {/* Delivery Partner */}
          <div className="bg-zinc-900/90 rounded-2xl border border-zinc-800 p-4 flex items-center justify-between gap-4 shadow-md">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
                <Bike className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Delivery Partner</div>
                <div className="text-[11px] text-zinc-400 mt-0.5">
                  {deliveryConnected ? 'Pathao Food — Connected' : 'Not connected'}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setDeliveryConnected(!deliveryConnected);
                showFeedback(
                  deliveryConnected ? 'Disconnected Pathao Food' : 'Connected Pathao Food'
                );
              }}
              className={`h-8 px-4 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                deliveryConnected
                  ? 'border border-zinc-700 hover:bg-zinc-800 text-zinc-300'
                  : 'bg-amber-400 hover:bg-amber-300 text-black font-bold shadow-md shadow-amber-500/20'
              }`}
            >
              {deliveryConnected ? 'Disconnect' : 'Connect'}
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: PERMISSIONS */}
      {/* ========================================================================= */}
      {activeTab === 'permissions' && (
        <div className="max-w-xl mx-auto animate-in fade-in duration-200">
          <div className="bg-zinc-900/90 rounded-2xl border border-zinc-800 p-6 space-y-5 shadow-md divide-y divide-zinc-800">
            <h2 className="text-sm font-bold text-white pb-2">Role Permissions</h2>

            {/* Owner */}
            <div className="pt-4 space-y-2">
              <div className="text-xs font-bold text-white">Owner</div>
              <div className="flex flex-wrap gap-2">
                {[
                  'Full Access',
                  'Manage Restaurants',
                  'Manage Branches',
                  'View Analytics',
                  'Billing',
                ].map((perm) => (
                  <span
                    key={perm}
                    className="bg-amber-400/10 text-amber-300 border border-amber-400/30 text-[11px] font-medium px-3 py-1 rounded-full"
                  >
                    {perm}
                  </span>
                ))}
              </div>
            </div>

            {/* Restaurant Manager */}
            <div className="pt-4 space-y-2">
              <div className="text-xs font-bold text-white">Restaurant Manager</div>
              <div className="flex flex-wrap gap-2">
                {['View Orders', 'Edit Menu', 'Manage Staff', 'View Reports', 'Manage Branches'].map(
                  (perm) => (
                    <span
                      key={perm}
                      className="bg-amber-400/10 text-amber-300 border border-amber-400/30 text-[11px] font-medium px-3 py-1 rounded-full"
                    >
                      {perm}
                    </span>
                  )
                )}
              </div>
            </div>

            {/* Branch Manager */}
            <div className="pt-4 space-y-2">
              <div className="text-xs font-bold text-white">Branch Manager</div>
              <div className="flex flex-wrap gap-2">
                {['View Orders', 'Edit Menu', 'Manage Local Staff', 'View Branch Reports'].map(
                  (perm) => (
                    <span
                      key={perm}
                      className="bg-amber-400/10 text-amber-300 border border-amber-400/30 text-[11px] font-medium px-3 py-1 rounded-full"
                    >
                      {perm}
                    </span>
                  )
                )}
              </div>
            </div>

            {/* Cashier */}
            <div className="pt-4 space-y-2">
              <div className="text-xs font-bold text-white">Cashier</div>
              <div className="flex flex-wrap gap-2">
                {['View Orders', 'Process Payments'].map((perm) => (
                  <span
                    key={perm}
                    className="bg-amber-400/10 text-amber-300 border border-amber-400/30 text-[11px] font-medium px-3 py-1 rounded-full"
                  >
                    {perm}
                  </span>
                ))}
              </div>
            </div>

            {/* Waiter */}
            <div className="pt-4 space-y-2">
              <div className="text-xs font-bold text-white">Waiter</div>
              <div className="flex flex-wrap gap-2">
                {['View Orders', 'Update Order Status'].map((perm) => (
                  <span
                    key={perm}
                    className="bg-amber-400/10 text-amber-300 border border-amber-400/30 text-[11px] font-medium px-3 py-1 rounded-full"
                  >
                    {perm}
                  </span>
                ))}
              </div>
            </div>

            {/* Kitchen Staff */}
            <div className="pt-4 space-y-2">
              <div className="text-xs font-bold text-white">Kitchen Staff</div>
              <div className="flex flex-wrap gap-2">
                {['View Orders', 'Update Preparation Status'].map((perm) => (
                  <span
                    key={perm}
                    className="bg-amber-400/10 text-amber-300 border border-amber-400/30 text-[11px] font-medium px-3 py-1 rounded-full"
                  >
                    {perm}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: DANGER ZONE */}
      {/* ========================================================================= */}
      {activeTab === 'danger' && (
        <div className="max-w-xl mx-auto animate-in fade-in duration-200">
          <div className="bg-zinc-900/90 rounded-2xl border border-rose-500/30 p-6 space-y-4 shadow-md">
            <div>
              <h2 className="text-sm font-bold text-rose-400">Danger Zone</h2>
              <p className="text-xs text-rose-400/80 mt-0.5">
                Irreversible actions. Proceed with extreme caution.
              </p>
            </div>

            {/* Archive restaurant */}
            <div className="pt-4 flex items-center justify-between gap-4 border-t border-rose-500/20">
              <div>
                <div className="text-xs font-bold text-zinc-200">Archive restaurant</div>
                <div className="text-[11px] text-zinc-400 mt-0.5">
                  Hide this restaurant from active listings. Data is preserved.
                </div>
              </div>
              <button
                type="button"
                onClick={() => showFeedback('Restaurant archived.')}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 text-xs font-semibold rounded-xl transition-all cursor-pointer shrink-0"
              >
                Archive
              </button>
            </div>

            {/* Transfer ownership */}
            <div className="pt-4 flex items-center justify-between gap-4 border-t border-rose-500/20">
              <div>
                <div className="text-xs font-bold text-zinc-200">Transfer ownership</div>
                <div className="text-[11px] text-zinc-400 mt-0.5">
                  Transfer this restaurant to another owner account.
                </div>
              </div>
              <button
                type="button"
                onClick={() => showFeedback('Transfer initiated.')}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 text-xs font-semibold rounded-xl transition-all cursor-pointer shrink-0"
              >
                Transfer
              </button>
            </div>

            {/* Delete restaurant */}
            <div className="pt-4 flex items-center justify-between gap-4 border-t border-rose-500/20">
              <div>
                <div className="text-xs font-bold text-zinc-200">Delete restaurant</div>
                <div className="text-[11px] text-zinc-400 mt-0.5">
                  Permanently delete this restaurant, all branches, and all associated data.
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Are you sure you want to delete ${restaurantName}?`)) {
                    onDeleteRestaurant?.(restaurant.id);
                    onBack();
                  }
                }}
                className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/50 text-rose-400 text-xs font-semibold rounded-xl transition-all cursor-pointer shrink-0"
              >
                Delete Restaurant
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
