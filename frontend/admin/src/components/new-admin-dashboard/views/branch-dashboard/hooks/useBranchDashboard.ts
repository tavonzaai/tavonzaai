import { useState } from 'react';
import { toast } from 'sonner';
import { BranchItem, RestaurantItem } from '../../../types';
import { MOCK_RESTAURANTS } from '../../../data';
import {
  SubTab,
  TableItem,
  MenuItem,
  StaffMember,
  BranchFormData,
  TableFormData,
  MenuFormData,
  StaffInviteFormData,
  StaffEditFormData,
} from '../types';
import {
  DEFAULT_TABLES,
  DEFAULT_MENU_ITEMS,
  DEFAULT_STAFF,
} from '../data';

interface UseBranchDashboardProps {
  initialBranch: BranchItem;
  onUpdateBranch?: (updated: BranchItem) => void;
}

export function useBranchDashboard({
  initialBranch,
  onUpdateBranch,
}: UseBranchDashboardProps) {
  const [branch, setBranch] = useState<BranchItem>(initialBranch);
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('Overview');

  // Branch Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<BranchFormData>({
    restaurantId: branch.restaurantId,
    restaurantName: branch.restaurantName,
    name: branch.name,
    address: branch.location,
    contactNumber: branch.contactNumber || '992548756',
    manager: branch.manager,
    status: (branch.status as 'Active' | 'Setup' | 'Closed') || 'Active',
    openingTime: branch.openingTime || '09:00',
    closingTime: branch.closingTime || '23:00',
  });

  // Tables State
  const [tables, setTables] = useState<TableItem[]>(DEFAULT_TABLES);
  const [isAddTableOpen, setIsAddTableOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<TableItem | null>(null);
  const [deletingTable, setDeletingTable] = useState<TableItem | null>(null);
  const [viewingQrTable, setViewingQrTable] = useState<TableItem | null>(null);
  const [tableForm, setTableForm] = useState<TableFormData>({
    number: '',
    capacity: 4,
    status: 'Available',
  });
  const [qrSeed, setQrSeed] = useState(42);
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Menu State
  const [menuItems, setMenuItems] = useState<MenuItem[]>(DEFAULT_MENU_ITEMS);
  const [menuFilterStatus, setMenuFilterStatus] = useState<'All Items' | 'Active' | 'Disable'>('All Items');
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  const [deletingMenuItem, setDeletingMenuItem] = useState<MenuItem | null>(null);
  const [menuForm, setMenuForm] = useState<MenuFormData>({
    name: '',
    category: 'Main Course',
    price: '$12.20',
    status: 'Active',
  });

  // Staff State
  const [staffList, setStaffList] = useState<StaffMember[]>(DEFAULT_STAFF);
  const [staffRoleFilter, setStaffRoleFilter] = useState<string>('All Roles');
  const [staffBranchFilter, setStaffBranchFilter] = useState<string>('All branches');
  const [isInviteStaffOpen, setIsInviteStaffOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [inviteForm, setInviteForm] = useState<StaffInviteFormData>({
    name: '',
    role: 'Manager',
    branch: branch.name || 'Georgia Flagship',
  });
  const [editStaffForm, setEditStaffForm] = useState<StaffEditFormData>({
    name: '',
    role: 'Manager',
    branch: 'Georgia Flagship',
    status: 'Active',
  });

  // Metrics for Tables
  const totalTables = tables.length;
  const availableTables = tables.filter((t) => t.status === 'Available').length;
  const occupiedTables = tables.filter((t) => t.status === 'Occupied').length;
  const totalCapacity = tables.reduce((acc, t) => acc + t.capacity, 0);

  // Filtered Menu Items
  const filteredMenuItems = menuItems.filter((item) => {
    if (menuFilterStatus === 'All Items') return true;
    return item.status === menuFilterStatus;
  });

  // Filtered Staff Items
  const filteredStaff = staffList.filter((staff) => {
    if (staffRoleFilter !== 'All Roles') {
      if (staffRoleFilter === 'Manager') {
        if (!staff.role.toLowerCase().includes('manager')) return false;
      } else if (staff.role.toLowerCase() !== staffRoleFilter.toLowerCase()) {
        return false;
      }
    }
    if (staffBranchFilter !== 'All branches') {
      if (staff.branch.toLowerCase() !== staffBranchFilter.toLowerCase()) {
        return false;
      }
    }
    return true;
  });

  // Handlers: Branch Edit
  const handleOpenEdit = () => {
    setEditForm({
      restaurantId: branch.restaurantId,
      restaurantName: branch.restaurantName,
      name: branch.name,
      address: branch.location,
      contactNumber: branch.contactNumber || '992548756',
      manager: branch.manager,
      status: (branch.status as 'Active' | 'Setup' | 'Closed') || 'Active',
      openingTime: branch.openingTime || '09:00',
      closingTime: branch.closingTime || '23:00',
    });
    setIsEditOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.name.trim()) {
      toast.error('Branch name cannot be empty.');
      return;
    }

    const matchedRest = MOCK_RESTAURANTS.find((r: RestaurantItem) => r.id === editForm.restaurantId);
    const updated: BranchItem = {
      ...branch,
      restaurantId: editForm.restaurantId,
      restaurantName: matchedRest ? matchedRest.name : editForm.restaurantName,
      name: editForm.name.trim(),
      location: editForm.address.trim(),
      contactNumber: editForm.contactNumber,
      manager: editForm.manager,
      status: editForm.status,
      openingTime: editForm.openingTime,
      closingTime: editForm.closingTime,
      hours: `${editForm.openingTime} – ${editForm.closingTime}`,
    };

    setBranch(updated);
    if (onUpdateBranch) {
      onUpdateBranch(updated);
    }
    toast.success(`Branch "${updated.name}" updated successfully!`);
    setIsEditOpen(false);
  };

  // Handlers: Tables
  const handleRegenerateQr = () => {
    setIsRegenerating(true);
    setTimeout(() => {
      setQrSeed((prev) => prev + Math.floor(Math.random() * 50) + 7);
      setIsRegenerating(false);
      toast.success('QR Code regenerated successfully!');
    }, 300);
  };

  const handleOpenAddTable = () => {
    const nextNum = tables.length + 1;
    const formatted = `T-${nextNum < 10 ? `0${nextNum}` : nextNum}`;
    setTableForm({
      number: formatted,
      capacity: 4,
      status: 'Available',
    });
    setQrSeed(Date.now() % 1000);
    setIsAddTableOpen(true);
  };

  const handleSaveAddTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tableForm.number.trim()) {
      toast.error('Please enter a table number.');
      return;
    }

    const newTable: TableItem = {
      id: `tbl-${Date.now()}`,
      number: tableForm.number.trim(),
      capacity: Number(tableForm.capacity) || 4,
      status: tableForm.status,
      qrCodeUrl: `https://tavonza.ai/r/${branch.id}/${tableForm.number.trim().toLowerCase()}`,
    };

    setTables((prev) => [...prev, newTable]);
    toast.success(`Table "${newTable.number}" added successfully!`);
    setIsAddTableOpen(false);
  };

  const handleOpenEditTable = (table: TableItem) => {
    setEditingTable(table);
    setTableForm({
      number: table.number,
      capacity: table.capacity,
      status: table.status,
    });
    setQrSeed(table.number.split('').reduce((acc, char) => acc + char.charCodeAt(0), 10));
  };

  const handleSaveEditTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTable) return;
    if (!tableForm.number.trim()) {
      toast.error('Please enter a table number.');
      return;
    }

    setTables((prev) =>
      prev.map((t) =>
        t.id === editingTable.id
          ? {
              ...t,
              number: tableForm.number.trim(),
              capacity: Number(tableForm.capacity) || 4,
              status: tableForm.status,
            }
          : t
      )
    );
    toast.success(`Table "${tableForm.number}" updated successfully!`);
    setEditingTable(null);
  };

  const handleConfirmDeleteTable = () => {
    if (!deletingTable) return;
    const targetNum = deletingTable.number;
    setTables((prev) => prev.filter((t) => t.id !== deletingTable.id));
    toast.success(`Table "${targetNum}" has been removed.`);
    setDeletingTable(null);
  };

  // Handlers: Menu
  const handleOpenAddMenu = () => {
    setMenuForm({
      name: '',
      category: 'Main Course',
      price: '$12.20',
      status: 'Active',
    });
    setIsAddMenuOpen(true);
  };

  const handleSaveAddMenu = (e: React.FormEvent) => {
    e.preventDefault();
    if (!menuForm.name.trim()) {
      toast.error('Please enter menu item name.');
      return;
    }

    const newItem: MenuItem = {
      id: `menu-${Date.now()}`,
      name: menuForm.name.trim(),
      category: menuForm.category,
      price: menuForm.price.startsWith('$') ? menuForm.price : `$${menuForm.price}`,
      status: menuForm.status,
    };

    setMenuItems((prev) => [...prev, newItem]);
    toast.success(`Menu item "${newItem.name}" added successfully!`);
    setIsAddMenuOpen(false);
  };

  const handleOpenEditMenu = (item: MenuItem) => {
    setEditingMenuItem(item);
    setMenuForm({
      name: item.name,
      category: item.category,
      price: item.price,
      status: item.status,
    });
  };

  const handleSaveEditMenu = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMenuItem) return;
    if (!menuForm.name.trim()) {
      toast.error('Menu item name cannot be empty.');
      return;
    }

    setMenuItems((prev) =>
      prev.map((m) =>
        m.id === editingMenuItem.id
          ? {
              ...m,
              name: menuForm.name.trim(),
              category: menuForm.category,
              price: menuForm.price.startsWith('$') ? menuForm.price : `$${menuForm.price}`,
              status: menuForm.status,
            }
          : m
      )
    );
    toast.success(`Menu item "${menuForm.name}" updated!`);
    setEditingMenuItem(null);
  };

  const handleDuplicateMenu = (item: MenuItem) => {
    const duplicated: MenuItem = {
      id: `menu-${Date.now()}`,
      name: `${item.name} (Copy)`,
      category: item.category,
      price: item.price,
      status: item.status,
    };
    setMenuItems((prev) => [...prev, duplicated]);
    toast.success(`Duplicated "${item.name}"`);
  };

  const handleToggleMenuStatus = (item: MenuItem) => {
    const nextStatus = item.status === 'Active' ? 'Disable' : 'Active';
    setMenuItems((prev) =>
      prev.map((m) => (m.id === item.id ? { ...m, status: nextStatus } : m))
    );
    toast.info(`Item status changed to ${nextStatus}.`);
  };

  const handleConfirmDeleteMenu = () => {
    if (!deletingMenuItem) return;
    const name = deletingMenuItem.name;
    setMenuItems((prev) => prev.filter((m) => m.id !== deletingMenuItem.id));
    toast.success(`Menu item "${name}" deleted.`);
    setDeletingMenuItem(null);
  };

  // Handlers: Staff
  const handleOpenInviteStaff = () => {
    setInviteForm({
      name: '',
      role: 'Manager',
      branch: branch.name || 'Georgia Flagship',
    });
    setIsInviteStaffOpen(true);
  };

  const handleSaveInviteStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteForm.name.trim()) {
      toast.error('Please enter full name.');
      return;
    }
    const newStaff: StaffMember = {
      id: `st-${Date.now()}`,
      name: inviteForm.name.trim(),
      role: inviteForm.role,
      branch: inviteForm.branch,
      status: 'Active',
    };
    setStaffList((prev) => [...prev, newStaff]);
    toast.success(`Invitation sent to ${newStaff.name}!`);
    setIsInviteStaffOpen(false);
  };

  const handleOpenEditStaff = (staff: StaffMember) => {
    setEditingStaff(staff);
    setEditStaffForm({
      name: staff.name,
      role: staff.role,
      branch: staff.branch,
      status: staff.status,
    });
  };

  const handleSaveEditStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;
    if (!editStaffForm.name.trim()) {
      toast.error('Full name cannot be empty.');
      return;
    }

    setStaffList((prev) =>
      prev.map((s) =>
        s.id === editingStaff.id
          ? {
              ...s,
              name: editStaffForm.name.trim(),
              role: editStaffForm.role,
              branch: editStaffForm.branch,
              status: editStaffForm.status,
            }
          : s
      )
    );
    toast.success(`Staff member "${editStaffForm.name}" updated!`);
    setEditingStaff(null);
  };

  const handleToggleStaffStatus = (staff: StaffMember) => {
    const nextStatus = staff.status === 'Active' ? 'Inactive' : 'Active';
    setStaffList((prev) =>
      prev.map((s) => (s.id === staff.id ? { ...s, status: nextStatus } : s))
    );
    if (nextStatus === 'Inactive') {
      toast.error(`${staff.name} has been deactivated.`);
    } else {
      toast.success(`${staff.name} has been activated.`);
    }
  };

  return {
    branch,
    activeSubTab,
    setActiveSubTab,
    restaurants: MOCK_RESTAURANTS,

    // Branch Edit
    isEditOpen,
    setIsEditOpen,
    editForm,
    setEditForm,
    handleOpenEdit,
    handleEditSubmit,

    // Tables
    tables,
    totalTables,
    availableTables,
    occupiedTables,
    totalCapacity,
    isAddTableOpen,
    setIsAddTableOpen,
    editingTable,
    setEditingTable,
    deletingTable,
    setDeletingTable,
    viewingQrTable,
    setViewingQrTable,
    tableForm,
    setTableForm,
    qrSeed,
    isRegenerating,
    handleRegenerateQr,
    handleOpenAddTable,
    handleSaveAddTable,
    handleOpenEditTable,
    handleSaveEditTable,
    handleConfirmDeleteTable,

    // Menu
    menuItems: filteredMenuItems,
    menuFilterStatus,
    setMenuFilterStatus,
    isAddMenuOpen,
    setIsAddMenuOpen,
    editingMenuItem,
    setEditingMenuItem,
    deletingMenuItem,
    setDeletingMenuItem,
    menuForm,
    setMenuForm,
    handleOpenAddMenu,
    handleSaveAddMenu,
    handleOpenEditMenu,
    handleSaveEditMenu,
    handleDuplicateMenu,
    handleToggleMenuStatus,
    handleConfirmDeleteMenu,

    // Staff
    staffList: filteredStaff,
    staffRoleFilter,
    setStaffRoleFilter,
    staffBranchFilter,
    setStaffBranchFilter,
    isInviteStaffOpen,
    setIsInviteStaffOpen,
    editingStaff,
    setEditingStaff,
    inviteForm,
    setInviteForm,
    editStaffForm,
    setEditStaffForm,
    handleOpenInviteStaff,
    handleSaveInviteStaff,
    handleOpenEditStaff,
    handleSaveEditStaff,
    handleToggleStaffStatus,
  };
}
