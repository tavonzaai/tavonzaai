import React from 'react';
import { Plus, Save, Loader2 } from 'lucide-react';

interface PermissionsHeaderProps {
  onSaveChanges: () => void;
  onCreateRole?: () => void;
  isSaving?: boolean;
  hasUnsavedChanges?: boolean;
}

export const PermissionsHeader: React.FC<PermissionsHeaderProps> = ({
  onSaveChanges,
  onCreateRole,
  isSaving = false,
  hasUnsavedChanges = false,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex flex-col justify-start items-start gap-0.5">
        <h1 className="text-white text-3xl font-semibold font-['Inter'] leading-9">
          Dynamic Roles & Permissions
        </h1>
        <p className="text-zinc-500 text-sm font-normal font-['Inter'] leading-6">
          Manage system roles, module capability matrices, and single-role team assignments.
        </p>
      </div>

      <div className="flex flex-wrap justify-end items-center gap-2.5">
        {onCreateRole && (
          <button
            type="button"
            onClick={onCreateRole}
            className="px-3.5 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg border border-neutral-700 flex items-center gap-1.5 transition-all text-sm font-medium font-['Inter'] cursor-pointer shadow-sm"
          >
            <Plus className="size-4 text-amber-400" />
            Create Role
          </button>
        )}

        <button
          type="button"
          onClick={onSaveChanges}
          disabled={isSaving}
          className={`px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all text-base font-medium font-['Inter'] leading-5 shadow-sm cursor-pointer disabled:opacity-50 ${
            hasUnsavedChanges
              ? 'bg-yellow-400 hover:bg-yellow-300 text-neutral-900 ring-2 ring-yellow-400/50'
              : 'bg-yellow-400/90 hover:bg-yellow-400 text-neutral-900'
          }`}
        >
          {isSaving ? (
            <Loader2 className="size-4 animate-spin text-neutral-900" />
          ) : (
            <Save className="size-4 text-neutral-900" />
          )}
          {isSaving ? 'Saving Changes...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};
