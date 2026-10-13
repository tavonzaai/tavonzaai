'use client';

import React, { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { RestaurantItem } from '../types';
import RestaurantBranchesDetailView from './RestaurantBranchesDetailView';
import { RestaurantFormData } from './restaurants/types';
import {
  RestaurantsHeader,
  RestaurantCard,
  CreateRestaurantModal,
  EditRestaurantModal,
  DeleteRestaurantModal,
} from './restaurants/components';
import { useAppSelector } from '@/redux/store';
import {
  useCreateRestaurantMutation,
  useDeleteRestaurantMutation,
  useGetBranchesQuery,
  useGetRestaurantsQuery,
  useUpdateRestaurantMutation,
} from '@/redux/features/adminApi';
import { mapRestaurant } from '@/lib/admin-mappers';
import { EmptyState, ErrorState, LoadingState } from '@/components/common';
import { ApiError } from '@/redux/api/baseApi';

interface RestaurantsViewProps {
  initialRestaurantId?: string;
}

export default function RestaurantsView({ initialRestaurantId }: RestaurantsViewProps = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const organizationId = useAppSelector((state) => state.tenant.organizationId);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetRestaurantsQuery(
    { organizationId: organizationId || undefined, page: 1, limit: 50 },
    { skip: !organizationId },
  );
  const { data: branchesData } = useGetBranchesQuery(
    { page: 1, limit: 200 },
    { skip: !organizationId },
  );

  const [createRestaurant, { isLoading: creating }] = useCreateRestaurantMutation();
  const [updateRestaurant, { isLoading: updating }] = useUpdateRestaurantMutation();
  const [deleteRestaurant, { isLoading: deleting }] = useDeleteRestaurantMutation();

  const restaurants: RestaurantItem[] = useMemo(() => {
    const counts = new Map<string, number>();
    (branchesData?.data || []).forEach((branch) => {
      counts.set(branch.restaurantId, (counts.get(branch.restaurantId) || 0) + 1);
    });
    return (data?.data || []).map((restaurant) =>
      mapRestaurant(restaurant, counts.get(restaurant.id) || 0),
    );
  }, [data, branchesData]);

  const selectedId =
    initialRestaurantId || searchParams.get('id') || searchParams.get('restaurant') || null;
  const detailRestaurant = selectedId
    ? restaurants.find((restaurant) => restaurant.id === selectedId) || null
    : null;

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<RestaurantItem | null>(null);
  const [deletingRestaurant, setDeletingRestaurant] = useState<RestaurantItem | null>(null);

  const handleSelectRestaurant = (rest: RestaurantItem) => {
    router.push(`/new-admin-dashboard/restaurants?id=${rest.id}`, { scroll: false });
  };

  const handleBackToList = () => {
    router.push('/new-admin-dashboard/restaurants', { scroll: false });
  };

  const handleCreateSubmit = async (form: RestaurantFormData) => {
    if (!form.name.trim()) {
      toast.error('Please enter a restaurant name.');
      return;
    }
    if (!organizationId) {
      toast.error('No organization is available for this account.');
      return;
    }
    try {
      await createRestaurant({
        organizationId,
        name: form.name.trim(),
        description: form.description.trim() || undefined,
      }).unwrap();
      setIsCreateOpen(false);
      toast.success(`Restaurant "${form.name.trim()}" created successfully!`);
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Unable to create restaurant.');
    }
  };

  const handleEditSubmit = async (form: RestaurantFormData) => {
    if (!editingRestaurant) return;
    if (!form.name.trim()) {
      toast.error('Restaurant name cannot be empty.');
      return;
    }
    try {
      await updateRestaurant({
        id: editingRestaurant.id,
        body: {
          name: form.name.trim(),
          description: form.description.trim() || undefined,
          isActive: form.status !== 'Closed',
        },
      }).unwrap();
      toast.success(`Restaurant "${form.name}" updated successfully!`);
      setEditingRestaurant(null);
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Unable to update restaurant.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingRestaurant) return;
    try {
      await deleteRestaurant(deletingRestaurant.id).unwrap();
      toast.success(`"${deletingRestaurant.name}" has been deleted.`);
      setDeletingRestaurant(null);
      if (detailRestaurant?.id === deletingRestaurant.id) {
        handleBackToList();
      }
    } catch (err: any) {
      const apiErr = err as ApiError;
      toast.error(apiErr?.data?.message || apiErr?.message || 'Unable to delete restaurant.');
    }
  };

  if (detailRestaurant) {
    return (
      <RestaurantBranchesDetailView
        restaurant={detailRestaurant}
        onBack={handleBackToList}
        onOpenBranchDashboard={(branch) => {
          router.push(`/new-admin-dashboard/branches?branchId=${branch.id}`);
        }}
      />
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <RestaurantsHeader onCreateClick={() => setIsCreateOpen(true)} />

      {!organizationId && (
        <ErrorState
          title="Organization required"
          message="This admin account has no organization yet. Super Admin can create one, then refresh."
        />
      )}

      {organizationId && isLoading && <LoadingState message="Loading restaurants..." />}

      {organizationId && isError && (
        <ErrorState
          message={(error as any)?.data?.message || 'Unable to load restaurants.'}
          onRetry={() => refetch()}
        />
      )}

      {organizationId && !isLoading && !isError && restaurants.length === 0 && (
        <EmptyState
          title="No restaurants yet"
          description="Create the first restaurant under this organization."
          action={{ label: 'Create restaurant', onClick: () => setIsCreateOpen(true) }}
        />
      )}

      {organizationId && !isLoading && restaurants.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {restaurants.map((rest) => (
            <RestaurantCard
              key={rest.id}
              restaurant={rest}
              onSelect={handleSelectRestaurant}
              onEdit={(r) => setEditingRestaurant(r)}
              onDelete={(r) => setDeletingRestaurant(r)}
            />
          ))}
        </div>
      )}

      {isCreateOpen && (
        <CreateRestaurantModal
          onClose={() => setIsCreateOpen(false)}
          onSubmit={handleCreateSubmit}
          submitting={creating}
        />
      )}

      {editingRestaurant && (
        <EditRestaurantModal
          restaurant={editingRestaurant}
          onClose={() => setEditingRestaurant(null)}
          onSubmit={handleEditSubmit}
          submitting={updating}
        />
      )}

      {deletingRestaurant && (
        <DeleteRestaurantModal
          restaurant={deletingRestaurant}
          onClose={() => setDeletingRestaurant(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
}
