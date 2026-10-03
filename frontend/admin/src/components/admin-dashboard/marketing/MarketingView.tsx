'use client';

import React, { useState, useMemo } from 'react';
import {
  MarketingHeader,
  MarketingKPICards,
  MarketingFilterBar,
  MarketingCampaignsGrid,
  CreateCampaignModal,
  CampaignReportModal,
  EditCampaignModal,
  AskAIAssistantModal,
} from './components';
import { INITIAL_CAMPAIGNS, INITIAL_MARKETING_KPIS } from './marketingData';
import { CampaignItem, CampaignChannel, CreateCampaignFormData, MarketingKPI } from './types';
import { Sparkles, CheckCircle } from 'lucide-react';

export default function MarketingView() {
  const [campaigns, setCampaigns] = useState<CampaignItem[]>(INITIAL_CAMPAIGNS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<CampaignChannel | 'All'>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All Statuses');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [reportCampaign, setReportCampaign] = useState<CampaignItem | null>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [editCampaign, setEditCampaign] = useState<CampaignItem | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);

  // Success Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Dynamic / Live KPIs computation
  const liveKPIs = useMemo<MarketingKPI[]>(() => {
    const activeCount = campaigns.filter((c) => c.status === 'Active').length;
    const totalSent = campaigns.reduce((acc, c) => acc + c.sentCount, 0);
    const avgOpen =
      campaigns.length > 0
        ? Math.round(campaigns.reduce((acc, c) => acc + c.openRate, 0) / campaigns.length)
        : 61;
    const totalRev = campaigns.reduce((acc, c) => acc + c.revenue, 0);

    return [
      {
        id: 'kpi-1',
        title: 'Active Campaigns',
        value: activeCount.toString().padStart(2, '0'),
        change: '+1 this month',
        isPositive: true,
        subtext: 'Active Campaigns',
      },
      {
        id: 'kpi-2',
        title: 'Messages Sent',
        value: totalSent.toLocaleString(),
        change: '+18.4% vs last week',
        isPositive: true,
        subtext: 'Messages Sent',
      },
      {
        id: 'kpi-3',
        title: 'Avg Open Rate',
        value: `${avgOpen}%`,
        change: '+5.2% vs industry avg',
        isPositive: true,
        subtext: 'Avg Open Rate',
      },
      {
        id: 'kpi-4',
        title: 'Revenue Attributed',
        value: `$${totalRev.toLocaleString()}`,
        change: 'ROAS 14.8x',
        isPositive: true,
        subtext: 'Revenue Attributed',
      },
    ];
  }, [campaigns]);

  // Filtered campaigns
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.targetAudience.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.messageContent.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesChannel = selectedChannel === 'All' || c.channel === selectedChannel;
      const matchesStatus = selectedStatus === 'All Statuses' || c.status === selectedStatus;

      return matchesSearch && matchesChannel && matchesStatus;
    });
  }, [campaigns, searchQuery, selectedChannel, selectedStatus]);

  // Handlers
  const handleCreateCampaign = (formData: CreateCampaignFormData) => {
    const isLaunched = formData.status === 'Active';
    const newCamp: CampaignItem = {
      id: `camp-${Date.now()}`,
      name: formData.name,
      channel: formData.channel,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: formData.status,
      sentCount: isLaunched ? 650 : 0,
      openRate: isLaunched ? 68 : 0,
      revenue: isLaunched ? 1820 : 0,
      targetAudience: formData.targetAudience,
      messageContent: formData.messageContent,
      deliveryRate: 99.0,
      clickRate: 36.5,
      conversionsCount: isLaunched ? 88 : 0,
      cost: 25.0,
    };

    setCampaigns((prev) => [newCamp, ...prev]);
    showToast(
      isLaunched
        ? `Campaign "${formData.name}" launched successfully!`
        : `Campaign "${formData.name}" saved as draft.`
    );
  };

  const handleSaveEdit = (updated: CampaignItem) => {
    setCampaigns((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    showToast(`Campaign "${updated.name}" updated successfully.`);
  };

  const handleOpenReport = (camp: CampaignItem) => {
    setReportCampaign(camp);
    setIsReportOpen(true);
  };

  const handleOpenEdit = (camp: CampaignItem) => {
    setEditCampaign(camp);
    setIsEditOpen(true);
  };

  const handleDeleteCampaign = (camp: CampaignItem) => {
    if (typeof window !== 'undefined' && window.confirm(`Are you sure you want to delete "${camp.name}"?`)) {
      setCampaigns((prev) => prev.filter((c) => c.id !== camp.id));
      showToast(`Campaign "${camp.name}" deleted.`);
    }
  };

  const handleUseCampaignInCreator = (campData: Partial<CreateCampaignFormData>) => {
    handleCreateCampaign({
      name: campData.name || 'AI Generated Campaign',
      channel: campData.channel || 'SMS',
      targetAudience: campData.targetAudience || 'All Customers',
      messageContent: campData.messageContent || '',
      status: 'Active',
    });
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200 pb-20 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 px-4 py-3 bg-zinc-900 border border-amber-500/50 rounded-xl shadow-2xl text-white text-sm flex items-center gap-2.5 animate-in slide-in-from-top duration-300">
          <CheckCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header (Title, Subtitle, New Campaign CTA) */}
      <MarketingHeader
        onNewCampaign={() => setIsCreateOpen(true)}
      />

      {/* 2. Top 4 Metric KPI Cards with gold outline glow */}
      <MarketingKPICards kpis={liveKPIs} />

      {/* 3. Filter & Search Bar */}
      <MarketingFilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedChannel={selectedChannel}
        setSelectedChannel={setSelectedChannel}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        totalCount={campaigns.length}
        filteredCount={filteredCampaigns.length}
      />

      {/* 4. Campaigns Grid (3 Columns on Desktop matching Figma) */}
      <MarketingCampaignsGrid
        campaigns={filteredCampaigns}
        onViewReport={handleOpenReport}
        onEdit={handleOpenEdit}
        onDelete={handleDeleteCampaign}
        onNewCampaign={() => setIsCreateOpen(true)}
      />

      {/* 5. Floating "Ask Tavonza AI" CTA button at bottom right */}
      <div className="fixed bottom-6 right-6 z-30">
        <button
          onClick={() => setIsAIOpen(true)}
          className="h-10 px-4 py-2.5 bg-gradient-to-r from-indigo-500 via-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 rounded-[10px] shadow-[0px_4px_6px_-4px_rgba(99,102,241,0.30)] shadow-[0px_10px_15px_-3px_rgba(99,102,241,0.30)] text-white text-base font-semibold inline-flex items-center gap-2 transition-all duration-200 cursor-pointer active:scale-95 group hover:shadow-indigo-500/40"
        >
          <Sparkles className="w-4 h-4 text-white group-hover:rotate-12 transition-transform" />
          <span>Ask Tavonza AI</span>
        </button>
      </div>

      {/* 6. Create Campaign 3-Step Modal */}
      <CreateCampaignModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreateCampaign={handleCreateCampaign}
      />

      {/* 7. Campaign Report Analytics Modal */}
      <CampaignReportModal
        campaign={reportCampaign}
        isOpen={isReportOpen}
        onClose={() => {
          setIsReportOpen(false);
          setReportCampaign(null);
        }}
      />

      {/* 8. Edit Campaign Modal */}
      <EditCampaignModal
        campaign={editCampaign}
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setEditCampaign(null);
        }}
        onSave={handleSaveEdit}
      />

      {/* 9. Ask Tavonza AI Marketing Assistant Modal */}
      <AskAIAssistantModal
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
        onUseCampaignInCreator={handleUseCampaignInCreator}
      />
    </div>
  );
}
