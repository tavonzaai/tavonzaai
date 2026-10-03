'use client';

import React, { useState } from 'react';
import {
  LoyaltyHeader,
  LoyaltyBirthdayBanner,
  LoyaltyStatCards,
  LoyaltyTabsBar,
  SendRewardModal,
  OverviewTab,
  VIPCustomersTab,
  BirthdayRemindersTab,
  PersonalizedUpsellTab,
} from './components';
import {
  LoyaltyTab,
  LoyaltyMember,
} from './types';
import {
  initialLoyaltyMembers,
  initialLoyaltyStats,
  initialTierDistribution,
  initialLTVLeaderboard,
} from './loyaltyData';
import { toast } from 'sonner';

interface LoyaltyViewProps {
  onNavigateToPOS?: () => void;
  onNavigateToCustomers?: () => void;
}

export const LoyaltyView: React.FC<LoyaltyViewProps> = ({
  onNavigateToPOS,
  onNavigateToCustomers,
}) => {
  const [activeTab, setActiveTab] = useState<LoyaltyTab>('Overview');
  const [members, setMembers] = useState<LoyaltyMember[]>(initialLoyaltyMembers);
  const [stats] = useState(initialLoyaltyStats);
  const [tierDistribution] = useState(initialTierDistribution);
  const [leaderboard] = useState(initialLTVLeaderboard);

  // Send Reward Modal state
  const [isRewardModalOpen, setIsRewardModalOpen] = useState(false);
  const [selectedMemberForReward, setSelectedMemberForReward] =
    useState<LoyaltyMember | null>(null);

  const handleOpenSendReward = (member?: LoyaltyMember) => {
    setSelectedMemberForReward(member || null);
    setIsRewardModalOpen(true);
  };

  const handleRewardSent = (memberId: string, rewardTitle: string) => {
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id === memberId) {
          return {
            ...m,
            points: m.points + (rewardTitle.includes('250') ? 250 : 50),
          };
        }
        return m;
      })
    );
  };

  const handleApplyUpsellToOrder = (member: LoyaltyMember, itemName: string) => {
    toast.success(
      `Upsell "${itemName}" for ${member.name} staged to checkout cart!`,
      {
        action: onNavigateToPOS
          ? {
              label: 'Go to POS',
              onClick: () => onNavigateToPOS(),
            }
          : undefined,
      }
    );
  };

  const handleViewProfile = (member: LoyaltyMember) => {
    toast.info(`Viewing ${member.name}'s customer file`);
    if (onNavigateToCustomers) {
      onNavigateToCustomers();
    }
  };

  // Filtered members for specialized tabs
  const vipMembers = members.filter((m) => m.tier === 'VIP');
  const nearVipMembers = members.filter(
    (m) => m.tier === 'Gold' && m.points >= 2000
  );
  const birthdayMembers = members.filter(
    (m) => m.isBirthdayToday || m.suggestedBirthdayOffer
  );
  const membersWithUpsells = members.filter(
    (m) => m.upsellSuggestions && m.upsellSuggestions.length > 0
  );

  return (
    <div className="w-full space-y-6 pb-12">
      {/* 1. Page Header */}
      <LoyaltyHeader
        members={members}
        onOpenSendReward={() => handleOpenSendReward()}
      />

      {/* 2. Birthday Highlight Banner */}
      <LoyaltyBirthdayBanner
        customerName="Sarah Johnson"
        tier="VIP"
        lifetimeValue={1840}
        initialSent={true}
        onSendGift={() => {
          setMembers((prev) =>
            prev.map((m) =>
              m.id === 'lm-2' ? { ...m, birthdayOfferSent: true } : m
            )
          );
        }}
      />

      {/* 3. Stat Cards */}
      <LoyaltyStatCards stats={stats} />

      {/* 4. Tab Navigation Switcher */}
      <div className="pt-2">
        <LoyaltyTabsBar activeTab={activeTab} onSelectTab={setActiveTab} />
      </div>

      {/* 5. Dynamic Tab Content */}
      <div className="pt-1">
        {activeTab === 'Overview' && (
          <OverviewTab
            members={members}
            tierDistribution={tierDistribution}
            leaderboard={leaderboard}
            onSelectMemberForReward={handleOpenSendReward}
          />
        )}

        {activeTab === 'VIP Customers' && (
          <VIPCustomersTab
            vipMembers={vipMembers}
            nearVipMembers={nearVipMembers}
            onOpenSendRewardForMember={handleOpenSendReward}
            onViewProfile={handleViewProfile}
          />
        )}

        {activeTab === 'Birthday Reminders' && (
          <BirthdayRemindersTab birthdayMembers={birthdayMembers} />
        )}

        {activeTab === 'Personalized Upsell' && (
          <PersonalizedUpsellTab
            membersWithUpsells={membersWithUpsells}
            onApplyUpsellToOrder={handleApplyUpsellToOrder}
          />
        )}
      </div>

      {/* 6. Send Reward Modal */}
      <SendRewardModal
        isOpen={isRewardModalOpen}
        onClose={() => {
          setIsRewardModalOpen(false);
          setSelectedMemberForReward(null);
        }}
        members={members}
        selectedMember={selectedMemberForReward}
        onRewardSent={handleRewardSent}
      />
    </div>
  );
};
