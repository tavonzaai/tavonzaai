import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { StaffMember } from '../types';
import { PaginationBar } from '@/components/common';
import { paginateItems } from '@/lib/pagination';
import { useClientPage, useClampPage } from '@/hooks/useListPagination';

interface BranchStaffTabProps {
  staffList: StaffMember[];
  onOpenEditStaff: (member: StaffMember) => void;
  onToggleStaffStatus: (member: StaffMember) => void;
  onDeleteStaff: (member: StaffMember) => void;
}

export const BranchStaffTab: React.FC<BranchStaffTabProps> = ({
  staffList,
  onOpenEditStaff,
  onToggleStaffStatus,
  onDeleteStaff,
}) => {
  const { page, setPage } = useClientPage(staffList.length);
  const paged = paginateItems(staffList, page);
  useClampPage(page, paged.meta.totalPages, setPage);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="w-full overflow-x-auto rounded-xl border border-zinc-800 bg-neutral-900/50 shadow-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-900 border-b border-zinc-800">
              <th className="px-5 py-3 text-white text-sm font-semibold font-['Inter'] leading-5">
                Staff member
              </th>
              <th className="px-5 py-3 text-white text-sm font-semibold font-['Inter'] leading-5">
                Role
              </th>
              <th className="px-5 py-3 text-white text-sm font-semibold font-['Inter'] leading-5">
                Branch
              </th>
              <th className="px-5 py-3 text-white text-sm font-semibold font-['Inter'] leading-5 text-center">
                Status
              </th>
              <th className="px-5 py-3 text-white text-sm font-semibold font-['Inter'] leading-5 text-center">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {paged.items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-neutral-400 font-medium">
                  No staff members found for this branch. Click &quot;Invite Staff&quot; to add one.
                </td>
              </tr>
            ) : (
              paged.items.map((member) => (
                <tr
                  key={member.id}
                  data-testid={`staff-row-${member.id}`}
                  className="hover:bg-zinc-900/40 transition-colors"
                >
                  <td className="px-5 py-4 text-neutral-200 text-base font-medium font-['Inter'] leading-4">
                    {member.name}
                  </td>
                  <td className="px-5 py-3">
                    <span className="inline-flex px-3 py-1.5 rounded-md text-sm font-medium font-['Inter'] leading-4 bg-amber-500/10 text-amber-500">
                      {member.role.replaceAll('_', ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-neutral-200 text-base font-medium font-['Inter'] leading-4">
                    {member.branch}
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span
                      className={`inline-flex px-3 py-1.5 rounded-md text-sm font-medium font-['Inter'] leading-4 ${
                        member.status === 'Active'
                          ? 'bg-green-500/10 text-green-500'
                          : 'bg-neutral-400/20 text-neutral-400'
                      }`}
                    >
                      {member.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        data-testid={`staff-edit-${member.id}`}
                        onClick={() => onOpenEditStaff(member)}
                        className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-xs font-medium font-['Inter'] transition-colors cursor-pointer border border-neutral-700 flex items-center gap-1.5"
                      >
                        <Edit2 className="size-3 text-amber-400" />
                        Edit
                      </button>
                      {member.status === 'Active' ? (
                        <button
                          type="button"
                          data-testid={`staff-deactivate-${member.id}`}
                          onClick={() => onToggleStaffStatus(member)}
                          className="px-2.5 py-1 rounded bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 text-xs font-medium font-['Inter'] transition-colors cursor-pointer border border-neutral-700/60"
                        >
                          Deactivate
                        </button>
                      ) : (
                        <button
                          type="button"
                          data-testid={`staff-activate-${member.id}`}
                          onClick={() => onToggleStaffStatus(member)}
                          className="px-2.5 py-1 rounded bg-green-500/10 hover:bg-green-500/20 text-green-400 hover:text-green-300 text-xs font-medium font-['Inter'] transition-colors cursor-pointer border border-green-500/30"
                        >
                          Activate
                        </button>
                      )}
                      <button
                        type="button"
                        data-testid={`staff-delete-${member.id}`}
                        onClick={() => onDeleteStaff(member)}
                        className="px-2.5 py-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 text-xs font-medium font-['Inter'] transition-colors cursor-pointer border border-red-500/30 flex items-center gap-1"
                      >
                        <Trash2 className="size-3" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <PaginationBar meta={paged.meta} onPageChange={setPage} />
    </div>
  );
};
