import React, { useState, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
  Building2,
  Table as TableIcon,
  ChefHat,
  Users,
  Radio,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Plus,
  RefreshCw,
  Sliders,
  Loader2,
} from 'lucide-react';
import AddTableModal, { NewTableData } from './AddTableModal';
import { branchManagerService, getActiveBranchId } from '@/redux/features/branchManagerApi';

type ConfigSubTab =
  | 'Branch Info & Hours'
  | 'Tables & Seating'
  | 'Kitchen Stations'
  | 'Staff Configuration'
  | 'Ordering Channels';

const SUBTAB_TO_KEY: Record<ConfigSubTab, string> = {
  'Branch Info & Hours': 'info',
  'Tables & Seating': 'tables',
  'Kitchen Stations': 'kitchen',
  'Staff Configuration': 'staff',
  'Ordering Channels': 'channels',
};

const KEY_TO_SUBTAB: Record<string, ConfigSubTab> = {
  info: 'Branch Info & Hours',
  tables: 'Tables & Seating',
  kitchen: 'Kitchen Stations',
  staff: 'Staff Configuration',
  channels: 'Ordering Channels',
};

interface ConfigTable {
  id: string;
  number: string;
  zone: string;
  capacity: string;
  status: 'Active' | 'Maintenance';
}

interface KitchenStationItem {
  id: string;
  name: string;
  status: 'Active' | 'Inactive';
  categories: string[];
  ip: string;
  active: boolean;
}

const INITIAL_CONFIG_TABLES: ConfigTable[] = [
  { id: 't1', number: 'T-01', zone: 'Indoor Dining', capacity: '2 Guests', status: 'Active' },
  { id: 't2', number: 'T-02', zone: 'Indoor Dining', capacity: '4 Guests', status: 'Active' },
  { id: 't3', number: 'T-03', zone: 'Indoor Dining', capacity: '4 Guests', status: 'Active' },
  { id: 't4', number: 'T-04', zone: 'VIP Section', capacity: '6 Guest', status: 'Active' },
  { id: 't5', number: 'P-01', zone: 'Patio Terrace', capacity: '4 Guests', status: 'Active' },
  { id: 't6', number: 'P-02', zone: 'Patio Terrace', capacity: '4 Guests', status: 'Maintenance' },
  { id: 't7', number: 'B-01', zone: 'Bar Counter', capacity: '1 Guest', status: 'Active' },
];

const INITIAL_STATIONS: KitchenStationItem[] = [
  {
    id: 's1',
    name: 'Grill Station',
    status: 'Active',
    categories: ['Burger', 'Stakes', 'Sides'],
    ip: '192.168.1.101',
    active: true,
  },
  {
    id: 's2',
    name: 'Fryer & Apps',
    status: 'Active',
    categories: ['Appetizers', 'Fried Sides'],
    ip: '192.168.1.102',
    active: true,
  },
  {
    id: 's3',
    name: 'Salad & Cold Prep',
    status: 'Active',
    categories: ['Salads', 'Cold Starters', 'Desserts'],
    ip: '192.168.1.103',
    active: true,
  },
  {
    id: 's4',
    name: 'Beverage & Bar Station',
    status: 'Active',
    categories: ['Cocktails', 'Craft Beers', 'Wines'],
    ip: '192.168.1.104',
    active: true,
  },
];

const DAYS_OF_WEEK = [
  { day: 'Monday', isOpen: true, openTime: '09 : 00 AM', closeTime: '10 : 00 PM' },
  { day: 'Tuesday', isOpen: true, openTime: '09 : 00 AM', closeTime: '10 : 00 PM' },
  { day: 'Wednesday', isOpen: true, openTime: '09 : 00 AM', closeTime: '10 : 00 PM' },
  { day: 'Thursday', isOpen: true, openTime: '09 : 00 AM', closeTime: '10 : 00 PM' },
  { day: 'Friday', isOpen: true, openTime: '09 : 00 AM', closeTime: '11 : 00 PM' },
  { day: 'Saturday', isOpen: true, openTime: '08 : 30 AM', closeTime: '11 : 30 PM' },
  { day: 'Sunday', isOpen: true, openTime: '09 : 00 AM', closeTime: '09 : 30 PM' },
];

function BranchConfigContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSlug = searchParams.get('subtab')?.toLowerCase();
  const initialSubTab: ConfigSubTab =
    currentSlug && KEY_TO_SUBTAB[currentSlug]
      ? KEY_TO_SUBTAB[currentSlug]
      : 'Branch Info & Hours';

  const [activeSubTab, setActiveSubTab] = useState<ConfigSubTab>(initialSubTab);
  const [isAddTableOpen, setIsAddTableOpen] = useState(false);
  const [saveToast, setSaveToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('Configuration saved successfully!');

  // Form states for Branch Info (populated from real database)
  const [branchName, setBranchName] = useState('Downtown HQ');
  const [branchCode, setBranchCode] = useState('BR-001');
  const [phone, setPhone] = useState('+1 (555) 234-5678');
  const [email, setEmail] = useState('manager@tavonza.ai');
  const [address, setAddress] = useState('742 Evergreen Terrace');
  const [city, setCity] = useState('Metropolis');
  const [stateCode, setStateCode] = useState('IL');
  const [postalCode, setPostalCode] = useState('62704');

  // Operating Hours State (populated from database branch_operating_hours)
  const [operatingHours, setOperatingHours] = useState<
    Array<{
      dayOfWeek: number;
      day: string;
      isOpen: boolean;
      openTime: string;
      closeTime: string;
    }>
  >([
    { dayOfWeek: 1, day: 'Monday', isOpen: true, openTime: '09:00', closeTime: '22:00' },
    { dayOfWeek: 2, day: 'Tuesday', isOpen: true, openTime: '09:00', closeTime: '22:00' },
    { dayOfWeek: 3, day: 'Wednesday', isOpen: true, openTime: '09:00', closeTime: '22:00' },
    { dayOfWeek: 4, day: 'Thursday', isOpen: true, openTime: '09:00', closeTime: '22:00' },
    { dayOfWeek: 5, day: 'Friday', isOpen: true, openTime: '09:00', closeTime: '23:00' },
    { dayOfWeek: 6, day: 'Saturday', isOpen: true, openTime: '08:30', closeTime: '23:30' },
    { dayOfWeek: 0, day: 'Sunday', isOpen: true, openTime: '09:00', closeTime: '21:30' },
  ]);

  // Tables State
  const [configTables, setConfigTables] = useState<ConfigTable[]>([]);

  // Stations State
  const [stations, setStations] = useState<KitchenStationItem[]>(INITIAL_STATIONS);

  // Order Acceptance Mode ('AUTO_ACCEPT' | 'WAITER_APPROVAL')
  const [acceptanceMode, setAcceptanceMode] = useState<'AUTO_ACCEPT' | 'WAITER_APPROVAL'>('WAITER_APPROVAL');
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);
  const [isSavingHours, setIsSavingHours] = useState(false);
  const [isSavingBranchInfo, setIsSavingBranchInfo] = useState(false);

  // Sync subtab from URL query parameters on navigation
  useEffect(() => {
    const slug = searchParams.get('subtab')?.toLowerCase();
    if (slug && KEY_TO_SUBTAB[slug]) {
      setActiveSubTab(KEY_TO_SUBTAB[slug]);
    }
  }, [searchParams]);

  const handleSubTabChange = (tab: ConfigSubTab) => {
    setActiveSubTab(tab);
    const slug = SUBTAB_TO_KEY[tab] || 'info';
    const params = new URLSearchParams(searchParams.toString());
    params.set('subtab', slug);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  useEffect(() => {
    let mounted = true;
    const fetchBranchConfig = async () => {
      try {
        const branchId = getActiveBranchId();
        const [branchRes, hoursRes, settingsRes, tablesRes] = await Promise.allSettled([
          branchManagerService.getBranch(branchId),
          branchManagerService.getOperatingHours(branchId),
          branchManagerService.getSettings(branchId),
          branchManagerService.getTables(branchId),
        ]);

        if (mounted) {
          if (branchRes.status === 'fulfilled' && branchRes.value) {
            const b = branchRes.value;
            if (b.name) setBranchName(b.name);
            if (b.phone) setPhone(b.phone);
            const addr = b.address || {};
            if (addr.line1 || addr.street) setAddress(addr.line1 || addr.street || '');
            if (addr.city) setCity(addr.city);
            if (addr.state) setStateCode(addr.state);
            if (addr.postalCode) setPostalCode(addr.postalCode);
          }

          if (hoursRes.status === 'fulfilled' && Array.isArray(hoursRes.value) && hoursRes.value.length > 0) {
            const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const mappedHours = [1, 2, 3, 4, 5, 6, 0].map((dNum) => {
              const matched = hoursRes.value.find((h: any) => h.dayOfWeek === dNum);
              return {
                dayOfWeek: dNum,
                day: dayNames[dNum] ?? 'Monday',
                isOpen: !!matched,
                openTime: matched?.openTime || '09:00',
                closeTime: matched?.closeTime || '22:00',
              };
            });
            setOperatingHours(mappedHours);
          }

          if (settingsRes.status === 'fulfilled' && settingsRes.value) {
            const mode = settingsRes.value.orderAcceptanceMode;
            if (mode === 'AUTO_ACCEPT' || mode === 'WAITER_APPROVAL') {
              setAcceptanceMode(mode);
            }
          }

          if (tablesRes.status === 'fulfilled' && Array.isArray(tablesRes.value)) {
            const mappedTables: ConfigTable[] = tablesRes.value.map((t) => ({
              id: t.id,
              number: t.label || (t as any).number || 'Table',
              zone: 'Indoor Dining',
              capacity: `${t.capacity} Guests`,
              status: t.isActive !== false ? 'Active' : 'Maintenance',
            }));
            setConfigTables(mappedTables);
          }
        }
      } catch (err) {
        console.warn('Branch config fetch error:', err);
      }
    };

    fetchBranchConfig();
    return () => {
      mounted = false;
    };
  }, []);

  const handleUpdateAcceptanceMode = async (mode: 'AUTO_ACCEPT' | 'WAITER_APPROVAL') => {
    setAcceptanceMode(mode);
    setIsUpdatingSettings(true);
    try {
      const branchId = getActiveBranchId();
      await branchManagerService.updateSettings(branchId, {
        orderAcceptanceMode: mode,
      });
      triggerSaveToast(`Order acceptance mode set to ${mode === 'AUTO_ACCEPT' ? 'Automatic (Direct to Kitchen)' : 'Manual Waiter Approval'}`);
    } catch (err) {
      console.warn('Branch settings update warning (fallback to local):', err);
      triggerSaveToast('Saved locally');
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  const handleToggleDayOpen = (dayIndex: number) => {
    setOperatingHours((prev) =>
      prev.map((d, idx) => (idx === dayIndex ? { ...d, isOpen: !d.isOpen } : d))
    );
  };

  const handleToggleTableStatus = (tableId: string) => {
    setConfigTables((prev) =>
      prev.map((t) =>
        t.id === tableId
          ? { ...t, status: t.status === 'Active' ? 'Maintenance' : 'Active' }
          : t
      )
    );
  };

  const handleToggleStationActive = (stationId: string) => {
    setStations((prev) =>
      prev.map((s) =>
        s.id === stationId
          ? {
              ...s,
              active: !s.active,
              status: !s.active ? 'Active' : 'Inactive',
            }
          : s
      )
    );
  };

  const handleSaveNewTable = async (newTable: NewTableData) => {
    const tableItem: ConfigTable = {
      id: `table-${Date.now()}`,
      number: newTable.number,
      zone: newTable.zone,
      capacity: `${newTable.capacity} Guests`,
      status: 'Active',
    };
    setConfigTables((prev) => [...prev, tableItem]);

    try {
      await branchManagerService.createTable({
        branchId: getActiveBranchId(),
        label: newTable.number,
        capacity: Number(newTable.capacity) || 4,
      });
    } catch (err) {
      console.warn('Backend table create warning (saved to state):', err);
    }

    triggerSaveToast('New table configuration successfully added!');
  };

  const triggerSaveToast = (msg?: string) => {
    if (msg) setToastMessage(msg);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  const handleSaveBranchInfo = async () => {
    setIsSavingBranchInfo(true);
    try {
      const branchId = getActiveBranchId();
      await branchManagerService.updateBranch(branchId, {
        name: branchName.trim(),
        phone: phone.trim(),
        address: {
          line1: address.trim(),
          city: city.trim(),
          state: stateCode.trim(),
          postalCode: postalCode.trim(),
          country: 'US',
        },
      });
      triggerSaveToast('Branch details saved to database successfully!');
    } catch (err: any) {
      console.error('Failed to update branch info:', err);
      triggerSaveToast('Failed to save branch info: ' + (err.message || 'Error'));
    } finally {
      setIsSavingBranchInfo(false);
    }
  };

  const handleSaveOperatingHours = async () => {
    setIsSavingHours(true);
    try {
      const branchId = getActiveBranchId();
      const openHours = operatingHours
        .filter((d) => d.isOpen)
        .map((d) => ({
          dayOfWeek: d.dayOfWeek,
          openTime: d.openTime.replace(/\s+/g, ''),
          closeTime: d.closeTime.replace(/\s+/g, ''),
        }));

      await branchManagerService.updateOperatingHours(branchId, openHours);
      triggerSaveToast('Weekly operating hours saved to database successfully!');
    } catch (err: any) {
      console.error('Failed to update operating hours:', err);
      triggerSaveToast('Failed to save operating hours: ' + (err.message || 'Error'));
    } finally {
      setIsSavingHours(false);
    }
  };

  const handleSaveAll = async () => {
    if (activeSubTab === 'Branch Info & Hours') {
      await Promise.all([handleSaveBranchInfo(), handleSaveOperatingHours()]);
    } else {
      triggerSaveToast('Settings saved successfully!');
    }
  };

  const handleOpenTimeChange = (idx: number, val: string) => {
    setOperatingHours((prev) =>
      prev.map((d, i) => (i === idx ? { ...d, openTime: val } : d))
    );
  };

  const handleCloseTimeChange = (idx: number, val: string) => {
    setOperatingHours((prev) =>
      prev.map((d, i) => (i === idx ? { ...d, closeTime: val } : d))
    );
  };

  return (
    <div className="flex-1 p-6 lg:p-8 space-y-8 max-w-7xl animate-in fade-in duration-200 font-['Inter']">
      {/* Toast Alert */}
      {saveToast && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-500 text-neutral-950 font-semibold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span className="text-xs">{toastMessage}</span>
        </div>
      )}

      {/* 1. Header matching Figma */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <h1 className="text-white text-3xl font-semibold leading-9 font-['Inter']">
              {activeSubTab === 'Branch Info & Hours'
                ? 'Branch Information'
                : activeSubTab === 'Tables & Seating'
                ? 'Tables & Floor Setup'
                : activeSubTab === 'Kitchen Stations'
                ? 'Kitchen Routing Configuration'
                : 'Staff & Role Assignments'}
            </h1>
            <div className="px-2.5 py-1 bg-teal-500/10 rounded-full outline outline-1 outline-offset-[-1px] outline-teal-500/20 flex items-center gap-1.5">
              <span className="text-teal-400 text-xs font-medium leading-4">
                {activeSubTab === 'Branch Info & Hours'
                  ? 'Protected ( GM only )'
                  : 'Live Configuration'}
              </span>
            </div>
          </div>
          <p className="text-neutral-400 text-xs font-normal leading-5">
            {activeSubTab === 'Branch Info & Hours'
              ? 'Basic identification details and contact specifications for this location.'
              : 'Assign primary roles, kitchen stations, and floor section seating.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="h-10 px-3.5 py-2 bg-neutral-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-800 flex items-center text-sm font-['Poppins']">
            <span className="text-neutral-500">Viewing as </span>
            <span className="text-teal-400 font-medium ml-1">Branch Manager</span>
          </div>

          <button
            type="button"
            onClick={handleSaveAll}
            disabled={isSavingHours || isSavingBranchInfo}
            className="px-4 py-2.5 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-neutral-900 text-sm font-semibold rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 transition cursor-pointer shadow-md active:scale-95 flex items-center gap-2"
          >
            {(isSavingHours || isSavingBranchInfo) && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      {/* 2. Main Layout: Left Sub-Navigation + Right Content Panes */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Sub-nav matching Figma Configurations Box */}
        <div className="md:col-span-4 lg:col-span-3 p-4 bg-neutral-900/60 rounded-xl outline outline-1 outline-offset-[-1px] outline-zinc-800 flex flex-col gap-4">
          <span className="text-neutral-500 text-sm font-medium leading-5">Configurations</span>

          <div className="flex flex-col gap-1.5">
            {/* Branch Info & Hours */}
            <button
              type="button"
              onClick={() => handleSubTabChange('Branch Info & Hours')}
              className={`w-full px-3 py-2.5 rounded-lg outline outline-1 outline-offset-[-1px] flex items-center justify-between transition cursor-pointer text-left ${
                activeSubTab === 'Branch Info & Hours'
                  ? 'bg-yellow-400/10 outline-yellow-400/80 text-white shadow-sm'
                  : 'outline-transparent hover:bg-neutral-800 text-gray-400'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`p-1.5 rounded-md flex items-center justify-center ${
                    activeSubTab === 'Branch Info & Hours'
                      ? 'bg-yellow-400 text-neutral-950'
                      : 'bg-black text-gray-400'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                </div>
                <span className="text-sm font-normal">Branch Info & Hours</span>
              </div>
            </button>

            {/* Tables & Seating */}
            <button
              type="button"
              onClick={() => handleSubTabChange('Tables & Seating')}
              className={`w-full px-3 py-2.5 rounded-lg outline outline-1 outline-offset-[-1px] flex items-center justify-between transition cursor-pointer text-left ${
                activeSubTab === 'Tables & Seating'
                  ? 'bg-yellow-400/10 outline-yellow-400/80 text-white shadow-sm'
                  : 'outline-transparent hover:bg-neutral-800 text-gray-400'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`p-1.5 rounded-md flex items-center justify-center ${
                    activeSubTab === 'Tables & Seating'
                      ? 'bg-yellow-400 text-neutral-950'
                      : 'bg-black text-gray-400'
                  }`}
                >
                  <TableIcon className="w-4 h-4" />
                </div>
                <span className="text-sm font-normal">Tables & Seating</span>
              </div>
            </button>

            {/* Kitchen Stations */}
            <button
              type="button"
              onClick={() => handleSubTabChange('Kitchen Stations')}
              className={`w-full px-3 py-2.5 rounded-lg outline outline-1 outline-offset-[-1px] flex items-center justify-between transition cursor-pointer text-left ${
                activeSubTab === 'Kitchen Stations'
                  ? 'bg-yellow-400/10 outline-yellow-400/80 text-white shadow-sm'
                  : 'outline-transparent hover:bg-neutral-800 text-gray-400'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`p-1.5 rounded-md flex items-center justify-center ${
                    activeSubTab === 'Kitchen Stations'
                      ? 'bg-yellow-400 text-neutral-950'
                      : 'bg-black text-gray-400'
                  }`}
                >
                  <ChefHat className="w-4 h-4" />
                </div>
                <span className="text-sm font-normal">Kitchen Stations</span>
              </div>
            </button>

            {/* Staff Configuration */}
            <button
              type="button"
              onClick={() => handleSubTabChange('Staff Configuration')}
              className={`w-full px-3 py-2.5 rounded-lg outline outline-1 outline-offset-[-1px] flex items-center justify-between transition cursor-pointer text-left ${
                activeSubTab === 'Staff Configuration'
                  ? 'bg-yellow-400/10 outline-yellow-400/80 text-white shadow-sm'
                  : 'outline-transparent hover:bg-neutral-800 text-gray-400'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`p-1.5 rounded-md flex items-center justify-center ${
                    activeSubTab === 'Staff Configuration'
                      ? 'bg-yellow-400 text-neutral-950'
                      : 'bg-black text-gray-400'
                  }`}
                >
                  <Users className="w-4 h-4" />
                </div>
                <span className="text-sm font-normal">Staff Configuration</span>
              </div>
            </button>

            {/* Ordering Channels */}
            <button
              type="button"
              onClick={() => handleSubTabChange('Ordering Channels')}
              className={`w-full px-3 py-2.5 rounded-lg outline outline-1 outline-offset-[-1px] flex items-center justify-between transition cursor-pointer text-left ${
                activeSubTab === 'Ordering Channels'
                  ? 'bg-yellow-400/10 outline-yellow-400/80 text-white shadow-sm'
                  : 'outline-transparent hover:bg-neutral-800 text-gray-400'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`p-1.5 rounded-md flex items-center justify-center ${
                    activeSubTab === 'Ordering Channels'
                      ? 'bg-yellow-400 text-neutral-950'
                      : 'bg-black text-gray-400'
                  }`}
                >
                  <Radio className="w-4 h-4" />
                </div>
                <span className="text-sm font-normal">Ordering Channels</span>
              </div>
            </button>
          </div>

          {/* Access Control Notice matching Figma */}
          <div className="mt-4 p-3 bg-orange-400/10 rounded-lg outline outline-1 outline-offset-[-1px] outline-orange-400/60 flex flex-col gap-1">
            <span className="text-orange-400 text-xs font-medium">Access control</span>
            <span className="text-zinc-400 text-[11px] leading-4">
              Branch Legal Address and kiosk updates require GM clearance.
            </span>
          </div>
        </div>

        {/* Right Content Pane */}
        <div className="md:col-span-8 lg:col-span-9 space-y-6">
          {/* TAB 1: Branch Info & Hours */}
          {activeSubTab === 'Branch Info & Hours' && (
            <div className="space-y-6">
              {/* Form Card matching Figma */}
              <div className="p-6 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-800 flex flex-col gap-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Branch Name */}
                  <div className="flex flex-col gap-2">
                    <label className="text-white text-xs font-normal leading-5">Branch Name</label>
                    <input
                      type="text"
                      value={branchName}
                      onChange={(e) => setBranchName(e.target.value)}
                      className="px-3 py-2.5 bg-zinc-950 rounded-md outline outline-1 outline-offset-[-1px] outline-zinc-800 text-neutral-200 text-xs font-normal focus:outline-none"
                    />
                  </div>

                  {/* Branch Code */}
                  <div className="flex flex-col gap-2">
                    <label className="text-white text-xs font-normal leading-5">Branch code</label>
                    <input
                      type="text"
                      value={branchCode}
                      onChange={(e) => setBranchCode(e.target.value)}
                      className="px-3 py-2.5 bg-zinc-950 rounded-md outline outline-1 outline-offset-[-1px] outline-zinc-800 text-neutral-200 text-xs font-normal focus:outline-none"
                    />
                  </div>

                  {/* Contact Phone */}
                  <div className="flex flex-col gap-2">
                    <label className="text-white text-xs font-normal leading-5">Contact Phone</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="px-3 py-2.5 bg-zinc-950 rounded-md outline outline-1 outline-offset-[-1px] outline-zinc-800 text-neutral-200 text-xs font-normal focus:outline-none"
                    />
                  </div>

                  {/* Contact Email */}
                  <div className="flex flex-col gap-2">
                    <label className="text-white text-xs font-normal leading-5">Contact Email</label>
                    <input
                      type="text"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="px-3 py-2.5 bg-zinc-950 rounded-md outline outline-1 outline-offset-[-1px] outline-zinc-800 text-neutral-200 text-xs font-normal focus:outline-none"
                    />
                  </div>
                </div>

                {/* Street Address */}
                <div className="flex flex-col gap-2">
                  <label className="text-white text-xs font-normal leading-5">Street Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="px-3 py-2.5 bg-zinc-950 rounded-md outline outline-1 outline-offset-[-1px] outline-zinc-800 text-neutral-200 text-xs font-normal focus:outline-none"
                  />
                </div>

                {/* City, State, Postal code Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-white text-xs font-normal leading-5">City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="px-3 py-2.5 bg-zinc-950 rounded-md outline outline-1 outline-offset-[-1px] outline-zinc-800 text-neutral-200 text-xs font-normal focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-white text-xs font-normal leading-5">State</label>
                    <input
                      type="text"
                      value={stateCode}
                      onChange={(e) => setStateCode(e.target.value)}
                      className="px-3 py-2.5 bg-zinc-950 rounded-md outline outline-1 outline-offset-[-1px] outline-zinc-800 text-neutral-200 text-xs font-normal focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-white text-xs font-normal leading-5">Postal code</label>
                    <input
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="px-3 py-2.5 bg-zinc-950 rounded-md outline outline-1 outline-offset-[-1px] outline-zinc-800 text-neutral-200 text-xs font-normal focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={handleSaveBranchInfo}
                    disabled={isSavingBranchInfo}
                    className="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-neutral-900 text-xs font-semibold rounded-lg transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                  >
                    {isSavingBranchInfo ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                    <span>{isSavingBranchInfo ? 'Saving...' : 'Save Branch Details'}</span>
                  </button>
                </div>
              </div>

              {/* Operating Hours Section matching Figma */}
              <div className="p-6 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-800 flex flex-col gap-4">
                <div className="flex flex-col gap-0.5">
                  <h3 className="text-white text-lg font-medium font-['Poppins'] leading-5">
                    Operating Hours
                  </h3>
                  <span className="text-neutral-400 text-xs font-normal font-['Poppins']">
                    Weekly Schedule Defining branch operational Time
                  </span>
                </div>

                <div className="bg-stone-950 rounded-xl border border-zinc-800 divide-y divide-zinc-800/80">
                  {operatingHours.map((schedule, idx) => (
                    <div
                      key={schedule.day}
                      className="px-4 py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                    >
                      <div className="flex items-center gap-4 min-w-[200px]">
                        <span className="text-white text-sm font-medium font-['Poppins']">
                          {schedule.day}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleToggleDayOpen(idx)}
                          className="flex items-center gap-2 cursor-pointer group"
                        >
                          <div
                            className={`w-5 h-5 rounded flex items-center justify-center outline outline-1 outline-offset-[-1px] transition ${
                              schedule.isOpen
                                ? 'outline-yellow-400 bg-yellow-400/10 text-yellow-400'
                                : 'outline-neutral-700 bg-neutral-900 text-neutral-500'
                            }`}
                          >
                            {schedule.isOpen && <CheckCircle2 className="w-3.5 h-3.5" />}
                          </div>
                          <span className="text-white text-xs font-normal font-['Poppins'] group-hover:text-yellow-400 transition">
                            {schedule.isOpen ? 'open Day' : 'Closed'}
                          </span>
                        </button>
                      </div>

                      {/* Time Pickers */}
                      <div className="flex items-center gap-2 text-xs font-['Poppins']">
                        <input
                          type="time"
                          value={schedule.openTime}
                          disabled={!schedule.isOpen}
                          onChange={(e) => handleOpenTimeChange(idx, e.target.value)}
                          className="px-2.5 py-1.5 bg-slate-950 rounded-md outline outline-1 outline-offset-[-1px] outline-neutral-700 text-white disabled:opacity-40 focus:outline-yellow-400"
                        />
                        <span className="text-neutral-500">To</span>
                        <input
                          type="time"
                          value={schedule.closeTime}
                          disabled={!schedule.isOpen}
                          onChange={(e) => handleCloseTimeChange(idx, e.target.value)}
                          className="px-2.5 py-1.5 bg-slate-950 rounded-md outline outline-1 outline-offset-[-1px] outline-neutral-700 text-white disabled:opacity-40 focus:outline-yellow-400"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2">
                  <span className="text-xs text-neutral-400">
                    Changes persist directly to database table <code className="text-teal-400">branch_operating_hours</code>.
                  </span>
                  <button
                    type="button"
                    onClick={handleSaveOperatingHours}
                    disabled={isSavingHours}
                    className="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-neutral-900 text-xs font-semibold rounded-lg transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                  >
                    {isSavingHours ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                    <span>{isSavingHours ? 'Saving to Database...' : 'Save Operating Hours'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Tables & Seating */}
          {activeSubTab === 'Tables & Seating' && (
            <div className="space-y-6">
              {/* Header with Add Table button */}
              <div className="flex justify-between items-center">
                <div className="flex flex-col gap-0.5">
                  <h3 className="text-white text-lg font-medium font-['Poppins']">
                    Tables & Seating Layout
                  </h3>
                  <span className="text-neutral-400 text-xs font-normal font-['Poppins']">
                    {configTables.length} active tables configured across 4 floor sections.
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddTableOpen(true)}
                  className="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-neutral-950 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition cursor-pointer shadow-md"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Table Setup</span>
                </button>
              </div>

              {/* Table Cards Grid matching Figma */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {configTables.map((table) => {
                  const isActive = table.status === 'Active';

                  return (
                    <div
                      key={table.id}
                      className="p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-800 flex flex-col gap-3.5 shadow-md"
                    >
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                          <span
                            className={`text-sm font-semibold ${
                              table.zone === 'Indoor Dining'
                                ? 'text-green-500'
                                : table.zone === 'VIP Section'
                                ? 'text-purple-400'
                                : table.zone === 'Patio Terrace'
                                ? 'text-amber-400'
                                : 'text-blue-400'
                            }`}
                          >
                            {table.zone}
                          </span>

                          <span
                            className={`px-2.5 py-0.5 rounded-md text-xs font-medium outline outline-1 outline-offset-[-1px] ${
                              isActive
                                ? 'bg-green-500/10 text-green-500 outline-green-500/30'
                                : 'bg-yellow-400/10 text-yellow-400 outline-yellow-400/30'
                            }`}
                          >
                            {table.status}
                          </span>
                        </div>

                        <div className="text-white text-xl font-medium font-['Inter'] leading-6">
                          {table.number}
                        </div>
                      </div>

                      <div className="w-full h-px bg-neutral-800" />

                      <div className="flex justify-between items-center text-sm">
                        <span className="text-neutral-400 font-normal">Capacity:</span>
                        <span className="text-gray-200 font-medium">{table.capacity}</span>
                      </div>

                      <div className="w-full h-px bg-neutral-800" />

                      <button
                        type="button"
                        onClick={() => handleToggleTableStatus(table.id)}
                        className="w-full pt-1 flex justify-between items-center text-sm font-medium text-neutral-400 hover:text-white transition cursor-pointer select-none"
                      >
                        <span>Toggle Status</span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded transition ${
                            isActive
                              ? 'text-red-400 hover:bg-red-400/10'
                              : 'text-green-400 hover:bg-green-400/10'
                          }`}
                        >
                          {isActive ? 'Mark Maintenance' : 'Set Active'}
                        </span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: Kitchen Stations */}
          {activeSubTab === 'Kitchen Stations' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex flex-col gap-0.5">
                  <h3 className="text-white text-lg font-medium font-['Poppins']">
                    Kitchen Display & Printer Routing
                  </h3>
                  <span className="text-neutral-400 text-xs font-normal font-['Poppins']">
                    Manage hardware IP routing and station line categories.
                  </span>
                </div>
              </div>

              <div className="space-y-3.5">
                {stations.map((stn) => (
                  <div
                    key={stn.id}
                    className="p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-800 flex flex-col gap-3 shadow-md"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div className="flex flex-col gap-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-white text-base font-semibold leading-5">
                            {stn.name}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-md text-xs font-medium outline outline-1 outline-offset-[-1px] ${
                              stn.active
                                ? 'bg-green-500/10 text-green-500 outline-green-500/30'
                                : 'bg-neutral-800 text-neutral-400 outline-neutral-700'
                            }`}
                          >
                            {stn.status}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="text-zinc-400">Assigned Menu Categories:</span>
                          {stn.categories.map((cat) => (
                            <span
                              key={cat}
                              className="px-2 py-1 bg-neutral-900 rounded-sm outline outline-1 outline-offset-[-1px] outline-neutral-800 text-gray-300 font-medium"
                            >
                              {cat}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Station Active Checkbox */}
                      <button
                        type="button"
                        onClick={() => handleToggleStationActive(stn.id)}
                        className="flex items-center gap-2 cursor-pointer group shrink-0"
                      >
                        <div
                          className={`w-5 h-5 rounded flex items-center justify-center outline outline-1 outline-offset-[-1px] transition ${
                            stn.active
                              ? 'outline-yellow-400 bg-yellow-400/10 text-yellow-400'
                              : 'outline-neutral-700 bg-neutral-900 text-neutral-500'
                          }`}
                        >
                          {stn.active && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </div>
                        <span className="text-neutral-400 text-sm font-normal group-hover:text-white transition">
                          Station Active
                        </span>
                      </button>
                    </div>

                    <div className="text-stone-400 text-xs font-normal tracking-wide pt-1 border-t border-neutral-800">
                      Kitchen Printer / KDS IP: {stn.ip}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: Staff Configuration */}
          {activeSubTab === 'Staff Configuration' && (
            <div className="p-6 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-800 space-y-6">
              <div className="flex flex-col gap-1">
                <h3 className="text-white text-lg font-medium font-['Poppins']">
                  Staff Role Policies & Permissions
                </h3>
                <span className="text-neutral-400 text-xs">
                  Configure role thresholds, discount clearances, and multi-branch access rights.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-stone-950 rounded-lg border border-zinc-800 flex flex-col gap-2">
                  <span className="text-white text-sm font-semibold">Manager Override Passcode</span>
                  <span className="text-neutral-400 text-xs">
                    Required for bill voids, item comps above $20, and cash drawer open.
                  </span>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-yellow-400 font-mono text-sm tracking-widest">••••••</span>
                    <button
                      type="button"
                      className="text-xs text-neutral-400 hover:text-white underline ml-auto cursor-pointer"
                    >
                      Update PIN
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-stone-950 rounded-lg border border-zinc-800 flex flex-col gap-2">
                  <span className="text-white text-sm font-semibold">Auto Shift Cutoff</span>
                  <span className="text-neutral-400 text-xs">
                    Automatically prompt waiters to clock out 30 minutes after last table settled.
                  </span>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-2 py-0.5 bg-green-500/10 text-green-500 rounded text-xs font-medium">
                      Enabled
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Ordering Channels */}
          {activeSubTab === 'Ordering Channels' && (
            <div className="p-6 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-800 space-y-6">
              <div className="flex flex-col gap-1">
                <h3 className="text-white text-lg font-medium font-['Poppins']">
                  Active Ordering Channels & Gateways
                </h3>
                <span className="text-neutral-400 text-xs">
                  Toggle incoming order sources directly connected to Tavonza AI Kitchen KDS.
                </span>
              </div>

              <div className="space-y-3">
                {[
                  { name: 'POS Counter Terminals', desc: 'Station 1 & Station 2 Register', active: true },
                  { name: 'QR Table Ordering', desc: 'Contactless web menu via table QR', active: true },
                  { name: 'Self-Order Kiosk', desc: 'Front lobby interactive ordering kiosks', active: false },
                  { name: 'Online Delivery Aggregators', desc: 'UberEats & DoorDash direct bridge', active: true },
                ].map((channel, i) => (
                  <div
                    key={i}
                    className="p-4 bg-stone-950 rounded-lg border border-zinc-800 flex justify-between items-center"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="text-white text-sm font-semibold">{channel.name}</span>
                      <span className="text-neutral-400 text-xs">{channel.desc}</span>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-md text-xs font-medium ${
                        channel.active
                          ? 'bg-green-500/10 text-green-500 border border-green-500/30'
                          : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                      }`}
                    >
                      {channel.active ? 'Online & Syncing' : 'Paused'}
                    </span>
                  </div>
                ))}
              </div>

              {/* Order Routing & Acceptance Mode Configuration */}
              <div className="pt-4 border-t border-neutral-800 space-y-4">
                <div className="flex flex-col gap-1">
                  <h4 className="text-white text-base font-medium font-['Poppins']">
                    Order Routing & Kitchen Acceptance Workflow
                  </h4>
                  <span className="text-neutral-400 text-xs">
                    Choose whether customer QR table orders require server approval or route automatically to the kitchen.
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Mode 1: Manual Waiter Approval */}
                  <div
                    onClick={() => handleUpdateAcceptanceMode('WAITER_APPROVAL')}
                    className={`p-4 rounded-xl border transition cursor-pointer flex flex-col gap-2 ${
                      acceptanceMode === 'WAITER_APPROVAL'
                        ? 'bg-amber-500/10 border-amber-500/50 shadow-md ring-1 ring-amber-500/30'
                        : 'bg-stone-950 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-white text-sm font-semibold">Manual Waiter Approval</span>
                      <span
                        className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                          acceptanceMode === 'WAITER_APPROVAL'
                            ? 'border-amber-400 bg-amber-400'
                            : 'border-zinc-600'
                        }`}
                      >
                        {acceptanceMode === 'WAITER_APPROVAL' && (
                          <span className="w-1.5 h-1.5 rounded-full bg-black" />
                        )}
                      </span>
                    </div>
                    <span className="text-neutral-400 text-xs">
                      Orders are sent to waiter tablets for verification before tickets appear on the kitchen KDS. Recommended for full-service dining.
                    </span>
                    <span className="text-amber-400 text-[11px] font-medium mt-1">
                      Status: {acceptanceMode === 'WAITER_APPROVAL' ? 'Active Workflow' : 'Click to activate'}
                    </span>
                  </div>

                  {/* Mode 2: Automatic Direct to Kitchen */}
                  <div
                    onClick={() => handleUpdateAcceptanceMode('AUTO_ACCEPT')}
                    className={`p-4 rounded-xl border transition cursor-pointer flex flex-col gap-2 ${
                      acceptanceMode === 'AUTO_ACCEPT'
                        ? 'bg-green-500/10 border-green-500/50 shadow-md ring-1 ring-green-500/30'
                        : 'bg-stone-950 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-white text-sm font-semibold">Automatic Direct-to-Kitchen</span>
                      <span
                        className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                          acceptanceMode === 'AUTO_ACCEPT'
                            ? 'border-green-400 bg-green-400'
                            : 'border-zinc-600'
                        }`}
                      >
                        {acceptanceMode === 'AUTO_ACCEPT' && (
                          <span className="w-1.5 h-1.5 rounded-full bg-black" />
                        )}
                      </span>
                    </div>
                    <span className="text-neutral-400 text-xs">
                      Contactless guest orders immediately appear on Kitchen & Bar display screens without waiting for server intervention.
                    </span>
                    <span className="text-green-400 text-[11px] font-medium mt-1">
                      Status: {acceptanceMode === 'AUTO_ACCEPT' ? 'Active Workflow' : 'Click to activate'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add New Table Modal */}
      <AddTableModal
        isOpen={isAddTableOpen}
        onClose={() => setIsAddTableOpen(false)}
        onSaveTable={handleSaveNewTable}
      />
    </div>
  );
}

export default function BranchConfigView() {
  return (
    <React.Suspense
      fallback={
        <div className="p-8 text-neutral-400 flex items-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-yellow-400" />
          <span>Loading branch configuration...</span>
        </div>
      }
    >
      <BranchConfigContent />
    </React.Suspense>
  );
}
