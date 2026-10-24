'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { useOrganizationId } from '@/hooks/useOrganizationId';
import {
  useCreateRestaurantMutation,
  useDeleteRestaurantMutation,
  useGetBranchesQuery,
  useGetRestaurantQuery,
  useGetRestaurantsQuery,
  useUpdateRestaurantMutation,
} from '@/redux/features/adminApi';
import { mapRestaurant } from '@/lib/admin-mappers';
import { EmptyState, ErrorState, LoadingState, PaginationBar } from '@/components/common';
import { ApiError } from '@/redux/api/baseApi';
import { useClampPage, useListPagination } from '@/hooks/useListPagination';
import { isValidHttpUrl } from '@/lib/utils';

interface RestaurantsViewProps {
  initialRestaurantId?: string;
}

export default function RestaurantsView({ initialRestaurantId }: RestaurantsViewProps = {}) {
  const router = useRouter();
  const organizationId = useOrganizationId();
  const isDetail = Boolean(initialRestaurantId);

  const { page, limit, setPage } = useListPagination({ enabled: !isDetail });
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetRestaurantsQuery(
    { organizationId: organizationId || undefined, page, limit },
    { skip: isDetail },
  );
  useClampPage(page, data?.meta?.totalPages, setPage);
  const { data: branchesData } = useGetBranchesQuery(
    { page: 1, limit: 100 },
    { skip: isDetail || !organizationId },
  );
  const detailQuery = useGetRestaurantQuery(initialRestaurantId || '', { skip: !isDetail });

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

  const detailRestaurant = useMemo(() => {
    if (!detailQuery.data?.id) return null;
    return mapRestaurant(detailQuery.data, 0);
  }, [detailQuery.data]);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<RestaurantItem | null>(null);
  const [deletingRestaurant, setDeletingRestaurant] = useState<RestaurantItem | null>(null);

  const handleSelectRestaurant = (rest: RestaurantItem) => {
    router.push(`/new-admin-dashboard/restaurants/${rest.id}`, { scroll: false });
  };

  const handleBackToList = () => {
    router.push('/new-admin-dashboard/restaurants', { scroll: false });
  };

  const handleCreateSubmit = async (form: RestaurantFormData) => {
    if (!form.name.trim() || form.name.trim().length < 2) {
      toast.error('Restaurant name must be at least 2 characters.');
      return;
    }

    // Build strictly whitelisted payload matching backend CreateRestaurantDto
    const payload: {
      name: string;
      organizationId?: string;
      slug?: string;
      logoUrl?: string;
      description?: string;
    } = {
      name: form.name.trim(),
    };

    // 1. organizationId: must be a valid UUID, otherwise omit so backend auto-assigns
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const requestedOrgId = (form.organizationId || '').trim();
    if (requestedOrgId && uuidRegex.test(requestedOrgId)) {
      payload.organizationId = requestedOrgId;
    } else if (organizationId && uuidRegex.test(organizationId)) {
      payload.organizationId = organizationId;
    }

    // 2. slug: must be lowercase alphanumeric and hyphens only
    if (form.slug?.trim()) {
      const cleanSlug = form.slug
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      if (cleanSlug.length > 0 && /^[a-z0-9-]+$/.test(cleanSlug)) {
        payload.slug = cleanSlug;
      }
    }

    // 3. logoUrl: must be valid public URL starting with http:// or https:// with a valid domain
    if (form.logoUrl && typeof form.logoUrl === 'string') {
      const cleanUrl = form.logoUrl.trim();
      if (cleanUrl.length > 0 && isValidHttpUrl(cleanUrl)) {
        payload.logoUrl = cleanUrl;
      }
    }

    // 4. description: only if non-empty string
    if (form.description?.trim()) {
      payload.description = form.description.trim();
    }

    try {
      await createRestaurant(payload).unwrap();
      setIsCreateOpen(false);
      toast.success(`Restaurant "${payload.name}" created successfully!`);
    } catch (err: any) {
      const fieldError = Array.isArray(err?.data?.errorMessages)
        ? err.data.errorMessages.map((m: any) => m.message).join('. ')
        : null;
      const errMsg =
        fieldError ||
        err?.data?.message ||
        err?.message ||
        'Unable to create restaurant.';
      toast.error(errMsg);
    }
  };

  const handleEditSubmit = async (form: RestaurantFormData) => {
    if (!editingRestaurant) return;
    if (!form.name.trim() || form.name.trim().length < 2) {
      toast.error('Restaurant name must be at least 2 characters.');
      return;
    }

    const body: {
      name: string;
      slug?: string;
      logoUrl?: string;
      description?: string;
      isActive?: boolean;
    } = {
      name: form.name.trim(),
      isActive: form.status !== 'Closed',
    };

    if (form.slug?.trim()) {
      const cleanSlug = form.slug
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      if (cleanSlug.length > 0 && /^[a-z0-9-]+$/.test(cleanSlug)) {
        body.slug = cleanSlug;
      }
    }

    if (form.logoUrl && typeof form.logoUrl === 'string') {
      const cleanUrl = form.logoUrl.trim();
      if (cleanUrl.length > 0 && isValidHttpUrl(cleanUrl)) {
        body.logoUrl = cleanUrl;
      }
    }

    if (form.description?.trim()) {
      body.description = form.description.trim();
    }

    try {
      await updateRestaurant({
        id: editingRestaurant.id,
        body,
      }).unwrap();
      toast.success(`Restaurant "${body.name}" updated successfully!`);
      setEditingRestaurant(null);
    } catch (err: any) {
      const fieldError = Array.isArray(err?.data?.errorMessages)
        ? err.data.errorMessages.map((m: any) => m.message).join('. ')
        : null;
      const errMsg =
        fieldError ||
        err?.data?.message ||
        err?.message ||
        'Unable to update restaurant.';
      toast.error(errMsg);
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

  if (isDetail) {
    if (detailQuery.isLoading || detailQuery.isUninitialized) {
      return <LoadingState message="Loading restaurant..." />;
    }
    if (detailQuery.isError || !detailRestaurant) {
      return (
        <div className="space-y-4">
          <button
            type="button"
            onClick={handleBackToList}
            className="text-neutral-400 hover:text-white text-xs font-semibold"
          >
            Back to restaurants
          </button>
          <ErrorState
            message={(detailQuery.error as any)?.data?.message || 'Unable to load this restaurant.'}
            onRetry={() => detailQuery.refetch()}
          />
        </div>
      );
    }
    return (
      <RestaurantBranchesDetailView
        restaurant={detailRestaurant}
        onBack={handleBackToList}
        onOpenBranchDashboard={(branch) => {
          router.push(`/new-admin-dashboard/branches/${branch.id}/overview`);
        }}
      />
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <RestaurantsHeader onCreateClick={() => setIsCreateOpen(true)} />

      {isLoading && <LoadingState message="Loading restaurants..." />}

      {isError && (
        <ErrorState
          message={(error as any)?.data?.message || 'Unable to load restaurants.'}
          onRetry={() => refetch()}
        />
      )}

      {!isLoading && !isError && restaurants.length === 0 && (
        <EmptyState
          title="No restaurants yet"
          description="Create the first restaurant under this organization."
          action={{ label: 'Create restaurant', onClick: () => setIsCreateOpen(true) }}
        />
      )}

      {!isLoading && restaurants.length > 0 && (
        <div className="space-y-4" data-testid="restaurants-list">
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
          <PaginationBar meta={data?.meta} onPageChange={setPage} />
        </div>
      )}

      {isCreateOpen && (
        <CreateRestaurantModal
          defaultOrganizationId={organizationId || undefined}
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
