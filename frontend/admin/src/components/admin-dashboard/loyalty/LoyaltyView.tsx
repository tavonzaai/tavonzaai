'use client';

import React, { useState } from 'react';
import {
  LoyaltyHeader,
  LoyaltyKPICards,
  LoyaltyTiers,
  LoyaltyRewardsGrid,
  LoyaltyRecentActivity,
  AddRewardModal,
  RedeemRewardModal,
} from './components';
import {
  INITIAL_LOYALTY_KPIS,
  INITIAL_LOYALTY_TIERS,
  INITIAL_LOYALTY_REWARDS,
  INITIAL_LOYALTY_ACTIVITIES,
} from './loyaltyData';
import { LoyaltyReward, LoyaltyActivity } from './types';

export default function LoyaltyView() {
  const [kpis] = useState(INITIAL_LOYALTY_KPIS);
  const [tiers] = useState(INITIAL_LOYALTY_TIERS);
  const [rewards, setRewards] = useState<LoyaltyReward[]>(INITIAL_LOYALTY_REWARDS);
  const [activities, setActivities] = useState<LoyaltyActivity[]>(INITIAL_LOYALTY_ACTIVITIES);

  // Modals state
  const [selectedReward, setSelectedReward] = useState<LoyaltyReward | null>(null);
  const [isAddRewardOpen, setIsAddRewardOpen] = useState(false);
  const [isRedeemOpen, setIsRedeemOpen] = useState(false);

  // Handlers
  const handleSelectReward = (reward: LoyaltyReward) => {
    setSelectedReward(reward);
    setIsRedeemOpen(true);
  };

  const handleAddReward = (newRewardData: Omit<LoyaltyReward, 'id' | 'claimedCount'>) => {
    const newReward: LoyaltyReward = {
      ...newRewardData,
      id: `rew-${Date.now()}`,
      claimedCount: 0,
    };
    setRewards((prev) => [newReward, ...prev]);
  };

  const handleConfirmRedeem = (rewardId: string, customerName: string) => {
    // 1. Update reward claimed count
    setRewards((prev) =>
      prev.map((r) =>
        r.id === rewardId ? { ...r, claimedCount: r.claimedCount + 1 } : r
      )
    );

    const targetReward = rewards.find((r) => r.id === rewardId);

    // 2. Prepend to recent activities
    const newActivity: LoyaltyActivity = {
      id: `act-${Date.now()}`,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      userName: customerName,
      action: `Redeemed ${targetReward ? targetReward.name : 'reward'}`,
      timeAgo: 'Just now',
      pointsChange: targetReward ? -targetReward.pointsCost : -200,
    };

    setActivities((prev) => [newActivity, ...prev]);
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200 pb-12">
      {/* 1. Header with Add Reward trigger */}
      <LoyaltyHeader onAddReward={() => setIsAddRewardOpen(true)} />

      {/* 2. Top 4 Metric KPI Cards */}
      <LoyaltyKPICards kpis={kpis} />

      {/* 3. 4 Tier Cards (Bronze, Silver, Gold, Platinum) */}
      <LoyaltyTiers tiers={tiers} />

      {/* 4. Main Two-Column Layout: Catalog Grid + Recent Activity Feed */}
      <div className="flex flex-col lg:flex-row items-start gap-5 w-full">
        {/* Left Column: Rewards Catalog */}
        <div className="flex-1 w-full">
          <LoyaltyRewardsGrid
            rewards={rewards}
            onSelectReward={handleSelectReward}
          />
        </div>

        {/* Right Column: Live Recent Activity Feed */}
        <LoyaltyRecentActivity activities={activities} />
      </div>

      {/* 5. Add Reward Modal */}
      <AddRewardModal
        isOpen={isAddRewardOpen}
        onClose={() => setIsAddRewardOpen(false)}
        onAddReward={handleAddReward}
      />

      {/* 6. Redeem Reward Modal */}
      <RedeemRewardModal
        reward={selectedReward}
        isOpen={isRedeemOpen}
        onClose={() => setIsRedeemOpen(false)}
        onConfirmRedeem={handleConfirmRedeem}
      />
    </div>
  );
}
