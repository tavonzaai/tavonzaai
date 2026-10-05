import { daysAgo, minutesAgo, uid } from './constants';
import type { FloorContext } from './floor';
import type { IdentityContext } from './identity';
import type { OrdersContext } from './orders';
import { one, schema, type Tx } from './types';

type PaymentMethod = (typeof schema.paymentMethodEnum.enumValues)[number];

export const seedBilling = async (
  tx: Tx,
  id: IdentityContext,
  floor: FloorContext,
  orders: OrdersContext,
  now: Date,
) => {
  // 1. Discounts
  await tx.insert(schema.discounts).values([
    {
      id: uid(40, 1),
      code: 'WELCOME10',
      type: 'PERCENTAGE',
      value: 10.0,
      isActive: true,
      validFrom: daysAgo(now, 30),
      validUntil: daysAgo(now, -60),
      timesUsed: 15,
    },
    {
      id: uid(40, 2),
      code: 'FLAT5',
      type: 'FIXED_AMOUNT',
      value: 5.0,
      isActive: true,
      validFrom: daysAgo(now, 30),
      validUntil: daysAgo(now, -60),
      timesUsed: 8,
    },
    {
      id: uid(40, 3),
      code: 'VIP20',
      type: 'PERCENTAGE',
      value: 20.0,
      isActive: true,
      validFrom: daysAgo(now, 30),
      validUntil: daysAgo(now, -60),
      timesUsed: 4,
    },
  ]);

  // 2. Payments & Allocations
  let paySeq = 0;
  const methods: PaymentMethod[] = ['CARD', 'CASH', 'MOBILE_WALLET'];

  // Historical completed orders (ORD-0901 ... ORD-0914) -> fully paid
  for (let i = 1; i <= 14; i++) {
    const numStr = `ORD-09${String(i).padStart(2, '0')}`;
    const ord = orders[numStr];
    if (!ord) continue;

    paySeq += 1;
    const method: PaymentMethod = methods[i % methods.length] ?? 'CARD';
    const payTime = ord.createdAt;

    const payment = one(
      await tx
        .insert(schema.payments)
        .values({
          id: uid(41, paySeq),
          orderId: ord.orderId,
          scope: 'ORDER',
          amount: ord.totalAmount,
          tipAmount: i % 2 === 0 ? 5.0 : 0,
          method,
          status: 'PAID',
          transactionRef: `TXN-${100000 + paySeq}`,
          paidAt: payTime,
          settledById: id.cashier.staffId,
          collectedById: id.waiters.david.staffId,
          createdAt: payTime,
        })
        .returning(),
      `payment for ${numStr}`,
    );

    // Allocation
    await tx.insert(schema.paymentAllocations).values({
      id: uid(42, paySeq),
      paymentId: payment.id,
      orderId: ord.orderId,
      amount: ord.totalAmount,
      createdAt: payTime,
    });
  }

  // ORD-1006 on T-09: Partial payment (Jordan paid $30 towards bill)
  const ord1006 = orders['ORD-1006'];
  if (ord1006) {
    paySeq += 1;
    const partialAmount = 30.0;
    const table9 = floor['T-09'];
    const jordanGuest = table9?.guests.find((g) => g.name === 'Jordan Lee');

    const pPart = one(
      await tx
        .insert(schema.payments)
        .values({
          id: uid(41, paySeq),
          orderId: ord1006.orderId,
          tableSessionId: table9?.sessionId,
          payerGuestSessionId: jordanGuest?.id,
          scope: 'ORDER',
          amount: partialAmount,
          tipAmount: 3.0,
          method: 'MOBILE_WALLET',
          status: 'PAID',
          transactionRef: `TXN-SPLIT-${100000 + paySeq}`,
          paidAt: minutesAgo(now, 10),
          settledById: id.cashier.staffId,
          collectedById: id.waiters.sara.staffId,
          createdAt: minutesAgo(now, 10),
        })
        .returning(),
      'partial payment for ORD-1006',
    );

    await tx.insert(schema.paymentAllocations).values({
      id: uid(42, paySeq),
      paymentId: pPart.id,
      orderId: ord1006.orderId,
      amount: partialAmount,
      createdAt: minutesAgo(now, 10),
    });
  }

  // 3. Order Reviews (Feedback for completed orders)
  const reviewsData = [
    { orderNum: 'ORD-0901', rating: 5, comment: 'Exceptional service and the burger patty was cooked to perfection!' },
    { orderNum: 'ORD-0902', rating: 5, comment: 'Ribeye steak was so tender with the herb butter. Will definitely come back!' },
    { orderNum: 'ORD-0903', rating: 4, comment: 'Fresh salmon and quick table service by David.' },
    { orderNum: 'ORD-0904', rating: 5, comment: 'Lava cake is to die for. 10/10 recommend!' },
    { orderNum: 'ORD-0905', rating: 4, comment: 'Very pleasant ambiance and easy QR ordering from our phone.' },
  ];

  for (const [idx, r] of reviewsData.entries()) {
    const ord = orders[r.orderNum];
    if (!ord) continue;

    await tx.insert(schema.orderReviews).values({
      id: uid(43, idx + 1),
      orderId: ord.orderId,
      customerId: id.customers.sarah.customerId,
      rating: r.rating,
      comment: r.comment,
      isApproved: true,
      createdAt: ord.createdAt,
    });
  }

  console.log(`💳 Seeded discounts, ${paySeq} payments, and ${reviewsData.length} customer reviews`);
};
