import React from 'react';
import { StaffMember } from '../types';
import { PaginationBar } from '@/components/common';
import { paginateItems } from '@/lib/pagination';
import { useClientPage, useClampPage } from '@/hooks/useListPagination';

interface BranchStaffTabProps {
  staffList: StaffMember[];
  onOpenEditStaff: (member: StaffMember) => void;
  onToggleStaffStatus: (member: StaffMember) => void;
}

export const BranchStaffTab: React.FC<BranchStaffTabProps> = ({
  staffList,
  onOpenEditStaff,
  onToggleStaffStatus,
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
                    <div className="flex items-center justify-center gap-6">
                      <button
                        type="button"
                        onClick={() => onOpenEditStaff(member)}
                        className="text-neutral-400 hover:text-white text-xs font-normal font-['Inter'] leading-4 transition-colors cursor-pointer"
                      >
                        Edit / Change Role
                      </button>
                      {member.status === 'Active' ? (
                        <button
                          type="button"
                          data-testid={`staff-deactivate-${member.id}`}
                          onClick={() => onToggleStaffStatus(member)}
                          className="text-red-400 hover:text-red-300 text-xs font-normal font-['Inter'] leading-4 transition-colors cursor-pointer"
                        >
                          Deactivate
                        </button>
                      ) : (
                        <button
                          type="button"
                          data-testid={`staff-activate-${member.id}`}
                          onClick={() => onToggleStaffStatus(member)}
                          className="text-green-500 hover:text-green-400 text-xs font-normal font-['Inter'] leading-4 transition-colors cursor-pointer"
                        >
                          Activate
                        </button>
                      )}
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
