import React from 'react';
import { Trash2 } from 'lucide-react';
import { StaffMember } from '../types';

interface DeleteStaffModalProps {
  staff: StaffMember | null;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export const DeleteStaffModal: React.FC<DeleteStaffModalProps> = ({
  staff,
  onClose,
  onConfirm,
  isDeleting = false,
}) => {
  if (!staff) return null;

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
                Remove &ldquo;{staff.name}&rdquo;?
              </h3>
              <p className="w-80 text-center text-neutral-400 text-xs font-normal font-['Inter'] leading-4">
                This will remove the {staff.role ? staff.role.replaceAll('_', ' ') : 'staff'} assignment from this branch.
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
            onClick={onConfirm}
            className="px-4 py-2.5 bg-red-500/20 hover:bg-red-500/30 rounded-lg outline outline-1 outline-offset-[-1px] outline-red-400/40 text-red-400 text-base font-medium font-['Inter'] leading-5 transition-colors cursor-pointer disabled:opacity-50"
          >
            {isDeleting ? 'Deleting...' : 'Delete Staff'}
          </button>
        </div>
      </div>
    </div>
  );
};
