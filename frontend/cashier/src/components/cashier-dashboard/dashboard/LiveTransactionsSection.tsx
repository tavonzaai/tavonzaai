'use client';

import React, { useState, useEffect } from 'react';
import { cashierService, getActiveBranchId } from '@/redux/features/cashierApi';
import { LiveTransaction } from '../types';
import { toast } from 'sonner';

export default function LiveTransactionsSection() {
  const [transactions, setTransactions] = useState<LiveTransaction[]>([]);

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      try {
        const branchId = getActiveBranchId();
        const raw = await cashierService.getOrders(branchId);
        if (mounted && Array.isArray(raw)) {
          const mapped: LiveTransaction[] = raw.slice(0, 6).map((o: any) => ({
            id: o.orderId || o.id,
            transactionId: `TX-${(o.orderId || o.id).slice(0, 5).toUpperCase()}`,
            orderId: o.orderNumber || `#${(o.orderId || o.id).slice(0, 5)}`,
            paymentMethod: o.paymentMethod || 'Cash',
            status: o.paymentStatus === 'PAID' ? 'Paid' : 'Pending',
            amount: Number(o.totalAmount || o.total || 0),
            time: new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }));
          setTransactions(mapped);
        }
      } catch (err) {
        console.error('Failed to load live transactions:', err);
      }
    };
    loadData();
    const interval = setInterval(loadData, 8000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="bg-white/10 rounded-[10px] outline outline-1 outline-offset-[-1px] outline-white/10 backdrop-blur-xl p-6 font-['Inter'] shadow-lg flex flex-col justify-between">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-white text-lg font-semibold font-['Inter'] leading-tight">
          Live Transactions
        </h2>
        <p className="text-neutral-400 text-sm font-medium font-['Inter'] leading-4 mt-1">
          Recent Payments
        </p>
      </div>

      {/* Transactions Table Container */}
      <div className="bg-[#0D0D0D] rounded-[10px] outline outline-[0.5px] outline-offset-[-0.5px] outline-white/10 backdrop-blur-[30px] overflow-x-auto">
        <table className="w-full text-left text-sm font-['Inter'] min-w-[500px]">
          {/* Table Header */}
          <thead className="bg-neutral-800/40 border-b border-white/10 text-white font-medium text-base">
            <tr>
              <th className="py-3 px-4 text-white font-medium font-['Inter']">Transaction</th>
              <th className="py-3 px-4 text-white font-medium font-['Inter']">Order</th>
              <th className="py-3 px-4 text-white font-medium font-['Inter']">Payment</th>
              <th className="py-3 px-4 text-white font-medium font-['Inter']">Status</th>
              <th className="py-3 px-4 text-right text-white font-medium font-['Inter']">Amount</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-zinc-800">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-neutral-400 text-sm">
                  No live transactions recorded yet.
                </td>
              </tr>
            ) : (
              transactions.map((tx) => (
                <tr
                  key={tx.id}
                  onClick={() => toast.info(`Viewing receipt for ${tx.transactionId}`)}
                  className="hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <td className="py-3.5 px-4 text-white font-normal font-['Inter'] text-base">
                    {tx.transactionId}
                  </td>
                  <td className="py-3.5 px-4 text-white font-normal font-['Inter'] text-base">
                    {tx.orderId}
                  </td>
                  <td className="py-3.5 px-4 text-white font-normal font-['Inter'] text-base">
                    {tx.paymentMethod}
                  </td>
                  <td className="py-3.5 px-4 font-normal font-['Inter'] text-base">
                    <span
                      className={`inline-block text-sm font-normal ${
                        tx.status === 'Paid'
                          ? 'text-teal-500'
                          : tx.status === 'Pending'
                          ? 'text-yellow-500'
                          : 'text-red-500'
                      }`}
                    >
                      {tx.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right text-white font-normal font-['Inter'] text-base">
                    {`$${tx.amount.toFixed(2)}`}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
