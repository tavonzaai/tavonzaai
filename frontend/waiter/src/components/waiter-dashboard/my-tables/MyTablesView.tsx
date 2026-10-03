'use client';

import React, { useState } from 'react';
import {
  UtensilsCrossed,
  Receipt,
  RotateCcw,
  CheckCircle2,
  X,
  ClipboardList,
  AlertCircle,
  Clock,
  DollarSign,
  Layers,
} from 'lucide-react';

export interface DetailedTableItem {
  id: string;
  tableNumber: string;
  isMine: boolean;
  zone: 'Window' | 'Main Hall' | 'Bar' | 'Terrace' | 'Private';
  status:
    | 'Available'
    | 'Reserved'
    | 'Occupied'
    | 'Dining'
    | 'Waiting for Order'
    | 'Main Course Served'
    | 'Food Ready'
    | 'Waiting for Bill';
  guests: string;
  timeText: string;
  ordersCount: number;
  isBilled?: boolean;
  orderDetail?: {
    orderNumber: string;
    items: string[];
    status: string;
    placedAgo: string;
    total: number;
  };
}

export const initialTablesData: DetailedTableItem[] = [
  // --- Window Zone ---
  {
    id: 't-01',
    tableNumber: 'T-01',
    isMine: true,
    zone: 'Window',
    status: 'Available',
    guests: '0/2 guests',
    timeText: '—',
    ordersCount: 1,
    orderDetail: {
      orderNumber: '#10580',
      items: ['Espresso', 'Croissant'],
      status: 'Ready',
      placedAgo: '5 min ago',
      total: 12.5,
    },
  },
  {
    id: 't-02',
    tableNumber: 'T-02',
    isMine: true,
    zone: 'Window',
    status: 'Reserved',
    guests: '0/4 guests',
    timeText: '—',
    ordersCount: 0,
  },
  {
    id: 't-03',
    tableNumber: 'T-03',
    isMine: true,
    zone: 'Window',
    status: 'Dining',
    guests: '2/4 guests',
    timeText: '18 min',
    ordersCount: 1,
    orderDetail: {
      orderNumber: '#10581',
      items: ['Sparkling Water (San Pellegrino)', 'Burrata Caprese', 'Chianti Classico'],
      status: 'Served',
      placedAgo: '18 min ago',
      total: 48.0,
    },
  },
  {
    id: 't-04',
    tableNumber: 'T-04',
    isMine: false,
    zone: 'Window',
    status: 'Available',
    guests: '0/2 guests',
    timeText: '—',
    ordersCount: 0,
  },

  // --- Main Hall Zone ---
  {
    id: 't-05',
    tableNumber: 'T-05',
    isMine: true,
    zone: 'Main Hall',
    status: 'Waiting for Order',
    guests: '4/6 guests',
    timeText: '4 min',
    ordersCount: 1,
    orderDetail: {
      orderNumber: '#10583',
      items: ['Beef Tenderloin', 'Truffle Fries', 'Red Wine'],
      status: 'New Order',
      placedAgo: '12 min ago',
      total: 118.0,
    },
  },
  {
    id: 't-06',
    tableNumber: 'T-06',
    isMine: false,
    zone: 'Main Hall',
    status: 'Available',
    guests: '0/4 guests',
    timeText: '—',
    ordersCount: 0,
  },
  {
    id: 't-07',
    tableNumber: 'T-07',
    isMine: false,
    zone: 'Main Hall',
    status: 'Dining',
    guests: '6/8 guests',
    timeText: '35 min',
    ordersCount: 1,
    orderDetail: {
      orderNumber: '#10584',
      items: ['Grilled Salmon Risotto x2', 'Caesar Salad x2', 'Pinot Grigio Bottle'],
      status: 'Dining',
      placedAgo: '35 min ago',
      total: 142.0,
    },
  },
  {
    id: 't-08',
    tableNumber: 'T-08',
    isMine: true,
    zone: 'Main Hall',
    status: 'Main Course Served',
    guests: '3/4 guests',
    timeText: '26 min',
    ordersCount: 1,
    orderDetail: {
      orderNumber: '#10585',
      items: ['Artisan Margherita Pizza', 'Pasta Carbonara', 'Aperol Spritz x3'],
      status: 'Served',
      placedAgo: '26 min ago',
      total: 86.5,
    },
  },
  {
    id: 't-12',
    tableNumber: 'T-12',
    isMine: true,
    zone: 'Main Hall',
    status: 'Food Ready',
    guests: '2/4 guests',
    timeText: 'Ready',
    ordersCount: 1,
    orderDetail: {
      orderNumber: '#10582',
      items: ['Wagyu Truffle Burger', 'Truffle Parmesan Fries', 'Iced Hibiscus Tea'],
      status: 'Food Ready',
      placedAgo: '18 min ago',
      total: 44.5,
    },
  },
  {
    id: 't-14',
    tableNumber: 'T-14',
    isMine: false,
    zone: 'Main Hall',
    status: 'Dining',
    guests: '4/4 guests',
    timeText: '22 min',
    ordersCount: 1,
    orderDetail: {
      orderNumber: '#10586',
      items: ['Ribeye Steak', 'Mashed Potatoes', 'Craft Beer x2'],
      status: 'Dining',
      placedAgo: '22 min ago',
      total: 92.0,
    },
  },
  {
    id: 't-15',
    tableNumber: 'T-15',
    isMine: true,
    zone: 'Main Hall',
    status: 'Waiting for Bill',
    guests: '5/6 guests',
    timeText: '5 min',
    ordersCount: 1,
    isBilled: true,
    orderDetail: {
      orderNumber: '#10587',
      items: ['Chef Tasting Menu x5', 'Wine Pairing Selection', 'Dessert Platter'],
      status: 'Waiting for Bill',
      placedAgo: '55 min ago',
      total: 345.0,
    },
  },

  // --- Bar Zone ---
  {
    id: 't-13',
    tableNumber: 'T-13',
    isMine: false,
    zone: 'Bar',
    status: 'Available',
    guests: '0/4 guests',
    timeText: '—',
    ordersCount: 0,
  },
  {
    id: 't-16',
    tableNumber: 'T-16',
    isMine: false,
    zone: 'Bar',
    status: 'Dining',
    guests: '2/2 guests',
    timeText: '9 min',
    ordersCount: 1,
    orderDetail: {
      orderNumber: '#10588',
      items: ['Dry Martini x2', 'Oysters Rockefeller (6pcs)'],
      status: 'Served',
      placedAgo: '9 min ago',
      total: 54.0,
    },
  },
  {
    id: 't-18',
    tableNumber: 'T-18',
    isMine: true,
    zone: 'Bar',
    status: 'Waiting for Bill',
    guests: '3/4 guests',
    timeText: '8 min',
    ordersCount: 1,
    isBilled: true,
    orderDetail: {
      orderNumber: '#10589',
      items: ['Old Fashioned x3', 'Charcuterie Board'],
      status: 'Waiting for Bill',
      placedAgo: '42 min ago',
      total: 82.4,
    },
  },

  // --- Terrace Zone ---
  {
    id: 't-10',
    tableNumber: 'T-10',
    isMine: false,
    zone: 'Terrace',
    status: 'Available',
    guests: '0/6 guests',
    timeText: '—',
    ordersCount: 0,
  },
  {
    id: 't-11',
    tableNumber: 'T-11',
    isMine: false,
    zone: 'Terrace',
    status: 'Available',
    guests: '0/2 guests',
    timeText: '—',
    ordersCount: 0,
  },
  {
    id: 't-17',
    tableNumber: 'T-17',
    isMine: false,
    zone: 'Terrace',
    status: 'Waiting for Bill',
    guests: '0/4 guests',
    timeText: 'Just now',
    ordersCount: 1,
    isBilled: true,
    orderDetail: {
      orderNumber: '#10590',
      items: ['Grilled Sea Bass', 'Greek Salad', 'Sparkling Lemonade'],
      status: 'Waiting for Bill',
      placedAgo: '38 min ago',
      total: 62.0,
    },
  },

  // --- Private Zone ---
  {
    id: 't-19',
    tableNumber: 'T-19',
    isMine: false,
    zone: 'Private',
    status: 'Available',
    guests: '0/8 guests',
    timeText: '—',
    ordersCount: 0,
  },
  {
    id: 't-20',
    tableNumber: 'T-20',
    isMine: false,
    zone: 'Private',
    status: 'Dining',
    guests: '4/8 guests',
    timeText: '41 min',
    ordersCount: 1,
    orderDetail: {
      orderNumber: '#10591',
      items: ['Tomahawk Steak (32oz)', 'Lobster Mac & Cheese', 'Vintage Bordeaux'],
      status: 'Dining',
      placedAgo: '41 min ago',
      total: 295.0,
    },
  },
];

export default function MyTablesView() {
  const [filter, setFilter] = useState<'All' | 'Available' | 'Occupied' | 'Food Ready' | 'Waiting for Bill'>('All');
  const [tables, setTables] = useState<DetailedTableItem[]>(initialTablesData);
  const [selectedOrderTable, setSelectedOrderTable] = useState<DetailedTableItem | null>(null);

  const zones: Array<'Window' | 'Main Hall' | 'Bar' | 'Terrace' | 'Private'> = [
    'Window',
    'Main Hall',
    'Bar',
    'Terrace',
    'Private',
  ];

  // Filtering Logic
  const getFilteredTablesByZone = (zone: DetailedTableItem['zone']) => {
    return tables.filter((t) => {
      if (t.zone !== zone) return false;
      if (filter === 'All') return true;
      if (filter === 'Available') return t.status === 'Available';
      if (filter === 'Occupied')
        return (
          t.status === 'Occupied' ||
          t.status === 'Dining' ||
          t.status === 'Waiting for Order' ||
          t.status === 'Main Course Served'
        );
      if (filter === 'Food Ready') return t.status === 'Food Ready';
      if (filter === 'Waiting for Bill') return t.status === 'Waiting for Bill';
      return true;
    });
  };

  const handleOpenOrdersModal = (table: DetailedTableItem) => {
    if (table.orderDetail) {
      setSelectedOrderTable(table);
    } else {
      // Default placeholder if table has no active order
      setSelectedOrderTable({
        ...table,
        orderDetail: {
          orderNumber: `#${table.tableNumber}-01`,
          items: ['Table seated - No dishes recorded yet'],
          status: 'No Active Order',
          placedAgo: 'Just now',
          total: 0,
        },
      });
    }
  };

  const handleToggleBill = (tableId: string) => {
    setTables((prev) =>
      prev.map((t) => {
        if (t.id === tableId) {
          const nextBilled = !t.isBilled;
          return {
            ...t,
            isBilled: nextBilled,
            status: nextBilled ? 'Waiting for Bill' : 'Dining',
          };
        }
        return t;
      })
    );
  };

  const handleClearTable = (tableId: string) => {
    setTables((prev) =>
      prev.map((t) => {
        if (t.id === tableId) {
          return {
            ...t,
            status: 'Available',
            guests: '0/4 guests',
            timeText: '—',
            ordersCount: 0,
            isBilled: false,
            orderDetail: undefined,
          };
        }
        return t;
      })
    );
  };

  const renderStatusDot = (status: DetailedTableItem['status']) => {
    switch (status) {
      case 'Available':
        return (
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 relative bg-green-500 rounded-full shadow-[0px_0px_6px_0px_rgba(34,197,94,0.50)]" />
            <span className="text-green-500 text-xs font-medium font-['DM_Sans']">Available</span>
          </div>
        );
      case 'Reserved':
        return (
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 relative bg-slate-500 rounded-full shadow-[0px_0px_6px_0px_rgba(122,130,154,0.50)]" />
            <span className="text-slate-500 text-xs font-medium font-['DM_Sans']">Reserved</span>
          </div>
        );
      case 'Dining':
        return (
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 relative bg-blue-500 rounded-full shadow-[0px_0px_6px_0px_rgba(59,130,246,0.50)]" />
            <span className="text-blue-500 text-xs font-medium font-['DM_Sans']">Dining</span>
          </div>
        );
      case 'Waiting for Order':
        return (
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 relative bg-yellow-500 rounded-full shadow-[0px_0px_6px_0px_rgba(234,179,8,0.50)]" />
            <span className="text-yellow-500 text-xs font-medium font-['DM_Sans']">Waiting for Order</span>
          </div>
        );
      case 'Main Course Served':
        return (
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 relative bg-purple-500 rounded-full shadow-[0px_0px_6px_0px_rgba(168,85,247,0.50)]" />
            <span className="text-purple-500 text-xs font-medium font-['DM_Sans']">Main Course Served</span>
          </div>
        );
      case 'Food Ready':
        return (
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 relative bg-green-500 rounded-full shadow-[0px_0px_6px_0px_rgba(34,197,94,0.50)]" />
            <span className="text-green-500 text-xs font-medium font-['DM_Sans']">Food Ready</span>
          </div>
        );
      case 'Waiting for Bill':
        return (
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 relative bg-orange-500 rounded-full shadow-[0px_0px_6px_0px_rgba(249,115,22,0.50)]" />
            <span className="text-orange-500 text-xs font-medium font-['DM_Sans']">Waiting for Bill</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 w-full pb-8">
      {/* 1. Page Header Titles */}
      <div>
        <h1 className="text-white text-4xl font-semibold font-['Inter'] leading-9">
          My Tables
        </h1>
        <p className="text-slate-500 text-lg font-normal font-['Inter'] mt-1">
          Managing 8 assigned tables · Downtown Branch
        </p>
      </div>

      {/* 2. Filter Tab Bar */}
      <div className="flex items-center">
        <div className="inline-flex rounded-lg overflow-hidden border border-white/20 bg-zinc-950/60 shadow-lg">
          {(['All', 'Available', 'Occupied', 'Food Ready', 'Waiting for Bill'] as const).map(
            (tabName, idx, arr) => {
              const isActive = filter === tabName;
              return (
                <button
                  key={tabName}
                  type="button"
                  onClick={() => setFilter(tabName)}
                  className={`h-9 px-4 py-2 text-base font-normal font-['Inter'] transition-colors cursor-pointer flex items-center justify-center whitespace-nowrap ${
                    idx !== 0 ? 'border-l border-white/20' : ''
                  } ${
                    isActive
                      ? 'bg-amber-500 text-white font-semibold shadow-inner'
                      : 'text-neutral-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {tabName}
                </button>
              );
            }
          )}
        </div>
      </div>

      {/* 3. Tables Grouped by Floor Zone */}
      <div className="space-y-8">
        {zones.map((zoneName) => {
          const zoneTables = getFilteredTablesByZone(zoneName);
          if (zoneTables.length === 0) return null;

          return (
            <div key={zoneName} className="space-y-3">
              {/* Zone Section Title */}
              <h2 className="text-white text-lg font-semibold font-['Inter'] leading-7">
                {zoneName}
              </h2>

              {/* Zone Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {zoneTables.map((table) => {
                  const isAvailable = table.status === 'Available';
                  return (
                    <div
                      key={table.id}
                      className="h-32 bg-white/5 rounded-[5px] outline outline-1 outline-offset-[-1px] outline-white/10 hover:outline-amber-500 hover:shadow-lg hover:shadow-amber-500/10 backdrop-blur-sm flex flex-col justify-between overflow-hidden transition-all duration-200 group"
                    >
                      {/* Top Card Body */}
                      <div className="px-3 pt-3 pb-2 flex-1 flex flex-col justify-start">
                        {/* Table Header: Name + Mine Tag */}
                        <div className="w-full flex justify-between items-center">
                          <div className="text-slate-200 text-base font-medium font-['DM_Mono'] leading-5">
                            {table.tableNumber}
                          </div>
                          {table.isMine && (
                            <div className="px-1.5 py-0.5 bg-amber-500/20 rounded-sm">
                              <div className="text-amber-500 text-[10px] font-semibold font-['DM_Sans'] leading-3">
                                Mine
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Status Dot & Label */}
                        <div className="w-full pt-1.5">{renderStatusDot(table.status)}</div>

                        {/* Guest Count & Elapsed Time */}
                        <div className="w-full flex justify-between items-center text-xs font-['DM_Sans'] pt-1">
                          <span className="text-slate-500">{table.guests}</span>
                          <span className={`${table.timeText === 'Ready' ? 'text-green-500 font-medium' : 'text-slate-500 font-medium'}`}>
                            {table.timeText}
                          </span>
                        </div>
                      </div>

                      {/* Bottom 3 Action Buttons (Icon on top, Text below) */}
                      <div className="w-full border-t border-white/5 flex items-stretch h-9 bg-black/20">
                        {/* Button 1: Orders Modal Trigger */}
                        <button
                          type="button"
                          onClick={() => handleOpenOrdersModal(table)}
                          className="flex-1 py-1.5 border-r border-white/5 flex flex-col justify-center items-center gap-0.5 text-slate-500 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                          title="View table order tickets"
                        >
                          <UtensilsCrossed className="w-3 h-3 text-slate-500" />
                          <span className="text-[10px] font-medium font-['DM_Sans'] leading-3">
                            {table.ordersCount > 0
                              ? table.ordersCount === 1
                                ? '1 order'
                                : `${table.ordersCount} Orders`
                              : 'Orders'}
                          </span>
                        </button>

                        {/* Button 2: Bill Status / Action */}
                        <button
                          type="button"
                          disabled={isAvailable}
                          onClick={() => handleToggleBill(table.id)}
                          className={`flex-1 py-1.5 border-r border-white/5 flex flex-col justify-center items-center gap-0.5 transition-colors ${
                            isAvailable
                              ? 'opacity-30 cursor-not-allowed text-slate-500'
                              : table.isBilled
                              ? 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 cursor-pointer'
                              : 'text-slate-500 hover:text-white hover:bg-white/5 cursor-pointer'
                          }`}
                          title={table.isBilled ? 'Bill requested' : 'Request Bill'}
                        >
                          <Receipt className={`w-3 h-3 ${table.isBilled ? 'text-orange-500' : 'text-slate-500'}`} />
                          <span className="text-[10px] font-medium font-['DM_Sans'] leading-3">
                            {table.isBilled ? 'Billed ✓' : 'Bill'}
                          </span>
                        </button>

                        {/* Button 3: Clear or Open */}
                        <button
                          type="button"
                          disabled={isAvailable}
                          onClick={() => handleClearTable(table.id)}
                          className={`flex-1 py-1.5 flex flex-col justify-center items-center gap-0.5 transition-colors ${
                            isAvailable
                              ? 'opacity-30 cursor-not-allowed text-slate-500'
                              : 'text-slate-500 hover:text-white hover:bg-white/5 cursor-pointer'
                          }`}
                          title="Clear / Reset Table"
                        >
                          <RotateCcw className="w-3 h-3 text-slate-500" />
                          <span className="text-[10px] font-medium font-['DM_Sans'] leading-3">
                            {isAvailable ? 'Open' : 'Clear'}
                          </span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Interactive Order Detail Modal (Matching User Screenshot Exactly) */}
      {selectedOrderTable && selectedOrderTable.orderDetail && (
        <div className="fixed top-20 left-0 md:left-72 right-0 bottom-0 z-40 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150 overflow-y-auto">
          <div className="w-full max-w-[420px] bg-[#18181b] border border-zinc-700/70 rounded-3xl p-6 shadow-2xl space-y-5 text-white relative my-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
                  <ClipboardList className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    Orders — {selectedOrderTable.tableNumber}
                  </h3>
                  <p className="text-sm text-zinc-400 mt-0.5">
                    1 order for this table
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOrderTable(null)}
                className="w-9 h-9 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4 text-amber-400" />
              </button>
            </div>

            {/* Order Items List with Green Dots and Status Badge */}
            <div className="flex items-start justify-between pt-1">
              <div className="space-y-2.5">
                {selectedOrderTable.orderDetail.items.map((dish, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0" />
                    <span className="text-base text-zinc-200 font-medium">
                      {dish}
                    </span>
                  </div>
                ))}
              </div>

              <span className="px-3 py-1 bg-amber-500/15 border border-amber-500/30 rounded-lg text-amber-400 text-sm font-semibold">
                {selectedOrderTable.orderDetail.status || 'New Order'}
              </span>
            </div>

            {/* Timing & Total Divider Box */}
            <div className="pt-4 border-t border-zinc-800 space-y-2.5 text-sm text-zinc-300">
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Placed</span>
                <span className="font-medium text-zinc-200">
                  {selectedOrderTable.orderDetail.placedAgo}
                </span>
              </div>

              <div className="flex justify-between items-center text-base font-semibold">
                <span className="text-zinc-400 font-normal text-sm">Total</span>
                <span className="text-white font-['DM_Mono']">
                  ${selectedOrderTable.orderDetail.total.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Done Action Button */}
            <button
              type="button"
              onClick={() => setSelectedOrderTable(null)}
              className="w-full h-11 bg-amber-400 hover:bg-amber-300 active:scale-[0.99] text-white font-bold text-base rounded-xl transition-all cursor-pointer shadow-lg shadow-amber-400/20"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
