import React, { useState, useEffect, useMemo } from 'react';
import { X, ChevronDown, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useGetRolesQuery } from '@/redux/features/roleApi';
import {
  useUpdateBranchStaffMutation,
  useUpdateUserStatusMutation,
} from '@/redux/features/adminApi';

export interface EditTeamStaffMember {
  userId: string;
  staffId?: string;
  name: string;
  email: string;
  role: string;
  status: 'ACTIVE' | 'INACTIVE';
  branchId: string;
  branchName?: string;
}

interface EditTeamStaffModalProps {
  member: EditTeamStaffMember | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const EditTeamStaffModal: React.FC<EditTeamStaffModalProps> = ({
  member,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');

  const { data: dbRoles = [], isLoading: loadingRoles } = useGetRolesQuery();
  const [updateBranchStaff, { isLoading: isUpdatingStaff }] = useUpdateBranchStaffMutation();
  const [updateUserStatus, { isLoading: isUpdatingStatus }] = useUpdateUserStatusMutation();

  const staffRoles = useMemo(() => {
    return dbRoles
      .filter((r) => {
        const slug = r.slug?.toLowerCase();
        return slug !== 'super-admin' && slug !== 'admin' && slug !== 'customer';
      })
      .map((r) => ({
        id: r.id,
        name: r.name,
        value: r.slug ? r.slug.toUpperCase().replace(/-/g, '_') : r.name.toUpperCase().replace(/\s+/g, '_'),
      }));
  }, [dbRoles]);

  const isSubmitting = isUpdatingStaff || isUpdatingStatus;

  useEffect(() => {
    if (member) {
      setName(member.name || '');
      setRole(member.role || 'WAITER');
      setStatus(member.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE');
    }
  }, [member]);

  if (!member) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (member.staffId && member.branchId) {
        await updateBranchStaff({
          branchId: member.branchId,
          staffId: member.staffId,
          body: {
            role: role.toUpperCase().replace(/-/g, '_'),
            isActive: status === 'ACTIVE',
          },
        }).unwrap();
      }

      if (member.status !== status) {
        await updateUserStatus({
          id: member.userId,
          status,
        }).unwrap();
      }

      toast.success(`Staff member "${member.name}" updated successfully.`);
      onSuccess?.();
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to update staff member.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-[540px] max-w-full p-5 bg-neutral-900 rounded-xl border border-neutral-800 shadow-2xl animate-in fade-in scale-95 duration-150 flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-white text-lg font-medium font-['Inter']">Edit Staff Member</h3>
            <p className="text-neutral-400 text-xs font-['Inter'] mt-0.5">
              Update staff details, assigned role, and account status.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="h-px bg-neutral-800" />

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name (Read only) */}
          <div className="space-y-1.5">
            <label className="text-white text-sm font-medium font-['Inter']">Full Name</label>
            <input
              type="text"
              readOnly
              value={member.name}
              className="w-full h-11 px-3.5 bg-neutral-950/60 rounded-lg border border-neutral-800 text-neutral-300 text-sm font-['Inter'] cursor-not-allowed"
            />
          </div>

          {/* Email (Read only) */}
          <div className="space-y-1.5">
            <label className="text-white text-sm font-medium font-['Inter']">Email Address</label>
            <input
              type="email"
              readOnly
              value={member.email}
              className="w-full h-11 px-3.5 bg-neutral-950/60 rounded-lg border border-neutral-800 text-neutral-500 text-sm font-mono cursor-not-allowed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Role */}
            <div className="space-y-1.5">
              <label className="text-white text-sm font-medium font-['Inter']">Assigned Role</label>
              <div className="relative">
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full h-11 px-3.5 bg-neutral-950 rounded-lg border border-neutral-800 text-stone-200 text-sm font-['Inter'] appearance-none focus:outline-none focus:border-amber-400 cursor-pointer"
                >
                  {loadingRoles ? (
                    <option value="">Loading roles...</option>
                  ) : staffRoles.length > 0 ? (
                    staffRoles.map((r) => (
                      <option key={r.id} value={r.value}>
                        {r.name}
                      </option>
                    ))
                  ) : (
                    <option value="">No roles available</option>
                  )}
                </select>
                <ChevronDown className="size-4 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <label className="text-white text-sm font-medium font-['Inter']">Status</label>
              <div className="relative">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'ACTIVE' | 'INACTIVE')}
                  className="w-full h-11 px-3.5 bg-neutral-950 rounded-lg border border-neutral-800 text-stone-200 text-sm font-['Inter'] appearance-none focus:outline-none focus:border-amber-400 cursor-pointer"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
                <ChevronDown className="size-4 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Branch */}
          {member.branchName && (
            <div className="space-y-1.5">
              <label className="text-white text-sm font-medium font-['Inter']">Assigned Branch</label>
              <input
                type="text"
                readOnly
                value={member.branchName}
                className="w-full h-11 px-3.5 bg-neutral-950/60 rounded-lg border border-neutral-800 text-neutral-400 text-sm font-['Inter'] cursor-not-allowed"
              />
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-3 flex justify-end gap-2 border-t border-neutral-800">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-lg text-sm font-medium transition-colors cursor-pointer border border-neutral-700 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 rounded-lg text-sm font-semibold transition-colors cursor-pointer flex items-center gap-1.5 shadow-md disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
