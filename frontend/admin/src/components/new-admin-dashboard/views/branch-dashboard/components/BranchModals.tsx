import React from 'react';
import { BranchItem, RestaurantItem } from '../../../types';
import {
  TableItem,
  MenuItem,
  StaffMember,
  BranchFormData,
  TableFormData,
  MenuFormData,
  StaffInviteFormData,
  StaffEditFormData,
} from '../types';
import { AddTableModal } from './modals/AddTableModal';
import { EditTableModal } from './modals/EditTableModal';
import { DeleteTableModal } from './modals/DeleteTableModal';
import { ViewQrModal } from './modals/ViewQrModal';
import { AddMenuModal } from './modals/AddMenuModal';
import { EditMenuModal } from './modals/EditMenuModal';
import { DeleteMenuModal } from './modals/DeleteMenuModal';
import { InviteStaffModal } from './modals/InviteStaffModal';
import { EditStaffModal } from './modals/EditStaffModal';
import { EditBranchModal } from './modals/EditBranchModal';

interface BranchModalsProps {
  branch: BranchItem;
  restaurants: RestaurantItem[];

  // Table Modals
  isAddTableOpen: boolean;
  onCloseAddTable: () => void;
  tableForm: TableFormData;
  setTableForm: React.Dispatch<React.SetStateAction<TableFormData>>;
  qrSeed: number;
  isRegenerating: boolean;
  onRegenerateQr: () => void;
  onSaveAddTable: (e: React.FormEvent) => void;

  editingTable: TableItem | null;
  onCloseEditTable: () => void;
  onSaveEditTable: (e: React.FormEvent) => void;

  deletingTable: TableItem | null;
  onCloseDeleteTable: () => void;
  onConfirmDeleteTable: () => void;

  viewingQrTable: TableItem | null;
  onCloseViewingQr: () => void;

  // Menu Modals
  isAddMenuOpen: boolean;
  onCloseAddMenu: () => void;
  menuForm: MenuFormData;
  setMenuForm: React.Dispatch<React.SetStateAction<MenuFormData>>;
  onSaveAddMenu: (e: React.FormEvent) => void;

  editingMenuItem: MenuItem | null;
  onCloseEditMenu: () => void;
  onSaveEditMenu: (e: React.FormEvent) => void;

  deletingMenuItem: MenuItem | null;
  onCloseDeleteMenu: () => void;
  onConfirmDeleteMenu: () => void;

  // Staff Modals
  isInviteStaffOpen: boolean;
  onCloseInviteStaff: () => void;
  inviteForm: StaffInviteFormData;
  setInviteForm: React.Dispatch<React.SetStateAction<StaffInviteFormData>>;
  onSaveInviteStaff: (e: React.FormEvent) => void;

  editingStaff: StaffMember | null;
  onCloseEditStaff: () => void;
  editStaffForm: StaffEditFormData;
  setEditStaffForm: React.Dispatch<React.SetStateAction<StaffEditFormData>>;
  onSaveEditStaff: (e: React.FormEvent) => void;

  // Branch Modal
  isEditBranchOpen: boolean;
  onCloseEditBranch: () => void;
  editBranchForm: BranchFormData;
  setEditBranchForm: React.Dispatch<React.SetStateAction<BranchFormData>>;
  onSaveEditBranch: (e: React.FormEvent) => void;
}

export const BranchModals: React.FC<BranchModalsProps> = ({
  branch,
  restaurants,
  isAddTableOpen,
  onCloseAddTable,
  tableForm,
  setTableForm,
  qrSeed,
  isRegenerating,
  onRegenerateQr,
  onSaveAddTable,
  editingTable,
  onCloseEditTable,
  onSaveEditTable,
  deletingTable,
  onCloseDeleteTable,
  onConfirmDeleteTable,
  viewingQrTable,
  onCloseViewingQr,
  isAddMenuOpen,
  onCloseAddMenu,
  menuForm,
  setMenuForm,
  onSaveAddMenu,
  editingMenuItem,
  onCloseEditMenu,
  onSaveEditMenu,
  deletingMenuItem,
  onCloseDeleteMenu,
  onConfirmDeleteMenu,
  isInviteStaffOpen,
  onCloseInviteStaff,
  inviteForm,
  setInviteForm,
  onSaveInviteStaff,
  editingStaff,
  onCloseEditStaff,
  editStaffForm,
  setEditStaffForm,
  onSaveEditStaff,
  isEditBranchOpen,
  onCloseEditBranch,
  editBranchForm,
  setEditBranchForm,
  onSaveEditBranch,
}) => {
  return (
    <>
      <AddTableModal
        isOpen={isAddTableOpen}
        tableForm={tableForm}
        onChange={setTableForm}
        qrSeed={qrSeed}
        isRegenerating={isRegenerating}
        onRegenerateQr={onRegenerateQr}
        onClose={onCloseAddTable}
        onSubmit={onSaveAddTable}
      />

      <EditTableModal
        isOpen={Boolean(editingTable)}
        tableForm={tableForm}
        onChange={setTableForm}
        qrSeed={qrSeed}
        isRegenerating={isRegenerating}
        onRegenerateQr={onRegenerateQr}
        onClose={onCloseEditTable}
        onSubmit={onSaveEditTable}
      />

      <DeleteTableModal
        table={deletingTable}
        onClose={onCloseDeleteTable}
        onConfirm={onConfirmDeleteTable}
      />

      <ViewQrModal
        table={viewingQrTable}
        branchName={branch.name}
        onClose={onCloseViewingQr}
      />

      <AddMenuModal
        isOpen={isAddMenuOpen}
        branchName={branch.name}
        menuForm={menuForm}
        onChange={setMenuForm}
        onClose={onCloseAddMenu}
        onSubmit={onSaveAddMenu}
      />

      <EditMenuModal
        isOpen={Boolean(editingMenuItem)}
        menuForm={menuForm}
        onChange={setMenuForm}
        onClose={onCloseEditMenu}
        onSubmit={onSaveEditMenu}
      />

      <DeleteMenuModal
        item={deletingMenuItem}
        onClose={onCloseDeleteMenu}
        onConfirm={onConfirmDeleteMenu}
      />

      <InviteStaffModal
        isOpen={isInviteStaffOpen}
        branchName={branch.name}
        inviteForm={inviteForm}
        onChange={setInviteForm}
        onClose={onCloseInviteStaff}
        onSubmit={onSaveInviteStaff}
      />

      <EditStaffModal
        isOpen={Boolean(editingStaff)}
        editStaffForm={editStaffForm}
        onChange={setEditStaffForm}
        onClose={onCloseEditStaff}
        onSubmit={onSaveEditStaff}
      />

      <EditBranchModal
        isOpen={isEditBranchOpen}
        editForm={editBranchForm}
        onChange={setEditBranchForm}
        restaurants={restaurants}
        onClose={onCloseEditBranch}
        onSubmit={onSaveEditBranch}
      />
    </>
  );
};
