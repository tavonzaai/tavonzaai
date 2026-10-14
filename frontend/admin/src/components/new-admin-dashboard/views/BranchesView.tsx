'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { BranchItem, RestaurantItem } from '../types';
import { BranchFormData } from './branches/types';
import { branchDetailPath } from './branch-dashboard/sections';
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
import { EmptyState, ErrorState, LoadingState, PaginationBar } from '@/components/common';
import { useClampPage, useListPagination } from '@/hooks/useListPagination';

interface BranchesViewProps {
  onBack?: () => void;
}

function weekHours(openTime: string, closeTime: string) {
  return Array.from({ length: 7 }, (_, dayOfWeek) => ({
    dayOfWeek,
    openTime,
    closeTime,
  }));
}

export default function BranchesView({ onBack }: BranchesViewProps = {}) {
  const router = useRouter();
  const organizationId = useOrganizationId();
  const [searchQuery, setSearchQuery] = useState('');
  const { page, limit, setPage, resetPage } = useListPagination();

  const { data: restaurantsData } = useGetRestaurantsQuery(
    { organizationId: organizationId || undefined, page: 1, limit: 100 },
    { skip: !organizationId },
  );
  const { data, isLoading, isError, error, refetch } = useGetBranchesQuery({
    page,
    limit,
    search: searchQuery || undefined,
    organizationId: organizationId || undefined,
  });
  useClampPage(page, data?.meta?.totalPages, setPage);
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

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<BranchItem | null>(null);
  const [deletingBranch, setDeletingBranch] = useState<BranchItem | null>(null);

  const handleViewBranch = (branch: BranchItem) => {
    router.push(branchDetailPath(branch.id), { scroll: false });
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
          <BranchesSearch
            searchQuery={searchQuery}
            onSearchChange={(value) => {
              setSearchQuery(value);
              if (page !== 1) resetPage();
            }}
          />
          {branches.length === 0 ? (
            <EmptyState
              title="No branches yet"
              description="Create a restaurant first, then add its locations."
              action={{ label: 'Create branch', onClick: () => setIsCreateOpen(true) }}
            />
          ) : (
            <div className="space-y-4" data-testid="branches-list">
              <BranchesTable
                branches={branches}
                onViewBranch={handleViewBranch}
                onEditBranch={(b) => setEditingBranch(b)}
                onDeleteBranch={(b) => setDeletingBranch(b)}
              />
              <PaginationBar meta={data?.meta} onPageChange={setPage} />
            </div>
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
