import React, { useState } from 'react';
import { X, ChevronDown, Building2, Link as LinkIcon, Image as ImageIcon, Sparkles } from 'lucide-react';
import { RestaurantFormData } from '../types';

interface CreateRestaurantModalProps {
  onClose: () => void;
  onSubmit: (data: RestaurantFormData) => void;
  submitting?: boolean;
  defaultOrganizationId?: string;
}

export const CreateRestaurantModal: React.FC<CreateRestaurantModalProps> = ({
  onClose,
  onSubmit,
  submitting = false,
  defaultOrganizationId,
}) => {
  const [form, setForm] = useState<RestaurantFormData>({
    organizationId: defaultOrganizationId || '',
    name: '',
    slug: '',
    logoUrl: '',
    status: 'Active',
    description: '',
  });

  const [autoSlug, setAutoSlug] = useState(true);

  const handleNameChange = (val: string) => {
    const updated: Partial<RestaurantFormData> = { name: val };
    if (autoSlug) {
      updated.slug = val
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 100);
    }
    setForm((prev) => ({ ...prev, ...updated }));
  };

  const handleSlugChange = (val: string) => {
    setAutoSlug(false);
    // Allow only lowercase alphanumeric and hyphens
    const cleaned = val.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 100);
    setForm((prev) => ({ ...prev, slug: cleaned }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-[620px] max-w-full p-5 bg-neutral-900 rounded-2xl outline outline-1 outline-offset-[-1px] outline-neutral-800 flex flex-col justify-start items-end gap-4 shadow-2xl animate-in fade-in scale-95 duration-150">
        <div className="w-full flex justify-between items-start">
          <div className="flex flex-col justify-start items-start gap-1">
            <h3 className="text-white text-lg font-semibold font-sans leading-5 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-yellow-400" />
              <span>Create Restaurant</span>
            </h3>
            <p className="text-neutral-400 text-xs font-normal font-sans leading-4">
              Enter the restaurant details below matching the Tavonza platform specification.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 p-2 bg-neutral-800 hover:bg-neutral-750 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 flex justify-center items-center text-gray-200 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="w-full h-0 outline outline-1 outline-offset-[-0.50px] outline-neutral-800" />

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <div className="w-full p-4 bg-neutral-950/70 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-800/80 flex flex-col gap-4">
            {/* 1. Organization ID Field */}
            <div className="flex flex-col justify-start items-start gap-1.5">
              <label className="text-stone-300 text-xs font-medium font-sans flex items-center gap-1.5">
                <span>Organization ID</span>
                <span className="text-[10px] text-zinc-500 font-normal">(UUID)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. a1b2c3d4-e5f6-7890-abcd-ef1234567890"
                value={form.organizationId || ''}
                onChange={(e) => setForm({ ...form, organizationId: e.target.value })}
                className="w-full h-10 px-3.5 bg-neutral-900 rounded-lg border border-neutral-800 text-stone-200 text-xs font-mono focus:outline-none focus:border-amber-400 placeholder:text-zinc-600"
              />
              <span className="text-[11px] text-zinc-500 font-sans">
                Organization owning this restaurant. Pre-filled from current tenant or specify target org.
              </span>
            </div>

            {/* 2. Restaurant Name & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 flex flex-col justify-start items-start gap-1.5">
                <label className="text-stone-300 text-xs font-medium font-sans flex items-center gap-1">
                  <span>Restaurant Name</span>
                  <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  minLength={2}
                  data-testid="restaurant-name"
                  placeholder="e.g. Tasty Bites Grill & Bar"
                  value={form.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full h-10 px-3.5 bg-neutral-900 rounded-lg border border-neutral-800 text-stone-200 text-sm focus:outline-none focus:border-amber-400 font-sans placeholder:text-zinc-600"
                />
              </div>

              <div className="flex flex-col justify-start items-start gap-1.5">
                <label className="text-stone-300 text-xs font-medium font-sans">Status</label>
                <div className="w-full relative">
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.value as RestaurantFormData['status'] })
                    }
                    className="w-full h-10 px-3 bg-neutral-900 rounded-lg border border-neutral-800 text-stone-300 text-xs font-medium font-sans appearance-none focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Closed">Closed</option>
                  </select>
                  <ChevronDown className="size-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* 3. Slug (Identifier) */}
            <div className="flex flex-col justify-start items-start gap-1.5">
              <div className="flex items-center justify-between w-full">
                <label className="text-stone-300 text-xs font-medium font-sans flex items-center gap-1.5">
                  <LinkIcon className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Slug (URL Identifier)</span>
                </label>
                {autoSlug && form.name && (
                  <span className="text-[10px] text-amber-400 font-sans flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Auto-generated
                  </span>
                )}
              </div>
              <input
                type="text"
                placeholder="e.g. tasty-bites-grill"
                value={form.slug || ''}
                onChange={(e) => handleSlugChange(e.target.value)}
                className="w-full h-10 px-3.5 bg-neutral-900 rounded-lg border border-neutral-800 text-stone-200 text-xs font-mono focus:outline-none focus:border-amber-400 placeholder:text-zinc-600"
              />
              <span className="text-[11px] text-zinc-500 font-sans">
                Only lowercase alphanumeric characters and hyphens (e.g., <code className="text-amber-400/80">tasty-bites-grill</code>).
              </span>
            </div>

            {/* 4. Logo URL */}
            <div className="flex flex-col justify-start items-start gap-1.5">
              <label className="text-stone-300 text-xs font-medium font-sans flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-zinc-400" />
                <span>Logo URL</span>
                <span className="text-[10px] text-zinc-500 font-normal">(Optional image URL)</span>
              </label>
              <div className="flex items-center gap-2 w-full">
                <input
                  type="url"
                  placeholder="e.g. https://cdn.example.com/logo.png"
                  value={form.logoUrl || ''}
                  onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
                  className="flex-1 h-10 px-3.5 bg-neutral-900 rounded-lg border border-neutral-800 text-stone-200 text-xs font-mono focus:outline-none focus:border-amber-400 placeholder:text-zinc-600"
                />
                {form.logoUrl && form.logoUrl.startsWith('http') && (
                  <div className="w-10 h-10 rounded-lg border border-neutral-700 bg-neutral-900 overflow-hidden flex items-center justify-center shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={form.logoUrl}
                      alt="Logo preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* 5. Description */}
            <div className="flex flex-col justify-start items-start gap-1.5">
              <label className="text-stone-300 text-xs font-medium font-sans">Description</label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="e.g. Artisanal burgers and craft cocktails."
                className="w-full h-20 px-3.5 py-2.5 bg-neutral-900 rounded-lg border border-neutral-800 text-stone-200 text-xs focus:outline-none focus:border-amber-400 resize-none font-sans placeholder:text-zinc-600"
              />
            </div>
          </div>

          <div className="inline-flex justify-end items-center gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 text-white text-sm font-medium font-sans transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              data-testid="restaurant-submit"
              disabled={submitting}
              className="px-4 py-2.5 bg-yellow-400 hover:bg-yellow-300 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 text-neutral-900 text-sm font-semibold font-sans transition-colors cursor-pointer shadow-sm disabled:opacity-60"
            >
              {submitting ? 'Creating Restaurant…' : 'Create Restaurant'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
