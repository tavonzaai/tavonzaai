'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useBranchDashboard } from './branch-dashboard/hooks/useBranchDashboard';
import {
  BranchDashboardHeader,
  BranchOverviewTab,
  BranchTablesTab,
  BranchMenuTab,
  BranchStaffTab,
  BranchModals,
} from './branch-dashboard/components';
import { BranchSection, branchDetailPath } from './branch-dashboard/sections';
import { ErrorState, LoadingState } from '@/components/common';

export interface BranchDashboardViewProps {
  branchId: string;
  section: BranchSection;
  onBack: () => void;
}

export default function BranchDashboardView({
  branchId,
  section,
  onBack,
}: BranchDashboardViewProps) {
  const router = useRouter();
  const d = useBranchDashboard({
    branchId,
    section,
    onSectionChange: (next) => {
      router.push(branchDetailPath(branchId, next), { scroll: false });
    },
  });

  if (d.isBranchLoading) {
    return <LoadingState message="Loading branch..." />;
  }

  if (d.isBranchError || !d.branch) {
    return (
      <div className="space-y-4" data-testid="branch-dashboard-error">
        <button
          type="button"
          onClick={onBack}
          className="text-neutral-400 hover:text-white text-xs font-semibold"
        >
          Back to branches
        </button>
        <ErrorState message={d.branchErrorMessage} onRetry={() => d.refetchBranch()} />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-300" data-testid="branch-dashboard">
      <BranchDashboardHeader
        branch={d.branch}
        activeSubTab={d.activeSubTab}
        onBack={onBack}
        onTabChange={d.setActiveSubTab}
        onOpenEditBranch={d.handleOpenEdit}
        onOpenAddTable={d.handleOpenAddTable}
        onOpenAddMenu={d.handleOpenAddMenu}
        onOpenInviteStaff={d.handleOpenInviteStaff}
        menuFilterStatus={d.menuFilterStatus}
        onMenuFilterStatusChange={d.setMenuFilterStatus}
        staffRoleFilter={d.staffRoleFilter}
        onStaffRoleFilterChange={d.setStaffRoleFilter}
        staffStatusFilter={d.staffStatusFilter}
        onStaffStatusFilterChange={d.setStaffStatusFilter}
      />

      {d.isTabLoading ? (
        <LoadingState message="Loading branch section..." />
      ) : (
        <>
          {d.activeSubTab === 'Overview' && (
            <BranchOverviewTab
              branch={d.branch}
              availableTables={d.availableTables}
              totalTables={d.totalTables}
              occupiedTables={d.occupiedTables}
              staffList={d.staffList}
            />
          )}

          {d.activeSubTab === 'Tables' && (
            <BranchTablesTab
              tables={d.tables}
              totalTables={d.totalTables}
              availableTables={d.availableTables}
              occupiedTables={d.occupiedTables}
              totalCapacity={d.totalCapacity}
              onViewQr={(table) => d.setViewingQrTable(table)}
              onEditTable={d.handleOpenEditTable}
              onDeleteTable={(table) => d.setDeletingTable(table)}
            />
          )}

          {d.activeSubTab === 'Menu' && (
            <BranchMenuTab
              menuItems={d.menuItems}
              onOpenEditMenu={d.handleOpenEditMenu}
              onDuplicateMenu={d.handleDuplicateMenu}
              onToggleMenuStatus={d.handleToggleMenuStatus}
              onDeleteMenu={(item) => d.setDeletingMenuItem(item)}
            />
          )}

          {d.activeSubTab === 'Staff' && (
            <BranchStaffTab
              staffList={d.staffList}
              onOpenEditStaff={d.handleOpenEditStaff}
              onToggleStaffStatus={d.handleToggleStaffStatus}
            />
          )}
        </>
      )}

      <BranchModals
        branch={d.branch}
        restaurants={d.restaurants}
        isAddTableOpen={d.isAddTableOpen}
        onCloseAddTable={() => d.setIsAddTableOpen(false)}
        tableForm={d.tableForm}
        setTableForm={d.setTableForm}
        qrSeed={d.qrSeed}
        isRegenerating={d.isRegenerating}
        onRegenerateQr={d.handleRegenerateQr}
        onSaveAddTable={d.handleSaveAddTable}
        editingTable={d.editingTable}
        onCloseEditTable={() => d.setEditingTable(null)}
        onSaveEditTable={d.handleSaveEditTable}
        deletingTable={d.deletingTable}
        onCloseDeleteTable={() => d.setDeletingTable(null)}
        onConfirmDeleteTable={d.handleConfirmDeleteTable}
        viewingQrTable={d.viewingQrTable}
        onCloseViewingQr={() => d.setViewingQrTable(null)}
        isAddMenuOpen={d.isAddMenuOpen}
        onCloseAddMenu={() => d.setIsAddMenuOpen(false)}
        menuForm={d.menuForm}
        setMenuForm={d.setMenuForm}
        onSaveAddMenu={d.handleSaveAddMenu}
        editingMenuItem={d.editingMenuItem}
        onCloseEditMenu={() => d.setEditingMenuItem(null)}
        onSaveEditMenu={d.handleSaveEditMenu}
        deletingMenuItem={d.deletingMenuItem}
        onCloseDeleteMenu={() => d.setDeletingMenuItem(null)}
        onConfirmDeleteMenu={d.handleConfirmDeleteMenu}
        isInviteStaffOpen={d.isInviteStaffOpen}
        onCloseInviteStaff={() => d.setIsInviteStaffOpen(false)}
        inviteForm={d.inviteForm}
        setInviteForm={d.setInviteForm}
        onSaveInviteStaff={d.handleSaveInviteStaff}
        editingStaff={d.editingStaff}
        onCloseEditStaff={() => d.setEditingStaff(null)}
        editStaffForm={d.editStaffForm}
        setEditStaffForm={d.setEditStaffForm}
        onSaveEditStaff={d.handleSaveEditStaff}
        isEditBranchOpen={d.isEditOpen}
        onCloseEditBranch={() => d.setIsEditOpen(false)}
        editBranchForm={d.editForm}
        setEditBranchForm={d.setEditForm}
        onSaveEditBranch={d.handleEditSubmit}
      />
    </div>
  );
}
