"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import CashierSidebar from "./Sidebar";
import { CashierOrder, BillQueueItem } from "./types";
import { cashierService, getActiveBranchId } from "@/redux/features/cashierApi";
import {
  Search,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  ChefHat,
  Banknote,
  ChevronRight,
  ChevronDown,
  Menu,
  Plus,
  Minus,
  ArrowLeft,
  CreditCard,
  Wallet,
  ShoppingBag,
  Eye,
  DollarSign,
  RotateCcw,
  X,
  Filter,
  Printer,
} from "lucide-react";

export interface CashierDashboardViewProps {
  initialNav?: string;
  embedded?: boolean;
}

export interface CashierDashboardMenuItem {
  id: string;
  name: string;
  price: number;
  currency: string;
  category: string;
  image: string;
}

export default function CashierDashboardView({
  initialNav = "Table View",
  embedded = false,
}: CashierDashboardViewProps) {
  const pathname = usePathname();

  // Determine activeNav from pathname or initialNav
  const getNavFromPath = React.useCallback(() => {
    if (pathname?.includes("/create-order")) return "Create Order";
    if (pathname?.includes("/bill-queue")) return "Bill Queue";
    if (pathname?.includes("/table-view") || pathname?.includes("/dashboard")) return "Table View";
    return initialNav || "Table View";
  }, [pathname, initialNav]);

  const [activeNav, setActiveNav] = useState<string>(() => getNavFromPath());
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  useEffect(() => {
    if (initialNav) {
      setActiveNav(initialNav);
    } else {
      setActiveNav(getNavFromPath());
    }
  }, [initialNav, getNavFromPath]);

  // State for Table View orders
  const [orders, setOrders] = useState<CashierOrder[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Bill Queue State
  const [billQueueItems, setBillQueueItems] =
    useState<BillQueueItem[]>([]);
  const [billSearchQuery, setBillSearchQuery] = useState<string>("");
  const [selectedBillItem, setSelectedBillItem] =
    useState<BillQueueItem | null>(null);
  const [isBillDetailModalOpen, setIsBillDetailModalOpen] =
    useState<boolean>(false);

  // Menu items from API
  const [menuItems, setMenuItems] = useState<CashierDashboardMenuItem[]>([]);

  // Create Order state
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [menuSearchQuery, setMenuSearchQuery] = useState<string>("");
  const [cart, setCart] = useState<
    { id: string; name: string; price: number; quantity: number }[]
  >([]);
  const [orderType, setOrderType] = useState<"Dine In" | "Takeaway">("Dine In");
  const [selectedTable, setSelectedTable] = useState<string>("T-01");
  const [customerName, setCustomerName] = useState<string>("Walk-in Guest");
  const [customerPhone, setCustomerPhone] = useState<string>("");
  const [customerEmail, setCustomerEmail] = useState<string>("");

  useEffect(() => {
    let mounted = true;
    const loadCashierData = async () => {
      try {
        const branchId = getActiveBranchId();
        const [rawOrders, rawMenu] = await Promise.all([
          cashierService.getOrders(branchId),
          cashierService.getMenuItems(branchId),
        ]);

        if (mounted && Array.isArray(rawMenu)) {
          setMenuItems(
            rawMenu.map((m: any) => ({
              id: m.id,
              name: m.name,
              price: Number(m.price || 0),
              currency: "$",
              category: m.category?.name || "Mains",
              image: m.imageUrl || "/images/ribeye_steak.jpg",
            }))
          );
        }

        if (mounted && Array.isArray(rawOrders)) {
          const mappedOrders: CashierOrder[] = rawOrders.map((o: any) => ({
            id: o.orderId || o.id,
            orderNumber: o.orderNumber || `#${(o.orderId || o.id).slice(0, 5)}`,
            totalAmount: o.totalAmount || o.total || 0,
            tableNumber: o.tableLabel || (o.tableId ? `Table` : "Takeaway"),
            guestCount: 2,
            waitTime: "Just now",
            customerName: o.customerName || "Guest",
            itemCount: o.itemCount || (o.items?.length ?? 1),
            subtotal: (o.totalAmount || o.total || 0) * 0.9,
            serviceCharge: (o.totalAmount || o.total || 0) * 0.05,
            tax: (o.totalAmount || o.total || 0) * 0.05,
            kitchenStatus:
              o.status === "READY_TO_SERVE"
                ? "READY_TO_SERVE"
                : o.status === "PREPARING"
                ? "PREPARING"
                : "COMPLETED",
            financeStatus:
              o.paymentStatus === "PAID" ? "PAID_CASH" : "REQUESTING_CASH",
            paymentDate: new Date(o.createdAt).toLocaleDateString(),
            paymentMethod: o.paymentMethod || "Cash",
            items: (o.items || []).map((it: any, idx: number) => ({
              id: it.id || `item-${idx}`,
              name: it.name,
              price: Number(it.price || it.unitPrice || 0),
              quantity: it.quantity || 1,
            })),
          }));

          const mappedBills: BillQueueItem[] = rawOrders
            .filter((o: any) => o.paymentStatus !== "PAID")
            .map((o: any) => {
              const total = o.totalAmount || o.total || 0;
              const subtotal = total * 0.9;
              const tax = total * 0.05;
              const serviceCharge = total * 0.05;
              const items = (o.items || []).map((it: any) => ({
                name: it.name,
                price: Number(it.price || it.unitPrice || 0),
                quantity: Number(it.quantity || 1),
              }));
              return {
                id: `bill-${o.orderId || o.id}`,
                orderNumber: o.orderNumber || `#${(o.orderId || o.id).slice(0, 5)}`,
                tableNumber: o.tableLabel || "Table",
                customerName: o.customerName || "Guest",
                itemCount: items.length || 1,
                paymentMethod: (o.paymentMethod === "CARD" ? "Visa Card" : "Cash") as "Visa Card" | "Cash" | "Digital Wallet",
                status: "Pending",
                total,
                items,
                subtotal,
                tax,
                serviceCharge,
                time: "Just now",
              };
            });

          setOrders(mappedOrders);
          setBillQueueItems(mappedBills);
          if (mappedOrders.length > 0 && !selectedOrderId && mappedOrders[0]) {
            setSelectedOrderId(mappedOrders[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to load cashier dashboard data:", err);
      }
    };
    loadCashierData();
    const interval = setInterval(loadCashierData, 8000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [selectedOrderId]);
  const [orderNo, setOrderNo] = useState<string>("#1230");
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("Requesting Cash");

  // Active selected order in Table View
  const activeOrder =
    orders.find((o) => o.id === selectedOrderId) || orders[0];

  // Search filter for Table View
  const filteredOrders = orders.filter(
    (ord) =>
      ord.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.tableNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.customerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter for Bill Queue items
  const filteredBillQueue = billQueueItems.filter(
    (item) =>
      item.orderNumber.toLowerCase().includes(billSearchQuery.toLowerCase()) ||
      item.customerName.toLowerCase().includes(billSearchQuery.toLowerCase()) ||
      item.tableNumber.toLowerCase().includes(billSearchQuery.toLowerCase())
  );

  // Menu filter for Create Order
  const filteredMenuItems = menuItems.filter((item) => {
    const matchesCategory =
      selectedCategory === "ALL" || item.category === selectedCategory;
    const matchesSearch = item.name
      .toLowerCase()
      .includes(menuSearchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Cart operations
  const addToCart = (item: CashierDashboardMenuItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { id: item.id, name: item.name, price: item.price, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) =>
      prev
        .map((i) => (i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i))
        .filter((i) => i.quantity > 0)
    );
  };

  const clearCart = () => setCart([]);

  // Calculations for Create Order Cart
  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartTax = cartSubtotal * 0.085;
  const cartTotal = cartSubtotal + cartTax;

  // Handle Payment Confirmation in Table View
  const handleConfirmCashPaid = (orderId: string) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          return {
            ...ord,
            financeStatus: "PAID_CASH",
            paymentDate: new Date().toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
          };
        }
        return ord;
      })
    );
  };

  const isCreateOrderMode =
    activeNav.toLowerCase() === "create order" ||
    activeNav.toLowerCase() === "select item";

  const isBillQueueMode = activeNav.toLowerCase() === "bill queue";

  const bodyContent = (
    <>
      {/* Dynamic Body Content */}
      {isBillQueueMode ? (
          /* ========================================================================= */
          /* BILL QUEUE MODE (Figma Snippet 4)                                          */
          /* ========================================================================= */
          <div className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1 max-w-[1600px] w-full mx-auto">
            {/* Header & Search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-semibold font-['Inter'] text-white leading-tight">
                  Bill Queue
                </h2>
                <p className="text-sm sm:text-base font-normal font-['Inter'] text-zinc-500">
                  Review All Details.
                </p>
              </div>

              {/* Search Box */}
              <div className="w-full sm:w-72 h-10 bg-neutral-900 rounded-lg border border-neutral-800 px-3 flex items-center gap-2.5">
                <Search className="w-4 h-4 text-neutral-500 shrink-0" />
                <input
                  type="text"
                  placeholder="Search orders or customers"
                  value={billSearchQuery}
                  onChange={(e) => setBillSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-sm text-white placeholder-neutral-500 focus:outline-none font-['Inter']"
                />
              </div>
            </div>

            {/* Top KPI Metrics Bar (3 Cards from Figma) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1: Revenue */}
              <div className="h-32 p-5 bg-neutral-900 rounded-[10px] shadow-md border border-emerald-900/60 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-teal-500 text-2xl font-bold font-['Inter'] leading-5">
                    $9,860
                  </div>
                  <div className="text-stone-300 text-xs font-semibold font-['Inter']">
                    Today&apos;s Revenue
                  </div>
                  <div className="text-neutral-500 text-[10px] font-medium font-['Inter']">
                    248 transactions
                  </div>
                </div>
                <div className="w-8 h-8 bg-teal-500/10 rounded-lg border border-teal-500/20 flex items-center justify-center shrink-0">
                  <DollarSign className="w-4 h-4 text-teal-500" />
                </div>
              </div>

              {/* Card 2: Pending Amount */}
              <div className="h-32 p-5 bg-neutral-900 rounded-[10px] shadow-md border border-yellow-900/60 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-amber-500 text-2xl font-bold font-['Inter'] leading-5">
                    $113.70
                  </div>
                  <div className="text-stone-300 text-xs font-semibold font-['Inter']">
                    Pending Amount
                  </div>
                  <div className="text-neutral-500 text-[10px] font-medium font-['Inter']">
                    3 pending payments
                  </div>
                </div>
                <div className="w-8 h-8 bg-amber-500/10 rounded-lg border border-amber-500/20 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-amber-500" />
                </div>
              </div>

              {/* Card 3: Refunds Today */}
              <div className="h-32 p-5 bg-neutral-900 rounded-[10px] shadow-md border border-pink-950 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-red-500 text-2xl font-bold font-['Inter'] leading-5">
                    $18.50
                  </div>
                  <div className="text-stone-300 text-xs font-semibold font-['Inter']">
                    Refunds Today
                  </div>
                  <div className="text-neutral-500 text-[10px] font-medium font-['Inter']">
                    1 transaction
                  </div>
                </div>
                <div className="w-8 h-8 bg-red-500/10 rounded-lg border border-red-500/20 flex items-center justify-center shrink-0">
                  <RotateCcw className="w-4 h-4 text-red-500" />
                </div>
              </div>
            </div>

            {/* Filter Pills Bar */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="px-4 py-2 rounded-lg border border-neutral-700 text-white text-sm font-medium font-['Poppins'] hover:bg-neutral-800 transition flex items-center gap-2 cursor-pointer"
              >
                <Filter className="w-4 h-4 text-neutral-400" />
                <span>Payment status</span>
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded-lg border border-neutral-700 text-white text-sm font-medium font-['Poppins'] hover:bg-neutral-800 transition flex items-center gap-2 cursor-pointer"
              >
                <Filter className="w-4 h-4 text-neutral-400" />
                <span>Table Status</span>
              </button>
            </div>

            {/* Bill Queue Table */}
            <div className="bg-neutral-900 rounded-xl border border-neutral-800 overflow-x-auto shadow-lg">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-zinc-900 border-b border-zinc-800 text-white text-sm font-semibold font-['Inter']">
                    <th className="px-4 py-3 border-r border-zinc-800">Order</th>
                    <th className="px-4 py-3 border-r border-zinc-800">Table</th>
                    <th className="px-4 py-3 border-r border-zinc-800">Customer</th>
                    <th className="px-4 py-3 border-r border-zinc-800">Items</th>
                    <th className="px-4 py-3 border-r border-zinc-800">Method</th>
                    <th className="px-4 py-3 border-r border-zinc-800">Status</th>
                    <th className="px-4 py-3 border-r border-zinc-800">Total</th>
                    <th className="px-4 py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800 text-slate-200 text-base font-medium font-['Inter']">
                  {filteredBillQueue.map((row) => (
                    <tr
                      key={row.id}
                      className="hover:bg-zinc-800/50 transition cursor-pointer"
                    >
                      <td className="px-4 py-4 border-r border-zinc-800 font-semibold text-white">
                        {row.orderNumber}
                      </td>
                      <td className="px-4 py-4 border-r border-zinc-800">
                        {row.tableNumber}
                      </td>
                      <td className="px-4 py-4 border-r border-zinc-800">
                        {row.customerName}
                      </td>
                      <td className="px-4 py-4 border-r border-zinc-800">
                        {row.itemCount} Items
                      </td>
                      <td className="px-4 py-4 border-r border-zinc-800">
                        {row.paymentMethod}
                      </td>
                      <td className="px-4 py-3 border-r border-zinc-800">
                        <span
                          className={`px-3 py-1.5 rounded-md text-sm font-medium font-['Inter'] inline-block ${
                            row.status === "Preparing"
                              ? "bg-fuchsia-500/10 text-fuchsia-500 border border-fuchsia-500/20"
                              : row.status === "Ready"
                              ? "bg-teal-500/10 text-teal-500 border border-teal-500/20"
                              : row.status === "Pending"
                              ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"
                              : row.status === "Payment Pending"
                              ? "bg-orange-400/10 text-orange-400 border border-orange-400/20"
                              : row.status === "Needs Attention"
                              ? "bg-red-400/10 text-red-400 border border-red-400/20"
                              : "bg-blue-400/10 text-blue-400 border border-blue-400/20"
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 border-r border-zinc-800 font-bold text-white">
                        ${row.total.toFixed(2)}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedBillItem(row);
                            setIsBillDetailModalOpen(true);
                          }}
                          className="p-2 bg-zinc-800 hover:bg-amber-400 hover:text-black rounded-lg border border-zinc-700 transition cursor-pointer inline-flex items-center justify-center"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : isCreateOrderMode ? (
          /* ========================================================================= */
          /* CREATE ORDER / SELECT ITEM MODE (Figma Snippets 2 & 3)                    */
          /* ========================================================================= */
          <div className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1 max-w-[1600px] w-full mx-auto">
            {/* Back Link */}
            <button
              type="button"
              onClick={() => setActiveNav("Table View")}
              className="flex items-center gap-1.5 text-neutral-400 hover:text-white text-xs font-semibold font-['Poppins'] transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to floor</span>
            </button>

            {/* Header & Search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-semibold font-['Inter'] text-white leading-tight">
                  {cart.length > 0 ? "Select Item" : "Create Order"}
                </h2>
                <p className="text-sm sm:text-base font-normal font-['Inter'] text-zinc-500">
                  Build order for counter customer or direct register sale
                </p>
              </div>

              {/* Menu Search Box */}
              <div className="w-full sm:w-72 h-10 bg-neutral-900 rounded-lg border border-neutral-800 px-3 flex items-center gap-2.5">
                <Search className="w-4 h-4 text-neutral-500 shrink-0" />
                <input
                  type="text"
                  placeholder="Search menu item..."
                  value={menuSearchQuery}
                  onChange={(e) => setMenuSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-sm text-white placeholder-neutral-500 focus:outline-none font-['Inter']"
                />
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
              {["ALL", "Starters", "Mains", "Drinks", "Desserts", "Sides"].map(
                (cat) => {
                  const isActive = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium font-['Poppins'] transition cursor-pointer shrink-0 border ${
                        isActive
                          ? "bg-yellow-400 text-neutral-900 border-yellow-400 font-semibold shadow-md shadow-yellow-400/10"
                          : "bg-transparent text-white border-neutral-700 hover:bg-neutral-800"
                      }`}
                    >
                      {cat}
                    </button>
                  );
                }
              )}
            </div>

            {/* Menu Items & Cart Container */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left/Middle Column: Menu Cards Grid */}
              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {filteredMenuItems.map((item) => {
                  const cartItem = cart.find((i) => i.id === item.id);
                  const isSelected = !!cartItem;

                  return (
                    <div
                      key={item.id}
                      className={`p-2 bg-zinc-900 rounded-lg border flex flex-col justify-between gap-4 transition ${
                        isSelected
                          ? "border-yellow-400/70 ring-1 ring-yellow-400/40"
                          : "border-zinc-800 hover:border-zinc-700"
                      }`}
                    >
                      {/* Image container */}
                      <div className="h-32 relative rounded-md overflow-hidden bg-neutral-800">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="px-2 py-1.5 absolute top-1.5 right-1.5 bg-zinc-900/90 backdrop-blur-xs rounded-[5px] flex items-center justify-center">
                          <span className="text-red-50 text-xs font-medium font-['Inter']">
                            {item.category}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="space-y-3">
                        <div>
                          <div className="text-white text-lg font-semibold font-['Inter'] truncate">
                            {item.name}
                          </div>
                          <div className="text-neutral-400 text-base font-semibold font-['Inter']">
                            {item.currency}
                            {item.price.toFixed(2)}
                          </div>
                        </div>

                        {/* Action Button */}
                        {isSelected ? (
                          <div className="px-3 py-1.5 bg-yellow-400/10 rounded-lg border border-yellow-400/20 flex items-center justify-between">
                            <button
                              type="button"
                              onClick={() => removeFromCart(item.id)}
                              className="w-5 h-5 flex items-center justify-center text-white hover:text-amber-400 cursor-pointer"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-white text-sm font-medium font-['Poppins']">
                              {cartItem.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => addToCart(item)}
                              className="w-5 h-5 flex items-center justify-center text-white hover:text-amber-400 cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => addToCart(item)}
                            className="w-full px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 rounded-lg flex items-center justify-center gap-1.5 text-white text-sm font-medium font-['Poppins'] transition cursor-pointer"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Add to cart</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right Column: Customer Account & Cart Panel */}
              <div className="lg:col-span-5 bg-neutral-900 rounded-xl border border-neutral-800 p-4 sm:p-6 space-y-4">
                <div className="text-center space-y-1">
                  <h3 className="text-white text-lg font-semibold font-['Poppins']">
                    Customer Account
                  </h3>
                  <p className="text-zinc-400 text-base font-normal font-['Poppins']">
                    Walk in customer
                  </p>
                </div>

                <div className="h-px bg-zinc-900 w-full" />

                {/* Cart Body */}
                <div className="space-y-4">
                  <h4 className="text-white text-xl font-medium font-['Inter']">
                    Current Order
                  </h4>

                  {/* Order Inputs Container */}
                  <div className="p-4 bg-neutral-900 rounded-xl border border-neutral-800 space-y-4">
                    {/* Order Type Dropdown */}
                    <div>
                      <label className="text-stone-300 text-base font-medium font-['Inter'] block mb-2 leading-6">
                        Order Type
                      </label>
                      <div className="relative">
                        <select
                          value={orderType}
                          onChange={(e) =>
                            setOrderType(e.target.value as "Dine In" | "Takeaway")
                          }
                          className="w-full h-10 px-4 bg-zinc-900 rounded-[5px] border border-neutral-800 text-white text-base font-normal font-['Inter'] focus:outline-none appearance-none cursor-pointer pr-10"
                        >
                          <option value="Dine In" className="bg-zinc-900 text-white">
                            Dine In
                          </option>
                          <option value="Takeaway" className="bg-zinc-900 text-white">
                            Takeaway
                          </option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-white absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    {orderType === "Dine In" ? (
                      <>
                        {/* Dine In: Table & Order No Row */}
                        <div className="grid grid-cols-2 gap-3.5">
                          <div>
                            <label className="text-stone-300 text-base font-medium font-['Inter'] block mb-2 leading-6">
                              Table
                            </label>
                            <div className="relative">
                              <select
                                value={selectedTable}
                                onChange={(e) => setSelectedTable(e.target.value)}
                                className="w-full h-10 px-4 bg-zinc-900 rounded-[5px] border border-neutral-800 text-white text-base font-normal font-['Inter'] focus:outline-none appearance-none cursor-pointer pr-8"
                              >
                                <option value="T-01" className="bg-zinc-900 text-white">T-01</option>
                                <option value="T-02" className="bg-zinc-900 text-white">T-02</option>
                                <option value="T-03" className="bg-zinc-900 text-white">T-03</option>
                                <option value="T-04" className="bg-zinc-900 text-white">T-04</option>
                                <option value="T-05" className="bg-zinc-900 text-white">T-05</option>
                              </select>
                              <ChevronDown className="w-4 h-4 text-white absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                          </div>

                          <div>
                            <label className="text-stone-300 text-base font-medium font-['Inter'] block mb-2 leading-6">
                              Order No
                            </label>
                            <input
                              type="text"
                              value={orderNo}
                              onChange={(e) => setOrderNo(e.target.value)}
                              className="w-full h-10 px-4 bg-zinc-900 rounded-[5px] border border-neutral-800 text-white text-base font-normal font-['Inter'] focus:outline-none"
                            />
                          </div>
                        </div>

                        {/* Dine In: Customer Name */}
                        <div>
                          <label className="text-stone-300 text-base font-medium font-['Inter'] block mb-2 leading-6">
                            Customer Name
                          </label>
                          <input
                            type="text"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            placeholder="e.g. Sarah M."
                            className="w-full h-10 px-4 bg-zinc-900 rounded-[5px] border border-neutral-800 text-white text-base font-normal font-['Inter'] focus:outline-none"
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Takeaway: Customer Name */}
                        <div>
                          <label className="text-stone-300 text-base font-medium font-['Inter'] block mb-2 leading-6">
                            Customer Name
                          </label>
                          <input
                            type="text"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            placeholder="e.g. Sarah M."
                            className="w-full h-10 px-4 bg-zinc-900 rounded-[5px] border border-neutral-800 text-white text-base font-normal font-['Inter'] focus:outline-none"
                          />
                        </div>

                        {/* Takeaway: Phone Number */}
                        <div>
                          <label className="text-stone-300 text-base font-medium font-['Inter'] block mb-2 leading-6">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            placeholder="e.g. +991254685"
                            className="w-full h-10 px-4 bg-zinc-900 rounded-[5px] border border-neutral-800 text-white text-base font-normal font-['Inter'] focus:outline-none"
                          />
                        </div>

                        {/* Takeaway: Email */}
                        <div>
                          <label className="text-stone-300 text-base font-medium font-['Inter'] block mb-2 leading-6">
                            Email
                          </label>
                          <input
                            type="email"
                            value={customerEmail}
                            onChange={(e) => setCustomerEmail(e.target.value)}
                            placeholder="e.g. Milky@mail.com"
                            className="w-full h-10 px-4 bg-zinc-900 rounded-[5px] border border-neutral-800 text-white text-base font-normal font-['Inter'] focus:outline-none"
                          />
                        </div>
                      </>
                    )}

                    {/* Cart Items List */}
                    <div className="space-y-2 pt-2">
                      <div className="text-neutral-500 text-xs font-normal font-['Poppins']">
                        {cart.length} Items Ordered
                      </div>

                      {cart.length === 0 ? (
                        <div className="py-12 px-4 border border-dashed border-neutral-800 rounded-xl flex flex-col items-center justify-center text-center space-y-3">
                          <div className="w-10 h-10 p-2.5 bg-neutral-400 rounded-full flex items-center justify-center text-neutral-800">
                            <ShoppingBag className="w-5 h-5" />
                          </div>
                          <div className="text-neutral-400 text-lg font-normal font-['Poppins']">
                            Cart is empty <br /> Tap menu items to add
                          </div>
                        </div>
                      ) : (
                        cart.map((cartItem) => (
                          <div
                            key={cartItem.id}
                            className="p-3 bg-neutral-800 rounded-lg border border-neutral-700 flex items-center justify-between"
                          >
                            <div>
                              <div className="text-white text-base font-medium font-['Inter'] leading-5">
                                {cartItem.name}
                              </div>
                              <div className="text-slate-400 text-xs font-medium font-['Inter']">
                                ${cartItem.price.toFixed(2)} each
                              </div>
                            </div>

                            <div className="flex items-center gap-3.5">
                              <div className="flex items-center gap-2.5">
                                <button
                                  type="button"
                                  onClick={() => removeFromCart(cartItem.id)}
                                  className="w-5 h-5 bg-neutral-200 hover:bg-white text-neutral-900 rounded flex items-center justify-center cursor-pointer transition"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="text-white text-base font-medium font-['Inter']">
                                  {cartItem.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    addToCart(
                                      menuItems.find(
                                        (m) => m.id === cartItem.id
                                      ) || {
                                        id: cartItem.id,
                                        name: cartItem.name,
                                        price: cartItem.price,
                                        category: "Mains",
                                        currency: "$",
                                        image: "",
                                      }
                                    )
                                  }
                                  className="w-5 h-5 bg-yellow-500 hover:bg-yellow-400 text-black rounded flex items-center justify-center cursor-pointer transition"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>

                              <span className="text-white text-base font-medium font-['Inter']">
                                ${(cartItem.price * cartItem.quantity).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Financial Totals */}
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between text-zinc-400 text-base font-medium font-['Poppins']">
                      <span>Subtotal</span>
                      <span className="text-white">
                        ${cartSubtotal.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-zinc-400 text-base font-medium font-['Poppins']">
                      <span>Tax (8.5%)</span>
                      <span className="text-white">${cartTax.toFixed(2)}</span>
                    </div>

                    <div className="pt-2 border-t border-zinc-900 flex items-center justify-between">
                      <span className="text-white text-lg font-semibold font-['Poppins']">
                        Total
                      </span>
                      <span className="text-amber-500 text-2xl font-semibold font-['Poppins']">
                        ${cartTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => alert("Order held in queue.")}
                        className="flex-1 py-2 px-3.5 bg-white hover:bg-neutral-200 text-black rounded-md text-base font-normal font-['Inter'] transition cursor-pointer text-center"
                      >
                        Hold Order
                      </button>
                      <button
                        type="button"
                        onClick={clearCart}
                        className="flex-1 py-2 px-3.5 bg-white hover:bg-neutral-200 text-black rounded-md text-base font-normal font-['Inter'] transition cursor-pointer text-center"
                      >
                        Clear Cart
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsPaymentModalOpen(true)}
                      disabled={cart.length === 0}
                      className={`w-full py-2.5 px-8 rounded-lg text-base font-medium font-['Inter'] text-center transition ${
                        cart.length === 0
                          ? "bg-neutral-600 text-neutral-400 cursor-not-allowed"
                          : "bg-yellow-400 hover:bg-yellow-300 text-black shadow-lg shadow-yellow-400/20 cursor-pointer"
                      }`}
                    >
                      Processed to Payment
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* TABLE VIEW / DEFAULT MODE (Figma Snippets 1 & 2)                          */
          /* ========================================================================= */
          <div className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1 max-w-[1600px] w-full mx-auto">
            {/* Section Header & Search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-semibold font-['Inter'] text-white leading-tight">
                  {activeOrder ? "Order Details" : "Payment Request"}
                </h2>
                <p className="text-sm sm:text-base font-normal font-['Inter'] text-zinc-500">
                  Table is ready to settle their bill.
                </p>
              </div>

              {/* Right Status Badges & Search */}
              <div className="flex flex-wrap items-center gap-3">
                {activeOrder && (
                  <div className="flex items-center gap-2">
                    {/* Kitchen Status Badge */}
                    <div className="px-3 py-1.5 bg-green-500/10 rounded-lg border border-green-500/20 flex items-center gap-2">
                      <div className="w-6 h-6 bg-green-500/20 rounded-md border border-green-500/50 flex items-center justify-center">
                        <ChefHat className="w-3.5 h-3.5 text-green-400" />
                      </div>
                      <span className="text-green-500 text-xs sm:text-sm font-normal font-['Poppins'] leading-4">
                        {activeOrder.kitchenStatus === "READY_TO_SERVE"
                          ? "Ready to serve"
                          : activeOrder.kitchenStatus === "PREPARING"
                          ? "Preparing"
                          : "Completed"}
                      </span>
                    </div>

                    {/* Finance Status Badge */}
                    {activeOrder.financeStatus === "PAID_CASH" ? (
                      <div className="px-3 py-1.5 bg-green-500/10 rounded-lg border border-green-500/20 flex items-center gap-2">
                        <div className="w-6 h-6 bg-green-500/20 rounded-md border border-green-500/50 flex items-center justify-center">
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                        </div>
                        <span className="text-green-500 text-xs sm:text-sm font-normal font-['Poppins'] leading-4">
                          Paid (Cash)
                        </span>
                      </div>
                    ) : activeOrder.financeStatus === "REQUESTING_CASH" ? (
                      <div className="px-3 py-1.5 bg-amber-500/10 rounded-lg border border-amber-500/20 flex items-center gap-2">
                        <div className="w-6 h-6 bg-amber-500/20 rounded-md border border-amber-500/50 flex items-center justify-center">
                          <Banknote className="w-3.5 h-3.5 text-amber-500" />
                        </div>
                        <span className="text-amber-500 text-xs sm:text-sm font-normal font-['Poppins'] leading-4">
                          Request to Pay Cash
                        </span>
                      </div>
                    ) : (
                      <div className="px-3 py-1.5 bg-red-400/10 rounded-lg border border-red-400/20 flex items-center gap-2">
                        <div className="w-6 h-6 bg-red-400/20 rounded-md border border-red-400/50 flex items-center justify-center">
                          <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                        </div>
                        <span className="text-red-400 text-xs sm:text-sm font-normal font-['Poppins'] leading-4">
                          Not Paid
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Search Box */}
                <div className="w-full sm:w-72 h-10 bg-neutral-900 rounded-lg border border-neutral-800 px-3 flex items-center gap-2.5">
                  <Search className="w-4 h-4 text-neutral-500 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search order or table....."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent text-sm text-white placeholder-neutral-500 focus:outline-none font-['Inter']"
                  />
                </div>
              </div>
            </div>

            {/* Main 3-Column POS Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Order Queue List */}
              <div className="lg:col-span-4 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                  <h3 className="text-lg font-semibold text-white font-['Poppins']">
                    Order Queue ({filteredOrders.length})
                  </h3>
                  <span className="text-xs text-amber-500 font-medium">
                    Live Sync
                  </span>
                </div>

                {filteredOrders.map((ord) => {
                  const isSelected = ord.id === selectedOrderId;
                  return (
                    <div
                      key={ord.id}
                      onClick={() => setSelectedOrderId(ord.id)}
                      className={`p-4 bg-neutral-900 rounded-xl border transition cursor-pointer space-y-3.5 ${
                        isSelected
                          ? "border-amber-500 ring-1 ring-amber-500/50 shadow-lg shadow-amber-500/5"
                          : "border-neutral-800 hover:border-neutral-700"
                      }`}
                    >
                      {/* Header: Order No & Price */}
                      <div className="flex items-center justify-between">
                        <span className="text-white text-base font-semibold font-['Poppins']">
                          Order No {ord.orderNumber}
                        </span>
                        <span className="text-white text-base font-semibold font-['Poppins']">
                          ${ord.totalAmount.toFixed(2)}
                        </span>
                      </div>

                      <div className="h-px bg-neutral-800 w-full" />

                      {/* Table & Wait Time */}
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-white text-lg font-normal font-['Poppins'] leading-6">
                            {ord.tableNumber}
                          </div>
                          <div className="text-neutral-500 text-xs font-semibold font-['Poppins']">
                            {ord.guestCount} Guests
                          </div>
                        </div>

                        <div className="px-2.5 py-1 bg-amber-500/10 rounded-lg flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-amber-500" />
                          <span className="text-amber-500 text-xs font-medium font-['Inter']">
                            {ord.waitTime}
                          </span>
                        </div>
                      </div>

                      {/* Customer & Items count */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-zinc-800 rounded-lg border border-zinc-800 flex items-center justify-center shrink-0">
                            <User className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-white text-base font-medium font-['Poppins']">
                            {ord.customerName}
                          </span>
                        </div>
                        <span className="text-neutral-500 text-xs font-normal font-['Poppins']">
                          {ord.itemCount} Items Ordered
                        </span>
                      </div>

                      {/* Kitchen Status Pill */}
                      <div className="space-y-2">
                        <div
                          className={`p-2.5 rounded-lg border flex items-center gap-2.5 ${
                            ord.kitchenStatus === "READY_TO_SERVE"
                              ? "bg-green-500/10 border-green-500/20 text-green-500"
                              : ord.kitchenStatus === "PREPARING"
                              ? "bg-fuchsia-500/10 border-fuchsia-500/20 text-fuchsia-500"
                              : "bg-stone-500/10 border-stone-500/20 text-stone-400"
                          }`}
                        >
                          <div className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center shrink-0">
                            <ChefHat className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <div className="text-neutral-400 text-xs font-normal font-['Poppins']">
                              Kitchen
                            </div>
                            <div className="text-base font-medium font-['Poppins']">
                              {ord.kitchenStatus === "READY_TO_SERVE"
                                ? "Ready to serve"
                                : ord.kitchenStatus === "PREPARING"
                                ? "Preparing"
                                : "Completed"}
                            </div>
                          </div>
                        </div>

                        {/* Finance Status Pill */}
                        <div
                          className={`p-2.5 rounded-lg border flex items-center gap-2.5 ${
                            ord.financeStatus === "PAID_CASH"
                              ? "bg-green-500/10 border-green-500/20 text-green-500"
                              : ord.financeStatus === "REQUESTING_CASH"
                              ? "bg-amber-500/10 border-amber-500/20 text-amber-500"
                              : "bg-red-400/10 border-red-400/20 text-red-400"
                          }`}
                        >
                          <div className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center shrink-0">
                            <Banknote className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <div className="text-neutral-400 text-xs font-normal font-['Poppins']">
                              Finance
                            </div>
                            <div className="text-base font-medium font-['Poppins']">
                              {ord.financeStatus === "PAID_CASH"
                                ? "Paid (Cash)"
                                : ord.financeStatus === "REQUESTING_CASH"
                                ? "Requesting Cash"
                                : "Not Paid"}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="h-px bg-neutral-800 w-full" />

                      {/* View Details Footer Link */}
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-white text-base font-medium font-['Poppins']">
                          {ord.itemCount} Items
                        </span>
                        <div className="flex items-center gap-1 text-amber-500 hover:underline">
                          <span className="text-base font-medium font-['Poppins']">
                            View Details
                          </span>
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Middle Column: Selected Order Itemized Receipt */}
              <div className="lg:col-span-5 bg-neutral-900 rounded-xl border border-neutral-800 p-4 sm:p-6 space-y-4">
                {activeOrder ? (
                  <>
                    {/* Table & Order No Row */}
                    <div className="py-2 border-b border-zinc-900 flex items-center justify-between">
                      <div>
                        <div className="text-neutral-500 text-xs font-semibold font-['Poppins']">
                          Table No:
                        </div>
                        <div className="text-white text-lg font-normal font-['Poppins'] leading-8">
                          {activeOrder.tableNumber}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-neutral-500 text-xs font-semibold font-['Poppins']">
                          Order No:
                        </div>
                        <div className="text-white text-lg font-normal font-['Poppins'] leading-8">
                          {activeOrder.orderNumber}
                        </div>
                      </div>
                    </div>

                    {/* Items list */}
                    <div className="space-y-3 py-2">
                      <div className="text-xs font-semibold uppercase text-zinc-500 tracking-wider">
                        Item Breakdown
                      </div>
                      {activeOrder.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between text-base font-normal font-['Poppins']"
                        >
                          <span className="text-stone-400">{item.name}</span>
                          <span className="text-white">
                            ${item.price.toFixed(2)}
                          </span>
                        </div>
                      ))}

                      <div className="h-px bg-zinc-900 my-2" />

                      {/* Subtotal, Service Charge, Tax */}
                      <div className="flex items-center justify-between text-base font-normal font-['Poppins']">
                        <span className="text-stone-400">Subtotal</span>
                        <span className="text-white">
                          ${activeOrder.subtotal.toFixed(2)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-base font-normal font-['Poppins']">
                        <span className="text-stone-400">
                          Service Charge ( 5% )
                        </span>
                        <span className="text-white">
                          ${activeOrder.serviceCharge.toFixed(2)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-base font-normal font-['Poppins']">
                        <span className="text-stone-400">Tax ( 8% )</span>
                        <span className="text-white">
                          ${activeOrder.tax.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Amount To Be Paid Highlight */}
                    <div className="pt-4 border-t border-zinc-900 flex items-center justify-between">
                      <span className="text-white text-base font-semibold font-['Poppins']">
                        AMOUNT TO BE PAID
                      </span>
                      <span className="text-amber-500 text-2xl font-semibold font-['Poppins']">
                        ${activeOrder.totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="p-8 text-center text-zinc-500">
                    Select an order from the queue to view details.
                  </div>
                )}
              </div>

              {/* Right Column: Payment Actions & Confirmation Panel */}
              <div className="lg:col-span-3 bg-neutral-900 rounded-xl border border-neutral-800 p-4 sm:p-6 space-y-6">
                <h3 className="text-white text-lg font-semibold font-['Poppins'] text-center">
                  Summary & Actions
                </h3>

                <div className="h-px bg-zinc-900 w-full" />

                {activeOrder && (
                  <div className="space-y-6">
                    {/* Status Banner */}
                    <div className="p-4 bg-neutral-900 rounded-xl border border-neutral-800 flex flex-col items-center gap-4 text-center">
                      <div className="w-12 h-12 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center text-green-400">
                        <CheckCircle2 className="w-7 h-7" />
                      </div>

                      <div>
                        <div className="text-stone-50 text-xl font-semibold font-['Poppins'] leading-7">
                          ${activeOrder.totalAmount.toFixed(2)}
                        </div>
                        <div className="text-green-400 text-base font-semibold font-['Poppins']">
                          {activeOrder.financeStatus === "PAID_CASH"
                            ? "Payment Successful"
                            : "Awaiting Cash Settle"}
                        </div>
                      </div>

                      <div className="h-px bg-zinc-900 w-full" />

                      {/* Metadata list */}
                      <div className="w-full text-left space-y-3">
                        <div>
                          <div className="text-neutral-500 text-xs font-semibold font-['Poppins']">
                            Status
                          </div>
                          <div className="text-white text-base font-normal font-['Poppins']">
                            {activeOrder.financeStatus === "PAID_CASH"
                              ? "Successful"
                              : "Pending Cash"}
                          </div>
                        </div>

                        <div>
                          <div className="text-neutral-500 text-xs font-semibold font-['Poppins']">
                            Date
                          </div>
                          <div className="text-white text-base font-normal font-['Poppins']">
                            {activeOrder.paymentDate || "September 28, at 07:30 pm"}
                          </div>
                        </div>

                        <div>
                          <div className="text-neutral-500 text-xs font-semibold font-['Poppins']">
                            Payment Method
                          </div>
                          <div className="text-white text-base font-normal font-['Poppins']">
                            {activeOrder.paymentMethod || "Cash"}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Summary Totals */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-zinc-400 text-base font-medium font-['Poppins']">
                        <span>Subtotal</span>
                        <span className="text-white">
                          ${activeOrder.subtotal.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-zinc-400 text-base font-medium font-['Poppins']">
                        <span>Tax (8.5%)</span>
                        <span className="text-white">
                          ${activeOrder.tax.toFixed(2)}
                        </span>
                      </div>

                      <div className="pt-2 border-t border-zinc-900 flex items-center justify-between">
                        <span className="text-white text-lg font-semibold font-['Poppins']">
                          Total
                        </span>
                        <span className="text-amber-500 text-2xl font-semibold font-['Poppins']">
                          ${activeOrder.totalAmount.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Action Button */}
                    {activeOrder.financeStatus === "PAID_CASH" ? (
                      <button
                        type="button"
                        disabled
                        className="w-full py-3 px-4 bg-neutral-700 text-neutral-300 rounded-lg font-medium font-['Inter'] text-base text-center cursor-not-allowed transition flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                        Payment Done
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleConfirmCashPaid(activeOrder.id)}
                        className="w-full py-3 px-4 bg-green-500 hover:bg-green-400 text-black font-semibold rounded-lg font-['Inter'] text-base text-center shadow-lg shadow-green-500/20 transition cursor-pointer active:scale-95 flex items-center justify-center gap-2"
                      >
                        <Banknote className="w-5 h-5" />
                        Confirm Cash Paid
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
    </>
  );

  const modalOverlays = (
    <>
      {/* ========================================================================= */}
      {/* PAYMENT METHOD MODAL OVERLAY                                              */}
      {/* ========================================================================= */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-900/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-8 max-w-xl w-full flex flex-col md:flex-row items-center gap-6 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setIsPaymentModalOpen(false)}
              className="absolute top-3 right-3 text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Left Box: Total Amount Highlight */}
            <div className="px-8 py-12 bg-zinc-900 rounded-xl border border-neutral-800 flex flex-col items-center text-center gap-3 shrink-0 w-full md:w-64">
              <span className="text-neutral-400 text-lg font-medium font-['Inter']">
                Total Amount
              </span>
              <span className="text-yellow-400 text-4xl sm:text-5xl font-semibold font-['Poppins']">
                ${cartTotal.toFixed(2)}
              </span>
              <div className="w-48 h-px bg-zinc-800 my-1" />
              <span className="text-zinc-400 text-sm font-normal font-['Poppins']">
                {orderType === "Dine In" ? selectedTable : "Takeaway"} · {cart.reduce((s, i) => s + i.quantity, 0)} items
              </span>
            </div>

            {/* Right Box: Payment Options */}
            <div className="flex-1 w-full space-y-3">
              {[
                { name: "Credit / Debit Card", icon: CreditCard },
                { name: "Requesting Cash", icon: Banknote },
                { name: "Digital Wallet", icon: Wallet },
              ].map((method) => {
                const Icon = method.icon;
                const isSelected = selectedPaymentMethod === method.name;

                return (
                  <button
                    key={method.name}
                    type="button"
                    onClick={() => setSelectedPaymentMethod(method.name)}
                    className={`w-full p-4 rounded-lg border flex items-center gap-3 transition cursor-pointer ${
                      isSelected
                        ? "bg-amber-500/10 border-amber-500/30 text-amber-500"
                        : "bg-stone-500/10 border-stone-500/20 text-stone-400 hover:text-white"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg border ${
                        isSelected
                          ? "bg-amber-500/10 border-amber-500/50"
                          : "bg-stone-500/10 border-stone-500/50"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-base font-medium font-['Poppins']">
                      {method.name}
                    </span>
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => {
                  alert(
                    `Payment of $${cartTotal.toFixed(
                      2
                    )} successfully recorded via ${selectedPaymentMethod}!`
                  );
                  setIsPaymentModalOpen(false);
                  clearCart();
                }}
                className="w-full mt-4 py-3 bg-yellow-400 hover:bg-yellow-300 text-black font-semibold rounded-lg font-['Inter'] text-base text-center transition cursor-pointer shadow-lg shadow-yellow-400/20"
              >
                Complete Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* BILL QUEUE ITEM DETAILS MODAL                                             */}
      {/* ========================================================================= */}
      {isBillDetailModalOpen && selectedBillItem && (
        <div className="fixed inset-0 z-50 bg-neutral-900/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setIsBillDetailModalOpen(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div>
                <h3 className="text-xl font-bold text-white font-['Inter']">
                  Order {selectedBillItem.orderNumber}
                </h3>
                <p className="text-xs text-zinc-400 font-['Poppins']">
                  Table {selectedBillItem.tableNumber} · Customer: {selectedBillItem.customerName}
                </p>
              </div>

              <span
                className={`px-3 py-1 rounded-md text-xs font-semibold ${
                  selectedBillItem.status === "Ready"
                    ? "bg-teal-500/10 text-teal-500 border border-teal-500/20"
                    : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                }`}
              >
                {selectedBillItem.status}
              </span>
            </div>

            {/* Itemized List */}
            <div className="space-y-3">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Itemized Receipt
              </span>
              {selectedBillItem.items.map((it, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-sm font-['Poppins']"
                >
                  <span className="text-stone-300">
                    {it.quantity}x {it.name}
                  </span>
                  <span className="text-white font-medium">
                    ${(it.price * it.quantity).toFixed(2)}
                  </span>
                </div>
              ))}

              <div className="h-px bg-zinc-800 my-2" />

              <div className="flex items-center justify-between text-sm text-zinc-400">
                <span>Subtotal</span>
                <span className="text-white">${selectedBillItem.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-zinc-400">
                <span>Service Charge</span>
                <span className="text-white">
                  ${selectedBillItem.serviceCharge.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm text-zinc-400">
                <span>Tax</span>
                <span className="text-white">${selectedBillItem.tax.toFixed(2)}</span>
              </div>

              <div className="pt-3 border-t border-zinc-800 flex items-center justify-between text-lg font-bold">
                <span className="text-white">Total Paid</span>
                <span className="text-amber-500">${selectedBillItem.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => alert("Receipt printed.")}
                className="flex-1 py-2.5 px-4 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-lg text-sm flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Receipt</span>
              </button>
              <button
                type="button"
                onClick={() => setIsBillDetailModalOpen(false)}
                className="flex-1 py-2.5 px-4 bg-amber-400 hover:bg-amber-300 text-black font-semibold rounded-lg text-sm transition cursor-pointer text-center"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );

  if (embedded) {
    return (
      <div className="w-full flex-1 flex flex-col font-['Poppins',sans-serif]">
        {bodyContent}
        {modalOverlays}
      </div>
    );
  }

  return (
    <div className="h-screen bg-black text-white font-['Poppins',sans-serif] flex flex-col lg:flex-row overflow-hidden selection:bg-amber-500 selection:text-black relative">
      {/* Sidebar */}
      <CashierSidebar
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-black relative">
        {/* Top Header Bar */}
        <header className="h-[77px] px-4 sm:px-8 border-b border-neutral-800 shadow-[0px_0px_10.8px_0px_rgba(255,255,255,0.15)] flex items-center justify-between shrink-0 bg-black z-30">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg bg-zinc-900 border border-neutral-800 text-zinc-300 hover:text-white cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold font-['Inter'] text-white tracking-tight">
                Tavonza Cashier
              </h1>
              <p className="text-xs text-zinc-500 font-['Inter'] hidden sm:block">
                Counter POS & Table Bill Settlement
              </p>
            </div>
          </div>

          {/* User Profile Pill */}
          <div className="px-4 py-2 bg-zinc-900 rounded-lg border border-neutral-800 flex items-center gap-2.5">
            <div className="w-9 h-9 p-2.5 bg-amber-400 rounded-full flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-black" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-white font-['Poppins'] leading-4">
                Nobin Mille
              </span>
              <span className="text-xs font-medium text-slate-500 font-['Poppins'] leading-4">
                Cashier
              </span>
            </div>
          </div>
        </header>

        {/* Scrollable Body Content */}
        <main className="cashier-dashboard-main flex-1 overflow-y-auto custom-scrollbar flex flex-col">
          {bodyContent}
        </main>
      </div>

      {modalOverlays}
    </div>
  );
}
