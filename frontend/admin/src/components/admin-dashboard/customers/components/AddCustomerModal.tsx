'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import { Customer, CustomerSegment } from '../types';

export interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (newCustomer: Omit<Customer, 'id'>) => void;
}

export interface AddCustomerFormData {
  name: string;
  email: string;
  phone: string;
  segment: CustomerSegment;
  notes: string;
}

export default function AddCustomerModal({
  isOpen,
  onClose,
  onAdd,
}: AddCustomerModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddCustomerFormData>({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      segment: 'New',
      notes: '',
    },
  });

  if (!isOpen) return null;

  const onSubmit = (data: AddCustomerFormData) => {
    onAdd({
      name: data.name.trim(),
      email: data.email.trim() || `${data.name.toLowerCase().replace(/\s+/g, '')}@email.com`,
      phone: data.phone.trim() || '+1 (555) 000-0000',
      segment: data.segment,
      visits: 1,
      totalSpent: 0,
      rating: 5.0,
      lastVisit: 'Today',
      memberSince: 'Aug 2026',
      notes: data.notes.trim() || 'New customer registration.',
    });

    reset();
    onClose();
  };

  const segments: CustomerSegment[] = ['New', 'Regular', 'VIP'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-[440px] bg-[#141416] border border-zinc-800 rounded-2xl shadow-2xl flex flex-col font-['Inter'] animate-in zoom-in-95 duration-150 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <h3 className="text-white text-lg font-bold font-['Plus_Jakarta_Sans']">
            Add New Customer
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="size-7 rounded-lg bg-zinc-800/80 border border-zinc-700/80 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Form Body using React Hook Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 text-sm">
          {/* Full Name * */}
          <div className="space-y-1.5">
            <label className="text-white text-sm font-medium">Full Name *</label>
            <input
              {...register('name', { required: 'Full name is required' })}
              type="text"
              placeholder="e.g. Alice Walker"
              className={`w-full h-10 px-3.5 bg-zinc-800/90 rounded-xl border text-stone-200 text-sm focus:outline-none transition-colors placeholder-zinc-500 ${
                errors.name ? 'border-red-500 focus:border-red-500' : 'border-zinc-700/70 focus:border-amber-500'
              }`}
              autoFocus
            />
            {errors.name && (
              <p className="text-xs text-red-400 font-medium">{errors.name.message}</p>
            )}
          </div>

          {/* Email & Phone Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-white text-sm font-medium">Email</label>
              <input
                {...register('email')}
                type="email"
                placeholder="customer@email.com"
                className="w-full h-10 px-3.5 bg-zinc-800/90 rounded-xl border border-zinc-700/70 text-stone-200 text-sm focus:outline-none focus:border-amber-500 transition-colors placeholder-zinc-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-white text-sm font-medium">Phone</label>
              <input
                {...register('phone')}
                type="text"
                placeholder="+1 (555) 000-0000"
                className="w-full h-10 px-3.5 bg-zinc-800/90 rounded-xl border border-zinc-700/70 text-stone-200 text-sm focus:outline-none focus:border-amber-500 transition-colors placeholder-zinc-500"
              />
            </div>
          </div>

          {/* Customer Segment */}
          <div className="space-y-1.5">
            <label className="text-white text-sm font-medium">Segment</label>
            <div className="grid grid-cols-3 gap-2">
              {segments.map((seg) => (
                <label
                  key={seg}
                  className="flex items-center justify-center py-2 px-3 bg-zinc-800/80 border border-zinc-700/70 rounded-xl cursor-pointer hover:bg-zinc-700/80 has-[:checked]:border-amber-500 has-[:checked]:bg-amber-500/10 has-[:checked]:text-amber-400 text-zinc-300 text-xs font-semibold transition-all"
                >
                  <input
                    {...register('segment')}
                    type="radio"
                    value={seg}
                    className="sr-only"
                  />
                  {seg}
                </label>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-white text-sm font-medium">Notes & Preferences</label>
            <textarea
              {...register('notes')}
              rows={2}
              placeholder="e.g. Prefers corner booth, loves Cabernet..."
              className="w-full p-3 bg-zinc-800/90 rounded-xl border border-zinc-700/70 text-stone-200 text-sm focus:outline-none focus:border-amber-500 transition-colors placeholder-zinc-500 resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-zinc-400 hover:text-white transition-colors cursor-pointer text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-xl text-sm transition-colors shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              Create Customer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
