import React, { useState, useMemo } from 'react';
import { X, ChevronDown, Building2, Link as LinkIcon, Image as ImageIcon, Sparkles, Check, AlertCircle } from 'lucide-react';
import { RestaurantFormData } from '../types';
import { useAppSelector } from '@/redux/store';
import { isValidHttpUrl } from '@/lib/utils';

interface CreateRestaurantModalProps {
  onClose: () => void;
  onSubmit: (data: RestaurantFormData) => void;
  submitting?: boolean;
  defaultOrganizationId?: string;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const CreateRestaurantModal: React.FC<CreateRestaurantModalProps> = ({
  onClose,
  onSubmit,
  submitting = false,
  defaultOrganizationId,
}) => {
  const organizations = useAppSelector((state) => state.tenant.organizations || []);

  const [form, setForm] = useState<RestaurantFormData>({
    organizationId: defaultOrganizationId || (organizations[0]?.id ?? ''),
    name: '',
    slug: '',
    logoUrl: '',
    status: 'Active',
    description: '',
  });

  const [isCustomOrgId, setIsCustomOrgId] = useState(false);
  const [autoSlug, setAutoSlug] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleNameChange = (val: string) => {
    setErrorMsg(null);
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
    setErrorMsg(null);
    // Allow only lowercase alphanumeric and hyphens
    const cleaned = val.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 100);
    setForm((prev) => ({ ...prev, slug: cleaned }));
  };

  const isOrgIdValid = useMemo(() => {
    if (!form.organizationId || !form.organizationId.trim()) return true; // optional (derived from actor if omitted)
    return UUID_REGEX.test(form.organizationId.trim());
  }, [form.organizationId]);

  const isSlugValid = useMemo(() => {
    if (!form.slug || !form.slug.trim()) return true; // optional
    return /^[a-z0-9-]+$/.test(form.slug.trim());
  }, [form.slug]);

  const isLogoUrlValid = useMemo(() => {
    if (!form.logoUrl || !form.logoUrl.trim()) return true; // optional
    return isValidHttpUrl(form.logoUrl.trim());
  }, [form.logoUrl]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!form.name.trim() || form.name.trim().length < 2) {
      setErrorMsg('Restaurant name must be at least 2 characters long.');
      return;
    }

    if (form.organizationId?.trim() && !UUID_REGEX.test(form.organizationId.trim())) {
      setErrorMsg('Organization ID must be a valid UUID format (e.g., 123e4567-e89b-12d3-a456-426614174000).');
      return;
    }

    if (form.slug?.trim() && !/^[a-z0-9-]+$/.test(form.slug.trim())) {
      setErrorMsg('Slug can only contain lowercase alphanumeric characters and hyphens.');
      return;
    }

    if (form.logoUrl?.trim() && !isValidHttpUrl(form.logoUrl.trim())) {
      setErrorMsg('Logo URL must be a valid public web address (e.g. https://cdn.example.com/logo.png). Localhost or relative paths are not allowed. Please enter a valid URL or leave this field blank.');
      return;
    }

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
              Enter the restaurant details below matching the Tavonza backend specification.
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

        {errorMsg && (
          <div className="w-full p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <div className="w-full p-4 bg-neutral-950/70 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-800/80 flex flex-col gap-4">
            {/* 1. Organization Selection / ID Field */}
            <div className="flex flex-col justify-start items-start gap-1.5">
              <div className="flex items-center justify-between w-full">
                <label className="text-stone-300 text-xs font-medium font-sans flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Organization</span>
                  <span className="text-[10px] text-zinc-500 font-normal">(Tenant)</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsCustomOrgId((prev) => !prev)}
                  className="text-[11px] text-yellow-400 hover:underline cursor-pointer"
                >
                  {isCustomOrgId ? '← Select from list' : 'Enter custom UUID →'}
                </button>
              </div>

              {isCustomOrgId ? (
                <div className="w-full flex flex-col gap-1">
                  <input
                    type="text"
                    placeholder="e.g. 293d1f74-9ad6-437c-b5dc-7bc362d43554"
                    value={form.organizationId || ''}
                    onChange={(e) => {
                      setErrorMsg(null);
                      setForm({ ...form, organizationId: e.target.value });
                    }}
                    className={`w-full h-10 px-3.5 bg-neutral-900 rounded-lg border text-stone-200 text-xs font-mono focus:outline-none placeholder:text-zinc-600 ${
                      !isOrgIdValid ? 'border-red-500 focus:border-red-400' : 'border-neutral-800 focus:border-amber-400'
                    }`}
                  />
                  {!isOrgIdValid && (
                    <span className="text-[10px] text-red-400">Must be a valid UUID format</span>
                  )}
                </div>
              ) : (
                <div className="w-full relative">
                  <select
                    value={form.organizationId || ''}
                    onChange={(e) => {
                      setErrorMsg(null);
                      setForm({ ...form, organizationId: e.target.value });
                    }}
                    className="w-full h-10 px-3 bg-neutral-900 rounded-lg border border-neutral-800 text-stone-300 text-xs font-medium font-sans appearance-none focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    <option value="">Auto-derive from my logged-in account (Recommended)</option>
                    {organizations.map((org) => (
                      <option key={org.id} value={org.id}>
                        {org.name} ({org.slug || org.id.slice(0, 8)})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="size-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              )}
              <span className="text-[11px] text-zinc-500 font-sans">
                Organization owning this restaurant. If omitted, it automatically attaches to your account session.
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
                  <span className="text-[10px] text-zinc-500 font-normal">(Optional)</span>
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
                className={`w-full h-10 px-3.5 bg-neutral-900 rounded-lg border text-stone-200 text-xs font-mono focus:outline-none placeholder:text-zinc-600 ${
                  !isSlugValid ? 'border-red-500 focus:border-red-400' : 'border-neutral-800 focus:border-amber-400'
                }`}
              />
              <span className="text-[11px] text-zinc-500 font-sans">
                Only lowercase alphanumeric characters and hyphens (e.g. <code className="text-amber-400/90">tasty-bites-grill</code>). Leave blank to auto-create.
              </span>
            </div>

            {/* 4. Logo URL */}
            <div className="flex flex-col justify-start items-start gap-1.5">
              <div className="flex items-center justify-between w-full">
                <label className="text-stone-300 text-xs font-medium font-sans flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Logo URL</span>
                  <span className="text-[10px] text-zinc-500 font-normal">(Optional public URL)</span>
                </label>
                {form.logoUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg(null);
                      setForm({ ...form, logoUrl: '' });
                    }}
                    className="text-[11px] text-amber-400 hover:underline cursor-pointer"
                  >
                    Clear URL
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2 w-full">
                <input
                  type="text"
                  placeholder="e.g. https://cdn.example.com/logo.png"
                  value={form.logoUrl || ''}
                  onChange={(e) => {
                    setErrorMsg(null);
                    setForm({ ...form, logoUrl: e.target.value });
                  }}
                  className={`flex-1 h-10 px-3.5 bg-neutral-900 rounded-lg border text-stone-200 text-xs font-mono focus:outline-none placeholder:text-zinc-600 ${
                    !isLogoUrlValid ? 'border-red-500 focus:border-red-400' : 'border-neutral-800 focus:border-amber-400'
                  }`}
                />
                {form.logoUrl && isValidHttpUrl(form.logoUrl) && (
                  <div className="w-10 h-10 rounded-lg border border-neutral-700 bg-neutral-900 overflow-hidden flex items-center justify-center shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={form.logoUrl.trim()}
                      alt="Logo preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
              {!isLogoUrlValid ? (
                <span className="text-[11px] text-red-400 font-sans flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  Must be a full public URL with domain (e.g. <code className="text-amber-400/90">https://cdn.example.com/logo.png</code>). Localhost or relative paths like <code className="text-stone-400">/logo.png</code> are not accepted. Or leave blank.
                </span>
              ) : (
                <span className="text-[11px] text-zinc-500 font-sans">
                  Must be a valid web address starting with <code className="text-amber-400/90">http://</code> or <code className="text-amber-400/90">https://</code>. Leave blank if no logo is available.
                </span>
              )}
            </div>

            {/* 5. Description */}
            <div className="flex flex-col justify-start items-start gap-1.5">
              <label className="text-stone-300 text-xs font-medium font-sans">
                <span>Description</span>
                <span className="text-[10px] text-zinc-500 font-normal ml-1">(Optional)</span>
              </label>
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
              disabled={submitting || !isOrgIdValid || !isSlugValid || !isLogoUrlValid}
              className="px-4 py-2.5 bg-yellow-400 hover:bg-yellow-300 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 text-neutral-900 text-sm font-semibold font-sans transition-colors cursor-pointer shadow-sm disabled:opacity-50"
            >
              {submitting ? 'Creating Restaurant…' : 'Create Restaurant'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
