'use client';

import React from 'react';
import { BranchItem } from '../types';
import { useBranchDashboard } from './branch-dashboard/hooks/useBranchDashboard';
import {
  BranchDashboardHeader,
  BranchOverviewTab,
  BranchTablesTab,
  BranchMenuTab,
  BranchStaffTab,
  BranchModals,
} from './branch-dashboard/components';

export interface BranchDashboardViewProps {
  branch: BranchItem;
  onBack: () => void;
  onUpdateBranch?: (updated: BranchItem) => void;
}

export default function BranchDashboardView({
  branch: initialBranch,
  onBack,
  onUpdateBranch,
}: BranchDashboardViewProps) {
  const d = useBranchDashboard({ initialBranch, onUpdateBranch });

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-300">
      {/* Header and SubTab Navigation */}
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
        staffBranchFilter={d.staffBranchFilter}
        onStaffBranchFilterChange={d.setStaffBranchFilter}
      />

      {/* Main Tab Panels */}
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

      {/* Grouped Modals */}
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
