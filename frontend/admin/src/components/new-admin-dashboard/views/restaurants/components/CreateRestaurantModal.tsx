import React, { useState } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { RestaurantFormData } from '../types';

interface CreateRestaurantModalProps {
  onClose: () => void;
  onSubmit: (data: RestaurantFormData) => void;
}

export const CreateRestaurantModal: React.FC<CreateRestaurantModalProps> = ({
  onClose,
  onSubmit,
}) => {
  const [form, setForm] = useState<RestaurantFormData>({
    name: '',
    manager: 'Robert Geo',
    contactNumber: '+4045017715',
    email: 'hello@tavonza.com',
    address: 'Cusseta, Georgia',
    status: 'Active',
    description: 'Modern dining with seasonal plates.',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-[560px] max-w-full p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-800 flex flex-col justify-start items-end gap-4 shadow-2xl animate-in fade-in scale-95 duration-150">
        {/* Modal Header */}
        <div className="w-full flex justify-between items-start">
          <div className="flex flex-col justify-start items-start gap-1">
            <h3 className="text-white text-lg font-medium font-sans leading-5">
              Create Restaurant
            </h3>
            <p className="text-neutral-400 text-xs font-normal font-sans leading-4">
              Complete the details below, then save your changes.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 p-2 bg-gray-300/10 hover:bg-gray-300/20 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 flex justify-center items-center text-gray-200 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Divider */}
        <div className="w-full h-0 outline outline-1 outline-offset-[-0.50px] outline-neutral-800" />

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <div className="w-full p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-800 flex flex-col justify-start items-center gap-4">
            {/* Row 1: Restaurant Name & Restaurant Manager */}
            <div className="self-stretch grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col justify-start items-start gap-2">
                <label className="text-white text-sm font-normal font-sans leading-4">
                  Restaurant Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tavonza Bistro"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="self-stretch h-11 px-3.5 py-3 bg-neutral-900 rounded-lg border border-neutral-800 text-stone-200 text-sm focus:outline-none focus:border-amber-400 font-sans"
                />
              </div>

              <div className="flex flex-col justify-start items-start gap-2">
                <label className="text-white text-sm font-normal font-sans leading-4">
                  Restaurant Manager
                </label>
                <div className="self-stretch relative">
                  <select
                    value={form.manager}
                    onChange={(e) => setForm({ ...form, manager: e.target.value })}
                    className="w-full h-11 px-3.5 py-3 bg-neutral-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 text-stone-300 text-sm font-normal font-sans appearance-none focus:outline-none focus:border-amber-400"
                  >
                    <option value="Robert Geo">Robert Geo</option>
                    <option value="Nobin Mille">Nobin Mille</option>
                    <option value="Sarah Ahmed">Sarah Ahmed</option>
                    <option value="Alex Thorne">Alex Thorne</option>
                  </select>
                  <ChevronDown className="size-4 text-stone-300 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Row 2: Contact Number & Email */}
            <div className="self-stretch grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col justify-start items-start gap-2">
                <label className="text-white text-sm font-normal font-sans leading-4">
                  Contact Number
                </label>
                <input
                  type="text"
                  value={form.contactNumber}
                  onChange={(e) => setForm({ ...form, contactNumber: e.target.value })}
                  placeholder="+4045017715"
                  className="self-stretch h-11 px-3.5 py-3 bg-neutral-900 rounded-lg border border-neutral-800 text-stone-200 text-sm focus:outline-none focus:border-amber-400 font-sans"
                />
              </div>

              <div className="flex flex-col justify-start items-start gap-2">
                <label className="text-white text-sm font-normal font-sans leading-4">
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="hello@tavonza.com"
                  className="self-stretch h-11 px-3.5 py-3 bg-neutral-900 rounded-lg border border-neutral-800 text-stone-200 text-sm focus:outline-none focus:border-amber-400 font-sans"
                />
              </div>
            </div>

            {/* Row 3: Address & Status */}
            <div className="self-stretch grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col justify-start items-start gap-2">
                <label className="text-white text-sm font-normal font-sans leading-4">
                  Address
                </label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Cusseta, Georgia"
                  className="self-stretch h-11 px-3.5 py-3 bg-neutral-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 text-stone-200 text-sm focus:outline-none focus:border-amber-400 font-sans"
                />
              </div>

              <div className="flex flex-col justify-start items-start gap-2">
                <label className="text-white text-sm font-normal font-sans leading-4">
                  Status
                </label>
                <div className="self-stretch relative">
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        status: e.target.value as 'Active' | 'Setup' | 'Closed',
                      })
                    }
                    className="w-full h-11 px-3.5 py-3 bg-neutral-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 text-stone-300 text-sm font-normal font-sans appearance-none focus:outline-none focus:border-amber-400"
                  >
                    <option value="Active">Active</option>
                    <option value="Setup">Setup</option>
                    <option value="Closed">Closed</option>
                  </select>
                  <ChevronDown className="size-4 text-stone-300 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Row 4: Description */}
            <div className="self-stretch flex flex-col justify-start items-start gap-2">
              <label className="text-white text-sm font-normal font-sans leading-4">
                Description
              </label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Modern dining with seasonal plates."
                className="self-stretch h-24 px-3.5 py-3 bg-neutral-950 rounded-lg border border-neutral-800 text-stone-200 text-sm focus:outline-none focus:border-amber-400 resize-none font-sans"
              />
            </div>
          </div>

          {/* Modal Footer Buttons */}
          <div className="inline-flex justify-end items-center gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 text-white text-base font-medium font-sans leading-5 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-2.5 bg-yellow-400 hover:bg-yellow-300 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 text-neutral-800 text-base font-medium font-sans leading-5 transition-colors cursor-pointer shadow-sm"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
