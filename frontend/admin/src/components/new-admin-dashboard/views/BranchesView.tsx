'use client';

import React, { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { BranchItem, RestaurantItem } from '../types';
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
import {
  useCreateBranchMutation,
  useDeleteBranchMutation,
  useGetBranchesQuery,
  useGetRestaurantsQuery,
  useSetOperatingHoursMutation,
  useUpdateBranchMutation,
} from '@/redux/features/adminApi';
import { useOrganizationId } from '@/hooks/useOrganizationId';
import { mapBranch, mapRestaurant, parseBranchAddress } from '@/lib/admin-mappers';
import { EmptyState, ErrorState, LoadingState } from '@/components/common';

interface BranchesViewProps {
  onBack?: () => void;
  initialBranchId?: string;
}

function weekHours(openTime: string, closeTime: string) {
  return Array.from({ length: 7 }, (_, dayOfWeek) => ({
    dayOfWeek,
    openTime,
    closeTime,
  }));
}

export default function BranchesView({ onBack, initialBranchId }: BranchesViewProps = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const organizationId = useOrganizationId();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: restaurantsData } = useGetRestaurantsQuery(
    { organizationId: organizationId || undefined, page: 1, limit: 50 },
    { skip: !organizationId },
  );
  const { data, isLoading, isError, error, refetch } = useGetBranchesQuery(
    { page: 1, limit: 100, search: searchQuery || undefined },
    { skip: !organizationId },
  );
  const [createBranch] = useCreateBranchMutation();
  const [updateBranch] = useUpdateBranchMutation();
  const [deleteBranch] = useDeleteBranchMutation();
  const [setOperatingHours] = useSetOperatingHoursMutation();

  const restaurants: RestaurantItem[] = useMemo(
    () => (restaurantsData?.data || []).map((restaurant) => mapRestaurant(restaurant, 0)),
    [restaurantsData],
  );
  const restaurantNames = useMemo(() => {
    const map = new Map<string, string>();
    restaurants.forEach((restaurant) => map.set(restaurant.id, restaurant.name));
    return map;
  }, [restaurants]);

  const branches: BranchItem[] = useMemo(
    () =>
      (data?.data || []).map((branch) =>
        mapBranch(branch, restaurantNames.get(branch.restaurantId) || ''),
      ),
    [data, restaurantNames],
  );

  const selectedId =
    initialBranchId || searchParams.get('branchId') || searchParams.get('branch') || null;
  const selectedBranch = selectedId
    ? branches.find((branch) => branch.id === selectedId) || null
    : null;

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<BranchItem | null>(null);
  const [deletingBranch, setDeletingBranch] = useState<BranchItem | null>(null);

  const handleViewBranch = (branch: BranchItem) => {
    router.push(`/new-admin-dashboard/branches?branchId=${branch.id}`, { scroll: false });
  };

  const handleBack = () => {
    if (onBack) onBack();
    else router.push('/new-admin-dashboard/restaurants');
  };

  const handleCreateSubmit = async (form: BranchFormData) => {
    if (!form.name.trim()) {
      toast.error('Please enter a branch name.');
      return;
    }
    try {
      const created = await createBranch({
        restaurantId: form.restaurantId,
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

  if (selectedBranch) {
    return (
      <BranchDashboardView
        branch={selectedBranch}
        onBack={() => router.push('/new-admin-dashboard/branches', { scroll: false })}
        onUpdateBranch={() => undefined}
      />
    );
  }

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-300">
      <BranchesHeader onBack={handleBack} onCreateBranchClick={() => setIsCreateOpen(true)} />

      {isLoading && <LoadingState message="Loading branches..." />}
      {isError && (
        <ErrorState
          message={(error as any)?.data?.message || 'Unable to load branches.'}
          onRetry={() => refetch()}
        />
      )}

      {!isLoading && !isError && (
        <>
          {branches.length > 4 && (
            <BranchesSearch searchQuery={searchQuery} onSearchChange={setSearchQuery} />
          )}
          {branches.length === 0 ? (
            <EmptyState
              title="No branches yet"
              description="Create a restaurant first, then add its locations."
              action={{ label: 'Create branch', onClick: () => setIsCreateOpen(true) }}
            />
          ) : (
            <BranchesTable
              branches={branches}
              onViewBranch={handleViewBranch}
              onEditBranch={(b) => setEditingBranch(b)}
              onDeleteBranch={(b) => setDeletingBranch(b)}
            />
          )}
        </>
      )}

      {isCreateOpen && (
        <CreateBranchModal
          restaurants={restaurants}
          onClose={() => setIsCreateOpen(false)}
          onSubmit={handleCreateSubmit}
        />
      )}

      {editingBranch && (
        <EditBranchModal
          branch={editingBranch}
          restaurants={restaurants}
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
