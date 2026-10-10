'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { RestaurantItem, BranchItem } from '../types';
import { MOCK_BRANCHES } from '../data';
import { BranchFormData } from './restaurant-branches-detail/types';
import {
  RestaurantBranchesHeader,
  RestaurantSummaryBanner,
  RestaurantBranchCard,
  CreateBranchModal,
  EditBranchModal,
  DeleteBranchModal,
} from './restaurant-branches-detail/components';

interface RestaurantBranchesDetailViewProps {
  restaurant: RestaurantItem;
  onBack: () => void;
  onOpenBranchDashboard?: (branch: BranchItem) => void;
}

export default function RestaurantBranchesDetailView({
  restaurant,
  onBack,
  onOpenBranchDashboard,
}: RestaurantBranchesDetailViewProps) {
  const router = useRouter();
  // Load branches associated with this restaurant
  const [branches, setBranches] = useState<BranchItem[]>(() => {
    const matched = MOCK_BRANCHES.filter(
      (b) =>
        b.restaurantId === restaurant.id ||
        b.restaurantName.toLowerCase().includes(restaurant.name.toLowerCase().slice(0, 7))
    );
    if (matched.length > 0) return matched;
    // Fallback default branches for any restaurant
    return [
      {
        id: `br-${restaurant.id}-1`,
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        name: 'Georgia Flagship',
        location: restaurant.address || 'Cusseta, Georgia',
        manager: 'Nobin Mille',
        hours: '09:00–23:00',
        openingTime: '09:00',
        closingTime: '23:00',
        contactNumber: '992548756',
        tablesCount: 18,
        occupancy: 78,
        status: 'Active',
      },
      {
        id: `br-${restaurant.id}-2`,
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        name: 'Florida Flagship',
        location: 'Pompano Beach, Florida',
        manager: 'Samira Khan',
        hours: '10:00–22:30',
        openingTime: '10:00',
        closingTime: '22:30',
        contactNumber: '+19545558910',
        tablesCount: 14,
        occupancy: 64,
        status: 'Active',
      },
    ];
  });

  // Modal States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<BranchItem | null>(null);
  const [deletingBranch, setDeletingBranch] = useState<BranchItem | null>(null);

  // Submit Create Branch
  const handleCreateSubmit = (form: BranchFormData) => {
    if (!form.name.trim()) {
      toast.error('Please enter a branch name.');
      return;
    }

    const newBranch: BranchItem = {
      id: `br-${Date.now()}`,
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      name: form.name.trim(),
      location: form.address.trim() || 'Cusseta, Georgia',
      manager: form.manager,
      hours: `${form.openingTime}–${form.closingTime}`,
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

    setBranches((prev) =>
      prev.map((b) =>
        b.id === editingBranch.id
          ? {
              ...b,
              name: form.name.trim(),
              location: form.address.trim(),
              contactNumber: form.contactNumber,
              manager: form.manager,
              status: form.status,
              openingTime: form.openingTime,
              closingTime: form.closingTime,
              hours: `${form.openingTime}–${form.closingTime}`,
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
    setBranches((prev) => prev.filter((b) => b.id !== deletingBranch.id));
    toast.success(`"${deletedName}" branch permanently deleted.`);
    setDeletingBranch(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Navigation & Header */}
      <RestaurantBranchesHeader
        restaurantName={restaurant.name}
        onBack={onBack}
        onCreateBranchClick={() => setIsCreateOpen(true)}
      />

      {/* Restaurant Summary Banner */}
      <RestaurantSummaryBanner restaurant={restaurant} />

      {/* Manage Branches Section Title */}
      <div className="flex flex-col justify-start items-start gap-1 pt-2">
        <h2 className="text-white text-lg font-semibold font-sans">
          Manage Branches
        </h2>
        <p className="text-zinc-500 text-sm font-normal font-sans leading-6">
          {branches.length} locations connected to this restaurant
        </p>
      </div>

      {/* Branch Cards Row */}
      <div className="flex flex-wrap items-start gap-5">
        {branches.map((branch) => (
          <RestaurantBranchCard
            key={branch.id}
            branch={branch}
            onOpenDashboard={(b) => {
              if (onOpenBranchDashboard) {
                onOpenBranchDashboard(b);
              } else {
                router.push(`/new-admin-dashboard/branches?branchId=${b.id}`);
              }
            }}
            onEdit={(b) => setEditingBranch(b)}
            onDelete={(b) => setDeletingBranch(b)}
          />
        ))}
      </div>

      {/* Create Modal */}
      {isCreateOpen && (
        <CreateBranchModal
          restaurantName={restaurant.name}
          onClose={() => setIsCreateOpen(false)}
          onSubmit={handleCreateSubmit}
        />
      )}

      {/* Edit Modal */}
      {editingBranch && (
        <EditBranchModal
          restaurantName={restaurant.name}
          branch={editingBranch}
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
