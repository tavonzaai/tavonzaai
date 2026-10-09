'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  Pencil,
  X,
  ChevronDown,
  Building2,
  MapPin,
  Phone,
  Clock,
  TrendingUp,
  ShoppingBag,
  Users,
  Grid,
  CheckCircle2,
  UtensilsCrossed,
  CreditCard,
  UserCheck,
  Plus,
  Trash2,
  RefreshCw,
  QrCode,
  Download,
  Printer,
  Copy,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import { BranchItem } from '../types';
import { MOCK_RESTAURANTS } from '../data';

interface BranchDashboardViewProps {
  branch: BranchItem;
  onBack: () => void;
  onUpdateBranch?: (updated: BranchItem) => void;
}

type SubTab = 'Overview' | 'Tables' | 'Menu' | 'Staff';

interface TableItem {
  id: string;
  number: string;
  capacity: number;
  status: 'Available' | 'Occupied' | 'Reserved';
  qrCodeUrl: string;
}

interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: string;
  status: 'Active' | 'Disable';
}

interface StaffMember {
  id: string;
  name: string;
  role: string;
  branch: string;
  status: 'Active' | 'Inactive';
  contact?: string;
  shift?: string;
}

// Initial default tables matching Figma designs (Total: 5, Available: 3, Occupied: 1, Capacity: 24)
const DEFAULT_TABLES: TableItem[] = [
  { id: 'tbl-1', number: 'T-01', capacity: 2, status: 'Available', qrCodeUrl: 'https://tavonza.ai/r/t-01' },
  { id: 'tbl-2', number: 'T-02', capacity: 4, status: 'Occupied', qrCodeUrl: 'https://tavonza.ai/r/t-02' },
  { id: 'tbl-3', number: 'T-03', capacity: 4, status: 'Reserved', qrCodeUrl: 'https://tavonza.ai/r/t-03' },
  { id: 'tbl-4', number: 'T-04', capacity: 6, status: 'Available', qrCodeUrl: 'https://tavonza.ai/r/t-04' },
  { id: 'tbl-5', number: 'T-05', capacity: 8, status: 'Available', qrCodeUrl: 'https://tavonza.ai/r/t-05' },
];

// Initial default menu items matching Figma designs
const DEFAULT_MENU_ITEMS: MenuItem[] = [
  { id: 'menu-1', name: 'Grilled Chicken', category: 'Main Course', price: '$12.20', status: 'Active' },
  { id: 'menu-2', name: 'Caesar Salad Supreme', category: 'Starters', price: '$12.20', status: 'Active' },
  { id: 'menu-3', name: 'Mojito Cocktail', category: 'Beverages', price: '$12.20', status: 'Active' },
  { id: 'menu-4', name: 'Chocolate Fondant', category: 'Desserts', price: '$12.20', status: 'Disable' },
  { id: 'menu-5', name: 'Wood-Fired Ribeye', category: 'Main Course', price: '$24.50', status: 'Active' },
  { id: 'menu-6', name: 'Truffle Mushroom Risotto', category: 'Main Course', price: '$18.50', status: 'Active' },
];

// Initial default staff members matching exact Figma Staff snippet
const DEFAULT_STAFF: StaffMember[] = [
  { id: 'st-1', name: 'Nobin Mille', role: 'Branch Manager', branch: 'Georgia Flagship', status: 'Active', contact: '+1 (555) 234-5678', shift: 'Morning / Evening' },
  { id: 'st-2', name: 'Sara Ahmed', role: 'Waiter', branch: 'Florida Flagship', status: 'Active', contact: '+1 (555) 345-6789', shift: '10:00 – 19:00' },
  { id: 'st-3', name: 'Adil Chowdhury', role: 'Chef', branch: 'Illinois Flagship', status: 'Active', contact: '+1 (555) 456-7890', shift: '08:00 – 17:00' },
  { id: 'st-4', name: 'Maliha Noor', role: 'Cashier', branch: 'Texas Flagship', status: 'Inactive', contact: '+1 (555) 567-8901', shift: '12:00 – 21:00' },
];

/**
 * Authentic SVG QR Code Matrix generator with classic finder patterns and deterministic seed
 */
function TableQrMatrix({ seed = 1, size = 96, lightColor = '#f3f4f6', darkColor = '#171717' }: { seed?: number; size?: number; lightColor?: string; darkColor?: string }) {
  const gridSize = 17;
  const cellSize = size / gridSize;

  const isFinder = (r: number, c: number) => {
    if (r < 7 && c < 7) return true;
    if (r < 7 && c >= gridSize - 7) return true;
    if (r >= gridSize - 7 && c < 7) return true;
    return false;
  };

  const isFinderFilled = (r: number, c: number) => {
    const checkCorner = (or: number, oc: number) => {
      const dr = r - or;
      const dc = c - oc;
      if (dr === 0 || dr === 6 || dc === 0 || dc === 6) return true;
      if (dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4) return true;
      return false;
    };

    if (r < 7 && c < 7) return checkCorner(0, 0);
    if (r < 7 && c >= gridSize - 7) return checkCorner(0, gridSize - 7);
    if (r >= gridSize - 7 && c < 7) return checkCorner(gridSize - 7, 0);
    return false;
  };

  const cells: { r: number; c: number; filled: boolean }[] = [];
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (isFinder(r, c)) {
        cells.push({ r, c, filled: isFinderFilled(r, c) });
      } else {
        const val = ((r * 19 + c * 31 + seed * 13) % 100);
        const filled = val > 42;
        cells.push({ r, c, filled });
      }
    }
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rounded-sm">
      <rect width={size} height={size} fill={darkColor} />
      {cells.map(({ r, c, filled }) =>
        filled ? (
          <rect
            key={`${r}-${c}`}
            x={c * cellSize + 0.4}
            y={r * cellSize + 0.4}
            width={cellSize - 0.8}
            height={cellSize - 0.8}
            rx={0.5}
            fill={lightColor}
          />
        ) : null
      )}
    </svg>
  );
}

export default function BranchDashboardView({
  branch: initialBranch,
  onBack,
  onUpdateBranch,
}: BranchDashboardViewProps) {
  const [branch, setBranch] = useState<BranchItem>(initialBranch);
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('Overview');

  // Branch Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
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
  const [tableForm, setTableForm] = useState<{
    number: string;
    capacity: number;
    status: 'Available' | 'Occupied' | 'Reserved';
  }>({
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
  const [menuForm, setMenuForm] = useState<{
    name: string;
    category: string;
    price: string;
    status: 'Active' | 'Disable';
  }>({
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
  const [inviteForm, setInviteForm] = useState<{
    name: string;
    role: string;
    branch: string;
  }>({
    name: '',
    role: 'Manager',
    branch: branch.name || 'Georgia Flagship',
  });
  const [editStaffForm, setEditStaffForm] = useState<{
    name: string;
    role: string;
    branch: string;
    status: 'Active' | 'Inactive';
  }>({
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
    // Role filter
    if (staffRoleFilter !== 'All Roles') {
      if (staffRoleFilter === 'Manager') {
        if (!staff.role.toLowerCase().includes('manager')) return false;
      } else if (staff.role.toLowerCase() !== staffRoleFilter.toLowerCase()) {
        return false;
      }
    }
    // Branch filter
    if (staffBranchFilter !== 'All branches') {
      if (staff.branch.toLowerCase() !== staffBranchFilter.toLowerCase()) {
        return false;
      }
    }
    return true;
  });

  // Handler: Open Edit Branch
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

    const matchedRest = MOCK_RESTAURANTS.find((r) => r.id === editForm.restaurantId);
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

  // Handler: Re-generate QR
  const handleRegenerateQr = () => {
    setIsRegenerating(true);
    setTimeout(() => {
      setQrSeed((prev) => prev + Math.floor(Math.random() * 50) + 7);
      setIsRegenerating(false);
      toast.success('QR Code regenerated successfully!');
    }, 300);
  };

  // Handler: Open Add Table Modal
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

  // Handler: Save Add Table
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

  // Handler: Open Edit Table
  const handleOpenEditTable = (table: TableItem) => {
    setEditingTable(table);
    setTableForm({
      number: table.number,
      capacity: table.capacity,
      status: table.status,
    });
    setQrSeed(table.number.split('').reduce((acc, char) => acc + char.charCodeAt(0), 10));
  };

  // Handler: Save Edit Table
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

  // Handler: Confirm Delete Table
  const handleConfirmDeleteTable = () => {
    if (!deletingTable) return;
    const targetNum = deletingTable.number;
    setTables((prev) => prev.filter((t) => t.id !== deletingTable.id));
    toast.success(`Table "${targetNum}" has been removed.`);
    setDeletingTable(null);
  };

  // Handler: Open Add Menu
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

  // Handler: Edit Menu Item
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

  // Handler: Duplicate Menu Item
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

  // Handler: Toggle Menu Item Status
  const handleToggleMenuStatus = (item: MenuItem) => {
    const nextStatus = item.status === 'Active' ? 'Disable' : 'Active';
    setMenuItems((prev) =>
      prev.map((m) => (m.id === item.id ? { ...m, status: nextStatus } : m))
    );
    toast.info(`Item status changed to ${nextStatus}.`);
  };

  // Handler: Delete Menu Item
  const handleConfirmDeleteMenu = () => {
    if (!deletingMenuItem) return;
    const name = deletingMenuItem.name;
    setMenuItems((prev) => prev.filter((m) => m.id !== deletingMenuItem.id));
    toast.success(`Menu item "${name}" deleted.`);
    setDeletingMenuItem(null);
  };

  // Handler: Open Invite Staff Modal
  const handleOpenInviteStaff = () => {
    setInviteForm({
      name: '',
      role: 'Manager',
      branch: branch.name || 'Georgia Flagship',
    });
    setIsInviteStaffOpen(true);
  };

  // Handler: Save Invite Staff
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

  // Handler: Open Edit / Change Role
  const handleOpenEditStaff = (staff: StaffMember) => {
    setEditingStaff(staff);
    setEditStaffForm({
      name: staff.name,
      role: staff.role,
      branch: staff.branch,
      status: staff.status,
    });
  };

  // Handler: Save Edit Staff
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

  // Handler: Toggle Deactivate / Activate
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

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Navigation Row: Back Button matching Figma snippet */}
      <div className="flex items-center gap-1">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 cursor-pointer group text-neutral-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="size-4 text-neutral-400 group-hover:text-white transition-colors" />
          <span className="text-neutral-400 group-hover:text-white text-xs font-semibold font-['Poppins'] leading-4">
            Back
          </span>
        </button>
      </div>

      {/* Header Row: Title & Context Action Button matching Figma snippets */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col justify-start items-start gap-0.5">
          {activeSubTab === 'Overview' && (
            <>
              <h1 className="text-white text-3xl font-semibold font-['Inter'] leading-9">
                {branch.name}
              </h1>
              <p className="text-zinc-500 text-sm font-normal font-['Inter'] leading-6">
                {branch.restaurantName} · Branch dashboard
              </p>
            </>
          )}

          {activeSubTab === 'Tables' && (
            <>
              <h1 className="text-white text-3xl font-semibold font-['Inter'] leading-9">
                Tables
              </h1>
              <p className="text-zinc-500 text-sm font-normal font-['Inter'] leading-6">
                Floor configuration for {branch.name}.
              </p>
            </>
          )}

          {activeSubTab === 'Menu' && (
            <>
              <h1 className="text-white text-3xl font-semibold font-['Inter'] leading-9">
                Menu
              </h1>
              <p className="text-zinc-500 text-sm font-normal font-['Inter'] leading-6">
                Categories and menu items for {branch.name}.
              </p>
            </>
          )}

          {activeSubTab === 'Staff' && (
            <>
              <h1 className="text-white text-3xl font-semibold font-['Inter'] leading-9">
                Staff
              </h1>
              <p className="text-zinc-500 text-sm font-normal font-['Inter'] leading-6">
                Invite team members, assign roles, and manage access.
              </p>
            </>
          )}
        </div>

        <div className="flex justify-end items-center gap-2">
          {activeSubTab === 'Overview' && (
            <button
              onClick={handleOpenEdit}
              className="px-3 py-2.5 bg-yellow-400 hover:bg-yellow-300 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 flex justify-start items-center gap-1.5 transition-all text-neutral-800 text-base font-medium font-['Inter'] leading-5 shadow-sm cursor-pointer"
            >
              <Pencil className="size-4 stroke-[2.5] text-neutral-900" />
              <span>Edit Branch</span>
            </button>
          )}

          {activeSubTab === 'Tables' && (
            <button
              onClick={handleOpenAddTable}
              className="px-3 py-2.5 bg-yellow-400 hover:bg-yellow-300 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 flex justify-start items-center gap-1.5 transition-all text-neutral-800 text-base font-medium font-['Inter'] leading-5 shadow-sm cursor-pointer"
            >
              <Plus className="size-4 stroke-[3] text-neutral-900" />
              <span>Add Table</span>
            </button>
          )}

          {activeSubTab === 'Menu' && (
            <button
              onClick={handleOpenAddMenu}
              className="px-3 py-2.5 bg-yellow-400 hover:bg-yellow-300 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 flex justify-start items-center gap-1.5 transition-all text-neutral-800 text-base font-medium font-['Inter'] leading-5 shadow-sm cursor-pointer"
            >
              <Plus className="size-4 stroke-[3] text-neutral-900" />
              <span>Add Menu Item</span>
            </button>
          )}

          {activeSubTab === 'Staff' && (
            <button
              onClick={handleOpenInviteStaff}
              className="px-3 py-2.5 bg-yellow-400 hover:bg-yellow-300 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 flex justify-start items-center gap-1.5 transition-all text-neutral-800 text-base font-medium font-['Inter'] leading-5 shadow-sm cursor-pointer"
            >
              <Plus className="size-4 stroke-[3] text-neutral-900" />
              <span>Invite Staff</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub Navigation Bar matching Figma snippets */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Pills: Overview, Tables, Menu, Staff */}
        <div className="inline-flex flex-wrap justify-start items-center gap-2.5">
          {(['Overview', 'Tables', 'Menu', 'Staff'] as SubTab[]).map((tab) => {
            const isActive = activeSubTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveSubTab(tab)}
                className={`px-4 py-2 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 flex justify-start items-center gap-1.5 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-yellow-400 text-neutral-700 font-medium'
                    : 'bg-transparent hover:bg-neutral-900 text-white font-medium'
                }`}
              >
                <span className="text-center text-sm font-['Poppins'] leading-5">
                  {tab}
                </span>
              </button>
            );
          })}
        </div>

        {/* Status Filter Dropdown on Menu sub-tab */}
        {activeSubTab === 'Menu' && (
          <div className="flex items-center gap-3">
            <span className="text-neutral-500 text-lg font-semibold font-['Inter'] leading-4">
              Status:
            </span>
            <div className="relative">
              <select
                value={menuFilterStatus}
                onChange={(e) => setMenuFilterStatus(e.target.value as any)}
                className="appearance-none px-3.5 py-2.5 bg-neutral-900 hover:bg-neutral-800 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 text-stone-300 text-base font-medium font-['Inter'] pr-8 focus:outline-none cursor-pointer"
              >
                <option value="All Items">All Items</option>
                <option value="Active">Active</option>
                <option value="Disable">Disabled</option>
              </select>
              <ChevronDown className="size-4 text-stone-300 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        )}

        {/* Role & Branch Filters on Staff sub-tab matching exact Figma snippet */}
        {activeSubTab === 'Staff' && (
          <div className="flex flex-wrap items-center gap-3.5">
            {/* Role Filter */}
            <div className="flex items-center gap-3">
              <span className="text-neutral-500 text-lg font-semibold font-['Inter'] leading-4">
                Role:
              </span>
              <div className="relative">
                <select
                  value={staffRoleFilter}
                  onChange={(e) => setStaffRoleFilter(e.target.value)}
                  className="appearance-none px-3.5 py-2.5 bg-neutral-900 hover:bg-neutral-800 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 text-stone-300 text-base font-medium font-['Inter'] pr-8 focus:outline-none cursor-pointer"
                >
                  <option value="All Roles">All Roles</option>
                  <option value="Manager">Manager</option>
                  <option value="Branch Manager">Branch Manager</option>
                  <option value="Waiter">Waiter</option>
                  <option value="Chef">Chef</option>
                  <option value="Cashier">Cashier</option>
                </select>
                <ChevronDown className="size-4 text-stone-300 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Branch Filter */}
            <div className="flex items-center gap-3">
              <span className="text-neutral-500 text-lg font-semibold font-['Inter'] leading-4">
                Branch:
              </span>
              <div className="relative">
                <select
                  value={staffBranchFilter}
                  onChange={(e) => setStaffBranchFilter(e.target.value)}
                  className="appearance-none px-3.5 py-2.5 bg-neutral-900 hover:bg-neutral-800 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 text-stone-300 text-base font-medium font-['Inter'] pr-8 focus:outline-none cursor-pointer"
                >
                  <option value="All branches">All branches</option>
                  <option value="Georgia Flagship">Georgia Flagship</option>
                  <option value="Florida Flagship">Florida Flagship</option>
                  <option value="Illinois Flagship">Illinois Flagship</option>
                  <option value="Texas Flagship">Texas Flagship</option>
                  <option value="Gulshan Flagship">Gulshan Flagship</option>
                </select>
                <ChevronDown className="size-4 text-stone-300 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 1. OVERVIEW SUB-TAB CONTENT                                              */}
      {/* ========================================================================= */}
      {activeSubTab === 'Overview' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Row of 4 Metric Cards matching Figma snippet */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Card 1: Today's Revenue */}
            <div className="p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-300/20 flex flex-col justify-start items-start gap-3.5 shadow-xl">
              <div className="self-stretch inline-flex justify-between items-center">
                <span className="text-white text-lg font-semibold font-['Inter']">
                  Today’s Revenue
                </span>
              </div>
              <div className="self-stretch h-0 outline outline-1 outline-offset-[-0.50px] outline-neutral-800" />
              <div className="self-stretch flex flex-col justify-start items-start gap-3">
                <span className="text-white text-2xl font-medium font-['Inter'] leading-7">
                  ৳ 184,260
                </span>
                <span className="text-green-500 text-sm font-normal font-['Poppins'] leading-4">
                  ↑ 8.4% from yesterday
                </span>
              </div>
            </div>

            {/* Card 2: Orders */}
            <div className="p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-300/20 flex flex-col justify-start items-start gap-3.5 shadow-xl">
              <div className="self-stretch inline-flex justify-between items-center">
                <span className="text-white text-lg font-semibold font-['Inter']">
                  Orders
                </span>
              </div>
              <div className="self-stretch h-0 outline outline-1 outline-offset-[-0.50px] outline-neutral-800" />
              <div className="self-stretch flex flex-col justify-start items-start gap-3">
                <span className="text-white text-2xl font-medium font-['Inter'] leading-7">
                  146
                </span>
                <span className="text-green-500 text-sm font-normal font-['Inter'] leading-4">
                  12 currently open
                </span>
              </div>
            </div>

            {/* Card 3: Tables */}
            <div className="p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-300/20 flex flex-col justify-start items-start gap-3.5 shadow-xl">
              <div className="self-stretch inline-flex justify-between items-center">
                <span className="text-white text-lg font-semibold font-['Inter']">
                  Tables
                </span>
              </div>
              <div className="self-stretch h-0 outline outline-1 outline-offset-[-0.50px] outline-neutral-800" />
              <div className="self-stretch flex flex-col justify-start items-start gap-3">
                <span className="text-white text-2xl font-medium font-['Inter'] leading-7">
                  {availableTables} / {totalTables}
                </span>
                <span className="text-green-500 text-sm font-normal font-['Inter'] leading-4">
                  {Math.round((occupiedTables / (totalTables || 1)) * 100)}% occupancy
                </span>
              </div>
            </div>

            {/* Card 4: Staff on duty */}
            <div className="p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-300/20 flex flex-col justify-start items-start gap-3.5 shadow-xl">
              <div className="self-stretch inline-flex justify-between items-center">
                <span className="text-white text-lg font-semibold font-['Inter']">
                  Staff on duty
                </span>
              </div>
              <div className="self-stretch h-0 outline outline-1 outline-offset-[-0.50px] outline-neutral-800" />
              <div className="self-stretch flex flex-col justify-start items-start gap-3">
                <span className="text-white text-2xl font-medium font-['Inter'] leading-7">
                  {staffList.filter((s) => s.status === 'Active').length}
                </span>
                <span className="text-green-500 text-sm font-normal font-['Inter'] leading-4">
                  4 shifts starting soon
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Two-Column Section matching Figma snippet */}
          <div className="flex flex-col lg:flex-row items-stretch gap-5">
            {/* Column 1 (Left): Today’s Operations */}
            <div className="flex-1 p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-800 flex flex-col justify-start items-start gap-3.5 shadow-xl">
              <div className="self-stretch flex flex-col justify-start items-start gap-2">
                <h3 className="text-white text-xl font-medium font-['Poppins'] leading-6">
                  Today’s Operations
                </h3>
                <span className="text-stone-300 text-sm font-normal font-['Inter'] leading-4">
                  Real-time branch activity
                </span>
              </div>

              <div className="self-stretch h-0 outline outline-1 outline-offset-[-0.50px] outline-neutral-800" />

              <div className="self-stretch flex flex-col justify-start items-start gap-1.5">
                {/* Kitchen Operation */}
                <div className="self-stretch px-3.5 py-3 bg-neutral-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 flex justify-between items-center gap-2">
                  <div className="flex justify-start items-center gap-2">
                    <div className="size-2 bg-amber-500 rounded-full shrink-0" />
                    <span className="text-white text-base font-medium font-['Poppins'] leading-5">
                      Kitchen
                    </span>
                  </div>
                  <span className="text-stone-300 text-base font-normal font-['Inter'] leading-5">
                    8 orders preparing
                  </span>
                </div>

                {/* Payments Operation */}
                <div className="self-stretch px-3.5 py-3 bg-neutral-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 flex justify-between items-center gap-2">
                  <div className="flex justify-start items-center gap-2">
                    <div className="size-2 bg-green-500 rounded-full shrink-0" />
                    <span className="text-white text-base font-medium font-['Poppins'] leading-5">
                      Payments
                    </span>
                  </div>
                  <span className="text-stone-300 text-base font-normal font-['Inter'] leading-5">
                    3 pending settlements
                  </span>
                </div>

                {/* Staff Operation */}
                <div className="self-stretch px-3.5 py-3 bg-neutral-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 flex justify-between items-center gap-2">
                  <div className="flex justify-start items-center gap-2">
                    <div className="size-2 bg-yellow-400 rounded-full shrink-0" />
                    <span className="text-white text-base font-medium font-['Poppins'] leading-5">
                      Staff
                    </span>
                  </div>
                  <span className="text-stone-300 text-base font-normal font-['Inter'] leading-5">
                    All shifts covered
                  </span>
                </div>
              </div>
            </div>

            {/* Column 2 (Right): Branch Information */}
            <div className="w-full lg:w-[460px] p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-800 flex flex-col justify-start items-center gap-4 shadow-xl">
              <div className="self-stretch flex flex-col justify-start items-start gap-1.5">
                <h3 className="text-white text-lg font-semibold font-['Poppins']">
                  Branch Information
                </h3>
                <span className="text-neutral-500 text-sm font-medium font-['Poppins'] leading-4">
                  Location and management details
                </span>
              </div>

              <div className="self-stretch px-4 py-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-800 flex flex-col justify-start items-center gap-3">
                {/* Manager */}
                <div className="self-stretch flex justify-between items-center">
                  <span className="text-neutral-500 text-base font-medium font-['Poppins'] leading-5">
                    Manager
                  </span>
                  <span className="text-white text-base font-medium font-['Inter'] leading-5">
                    {branch.manager}
                  </span>
                </div>

                {/* Phone */}
                <div className="self-stretch flex justify-between items-center">
                  <span className="text-neutral-500 text-base font-medium font-['Poppins'] leading-5">
                    Phone
                  </span>
                  <span className="text-white text-base font-medium font-['Inter'] leading-5">
                    {branch.contactNumber || '992548756'}
                  </span>
                </div>

                {/* Address */}
                <div className="self-stretch flex justify-between items-center">
                  <span className="text-neutral-500 text-base font-medium font-['Poppins'] leading-5">
                    Address
                  </span>
                  <span className="text-white text-base font-medium font-['Inter'] leading-5">
                    {branch.location}
                  </span>
                </div>

                {/* Operating hours */}
                <div className="self-stretch flex justify-between items-center">
                  <span className="text-neutral-500 text-base font-medium font-['Poppins'] leading-5">
                    Operating hours
                  </span>
                  <span className="text-white text-base font-medium font-['Inter'] leading-5">
                    {branch.hours || `${branch.openingTime || '09:00'} – ${branch.closingTime || '23:00'}`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. TABLES SUB-TAB CONTENT (Matching Figma Snippet 1 & Image)             */}
      {/* ========================================================================= */}
      {activeSubTab === 'Tables' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Row of 4 Metric Cards matching Tables snippet: Total tables (5), Available (3), Occupied (1), Total capacity (24) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Total tables */}
            <div className="p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-300/20 flex flex-col justify-start items-start gap-3.5 shadow-xl">
              <div className="self-stretch flex justify-between items-center">
                <span className="text-white text-lg font-semibold font-['Inter']">
                  Total tables
                </span>
              </div>
              <div className="self-stretch h-0 outline outline-1 outline-offset-[-0.50px] outline-neutral-800" />
              <div className="self-stretch flex flex-col justify-start items-start gap-3">
                <span className="text-white text-2xl font-medium font-['Inter'] leading-7">
                  {totalTables}
                </span>
              </div>
            </div>

            {/* Available */}
            <div className="p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-300/20 flex flex-col justify-start items-start gap-3.5 shadow-xl">
              <div className="self-stretch flex justify-between items-center">
                <span className="text-white text-lg font-semibold font-['Inter']">
                  Available
                </span>
              </div>
              <div className="self-stretch h-0 outline outline-1 outline-offset-[-0.50px] outline-neutral-800" />
              <div className="self-stretch flex flex-col justify-start items-start gap-3">
                <span className="text-white text-2xl font-medium font-['Inter'] leading-7">
                  {availableTables}
                </span>
              </div>
            </div>

            {/* Occupied */}
            <div className="p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-300/20 flex flex-col justify-start items-start gap-3.5 shadow-xl">
              <div className="self-stretch flex justify-between items-center">
                <span className="text-white text-lg font-semibold font-['Inter']">
                  Occupied
                </span>
              </div>
              <div className="self-stretch h-0 outline outline-1 outline-offset-[-0.50px] outline-neutral-800" />
              <div className="self-stretch flex flex-col justify-start items-start gap-3">
                <span className="text-white text-2xl font-medium font-['Inter'] leading-7">
                  {occupiedTables}
                </span>
              </div>
            </div>

            {/* Total capacity */}
            <div className="p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-300/20 flex flex-col justify-start items-start gap-3.5 shadow-xl">
              <div className="self-stretch flex justify-between items-center">
                <span className="text-white text-lg font-semibold font-['Inter']">
                  Total capacity
                </span>
              </div>
              <div className="self-stretch h-0 outline outline-1 outline-offset-[-0.50px] outline-neutral-800" />
              <div className="self-stretch flex flex-col justify-start items-start gap-3">
                <span className="text-white text-2xl font-medium font-['Inter'] leading-7">
                  {totalCapacity}
                </span>
              </div>
            </div>
          </div>

          {/* Tables Table matching exact columns: Table number, Capacity, Status, QR Code, Action */}
          <div className="w-full overflow-x-auto rounded-xl border border-zinc-800 bg-neutral-900/50 shadow-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-900 border-b border-zinc-800">
                  <th className="px-5 py-3 text-white text-sm font-semibold font-['Inter'] leading-5">
                    Table number
                  </th>
                  <th className="px-5 py-3 text-white text-sm font-semibold font-['Inter'] leading-5">
                    Capacity
                  </th>
                  <th className="px-5 py-3 text-white text-sm font-semibold font-['Inter'] leading-5 text-center">
                    Status
                  </th>
                  <th className="px-5 py-3 text-white text-sm font-semibold font-['Inter'] leading-5 text-center">
                    QR Code
                  </th>
                  <th className="px-5 py-3 text-white text-sm font-semibold font-['Inter'] leading-5 text-center">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {tables.map((table) => {
                  return (
                    <tr key={table.id} className="hover:bg-zinc-900/40 transition-colors">
                      {/* Table Number */}
                      <td className="px-5 py-4 text-neutral-200 text-base font-medium font-['Inter'] leading-4">
                        {table.number}
                      </td>

                      {/* Capacity */}
                      <td className="px-5 py-4 text-neutral-200 text-base font-medium font-['Inter'] leading-4">
                        {table.capacity} guests
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3 text-center">
                        <span
                          className={`inline-flex px-3 py-1.5 rounded-md text-sm font-medium font-['Inter'] leading-4 ${
                            table.status === 'Available'
                              ? 'bg-green-500/10 text-green-500'
                              : table.status === 'Occupied'
                              ? 'bg-orange-400/10 text-orange-400'
                              : 'bg-blue-500/10 text-blue-500'
                          }`}
                        >
                          {table.status}
                        </span>
                      </td>

                      {/* View QR Code */}
                      <td className="px-5 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => setViewingQrTable(table)}
                          className="text-yellow-500 hover:text-yellow-400 text-base font-medium font-['Inter'] leading-4 transition-colors underline-offset-4 hover:underline cursor-pointer"
                        >
                          View QR Code
                        </button>
                      </td>

                      {/* Action */}
                      <td className="px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-4">
                          <button
                            type="button"
                            onClick={() => handleOpenEditTable(table)}
                            className="p-1 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                            title="Edit Table"
                          >
                            <Pencil className="size-3.5 stroke-[2]" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingTable(table)}
                            className="p-1 text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                            title="Delete Table"
                          >
                            <Trash2 className="size-3.5 stroke-[2]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. MENU SUB-TAB CONTENT (Matching Figma Snippet 4)                        */}
      {/* ========================================================================= */}
      {activeSubTab === 'Menu' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="w-full overflow-x-auto rounded-xl border border-zinc-800 bg-neutral-900/50 shadow-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-900 border-b border-zinc-800">
                  <th className="px-5 py-3 text-white text-sm font-semibold font-['Inter'] leading-5">
                    Item
                  </th>
                  <th className="px-5 py-3 text-white text-sm font-semibold font-['Inter'] leading-5">
                    Category
                  </th>
                  <th className="px-5 py-3 text-white text-sm font-semibold font-['Inter'] leading-5">
                    Price
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
                {filteredMenuItems.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-900/40 transition-colors">
                    {/* Item */}
                    <td className="px-5 py-4 text-neutral-200 text-base font-medium font-['Inter'] leading-4">
                      {item.name}
                    </td>

                    {/* Category */}
                    <td className="px-5 py-4 text-neutral-200 text-base font-medium font-['Inter'] leading-4">
                      {item.category}
                    </td>

                    {/* Price */}
                    <td className="px-5 py-4 text-neutral-200 text-base font-medium font-['Inter'] leading-4">
                      {item.price}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3 text-center">
                      <span
                        className={`inline-flex px-3 py-1.5 rounded-md text-sm font-medium font-['Inter'] leading-4 ${
                          item.status === 'Active'
                            ? 'bg-green-500/10 text-green-500'
                            : 'bg-neutral-400/20 text-neutral-400'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>

                    {/* Actions matching Figma: Edit, Duplicate, Disable / Enable, Delete */}
                    <td className="px-5 py-4 text-center">
                      <div className="flex items-center justify-center gap-6">
                        <button
                          type="button"
                          onClick={() => handleOpenEditMenu(item)}
                          className="text-neutral-400 hover:text-white text-xs font-normal font-['Inter'] leading-4 transition-colors cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDuplicateMenu(item)}
                          className="text-neutral-400 hover:text-white text-xs font-normal font-['Inter'] leading-4 transition-colors cursor-pointer"
                        >
                          Duplicate
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleMenuStatus(item)}
                          className="text-neutral-400 hover:text-white text-xs font-normal font-['Inter'] leading-4 transition-colors cursor-pointer"
                        >
                          {item.status === 'Active' ? 'Disable' : 'Enable'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingMenuItem(item)}
                          className="text-red-400 hover:text-red-300 text-xs font-normal font-['Inter'] leading-4 transition-colors cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. STAFF SUB-TAB CONTENT (Matching exact Figma Staff Snippet)             */}
      {/* ========================================================================= */}
      {activeSubTab === 'Staff' && (
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
                {filteredStaff.map((member) => (
                  <tr key={member.id} className="hover:bg-zinc-900/40 transition-colors">
                    {/* Staff member */}
                    <td className="px-5 py-4 text-neutral-200 text-base font-medium font-['Inter'] leading-4">
                      {member.name}
                    </td>

                    {/* Role badge (amber-500/10) */}
                    <td className="px-5 py-3">
                      <span className="inline-flex px-3 py-1.5 rounded-md text-sm font-medium font-['Inter'] leading-4 bg-amber-500/10 text-amber-500">
                        {member.role}
                      </span>
                    </td>

                    {/* Branch */}
                    <td className="px-5 py-4 text-neutral-200 text-base font-medium font-['Inter'] leading-4">
                      {member.branch}
                    </td>

                    {/* Status badge */}
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

                    {/* Actions: Edit / Change Role & Deactivate / Activate */}
                    <td className="px-5 py-4 text-center">
                      <div className="flex items-center justify-center gap-6">
                        <button
                          type="button"
                          onClick={() => handleOpenEditStaff(member)}
                          className="text-neutral-400 hover:text-white text-xs font-normal font-['Inter'] leading-4 transition-colors cursor-pointer"
                        >
                          Edit / Change Role
                        </button>
                        {member.status === 'Active' ? (
                          <button
                            type="button"
                            onClick={() => handleToggleStaffStatus(member)}
                            className="text-red-400 hover:text-red-300 text-xs font-normal font-['Inter'] leading-4 transition-colors cursor-pointer"
                          >
                            Deactivate
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleToggleStaffStatus(member)}
                            className="text-green-500 hover:text-green-400 text-xs font-normal font-['Inter'] leading-4 transition-colors cursor-pointer"
                          >
                            Activate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: ADD TABLE MODAL (Pixel-Perfect to uploaded Image & Snippet)      */}
      {/* ========================================================================= */}
      {isAddTableOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-[560px] max-w-full p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-800 flex flex-col justify-start items-center gap-4 shadow-2xl animate-in fade-in scale-95 duration-150">
            {/* Header */}
            <div className="w-full flex justify-between items-start">
              <div className="flex flex-col justify-start items-start gap-1">
                <h3 className="text-white text-lg font-medium font-['Poppins'] leading-5">
                  Add Table
                </h3>
                <p className="text-neutral-400 text-xs font-normal font-['Poppins'] leading-4">
                  Complete the details below, then save your changes.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsAddTableOpen(false)}
                className="w-9 px-2.5 py-2 bg-gray-300/10 hover:bg-gray-300/20 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 flex justify-center items-center text-gray-200 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Divider */}
            <div className="w-full h-0 outline outline-1 outline-offset-[-0.50px] outline-neutral-800" />

            {/* Form Fields Container */}
            <form onSubmit={handleSaveAddTable} className="w-full flex flex-col gap-4">
              <div className="w-full p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-800 flex flex-col justify-start items-center gap-4">
                {/* Table Number */}
                <div className="self-stretch flex flex-col justify-start items-start gap-2">
                  <label className="text-white text-sm font-normal font-['Inter'] leading-4">
                    Table Number
                  </label>
                  <input
                    type="text"
                    required
                    value={tableForm.number}
                    onChange={(e) => setTableForm({ ...tableForm, number: e.target.value })}
                    placeholder="e.g. T-05"
                    className="self-stretch h-11 px-3.5 py-3 bg-neutral-900 rounded-lg border border-neutral-800 text-stone-200 text-sm focus:outline-none focus:border-amber-400 font-['Inter']"
                  />
                </div>

                {/* Capacity & Status */}
                <div className="self-stretch grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Capacity */}
                  <div className="flex flex-col justify-start items-start gap-2">
                    <label className="text-white text-sm font-normal font-['Inter'] leading-4">
                      Capacity
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={40}
                      required
                      value={tableForm.capacity}
                      onChange={(e) => setTableForm({ ...tableForm, capacity: Number(e.target.value) })}
                      className="self-stretch h-11 px-3.5 py-3 bg-neutral-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 text-stone-300 text-sm focus:outline-none focus:border-amber-400 font-['Inter']"
                    />
                  </div>

                  {/* Status */}
                  <div className="flex flex-col justify-start items-start gap-2">
                    <label className="text-white text-sm font-normal font-['Inter'] leading-4">
                      Status
                    </label>
                    <div className="self-stretch relative">
                      <select
                        value={tableForm.status}
                        onChange={(e) => setTableForm({ ...tableForm, status: e.target.value as any })}
                        className="w-full h-11 px-3.5 py-3 bg-neutral-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 text-stone-300 text-sm font-normal font-['Inter'] appearance-none focus:outline-none focus:border-amber-400 cursor-pointer"
                      >
                        <option value="Available">Available</option>
                        <option value="Occupied">Occupied</option>
                        <option value="Reserved">Reserved</option>
                      </select>
                      <ChevronDown className="size-4 text-stone-300 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Automatic Generate QR Section (Exact match to uploaded image) */}
              <div className="w-full flex flex-col justify-start items-center gap-3 py-1">
                <span className="text-stone-500 text-sm font-normal font-['Inter'] leading-4">
                  Automatic Generate
                </span>

                {/* Viewfinder frame with yellow corner brackets */}
                <div className="relative size-28 bg-neutral-950 rounded-[4px] p-2 flex items-center justify-center border border-neutral-800/80 shadow-inner">
                  {/* Yellow corner brackets */}
                  <div className="absolute top-1 left-1 size-3.5 border-t-2 border-l-2 border-yellow-400 rounded-tl-[2px] pointer-events-none" />
                  <div className="absolute top-1 right-1 size-3.5 border-t-2 border-r-2 border-yellow-400 rounded-tr-[2px] pointer-events-none" />
                  <div className="absolute bottom-1 left-1 size-3.5 border-b-2 border-l-2 border-yellow-400 rounded-bl-[2px] pointer-events-none" />
                  <div className="absolute bottom-1 right-1 size-3.5 border-b-2 border-r-2 border-yellow-400 rounded-br-[2px] pointer-events-none" />

                  <TableQrMatrix seed={qrSeed} size={88} lightColor="#facc15" darkColor="#0a0a0a" />
                </div>

                {/* Re-generate button */}
                <button
                  type="button"
                  onClick={handleRegenerateQr}
                  className="inline-flex justify-center items-center gap-1.5 text-yellow-400 hover:text-yellow-300 text-sm font-normal font-['Inter'] leading-4 transition-colors cursor-pointer"
                >
                  <RefreshCw className={`size-3.5 text-yellow-400 ${isRegenerating ? 'animate-spin' : ''}`} />
                  <span>Re-generate</span>
                </button>
              </div>

              {/* Modal Action Buttons matching Image: Cancel & Save */}
              <div className="inline-flex justify-end items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddTableOpen(false)}
                  className="px-3 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 text-white text-base font-medium font-['Inter'] leading-5 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-yellow-400 hover:bg-yellow-300 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 text-neutral-800 text-base font-medium font-['Inter'] leading-5 transition-colors cursor-pointer shadow-sm"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: EDIT TABLE MODAL (Matching Figma Snippet 2)                      */}
      {/* ========================================================================= */}
      {editingTable && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-[560px] max-w-full p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-800 flex flex-col justify-start items-center gap-4 shadow-2xl animate-in fade-in scale-95 duration-150">
            {/* Header */}
            <div className="w-full flex justify-between items-start">
              <div className="flex flex-col justify-start items-start gap-1">
                <h3 className="text-white text-lg font-medium font-['Poppins'] leading-5">
                  Edit Table
                </h3>
                <p className="text-neutral-400 text-xs font-normal font-['Poppins'] leading-4">
                  Complete the details below, then save your changes.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setEditingTable(null)}
                className="w-9 px-2.5 py-2 bg-gray-300/10 hover:bg-gray-300/20 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 flex justify-center items-center text-gray-200 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Divider */}
            <div className="w-full h-0 outline outline-1 outline-offset-[-0.50px] outline-neutral-800" />

            {/* Form Fields Container */}
            <form onSubmit={handleSaveEditTable} className="w-full flex flex-col gap-4">
              <div className="w-full p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-800 flex flex-col justify-start items-center gap-4">
                {/* Table Number */}
                <div className="self-stretch flex flex-col justify-start items-start gap-2">
                  <label className="text-white text-sm font-normal font-['Inter'] leading-4">
                    Table Number
                  </label>
                  <input
                    type="text"
                    required
                    value={tableForm.number}
                    onChange={(e) => setTableForm({ ...tableForm, number: e.target.value })}
                    className="self-stretch h-11 px-3.5 py-3 bg-neutral-900 rounded-lg border border-neutral-800 text-stone-200 text-sm focus:outline-none focus:border-amber-400 font-['Inter']"
                  />
                </div>

                {/* Capacity & Status */}
                <div className="self-stretch grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Capacity */}
                  <div className="flex flex-col justify-start items-start gap-2">
                    <label className="text-white text-sm font-normal font-['Inter'] leading-4">
                      Capacity
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={40}
                      required
                      value={tableForm.capacity}
                      onChange={(e) => setTableForm({ ...tableForm, capacity: Number(e.target.value) })}
                      className="self-stretch h-11 px-3.5 py-3 bg-neutral-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 text-stone-300 text-sm focus:outline-none focus:border-amber-400 font-['Inter']"
                    />
                  </div>

                  {/* Status */}
                  <div className="flex flex-col justify-start items-start gap-2">
                    <label className="text-white text-sm font-normal font-['Inter'] leading-4">
                      Status
                    </label>
                    <div className="self-stretch relative">
                      <select
                        value={tableForm.status}
                        onChange={(e) => setTableForm({ ...tableForm, status: e.target.value as any })}
                        className="w-full h-11 px-3.5 py-3 bg-neutral-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 text-stone-300 text-sm font-normal font-['Inter'] appearance-none focus:outline-none focus:border-amber-400 cursor-pointer"
                      >
                        <option value="Available">Available</option>
                        <option value="Occupied">Occupied</option>
                        <option value="Reserved">Reserved</option>
                      </select>
                      <ChevronDown className="size-4 text-stone-300 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Automatic Generate QR Section */}
              <div className="w-full flex flex-col justify-start items-center gap-3 py-1">
                <span className="text-stone-500 text-sm font-normal font-['Inter'] leading-4">
                  Automatic Generate
                </span>

                <div className="relative size-28 bg-neutral-950 rounded-[4px] p-2 flex items-center justify-center border border-neutral-800/80 shadow-inner">
                  <div className="absolute top-1 left-1 size-3.5 border-t-2 border-l-2 border-yellow-400 rounded-tl-[2px] pointer-events-none" />
                  <div className="absolute top-1 right-1 size-3.5 border-t-2 border-r-2 border-yellow-400 rounded-tr-[2px] pointer-events-none" />
                  <div className="absolute bottom-1 left-1 size-3.5 border-b-2 border-l-2 border-yellow-400 rounded-bl-[2px] pointer-events-none" />
                  <div className="absolute bottom-1 right-1 size-3.5 border-b-2 border-r-2 border-yellow-400 rounded-br-[2px] pointer-events-none" />

                  <TableQrMatrix seed={qrSeed} size={88} lightColor="#facc15" darkColor="#0a0a0a" />
                </div>

                <button
                  type="button"
                  onClick={handleRegenerateQr}
                  className="inline-flex justify-center items-center gap-1.5 text-yellow-400 hover:text-yellow-300 text-sm font-normal font-['Inter'] leading-4 transition-colors cursor-pointer"
                >
                  <RefreshCw className={`size-3.5 text-yellow-400 ${isRegenerating ? 'animate-spin' : ''}`} />
                  <span>Re-generate</span>
                </button>
              </div>

              {/* Modal Action Buttons: Cancel & Save Changes */}
              <div className="inline-flex justify-end items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingTable(null)}
                  className="px-3 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 text-white text-base font-medium font-['Inter'] leading-5 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-yellow-400 hover:bg-yellow-300 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 text-neutral-800 text-base font-medium font-['Inter'] leading-5 transition-colors cursor-pointer shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: DELETE TABLE MODAL (Matching Figma Snippet 3: "Delete T-01?")    */}
      {/* ========================================================================= */}
      {deletingTable && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-[452px] max-w-full px-5 py-6 bg-neutral-900 rounded-[10px] flex flex-col justify-start items-center gap-6 shadow-2xl animate-in fade-in scale-95 duration-150">
            <div className="self-stretch flex flex-col justify-center items-center gap-5">
              <div className="self-stretch flex flex-col justify-start items-center gap-4">
                {/* Red Danger Badge with Trash icon */}
                <div className="px-4 py-3 bg-red-400/20 rounded-md outline outline-1 outline-offset-[-1px] outline-red-400/40 inline-flex justify-center items-center gap-1.5">
                  <Trash2 className="size-8 text-red-400 stroke-[1.75]" />
                </div>

                <div className="self-stretch flex flex-col justify-start items-center gap-2.5">
                  <h3 className="self-stretch text-center text-white text-lg font-medium font-['Inter'] leading-5">
                    Delete {deletingTable.number}?
                  </h3>
                  <p className="w-80 text-center text-neutral-400 text-xs font-normal font-['Inter'] leading-4">
                    This action cannot be undone. The item will be permanently removed.
                  </p>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="self-stretch h-0 outline outline-1 outline-offset-[-0.50px] outline-neutral-800" />

            {/* Buttons: Cancel & Delete */}
            <div className="self-stretch inline-flex justify-center items-start gap-2">
              <button
                type="button"
                onClick={() => setDeletingTable(null)}
                className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 text-white text-base font-medium font-['Inter'] leading-5 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteTable}
                className="px-4 py-2.5 bg-red-400/10 hover:bg-red-400/20 rounded-lg outline outline-1 outline-offset-[-1px] outline-red-400/40 text-red-400 text-base font-medium font-['Inter'] leading-5 transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: VIEW QR CODE MODAL (High-res View with Print & Download)        */}
      {/* ========================================================================= */}
      {viewingQrTable && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-[460px] max-w-full p-6 bg-neutral-900 rounded-2xl outline outline-1 outline-neutral-800 flex flex-col items-center gap-5 shadow-2xl animate-in fade-in scale-95 duration-150">
            <div className="w-full flex justify-between items-start">
              <div>
                <h3 className="text-white text-lg font-semibold font-['Inter']">
                  Table {viewingQrTable.number}
                </h3>
                <p className="text-neutral-400 text-xs font-normal">
                  {branch.name} · {viewingQrTable.capacity} guests
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewingQrTable(null)}
                className="p-1.5 text-neutral-400 hover:text-white rounded-lg transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* QR Standee Card Preview */}
            <div className="w-full p-6 bg-neutral-950 rounded-xl border border-neutral-800 flex flex-col items-center gap-4">
              <span className="text-xs uppercase tracking-wider text-amber-400 font-semibold">
                Tavonza Smart Dining
              </span>

              <div className="relative p-3 bg-white rounded-lg shadow-xl">
                <TableQrMatrix seed={viewingQrTable.number.charCodeAt(1) * 7} size={160} lightColor="#000000" darkColor="#ffffff" />
              </div>

              <div className="text-center">
                <p className="text-white font-medium text-sm">Scan to Order & Pay</p>
                <p className="text-neutral-500 text-xs">Table {viewingQrTable.number} · {branch.name}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="w-full grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(viewingQrTable.qrCodeUrl);
                  toast.success('QR Code link copied to clipboard!');
                }}
                className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 transition-colors"
              >
                <Copy className="size-3.5" />
                <span>Copy Link</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  toast.success(`Printing standee label for ${viewingQrTable.number}...`);
                }}
                className="px-3 py-2 bg-yellow-400 hover:bg-yellow-300 text-neutral-900 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 transition-colors"
              >
                <Printer className="size-3.5" />
                <span>Print Standee</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: ADD MENU ITEM MODAL                                              */}
      {/* ========================================================================= */}
      {isAddMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-[520px] max-w-full p-5 bg-neutral-900 rounded-xl outline outline-1 outline-neutral-800 flex flex-col gap-4 shadow-2xl animate-in fade-in scale-95 duration-150">
            <div className="w-full flex justify-between items-start">
              <div>
                <h3 className="text-white text-lg font-medium font-['Poppins']">
                  Add Menu Item
                </h3>
                <p className="text-neutral-400 text-xs">
                  Create a new culinary dish or beverage for {branch.name}.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddMenuOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-white"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAddMenu} className="flex flex-col gap-4 pt-1">
              <div className="flex flex-col gap-2">
                <label className="text-white text-sm font-normal">Item Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Crispy Duck Confit"
                  value={menuForm.name}
                  onChange={(e) => setMenuForm({ ...menuForm, name: e.target.value })}
                  className="h-11 px-3.5 py-3 bg-neutral-900 rounded-lg border border-neutral-800 text-stone-200 text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-2">
                  <label className="text-white text-sm font-normal">Category</label>
                  <select
                    value={menuForm.category}
                    onChange={(e) => setMenuForm({ ...menuForm, category: e.target.value })}
                    className="h-11 px-3 bg-neutral-900 rounded-lg border border-neutral-800 text-stone-300 text-sm focus:outline-none focus:border-amber-400"
                  >
                    <option value="Main Course">Main Course</option>
                    <option value="Starters">Starters</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Desserts">Desserts</option>
                    <option value="Sides">Sides</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-white text-sm font-normal">Price</label>
                  <input
                    type="text"
                    required
                    placeholder="$12.20"
                    value={menuForm.price}
                    onChange={(e) => setMenuForm({ ...menuForm, price: e.target.value })}
                    className="h-11 px-3.5 py-3 bg-neutral-900 rounded-lg border border-neutral-800 text-stone-200 text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-white text-sm font-normal">Status</label>
                <select
                  value={menuForm.status}
                  onChange={(e) => setMenuForm({ ...menuForm, status: e.target.value as any })}
                  className="h-11 px-3 bg-neutral-900 rounded-lg border border-neutral-800 text-stone-300 text-sm focus:outline-none focus:border-amber-400"
                >
                  <option value="Active">Active</option>
                  <option value="Disable">Disable</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddMenuOpen(false)}
                  className="px-3 py-2 bg-zinc-800 text-white rounded-lg text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-neutral-900 rounded-lg text-sm font-medium"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: EDIT MENU ITEM MODAL                                             */}
      {/* ========================================================================= */}
      {editingMenuItem && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-[520px] max-w-full p-5 bg-neutral-900 rounded-xl outline outline-1 outline-neutral-800 flex flex-col gap-4 shadow-2xl animate-in fade-in scale-95 duration-150">
            <div className="w-full flex justify-between items-start">
              <div>
                <h3 className="text-white text-lg font-medium font-['Poppins']">
                  Edit Menu Item
                </h3>
                <p className="text-neutral-400 text-xs">
                  Modify details for this dish or drink.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingMenuItem(null)}
                className="p-1.5 text-neutral-400 hover:text-white"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditMenu} className="flex flex-col gap-4 pt-1">
              <div className="flex flex-col gap-2">
                <label className="text-white text-sm font-normal">Item Name</label>
                <input
                  type="text"
                  required
                  value={menuForm.name}
                  onChange={(e) => setMenuForm({ ...menuForm, name: e.target.value })}
                  className="h-11 px-3.5 py-3 bg-neutral-900 rounded-lg border border-neutral-800 text-stone-200 text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-2">
                  <label className="text-white text-sm font-normal">Category</label>
                  <select
                    value={menuForm.category}
                    onChange={(e) => setMenuForm({ ...menuForm, category: e.target.value })}
                    className="h-11 px-3 bg-neutral-900 rounded-lg border border-neutral-800 text-stone-300 text-sm focus:outline-none focus:border-amber-400"
                  >
                    <option value="Main Course">Main Course</option>
                    <option value="Starters">Starters</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Desserts">Desserts</option>
                    <option value="Sides">Sides</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-white text-sm font-normal">Price</label>
                  <input
                    type="text"
                    required
                    value={menuForm.price}
                    onChange={(e) => setMenuForm({ ...menuForm, price: e.target.value })}
                    className="h-11 px-3.5 py-3 bg-neutral-900 rounded-lg border border-neutral-800 text-stone-200 text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-white text-sm font-normal">Status</label>
                <select
                  value={menuForm.status}
                  onChange={(e) => setMenuForm({ ...menuForm, status: e.target.value as any })}
                  className="h-11 px-3 bg-neutral-900 rounded-lg border border-neutral-800 text-stone-300 text-sm focus:outline-none focus:border-amber-400"
                >
                  <option value="Active">Active</option>
                  <option value="Disable">Disable</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingMenuItem(null)}
                  className="px-3 py-2 bg-zinc-800 text-white rounded-lg text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-neutral-900 rounded-lg text-sm font-medium"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 7: DELETE MENU ITEM MODAL                                           */}
      {/* ========================================================================= */}
      {deletingMenuItem && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-[452px] max-w-full px-5 py-6 bg-neutral-900 rounded-[10px] flex flex-col justify-start items-center gap-6 shadow-2xl animate-in fade-in scale-95 duration-150">
            <div className="self-stretch flex flex-col justify-center items-center gap-5">
              <div className="self-stretch flex flex-col justify-start items-center gap-4">
                <div className="px-4 py-3 bg-red-400/20 rounded-md outline outline-1 outline-offset-[-1px] outline-red-400/40 inline-flex justify-center items-center gap-1.5">
                  <Trash2 className="size-8 text-red-400 stroke-[1.75]" />
                </div>

                <div className="self-stretch flex flex-col justify-start items-center gap-2.5">
                  <h3 className="self-stretch text-center text-white text-lg font-medium font-['Inter'] leading-5">
                    Delete &ldquo;{deletingMenuItem.name}&rdquo;?
                  </h3>
                  <p className="w-80 text-center text-neutral-400 text-xs font-normal font-['Inter'] leading-4">
                    This item will be permanently removed from this branch menu.
                  </p>
                </div>
              </div>
            </div>

            <div className="self-stretch h-0 outline outline-1 outline-offset-[-0.50px] outline-neutral-800" />

            <div className="self-stretch inline-flex justify-center items-start gap-2">
              <button
                type="button"
                onClick={() => setDeletingMenuItem(null)}
                className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 text-white text-base font-medium font-['Inter'] leading-5 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteMenu}
                className="px-4 py-2.5 bg-red-400/10 hover:bg-red-400/20 rounded-lg outline outline-1 outline-offset-[-1px] outline-red-400/40 text-red-400 text-base font-medium font-['Inter'] leading-5 transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 8: INVITE STAFF MODAL (Exact match to user's Figma Snippet)         */}
      {/* ========================================================================= */}
      {isInviteStaffOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-[560px] max-w-full p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-800 flex flex-col justify-start items-end gap-4 shadow-2xl animate-in fade-in scale-95 duration-150">
            {/* Modal Header */}
            <div className="w-full flex justify-between items-start">
              <div className="w-96 flex flex-col justify-start items-start gap-1">
                <h3 className="text-white text-lg font-medium font-['Poppins'] leading-5">
                  Invite Staff
                </h3>
                <p className="text-neutral-400 text-xs font-normal font-['Poppins'] leading-4">
                  Complete the details below, then save your changes.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsInviteStaffOpen(false)}
                className="w-9 px-2.5 py-2 bg-gray-300/10 hover:bg-gray-300/20 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 flex justify-center items-center text-gray-200 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Divider */}
            <div className="w-full h-0 outline outline-1 outline-offset-[-0.50px] outline-neutral-800" />

            {/* Form Container */}
            <form onSubmit={handleSaveInviteStaff} className="w-full flex flex-col gap-4">
              <div className="w-full p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-800 flex flex-col justify-start items-center gap-4">
                {/* Full Name */}
                <div className="self-stretch flex flex-col justify-start items-start gap-2">
                  <label className="text-white text-sm font-normal font-['Inter'] leading-4">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Liam Henderson"
                    value={inviteForm.name}
                    onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                    className="self-stretch h-11 px-3.5 py-3 bg-neutral-900 rounded-lg border border-neutral-800 text-stone-200 text-sm focus:outline-none focus:border-amber-400 font-['Inter']"
                  />
                </div>

                {/* Role & Branch */}
                <div className="self-stretch grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Role */}
                  <div className="flex flex-col justify-start items-start gap-2">
                    <label className="text-white text-sm font-normal font-['Inter'] leading-4">
                      Role
                    </label>
                    <div className="self-stretch relative">
                      <select
                        value={inviteForm.role}
                        onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                        className="w-full h-11 px-3.5 py-3 bg-neutral-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 text-stone-300 text-sm font-normal font-['Inter'] appearance-none focus:outline-none focus:border-amber-400 cursor-pointer"
                      >
                        <option value="Manager">Manager</option>
                        <option value="Branch Manager">Branch Manager</option>
                        <option value="Waiter">Waiter</option>
                        <option value="Chef">Chef</option>
                        <option value="Cashier">Cashier</option>
                      </select>
                      <ChevronDown className="size-4 text-stone-300 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Branch */}
                  <div className="flex flex-col justify-start items-start gap-2">
                    <label className="text-white text-sm font-normal font-['Inter'] leading-4">
                      Branch
                    </label>
                    <div className="self-stretch relative">
                      <select
                        value={inviteForm.branch}
                        onChange={(e) => setInviteForm({ ...inviteForm, branch: e.target.value })}
                        className="w-full h-11 px-3.5 py-3 bg-neutral-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 text-stone-300 text-sm font-normal font-['Inter'] appearance-none focus:outline-none focus:border-amber-400 cursor-pointer"
                      >
                        <option value="Georgia Flagship">Georgia Flagship</option>
                        <option value="Florida Flagship">Florida Flagship</option>
                        <option value="Illinois Flagship">Illinois Flagship</option>
                        <option value="Texas Flagship">Texas Flagship</option>
                        <option value="Gulshan Flagship">Gulshan Flagship</option>
                        {branch.name && <option value={branch.name}>{branch.name}</option>}
                      </select>
                      <ChevronDown className="size-4 text-stone-300 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Buttons: Cancel & Save */}
              <div className="inline-flex justify-end items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsInviteStaffOpen(false)}
                  className="px-3 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 text-white text-base font-medium font-['Inter'] leading-5 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-2.5 bg-yellow-400 hover:bg-yellow-300 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 text-neutral-800 text-base font-medium font-['Inter'] leading-5 transition-colors cursor-pointer shadow-sm"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 9: EDIT / CHANGE ROLE MODAL                                         */}
      {/* ========================================================================= */}
      {editingStaff && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-[560px] max-w-full p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-800 flex flex-col justify-start items-end gap-4 shadow-2xl animate-in fade-in scale-95 duration-150">
            {/* Modal Header */}
            <div className="w-full flex justify-between items-start">
              <div className="w-96 flex flex-col justify-start items-start gap-1">
                <h3 className="text-white text-lg font-medium font-['Poppins'] leading-5">
                  Edit / Change Role
                </h3>
                <p className="text-neutral-400 text-xs font-normal font-['Poppins'] leading-4">
                  Complete the details below, then save your changes.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setEditingStaff(null)}
                className="w-9 px-2.5 py-2 bg-gray-300/10 hover:bg-gray-300/20 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 flex justify-center items-center text-gray-200 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Divider */}
            <div className="w-full h-0 outline outline-1 outline-offset-[-0.50px] outline-neutral-800" />

            {/* Form Container */}
            <form onSubmit={handleSaveEditStaff} className="w-full flex flex-col gap-4">
              <div className="w-full p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-800 flex flex-col justify-start items-center gap-4">
                {/* Full Name */}
                <div className="self-stretch flex flex-col justify-start items-start gap-2">
                  <label className="text-white text-sm font-normal font-['Inter'] leading-4">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editStaffForm.name}
                    onChange={(e) => setEditStaffForm({ ...editStaffForm, name: e.target.value })}
                    className="self-stretch h-11 px-3.5 py-3 bg-neutral-900 rounded-lg border border-neutral-800 text-stone-200 text-sm focus:outline-none focus:border-amber-400 font-['Inter']"
                  />
                </div>

                {/* Role & Branch */}
                <div className="self-stretch grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Role */}
                  <div className="flex flex-col justify-start items-start gap-2">
                    <label className="text-white text-sm font-normal font-['Inter'] leading-4">
                      Role
                    </label>
                    <div className="self-stretch relative">
                      <select
                        value={editStaffForm.role}
                        onChange={(e) => setEditStaffForm({ ...editStaffForm, role: e.target.value })}
                        className="w-full h-11 px-3.5 py-3 bg-neutral-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 text-stone-300 text-sm font-normal font-['Inter'] appearance-none focus:outline-none focus:border-amber-400 cursor-pointer"
                      >
                        <option value="Manager">Manager</option>
                        <option value="Branch Manager">Branch Manager</option>
                        <option value="Waiter">Waiter</option>
                        <option value="Chef">Chef</option>
                        <option value="Cashier">Cashier</option>
                      </select>
                      <ChevronDown className="size-4 text-stone-300 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Branch */}
                  <div className="flex flex-col justify-start items-start gap-2">
                    <label className="text-white text-sm font-normal font-['Inter'] leading-4">
                      Branch
                    </label>
                    <div className="self-stretch relative">
                      <select
                        value={editStaffForm.branch}
                        onChange={(e) => setEditStaffForm({ ...editStaffForm, branch: e.target.value })}
                        className="w-full h-11 px-3.5 py-3 bg-neutral-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 text-stone-300 text-sm font-normal font-['Inter'] appearance-none focus:outline-none focus:border-amber-400 cursor-pointer"
                      >
                        <option value="Georgia Flagship">Georgia Flagship</option>
                        <option value="Florida Flagship">Florida Flagship</option>
                        <option value="Illinois Flagship">Illinois Flagship</option>
                        <option value="Texas Flagship">Texas Flagship</option>
                        <option value="Gulshan Flagship">Gulshan Flagship</option>
                      </select>
                      <ChevronDown className="size-4 text-stone-300 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="self-stretch flex flex-col justify-start items-start gap-2">
                  <label className="text-white text-sm font-normal font-['Inter'] leading-4">
                    Status
                  </label>
                  <div className="self-stretch relative">
                    <select
                      value={editStaffForm.status}
                      onChange={(e) => setEditStaffForm({ ...editStaffForm, status: e.target.value as any })}
                      className="w-full h-11 px-3.5 py-3 bg-neutral-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 text-stone-300 text-sm font-normal font-['Inter'] appearance-none focus:outline-none focus:border-amber-400 cursor-pointer"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                    <ChevronDown className="size-4 text-stone-300 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Modal Buttons: Cancel & Save Changes */}
              <div className="inline-flex justify-end items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setEditingStaff(null)}
                  className="px-3 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 text-white text-base font-medium font-['Inter'] leading-5 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-2.5 bg-yellow-400 hover:bg-yellow-300 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 text-neutral-800 text-base font-medium font-['Inter'] leading-5 transition-colors cursor-pointer shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 10: EDIT BRANCH MODAL (Matching Figma Snippet 2)                    */}
      {/* ========================================================================= */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-[560px] max-w-full p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-800 flex flex-col justify-start items-end gap-4 shadow-2xl animate-in fade-in scale-95 duration-150">
            {/* Modal Header */}
            <div className="w-full flex justify-between items-start">
              <div className="w-96 flex flex-col justify-start items-start gap-1">
                <h3 className="text-white text-lg font-medium font-['Poppins'] leading-5">
                  Edit Branch
                </h3>
                <p className="text-neutral-400 text-xs font-normal font-['Poppins'] leading-4">
                  Complete the details below, then save your changes.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsEditOpen(false)}
                className="w-9 px-2.5 py-2 bg-gray-300/10 hover:bg-gray-300/20 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 flex justify-center items-center text-gray-200 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Divider */}
            <div className="w-full h-0 outline outline-1 outline-offset-[-0.50px] outline-neutral-800" />

            {/* Form Container */}
            <form onSubmit={handleEditSubmit} className="w-full flex flex-col gap-4">
              <div className="w-full p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-800 flex flex-col justify-start items-center gap-4">
                {/* Row 1: Restaurant & Branch Name */}
                <div className="self-stretch grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col justify-start items-start gap-2">
                    <label className="text-white text-sm font-normal font-['Inter'] leading-4">
                      Restaurant
                    </label>
                    <div className="self-stretch relative">
                      <select
                        value={editForm.restaurantId}
                        onChange={(e) => {
                          const selected = MOCK_RESTAURANTS.find((r) => r.id === e.target.value);
                          setEditForm({
                            ...editForm,
                            restaurantId: e.target.value,
                            restaurantName: selected ? selected.name : editForm.restaurantName,
                          });
                        }}
                        className="w-full h-11 px-3.5 py-3 bg-neutral-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 text-stone-300 text-sm font-normal font-['Inter'] appearance-none focus:outline-none focus:border-amber-400 cursor-pointer"
                      >
                        {MOCK_RESTAURANTS.map((rest) => (
                          <option key={rest.id} value={rest.id}>
                            {rest.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="size-4 text-stone-300 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div className="flex flex-col justify-start items-start gap-2">
                    <label className="text-white text-sm font-normal font-['Inter'] leading-4">
                      Branch Name
                    </label>
                    <input
                      type="text"
                      required
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm({ ...editForm, name: e.target.value })
                      }
                      className="self-stretch h-11 px-3.5 py-3 bg-neutral-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 text-stone-200 text-sm focus:outline-none focus:border-amber-400 font-['Inter']"
                    />
                  </div>
                </div>

                {/* Row 2: Address & Contact Number */}
                <div className="self-stretch grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col justify-start items-start gap-2">
                    <label className="text-white text-sm font-normal font-['Inter'] leading-4">
                      Address
                    </label>
                    <input
                      type="text"
                      value={editForm.address}
                      onChange={(e) =>
                        setEditForm({ ...editForm, address: e.target.value })
                      }
                      className="self-stretch h-11 px-3.5 py-3 bg-neutral-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 text-stone-200 text-sm focus:outline-none focus:border-amber-400 font-['Inter']"
                    />
                  </div>

                  <div className="flex flex-col justify-start items-start gap-2">
                    <label className="text-white text-sm font-normal font-['Inter'] leading-4">
                      Contact Number
                    </label>
                    <input
                      type="text"
                      value={editForm.contactNumber}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          contactNumber: e.target.value,
                        })
                      }
                      className="self-stretch h-11 px-3.5 py-3 bg-neutral-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 text-stone-200 text-sm focus:outline-none focus:border-amber-400 font-['Inter']"
                    />
                  </div>
                </div>

                {/* Row 3: Branch Manager & Status */}
                <div className="self-stretch grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col justify-start items-start gap-2">
                    <label className="text-white text-sm font-normal font-['Inter'] leading-4">
                      Branch Manager
                    </label>
                    <div className="self-stretch relative">
                      <select
                        value={editForm.manager}
                        onChange={(e) =>
                          setEditForm({ ...editForm, manager: e.target.value })
                        }
                        className="w-full h-11 px-3.5 py-3 bg-neutral-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 text-stone-300 text-sm font-normal font-['Inter'] appearance-none focus:outline-none focus:border-amber-400 cursor-pointer"
                      >
                        <option value="Nobin Mille">Nobin Mille</option>
                        <option value="Samira Khan">Samira Khan</option>
                        <option value="Mikel">Mikel</option>
                        <option value="Glory">Glory</option>
                        <option value="Robert Geo">Robert Geo</option>
                      </select>
                      <ChevronDown className="size-4 text-stone-300 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div className="flex flex-col justify-start items-start gap-2">
                    <label className="text-white text-sm font-normal font-['Inter'] leading-4">
                      Status
                    </label>
                    <div className="self-stretch relative">
                      <select
                        value={editForm.status}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            status: e.target.value as 'Active' | 'Setup' | 'Closed',
                          })
                        }
                        className="w-full h-11 px-3.5 py-3 bg-neutral-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 text-stone-300 text-sm font-normal font-['Inter'] appearance-none focus:outline-none focus:border-amber-400 cursor-pointer"
                      >
                        <option value="Active">Active</option>
                        <option value="Setup">Setup</option>
                        <option value="Closed">Closed</option>
                      </select>
                      <ChevronDown className="size-4 text-stone-300 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Row 4: Opening Time & Closing Time */}
                <div className="self-stretch grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col justify-start items-start gap-2">
                    <label className="text-white text-sm font-normal font-['Inter'] leading-4">
                      Opening Time
                    </label>
                    <div className="self-stretch relative">
                      <input
                        type="text"
                        value={editForm.openingTime}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            openingTime: e.target.value,
                          })
                        }
                        placeholder="09:00"
                        className="w-full h-11 px-3.5 py-3 bg-neutral-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 text-stone-300 text-sm font-normal font-['Inter'] focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col justify-start items-start gap-2">
                    <label className="text-white text-sm font-normal font-['Inter'] leading-4">
                      Closing Time
                    </label>
                    <input
                      type="text"
                      value={editForm.closingTime}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          closingTime: e.target.value,
                        })
                      }
                      placeholder="23:00"
                      className="self-stretch h-11 px-3.5 py-3 bg-neutral-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 text-stone-300 text-sm font-normal font-['Inter'] focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer Buttons matching Figma snippet */}
              <div className="inline-flex justify-end items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-3 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 text-white text-base font-medium font-['Inter'] leading-5 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-2.5 bg-yellow-400 hover:bg-yellow-300 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 text-neutral-800 text-base font-medium font-['Inter'] leading-5 transition-colors cursor-pointer shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
