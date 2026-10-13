'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { RestaurantItem, BranchItem } from '../types';
import { BranchFormData } from './restaurant-branches-detail/types';
import {
  RestaurantBranchesHeader,
  RestaurantSummaryBanner,
  RestaurantBranchCard,
  CreateBranchModal,
  EditBranchModal,
  DeleteBranchModal,
} from './restaurant-branches-detail/components';
import {
  useCreateBranchMutation,
  useDeleteBranchMutation,
  useGetBranchesQuery,
  useSetOperatingHoursMutation,
  useUpdateBranchMutation,
} from '@/redux/features/adminApi';
import { mapBranch, parseBranchAddress } from '@/lib/admin-mappers';
import { EmptyState, ErrorState, LoadingState } from '@/components/common';

interface RestaurantBranchesDetailViewProps {
  restaurant: RestaurantItem;
  onBack: () => void;
  onOpenBranchDashboard?: (branch: BranchItem) => void;
}

function weekHours(openTime: string, closeTime: string) {
  return Array.from({ length: 7 }, (_, dayOfWeek) => ({
    dayOfWeek,
    openTime,
    closeTime,
  }));
}

export default function RestaurantBranchesDetailView({
  restaurant,
  onBack,
  onOpenBranchDashboard,
}: RestaurantBranchesDetailViewProps) {
  const router = useRouter();
  const { data, isLoading, isError, error, refetch } = useGetBranchesQuery({
    restaurantId: restaurant.id,
    page: 1,
    limit: 50,
  });
  const [createBranch] = useCreateBranchMutation();
  const [updateBranch] = useUpdateBranchMutation();
  const [deleteBranch] = useDeleteBranchMutation();
  const [setOperatingHours] = useSetOperatingHoursMutation();

  const branches: BranchItem[] = useMemo(
    () => (data?.data || []).map((branch) => mapBranch(branch, restaurant.name)),
    [data, restaurant.name],
  );

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<BranchItem | null>(null);
  const [deletingBranch, setDeletingBranch] = useState<BranchItem | null>(null);

  const handleCreateSubmit = async (form: BranchFormData) => {
    if (!form.name.trim()) {
      toast.error('Please enter a branch name.');
      return;
    }
    try {
      const created = await createBranch({
        restaurantId: restaurant.id,
        name: form.name.trim(),
        address: parseBranchAddress(form.address),
        phone: form.contactNumber || undefined,
      }).unwrap();
      await setOperatingHours({
        branchId: created.id,
        hours: weekHours(form.openingTime, form.closingTime),
      });
      setIsCreateOpen(false);
      toast.success(`Branch "${form.name.trim()}" created successfully!`);
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Unable to create branch.');
    }
  };

  const handleEditSubmit = async (form: BranchFormData) => {
    if (!editingBranch) return;
    if (!form.name.trim()) {
      toast.error('Branch name cannot be empty.');
      return;
    }
    try {
      await updateBranch({
        id: editingBranch.id,
        body: {
          name: form.name.trim(),
          address: parseBranchAddress(form.address),
          phone: form.contactNumber || undefined,
          isActive: form.status !== 'Closed',
        },
      }).unwrap();
      await setOperatingHours({
        branchId: editingBranch.id,
        hours: weekHours(form.openingTime, form.closingTime),
      });
      toast.success(`Branch "${form.name}" updated successfully!`);
      setEditingBranch(null);
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Unable to update branch.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingBranch) return;
    try {
      await deleteBranch(deletingBranch.id).unwrap();
      toast.success(`"${deletingBranch.name}" branch deleted.`);
      setDeletingBranch(null);
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Unable to delete branch.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <RestaurantBranchesHeader
        restaurantName={restaurant.name}
        onBack={onBack}
        onCreateBranchClick={() => setIsCreateOpen(true)}
      />

      <RestaurantSummaryBanner restaurant={{ ...restaurant, branchesCount: branches.length }} />

      <div className="flex flex-col justify-start items-start gap-1 pt-2">
        <h2 className="text-white text-lg font-semibold font-sans">Manage Branches</h2>
        <p className="text-zinc-500 text-sm font-normal font-sans leading-6">
          {branches.length} locations connected to this restaurant
        </p>
      </div>

      {isLoading && <LoadingState message="Loading branches..." />}
      {isError && (
        <ErrorState
          message={(error as any)?.data?.message || 'Unable to load branches.'}
          onRetry={() => refetch()}
        />
      )}
      {!isLoading && !isError && branches.length === 0 && (
        <EmptyState
          title="No branches yet"
          description="Add the first location for this restaurant."
          action={{ label: 'Create branch', onClick: () => setIsCreateOpen(true) }}
        />
      )}

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

      {isCreateOpen && (
        <CreateBranchModal
          restaurantName={restaurant.name}
          onClose={() => setIsCreateOpen(false)}
          onSubmit={handleCreateSubmit}
        />
      )}

      {editingBranch && (
        <EditBranchModal
          restaurantName={restaurant.name}
          branch={editingBranch}
          onClose={() => setEditingBranch(null)}
          onSubmit={handleEditSubmit}
        />
      )}

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
