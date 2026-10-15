import React, { useState, useEffect } from 'react';
import { X, UserCheck, Shield, Trash2, Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';
import {
  useGetRolesQuery,
  useGetUserRoleQuery,
  useAssignUserRoleMutation,
  useRemoveUserRoleMutation,
  RoleItem,
} from '@/redux/features/roleApi';

interface AssignUserRoleModalProps {
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AssignUserRoleModal: React.FC<AssignUserRoleModalProps> = ({
  user,
  onClose,
  onSuccess,
}) => {
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');

  const { data: roles = [], isLoading: loadingRoles } = useGetRolesQuery();
  const {
    data: userRoleData,
    isLoading: loadingUserRole,
    refetch: refetchUserRole,
  } = useGetUserRoleQuery(user?.id || '', {
    skip: !user?.id,
  });

  const [assignUserRole, { isLoading: assigning }] = useAssignUserRoleMutation();
  const [removeUserRole, { isLoading: removing }] = useRemoveUserRoleMutation();

  const isSubmitting = assigning || removing;
  const currentRole = userRoleData?.role;

  useEffect(() => {
    if (userRoleData?.role?.id) {
      setSelectedRoleId(userRoleData.role.id);
    } else {
      setSelectedRoleId('');
    }
  }, [userRoleData]);

  if (!user) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoleId) {
      toast.error('Please select a dynamic role to assign.');
      return;
    }

    try {
      await assignUserRole({
        userId: user.id,
        roleId: selectedRoleId,
      }).unwrap();

      toast.success(`Role assigned to ${user.name || user.email} successfully.`);
      if (onSuccess) onSuccess();
      refetchUserRole();
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to assign role.');
    }
  };

  const handleRemoveRole = async () => {
    if (!currentRole) return;
    try {
      await removeUserRole(user.id).unwrap();
      toast.success(`Role removed from ${user.name || user.email}.`);
      setSelectedRoleId('');
      if (onSuccess) onSuccess();
      refetchUserRole();
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to remove role.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-neutral-900 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-zinc-800 flex items-center justify-between bg-neutral-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
              <UserCheck className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white font-['Inter']">
                Assign Dynamic Role
              </h2>
              <p className="text-xs text-neutral-400 font-['Inter']">
                {user.name} ({user.email})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Current Status Box */}
          <div className="p-4 rounded-xl bg-neutral-950 border border-zinc-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="size-5 text-amber-400 shrink-0" />
              <div>
                <p className="text-xs text-neutral-400 font-['Inter']">Currently Assigned Role</p>
                <p className="text-sm font-semibold text-white font-['Inter']">
                  {loadingUserRole
                    ? 'Loading...'
                    : currentRole
                    ? currentRole.name
                    : 'No dynamic role assigned'}
                </p>
              </div>
            </div>
            {currentRole && (
              <button
                type="button"
                onClick={handleRemoveRole}
                disabled={isSubmitting}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-400/10 border border-red-500/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="size-3.5" />
                Unassign
              </button>
            )}
          </div>

          {/* Role Picker (Strict Single-Role) */}
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-2 font-['Inter']">
              Select Role to Assign <span className="text-amber-400">*</span>
            </label>
            <p className="text-xs text-neutral-500 mb-3 font-['Inter']">
              Tavonza AI enforces strictly 1 dynamic role per user. Assigning a new role replaces any existing assignment.
            </p>

            {loadingRoles ? (
              <div className="p-8 flex items-center justify-center text-zinc-500 gap-2">
                <Loader2 className="size-4 animate-spin text-amber-400" />
                <span>Loading available roles...</span>
              </div>
            ) : roles.length === 0 ? (
              <div className="p-4 text-center text-zinc-500 text-sm border border-zinc-800 rounded-lg">
                No dynamic roles found. Please create a role first.
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {roles.map((r: RoleItem) => {
                  const isSelected = selectedRoleId === r.id;
                  return (
                    <div
                      key={r.id}
                      onClick={() => setSelectedRoleId(r.id)}
                      className={`p-3.5 rounded-xl border text-left flex items-start justify-between gap-3 cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-amber-400/10 border-amber-400 text-amber-300 shadow-sm'
                          : 'bg-neutral-950 border-zinc-800 text-neutral-300 hover:border-zinc-700 hover:bg-neutral-900/60'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-white font-['Inter']">
                            {r.name}
                          </span>
                          {r.isSystem && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-zinc-800 text-zinc-400">
                              System
                            </span>
                          )}
                        </div>
                        {r.description && (
                          <p className="text-xs text-neutral-400 font-['Inter'] leading-relaxed">
                            {r.description}
                          </p>
                        )}
                        <span className="inline-block text-[11px] text-zinc-500 font-mono">
                          {r.permissionCount} capabilities granted
                        </span>
                      </div>

                      <div
                        className={`size-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                          isSelected
                            ? 'border-amber-400 bg-amber-400 text-neutral-900'
                            : 'border-zinc-700 bg-neutral-900'
                        }`}
                      >
                        {isSelected && <Check className="size-3 stroke-[3]" />}
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
              disabled={isSubmitting}
              className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-sm text-neutral-300 font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedRoleId || selectedRoleId === currentRole?.id}
              className="px-5 py-2 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-neutral-900 font-semibold rounded-lg text-sm transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              {isSubmitting ? 'Saving...' : 'Assign Role'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignUserRoleModal;
