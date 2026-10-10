'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Home,
  UtensilsCrossed,
  Bell,
  User,
  Sparkles,
  Plus,
  Minus,
  Trash2,
  Receipt,
  RotateCcw,
  CheckCircle2,
  Clock,
  X,
  LogOut,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Search,
  Check,
} from 'lucide-react';
import { TavonzaLogoIcon } from '@/components/TavonzaLogo';
import { useAppSelector } from '@/redux/store';
import { useLogout } from '@/hooks/useLogout';
import { toast } from 'sonner';
import { waiterService, getActiveBranchId } from '@/redux/features/waiterApi';
import OrdersListView from './orders/OrdersListView';
import OrderDetailView from './orders/OrderDetailView';
import { OrderItemData } from './orders/orderData';
import BottomDock from './navigation/BottomDock';
import { useNewWaiterShell } from './navigation/NewWaiterShellContext';

interface TableItem {
  id: string;
  name: string;
  guests: string;
  location: string;
  status: 'Available' | 'New Order' | 'Ready To Serve' | 'Occupied';
  orderCount?: number;
  timeWaiting?: string;
  amount?: string;
}

interface OrderItem {
  id: string;
  table: string;
  items: string;
  price: string;
  status: 'Active' | 'Pending';
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  priceFormatted: string;
  image: string;
  tag: 'None Veg' | 'Veg';
  category: 'Starters' | 'Mains' | 'Drinks' | 'Desserts';
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  priceFormatted: string;
  image: string;
  tag: string;
  quantity: number;
}

interface TableOrderDetail {
  id: string;
  orderNumber: string;
  tableId: string;
  status: 'Pending' | 'Cooking' | 'Ready to Serve' | 'Completed';
  targetTime: string;
  targetDuration: string;
  items: {
    name: string;
    price: string;
  }[];
  totalAmount: string;
}

// Master Menu Catalog matching Figma "The Burger Lab" style
const MENU_CATALOG: MenuItem[] = [
  {
    id: 'm-1',
    name: 'The Burger Lab',
    description: 'Brioche, wagyu patty, cheddar, secret aioli',
    price: 26.5,
    priceFormatted: '$26.5',
    image: '/images/burger.jpg',
    tag: 'None Veg',
    category: 'Mains',
  },
  {
    id: 'm-2',
    name: 'Classic Burger',
    description: 'Double beef patty, aged cheddar, crisp lettuce',
    price: 12.99,
    priceFormatted: '$12.99',
    image: '/images/burger.jpg',
    tag: 'None Veg',
    category: 'Mains',
  },
  {
    id: 'm-3',
    name: 'Grilled Seabass',
    description: 'Pan-seared Mediterranean fillet, herb butter',
    price: 34.0,
    priceFormatted: '$34.0',
    image: '/images/seabass.jpg',
    tag: 'None Veg',
    category: 'Mains',
  },
  {
    id: 'm-4',
    name: 'Truffle Caesar',
    description: 'Crispy romaine, parmesan shavings, truffle dressing',
    price: 14.5,
    priceFormatted: '$14.5',
    image: '/images/slide1.jpg',
    tag: 'Veg',
    category: 'Starters',
  },
  {
    id: 'm-5',
    name: 'Smoked Bruschetta',
    description: 'Heirloom tomatoes, fresh basil, balsamic glaze',
    price: 11.0,
    priceFormatted: '$11.0',
    image: '/images/slide2.jpg',
    tag: 'Veg',
    category: 'Starters',
  },
  {
    id: 'm-6',
    name: 'Iced Citrus Fizz',
    description: 'Sparkling tonic, yuzu, fresh mint leaves',
    price: 8.5,
    priceFormatted: '$8.5',
    image: '/images/slide3.jpg',
    tag: 'Veg',
    category: 'Drinks',
  },
  {
    id: 'm-7',
    name: 'Chocolate Lava',
    description: 'Warm molten center, bourbon vanilla bean gelato',
    price: 12.0,
    priceFormatted: '$12.0',
    image: '/images/slide1.jpg',
    tag: 'Veg',
    category: 'Desserts',
  },
  {
    id: 'm-8',
    name: 'Crispy Calamari',
    description: 'Flash-fried squid, smoked chili dipping sauce',
    price: 16.5,
    priceFormatted: '$16.5',
    image: '/images/slide2.jpg',
    tag: 'None Veg',
    category: 'Starters',
  },
];

export default function NewWaiterLandingView({ initialTab = 'home' }: { initialTab?: string }) {
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  const { handleLogout } = useLogout();

  // Active navigation tab: 'home' | 'table-orders' | 'menu' | 'create-order' | 'order' | 'alert' | 'profile'
  const [activeTab, setActiveTab] = useState<'home' | 'table-orders' | 'menu' | 'create-order' | 'order' | 'alert' | 'profile'>(() => {
    if (initialTab === 'table-orders' || initialTab === 'table-order' || initialTab === 'table-01') return 'table-orders';
    if (initialTab === 'menu' || initialTab === 'browse-menu') return 'menu';
    if (initialTab === 'create-order') return 'create-order';
    if (initialTab === 'order' || initialTab === 'orders') return 'order';
    if (initialTab === 'alert' || initialTab === 'alerts') return 'alert';
    if (initialTab === 'profile') return 'profile';
    return 'home';
  });

  // Selected Table for Detail View
  const [selectedTable, setSelectedTable] = useState<TableItem | null>(null);


  // Selected Order for Order Details View (Figma Screen 2/3/4/5)
  const [selectedDetailOrder, setSelectedDetailOrder] = useState<OrderItemData | null>(null);

  // Track if navigated to Orders via "See All" button on Floor page
  const [cameFromFloor, setCameFromFloor] = useState(false);

  // Sync activeTab when initialTab prop changes
  useEffect(() => {
    const tab = (() => {
      if (initialTab === 'table-orders' || initialTab === 'table-order' || initialTab === 'table-01') return 'table-orders';
      if (initialTab === 'menu' || initialTab === 'browse-menu') return 'menu';
      if (initialTab === 'create-order') return 'create-order';
      if (initialTab === 'order' || initialTab === 'orders') return 'order';
      if (initialTab === 'alert' || initialTab === 'alerts') return 'alert';
      if (initialTab === 'profile') return 'profile';
      return 'home';
    })();
    setActiveTab(tab);
  }, [initialTab]);

  // Synchronize browser URL route in address bar whenever activeTab changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const tabToPathMap: Record<string, string> = {
      'home': '/new-waiter-dashboard/home',
      'menu': '/new-waiter-dashboard/menu',
      'create-order': '/new-waiter-dashboard/create-order',
      'table-orders': '/new-waiter-dashboard/table-orders',
      'order': '/new-waiter-dashboard/orders',
      'alert': '/new-waiter-dashboard/alerts',
      'profile': '/new-waiter-dashboard/profile',
    };
    const targetPath = tabToPathMap[activeTab] || '/new-waiter-dashboard/home';
    const currentPath = window.location.pathname.replace(/\/$/, '');
    if (currentPath !== targetPath) {
      window.history.pushState({ tab: activeTab }, '', targetPath);
    }
  }, [activeTab]);

  // Listen to browser back / forward popstate navigation
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase().replace(/\/$/, '');
      if (path.endsWith('/menu')) setActiveTab('menu');
      else if (path.endsWith('/create-order')) setActiveTab('create-order');
      else if (path.endsWith('/table-orders')) setActiveTab('table-orders');
      else if (path.endsWith('/orders')) setActiveTab('order');
      else if (path.endsWith('/alerts') || path.endsWith('/alert')) setActiveTab('alert');
      else if (path.endsWith('/profile')) setActiveTab('profile');
      else if (path.endsWith('/floor') || path.endsWith('/home') || path.endsWith('/new-waiter-dashboard')) setActiveTab('home');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Modals & drawers
  const [activeModal, setActiveModal] = useState<'bill' | 'jarvis' | null>(null);


  // Format waiter name & greeting
  const waiterName = user?.name || user?.firstName || 'Michael';
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  // 1. Interactive Tables State
  const [tables, setTables] = useState<TableItem[]>([]);

  // 2. Pending Orders
  const [pendingOrders, setPendingOrders] = useState<OrderItem[]>([]);

  // 3. Table Orders Details State
  const [tableOrderFilter, setTableOrderFilter] = useState<'ALL' | 'Pending' | 'Active' | 'Completed'>('ALL');
  const [tableOrders, setTableOrders] = useState<TableOrderDetail[]>([]);

  // Real-time polling for tables and pending orders on the home tab
  const loadHomeDashboardData = React.useCallback(async () => {
    try {
      const branchId = getActiveBranchId();
      const [backendTables, liveOrders] = await Promise.all([
        waiterService.getMyTables(branchId).catch(() => []),
        waiterService.queryOrders({ branchId, status: 'PENDING' }).catch(() => []),
      ]);

      if (Array.isArray(backendTables) && backendTables.length > 0) {
        const mappedTables = backendTables.map((bt: any) => {
          const tableLabel = bt.tableNumber || bt.label || `Table-${bt.id?.slice(0, 2)}`;
          const tableOrdersCount = Array.isArray(liveOrders)
            ? liveOrders.filter(
                (o: any) =>
                  o.tableId === bt.tableId ||
                  o.tableId === bt.id ||
                  o.tableNumber === tableLabel ||
                  o.tableLabel === tableLabel
              ).length
            : 0;

          let statusDisplay: 'Available' | 'New Order' | 'Ready To Serve' | 'Occupied' = 'Available';
          if (tableOrdersCount > 0) {
            statusDisplay = 'New Order';
          } else if (bt.serviceStatus === 'OCCUPIED' || bt.serviceStatus === 'PREPARING') {
            statusDisplay = 'Occupied';
          } else if (bt.serviceStatus === 'READY') {
            statusDisplay = 'Ready To Serve';
          }

          return {
            id: bt.tableId || bt.id,
            name: tableLabel.startsWith('Table') ? tableLabel : `Table-${tableLabel}`,
            guests: `${bt.capacity || 4} Guests`,
            location: 'Main Hall',
            status: statusDisplay,
            orderCount: tableOrdersCount,
          };
        });
        setTables(mappedTables);
        setSelectedTable((prev) => prev || mappedTables[0] || null);
      }



      if (Array.isArray(liveOrders)) {
        setPendingOrders(
          liveOrders.map((lo: any) => {
            const itemsSummary =
              Array.isArray(lo.items) && lo.items.length > 0
                ? lo.items.map((i: any) => `${i.quantity || 1}x ${i.productName || i.name || 'Dish'}`).join(', ')
                : `${lo.itemsCount || 1} item(s)`;

            return {
              id: lo.orderNumber
                ? lo.orderNumber.startsWith('#')
                  ? lo.orderNumber
                  : `#${lo.orderNumber}`
                : `#${(lo.id || '').slice(0, 5)}`,
              table: lo.tableLabel || lo.tableNumber || 'Table',
              items: itemsSummary,
              price: `$${Number(lo.totalAmount || lo.total || 0).toFixed(2)}`,
              status: 'Pending',
            };
          })
        );
      }
    } catch (err) {
      console.error('Failed to load waiter home data:', err);
    }
  }, []);

  useEffect(() => {
    loadHomeDashboardData();
    const handleRealtime = () => {
      loadHomeDashboardData();
    };
    window.addEventListener('tavonza:table_status_changed', handleRealtime);
    window.addEventListener('tavonza:table_session_changed', handleRealtime);
    window.addEventListener('tavonza:order_created', handleRealtime);
    window.addEventListener('tavonza:order_status_changed', handleRealtime);
    window.addEventListener('tavonza:order_item_changed', handleRealtime);
    window.addEventListener('tavonza:waiter_called', handleRealtime);
    window.addEventListener('tavonza:payment_status_changed', handleRealtime);

    return () => {
      window.removeEventListener('tavonza:table_status_changed', handleRealtime);
      window.removeEventListener('tavonza:table_session_changed', handleRealtime);
      window.removeEventListener('tavonza:order_created', handleRealtime);
      window.removeEventListener('tavonza:order_status_changed', handleRealtime);
      window.removeEventListener('tavonza:order_item_changed', handleRealtime);
      window.removeEventListener('tavonza:waiter_called', handleRealtime);
      window.removeEventListener('tavonza:payment_status_changed', handleRealtime);
    };
  }, [loadHomeDashboardData]);

  // Load orders for selected table
  useEffect(() => {
    if (selectedTable?.id && selectedTable.id !== 'T-01') {
      const branchId = getActiveBranchId();
      waiterService
        .queryOrders({ branchId, tableId: selectedTable.id })

        .then((orders) => {
          if (Array.isArray(orders) && orders.length > 0) {
            setTableOrders(
              orders.map((o: any) => {
                const placed = o.placedAt ? new Date(o.placedAt) : new Date();
                const timeStr = !isNaN(placed.getTime())
                  ? placed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : '10:24';
                let statusVal: 'Pending' | 'Cooking' | 'Ready to Serve' | 'Completed' = 'Pending';
                if (o.status === 'CONFIRMED' || o.status === 'PREPARING') statusVal = 'Cooking';
                else if (o.status === 'READY') statusVal = 'Ready to Serve';
                else if (o.status === 'SERVED' || o.status === 'COMPLETED') statusVal = 'Completed';

                return {
                  id: o.id || o.orderId,
                  orderNumber: o.orderNumber ? `Order No #${o.orderNumber}` : `Order #${(o.id || '').slice(0, 5)}`,
                  tableId: selectedTable.id,
                  status: statusVal,
                  targetTime: timeStr,
                  targetDuration: statusVal === 'Completed' ? 'Completed' : 'Target 15min',
                  items:
                    Array.isArray(o.items) && o.items.length > 0
                      ? o.items.map((i: any) => ({
                          name: i.productName || i.name || 'Dish',
                          price: `$${Number(i.unitPrice || 0).toFixed(2)}`,
                        }))
                      : [{ name: `${o.itemsCount || 1} Item(s)`, price: `$${Number(o.totalAmount || 0).toFixed(2)}` }],
                  totalAmount: `$${Number(o.totalAmount || o.total || 0).toFixed(2)}`,
                };
              })
            );
          } else {
            setTableOrders([]);
          }
        })
        .catch(() => {});
    }
  }, [selectedTable?.id]);

  // 4. Browse Menu & Search States
  const [menuSearchQuery, setMenuSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Starters' | 'Mains' | 'Drinks' | 'Desserts'>('All');

  // Filtered menu items
  const filteredMenuItems = MENU_CATALOG.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesQuery =
      item.name.toLowerCase().includes(menuSearchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(menuSearchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  // 5. Cart / Order Ticket State
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: 'm-2',
      name: 'Classic Burger',
      price: 12.99,
      priceFormatted: '$12.99',
      image: '/images/burger.jpg',
      tag: 'None Veg',
      quantity: 1,
    },
  ]);

  // 6. Create Order Form States
  const [selectedModifications, setSelectedModifications] = useState<string[]>(['No Onions']);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedTableId, setSelectedTableId] = useState('T-01');
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Cart helper functions
  const totalCartQuantity = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const handleAddToCart = (menuItem: MenuItem) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === menuItem.id);
      if (existing) {
        return prev.map((item) =>
          item.id === menuItem.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          id: menuItem.id,
          name: menuItem.name,
          price: menuItem.price,
          priceFormatted: menuItem.priceFormatted,
          image: menuItem.image,
          tag: menuItem.tag,
          quantity: 1,
        },
      ];
    });
    toast.success(`Added ${menuItem.name} to order`);
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleDeleteCartItem = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
    toast.info('Item removed from order');
  };

  const toggleModification = (mod: string) => {
    setSelectedModifications((prev) =>
      prev.includes(mod) ? prev.filter((m) => m !== mod) : [...prev, mod]
    );
  };

  const handleClearTable = (tableId: string) => {
    setTables((prev) =>
      prev.map((t) =>
        t.id === tableId
          ? { ...t, status: 'Available', orderCount: undefined, timeWaiting: undefined }
          : t
      )
    );
    toast.success(`${tableId} has been cleared and is now Available.`);
  };

  // Interactive Table Orders Actions (Matching Figma Screenshots 1, 2, 3)
  const handleAcceptTableOrder = (orderId: string) => {
    setTableOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'Cooking' } : o))
    );
    toast.success('Order #1230 Accepted!', {
      description: 'Kitchen is now preparing the items (Cooking state).',
    });
  };

  const handleRejectTableOrder = (orderId: string) => {
    setTableOrders((prev) => prev.filter((o) => o.id !== orderId));
    toast.error('Order #1230 has been rejected.');
  };

  const handleAdvanceToReadyToServe = (orderId: string) => {
    setTableOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'Ready to Serve' } : o))
    );
    toast.info('Order #1230 is now Ready to Serve at the pass!');
  };

  const handleMarkTableOrderServed = (orderId: string) => {
    setTableOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'Completed' } : o))
    );
    setTables((prev) =>
      prev.map((t) =>
        t.id === (selectedTable?.id || 'T-01')
          ? { ...t, status: 'Occupied' }
          : t
      )
    );
    toast.success('Order #1230 marked as Served to Table-01!');
  };

  // Submit New Order to Kitchen
  const handleSendToKitchen = () => {
    if (cartItems.length === 0) {
      toast.error('Please add at least one item to create an order.');
      return;
    }

    const newOrderId = `#${Math.floor(10000 + Math.random() * 90000)}`;
    const itemsSummary = cartItems.map((ci) => `${ci.quantity}x ${ci.name}`).join(', ');
    const totalPrice = cartItems.reduce((acc, ci) => acc + ci.price * ci.quantity, 0);

    // Update tables state
    setTables((prev) =>
      prev.map((t) =>
        t.id === selectedTableId
          ? { ...t, status: 'New Order', orderCount: (t.orderCount || 0) + 1 }
          : t
      )
    );

    // Add to pending orders
    setPendingOrders((prev) => [
      {
        id: newOrderId,
        table: selectedTableId,
        items: itemsSummary,
        price: `$${totalPrice.toFixed(2)}`,
        status: 'Active',
      },
      ...prev,
    ]);

    toast.success(`Order ${newOrderId} dispatched to Kitchen for ${selectedTableId}!`, {
      description: `${itemsSummary} • Mods: ${selectedModifications.join(', ') || 'Standard'}`,
    });

    // Reset and return to Home
    setCustomerName('');
    setCustomerPhone('');
    setSpecialInstructions('');
    setActiveTab('home');
  };

  const getStatusBadge = (status: TableItem['status']) => {
    switch (status) {
      case 'Available':
        return (
          <div className="px-3 py-1 bg-green-500/10 rounded-[5px] flex items-center justify-center border border-green-500/20">
            <span className="text-green-500 text-xs font-medium font-['Inter']">Available</span>
          </div>
        );
      case 'New Order':
        return (
          <div className="px-3 py-1 bg-stone-800 rounded-[5px] flex items-center justify-center border border-amber-500/30">
            <span className="text-amber-500 text-xs font-medium font-['Inter']">New Order</span>
          </div>
        );
      case 'Ready To Serve':
        return (
          <div className="px-3 py-1 bg-stone-800 rounded-[5px] flex items-center justify-center border border-red-500/30">
            <span className="text-red-400 text-xs font-medium font-['Inter']">Ready To Serve</span>
          </div>
        );
      case 'Occupied':
        return (
          <div className="px-3 py-1 bg-gray-800 rounded-[5px] flex items-center justify-center border border-blue-500/30">
            <span className="text-blue-400 text-xs font-medium font-['Inter']">Occupied</span>
          </div>
        );
    }
  };

  // Filter Table Orders
  const filteredTableOrders = tableOrders.filter((order) => {
    if (tableOrderFilter === 'ALL') return true;
    if (tableOrderFilter === 'Pending') return order.status === 'Pending';
    if (tableOrderFilter === 'Active') return order.status === 'Cooking' || order.status === 'Ready to Serve';
    if (tableOrderFilter === 'Completed') return order.status === 'Completed';
    return true;
  });

  const actionNeededCount = tableOrders.filter(
    (o) => o.status === 'Pending' || o.status === 'Ready to Serve'
  ).length;

  const isOrderTabActive =
    activeTab === 'order' || activeTab === 'menu' || activeTab === 'create-order' || activeTab === 'table-orders';

  const { inShell } = useNewWaiterShell();

  const bodyContent = (
    <>
      {/* ──────────────── TAB 1: HOME (LANDING PAGE) ──────────────── */}
      {activeTab === 'home' && (
            <div className="animate-fadeIn">
              {/* Header Greeting Banner */}
              <div className="w-full px-5 pt-4 pb-6 bg-gradient-to-b from-neutral-900 to-neutral-900/40  ">
                <div className="flex flex-col gap-2.5">
                  <div className="flex flex-col gap-0.5">
                    <h1 className="text-white text-base font-semibold font-['Inter'] tracking-tight">
                      {getGreeting()}, {waiterName}
                    </h1>
                    <p className="text-neutral-400 text-xs font-normal font-['Inter'] leading-4">
                      Welcome Back ! Your Shift has started
                    </p>
                  </div>

                  {/* Live Sync Active Pill */}
                  <div className="self-start px-2 py-1 bg-green-500/10 rounded-[6px] border border-green-500/20 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0" />
                    <span className="text-green-500 text-xs font-medium font-['Inter']">Live Sync Active</span>
                  </div>
                </div>
              </div>

              <div className="px-4 py-5 flex flex-col gap-6">
                {/* "My Table" Header Row */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-0.5">
                    <h2 className="text-white text-base font-semibold font-['Inter']">My Table</h2>
                    <span className="text-zinc-500 text-xs font-normal font-['Inter']">
                      {tables.length} tables
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveTab('menu')}
                    className="h-7 px-3 bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-medium font-['Inter'] rounded-[6px] flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-sm shadow-yellow-500/20"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Create Order</span>
                  </button>
                </div>

                {/* Table Cards List */}
                <div className="flex flex-col gap-3.5">
                  {tables.map((table) => {
                    const isAvailable = table.status === 'Available';
                    return (
                      <div
                        key={table.id}
                        className="w-full bg-white/5 rounded-[12px] border border-white/10 backdrop-blur-md overflow-hidden hover:border-amber-400/30 transition-all duration-200"
                      >
                        {/* Top Card Info Row */}
                        <div className="p-3.5 flex items-center justify-between">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-white text-base font-semibold font-['Inter']">
                              {table.name}
                            </span>
                            <span className="text-zinc-400 text-xs font-normal font-['Inter']">
                              {table.guests} · {table.location}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {table.timeWaiting && (
                              <span className="text-red-400 text-xs font-medium font-['Inter']">
                                {table.timeWaiting}
                              </span>
                            )}
                            {getStatusBadge(table.status)}
                          </div>
                        </div>

                        {/* Bottom Action Split Buttons */}
                        <div className="border-t border-white/5 flex items-center divide-x divide-white/5 bg-neutral-900/60">
                          {/* 1. Order Button -> Opens Table Order Details (Exact Figma Screens) */}
                          <button
                            onClick={() => {
                              setSelectedTable(table);
                              setSelectedTableId(table.id);
                              setActiveTab('table-orders');
                            }}
                            className="flex-1 py-2.5 flex items-center justify-center gap-1.5 hover:bg-white/5 transition cursor-pointer text-amber-400"
                          >
                            <UtensilsCrossed className="w-3.5 h-3.5" />
                            <span className="text-xs font-medium font-['Inter']">
                              {table.orderCount ? `0${table.orderCount} Order` : 'Order'}
                            </span>
                          </button>

                          {/* 2. Bill Button */}
                          <button
                            onClick={() => {
                              setSelectedTable(table);
                              setActiveModal('bill');
                            }}
                            className="flex-1 py-2.5 flex items-center justify-center gap-1.5 hover:bg-white/5 transition cursor-pointer text-amber-400"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                            <span className="text-xs font-medium font-['Inter']">Bill</span>
                          </button>

                          {/* 3. Clear Button */}
                          <button
                            onClick={() => handleClearTable(table.id)}
                            disabled={isAvailable}
                            className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 transition ${
                              isAvailable
                                ? 'text-zinc-600 opacity-40 cursor-not-allowed'
                                : 'text-red-400 hover:bg-red-500/10 cursor-pointer'
                            }`}
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span className="text-xs font-medium font-['Inter']">Clear</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* "Pending Orders" Header Row */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex flex-col gap-0.5">
                    <h2 className="text-white text-base font-semibold font-['Inter']">Pending Orders</h2>
                    <span className="text-zinc-500 text-xs font-normal font-['Inter']">
                      Orders waiting to be processed
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setCameFromFloor(true);
                      setActiveTab('order');
                    }}
                    className="h-7 px-3 bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-medium font-['Inter'] rounded-[6px] flex items-center transition cursor-pointer shadow-sm shadow-yellow-500/20"
                  >
                    See All
                  </button>
                </div>

                {/* Pending Orders Cards List */}
                <div className="flex flex-col gap-2.5">
                  {pendingOrders.map((order, i) => (
                    <div
                      key={i}
                      className="p-3 bg-neutral-900 rounded-[10px] border border-white/5 flex items-center justify-between hover:border-white/10 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-200 text-xs font-semibold font-['Inter']">
                              {order.id}
                            </span>
                            <span className="text-amber-400 text-xs font-medium font-['Inter']">
                              {order.table}
                            </span>
                          </div>
                          <span className="text-zinc-400 text-xs font-normal font-['Inter'] line-clamp-1 mt-0.5">
                            {order.items}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-white text-xs font-semibold font-['Inter']">
                          {order.price}
                        </span>
                        <span
                          className={`px-2.5 py-1 text-xs font-medium font-['Inter'] rounded-[5px] ${
                            order.status === 'Active'
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-neutral-800 text-stone-300'
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ──────────────── TAB 2: TABLE ORDERS DETAIL (EXACT FIGMA SCREENSHOTS 1, 2, 3) ──────────────── */}
          {activeTab === 'table-orders' && (
            <div className="px-5 py-3 flex flex-col gap-4 animate-fadeIn">
              {/* Top Navigation Row: Back Button + Table-01 Title */}
              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => setActiveTab('home')}
                  className="w-7 h-7 bg-neutral-900 hover:bg-neutral-800 rounded-full flex justify-center items-center cursor-pointer transition border border-white/10"
                  title="Back to Tables"
                >
                  <ChevronLeft className="w-4 h-4 text-white" />
                </button>
                <h1 className="text-white text-lg font-semibold font-['Montserrat']">
                  {selectedTable?.name || 'Table-01'}
                </h1>
                <button
                  onClick={() => setActiveTab('menu')}
                  className="text-amber-400 text-xs font-medium hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>

              {/* Status Filter Tabs: ALL (yellow-400) | Pending | Active | Completed */}
              <div className="flex items-center gap-1.5 w-full select-none">
                {(['ALL', 'Pending', 'Active', 'Completed'] as const).map((filter) => {
                  const isActive = tableOrderFilter === filter;
                  return (
                    <button
                      key={filter}
                      onClick={() => setTableOrderFilter(filter)}
                      className={`flex-1 py-1.5 rounded-md text-xs font-medium font-['Poppins'] transition cursor-pointer text-center outline outline-1 outline-offset-[-1px] ${
                        isActive
                          ? 'bg-yellow-400 text-zinc-900 outline-neutral-800 font-semibold shadow-sm'
                          : 'bg-neutral-900 text-white outline-neutral-800 hover:bg-neutral-800'
                      }`}
                    >
                      {filter}
                    </button>
                  );
                })}
              </div>

              {/* Action Needed Badge (if any action pending or ready to serve) */}
              {actionNeededCount > 0 && (
                <div className="self-start px-2 py-1 bg-red-800 rounded-sm inline-flex items-center gap-1">
                  <span className="text-white text-xs font-normal font-['Poppins']">
                    Action Needed ({actionNeededCount})
                  </span>
                </div>
              )}

              {/* Orders Cards List */}
              <div className="flex flex-col gap-3.5">
                {filteredTableOrders.map((order) => {
                  const isCompleted = order.status === 'Completed';
                  const isPending = order.status === 'Pending';
                  const isCooking = order.status === 'Cooking';
                  const isReadyToServe = order.status === 'Ready to Serve';

                  return (
                    <div
                      key={order.id}
                      className={`w-full p-3.5 bg-neutral-900 rounded-xl border border-white/5 flex flex-col gap-4 transition duration-200 ${
                        isCompleted ? 'opacity-70' : 'hover:border-white/10'
                      }`}
                    >
                      {/* Card Header & Badge */}
                      <div className="flex flex-col gap-2">
                        {/* Status Badge */}
                        <div className="flex items-center justify-between">
                          {isPending && (
                            <div className="h-6 px-3.5 py-1 bg-stone-800 rounded-[5px] inline-flex items-center">
                              <span className="text-amber-500 text-xs font-medium font-['Inter'] leading-4">
                                Pending
                              </span>
                            </div>
                          )}
                          {isCooking && (
                            <div className="h-6 px-3.5 py-1 bg-stone-800 rounded-[5px] inline-flex items-center">
                              <span className="text-amber-500 text-xs font-medium font-['Inter'] leading-4">
                                Cooking
                              </span>
                            </div>
                          )}
                          {isReadyToServe && (
                            <div className="h-6 px-3.5 py-1 bg-green-500/10 rounded-[5px] inline-flex items-center">
                              <span className="text-green-500 text-xs font-medium font-['Inter'] leading-4">
                                Ready to Serve
                              </span>
                            </div>
                          )}
                          {isCompleted && (
                            <div className="px-2 py-1 bg-neutral-800 rounded-sm inline-flex items-center">
                              <span className="text-emerald-500 text-xs font-normal font-['Inter']">
                                Completed
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Order Number & Target Time */}
                        <div className="pb-2 border-b border-zinc-800 flex justify-between items-center">
                          <span className="text-white text-base font-semibold font-['Montserrat']">
                            {order.orderNumber}
                          </span>
                          <div className="flex flex-col items-end">
                            <div className="flex items-center gap-1 text-emerald-500">
                              <Clock className="w-3.5 h-3.5 text-emerald-500" />
                              <span className="text-base font-semibold font-['Inter'] leading-5">
                                {order.targetTime}
                              </span>
                            </div>
                            <span className="text-neutral-400 text-xs font-normal font-['Inter'] leading-4">
                              {order.targetDuration}
                            </span>
                          </div>
                        </div>

                        {/* Order Items List */}
                        <div className="flex flex-col gap-2.5 pt-1">
                          {order.items.map((it, idx) => (
                            <div key={idx} className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                {/* State 1: Yellow Sun Sparkle Icon (Figma exact match) */}
                                {isPending && (
                                  <svg className="w-5 h-5 text-yellow-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 2v3m0 14v3M2 12h3m14 0h3m-3.5-6.5-2.1 2.1m-8.8 8.8-2.1 2.1m0-13 2.1 2.1m8.8 8.8 2.1 2.1" />
                                  </svg>
                                )}

                                {/* State 2: Purple Cooking Pan / Steam Icon (Figma exact match) */}
                                {isCooking && (
                                  <svg className="w-5 h-5 text-fuchsia-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M3 14h18a2 2 0 0 1 2 2v2H1v-2a2 2 0 0 1 2-2Z" />
                                    <path d="M6 10c0-1.5 1-2.5 1-4s-1-2.5-1-4M12 10c0-1.5 1-2.5 1-4s-1-2.5-1-4M18 10c0-1.5 1-2.5 1-4s-1-2.5-1-4" />
                                  </svg>
                                )}

                                {/* State 3: Ready to Serve (Pan / Checkmark) */}
                                {isReadyToServe && (
                                  idx === 0 ? (
                                    <svg className="w-5 h-5 text-fuchsia-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <path d="M3 14h18a2 2 0 0 1 2 2v2H1v-2a2 2 0 0 1 2-2Z" />
                                      <path d="M6 10c0-1.5 1-2.5 1-4s-1-2.5-1-4M12 10c0-1.5 1-2.5 1-4s-1-2.5-1-4M18 10c0-1.5 1-2.5 1-4s-1-2.5-1-4" />
                                    </svg>
                                  ) : (
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500/20 shrink-0" />
                                  )
                                )}

                                {/* State 4: Completed (Green Checkmarks) */}
                                {isCompleted && (
                                  <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500/20 shrink-0" />
                                )}

                                <span className="text-stone-400 text-sm font-normal font-['Poppins']">
                                  {it.name}
                                </span>
                              </div>
                              <span className="text-white text-sm font-normal font-['Poppins']">
                                {it.price}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Total Amount Row */}
                        <div className="pt-2 border-t-[0.80px] border-zinc-800 flex justify-between items-center mt-1">
                          <span className="text-white text-base font-semibold font-['Poppins']">
                            Total Amount
                          </span>
                          <span className="text-amber-500 text-lg font-bold font-['Poppins'] leading-5">
                            {order.totalAmount}
                          </span>
                        </div>
                      </div>

                      {/* State-Specific Action Buttons */}
                      {/* State 1: Reject Order / Accept Order */}
                      {isPending && (
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() => handleRejectTableOrder(order.id)}
                            className="flex-1 py-1.5 px-2 bg-neutral-900 rounded-md outline outline-1 outline-offset-[-1px] outline-red-400 text-red-400 text-xs font-medium font-['Poppins'] hover:bg-red-500/10 transition cursor-pointer"
                          >
                            Reject Order
                          </button>
                          <button
                            onClick={() => handleAcceptTableOrder(order.id)}
                            className="flex-1 py-1.5 px-2 bg-green-500 rounded-md outline outline-1 outline-offset-[-1px] outline-neutral-800 text-zinc-900 text-xs font-medium font-['Poppins'] hover:bg-green-400 transition cursor-pointer shadow-sm"
                          >
                            Accept Order
                          </button>
                        </div>
                      )}

                      {/* State 2: Waiting to Serve (Simulates Kitchen cooking -> Click to make Ready) */}
                      {isCooking && (
                        <button
                          onClick={() => handleAdvanceToReadyToServe(order.id)}
                          className="w-full h-9 py-1.5 px-2 bg-yellow-700 hover:bg-yellow-600 rounded-md outline outline-1 outline-offset-[-1px] outline-neutral-800 flex justify-center items-center text-zinc-900 text-xs font-medium font-['Poppins'] transition cursor-pointer shadow-sm"
                          title="Click to advance to Ready to Serve"
                        >
                          Waiting to Serve
                        </button>
                      )}

                      {/* State 3: Mark as Served */}
                      {isReadyToServe && (
                        <button
                          onClick={() => handleMarkTableOrderServed(order.id)}
                          className="w-full h-9 bg-yellow-400 hover:bg-yellow-300 rounded-lg flex justify-center items-center text-black text-sm font-medium font-['Inter'] transition shadow-sm cursor-pointer"
                        >
                          Mark as Served
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ──────────────── TAB 3: BROWSE MENU (FIGMA SNIPPET 1) ──────────────── */}
          {activeTab === 'menu' && (
            <div className="px-4 py-3 flex flex-col gap-3.5 animate-fadeIn">
              {/* Header Title */}
              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => setActiveTab('home')}
                  className="p-1 text-zinc-400 hover:text-white transition cursor-pointer"
                  title="Back to Tables"
                >
                  <ChevronLeft className="w-5 h-5 text-amber-400" />
                </button>
                <h1 className="text-white text-xl font-medium font-['Inter']">Browse Menu</h1>
                <div className="w-5" />
              </div>

              {/* Search Bar Input */}
              <div className="w-full h-10 px-3 py-2 bg-stone-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 flex items-center gap-2">
                <Search className="w-4 h-4 text-stone-400 shrink-0" />
                <input
                  type="text"
                  value={menuSearchQuery}
                  onChange={(e) => setMenuSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full bg-transparent text-sm text-white placeholder:text-stone-400 font-['Inter'] focus:outline-none"
                />
                {menuSearchQuery && (
                  <button onClick={() => setMenuSearchQuery('')} className="text-stone-400 hover:text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Horizontal Category Filters */}
              <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar select-none">
                {(['All', 'Starters', 'Mains', 'Drinks', 'Desserts'] as const).map((cat) => {
                  const isActive = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-[10px] text-xs font-medium font-['Inter'] transition cursor-pointer shrink-0 ${
                        isActive
                          ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/30'
                          : 'bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>

              {/* 2-Column Grid of Food Cards */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                {filteredMenuItems.map((item) => {
                  const inCart = cartItems.find((ci) => ci.id === item.id);
                  return (
                    <div
                      key={item.id}
                      className="p-2 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-700 flex flex-col justify-between gap-2 hover:border-amber-400/40 transition group"
                    >
                      <div className="relative w-full h-32 rounded-lg overflow-hidden bg-neutral-800">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover group-hover:scale-105 transition duration-300"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5 flex-1 justify-between">
                        <div>
                          <h3 className="text-white text-sm font-medium font-['Inter'] leading-5 line-clamp-1">
                            {item.name}
                          </h3>
                          <p className="text-neutral-400 text-[11px] font-normal font-['Poppins'] line-clamp-1">
                            {item.description}
                          </p>
                        </div>

                        {/* Dietary Tag */}
                        <div className="self-start px-2 py-0.5 bg-neutral-800 rounded-md outline outline-1 outline-offset-[-1px] outline-neutral-700 flex items-center gap-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-orange-600" />
                          <span className="text-orange-600 text-[10px] font-normal font-['Poppins']">
                            {item.tag}
                          </span>
                        </div>

                        {/* Price & Add Action Button */}
                        <div className="flex items-center justify-between pt-1 mt-auto">
                          <span className="text-yellow-400 text-sm font-semibold font-['Inter']">
                            {item.priceFormatted}
                          </span>
                          <button
                            onClick={() => handleAddToCart(item)}
                            className={`w-9 h-9 rounded-lg flex items-center justify-center transition cursor-pointer active:scale-90 ${
                              inCart
                                ? 'bg-amber-400 text-black font-bold shadow-md shadow-amber-500/20'
                                : 'bg-green-500/10 outline outline-1 outline-offset-[-1px] outline-green-500/20 text-green-400 hover:bg-green-500/20'
                            }`}
                            title="Add item to ticket"
                          >
                            {inCart ? <Check className="w-4 h-4 stroke-[3]" /> : <Plus className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Floating Bottom Cart Action Banner (Figma: Item added | Create Order) */}
              {totalCartQuantity > 0 && (
                <div
                  onClick={() => setActiveTab('create-order')}
                  className="w-full p-3 mt-2 bg-yellow-950 hover:bg-yellow-900 border border-yellow-800/40 rounded-[44px] flex justify-between items-center cursor-pointer shadow-lg shadow-yellow-950/40 transition active:scale-[0.98]"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-orange-50 rounded-lg flex items-center justify-center">
                      <span className="text-yellow-950 text-xs font-semibold font-['Poppins']">
                        {totalCartQuantity}
                      </span>
                    </div>
                    <span className="text-white text-sm font-normal font-['Inter']">
                      {totalCartQuantity === 1 ? '1 Item added' : `${totalCartQuantity} Items added`}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-400 text-sm font-bold font-['Inter']">Create Order</span>
                    <ChevronRight className="w-4 h-4 text-yellow-400" />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ──────────────── TAB 4: CREATE ORDER (FIGMA SNIPPET 2) ──────────────── */}
          {activeTab === 'create-order' && (
            <div className="px-4 py-3 flex flex-col gap-4 animate-fadeIn">
              {/* Top Navigation Header with Back button */}
              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => setActiveTab('menu')}
                  className="w-8 h-8 bg-yellow-950 hover:bg-yellow-900 rounded-3xl flex justify-center items-center cursor-pointer transition border border-yellow-800/30"
                >
                  <ChevronLeft className="w-4 h-4 text-orange-50" />
                </button>
                <h1 className="text-white text-xl font-medium font-['Inter']">Create Order</h1>
                <div className="w-8" />
              </div>

              {/* Order Items List */}
              <div className="flex flex-col gap-2.5">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-zinc-900/50 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-700 flex flex-col gap-2.5"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2.5">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-neutral-800 shrink-0">
                          <Image src={item.image} alt={item.name} fill className="object-cover" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-white text-sm font-medium font-['Inter'] leading-5">
                            {item.name}
                          </span>
                          <span className="text-yellow-400 text-xs font-semibold font-['Inter']">
                            {item.priceFormatted}
                          </span>
                        </div>
                      </div>

                      {/* Stepper: - 1 + */}
                      <div className="w-28 h-9 px-3 bg-yellow-950 rounded-lg flex justify-between items-center border border-yellow-900/40">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, -1)}
                          className="text-orange-50 hover:text-white p-1 cursor-pointer font-bold"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-white text-sm font-medium font-['Inter']">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, 1)}
                          className="text-orange-50 hover:text-white p-1 cursor-pointer font-bold"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Delete Item Row */}
                    <div className="flex justify-end items-center">
                      <button
                        onClick={() => handleDeleteCartItem(item.id)}
                        className="flex items-center gap-1 text-red-500 hover:text-red-400 text-xs font-medium font-['Inter'] transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add More Button */}
              <button
                onClick={() => setActiveTab('menu')}
                className="w-full h-10 px-4 py-2 rounded-xl outline outline-1 outline-offset-[-1px] outline-yellow-950 hover:bg-yellow-950/30 flex justify-center items-center gap-2 transition cursor-pointer"
              >
                <Plus className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-400 text-sm font-medium font-['Inter']">Add More</span>
              </button>

              {/* Modifications Chips Section */}
              <div className="flex flex-col gap-2 pt-1">
                <span className="text-white text-sm font-medium font-['Inter']">Modifications</span>
                <div className="flex flex-wrap gap-2">
                  {['No Onions', 'Extra Cheese', 'Gluten Free', 'Spicy', 'Sauce on Side'].map((mod) => {
                    const isSelected = selectedModifications.includes(mod);
                    return (
                      <button
                        key={mod}
                        type="button"
                        onClick={() => toggleModification(mod)}
                        className={`h-7 px-3 py-1 rounded-lg text-xs font-normal font-['Poppins'] transition cursor-pointer ${
                          isSelected
                            ? 'bg-yellow-950 border border-yellow-500/60 text-yellow-300 font-medium'
                            : 'bg-neutral-800 outline outline-1 outline-offset-[-1px] outline-neutral-700 text-neutral-400 hover:text-white'
                        }`}
                      >
                        {mod}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Customer Details Form */}
              <div className="flex flex-col gap-3 pt-1">
                {/* 1. Customer's Name */}
                <div className="flex flex-col gap-1">
                  <label className="text-zinc-400 text-xs font-normal font-['Inter']">
                    Customer’s Name
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full h-10 px-3 bg-neutral-950 rounded-lg border border-neutral-700 text-white text-xs font-['Inter'] focus:outline-amber-400 transition"
                  />
                </div>

                {/* 2. Customer's Phone Number */}
                <div className="flex flex-col gap-1">
                  <label className="text-zinc-400 text-xs font-normal font-['Inter']">
                    Customer’s Phone Number
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="e.g. +1 555-0199"
                    className="w-full h-10 px-3 bg-neutral-950 rounded-lg border border-neutral-700 text-white text-xs font-['Inter'] focus:outline-amber-400 transition"
                  />
                </div>

                {/* 3. Table Number Dropdown */}
                <div className="flex flex-col gap-1">
                  <label className="text-zinc-400 text-xs font-normal font-['Inter']">Table Number</label>
                  <div className="relative">
                    <select
                      value={selectedTableId}
                      onChange={(e) => setSelectedTableId(e.target.value)}
                      className="w-full h-10 px-3 bg-neutral-950 rounded-lg border border-neutral-700 text-white text-xs font-['Inter'] appearance-none focus:outline-amber-400 transition pr-8 cursor-pointer"
                    >
                      {tables.map((t) => (
                        <option key={t.id} value={t.id} className="bg-neutral-900 text-white">
                          {t.name} ({t.guests} · {t.status})
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-yellow-400 absolute right-3 top-3 pointer-events-none" />
                  </div>
                </div>

                {/* 4. Instruction Textarea */}
                <div className="flex flex-col gap-1">
                  <label className="text-zinc-400 text-xs font-normal font-['Inter']">Instruction</label>
                  <textarea
                    rows={3}
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    placeholder="Allergies, seating instructions, priority tag..."
                    className="w-full h-20 p-3 bg-neutral-950 rounded-lg border border-neutral-700 text-white text-xs font-['Inter'] focus:outline-amber-400 transition resize-none"
                  />
                </div>
              </div>

              {/* Big Bottom Action Button: Create & Send to Kitchen */}
              <button
                onClick={handleSendToKitchen}
                className="w-full p-3.5 mt-2 bg-yellow-400 hover:bg-yellow-300 text-black text-sm font-semibold font-['Inter'] rounded-[44px] flex justify-center items-center shadow-lg shadow-yellow-500/20 active:scale-[0.98] transition cursor-pointer"
              >
                Create &amp; Send to Kitchen
              </button>
            </div>
          )}

          {/* ──────────────── TAB 5: ALL ORDERS LIST & DETAILS (FIGMA PIXEL-PERFECT) ──────────────── */}
          {activeTab === 'order' && (
            selectedDetailOrder ? (
              <OrderDetailView
                order={selectedDetailOrder}
                onBack={() => setSelectedDetailOrder(null)}
                embedded={true}
              />
            ) : (
              <OrdersListView
                onSelectOrder={(order) => setSelectedDetailOrder(order)}
                embedded={true}
                showBackButton={cameFromFloor}
                onBack={() => {
                  setCameFromFloor(false);
                  setActiveTab('home');
                }}
              />
            )
          )}

          {/* ──────────────── TAB 6: ALERTS VIEW ──────────────── */}
          {activeTab === 'alert' && (
            <div className="px-4 py-5 flex flex-col gap-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <h2 className="text-white text-lg font-bold font-['Inter']">Live Alerts</h2>
                <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full font-semibold">2 New</span>
              </div>
              <div className="flex flex-col gap-2.5">
                <div className="p-3.5 bg-neutral-900 border border-red-500/30 rounded-xl flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-white text-xs font-semibold">Table 03 - Water Refill Requested</h4>
                    <p className="text-zinc-400 text-[11px] mt-0.5">Guest requested sparkling water 2 min ago</p>
                    <button
                      onClick={() => toast.success('Alert resolved')}
                      className="mt-2 px-3 py-1 bg-red-500 text-black text-[11px] font-semibold rounded-md cursor-pointer"
                    >
                      Acknowledge
                    </button>
                  </div>
                </div>
                <div className="p-3.5 bg-neutral-900 border border-amber-500/30 rounded-xl flex items-start gap-3">
                  <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-white text-xs font-semibold">Kitchen Ready: Order #10582</h4>
                    <p className="text-zinc-400 text-[11px] mt-0.5">Grilled Salmon ready for pickup at pass</p>
                    <button
                      onClick={() => toast.success('Order pickup acknowledged')}
                      className="mt-2 px-3 py-1 bg-amber-400 text-black text-[11px] font-semibold rounded-md cursor-pointer"
                    >
                      Pick Up
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ──────────────── TAB 7: PROFILE VIEW ──────────────── */}
          {activeTab === 'profile' && (
            <div className="px-4 py-5 flex flex-col gap-5 animate-fadeIn">
              <div className="flex flex-col items-center text-center p-5 bg-neutral-900 rounded-2xl border border-white/10">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-black font-bold text-2xl shadow-lg shadow-amber-500/20 mb-3">
                  {waiterName[0]}
                </div>
                <h3 className="text-white text-base font-bold font-['Inter']">{waiterName}</h3>
                <span className="text-amber-400 text-xs font-semibold tracking-wide uppercase mt-0.5">
                  Senior Service Staff
                </span>
                <span className="text-zinc-400 text-xs mt-1">{user?.email || ' '}</span>

                <div className="w-full grid grid-cols-2 gap-2 mt-5 pt-4 border-t border-white/10">
                  <div className="p-2.5 bg-black/40 rounded-xl">
                    <span className="text-zinc-400 text-[11px]">Shift Status</span>
                    <div className="text-emerald-400 text-xs font-semibold mt-0.5">Active</div>
                  </div>
                  <div className="p-2.5 bg-black/40 rounded-xl">
                    <span className="text-zinc-400 text-[11px]">Station</span>
                    <div className="text-white text-xs font-semibold mt-0.5">Main Hall</div>
                  </div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>End Shift & Logout</span>
              </button>
            </div>
          )}
    </>
  );

  const modalsContent = (
    <>
      {/* ──────────────── MODAL: TABLE BILL MODAL ──────────────── */}
      {activeModal === 'bill' && selectedTable && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-neutral-900 rounded-t-3xl sm:rounded-2xl border border-white/10 p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-white font-bold text-base">{selectedTable.name} Invoice</h3>
                <span className="text-zinc-400 text-xs">Ready for Guest Settlement</span>
              </div>
              <button onClick={() => setActiveModal(null)} className="p-1 text-zinc-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-black/40 rounded-xl flex flex-col gap-2 text-xs">
              <div className="flex justify-between text-zinc-400">
                <span>Subtotal</span>
                <span>$48.50</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Tax (8.25%)</span>
                <span>$4.00</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Service Tip (15%)</span>
                <span>$7.28</span>
              </div>
              <div className="flex justify-between text-white font-bold text-sm pt-2 border-t border-white/10">
                <span>Total Due</span>
                <span className="text-amber-400">$59.78</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  toast.success(`Receipt printed and sent for ${selectedTable.name}`);
                  setActiveModal(null);
                }}
                className="flex-1 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-black font-semibold text-xs rounded-xl cursor-pointer"
              >
                Process Payment &amp; Print
              </button>
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-medium rounded-xl cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────── MODAL: JARVIS COPILOT ──────────────── */}
      {activeModal === 'jarvis' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-neutral-900 rounded-t-3xl sm:rounded-2xl border border-amber-400/30 p-5 flex flex-col gap-4 shadow-2xl shadow-amber-500/10">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-amber-400/20 border border-amber-400/40 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm">JARVIS AI Copilot</h3>
                  <span className="text-amber-400 text-[10px]">Real-Time Floor Intelligence</span>
                </div>
              </div>
              <button onClick={() => setActiveModal(null)} className="p-1 text-zinc-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-2.5 text-xs">
              <div className="p-3 bg-neutral-950 rounded-xl border border-white/5 flex flex-col gap-1">
                <span className="text-amber-300 font-semibold">&bull; Table 03 Waiting Time</span>
                <p className="text-zinc-400 text-[11px]">Table 03 has been waiting 4 mins. Kitchen reports order is ready on pass for pickup.</p>
              </div>
              <div className="p-3 bg-neutral-950 rounded-xl border border-white/5 flex flex-col gap-1">
                <span className="text-emerald-300 font-semibold">&bull; High-Margin Wine Pairing</span>
                <p className="text-zinc-400 text-[11px]">Table 02 ordered Salmon & Caesar. Recommend 2021 Sonoma Chardonnay (3 bottles remaining).</p>
              </div>
            </div>

            <button
              onClick={() => {
                toast.success('JARVIS suggestions applied to floor tasks');
                setActiveModal(null);
              }}
              className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-black font-semibold text-xs rounded-xl cursor-pointer"
            >
              Apply All Floor Recommendations
            </button>
          </div>
        </div>
      )}
    </>
  );

  // If inside the shared NewWaiterShell, return content directly (the shell renders the ONE persistent dock)
  if (inShell) {
    return (
      <>
        {bodyContent}
        {modalsContent}
      </>
    );
  }

  // Standalone fallback: render mobile frame and local BottomDock
  return (
    <div className="w-full min-h-screen bg-neutral-950 flex flex-col items-center justify-start p-0 sm:p-4 md:p-6 font-sans selection:bg-amber-400 selection:text-black">
      <div className="w-full max-w-[420px] min-h-screen sm:min-h-[868px] sm:max-h-[92vh] sm:rounded-[36px] bg-black relative flex flex-col justify-between overflow-hidden sm:border sm:border-white/10 sm:shadow-[0_0_50px_rgba(0,0,0,0.9)]">
        <div className="flex-1 overflow-y-auto pb-28 custom-scrollbar">
          {bodyContent}
        </div>

        <BottomDock
          activeTab={
            activeTab === 'home'
              ? 'home'
              : isOrderTabActive
              ? 'order'
              : activeTab === 'alert'
              ? 'alert'
              : activeTab === 'profile'
              ? 'profile'
              : 'home'
          }
          showFloorLabel={true}
          onNavigateTab={(tab) => {
            setCameFromFloor(false);
            if (tab === 'home' || tab === 'floor') setActiveTab('home');
            else if (tab === 'order') {
              setActiveTab('order');
              setSelectedDetailOrder(null);
            } else if (tab === 'jarvis') {
              router.push('/new-waiter-dashboard/jarvis');
            } else if (tab === 'alert') {
              router.push('/new-waiter-dashboard/alerts');
            } else if (tab === 'profile') {
              router.push('/new-waiter-dashboard/profile');
            }
          }}
        />
      </div>

      {modalsContent}
    </div>
  );
}
