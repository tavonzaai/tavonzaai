'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { MOCK_BRANCHES, MOCK_RESTAURANTS } from '../data';
import { BranchItem } from '../types';
import BranchDashboardView from './BranchDashboardView';
import { BranchFormData } from './branches/types';
import {
  BranchesHeader,
  BranchesSearch,
  BranchesTable,
  CreateBranchModal,
  EditBranchModal,
  DeleteBranchModal,
} from './branches/components';

interface BranchesViewProps {
  onBack?: () => void;
  initialBranchId?: string;
}

export default function BranchesView({ onBack, initialBranchId }: BranchesViewProps = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [branches, setBranches] = useState<BranchItem[]>(MOCK_BRANCHES);
  const [searchQuery, setSearchQuery] = useState('');

  // Selected branch for viewing branch dashboard
  const [selectedBranch, setSelectedBranch] = useState<BranchItem | null>(() => {
    const idToFind = initialBranchId || searchParams.get('branchId') || searchParams.get('branch');
    if (idToFind) {
      return (
        MOCK_BRANCHES.find(
          (b) =>
            b.id.toLowerCase() === idToFind.toLowerCase() ||
            b.name.toLowerCase().includes(idToFind.toLowerCase().slice(0, 7))
        ) || null
      );
    }
    return null;
  });

  // Sync with searchParams
  useEffect(() => {
    const branchId = searchParams.get('branchId') || searchParams.get('branch');
    if (branchId) {
      const found = branches.find(
        (b) =>
          b.id.toLowerCase() === branchId.toLowerCase() ||
          b.name.toLowerCase().includes(branchId.toLowerCase().slice(0, 7))
      );
      if (found) {
        setSelectedBranch(found);
      }
    }
  }, [searchParams, branches]);

  const handleViewBranch = (branch: BranchItem) => {
    setSelectedBranch(branch);
    router.push(`/new-admin-dashboard/branches?branchId=${branch.id}`, { scroll: false });
  };

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<BranchItem | null>(null);
  const [deletingBranch, setDeletingBranch] = useState<BranchItem | null>(null);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.push('/new-admin-dashboard/restaurants');
    }
  };

  // Submit Create Branch
  const handleCreateSubmit = (form: BranchFormData) => {
    if (!form.name.trim()) {
      toast.error('Please enter a branch name.');
      return;
    }

    const matchedRest = MOCK_RESTAURANTS.find((r) => r.id === form.restaurantId);

    const newBranch: BranchItem = {
      id: `br-${Date.now()}`,
      restaurantId: form.restaurantId,
      restaurantName: matchedRest ? matchedRest.name : form.restaurantName,
      name: form.name.trim(),
      location: form.address.trim() || 'Cusseta, Georgia',
      manager: form.manager,
      hours: `${form.openingTime} – ${form.closingTime}`,
      openingTime: form.openingTime,
      closingTime: form.closingTime,
      contactNumber: form.contactNumber,
      status: form.status,
      tablesCount: 16,
      occupancy: 60,
      kitchenSync: 'Online',
      monthlyRevenue: '$45,000',
    };

    setBranches([newBranch, ...branches]);
    setIsCreateOpen(false);
    toast.success(`Branch "${newBranch.name}" created successfully!`);
  };

  // Submit Edit Branch
  const handleEditSubmit = (form: BranchFormData) => {
    if (!editingBranch) return;
    if (!form.name.trim()) {
      toast.error('Branch name cannot be empty.');
      return;
    }

    const matchedRest = MOCK_RESTAURANTS.find((r) => r.id === form.restaurantId);

    setBranches((prev) =>
      prev.map((b) =>
        b.id === editingBranch.id
          ? {
              ...b,
              restaurantId: form.restaurantId,
              restaurantName: matchedRest ? matchedRest.name : form.restaurantName,
              name: form.name.trim(),
              location: form.address.trim(),
              contactNumber: form.contactNumber,
              manager: form.manager,
              status: form.status,
              openingTime: form.openingTime,
              closingTime: form.closingTime,
              hours: `${form.openingTime} – ${form.closingTime}`,
            }
          : b
      )
    );
    toast.success(`Branch "${form.name}" updated successfully!`);
    setEditingBranch(null);
  };

  // Confirm Delete Branch
  const handleConfirmDelete = () => {
    if (!deletingBranch) return;
    const deletedName = deletingBranch.name;
    setBranches((prev) => prev.filter((r) => r.id !== deletingBranch.id));
    toast.success(`"${deletedName}" branch permanently deleted.`);
    setDeletingBranch(null);
  };

  const filteredBranches = branches.filter((b) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      b.name.toLowerCase().includes(q) ||
      b.restaurantName.toLowerCase().includes(q) ||
      b.manager.toLowerCase().includes(q) ||
      b.location.toLowerCase().includes(q)
    );
  });

  if (selectedBranch) {
    return (
      <BranchDashboardView
        branch={selectedBranch}
        onBack={() => {
          setSelectedBranch(null);
          router.push('/new-admin-dashboard/branches', { scroll: false });
        }}
        onUpdateBranch={(updated) => {
          setBranches((prev) =>
            prev.map((b) => (b.id === updated.id ? updated : b))
          );
          setSelectedBranch(updated);
        }}
      />
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <BranchesHeader
        onBack={handleBack}
        onCreateBranchClick={() => setIsCreateOpen(true)}
      />

      {/* Optional Search */}
      {branches.length > 4 && (
        <BranchesSearch
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      )}

      {/* Branches Table */}
      <BranchesTable
        branches={filteredBranches}
        onViewBranch={handleViewBranch}
        onEditBranch={(b) => setEditingBranch(b)}
        onDeleteBranch={(b) => setDeletingBranch(b)}
      />

      {/* Create Modal */}
      {isCreateOpen && (
        <CreateBranchModal
          restaurants={MOCK_RESTAURANTS}
          onClose={() => setIsCreateOpen(false)}
          onSubmit={handleCreateSubmit}
        />
      )}

      {/* Edit Modal */}
      {editingBranch && (
        <EditBranchModal
          branch={editingBranch}
          restaurants={MOCK_RESTAURANTS}
          onClose={() => setEditingBranch(null)}
          onSubmit={handleEditSubmit}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingBranch && (
        <DeleteBranchModal
          branch={deletingBranch}
          onClose={() => setDeletingBranch(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
}
