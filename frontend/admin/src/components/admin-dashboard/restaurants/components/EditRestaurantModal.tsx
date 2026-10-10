'use client';

import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { RestaurantBranch, RestaurantType, RestaurantStatus } from '../types';
import { restaurantService } from '@/redux/features/restaurantApi';

interface EditRestaurantModalProps {
  restaurant: RestaurantBranch | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: RestaurantBranch) => void;
}

export default function EditRestaurantModal({
  restaurant,
  isOpen,
  onClose,
  onSave,
}: EditRestaurantModalProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<RestaurantType>('Restaurant');
  const [status, setStatus] = useState<RestaurantStatus>('Open');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');

  useEffect(() => {
    if (restaurant) {
      setName(restaurant.name);
      setType(restaurant.type);
      setStatus(restaurant.status);
      setPhone(restaurant.phone || '');
      setEmail(restaurant.email || '');
      setAddress(restaurant.address || '');
      setCity(restaurant.city || '');
      setCountry(restaurant.country || '');
    }
  }, [restaurant]);

  if (!isOpen || !restaurant) return null;

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (restaurant.id && !restaurant.id.startsWith('rest-')) {
        await restaurantService
          .updateRestaurant(restaurant.id, {
            name: name.trim() || restaurant.name,
          })
          .catch(() => null);
      }
    } catch (err) {
      console.warn('Update restaurant API error:', err);
    }

    onSave({
      ...restaurant,
      name: name.trim() || restaurant.name,
      type,
      status,
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
      city: city.trim(),
      country: country.trim(),
    });
    onClose();
  };

  return (
    <div
      className="fixed top-20 left-0 md:left-64 right-0 bottom-0 z-40 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg max-h-[calc(100vh-6.5rem)] bg-neutral-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto"
      >
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Edit Restaurant</h2>
            <p className="text-xs text-zinc-400 mt-0.5">Update location and operational metadata</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300">Restaurant Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-10 px-3 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as RestaurantType)}
                className="w-full h-10 px-3 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
              >
                <option value="Restaurant">Restaurant</option>
                <option value="Café">Café</option>
                <option value="Bar">Bar</option>
                <option value="Fast Food">Fast Food</option>
                <option value="Bakery">Bakery</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as RestaurantStatus)}
                className="w-full h-10 px-3 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
              >
                <option value="Open">Open</option>
                <option value="Closed">Closed</option>
                <option value="Opening Soon">Opening Soon</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300">Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full h-10 px-3 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full h-10 px-3 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">Country</label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full h-10 px-3 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full h-10 px-3 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-10 px-3 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-white text-xs font-semibold rounded-xl transition-colors shadow-md shadow-amber-500/20"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
