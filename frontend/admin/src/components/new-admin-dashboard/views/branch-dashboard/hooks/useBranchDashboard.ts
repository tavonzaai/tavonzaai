import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { BranchItem, RestaurantItem } from '../../../types';
import {
  SubTab,
  TableItem,
  MenuItem,
  CategoryItem,
  StaffMember,
  BranchFormData,
  TableFormData,
  MenuFormData,
  StaffInviteFormData,
  StaffEditFormData,
} from '../types';
import {
  BranchSection,
  StaffStatusFilter,
  sectionToSubTab,
  subTabToSection,
} from '../sections';
import {
  useCreateBranchStaffMutation,
  useCreateMenuCategoryMutation,
  useUpdateMenuCategoryMutation,
  useDeleteMenuCategoryMutation,
  useCreateMenuItemMutation,
  useCreateTableMutation,
  useDeleteBranchStaffMutation,
  useDeleteMenuItemMutation,
  useDeleteTableMutation,
  useGetBranchQuery,
  useGetBranchStaffQuery,
  useGetMenuCategoriesQuery,
  useGetMenuItemsQuery,
  useGetOperatingHoursQuery,
  useGetRestaurantQuery,
  useGetTablesQuery,
  useRegenerateTableQrMutation,
  useSetOperatingHoursMutation,
  useUpdateBranchMutation,
  useUpdateBranchStaffMutation,
  useUpdateMenuItemMutation,
  useUpdateTableMutation,
} from '@/redux/features/adminApi';
import { getCustomerAppUrl } from '@/redux/api/baseApi';
import { mapBranch, parseBranchAddress } from '@/lib/admin-mappers';
import type { BackendBranch, BackendRestaurant } from '@/redux/features/restaurantApi';

interface UseBranchDashboardProps {
  branchId: string;
  section: BranchSection;
  onSectionChange: (section: BranchSection) => void;
}

function mapTableStatus(serviceStatus?: string, operationalFlag?: string): TableItem['status'] {
  if (operationalFlag === 'RESERVED') return 'Reserved';
  if (serviceStatus === 'AVAILABLE') return 'Available';
  return 'Occupied';
}

function weekHours(openTime: string, closeTime: string) {
  return Array.from({ length: 7 }, (_, dayOfWeek) => ({ dayOfWeek, openTime, closeTime }));
}

function unwrapRecord<T extends { id?: string }>(payload: unknown): T | undefined {
  if (!payload || typeof payload !== 'object') return undefined;
  const record = payload as T & { data?: T };
  if (record.id) return record;
  if (record.data?.id) return record.data;
  return undefined;
}

function errorText(error: unknown, fallback: string) {
  const body = error as { data?: { message?: string }; message?: string } | undefined;
  return body?.data?.message || body?.message || fallback;
}

function pickHours(rows: Array<{ dayOfWeek?: number; openTime?: string; closeTime?: string }> | undefined) {
  if (!rows?.length) return null;
  const today = new Date().getDay();
  const slot = rows.find((row) => row.dayOfWeek === today) || rows[0];
  const openTime = slot?.openTime?.slice(0, 5);
  const closeTime = slot?.closeTime?.slice(0, 5);
  if (!openTime || !closeTime) return null;
  return { openTime, closeTime };
}

export function useBranchDashboard({
  branchId,
  section,
  onSectionChange,
}: UseBranchDashboardProps) {
  const activeSubTab = sectionToSubTab(section);
  const setActiveSubTab = (tab: SubTab) => onSectionChange(subTabToSection(tab));

  const loadTables = section === 'overview' || section === 'tables';
  const loadMenu = section === 'menu';
  const loadStaff = section === 'overview' || section === 'staff';

  const branchQuery = useGetBranchQuery(branchId, { skip: !branchId });
  const branchRecord = unwrapRecord<BackendBranch>(branchQuery.data);
  const restaurantQuery = useGetRestaurantQuery(branchRecord?.restaurantId || '', {
    skip: !branchRecord?.restaurantId,
  });
  const restaurantRecord = unwrapRecord<BackendRestaurant>(restaurantQuery.data);
  const hoursQuery = useGetOperatingHoursQuery(branchId, { skip: !branchId });

  const tablesQuery = useGetTablesQuery({ branchId }, { skip: !branchId || !loadTables });
  const categoriesQuery = useGetMenuCategoriesQuery(branchId, { skip: !branchId || !loadMenu });
  const menuQuery = useGetMenuItemsQuery(branchId, { skip: !branchId || !loadMenu });

  const [staffRoleFilter, setStaffRoleFilter] = useState<string>('ALL');
  const [staffStatusFilter, setStaffStatusFilter] = useState<StaffStatusFilter>('All');

  const staffQuery = useGetBranchStaffQuery(
    {
      branchId,
      status: 'all',
      ...(section === 'staff' && staffRoleFilter !== 'ALL' ? { role: staffRoleFilter } : {}),
    },
    { skip: !branchId || !loadStaff },
  );

  const [updateBranch] = useUpdateBranchMutation();
  const [setOperatingHours] = useSetOperatingHoursMutation();
  const [createTable] = useCreateTableMutation();
  const [updateTable] = useUpdateTableMutation();
  const [deleteTable] = useDeleteTableMutation();
  const [regenerateQr] = useRegenerateTableQrMutation();
  const [createMenuCategory] = useCreateMenuCategoryMutation();
  const [updateMenuCategory] = useUpdateMenuCategoryMutation();
  const [deleteMenuCategory] = useDeleteMenuCategoryMutation();
  const [createMenuItem] = useCreateMenuItemMutation();
  const [updateMenuItem] = useUpdateMenuItemMutation();
  const [deleteMenuItem] = useDeleteMenuItemMutation();
  const [createStaff] = useCreateBranchStaffMutation();
  const [updateStaff] = useUpdateBranchStaffMutation();
  const [deleteBranchStaff, { isLoading: isDeletingStaff }] = useDeleteBranchStaffMutation();

  const branch = useMemo<BranchItem | null>(() => {
    if (!branchRecord) return null;
    const hours = pickHours(hoursQuery.data);
    const mapped = mapBranch(branchRecord, restaurantRecord?.name || '');
    if (!hours) return mapped;
    return {
      ...mapped,
      openingTime: hours.openTime,
      closingTime: hours.closeTime,
      hours: `${hours.openTime} – ${hours.closeTime}`,
    };
  }, [branchRecord, restaurantRecord?.name, hoursQuery.data]);

  const restaurants: RestaurantItem[] = useMemo(() => {
    if (!branch) return [];
    return [
      {
        id: branch.restaurantId,
        name: branch.restaurantName || 'Current restaurant',
        branchesCount: 0,
        status: 'Active',
      },
    ];
  }, [branch]);

  const tableRows = tablesQuery.data || [];
  const categoryRows = categoriesQuery.data || [];
  const menuRows = menuQuery.data || [];
  const staffRows = staffQuery.data || [];

  const categories: CategoryItem[] = useMemo(() => {
    return categoryRows.map((row: any) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      itemCount: row.itemCount,
    }));
  }, [categoryRows]);

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

  const menuItems: MenuItem[] = useMemo(() => {
    const catMap = new Map<string, string>();
    categoryRows.forEach((c: any) => {
      if (c?.id && c?.name) catMap.set(c.id, c.name);
    });
    return menuRows.map((row: any) => {
      const resolvedCategory =
        (row.categoryId && catMap.get(row.categoryId)) ||
        row.categoryName ||
        row.category ||
        'Uncategorized';
      return {
        id: row.id,
        name: row.name,
        category: resolvedCategory,
        categoryId: row.categoryId,
        price: typeof row.basePrice === 'number' ? `$${row.basePrice.toFixed(2)}` : String(row.price || row.basePrice || '$0.00'),
        status: row.isAvailable === false || row.isActive === false ? 'Disable' : 'Active',
      };
    });
  }, [menuRows, categoryRows]);

  const staffList: StaffMember[] = useMemo(
    () =>
      staffRows.map((row: any) => ({
        id: row.staffId || row.id,
        name: row.name,
        role: row.role,
        branch: branch?.name || '',
        status: row.isActive === false ? 'Inactive' : 'Active',
        contact: row.email,
      })),
    [staffRows, branch?.name],
  );

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<BranchFormData>({
    restaurantId: '',
    restaurantName: '',
    name: '',
    address: '',
    contactNumber: '',
    manager: '',
    status: 'Active',
    openingTime: '09:00',
    closingTime: '23:00',
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
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
  const [isManageCategoriesOpen, setIsManageCategoriesOpen] = useState(false);
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  const [deletingMenuItem, setDeletingMenuItem] = useState<MenuItem | null>(null);
  const [menuForm, setMenuForm] = useState<MenuFormData>({
    name: '',
    category: '',
    categoryId: '',
    price: '12.20',
    status: 'Active',
  });

  const [isInviteStaffOpen, setIsInviteStaffOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [inviteForm, setInviteForm] = useState<StaffInviteFormData>({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'WAITER',
    branch: '',
  });
  const [editStaffForm, setEditStaffForm] = useState<StaffEditFormData>({
    name: '',
    role: 'WAITER',
    branch: '',
    status: 'Active',
  });
  const [deletingStaff, setDeletingStaff] = useState<StaffMember | null>(null);

  const totalTables = tables.length;
  const availableTables = tables.filter((t) => t.status === 'Available').length;
  const occupiedTables = tables.filter((t) => t.status === 'Occupied').length;
  const totalCapacity = tables.reduce((acc, t) => acc + t.capacity, 0);

  const filteredMenuItems = menuItems.filter((item) => {
    if (menuFilterStatus !== 'All Items' && item.status !== menuFilterStatus) {
      return false;
    }
    if (selectedCategory !== 'All Categories') {
      const matchName = item.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchId = item.categoryId === selectedCategory;
      if (!matchName && !matchId) return false;
    }
    return true;
  });

  const filteredStaff = staffList.filter((staff) => {
    if (staffStatusFilter === 'Active') return staff.status === 'Active';
    if (staffStatusFilter === 'Inactive') return staff.status === 'Inactive';
    return true;
  });

  const handleOpenEdit = () => {
    if (!branch) return;
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
    if (!branch) return;
    if (!editForm.name.trim()) {
      toast.error('Branch name cannot be empty.');
      return;
    }
    try {
      await updateBranch({
        id: branchId,
        body: {
          name: editForm.name.trim(),
          address: parseBranchAddress(editForm.address),
          phone: editForm.contactNumber || undefined,
          isActive: editForm.status !== 'Closed',
        },
      }).unwrap();
      await setOperatingHours({
        branchId,
        hours: weekHours(editForm.openingTime, editForm.closingTime),
      });
      toast.success(`Branch "${editForm.name.trim()}" updated successfully!`);
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
        branchId,
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

  const handleOpenManageCategories = () => {
    setIsManageCategoriesOpen(true);
  };

  const handleAddCategory = async (name: string) => {
    if (!branch?.restaurantId) {
      toast.error('Restaurant not identified for this branch.');
      return;
    }
    try {
      await createMenuCategory({
        restaurantId: branch.restaurantId,
        name,
      }).unwrap();
      toast.success(`Category "${name}" created!`);
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to create category.');
      throw err;
    }
  };

  const handleUpdateCategory = async (id: string, name: string) => {
    try {
      await updateMenuCategory({
        id,
        body: { name },
      }).unwrap();
      toast.success(`Category renamed to "${name}"!`);
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to update category.');
      throw err;
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await deleteMenuCategory(id).unwrap();
      toast.success('Category removed.');
      if (selectedCategory === id) {
        setSelectedCategory('All Categories');
      }
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to delete category.');
      throw err;
    }
  };

  const parsePrice = (value: string) => Number(String(value).replace(/[^0-9.]/g, '')) || 0;

  const handleOpenAddMenu = () => {
    if (categoryRows.length === 0) {
      toast.warning('Please create at least one category before adding menu items.');
      setIsManageCategoriesOpen(true);
      return;
    }
    const defaultCat = categoryRows[0];
    setMenuForm({
      name: '',
      categoryId: defaultCat?.id || '',
      category: defaultCat?.name || '',
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
    if (!menuForm.categoryId) {
      toast.error('Please select an existing category.');
      return;
    }
    const catExists = categoryRows.some((c: any) => c.id === menuForm.categoryId);
    if (!catExists) {
      toast.error('Selected category is not valid. Please choose a valid category.');
      return;
    }
    try {
      await createMenuItem({
        restaurantId: branch?.restaurantId,
        categoryId: menuForm.categoryId,
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
    const matched = categoryRows.find(
      (c: any) => c.id === item.categoryId || String(c.name).toLowerCase() === String(item.category).toLowerCase(),
    );
    setMenuForm({
      name: item.name,
      categoryId: matched?.id || item.categoryId || categoryRows[0]?.id || '',
      category: matched?.name || item.category,
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
          categoryId: menuForm.categoryId || undefined,
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
    const matched = categoryRows.find(
      (c: any) => c.id === item.categoryId || String(c.name).toLowerCase() === String(item.category).toLowerCase(),
    );
    const catId = matched?.id || item.categoryId;
    if (!catId) {
      toast.error('Cannot duplicate: item does not have a valid category.');
      return;
    }
    try {
      await createMenuItem({
        restaurantId: branch?.restaurantId,
        categoryId: catId,
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
      phone: '',
      password: '',
      role: 'WAITER',
      branch: branch?.name || '',
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
        branchId,
        body: {
          name: inviteForm.name.trim(),
          email: inviteForm.email.trim(),
          phone: inviteForm.phone?.trim() || undefined,
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
      branch: staff.branch || branch?.name || '',
      status: staff.status,
    });
  };

  const handleSaveEditStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;
    try {
      await updateStaff({
        branchId,
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

  const handleConfirmDeleteStaff = async () => {
    if (!deletingStaff) return;
    try {
      await deleteBranchStaff({
        branchId,
        staffId: deletingStaff.id,
      }).unwrap();
      toast.success(`Staff member "${deletingStaff.name}" removed from branch.`);
      setDeletingStaff(null);
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Unable to delete staff.');
    }
  };

  const handleToggleStaffStatus = async (staff: StaffMember) => {
    const nextStatus = staff.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await updateStaff({
        branchId,
        staffId: staff.id,
        body: { isActive: nextStatus === 'Active' },
      }).unwrap();
      toast.success(`${staff.name} is now ${nextStatus.toLowerCase()}.`);
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Unable to update staff.');
    }
  };

  const isTabLoading =
    (loadTables && tablesQuery.isLoading) ||
    (loadMenu && (categoriesQuery.isLoading || menuQuery.isLoading)) ||
    (loadStaff && staffQuery.isLoading);

  return {
    branch,
    isBranchLoading: branchQuery.isLoading || branchQuery.isUninitialized,
    isBranchError: branchQuery.isError || (branchQuery.isSuccess && !branch),
    branchErrorMessage: errorText(branchQuery.error, 'Unable to load this branch.'),
    refetchBranch: () => branchQuery.refetch(),
    isTabLoading,
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
    categories,
    selectedCategory,
    setSelectedCategory,
    isManageCategoriesOpen,
    setIsManageCategoriesOpen,
    handleOpenManageCategories,
    handleAddCategory,
    handleUpdateCategory,
    handleDeleteCategory,
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
    staffList: section === 'staff' ? filteredStaff : staffList,
    staffRoleFilter,
    setStaffRoleFilter,
    staffStatusFilter,
    setStaffStatusFilter,
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
    deletingStaff,
    setDeletingStaff,
    handleConfirmDeleteStaff,
    isDeletingStaff,
  };
}
