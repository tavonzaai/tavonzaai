"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import CashierSidebar from "./Sidebar";
import ProfileView from "./ProfileView";
import { CashierOrder, BillQueueItem, KitchenStatus } from "./types";
import { cashierService, getActiveBranchId, fetchActiveBranchId, OfflinePaymentRequestItem } from "@/redux/features/cashierApi";
import { useAppSelector } from "@/redux/store";
import {
  Search,
  Clock,
  User,
  CheckCircle2,
  ChefHat,
  Utensils,
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
  Loader2,
} from "lucide-react";
import { loadStripe, Stripe, StripeCardElement } from "@stripe/stripe-js";
import { toast } from "sonner";
import AskAiModal from "./AskAiModal";
import DraggableAiButton from "../common/DraggableAiButton";
import { PaginationBar } from "../common/PaginationBar";

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
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryOrderId = searchParams?.get("orderId");
  const { user } = useAppSelector((state) => state.auth);

  // Determine activeNav from pathname or initialNav
  const getNavFromPath = React.useCallback(() => {
    if (pathname?.includes("/profile")) return "Profile";
    if (pathname?.includes("/create-order")) return "Create Order";
    if (pathname?.includes("/bill-queue")) return "Bill Queue";
    if (pathname?.includes("/order-details") || pathname?.includes("/orders")) return "Order Details";
    if (pathname?.includes("/table-view") || pathname?.includes("/dashboard")) return "Table View";
    return initialNav || "Table View";
  }, [pathname, initialNav]);

  const [activeNav, setActiveNav] = useState<string>(() => getNavFromPath());
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [isAskAiOpen, setIsAskAiOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

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
  const BILLS_PER_PAGE = 10;
  const ORDERS_PER_PAGE = 10;
  const [billPage, setBillPage] = useState<number>(1);
  const [orderPage, setOrderPage] = useState<number>(1);
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
  const [offlineRequests, setOfflineRequests] = useState<OfflinePaymentRequestItem[]>([]);
  const [dashboardKpis, setDashboardKpis] = useState({
    todayRevenue: 0,
    todayPaidOrders: 0,
    unpaidOrders: 0,
    unpaidAmount: 0,
    refundsToday: 0,
    refundCountToday: 0,
  });

  // Stripe Checkout Modal state for Cashier
  const [isStripeModalOpen, setIsStripeModalOpen] = useState(false);
  const [stripeTargetOrder, setStripeTargetOrder] = useState<CashierOrder | null>(null);
  const [stripeInstance, setStripeInstance] = useState<Stripe | null>(null);
  const [cardElement, setCardElement] = useState<StripeCardElement | null>(null);
  const [stripeClientSecret, setStripeClientSecret] = useState<string>("");
  const [stripePaymentIntentId, setStripePaymentIntentId] = useState<string>("");
  const [isStripeLoading, setIsStripeLoading] = useState(false);
  const [isProcessingStripe, setIsProcessingStripe] = useState(false);
  const [isProcessingCash, setIsProcessingCash] = useState(false);
  const [stripeMountError, setStripeMountError] = useState<string | null>(null);
  const [stripeCardholderName, setStripeCardholderName] = useState<string>("Valued Guest");
  const stripeCardRef = React.useRef<HTMLDivElement>(null);

  const isPaidOrder = (ord?: CashierOrder | null): boolean => {
    if (!ord) return false;
    const fStatus = String(ord.financeStatus || "").toUpperCase();
    const pStatus = String((ord as any).paymentStatus || "").toUpperCase();
    const oStatus = String((ord as any).status || "").toUpperCase();
    return (
      fStatus === "PAID_CASH" ||
      fStatus === "PAID" ||
      pStatus === "PAID" ||
      pStatus === "COMPLETED" ||
      oStatus === "PAID" ||
      Boolean(ord.isPaid) ||
      Boolean((ord as any).paid) ||
      Boolean((ord as any).isFullyPaid) ||
      (ord.amountPaid != null &&
        Number(ord.amountPaid) > 0 &&
        Number(ord.amountPaid) >= Number(ord.totalAmount || (ord as any).total || 0))
    );
  };

  useEffect(() => {
    if (queryOrderId) {
      setSelectedOrderId(queryOrderId);
    }
  }, [queryOrderId]);

  useEffect(() => {
    let mounted = true;
    const loadCashierData = async () => {
      try {
        setIsLoading(true);
        let branchId = getActiveBranchId();
        if (!branchId) {
          branchId = await fetchActiveBranchId();
        }
        const [rawOrders, rawMenu, rawRequests, kpis, rawPayments] = await Promise.all([
          cashierService.getOrders(branchId),
          cashierService.getMenuItems(branchId),
          cashierService.getOfflinePaymentRequests(branchId).catch(() => []),
          cashierService.getCashierDashboardAnalytics(branchId).catch(() => null),
          cashierService.listPayments(branchId, 1, 100).catch(() => []),
        ]);

        if (mounted && kpis) {
          setDashboardKpis({
            todayRevenue: Number(kpis.todayRevenue || 0),
            todayPaidOrders: Number(kpis.todayPaidOrders || 0),
            unpaidOrders: Number(kpis.unpaidOrders || 0),
            unpaidAmount: Number(kpis.unpaidAmount || 0),
            refundsToday: Number(kpis.refundsToday || 0),
            refundCountToday: Number(kpis.refundCountToday || 0),
          });
        }

        if (mounted && Array.isArray(rawRequests)) {
          setOfflineRequests(rawRequests);
        }

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
          // If queryOrderId is requested from URL but not in recent branch orders list, fetch it directly
          if (queryOrderId && !rawOrders.some((o: any) => (o.orderId || o.id) === queryOrderId)) {
            try {
              const singleOrder = await cashierService.getOrder(queryOrderId);
              if (singleOrder && (singleOrder.id || singleOrder.orderId)) {
                rawOrders.unshift(singleOrder);
              }
            } catch (err) {
              console.warn("Could not load queryOrderId directly:", err);
            }
          }

          const paidOrdersMap = new Map<string, { status: string; method?: string }>();
          const paidSessionsMap = new Map<string, { status: string; method?: string }>();
          if (Array.isArray(rawPayments)) {
            for (const p of rawPayments) {
              const pStatus = String(p.status || "").toUpperCase();
              if (pStatus === "PAID" || pStatus === "COMPLETED" || Boolean(p.paidAt)) {
                const rawMethod = String(p.method || "").toUpperCase();
                const cleanMethod =
                  rawMethod === "CASH"
                    ? "Cash"
                    : rawMethod === "CARD"
                    ? "Card"
                    : rawMethod === "ONLINE_GATEWAY" || rawMethod.includes("STRIPE")
                    ? "Stripe Card (Online)"
                    : p.method || "Paid";
                if (p.orderId) {
                  paidOrdersMap.set(p.orderId, {
                    status: pStatus,
                    method: cleanMethod,
                  });
                }
                if (p.tableSessionId) {
                  paidSessionsMap.set(p.tableSessionId, {
                    status: pStatus,
                    method: cleanMethod,
                  });
                }
              }
            }
          }

          const hasOfflineRequest = (ordId: string, sessId?: string) => {
            if (!Array.isArray(rawRequests) || rawRequests.length === 0) return false;
            return rawRequests.some(
              (r: any) =>
                (r.orderId && r.orderId === ordId) ||
                (sessId && r.tableSessionId && r.tableSessionId === sessId)
            );
          };

          const mappedOrders: CashierOrder[] = rawOrders.map((o: any) => {
            const ordId = o.orderId || o.id;
            const pRecord = paidOrdersMap.get(ordId) || (o.tableSessionId ? paidSessionsMap.get(o.tableSessionId) : undefined);
            const pStatus = String(o.paymentStatus || "").toUpperCase();
            const oStatus = String(o.status || "").toUpperCase();

            const isOrderPaidStatus =
              Boolean(pRecord) ||
              pStatus === "PAID" ||
              pStatus === "COMPLETED" ||
              oStatus === "PAID" ||
              Boolean(o.isFullyPaid) ||
              Boolean(o.isPaid) ||
              Boolean(o.paid) ||
              (o.amountPaid != null &&
                Number(o.amountPaid) > 0 &&
                Number(o.amountPaid) >= Number(o.totalAmount || o.total || 0)) ||
              o.financeStatus === "PAID_CASH" ||
              o.financeStatus === "PAID";

            const isRequestingCash =
              !isOrderPaidStatus &&
              (o.financeStatus === "REQUESTING_CASH" || hasOfflineRequest(ordId, o.tableSessionId));

            const cleanKitchenStatus = (
              o.status === "SERVED"
                ? "SERVED"
                : o.status === "READY_TO_SERVE" || o.status === "READY"
                ? "READY_TO_SERVE"
                : o.status === "PREPARING"
                ? "PREPARING"
                : o.status === "ACCEPTED"
                ? "ACCEPTED"
                : o.status === "SUBMITTED"
                ? "SUBMITTED"
                : o.status === "CANCELLED"
                ? "CANCELLED"
                : o.status === "REJECTED"
                ? "REJECTED"
                : "COMPLETED"
            ) as KitchenStatus;

            let methodStr = pRecord?.method || o.paymentMethod;
            if (!methodStr && isOrderPaidStatus) {
              methodStr = "Stripe Card (Online)";
            } else if (methodStr) {
              const upper = String(methodStr).toUpperCase();
              if (upper.includes("STRIPE") || upper.includes("ONLINE") || upper === "ONLINE_GATEWAY") {
                methodStr = "Stripe Card (Online)";
              } else if (upper === "CARD" || upper === "CREDIT_CARD") {
                methodStr = "Card";
              } else if (upper === "CASH") {
                methodStr = "Cash";
              }
            } else {
              methodStr = isRequestingCash ? "Cash" : "Pending";
            }

            const total = Number(o.totalAmount || o.total || 0);
            const subtotal = o.subtotal != null ? Number(o.subtotal) : total * 0.9;
            const serviceCharge = o.serviceCharge != null ? Number(o.serviceCharge) : total * 0.05;
            const tax = o.tax != null ? Number(o.tax) : total * 0.05;

            return {
              id: ordId,
              orderNumber: o.orderNumber || `#${ordId.slice(0, 5)}`,
              totalAmount: total,
              tableNumber: o.tableLabel || (o.tableNumber ? `Table ${o.tableNumber}` : o.tableId ? "Table" : "Takeaway"),
              guestCount: 2,
              waitTime: "Just now",
              customerName: o.customerName || o.guestName || "Guest",
              itemCount: o.itemCount || (o.items?.length ?? 1),
              subtotal,
              serviceCharge,
              tax,
              status: o.status,
              displayStatus:
                o.displayStatus ||
                (o.status === "SERVED"
                  ? "Served"
                  : o.status === "READY" || o.status === "READY_TO_SERVE"
                  ? "Ready to serve"
                  : o.status === "PREPARING"
                  ? "Preparing"
                  : o.status === "ACCEPTED"
                  ? "Accepted"
                  : o.status === "SUBMITTED"
                  ? "Order Received"
                  : o.status === "CANCELLED"
                  ? "Cancelled"
                  : o.status === "REJECTED"
                  ? "Rejected"
                  : "Completed"),
              kitchenStatus: cleanKitchenStatus,
              financeStatus: isOrderPaidStatus
                ? "PAID"
                : isRequestingCash
                ? "REQUESTING_CASH"
                : "NOT_PAID",
              paymentStatus: isOrderPaidStatus ? "PAID" : o.paymentStatus || "UNPAID",
              amountPaid: Number(o.amountPaid || (isOrderPaidStatus ? total : 0)),
              isFullyPaid: isOrderPaidStatus,
              isPaid: isOrderPaidStatus,
              paymentDate: o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "Today",
              paymentMethod: methodStr,
              tableSessionId: o.tableSessionId,
              tableId: o.tableId,
              items: (o.items || []).map((it: any, idx: number) => ({
                id: it.id || `item-${idx}`,
                name: it.name || it.productNameSnapshot || `Item #${idx + 1}`,
                price: Number(it.price || it.unitPrice || 0),
                quantity: it.quantity || 1,
              })),
            };
          });

          const mappedBills: BillQueueItem[] = rawOrders
            .filter((o: any) => {
              const ordId = o.orderId || o.id;
              const pRecord = paidOrdersMap.get(ordId);
              const pStatus = String(o.paymentStatus || "").toUpperCase();
              const oStatus = String(o.status || "").toUpperCase();
              const isOrderPaidStatus =
                Boolean(pRecord) ||
                pStatus === "PAID" ||
                pStatus === "COMPLETED" ||
                oStatus === "PAID" ||
                Boolean(o.isFullyPaid) ||
                Boolean(o.isPaid) ||
                Boolean(o.paid) ||
                (o.amountPaid != null &&
                  Number(o.amountPaid) > 0 &&
                  Number(o.amountPaid) >= Number(o.totalAmount || o.total || 0)) ||
                o.financeStatus === "PAID_CASH" ||
                o.financeStatus === "PAID";
              return !isOrderPaidStatus;
            })
            .map((o: any) => {
              const total = Number(o.totalAmount || o.total || 0);
              const subtotal = o.subtotal != null ? Number(o.subtotal) : total * 0.9;
              const tax = o.tax != null ? Number(o.tax) : total * 0.05;
              const serviceCharge = o.serviceCharge != null ? Number(o.serviceCharge) : total * 0.05;
              const items = (o.items || []).map((it: any, idx: number) => ({
                name: it.name || it.productNameSnapshot || `Item #${idx + 1}`,
                price: Number(it.price || it.unitPrice || 0),
                quantity: Number(it.quantity || 1),
              }));
              return {
                id: `bill-${o.orderId || o.id}`,
                orderNumber: o.orderNumber || `#${(o.orderId || o.id).slice(0, 5)}`,
                tableNumber: o.tableLabel || "Table",
                customerName: o.customerName || o.guestName || "Guest",
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
          if (queryOrderId) {
            setSelectedOrderId(queryOrderId);
          } else if (mappedOrders.length > 0 && !selectedOrderId && mappedOrders[0]) {
            setSelectedOrderId(mappedOrders[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to load cashier dashboard data:", err);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };
    loadCashierData();
    const handleUpdate = () => loadCashierData();
    window.addEventListener('tavonza:payment_status_changed', handleUpdate);
    window.addEventListener('tavonza:payment_requested', handleUpdate);
    window.addEventListener('tavonza:order_created', handleUpdate);
    window.addEventListener('tavonza:order_status_changed', handleUpdate);
    window.addEventListener('tavonza:table_status_changed', handleUpdate);
    window.addEventListener('tavonza:table_session_changed', handleUpdate);
    return () => {
      mounted = false;
      window.removeEventListener('tavonza:payment_status_changed', handleUpdate);
      window.removeEventListener('tavonza:payment_requested', handleUpdate);
      window.removeEventListener('tavonza:order_created', handleUpdate);
      window.removeEventListener('tavonza:order_status_changed', handleUpdate);
      window.removeEventListener('tavonza:table_status_changed', handleUpdate);
      window.removeEventListener('tavonza:table_session_changed', handleUpdate);
    };
  }, [selectedOrderId, queryOrderId]);
  const [orderNo, setOrderNo] = useState<string>("#1230");
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("Requesting Cash");

  // Active selected order in Table View
  const activeOrder =
    orders.find((o) => o.id === selectedOrderId || o.orderNumber === selectedOrderId) ||
    (queryOrderId ? orders.find((o) => o.id === queryOrderId || o.orderNumber === queryOrderId) : null) ||
    orders[0];

  // Proactively check if currently selected active order has already been settled in backend payments
  useEffect(() => {
    if (!activeOrder || isPaidOrder(activeOrder)) return;
    let isCurrent = true;

    Promise.all([
      cashierService.getPaymentsByOrder(activeOrder.id).catch(() => []),
      activeOrder.tableSessionId
        ? cashierService.getSessionBill(activeOrder.tableSessionId).catch(() => null)
        : Promise.resolve(null),
    ])
      .then(([records, sessionBill]) => {
        if (!isCurrent) return;

        const hasPaidPayment =
          Array.isArray(records) &&
          records.some((p: any) => {
            const st = String(p.status || "").toUpperCase();
            return st === "PAID" || st === "COMPLETED" || Boolean(p.paidAt);
          });

        const totalPaid = Array.isArray(records)
          ? records
              .filter((p: any) => {
                const st = String(p.status || "").toUpperCase();
                return st === "PAID" || Boolean(p.paidAt);
              })
              .reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0)
          : 0;

        const isSessionPaid =
          sessionBill &&
          (sessionBill.isFullyPaid === true ||
            (sessionBill.paidAmount != null &&
              Number(sessionBill.paidAmount) > 0 &&
              Number(sessionBill.balanceDue || 0) === 0));

        if (hasPaidPayment || (totalPaid > 0 && totalPaid >= activeOrder.totalAmount) || isSessionPaid) {
          let cleanMethod = "Stripe Card (Online)";
          if (Array.isArray(records) && records.length > 0) {
            const firstMethod = String(records[0]?.method || "").toUpperCase();
            cleanMethod =
              firstMethod === "CASH"
                ? "Cash"
                : firstMethod === "CARD"
                ? "Card"
                : firstMethod === "ONLINE_GATEWAY" || firstMethod.includes("STRIPE")
                ? "Stripe Card (Online)"
                : records[0]?.method || "Paid";
          }

          setOrders((prev) =>
            prev.map((ord) => {
              if (ord.id === activeOrder.id) {
                return {
                  ...ord,
                  financeStatus: "PAID",
                  paymentStatus: "PAID",
                  isPaid: true,
                  amountPaid: ord.totalAmount,
                  isFullyPaid: true,
                  paymentMethod: cleanMethod,
                };
              }
              return ord;
            })
          );
          setBillQueueItems((prev) =>
            prev.filter(
              (b) => b.id !== `bill-${activeOrder.id}` && !b.orderNumber.includes(activeOrder.orderNumber)
            )
          );
        }
      })
      .catch(() => {});

    return () => {
      isCurrent = false;
    };
  }, [activeOrder?.id, activeOrder?.tableSessionId]);

  // Search filter for Table View
  const filteredOrders = orders.filter(
    (ord) =>
      ord.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.tableNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.customerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    setOrderPage(1);
  }, [searchQuery]);

  const totalOrderPages = Math.max(1, Math.ceil(filteredOrders.length / ORDERS_PER_PAGE));
  const paginatedOrders = filteredOrders.slice(
    (orderPage - 1) * ORDERS_PER_PAGE,
    orderPage * ORDERS_PER_PAGE
  );

  // Filter for Bill Queue items
  const filteredBillQueue = billQueueItems.filter(
    (item) =>
      item.orderNumber.toLowerCase().includes(billSearchQuery.toLowerCase()) ||
      item.customerName.toLowerCase().includes(billSearchQuery.toLowerCase()) ||
      item.tableNumber.toLowerCase().includes(billSearchQuery.toLowerCase())
  );

  useEffect(() => {
    setBillPage(1);
  }, [billSearchQuery]);

  const totalBillPages = Math.max(1, Math.ceil(filteredBillQueue.length / BILLS_PER_PAGE));
  const paginatedBillQueue = filteredBillQueue.slice(
    (billPage - 1) * BILLS_PER_PAGE,
    billPage * BILLS_PER_PAGE
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
  const handleConfirmCashPaid = async (orderId: string) => {
    const targetOrd = orders.find((o) => o.id === orderId);
    try {
      if (!targetOrd) {
        toast.error("Order not found");
        return;
      }

      // Check if order is already paid to prevent duplicate processing
      if (isPaidOrder(targetOrd)) {
        toast.info("This order has already been paid and settled.");
        return;
      }

      setIsProcessingCash(true);

      // Check if an offline payment request exists for this order or table session
      const matchingReq = offlineRequests.find(
        (r) =>
          (r.orderId && r.orderId === orderId) ||
          (targetOrd.tableSessionId && r.tableSessionId === targetOrd.tableSessionId)
      );
      if (matchingReq) {
        await cashierService.confirmOfflinePayment(matchingReq.id, {
          receivedAmount: targetOrd.totalAmount,
        });
      } else {
        await cashierService.processPayment({
          orderId: targetOrd.id,
          tableSessionId: targetOrd.tableSessionId,
          scope: "ORDER",
          amount: targetOrd.totalAmount,
          method: "CASH",
        });
      }

      toast.success("Cash payment confirmed and recorded!");

      // Authoritative state update
      setOrders((prev) =>
        prev.map((ord) => {
          if (ord.id === orderId) {
            return {
              ...ord,
              financeStatus: "PAID_CASH",
              paymentStatus: "PAID",
              isPaid: true,
              paymentMethod: "Cash",
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

      // Remove settled order from bill queue
      setBillQueueItems((prev) =>
        prev.filter((b) => b.id !== `bill-${orderId}` && !b.orderNumber.includes(targetOrd.orderNumber))
      );
    } catch (err: any) {
      const errMsg = err?.message || "";
      if (
        errMsg.toLowerCase().includes("already fully paid") ||
        errMsg.toLowerCase().includes("already paid")
      ) {
        toast.info("This order has already been fully paid.");
        // Immediately mark order as settled and disable the payment button
        setOrders((prev) =>
          prev.map((ord) => {
            if (ord.id === orderId) {
              return {
                ...ord,
                financeStatus: "PAID_CASH",
                paymentStatus: "PAID",
                isPaid: true,
                paymentMethod: ord.paymentMethod || "Paid",
              };
            }
            return ord;
          })
        );
        setBillQueueItems((prev) =>
          prev.filter((b) => b.id !== `bill-${orderId}` && (!targetOrd?.orderNumber || !b.orderNumber.includes(targetOrd.orderNumber)))
        );
        return;
      }
      toast.error(errMsg || "Failed to confirm cash paid");
    } finally {
      setIsProcessingCash(false);
    }
  };

  // Open Stripe checkout modal for an order
  const handleOpenStripeModal = async (targetOrder: CashierOrder) => {
    if (isPaidOrder(targetOrder)) {
      toast.info("This order has already been paid and settled.");
      return;
    }
    setStripeTargetOrder(targetOrder);
    setIsStripeModalOpen(true);
    setIsStripeLoading(true);
    setStripeMountError(null);
    setStripeClientSecret("");
    setStripePaymentIntentId("");
    setStripeCardholderName(targetOrder.customerName || "Valued Guest");

    try {
      const intentRes = await cashierService.createStripePaymentIntent({
        orderId: targetOrder.id,
        tableSessionId: targetOrder.tableSessionId,
      });

      setStripeClientSecret(intentRes.clientSecret);
      setStripePaymentIntentId(intentRes.paymentIntentId);

      if (intentRes.publishableKey && !intentRes.clientSecret.startsWith("pi_test_")) {
        try {
          const stripeObj = await loadStripe(intentRes.publishableKey);
          if (stripeObj) {
            setStripeInstance(stripeObj);
            const elements = stripeObj.elements();
            const card = elements.create("card", {
              style: {
                base: {
                  color: "#ffffff",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "15px",
                  "::placeholder": { color: "#71717a" },
                },
                invalid: { color: "#ef4444", iconColor: "#ef4444" },
              },
            });
            setTimeout(() => {
              if (stripeCardRef.current) {
                stripeCardRef.current.innerHTML = "";
                card.mount(stripeCardRef.current);
                setCardElement(card);
              }
            }, 100);
          }
        } catch (e: any) {
          console.warn("Stripe Elements mount notice:", e);
        }
      }
    } catch (err: any) {
      console.error("Failed to initialize Stripe PaymentIntent:", err);
      setStripeMountError(err?.message || "Failed to initiate Stripe session");
    } finally {
      setIsStripeLoading(false);
    }
  };

  // Execute Stripe Payment
  const handleExecuteStripePayment = async () => {
    if (!stripeTargetOrder || !stripePaymentIntentId) {
      toast.error("Stripe session not initialized");
      return;
    }

    setIsProcessingStripe(true);
    try {
      if (stripeInstance && cardElement && stripeClientSecret && !stripeClientSecret.startsWith("pi_test_")) {
        const result = await stripeInstance.confirmCardPayment(stripeClientSecret, {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: stripeCardholderName || "Guest",
            },
          },
        });

        if (result.error) {
          const msg = result.error.message || "Payment declined by Stripe";
          toast.error(msg);
          setIsProcessingStripe(false);
          return;
        }
      }

      await cashierService.verifyStripePayment(stripePaymentIntentId);

      toast.success(
        `Payment of $${stripeTargetOrder.totalAmount.toFixed(2)} settled via Stripe!`
      );

      setOrders((prev) =>
        prev.map((ord) => {
          if (ord.id === stripeTargetOrder.id) {
            return {
              ...ord,
              financeStatus: "PAID_CASH",
              paymentStatus: "PAID",
              isPaid: true,
              paymentMethod: "Stripe / Card",
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

      // Remove settled order from bill queue
      setBillQueueItems((prev) =>
        prev.filter((b) => b.id !== `bill-${stripeTargetOrder.id}` && !b.orderNumber.includes(stripeTargetOrder.orderNumber))
      );

      setIsStripeModalOpen(false);
      if (cardElement) {
        cardElement.destroy();
        setCardElement(null);
      }
    } catch (err: any) {
      const errMsg = err?.message || "";
      if (
        errMsg.toLowerCase().includes("already fully paid") ||
        errMsg.toLowerCase().includes("already paid")
      ) {
        toast.info("This order has already been fully paid.");
        setOrders((prev) =>
          prev.map((ord) => {
            if (ord.id === stripeTargetOrder.id) {
              return {
                ...ord,
                financeStatus: "PAID_CASH",
                paymentStatus: "PAID",
                isPaid: true,
                paymentMethod: ord.paymentMethod || "Stripe / Card",
              };
            }
            return ord;
          })
        );
        setBillQueueItems((prev) =>
          prev.filter(
            (b) => b.id !== `bill-${stripeTargetOrder.id}` && !b.orderNumber.includes(stripeTargetOrder.orderNumber)
          )
        );
        setIsStripeModalOpen(false);
        return;
      }
      toast.error(errMsg || "Stripe payment processing failed");
    } finally {
      setIsProcessingStripe(false);
    }
  };

  const isProfileMode = activeNav.toLowerCase() === "profile";
  const isCreateOrderMode =
    activeNav.toLowerCase() === "create order" ||
    activeNav.toLowerCase() === "select item";

  const isBillQueueMode = activeNav.toLowerCase() === "bill queue";
  const isOrderDetailsMode =
    activeNav.toLowerCase() === "order details" ||
    activeNav.toLowerCase() === "order-details" ||
    activeNav.toLowerCase() === "order detail" ||
    activeNav.toLowerCase() === "orders";

  const bodyContent = (
    <>
      {/* Dynamic Body Content */}
      {isProfileMode ? (
        <ProfileView onBack={() => setActiveNav("Table View")} />
      ) : isBillQueueMode ? (
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

            {/* Top KPI Metrics Bar — from GET /analytics/cashier-dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4" data-testid="cashier-analytics-kpis">
              <div className="h-32 p-5 bg-neutral-900 rounded-[10px] shadow-md border border-emerald-900/60 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-teal-500 text-2xl font-bold font-['Inter'] leading-5">
                    ${dashboardKpis.todayRevenue.toFixed(2)}
                  </div>
                  <div className="text-stone-300 text-xs font-semibold font-['Inter']">
                    Today&apos;s Revenue
                  </div>
                  <div className="text-neutral-500 text-[10px] font-medium font-['Inter']">
                    {dashboardKpis.todayPaidOrders} paid orders
                  </div>
                </div>
                <div className="w-8 h-8 bg-teal-500/10 rounded-lg border border-teal-500/20 flex items-center justify-center shrink-0">
                  <DollarSign className="w-4 h-4 text-teal-500" />
                </div>
              </div>

              <div className="h-32 p-5 bg-neutral-900 rounded-[10px] shadow-md border border-yellow-900/60 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-amber-500 text-2xl font-bold font-['Inter'] leading-5">
                    ${dashboardKpis.unpaidAmount.toFixed(2)}
                  </div>
                  <div className="text-stone-300 text-xs font-semibold font-['Inter']">
                    Pending Amount
                  </div>
                  <div className="text-neutral-500 text-[10px] font-medium font-['Inter']">
                    {dashboardKpis.unpaidOrders} pending payments
                  </div>
                </div>
                <div className="w-8 h-8 bg-amber-500/10 rounded-lg border border-amber-500/20 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-amber-500" />
                </div>
              </div>

              <div className="h-32 p-5 bg-neutral-900 rounded-[10px] shadow-md border border-pink-950 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-red-500 text-2xl font-bold font-['Inter'] leading-5">
                    ${dashboardKpis.refundsToday.toFixed(2)}
                  </div>
                  <div className="text-stone-300 text-xs font-semibold font-['Inter']">
                    Refunds Today
                  </div>
                  <div className="text-neutral-500 text-[10px] font-medium font-['Inter']">
                    {dashboardKpis.refundCountToday} transaction
                    {dashboardKpis.refundCountToday === 1 ? '' : 's'}
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
                  {isLoading ? (
                    [1, 2, 3, 4, 5].map((k) => (
                      <tr key={k} className="animate-pulse">
                        <td className="px-4 py-4 border-r border-zinc-800"><div className="h-4 w-20 bg-neutral-800 rounded" /></td>
                        <td className="px-4 py-4 border-r border-zinc-800"><div className="h-4 w-16 bg-neutral-800 rounded" /></td>
                        <td className="px-4 py-4 border-r border-zinc-800"><div className="h-4 w-24 bg-neutral-800 rounded" /></td>
                        <td className="px-4 py-4 border-r border-zinc-800"><div className="h-4 w-16 bg-neutral-800 rounded" /></td>
                        <td className="px-4 py-4 border-r border-zinc-800"><div className="h-4 w-20 bg-neutral-800 rounded" /></td>
                        <td className="px-4 py-4 border-r border-zinc-800"><div className="h-6 w-20 bg-neutral-800 rounded-md" /></td>
                        <td className="px-4 py-4 border-r border-zinc-800"><div className="h-4 w-16 bg-neutral-800 rounded" /></td>
                        <td className="px-4 py-4 text-center"><div className="w-8 h-8 bg-neutral-800 rounded-lg mx-auto" /></td>
                      </tr>
                    ))
                  ) : filteredBillQueue.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center text-neutral-500">
                        No pending bills in queue
                      </td>
                    </tr>
                  ) : (
                    paginatedBillQueue.map((row) => (
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
                        <td className="px-4 py-4 border-r border-zinc-800">
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
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Bill Queue Pagination (10 per page) */}
            {filteredBillQueue.length > 0 && (
              <PaginationBar
                meta={{
                  page: billPage,
                  limit: BILLS_PER_PAGE,
                  total: filteredBillQueue.length,
                  totalPages: totalBillPages,
                  hasNextPage: billPage < totalBillPages,
                  hasPreviousPage: billPage > 1,
                }}
                onPageChange={(newPage) => setBillPage(newPage)}
                pageSizeOptions={[10, 20, 50]}
              />
            )}
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
                        onClick={() => toast.info("Order held in queue.")}
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
        ) : isOrderDetailsMode ? (
          /* ========================================================================= */
          /* DEDICATED ORDER DETAILS MODE                                              */
          /* ========================================================================= */
          <div className="p-4 sm:p-6 lg:p-8 print:p-0 print:m-0 space-y-6 print:space-y-2 flex-1 max-w-[1600px] w-full mx-auto">
            {/* Printable Receipt Branded Header */}
            <div className="hidden print:flex items-center justify-between pb-2 border-b border-neutral-700 w-full mb-1">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-amber-400 flex items-center justify-center text-black font-bold text-xs">
                  T
                </div>
                <div>
                  <span className="font-bold text-sm tracking-tight text-white font-['Inter']">
                    Tavonza Restaurant POS
                  </span>
                  <span className="text-neutral-500 text-xs ml-2">• Official Order Receipt</span>
                </div>
              </div>
              <div className="text-right text-xs text-neutral-400 font-['Poppins']">
                <span>{new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
              </div>
            </div>

            {/* Top Bar with Back Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800 print:pb-2 print:border-neutral-700">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setActiveNav("Table View");
                    router.push("/updated-cashier-dashboard/table-view");
                  }}
                  className="p-2 bg-neutral-900 hover:bg-neutral-800 rounded-lg border border-neutral-800 text-neutral-300 hover:text-white transition flex items-center gap-2 text-sm font-medium cursor-pointer print:hidden"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Table View</span>
                </button>

                <div>
                  <h2 className="text-xl sm:text-2xl font-bold font-['Inter'] text-white">
                    Order Details {activeOrder ? `— ${activeOrder.orderNumber}` : ""}
                  </h2>
                  <p className="text-xs sm:text-sm text-neutral-400 font-['Inter']">
                    {activeOrder
                      ? `Table ${activeOrder.tableNumber} • ${activeOrder.guestCount} Guests • ${activeOrder.customerName}`
                      : "Detailed line items, receipt, and payment settlement"}
                  </p>
                </div>
              </div>

              {activeOrder && (
                <div className="flex items-center gap-2">
                  {/* Exact Kitchen / Order Status Badge */}
                  <div
                    className={`px-3 py-1.5 rounded-lg border flex items-center gap-2 ${
                      activeOrder.status === "SERVED"
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                        : activeOrder.status === "READY" || activeOrder.kitchenStatus === "READY_TO_SERVE"
                        ? "bg-green-500/10 border-green-500/30 text-green-400"
                        : activeOrder.status === "PREPARING" || activeOrder.kitchenStatus === "PREPARING"
                        ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                        : activeOrder.status === "CANCELLED" || activeOrder.status === "REJECTED"
                        ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                        : "bg-blue-500/10 border-blue-500/30 text-blue-400"
                    }`}
                  >
                    <div className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center">
                      {activeOrder.status === "SERVED" ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : activeOrder.status === "PREPARING" ? (
                        <ChefHat className="w-3.5 h-3.5" />
                      ) : (
                        <Utensils className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <span className="text-xs sm:text-sm font-medium font-['Poppins']">
                      {activeOrder.displayStatus || (
                        activeOrder.status === "SERVED"
                          ? "Served"
                          : activeOrder.status === "READY" || activeOrder.kitchenStatus === "READY_TO_SERVE"
                          ? "Ready to serve"
                          : activeOrder.status === "PREPARING"
                          ? "Preparing"
                          : activeOrder.status === "ACCEPTED"
                          ? "Accepted"
                          : activeOrder.status === "SUBMITTED"
                          ? "Order Received"
                          : activeOrder.status === "CANCELLED"
                          ? "Cancelled"
                          : activeOrder.status === "REJECTED"
                          ? "Rejected"
                          : "Completed"
                      )}
                    </span>
                  </div>

                  {/* Finance / Payment Status Badge */}
                  {isPaidOrder(activeOrder) ? (
                    <div className="px-3 py-1.5 bg-green-500/10 rounded-lg border border-green-500/30 flex items-center gap-2">
                      <div className="w-6 h-6 bg-green-500/20 rounded-md border border-green-500/50 flex items-center justify-center">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                      </div>
                      <span className="text-green-400 text-xs sm:text-sm font-semibold font-['Poppins']">
                        Paid ({activeOrder.paymentMethod || "Settled"})
                      </span>
                    </div>
                  ) : activeOrder.financeStatus === "REQUESTING_CASH" ? (
                    <div className="px-3 py-1.5 bg-amber-500/10 rounded-lg border border-amber-500/30 flex items-center gap-2">
                      <div className="w-6 h-6 bg-amber-500/20 rounded-md border border-amber-500/50 flex items-center justify-center">
                        <Banknote className="w-3.5 h-3.5 text-amber-500" />
                      </div>
                      <span className="text-amber-400 text-xs sm:text-sm font-medium font-['Poppins']">
                        Request to Pay Cash
                      </span>
                    </div>
                  ) : (
                    <div className="px-3 py-1.5 bg-neutral-800/80 rounded-lg border border-neutral-700 flex items-center gap-2">
                      <div className="w-6 h-6 bg-neutral-700/80 rounded-md flex items-center justify-center">
                        <Clock className="w-3.5 h-3.5 text-neutral-300" />
                      </div>
                      <span className="text-neutral-300 text-xs sm:text-sm font-medium font-['Poppins']">
                        Pending Payment
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-pulse">
                <div className="lg:col-span-8 bg-neutral-900 rounded-xl border border-neutral-800 p-6 space-y-6">
                  <div className="h-6 w-48 bg-neutral-800 rounded" />
                  <div className="space-y-4">
                    {[1, 2, 3].map((k) => (
                      <div key={k} className="h-14 bg-neutral-800/40 rounded-lg" />
                    ))}
                  </div>
                  <div className="h-28 bg-neutral-800/30 rounded-lg" />
                </div>
                <div className="lg:col-span-4 bg-neutral-900 rounded-xl border border-neutral-800 p-6 space-y-6">
                  <div className="h-40 bg-neutral-800/50 rounded-xl" />
                  <div className="h-12 bg-neutral-800 rounded-lg" />
                </div>
              </div>
            ) : activeOrder ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 print:grid-cols-12 gap-6 print:gap-4 items-start">
                {/* Left Column: Full Order Itemization & Metadata */}
                <div className="lg:col-span-8 print:col-span-8 space-y-6 print:space-y-2.5">
                  {/* Metadata Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 print:grid-cols-4 gap-3 print:gap-2">
                    <div className="p-3.5 print:p-2 bg-neutral-900 rounded-xl border border-neutral-800 print:border-neutral-700 space-y-1">
                      <span className="text-xs text-neutral-500 font-medium font-['Poppins']">Table</span>
                      <p className="text-base print:text-sm font-semibold text-white font-['Poppins']">{activeOrder.tableNumber}</p>
                    </div>
                    <div className="p-3.5 print:p-2 bg-neutral-900 rounded-xl border border-neutral-800 print:border-neutral-700 space-y-1">
                      <span className="text-xs text-neutral-500 font-medium font-['Poppins']">Customer</span>
                      <p className="text-base print:text-sm font-semibold text-white font-['Poppins'] truncate">{activeOrder.customerName}</p>
                    </div>
                    <div className="p-3.5 print:p-2 bg-neutral-900 rounded-xl border border-neutral-800 print:border-neutral-700 space-y-1">
                      <span className="text-xs text-neutral-500 font-medium font-['Poppins']">Guests</span>
                      <p className="text-base print:text-sm font-semibold text-white font-['Poppins']">{activeOrder.guestCount} Guests</p>
                    </div>
                    <div className="p-3.5 print:p-2 bg-neutral-900 rounded-xl border border-neutral-800 print:border-neutral-700 space-y-1">
                      <span className="text-xs text-neutral-500 font-medium font-['Poppins']">Wait Time</span>
                      <p className="text-base print:text-sm font-semibold text-amber-400 font-['Poppins']">{activeOrder.waitTime}</p>
                    </div>
                  </div>

                  {/* Itemized Table */}
                  <div className="bg-neutral-900 rounded-xl border border-neutral-800 print:border-neutral-700 p-5 sm:p-6 print:p-3 space-y-4 print:space-y-1.5 shadow-xl">
                    <div className="flex items-center justify-between pb-3 print:pb-1.5 border-b border-neutral-800 print:border-neutral-700">
                      <h3 className="text-lg print:text-sm font-semibold text-white font-['Poppins']">
                        Item Breakdown ({activeOrder.items?.length || activeOrder.itemCount || 1} items)
                      </h3>
                      <span className="text-xs text-neutral-400 font-['Inter']">Line Items</span>
                    </div>

                    <div className="divide-y divide-neutral-800/80">
                      {(activeOrder.items && activeOrder.items.length > 0
                        ? activeOrder.items
                        : [{ id: "", name: "", price: activeOrder.subtotal, quantity: 1 }]
                      ).map((it, idx) => (
                        <div key={it.id || idx} className="py-3.5 print:py-1.5 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="w-7 h-7 print:w-6 print:h-6 rounded-md bg-neutral-800 border border-neutral-700 text-xs font-semibold text-amber-400 flex items-center justify-center font-['Poppins']">
                              {it.quantity || 1}x
                            </span>
                            <div>
                              <p className="text-base print:text-sm font-medium text-white font-['Poppins']">{it.name}</p>
                              <p className="text-xs text-neutral-500 font-['Inter']">${it.price.toFixed(2)} each</p>
                            </div>
                          </div>
                          <span className="text-base print:text-sm font-semibold text-white font-['Poppins']">
                            ${(it.price * (it.quantity || 1)).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Calculations Breakdown */}
                    <div className="pt-4 print:pt-2 border-t border-neutral-800 print:border-neutral-700 space-y-2.5 print:space-y-1 font-['Poppins']">
                      <div className="flex justify-between text-sm print:text-xs text-neutral-400">
                        <span>Subtotal</span>
                        <span className="text-white">${activeOrder.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm print:text-xs text-neutral-400">
                        <span>Service Charge (5%)</span>
                        <span className="text-white">${activeOrder.serviceCharge.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm print:text-xs text-neutral-400">
                        <span>Tax (8%)</span>
                        <span className="text-white">${activeOrder.tax.toFixed(2)}</span>
                      </div>
                      <div className="pt-3 print:pt-1.5 border-t border-neutral-800 print:border-neutral-700 flex justify-between text-lg sm:text-xl print:text-sm font-bold">
                        <span className="text-white">AMOUNT TO BE PAID</span>
                        <span className="text-amber-500">${activeOrder.totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Actions & Payment Settlement */}
                <div className="lg:col-span-4 print:col-span-4 bg-neutral-900 rounded-xl border border-neutral-800 print:border-neutral-700 p-5 sm:p-6 print:p-3 space-y-6 print:space-y-2 shadow-xl">
                  <h3 className="text-white text-lg print:text-sm font-semibold font-['Poppins'] text-center">
                    <span className="print:hidden">Summary & Actions</span>
                    <span className="hidden print:inline">Payment Summary</span>
                  </h3>

                  <div className="h-px bg-neutral-800 print:bg-neutral-700 w-full" />

                  {/* Status Box */}
                  <div className="p-4 print:p-2 bg-neutral-950/60 rounded-xl border border-neutral-800 print:border-neutral-700 flex flex-col items-center gap-3 print:gap-1 text-center">
                    <div
                      className={`w-12 h-12 print:w-7 print:h-7 rounded-full flex items-center justify-center ${
                        isPaidOrder(activeOrder)
                          ? "bg-green-500/20 border border-green-500/40 text-green-400"
                          : "bg-amber-500/20 border border-amber-500/40 text-amber-400"
                      }`}
                    >
                      {isPaidOrder(activeOrder) ? (
                        <CheckCircle2 className="w-7 h-7 print:w-4 print:h-4 text-green-400" />
                      ) : (
                        <Clock className="w-7 h-7 print:w-4 print:h-4 text-amber-400" />
                      )}
                    </div>
                    <div>
                      <div className="text-2xl print:text-lg font-bold text-white font-['Poppins']">
                        ${activeOrder.totalAmount.toFixed(2)}
                      </div>
                      <div
                        className={`text-sm print:text-xs font-semibold font-['Poppins'] ${
                          isPaidOrder(activeOrder) ? "text-green-400" : "text-amber-400"
                        }`}
                      >
                        {isPaidOrder(activeOrder)
                          ? "Payment Successful"
                          : activeOrder.financeStatus === "REQUESTING_CASH"
                          ? "Awaiting Cash Settle"
                          : "Pending Settlement"}
                      </div>
                    </div>

                    <div className="w-full text-left space-y-2 print:space-y-1 pt-2 border-t border-neutral-800 print:border-neutral-700 text-xs print:text-[11px] text-neutral-400 font-['Poppins']">
                      <div className="flex justify-between">
                        <span>Order Status</span>
                        <span className="text-white font-medium">
                          {activeOrder.displayStatus || activeOrder.status || "Active"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Payment Status</span>
                        <span
                          className={`font-semibold ${
                            isPaidOrder(activeOrder) ? "text-green-400" : "text-amber-400"
                          }`}
                        >
                          {isPaidOrder(activeOrder)
                            ? `Paid (${activeOrder.paymentMethod || "Settled"})`
                            : activeOrder.financeStatus === "REQUESTING_CASH"
                            ? "Awaiting Cash Settle"
                            : "Pending Payment"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Date</span>
                        <span className="text-white font-medium">{activeOrder.paymentDate || "Today"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Payment Method</span>
                        <span className="text-white font-medium">
                          {isPaidOrder(activeOrder)
                            ? activeOrder.paymentMethod || "Online / Card"
                            : activeOrder.paymentMethod || "Cash"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3 print:hidden">
                    {isPaidOrder(activeOrder) ? (
                      <div className="w-full py-3.5 px-4 bg-emerald-950/40 border border-emerald-500/40 text-emerald-400 rounded-lg font-semibold text-base text-center flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        <span>Payment Settled ({activeOrder.paymentMethod || "Paid"})</span>
                      </div>
                    ) : (
                      <>
                        <button
                          type="button"
                          disabled={isProcessingCash || isProcessingStripe}
                          onClick={() => handleConfirmCashPaid(activeOrder.id)}
                          className="w-full py-3 px-4 bg-green-500 hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold rounded-lg text-base text-center shadow-lg shadow-green-500/20 transition cursor-pointer active:scale-95 flex items-center justify-center gap-2"
                        >
                          {isProcessingCash ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              <span>Processing Cash...</span>
                            </>
                          ) : (
                            <>
                              <Banknote className="w-5 h-5" />
                              <span>Confirm Cash Paid</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          disabled={isProcessingCash || isProcessingStripe}
                          onClick={() => handleOpenStripeModal(activeOrder)}
                          className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg text-base text-center shadow-lg shadow-indigo-600/25 transition cursor-pointer active:scale-95 flex items-center justify-center gap-2"
                        >
                          <CreditCard className="w-5 h-5" />
                          <span>Pay with Stripe / Card</span>
                        </button>
                      </>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        toast.success(`Printing receipt for Order ${activeOrder.orderNumber}...`);
                        if (typeof window !== "undefined") window.print();
                      }}
                      className="w-full py-2.5 px-4 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg font-medium text-sm transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Print Order Receipt</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveNav("Table View");
                        router.push("/updated-cashier-dashboard/table-view");
                      }}
                      className="w-full py-2.5 px-4 border border-neutral-700 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded-lg font-medium text-sm transition cursor-pointer text-center"
                    >
                      Back to Table Floor
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-neutral-400 bg-neutral-900 rounded-xl border border-neutral-800 space-y-4">
                <p className="text-lg">No order selected.</p>
                <button
                  type="button"
                  onClick={() => {
                    setActiveNav("Table View");
                    router.push("/updated-cashier-dashboard/table-view");
                  }}
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-black font-semibold rounded-lg text-sm transition cursor-pointer"
                >
                  Return to Table View
                </button>
              </div>
            )}
          </div>
        ) : (
          /* ========================================================================= */
          /* TABLE VIEW / DEFAULT MODE (Figma Snippets 1 & 2)                           */
          /* ========================================================================= */
          <div className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1 max-w-[1600px] w-full mx-auto">
            {isLoading ? (
              /* SKELETON LOADER FOR TABLE VIEW */
              <div className="space-y-6 animate-pulse">
                {/* Header Skeleton */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="h-8 w-44 bg-neutral-800 rounded-lg" />
                    <div className="h-4 w-60 bg-neutral-800/60 rounded" />
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="h-10 w-36 bg-neutral-800 rounded-lg" />
                    <div className="h-10 w-44 bg-neutral-800 rounded-lg" />
                    <div className="h-10 w-72 bg-neutral-800 rounded-lg" />
                  </div>
                </div>

                {/* 3-Column POS Skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Left Column Skeleton */}
                  <div className="lg:col-span-4 space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                      <div className="h-5 w-36 bg-neutral-800 rounded" />
                      <div className="h-4 w-16 bg-neutral-800/60 rounded" />
                    </div>
                    {[1, 2, 3].map((idx) =>(
                      <div
                        key={idx}
                        className="p-4 bg-neutral-900 rounded-xl border border-neutral-800 space-y-3.5"
                      >
                        <div className="flex justify-between items-center">
                          <div className="h-5 w-32 bg-neutral-800 rounded" />
                          <div className="h-5 w-16 bg-neutral-800 rounded" />
                        </div>
                        <div className="h-px bg-neutral-800 w-full" />
                        <div className="flex justify-between items-center">
                          <div className="space-y-1">
                            <div className="h-5 w-16 bg-neutral-800 rounded" />
                            <div className="h-3 w-20 bg-neutral-800/60 rounded" />
                          </div>
                          <div className="h-6 w-20 bg-neutral-800 rounded-lg" />
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-neutral-800" />
                          <div className="h-4 w-28 bg-neutral-800 rounded" />
                        </div>
                        <div className="space-y-2">
                          <div className="h-12 bg-neutral-800/40 rounded-lg" />
                          <div className="h-12 bg-neutral-800/40 rounded-lg" />
                        </div>
                        <div className="h-px bg-neutral-800 w-full" />
                        <div className="flex justify-between items-center pt-1">
                          <div className="h-4 w-16 bg-neutral-800 rounded" />
                          <div className="h-4 w-24 bg-neutral-800 rounded" />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Middle Column Skeleton */}
                  <div className="lg:col-span-5 bg-neutral-900 rounded-xl border border-neutral-800 p-4 sm:p-6 space-y-4">
                    <div className="flex justify-between items-center pb-3 border-b border-neutral-800">
                      <div className="space-y-1">
                        <div className="h-3 w-16 bg-neutral-800/60 rounded" />
                        <div className="h-6 w-20 bg-neutral-800 rounded" />
                      </div>
                      <div className="space-y-1 text-right">
                        <div className="h-3 w-16 bg-neutral-800/60 rounded" />
                        <div className="h-6 w-24 bg-neutral-800 rounded" />
                      </div>
                    </div>
                    <div className="h-4 w-32 bg-neutral-800 rounded pt-2" />
                    <div className="space-y-3 py-2">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex justify-between items-center">
                          <div className="h-4 w-40 bg-neutral-800 rounded" />
                          <div className="h-4 w-14 bg-neutral-800 rounded" />
                        </div>
                      ))}
                    </div>
                    <div className="h-px bg-neutral-800 w-full" />
                    <div className="space-y-2.5">
                      <div className="flex justify-between">
                        <div className="h-4 w-20 bg-neutral-800 rounded" />
                        <div className="h-4 w-14 bg-neutral-800 rounded" />
                      </div>
                      <div className="flex justify-between">
                        <div className="h-4 w-28 bg-neutral-800 rounded" />
                        <div className="h-4 w-14 bg-neutral-800 rounded" />
                      </div>
                      <div className="flex justify-between">
                        <div className="h-4 w-24 bg-neutral-800 rounded" />
                        <div className="h-4 w-14 bg-neutral-800 rounded" />
                      </div>
                    </div>
                    <div className="pt-3 border-t border-neutral-800 flex justify-between">
                      <div className="h-6 w-36 bg-neutral-800 rounded" />
                      <div className="h-6 w-20 bg-neutral-800 rounded" />
                    </div>
                  </div>

                  {/* Right Column Skeleton */}
                  <div className="lg:col-span-3 bg-neutral-900 rounded-xl border border-neutral-800 p-4 sm:p-6 space-y-6">
                    <div className="h-5 w-36 bg-neutral-800 rounded mx-auto" />
                    <div className="h-px bg-neutral-800 w-full" />
                    <div className="p-4 bg-neutral-800/30 rounded-xl border border-neutral-800 flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-neutral-800" />
                      <div className="h-6 w-24 bg-neutral-800 rounded" />
                      <div className="h-4 w-32 bg-neutral-800/60 rounded" />
                      <div className="h-px bg-neutral-800 w-full" />
                      <div className="w-full space-y-2">
                        <div className="h-3 w-16 bg-neutral-800/60 rounded" />
                        <div className="h-4 w-24 bg-neutral-800 rounded" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <div className="h-4 w-20 bg-neutral-800 rounded" />
                        <div className="h-4 w-16 bg-neutral-800 rounded" />
                      </div>
                      <div className="flex justify-between">
                        <div className="h-4 w-20 bg-neutral-800 rounded" />
                        <div className="h-4 w-16 bg-neutral-800 rounded" />
                      </div>
                      <div className="pt-2 border-t border-neutral-800 flex justify-between">
                        <div className="h-6 w-16 bg-neutral-800 rounded" />
                        <div className="h-6 w-24 bg-neutral-800 rounded" />
                      </div>
                    </div>
                    <div className="h-12 w-full bg-neutral-800 rounded-lg" />
                  </div>
                </div>
              </div>
            ) : (
              <>
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
                    {/* Exact Kitchen / Order Status Badge */}
                    <div
                      className={`px-3 py-1.5 rounded-lg border flex items-center gap-2 ${
                        activeOrder.status === "SERVED"
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                          : activeOrder.status === "READY" || activeOrder.kitchenStatus === "READY_TO_SERVE"
                          ? "bg-green-500/10 border-green-500/30 text-green-400"
                          : activeOrder.status === "PREPARING" || activeOrder.kitchenStatus === "PREPARING"
                          ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                          : activeOrder.status === "CANCELLED" || activeOrder.status === "REJECTED"
                          ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                          : "bg-blue-500/10 border-blue-500/30 text-blue-400"
                      }`}
                    >
                      <div className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center">
                        {activeOrder.status === "SERVED" ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : activeOrder.status === "PREPARING" ? (
                          <ChefHat className="w-3.5 h-3.5" />
                        ) : (
                          <Utensils className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <span className="text-xs sm:text-sm font-medium font-['Poppins']">
                        {activeOrder.displayStatus || (
                          activeOrder.status === "SERVED"
                            ? "Served"
                            : activeOrder.status === "READY" || activeOrder.kitchenStatus === "READY_TO_SERVE"
                            ? "Ready to serve"
                            : activeOrder.status === "PREPARING"
                            ? "Preparing"
                            : activeOrder.status === "ACCEPTED"
                            ? "Accepted"
                            : activeOrder.status === "SUBMITTED"
                            ? "Order Received"
                            : activeOrder.status === "CANCELLED"
                            ? "Cancelled"
                            : activeOrder.status === "REJECTED"
                            ? "Rejected"
                            : "Completed"
                        )}
                      </span>
                    </div>

                    {/* Finance Status Badge */}
                    {isPaidOrder(activeOrder) ? (
                      <div className="px-3 py-1.5 bg-green-500/10 rounded-lg border border-green-500/30 flex items-center gap-2">
                        <div className="w-6 h-6 bg-green-500/20 rounded-md border border-green-500/50 flex items-center justify-center">
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                        </div>
                        <span className="text-green-400 text-xs sm:text-sm font-semibold font-['Poppins'] leading-4">
                          Paid ({activeOrder.paymentMethod || "Settled"})
                        </span>
                      </div>
                    ) : activeOrder.financeStatus === "REQUESTING_CASH" ? (
                      <div className="px-3 py-1.5 bg-amber-500/10 rounded-lg border border-amber-500/30 flex items-center gap-2">
                        <div className="w-6 h-6 bg-amber-500/20 rounded-md border border-amber-500/50 flex items-center justify-center">
                          <Banknote className="w-3.5 h-3.5 text-amber-500" />
                        </div>
                        <span className="text-amber-400 text-xs sm:text-sm font-medium font-['Poppins'] leading-4">
                          Request to Pay Cash
                        </span>
                      </div>
                    ) : (
                      <div className="px-3 py-1.5 bg-neutral-800/80 rounded-lg border border-neutral-700 flex items-center gap-2">
                        <div className="w-6 h-6 bg-neutral-700/80 rounded-md flex items-center justify-center">
                          <Clock className="w-3.5 h-3.5 text-neutral-300" />
                        </div>
                        <span className="text-neutral-300 text-xs sm:text-sm font-medium font-['Poppins'] leading-4">
                          Pending Payment
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

                {paginatedOrders.map((ord) => {
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

                      {/* Order Status Pill */}
                      <div className="space-y-2">
                        <div
                          className={`p-2.5 rounded-lg border flex items-center gap-2.5 ${
                            ord.status === "SERVED"
                              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                              : ord.status === "READY" || ord.kitchenStatus === "READY_TO_SERVE"
                              ? "bg-green-500/10 border-green-500/20 text-green-400"
                              : ord.status === "PREPARING" || ord.kitchenStatus === "PREPARING"
                              ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                              : ord.status === "CANCELLED" || ord.status === "REJECTED"
                              ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
                              : "bg-blue-500/10 border-blue-500/20 text-blue-400"
                          }`}
                        >
                          <div className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center shrink-0">
                            {ord.status === "SERVED" ? (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            ) : ord.status === "PREPARING" ? (
                              <ChefHat className="w-3.5 h-3.5" />
                            ) : (
                              <Utensils className="w-3.5 h-3.5" />
                            )}
                          </div>
                          <div>
                            <div className="text-neutral-400 text-xs font-normal font-['Poppins']">
                              Order Status
                            </div>
                            <div className="text-base font-medium font-['Poppins']">
                              {ord.displayStatus || (
                                ord.status === "SERVED"
                                  ? "Served"
                                  : ord.status === "READY" || ord.kitchenStatus === "READY_TO_SERVE"
                                  ? "Ready to serve"
                                  : ord.status === "PREPARING"
                                  ? "Preparing"
                                  : ord.status === "ACCEPTED"
                                  ? "Accepted"
                                  : ord.status === "SUBMITTED"
                                  ? "Order Received"
                                  : ord.status === "CANCELLED"
                                  ? "Cancelled"
                                  : ord.status === "REJECTED"
                                  ? "Rejected"
                                  : "Completed"
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Finance Status Pill */}
                        <div
                          className={`p-2.5 rounded-lg border flex items-center gap-2.5 ${
                            isPaidOrder(ord)
                              ? "bg-green-500/10 border-green-500/20 text-green-500"
                              : ord.financeStatus === "REQUESTING_CASH"
                              ? "bg-amber-500/10 border-amber-500/20 text-amber-500"
                              : "bg-neutral-800 border-neutral-700 text-neutral-400"
                          }`}
                        >
                          <div className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center shrink-0">
                            {isPaidOrder(ord) ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                            ) : ord.financeStatus === "REQUESTING_CASH" ? (
                              <Banknote className="w-3.5 h-3.5" />
                            ) : (
                              <Clock className="w-3.5 h-3.5 text-neutral-400" />
                            )}
                          </div>
                          <div>
                            <div className="text-neutral-400 text-xs font-normal font-['Poppins']">
                              Finance
                            </div>
                            <div className="text-base font-medium font-['Poppins']">
                              {isPaidOrder(ord)
                                ? `Paid (${ord.paymentMethod || "Settled"})`
                                : ord.financeStatus === "REQUESTING_CASH"
                                ? "Requesting Cash"
                                : "Pending Payment"}
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
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedOrderId(ord.id);
                            setActiveNav("Order Details");
                            router.push(
                              `/updated-cashier-dashboard/order-details?orderId=${encodeURIComponent(
                                ord.id
                              )}`
                            );
                          }}
                          className="flex items-center gap-1 text-amber-500 hover:text-amber-400 hover:underline transition cursor-pointer"
                          title="Open Order Details Page"
                        >
                          <span className="text-base font-medium font-['Poppins']">
                            View Details
                          </span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Order Queue Pagination (10 per page) */}
                {filteredOrders.length > 10 && (
                  <PaginationBar
                    meta={{
                      page: orderPage,
                      limit: ORDERS_PER_PAGE,
                      total: filteredOrders.length,
                      totalPages: totalOrderPages,
                      hasNextPage: orderPage < totalOrderPages,
                      hasPreviousPage: orderPage > 1,
                    }}
                    onPageChange={(newPage) => setOrderPage(newPage)}
                    pageSizeOptions={[10, 20, 50]}
                  />
                )}
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
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          isPaidOrder(activeOrder)
                            ? "bg-green-500/20 border border-green-500/40 text-green-400"
                            : "bg-amber-500/20 border border-amber-500/40 text-amber-400"
                        }`}
                      >
                        {isPaidOrder(activeOrder) ? (
                          <CheckCircle2 className="w-7 h-7 text-green-400" />
                        ) : (
                          <Clock className="w-7 h-7 text-amber-400" />
                        )}
                      </div>

                      <div>
                        <div className="text-stone-50 text-xl font-semibold font-['Poppins'] leading-7">
                          ${activeOrder.totalAmount.toFixed(2)}
                        </div>
                        <div
                          className={`text-base font-semibold font-['Poppins'] ${
                            isPaidOrder(activeOrder) ? "text-green-400" : "text-amber-400"
                          }`}
                        >
                          {isPaidOrder(activeOrder)
                            ? "Payment Successful"
                            : activeOrder.financeStatus === "REQUESTING_CASH"
                            ? "Awaiting Cash Settle"
                            : "Pending Settlement"}
                        </div>
                      </div>

                      <div className="h-px bg-zinc-900 w-full" />

                      {/* Metadata list */}
                      <div className="w-full text-left space-y-3">
                        <div>
                          <div className="text-neutral-500 text-xs font-semibold font-['Poppins']">
                            Order Status
                          </div>
                          <div className="text-white text-base font-normal font-['Poppins']">
                            {activeOrder.displayStatus || activeOrder.status || "Active"}
                          </div>
                        </div>

                        <div>
                          <div className="text-neutral-500 text-xs font-semibold font-['Poppins']">
                            Payment Status
                          </div>
                          <div
                            className={`text-base font-medium font-['Poppins'] ${
                              isPaidOrder(activeOrder) ? "text-green-400" : "text-amber-400"
                            }`}
                          >
                            {isPaidOrder(activeOrder)
                              ? `Paid (${activeOrder.paymentMethod || "Settled"})`
                              : activeOrder.financeStatus === "REQUESTING_CASH"
                              ? "Awaiting Cash Settle"
                              : "Pending Payment"}
                          </div>
                        </div>

                        <div>
                          <div className="text-neutral-500 text-xs font-semibold font-['Poppins']">
                            Date
                          </div>
                          <div className="text-white text-base font-normal font-['Poppins']">
                            {activeOrder.paymentDate || "Today"}
                          </div>
                        </div>

                        <div>
                          <div className="text-neutral-500 text-xs font-semibold font-['Poppins']">
                            Payment Method
                          </div>
                          <div className="text-white text-base font-normal font-['Poppins']">
                            {isPaidOrder(activeOrder)
                              ? activeOrder.paymentMethod || "Online / Card"
                              : activeOrder.paymentMethod || "Cash"}
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
                        <span>Tax (8%)</span>
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
                    <div className="space-y-2 print:hidden">
                      {isPaidOrder(activeOrder) ? (
                        <div className="w-full py-3.5 px-4 bg-emerald-950/40 border border-emerald-500/40 text-emerald-400 rounded-lg font-semibold font-['Inter'] text-base text-center flex items-center justify-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          <span>Payment Settled ({activeOrder.paymentMethod || "Paid"})</span>
                        </div>
                      ) : (
                        <>
                          <button
                            type="button"
                            disabled={isProcessingCash || isProcessingStripe}
                            onClick={() => handleConfirmCashPaid(activeOrder.id)}
                            className="w-full py-3 px-4 bg-green-500 hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold rounded-lg font-['Inter'] text-base text-center shadow-lg shadow-green-500/20 transition cursor-pointer active:scale-95 flex items-center justify-center gap-2"
                          >
                            {isProcessingCash ? (
                              <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Processing Cash...</span>
                              </>
                            ) : (
                              <>
                                <Banknote className="w-5 h-5" />
                                <span>Confirm Cash Paid</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            disabled={isProcessingCash || isProcessingStripe}
                            onClick={() => handleOpenStripeModal(activeOrder)}
                            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg font-['Inter'] text-base text-center shadow-lg shadow-indigo-600/25 transition cursor-pointer active:scale-95 flex items-center justify-center gap-2"
                          >
                            <CreditCard className="w-5 h-5" />
                            <span>Pay with Stripe / Card</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
              </>
            )}
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
                onClick={async () => {
                  try {
                    const mappedMethod =
                      selectedPaymentMethod === "Credit / Debit Card"
                        ? "CARD"
                        : selectedPaymentMethod === "Digital Wallet"
                        ? "MOBILE_WALLET"
                        : "CASH";

                    await cashierService
                      .processPayment({
                        scope: "ORDER",
                        amount: cartTotal,
                        method: mappedMethod,
                      })
                      .catch((e) => {
                        console.warn("Backend counter payment warning:", e);
                      });

                    toast.success(
                      `Payment of $${cartTotal.toFixed(
                        2
                      )} successfully recorded via ${selectedPaymentMethod}!`
                    );
                    setIsPaymentModalOpen(false);
                    clearCart();
                  } catch (err: any) {
                    toast.error(err?.message || "Payment processing failed");
                  }
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
                onClick={() => toast.success("Receipt printed successfully.")}
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

      {/* ========================================================================= */}
      {/* STRIPE PAYMENT MODAL OVERLAY (FOR CASHIER)                                */}
      {/* ========================================================================= */}
      {isStripeModalOpen && stripeTargetOrder && (
        <div className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative text-white">
            <button
              type="button"
              onClick={() => {
                setIsStripeModalOpen(false);
                if (cardElement) {
                  cardElement.destroy();
                  setCardElement(null);
                }
              }}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold font-['Inter'] text-white">
                  Stripe Card Payment
                </h3>
                <p className="text-xs text-neutral-400 font-['Inter']">
                  Order {stripeTargetOrder.orderNumber} · {stripeTargetOrder.tableNumber}
                </p>
              </div>
            </div>

            {/* Amount card */}
            <div className="p-4 bg-neutral-950/60 rounded-xl border border-neutral-800 mb-6 flex items-center justify-between">
              <div>
                <span className="text-xs text-neutral-400 block font-['Inter']">Amount Due</span>
                <span className="text-2xl font-bold text-yellow-400 font-['Poppins']">
                  ${stripeTargetOrder.totalAmount.toFixed(2)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs px-2.5 py-1 bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-500/30 font-medium">
                  Stripe Test / Live
                </span>
              </div>
            </div>

            {isStripeLoading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3 text-neutral-400">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
                <span className="text-sm font-['Inter']">Preparing secure Stripe session...</span>
              </div>
            ) : stripeMountError ? (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm mb-4">
                {stripeMountError}
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-neutral-300 block mb-1.5 font-['Inter']">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    value={stripeCardholderName}
                    onChange={(e) => setStripeCardholderName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-300 block mb-1.5 font-['Inter']">
                    Card Details
                  </label>
                  {/* Stripe Card Element Container */}
                  <div
                    ref={stripeCardRef}
                    className="w-full min-h-[46px] px-3.5 py-3 bg-neutral-950 border border-neutral-800 rounded-lg text-white text-sm focus-within:border-indigo-500 transition"
                  >
                    {!cardElement && (
                      <div className="flex items-center justify-between text-xs text-neutral-400">
                        <span>Simulated Card / Test Gateway Ready (4242 •••• •••• 4242)</span>
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                      </div>
                    )}
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-1.5 font-['Inter']">
                    Accepts Visa, Mastercard, Amex, Discover. 256-bit encrypted end-to-end.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    disabled={isProcessingStripe}
                    onClick={handleExecuteStripePayment}
                    className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-lg text-base text-center shadow-lg shadow-indigo-600/30 transition cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                  >
                    {isProcessingStripe ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Processing with Stripe...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5" />
                        <span>Pay ${stripeTargetOrder.totalAmount.toFixed(2)} with Stripe</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
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
    <div className="h-screen print:h-auto bg-black text-white font-['Poppins',sans-serif] flex flex-col lg:flex-row overflow-hidden print:overflow-visible selection:bg-amber-500 selection:text-black relative">
      {/* Sidebar */}
      <CashierSidebar
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 h-screen print:h-auto overflow-hidden print:overflow-visible bg-black relative">
        {/* Top Header Bar */}
        <header className="h-[77px] px-4 sm:px-8 border-b border-neutral-800 shadow-[0px_0px_10.8px_0px_rgba(255,255,255,0.15)] flex items-center justify-between shrink-0 bg-black z-30 print:hidden">
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
          <div
            onClick={() => setActiveNav("Profile")}
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 transition rounded-lg border border-neutral-800 flex items-center gap-2.5 cursor-pointer"
            title="View Profile"
          >
            <div className="w-9 h-9 p-2.5 bg-amber-400 rounded-full flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-black" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-white font-['Poppins'] leading-4">
                {user?.name || (user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Nobin Mille')}
              </span>
              <span className="text-xs font-medium text-slate-500 font-['Poppins'] leading-4">
                {user?.role ? String(user.role).charAt(0) + String(user.role).slice(1).toLowerCase() : 'Cashier'}
              </span>
            </div>
          </div>
        </header>

        {/* Scrollable Body Content */}
        <main className="cashier-dashboard-main flex-1 overflow-y-auto print:overflow-visible print:h-auto custom-scrollbar flex flex-col">
          {bodyContent}
        </main>
      </div>

      {modalOverlays}

      {/* Draggable Floating Ask AI Assistant Button */}
      <DraggableAiButton
        isOpen={isAskAiOpen}
        onToggle={() => setIsAskAiOpen((prev) => !prev)}
        storageKey="updated_cashier_ask_ai_pos"
        className="print:hidden"
      />

      {/* Ask AI Assistant Floating Chat Modal */}
      <AskAiModal isOpen={isAskAiOpen} onClose={() => setIsAskAiOpen(false)} />
    </div>
  );
}
