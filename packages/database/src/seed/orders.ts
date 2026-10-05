import { daysAgo, minutesAgo, priceOrder, uid } from './constants';
import type { FloorContext } from './floor';
import type { IdentityContext } from './identity';
import type { MenuContext } from './menu';
import { one, schema, type Tx } from './types';

type OrderStatus = (typeof schema.orderStatusEnum.enumValues)[number];
type ItemStatus = (typeof schema.orderItemStatusEnum.enumValues)[number];
type PaymentStatus = (typeof schema.paymentStatusEnum.enumValues)[number];

export interface SeededOrderRef {
  orderId: string;
  orderNumber: string;
  tableLabel: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  subtotal: number;
  taxAmount: number;
  serviceCharge: number;
  createdAt: Date;
  paidAt?: Date;
  lineItemIds: string[];
}

export type OrdersContext = Record<string, SeededOrderRef>;

export const seedOrders = async (
  tx: Tx,
  id: IdentityContext,
  floor: FloorContext,
  menu: MenuContext,
  now: Date,
): Promise<OrdersContext> => {
  const ordersMap: OrdersContext = {};
  let orderSeq = 0;

  const createOrder = async (opts: {
    orderNumber: string;
    tableKey: string;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    createdAt: Date;
    acceptedMinsAgo?: number;
    guestName?: string;
    specialInstructions?: string;
    discountAmount?: number;
    resubmittedFromId?: string;
    rejectionReason?: string;
    rejectionReasonCode?: (typeof schema.orderRejectionReasonEnum.enumValues)[number];
    items: {
      itemKey: string;
      qty: number;
      status: ItemStatus;
      prepMinsAgo?: number;
      readyMinsAgo?: number;
      servedMinsAgo?: number;
    }[];
  }): Promise<SeededOrderRef> => {
    orderSeq += 1;
    const table = floor[opts.tableKey];
    if (!table) throw new Error(`Unknown table key: ${opts.tableKey}`);

    const lines = opts.items.map((i) => {
      const m = menu[i.itemKey];
      if (!m) throw new Error(`Unknown menu item ${i.itemKey}`);
      return { unitPrice: m.price, quantity: i.qty };
    });

    const pricing = priceOrder(lines, opts.discountAmount || 0);
    const guest = table.guests[0];
    const customerId = guest?.customerId || null;

    const orderRow = one(
      await tx
        .insert(schema.orders)
        .values({
          id: uid(30, orderSeq),
          orderNumber: opts.orderNumber,
          branchId: id.branchId,
          tableId: table.tableId,
          customerId,
          tableSessionId: table.sessionId,
          guestSessionId: guest?.id || null,
          channel: 'DINE_IN',
          status: opts.status,
          subtotal: pricing.subtotal,
          discountAmount: pricing.discountAmount,
          taxAmount: pricing.taxAmount,
          serviceCharge: pricing.serviceCharge,
          totalAmount: pricing.totalAmount,
          paymentStatus: opts.paymentStatus,
          amountPaid: opts.paymentStatus === 'PAID' ? pricing.totalAmount : 0,
          acceptanceMode: 'WAITER_APPROVAL',
          waiterAssignmentId: table.waiterAssignmentId,
          acceptedById: opts.acceptedMinsAgo ? table.waiter?.staffId : null,
          acceptedAt: opts.acceptedMinsAgo ? minutesAgo(now, opts.acceptedMinsAgo) : null,
          rejectedById: opts.rejectionReasonCode ? table.waiter?.staffId : null,
          rejectedAt: opts.rejectionReasonCode ? minutesAgo(now, 25) : null,
          rejectionReasonCode: opts.rejectionReasonCode,
          rejectionReason: opts.rejectionReason,
          guestName: opts.guestName || guest?.name || 'Table Guest',
          specialInstructions: opts.specialInstructions,
          resubmittedFromId: opts.resubmittedFromId,
          createdAt: opts.createdAt,
          updatedAt: opts.createdAt,
        })
        .returning(),
      `order ${opts.orderNumber}`,
    );

    const lineItemIds: string[] = [];
    for (const [idx, item] of opts.items.entries()) {
      const m = menu[item.itemKey];
      if (!m) throw new Error(`Unknown menu item ${item.itemKey}`);
      const itemSubtotal = m.price * item.qty;
      const itemRow = one(
        await tx
          .insert(schema.orderItems)
          .values({
            id: uid(31, orderSeq * 100 + idx),
            orderId: orderRow.id,
            productId: m.id,
            productNameSnapshot: m.name,
            unitPrice: m.price,
            quantity: item.qty,
            subtotal: itemSubtotal,
            stationType: m.station,
            status: item.status,
            preparingAt: item.prepMinsAgo ? minutesAgo(now, item.prepMinsAgo) : null,
            readyAt: item.readyMinsAgo ? minutesAgo(now, item.readyMinsAgo) : null,
            servedAt: item.servedMinsAgo ? minutesAgo(now, item.servedMinsAgo) : null,
            createdAt: opts.createdAt,
            updatedAt: opts.createdAt,
          })
          .returning(),
        `item ${m.name} for ${opts.orderNumber}`,
      );
      lineItemIds.push(itemRow.id);

      // Status change logs
      await tx.insert(schema.orderItemStatusChangeLogs).values({
        orderItemId: itemRow.id,
        previousStatus: 'PENDING',
        newStatus: item.status,
        changedById: table.waiter?.userId || id.manager.userId,
        createdAt: opts.createdAt,
      });
    }

    // Order status change logs
    await tx.insert(schema.statusChangeLogs).values({
      orderId: orderRow.id,
      previousStatus: 'DRAFT',
      newStatus: opts.status,
      changedById: table.waiter?.userId || id.manager.userId,
      createdAt: opts.createdAt,
    });

    const ref: SeededOrderRef = {
      orderId: orderRow.id,
      orderNumber: opts.orderNumber,
      tableLabel: opts.tableKey,
      status: opts.status,
      paymentStatus: opts.paymentStatus,
      totalAmount: pricing.totalAmount,
      subtotal: pricing.subtotal,
      taxAmount: pricing.taxAmount,
      serviceCharge: pricing.serviceCharge,
      createdAt: opts.createdAt,
      paidAt: opts.paymentStatus === 'PAID' ? opts.createdAt : undefined,
      lineItemIds,
    };
    ordersMap[opts.orderNumber] = ref;
    return ref;
  };

  // 1. ORD-1001 on T-01: status PENDING (Awaiting Waiter Approval)
  await createOrder({
    orderNumber: 'ORD-1001',
    tableKey: 'T-01',
    status: 'PENDING',
    paymentStatus: 'UNPAID',
    createdAt: minutesAgo(now, 10),
    guestName: 'Sarah Jenkins',
    specialInstructions: 'Extra napkins please',
    items: [
      { itemKey: 'burger', qty: 2, status: 'PENDING' },
      { itemKey: 'lemonade', qty: 2, status: 'PENDING' },
    ],
  });

  // 2. ORD-1002 on T-03: status PREPARING (Mixed stations matching TableDetailView Figma: Grill Ready, Cold Preparing, Bar Ready)
  await createOrder({
    orderNumber: 'ORD-1002',
    tableKey: 'T-03',
    status: 'PREPARING',
    paymentStatus: 'UNPAID',
    createdAt: minutesAgo(now, 35),
    acceptedMinsAgo: 30,
    guestName: 'Alex Morgan',
    items: [
      { itemKey: 'chicken', qty: 1, status: 'READY', prepMinsAgo: 28, readyMinsAgo: 5 }, // Grill Station (Ready)
      { itemKey: 'caesar', qty: 1, status: 'PREPARING', prepMinsAgo: 25 }, // Cold Station (Preparing)
      { itemKey: 'mojito', qty: 2, status: 'READY', prepMinsAgo: 28, readyMinsAgo: 10 }, // Bar Station (Ready)
    ],
  });

  // 3. ORD-1003 on T-04: status READY (All items ready to serve / Bill requested)
  await createOrder({
    orderNumber: 'ORD-1003',
    tableKey: 'T-04',
    status: 'READY',
    paymentStatus: 'UNPAID',
    createdAt: minutesAgo(now, 50),
    acceptedMinsAgo: 45,
    guestName: 'Michael Scott',
    items: [
      { itemKey: 'salmon', qty: 2, status: 'READY', prepMinsAgo: 40, readyMinsAgo: 8 },
      { itemKey: 'oldfashioned', qty: 2, status: 'READY', prepMinsAgo: 40, readyMinsAgo: 12 },
    ],
  });

  // 4. ORD-1004 on T-05: status SERVED (Dining, unpaid)
  await createOrder({
    orderNumber: 'ORD-1004',
    tableKey: 'T-05',
    status: 'SERVED',
    paymentStatus: 'UNPAID',
    createdAt: minutesAgo(now, 50),
    acceptedMinsAgo: 45,
    guestName: 'Pam Beesly',
    items: [
      { itemKey: 'pasta', qty: 2, status: 'SERVED', prepMinsAgo: 40, readyMinsAgo: 20, servedMinsAgo: 15 },
      { itemKey: 'pellegrino', qty: 2, status: 'SERVED', prepMinsAgo: 40, readyMinsAgo: 35, servedMinsAgo: 30 },
    ],
  });

  // 5. ORD-1005 on T-07: status PREPARING running late (45m ago, for Manager "Need Attention")
  await createOrder({
    orderNumber: 'ORD-1005',
    tableKey: 'T-07',
    status: 'PREPARING',
    paymentStatus: 'UNPAID',
    createdAt: minutesAgo(now, 48),
    acceptedMinsAgo: 45,
    guestName: 'Dwight Schrute',
    items: [
      { itemKey: 'ribeye', qty: 2, status: 'PREPARING', prepMinsAgo: 42 },
      { itemKey: 'oldfashioned', qty: 2, status: 'READY', prepMinsAgo: 42, readyMinsAgo: 20 },
    ],
  });

  // 6. ORD-1006 on T-09: status SERVED (Partially paid split bill)
  await createOrder({
    orderNumber: 'ORD-1006',
    tableKey: 'T-09',
    status: 'SERVED',
    paymentStatus: 'PARTIALLY_PAID',
    createdAt: minutesAgo(now, 90),
    acceptedMinsAgo: 80,
    guestName: 'Sarah Jenkins',
    items: [
      { itemKey: 'salmon', qty: 1, status: 'SERVED', prepMinsAgo: 70, readyMinsAgo: 50, servedMinsAgo: 45 },
      { itemKey: 'pasta', qty: 1, status: 'SERVED', prepMinsAgo: 70, readyMinsAgo: 50, servedMinsAgo: 45 },
      { itemKey: 'mojito', qty: 2, status: 'SERVED', prepMinsAgo: 70, readyMinsAgo: 60, servedMinsAgo: 55 },
    ],
  });

  // 7. ORD-1007 on T-11: status REJECTED (Out of stock reason)
  const rejected = await createOrder({
    orderNumber: 'ORD-1007',
    tableKey: 'T-11',
    status: 'REJECTED',
    paymentStatus: 'UNPAID',
    createdAt: minutesAgo(now, 30),
    guestName: 'Angela Martin',
    rejectionReasonCode: 'ITEM_UNAVAILABLE',
    rejectionReason: 'Kitchen ran out of fresh salmon fillet for tonight',
    items: [
      { itemKey: 'calamari', qty: 1, status: 'UNAVAILABLE' },
    ],
  });

  // 8. ORD-1008 on T-11: status PENDING (Resubmitted from ORD-1007)
  await createOrder({
    orderNumber: 'ORD-1008',
    tableKey: 'T-11',
    status: 'PENDING',
    paymentStatus: 'UNPAID',
    createdAt: minutesAgo(now, 15),
    guestName: 'Angela Martin',
    resubmittedFromId: rejected.orderId,
    specialInstructions: 'Replacement order for rejected calamari',
    items: [
      { itemKey: 'bruschetta', qty: 1, status: 'PENDING' },
      { itemKey: 'pasta', qty: 1, status: 'PENDING' },
    ],
  });

  // 9. Historical Completed Orders (ORD-0901 to ORD-0914) over the past 7 days for KPIs and Reports
  const histTemplates = [
    { items: [{ itemKey: 'burger', qty: 2 }, { itemKey: 'lemonade', qty: 2 }] },
    { items: [{ itemKey: 'ribeye', qty: 1 }, { itemKey: 'oldfashioned', qty: 2 }] },
    { items: [{ itemKey: 'salmon', qty: 2 }, { itemKey: 'pellegrino', qty: 1 }] },
    { items: [{ itemKey: 'pasta', qty: 1 }, { itemKey: 'lava', qty: 1 }] },
  ];

  for (let d = 1; d <= 7; d++) {
    for (let h = 0; h < 2; h++) {
      const idx = (d - 1) * 2 + h + 1;
      const numStr = String(idx).padStart(2, '0');
      const orderNum = `ORD-09${numStr}`;
      const tmpl = histTemplates[(d + h) % histTemplates.length]!;
      const orderTime = daysAgo(now, d, 12 + h * 6);

      await createOrder({
        orderNumber: orderNum,
        tableKey: `T-0${((d + h) % 5) + 1}`,
        status: 'COMPLETED',
        paymentStatus: 'PAID',
        createdAt: orderTime,
        acceptedMinsAgo: 0,
        guestName: d % 2 === 0 ? 'Sarah Jenkins' : 'Loyal Guest',
        items: tmpl.items.map((it) => ({
          itemKey: it.itemKey,
          qty: it.qty,
          status: 'SERVED',
        })),
      });
    }
  }

  // 10. ORD-0921: CANCELLED order
  await createOrder({
    orderNumber: 'ORD-0921',
    tableKey: 'T-02',
    status: 'CANCELLED',
    paymentStatus: 'UNPAID',
    createdAt: daysAgo(now, 1, 15),
    guestName: 'Guest Walkout',
    items: [{ itemKey: 'burger', qty: 1, status: 'CANCELLED' }],
  });

  console.log(`📦 Seeded ${Object.keys(ordersMap).length} orders across all lifecycle states`);
  return ordersMap;
};
