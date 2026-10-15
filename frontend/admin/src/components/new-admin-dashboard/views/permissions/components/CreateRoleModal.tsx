import React, { useState } from 'react';
import { X, ShieldPlus, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useCreateRoleMutation, useGetPermissionsQuery } from '@/redux/features/roleApi';

interface CreateRoleModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export const CreateRoleModal: React.FC<CreateRoleModalProps> = ({ onClose, onSuccess }) => {
  const [createRole, { isLoading }] = useCreateRoleMutation();
  const { data: permissionsData, isLoading: loadingPerms } = useGetPermissionsQuery();

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const grouped = permissionsData?.grouped || {};
  const modules = Object.keys(grouped);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!slug || slug === name.toLowerCase().replace(/[^a-z0-9]+/g, '-')) {
      setSlug(val.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-'));
    }
  };

  const togglePermission = (key: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const toggleModuleAll = (moduleName: string) => {
    const keys = (grouped[moduleName] || []).map((p) => p.permissionKey);
    const allSelected = keys.every((k) => selectedPermissions.includes(k));
    if (allSelected) {
      setSelectedPermissions((prev) => prev.filter((k) => !keys.includes(k)));
    } else {
      setSelectedPermissions((prev) => Array.from(new Set([...prev, ...keys])));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Role name is required');
      return;
    }

    try {
      await createRole({
        name: name.trim(),
        slug: slug.trim() || undefined,
        description: description.trim() || undefined,
        permissionKeys: selectedPermissions,
      }).unwrap();

      toast.success(`Role "${name.trim()}" created successfully!`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to create role');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-neutral-900 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-zinc-800 flex items-center justify-between bg-neutral-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
              <ShieldPlus className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white font-['Inter']">Create New Dynamic Role</h2>
              <p className="text-xs text-neutral-400 font-['Inter']">
                Define role metadata and assign atomic permissions across system modules.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5 font-['Inter']">
                Role Name <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Shift Floor Supervisor"
                className="w-full h-10 px-3.5 bg-neutral-950 rounded-lg border border-zinc-800 text-stone-200 text-sm focus:outline-none focus:border-amber-400 font-['Inter']"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5 font-['Inter']">
                Slug Identifier
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="shift-floor-supervisor"
                className="w-full h-10 px-3.5 bg-neutral-950 rounded-lg border border-zinc-800 text-stone-200 text-sm focus:outline-none focus:border-amber-400 font-mono text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5 font-['Inter']">
              Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of responsibilities for this role..."
              className="w-full p-3 bg-neutral-950 rounded-lg border border-zinc-800 text-stone-200 text-sm focus:outline-none focus:border-amber-400 font-['Inter'] resize-none"
            />
          </div>

          {/* Permissions Matrix Picker */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-medium text-neutral-300 font-['Inter']">
                Assign System Capabilities ({selectedPermissions.length} selected)
              </label>
              <button
                type="button"
                onClick={() => {
                  const allKeys = permissionsData?.permissions?.map((p) => p.permissionKey) || [];
                  setSelectedPermissions((prev) => (prev.length === allKeys.length ? [] : allKeys));
                }}
                className="text-xs text-amber-400 hover:text-amber-300 font-medium cursor-pointer"
              >
                {selectedPermissions.length === (permissionsData?.permissions?.length || 0)
                  ? 'Deselect All'
                  : 'Select All Capabilities'}
              </button>
            </div>

            {loadingPerms ? (
              <div className="p-8 flex items-center justify-center text-zinc-500 gap-2">
                <Loader2 className="size-4 animate-spin" /> Loading permissions...
              </div>
            ) : modules.length === 0 ? (
              <div className="p-4 text-center text-zinc-500 text-sm border border-zinc-800 rounded-lg">
                No permissions declared in catalog.
              </div>
            ) : (
              <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
                {modules.map((mod) => {
                  const items = grouped[mod] || [];
                  const modKeys = items.map((i) => i.permissionKey);
                  const allModSelected = modKeys.length > 0 && modKeys.every((k) => selectedPermissions.includes(k));

                  return (
                    <div key={mod} className="p-3.5 bg-neutral-950 rounded-xl border border-zinc-800/80">
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800/60">
                        <span className="text-sm font-semibold text-zinc-200 uppercase tracking-wider font-['Inter']">
                          {mod}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleModuleAll(mod)}
                          className="text-xs text-zinc-400 hover:text-white transition-colors"
                        >
                          {allModSelected ? 'Deselect Module' : 'Select All'}
                        </button>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {items.map((perm) => {
                          const isChecked = selectedPermissions.includes(perm.permissionKey);
                          return (
                            <button
                              key={perm.id}
                              type="button"
                              onClick={() => togglePermission(perm.permissionKey)}
                              className={`p-2 rounded-lg border text-left flex items-center justify-between gap-1.5 transition-all text-xs ${
                                isChecked
                                  ? 'bg-amber-400/10 border-amber-400/40 text-amber-300 font-medium'
                                  : 'bg-neutral-900 border-zinc-800 text-neutral-400 hover:border-zinc-700'
                              }`}
                            >
                              <span className="truncate">{perm.action}</span>
                              <div
                                className={`size-3.5 rounded flex items-center justify-center shrink-0 ${
                                  isChecked ? 'bg-amber-400 text-black' : 'border border-zinc-700'
                                }`}
                              >
                                {isChecked && <Check className="size-2.5 stroke-[3]" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-sm text-neutral-300 font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-neutral-900 font-semibold rounded-lg text-sm transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              {isLoading && <Loader2 className="size-4 animate-spin" />}
              {isLoading ? 'Creating Role...' : 'Create Role'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRoleModal;
