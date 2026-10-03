'use client';

import React, { useState, useMemo } from 'react';
import {
  TavonzaCardHeader,
  TavonzaCardKPICards,
  TavonzaCardTierCards,
  TavonzaCardFilterBar,
  TavonzaCardTable,
  AddCardMemberModal,
  CardMemberDetailsModal,
} from './components';
import { INITIAL_CARD_MEMBERS } from './tavonzaCardData';
import { CardMember, CardTier, CardSummaryKPIs } from './types';
import { CheckCircle } from 'lucide-react';

export default function TavonzaCardView() {
  const [members, setMembers] = useState<CardMember[]>(INITIAL_CARD_MEMBERS);
  const [selectedTier, setSelectedTier] = useState<CardTier | 'All Tiers'>('All Tiers');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<CardMember | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Dynamic Tier Counts
  const tierCounts = useMemo<Record<CardTier, number>>(() => {
    const counts: Record<CardTier, number> = {
      Platinum: 0,
      Gold: 0,
      Silver: 0,
      Bronze: 0,
    };
    members.forEach((m) => {
      if (counts[m.tier] !== undefined) {
        counts[m.tier]++;
      }
    });
    return counts;
  }, [members]);

  // Dynamic Summary KPIs
  const kpis = useMemo<CardSummaryKPIs>(() => {
    const totalMembers = members.length;
    const activeMembers = members.filter((m) => m.status === 'Active').length;
    const totalPoints = members.reduce((acc, m) => acc + m.points, 0);
    const totalSpend = members.reduce((acc, m) => acc + m.totalSpend, 0);

    const formatPoints = (pts: number) => {
      if (pts >= 1000) {
        return `${(pts / 1000).toFixed(1)}k`;
      }
      return pts.toString();
    };

    const formatSpend = (spd: number) => {
      if (spd >= 1000) {
        return `$${(spd / 1000).toFixed(1)}k`;
      }
      return `$${spd}`;
    };

    return {
      totalMembers,
      activeMembers,
      pointsIssued: formatPoints(totalPoints),
      memberSpend: formatSpend(totalSpend),
      tierBreakdown: tierCounts,
    };
  }, [members, tierCounts]);

  // Filtered members
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const matchesTier = selectedTier === 'All Tiers' || m.tier === selectedTier;
      const matchesStatus = statusFilter === 'All' || m.status === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.cardId.toLowerCase().includes(q) ||
        m.tier.toLowerCase().includes(q);

      return matchesTier && matchesStatus && matchesSearch;
    });
  }, [members, selectedTier, statusFilter, searchQuery]);

  // Next Card ID generator
  const nextCardId = useMemo(() => {
    const nextNum = members.length + 1;
    return `TCV-${String(nextNum).padStart(4, '0')}`;
  }, [members]);

  // Handlers
  const handleAddMember = (newMem: Omit<CardMember, 'id'>) => {
    const id = `mem-${Date.now()}`;
    const fullMember: CardMember = { id, ...newMem };
    setMembers((prev) => [fullMember, ...prev]);
    showToast(`Tavonza Card ${newMem.cardId} issued to ${newMem.name}!`);
  };

  const handleDeleteMember = (memberId: string) => {
    const target = members.find((m) => m.id === memberId);
    setMembers((prev) => prev.filter((m) => m.id !== memberId));
    showToast(`Member "${target?.name || 'Cardholder'}" removed.`);
  };

  const handleUpdatePoints = (memberId: string, delta: number) => {
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id !== memberId) return m;
        const updatedPoints = Math.max(0, m.points + delta);

        // Auto calculate tier upgrade
        let newTier: CardTier = m.tier;
        if (updatedPoints >= 10000) newTier = 'Platinum';
        else if (updatedPoints >= 5000) newTier = 'Gold';
        else if (updatedPoints >= 1000) newTier = 'Silver';
        else newTier = 'Bronze';

        return {
          ...m,
          points: updatedPoints,
          tier: newTier,
        };
      })
    );

    // Update modal state if open
    setSelectedMember((prev) => {
      if (!prev || prev.id !== memberId) return prev;
      const updatedPoints = Math.max(0, prev.points + delta);
      let newTier: CardTier = prev.tier;
      if (updatedPoints >= 10000) newTier = 'Platinum';
      else if (updatedPoints >= 5000) newTier = 'Gold';
      else if (updatedPoints >= 1000) newTier = 'Silver';
      else newTier = 'Bronze';

      return {
        ...prev,
        points: updatedPoints,
        tier: newTier,
      };
    });

    showToast(`${delta > 0 ? '+' : ''}${delta} points adjusted successfully.`);
  };

  const handleExport = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Card ID,Name,Email,Tier,Points,Total Spend,Visits,Last Visit,Joined,Status']
        .concat(
          members.map(
            (m) =>
              `${m.cardId},"${m.name}","${m.email}",${m.tier},${m.points},${m.totalSpend},${m.visits},"${m.lastVisit}","${m.joined}",${m.status}`
          )
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `tavonza_card_members_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Tavonza Card members list exported to CSV.');
  };

  return (
    <div className="w-full space-y-7 animate-in fade-in duration-200 pb-16 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 px-4 py-3 bg-[#18191c] border border-amber-500/50 rounded-xl shadow-2xl text-white text-sm flex items-center gap-2.5 animate-in slide-in-from-top duration-300">
          <CheckCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header (Title, Subtitle, Export, Add Member) */}
      <TavonzaCardHeader
        onExport={handleExport}
        onAddMember={() => setIsAddModalOpen(true)}
      />

      {/* 2. Top Summary KPI Cards (Row 1) */}
      <TavonzaCardKPICards kpis={kpis} />

      {/* 3. Tier Distribution Cards (Row 2) */}
      <TavonzaCardTierCards
        tierCounts={tierCounts}
        selectedTier={selectedTier}
        onSelectTier={(tier) => setSelectedTier(tier)}
      />

      {/* 4. Filter Bar (Tier Pills, Search Input, Status Toggle) */}
      <TavonzaCardFilterBar
        selectedTier={selectedTier}
        onSelectTier={setSelectedTier}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />

      {/* 5. Members Data Table with 10-per-page pagination */}
      <TavonzaCardTable
        members={filteredMembers}
        onViewMember={(m) => setSelectedMember(m)}
        onDeleteMember={handleDeleteMember}
        itemsPerPage={10}
      />

      {/* 6. Add Member Modal */}
      <AddCardMemberModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddMember={handleAddMember}
        nextCardId={nextCardId}
      />

      {/* 7. Card Member Details Modal */}
      <CardMemberDetailsModal
        member={selectedMember}
        isOpen={Boolean(selectedMember)}
        onClose={() => setSelectedMember(null)}
        onUpdatePoints={handleUpdatePoints}
      />
    </div>
  );
}
