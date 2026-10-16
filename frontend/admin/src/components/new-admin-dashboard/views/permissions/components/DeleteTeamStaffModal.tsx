import React from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  useDeleteBranchStaffMutation,
  useDeleteUserMutation,
} from '@/redux/features/adminApi';

export interface DeleteTeamStaffMember {
  userId: string;
  staffId?: string;
  name: string;
  email: string;
  role?: string;
  branchId: string;
  branchName?: string;
}

interface DeleteTeamStaffModalProps {
  member: DeleteTeamStaffMember | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const DeleteTeamStaffModal: React.FC<DeleteTeamStaffModalProps> = ({
  member,
  onClose,
  onSuccess,
}) => {
  const [deleteBranchStaff, { isLoading: isDeletingStaff }] = useDeleteBranchStaffMutation();
  const [deleteUser, { isLoading: isDeletingUser }] = useDeleteUserMutation();

  const isDeleting = isDeletingStaff || isDeletingUser;

  if (!member) return null;

  const handleConfirm = async () => {
    try {
      if (member.staffId && member.branchId) {
        await deleteBranchStaff({
          branchId: member.branchId,
          staffId: member.staffId,
        }).unwrap();
      } else {
        await deleteUser(member.userId).unwrap();
      }

      toast.success(`Staff member "${member.name}" removed successfully.`);
      onSuccess?.();
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to remove staff member.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-[452px] max-w-full px-5 py-6 bg-neutral-900 rounded-[10px] flex flex-col justify-start items-center gap-6 shadow-2xl animate-in fade-in scale-95 duration-150 border border-neutral-800">
        <div className="self-stretch flex flex-col justify-center items-center gap-5">
          <div className="self-stretch flex flex-col justify-start items-center gap-4">
            <div className="px-4 py-3 bg-red-400/20 rounded-md outline outline-1 outline-offset-[-1px] outline-red-400/40 inline-flex justify-center items-center gap-1.5">
              <Trash2 className="size-8 text-red-400 stroke-[1.75]" />
            </div>

            <div className="self-stretch flex flex-col justify-start items-center gap-2.5">
              <h3 className="self-stretch text-center text-white text-lg font-medium font-['Inter'] leading-5">
                Remove &ldquo;{member.name}&rdquo;?
              </h3>
              <p className="w-80 text-center text-neutral-400 text-xs font-normal font-['Inter'] leading-4">
                {member.staffId
                  ? `This will remove their staff assignment${member.branchName ? ` from ${member.branchName}` : ''} and revoke operational capabilities.`
                  : 'This will deactivate and remove this staff account from the organization.'}
              </p>
            </div>
          </div>
        </div>

        <div className="self-stretch h-0 outline outline-1 outline-offset-[-0.50px] outline-neutral-800" />

        <div className="self-stretch inline-flex justify-center items-start gap-2">
          <button
            type="button"
            disabled={isDeleting}
            onClick={onClose}
            className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 text-white text-base font-medium font-['Inter'] leading-5 transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={handleConfirm}
            className="px-4 py-2.5 bg-red-500/20 hover:bg-red-500/30 rounded-lg outline outline-1 outline-offset-[-1px] outline-red-400/40 text-red-400 text-base font-medium font-['Inter'] leading-5 transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
          >
            {isDeleting && <Loader2 className="size-4 animate-spin" />}
            <span>{isDeleting ? 'Removing...' : 'Delete Staff'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
