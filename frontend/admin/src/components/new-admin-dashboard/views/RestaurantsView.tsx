'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { MOCK_RESTAURANTS } from '../data';
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

interface RestaurantsViewProps {
  initialRestaurantId?: string;
}

export default function RestaurantsView({ initialRestaurantId }: RestaurantsViewProps = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [restaurants, setRestaurants] = useState<RestaurantItem[]>(MOCK_RESTAURANTS);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<RestaurantItem | null>(null);
  const [deletingRestaurant, setDeletingRestaurant] = useState<RestaurantItem | null>(null);
  const [detailRestaurant, setDetailRestaurant] = useState<RestaurantItem | null>(() => {
    if (initialRestaurantId) {
      return (
        MOCK_RESTAURANTS.find(
          (r) =>
            r.id.toLowerCase() === initialRestaurantId.toLowerCase() ||
            r.name.toLowerCase().includes(initialRestaurantId.toLowerCase().slice(0, 7))
        ) || null
      );
    }
    return null;
  });

  // Sync with searchParams if ?id=rest-1 or ?restaurant=...
  useEffect(() => {
    const idParam = searchParams.get('id') || searchParams.get('restaurant');
    if (idParam) {
      const found = restaurants.find(
        (r) =>
          r.id.toLowerCase() === idParam.toLowerCase() ||
          r.name.toLowerCase().includes(idParam.toLowerCase().slice(0, 7))
      );
      if (found) {
        setDetailRestaurant(found);
      }
    }
  }, [searchParams, restaurants]);

  const handleSelectRestaurant = (rest: RestaurantItem) => {
    setDetailRestaurant(rest);
    router.push(`/new-admin-dashboard/restaurants?id=${rest.id}`, { scroll: false });
  };

  const handleBackToList = () => {
    setDetailRestaurant(null);
    router.push('/new-admin-dashboard/restaurants', { scroll: false });
  };

  // Submit Create Restaurant
  const handleCreateSubmit = (form: RestaurantFormData) => {
    if (!form.name.trim()) {
      toast.error('Please enter a restaurant name.');
      return;
    }

    const newRest: RestaurantItem = {
      id: `rest-${Date.now()}`,
      name: form.name.trim(),
      description: form.description.trim(),
      tagline: form.description.trim(),
      cuisine: 'Contemporary Hospitality',
      manager: form.manager,
      contactNumber: form.contactNumber,
      email: form.email,
      address: form.address,
      city: form.address.split(',')[0] || 'Metro',
      branchesCount: 1,
      staffCount: 12,
      monthlyRevenue: '$35,000',
      rating: 5.0,
      status: form.status,
    };

    setRestaurants([newRest, ...restaurants]);
    setIsCreateOpen(false);
    toast.success(`Restaurant "${newRest.name}" created successfully!`);
  };

  // Submit Edit Restaurant
  const handleEditSubmit = (form: RestaurantFormData) => {
    if (!editingRestaurant) return;
    if (!form.name.trim()) {
      toast.error('Restaurant name cannot be empty.');
      return;
    }

    setRestaurants((prev) =>
      prev.map((r) =>
        r.id === editingRestaurant.id
          ? {
              ...r,
              name: form.name.trim(),
              manager: form.manager,
              contactNumber: form.contactNumber,
              email: form.email,
              address: form.address,
              status: form.status,
              description: form.description,
              tagline: form.description,
            }
          : r
      )
    );
    toast.success(`Restaurant "${form.name}" updated successfully!`);
    setEditingRestaurant(null);
  };

  // Confirm Delete Restaurant
  const handleConfirmDelete = () => {
    if (!deletingRestaurant) return;
    const deletedName = deletingRestaurant.name;
    setRestaurants((prev) => prev.filter((r) => r.id !== deletingRestaurant.id));
    toast.success(`"${deletedName}" has been permanently deleted.`);
    setDeletingRestaurant(null);
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
      {/* Header */}
      <RestaurantsHeader onCreateClick={() => setIsCreateOpen(true)} />

      {/* Restaurants Cards Grid */}
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

      {/* Create Modal */}
      {isCreateOpen && (
        <CreateRestaurantModal
          onClose={() => setIsCreateOpen(false)}
          onSubmit={handleCreateSubmit}
        />
      )}

      {/* Edit Modal */}
      {editingRestaurant && (
        <EditRestaurantModal
          restaurant={editingRestaurant}
          onClose={() => setEditingRestaurant(null)}
          onSubmit={handleEditSubmit}
        />
      )}

      {/* Delete Modal */}
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
