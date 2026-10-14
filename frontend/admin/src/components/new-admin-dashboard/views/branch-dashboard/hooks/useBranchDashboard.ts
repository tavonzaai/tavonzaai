import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { BranchItem, RestaurantItem } from '../../../types';
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
  useCreateBranchStaffMutation,
  useCreateMenuCategoryMutation,
  useCreateMenuItemMutation,
  useCreateTableMutation,
  useDeleteMenuItemMutation,
  useDeleteTableMutation,
  useGetBranchStaffQuery,
  useGetMenuCategoriesQuery,
  useGetMenuItemsQuery,
  useGetRestaurantsQuery,
  useGetTablesQuery,
  useRegenerateTableQrMutation,
  useSetOperatingHoursMutation,
  useUpdateBranchMutation,
  useUpdateBranchStaffMutation,
  useUpdateMenuItemMutation,
  useUpdateTableMutation,
} from '@/redux/features/adminApi';
import { useOrganizationId } from '@/hooks/useOrganizationId';
import { getCustomerAppUrl } from '@/redux/api/baseApi';
import { mapRestaurant, parseBranchAddress } from '@/lib/admin-mappers';

const isValidUUID = (val?: string) =>
  Boolean(val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val));

interface UseBranchDashboardProps {
  initialBranch: BranchItem;
  onUpdateBranch?: (updated: BranchItem) => void;
}

function mapTableStatus(serviceStatus?: string, operationalFlag?: string): TableItem['status'] {
  if (operationalFlag === 'RESERVED') return 'Reserved';
  if (serviceStatus === 'AVAILABLE') return 'Available';
  return 'Occupied';
}

function weekHours(openTime: string, closeTime: string) {
  return Array.from({ length: 7 }, (_, dayOfWeek) => ({ dayOfWeek, openTime, closeTime }));
}

export function useBranchDashboard({
  initialBranch,
  onUpdateBranch,
}: UseBranchDashboardProps) {
  const organizationId = useOrganizationId();
  const [branch, setBranch] = useState<BranchItem>(initialBranch);
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('Overview');
  const [activeBranchId, setActiveBranchId] = useState<string>(initialBranch.id);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const { data: restaurantsData } = useGetRestaurantsQuery(
    { organizationId: organizationId || undefined, page: 1, limit: 100 },
    { skip: !organizationId },
  );
  const restaurants: RestaurantItem[] = useMemo(
    () => (restaurantsData?.data || []).map((item) => mapRestaurant(item, 0)),
    [restaurantsData],
  );

  const { data: tableRows = [] } = useGetTablesQuery({ branchId: branch.id });
  const { data: categoryRows = [] } = useGetMenuCategoriesQuery(branch.id);
  const { data: menuRows = [] } = useGetMenuItemsQuery(branch.id);
  const { data: staffRows = [] } = useGetBranchStaffQuery({ branchId: branch.id });

  const [updateBranch] = useUpdateBranchMutation();
  const [setOperatingHours] = useSetOperatingHoursMutation();
  const [createTable] = useCreateTableMutation();
  const [updateTable] = useUpdateTableMutation();
  const [deleteTable] = useDeleteTableMutation();
  const [regenerateQr] = useRegenerateTableQrMutation();
  const [createMenuCategory] = useCreateMenuCategoryMutation();
  const [createMenuItem] = useCreateMenuItemMutation();
  const [updateMenuItem] = useUpdateMenuItemMutation();
  const [deleteMenuItem] = useDeleteMenuItemMutation();
  const [createStaff] = useCreateBranchStaffMutation();
  const [updateStaff] = useUpdateBranchStaffMutation();

  const tables: TableItem[] = useMemo(
    () =>
      tableRows.map((row: any) => {
        const joinUrl =
          row.qrJoinUrl ||
          (row.qrCodeToken ? `${getCustomerAppUrl()}/t/${row.qrCodeToken}` : '');
        return {
          id: row.id,
          number: row.label || row.number,
          capacity: row.capacity,
          status: mapTableStatus(row.serviceStatus, row.operationalFlag),
          qrCodeUrl: joinUrl,
          qrCodeToken: row.qrCodeToken,
          qrJoinUrl: joinUrl,
        };
      }),
    [tableRows],
  );

  const menuItems: MenuItem[] = useMemo(
    () =>
      menuRows.map((row: any) => ({
        id: row.id,
        name: row.name,
        category: row.categoryName || row.category || 'General',
        price: typeof row.basePrice === 'number' ? `$${row.basePrice.toFixed(2)}` : String(row.price || row.basePrice || '$0.00'),
        status: row.isAvailable === false || row.isActive === false ? 'Disable' : 'Active',
      })),
    [menuRows],
  );

  const staffList: StaffMember[] = useMemo(
    () =>
      staffRows.map((row: any) => ({
        id: row.staffId || row.id,
        name: row.name,
        role: row.role,
        branch: branch.name,
        status: row.isActive === false ? 'Inactive' : 'Active',
        contact: row.email,
      })),
    [staffRows, branch.name],
  );

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<BranchFormData>({
    restaurantId: branch.restaurantId,
    restaurantName: branch.restaurantName,
    name: branch.name,
    address: branch.location,
    contactNumber: branch.contactNumber || '',
    manager: branch.manager,
    status: (branch.status as 'Active' | 'Setup' | 'Closed') || 'Active',
    openingTime: branch.openingTime || '09:00',
    closingTime: branch.closingTime || '23:00',
  });

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

  const [menuFilterStatus, setMenuFilterStatus] = useState<'All Items' | 'Active' | 'Disable'>('All Items');
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  const [deletingMenuItem, setDeletingMenuItem] = useState<MenuItem | null>(null);
  const [menuForm, setMenuForm] = useState<MenuFormData>({
    name: '',
    category: 'Main Course',
    price: '12.20',
    status: 'Active',
  });

  const [staffRoleFilter, setStaffRoleFilter] = useState<string>('All Roles');
  const [staffBranchFilter, setStaffBranchFilter] = useState<string>('All branches');
  const [isInviteStaffOpen, setIsInviteStaffOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [inviteForm, setInviteForm] = useState<StaffInviteFormData>({
    name: '',
    email: '',
    password: '',
    role: 'WAITER',
    branch: branch.name,
  });
  const [editStaffForm, setEditStaffForm] = useState<StaffEditFormData>({
    name: '',
    role: 'WAITER',
    branch: branch.name,
    status: 'Active',
  });

  const totalTables = tables.length;
  const availableTables = tables.filter((t) => t.status === 'Available').length;
  const occupiedTables = tables.filter((t) => t.status === 'Occupied').length;
  const totalCapacity = tables.reduce((acc, t) => acc + t.capacity, 0);

  const filteredMenuItems = menuItems.filter((item) => {
    if (menuFilterStatus === 'All Items') return true;
    return item.status === menuFilterStatus;
  });

  const filteredStaff = staffList.filter((staff) => {
    if (staffRoleFilter !== 'All Roles' && staff.role !== staffRoleFilter) return false;
    return true;
  });

  const handleOpenEdit = () => {
    setEditForm({
      restaurantId: branch.restaurantId,
      restaurantName: branch.restaurantName,
      name: branch.name,
      address: branch.location,
      contactNumber: branch.contactNumber || '',
      manager: branch.manager,
      status: (branch.status as 'Active' | 'Setup' | 'Closed') || 'Active',
      openingTime: branch.openingTime || '09:00',
      closingTime: branch.closingTime || '23:00',
    });
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.name.trim()) {
      toast.error('Branch name cannot be empty.');
      return;
    }
    try {
      await updateBranch({
        id: branch.id,
        body: {
          name: editForm.name.trim(),
          address: parseBranchAddress(editForm.address),
          phone: editForm.contactNumber || undefined,
          isActive: editForm.status !== 'Closed',
        },
      }).unwrap();
      await setOperatingHours({
        branchId: branch.id,
        hours: weekHours(editForm.openingTime, editForm.closingTime),
      });
      const updated: BranchItem = {
        ...branch,
        name: editForm.name.trim(),
        location: editForm.address.trim(),
        contactNumber: editForm.contactNumber,
        status: editForm.status,
        openingTime: editForm.openingTime,
        closingTime: editForm.closingTime,
        hours: `${editForm.openingTime} – ${editForm.closingTime}`,
      };
      setBranch(updated);
      onUpdateBranch?.(updated);
      toast.success(`Branch "${updated.name}" updated successfully!`);
      setIsEditOpen(false);
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Unable to update branch.');
    }
  };

  const handleRegenerateQr = async () => {
    if (!viewingQrTable) return;
    setIsRegenerating(true);
    try {
      const result: any = await regenerateQr(viewingQrTable.id).unwrap();
      const joinUrl =
        result?.qrJoinUrl ||
        (result?.qrCodeToken ? `${getCustomerAppUrl()}/t/${result.qrCodeToken}` : viewingQrTable.qrCodeUrl);
      setViewingQrTable({
        ...viewingQrTable,
        qrCodeToken: result?.qrCodeToken,
        qrJoinUrl: joinUrl,
        qrCodeUrl: joinUrl,
      });
      toast.success('QR code regenerated. Print a new standee.');
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Unable to regenerate QR code.');
    } finally {
      setIsRegenerating(false);
      setQrSeed((prev) => prev + 1);
    }
  };

  const handleOpenAddTable = () => {
    const nextNum = tables.length + 1;
    setTableForm({
      number: `T-${String(nextNum).padStart(2, '0')}`,
      capacity: 4,
      status: 'Available',
    });
    setIsAddTableOpen(true);
  };

  const handleSaveAddTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tableForm.number.trim()) {
      toast.error('Please enter a table number.');
      return;
    }
    try {
      await createTable({
        branchId: branch.id,
        label: tableForm.number.trim(),
        capacity: Number(tableForm.capacity) || 4,
      }).unwrap();
      toast.success(`Table "${tableForm.number}" added successfully!`);
      setIsAddTableOpen(false);
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Unable to add table.');
    }
  };

  const handleOpenEditTable = (table: TableItem) => {
    setEditingTable(table);
    setTableForm({ number: table.number, capacity: table.capacity, status: table.status });
  };

  const handleSaveEditTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTable || !tableForm.number.trim()) return;
    try {
      await updateTable({
        id: editingTable.id,
        body: {
          label: tableForm.number.trim(),
          capacity: Number(tableForm.capacity) || 4,
        },
      }).unwrap();
      toast.success(`Table "${tableForm.number}" updated successfully!`);
      setEditingTable(null);
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Unable to update table.');
    }
  };

  const handleConfirmDeleteTable = async () => {
    if (!deletingTable) return;
    try {
      await deleteTable(deletingTable.id).unwrap();
      toast.success(`Table "${deletingTable.number}" has been removed.`);
      setDeletingTable(null);
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Unable to delete table.');
    }
  };

  const resolveCategoryId = async (categoryName: string) => {
    const existing = categoryRows.find(
      (category: any) => String(category.name).toLowerCase() === categoryName.toLowerCase(),
    );
    if (existing) return existing.id;
    const created: any = await createMenuCategory({
      restaurantId: branch.restaurantId,
      name: categoryName,
    }).unwrap();
    return created?.data?.id || created?.id;
  };

  const parsePrice = (value: string) => Number(String(value).replace(/[^0-9.]/g, '')) || 0;

  const handleOpenAddMenu = () => {
    setMenuForm({
      name: '',
      category: categoryRows[0]?.name || 'Main Course',
      price: '12.20',
      status: 'Active',
    });
    setIsAddMenuOpen(true);
  };

  const handleSaveAddMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!menuForm.name.trim()) {
      toast.error('Please enter menu item name.');
      return;
    }
    try {
      const categoryId = await resolveCategoryId(menuForm.category);
      await createMenuItem({
        restaurantId: branch.restaurantId,
        categoryId,
        name: menuForm.name.trim(),
        basePrice: parsePrice(menuForm.price),
      }).unwrap();
      toast.success(`Menu item "${menuForm.name.trim()}" added successfully!`);
      setIsAddMenuOpen(false);
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Unable to add menu item.');
    }
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

  const handleSaveEditMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMenuItem || !menuForm.name.trim()) return;
    try {
      await updateMenuItem({
        id: editingMenuItem.id,
        body: {
          name: menuForm.name.trim(),
          basePrice: parsePrice(menuForm.price),
          isAvailable: menuForm.status === 'Active',
        },
      }).unwrap();
      toast.success(`Menu item "${menuForm.name}" updated!`);
      setEditingMenuItem(null);
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Unable to update menu item.');
    }
  };

  const handleDuplicateMenu = async (item: MenuItem) => {
    try {
      const categoryId = await resolveCategoryId(item.category);
      await createMenuItem({
        restaurantId: branch.restaurantId,
        categoryId,
        name: `${item.name} (Copy)`,
        basePrice: parsePrice(item.price),
      }).unwrap();
      toast.success(`Duplicated "${item.name}"`);
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Unable to duplicate item.');
    }
  };

  const handleToggleMenuStatus = async (item: MenuItem) => {
    const nextStatus = item.status === 'Active' ? 'Disable' : 'Active';
    try {
      await updateMenuItem({
        id: item.id,
        body: { isAvailable: nextStatus === 'Active' },
      }).unwrap();
      toast.info(`Item status changed to ${nextStatus}.`);
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Unable to update item.');
    }
  };

  const handleConfirmDeleteMenu = async () => {
    if (!deletingMenuItem) return;
    try {
      await deleteMenuItem(deletingMenuItem.id).unwrap();
      toast.success(`Menu item "${deletingMenuItem.name}" deleted.`);
      setDeletingMenuItem(null);
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Unable to delete menu item.');
    }
  };

  const handleOpenInviteStaff = () => {
    setInviteForm({
      name: '',
      email: '',
      password: '',
      role: 'WAITER',
      branch: branch.name,
    });
    setIsInviteStaffOpen(true);
  };

  const handleSaveInviteStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteForm.name.trim() || !inviteForm.email.trim() || !inviteForm.password) {
      toast.error('Name, email, and password are required.');
      return;
    }
    try {
      await createStaff({
        branchId: branch.id,
        body: {
          name: inviteForm.name.trim(),
          email: inviteForm.email.trim(),
          password: inviteForm.password,
          role: inviteForm.role,
        },
      }).unwrap();
      toast.success(`Staff account created for ${inviteForm.name.trim()}.`);
      setIsInviteStaffOpen(false);
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Unable to invite staff.');
    }
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

  const handleSaveEditStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;
    try {
      await updateStaff({
        branchId: branch.id,
        staffId: editingStaff.id,
        body: {
          role: editStaffForm.role,
          isActive: editStaffForm.status === 'Active',
        },
      }).unwrap();
      toast.success(`Staff member "${editStaffForm.name}" updated!`);
      setEditingStaff(null);
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Unable to update staff.');
    }
  };

  const handleToggleStaffStatus = async (staff: StaffMember) => {
    const nextStatus = staff.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await updateStaff({
        branchId: branch.id,
        staffId: staff.id,
        body: { isActive: nextStatus === 'Active' },
      }).unwrap();
      toast.success(`${staff.name} is now ${nextStatus.toLowerCase()}.`);
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Unable to update staff.');
    }
  };

  return {
    branch,
    activeSubTab,
    setActiveSubTab,
    restaurants,
    isEditOpen,
    setIsEditOpen,
    editForm,
    setEditForm,
    handleOpenEdit,
    handleEditSubmit,
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
