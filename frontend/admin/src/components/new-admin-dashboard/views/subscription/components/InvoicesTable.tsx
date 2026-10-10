import React from 'react';
import { FileText } from 'lucide-react';
import { InvoiceItem } from '../types';

interface InvoicesTableProps {
  invoices: InvoiceItem[];
  onViewInvoice: (invoice: InvoiceItem) => void;
}

export const InvoicesTable: React.FC<InvoicesTableProps> = ({ invoices, onViewInvoice }) => {
  return (
    <div className="space-y-4 pt-2">
      <div className="flex flex-col gap-1">
        <h2 className="text-zinc-100 text-xl font-normal font-sans leading-6">
          Invoices &amp; payments
        </h2>
        <p className="text-neutral-400 text-sm font-normal font-sans leading-4">
          Review and download your past invoices.
        </p>
      </div>

      {/* Invoices Table Container */}
      <div className="overflow-x-auto rounded-lg border border-zinc-800 bg-neutral-950/60 shadow-xl">
        <table className="w-full text-left font-sans">
          <thead>
            <tr className="bg-zinc-900 border-b border-zinc-800 text-white text-sm font-semibold">
              <th className="px-5 py-3.5">Date</th>
              <th className="px-5 py-3.5">Plan</th>
              <th className="px-5 py-3.5 text-center">Amount</th>
              <th className="px-5 py-3.5 text-center">Status</th>
              <th className="px-5 py-3.5 text-right">Invoice</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {invoices.map((inv) => (
              <tr
                key={inv.id}
                className="hover:bg-neutral-900/60 transition-colors group"
              >
                {/* Date Column */}
                <td className="px-5 py-4">
                  <span className="text-neutral-200 text-base font-medium font-sans leading-4">
                    {inv.date}
                  </span>
                </td>

                {/* Plan Column */}
                <td className="px-5 py-4">
                  <span className="text-neutral-200 text-base font-medium font-sans leading-4">
                    {inv.plan}
                  </span>
                </td>

                {/* Amount Column */}
                <td className="px-5 py-4 text-center">
                  <span className="text-neutral-200 text-base font-medium font-sans leading-4 font-mono">
                    {inv.amount}
                  </span>
                </td>

                {/* Status Column */}
                <td className="px-5 py-4 text-center">
                  <span className="inline-flex px-3 py-1.5 bg-green-500/10 text-green-500 rounded-md text-sm font-medium font-sans leading-4">
                    {inv.status}
                  </span>
                </td>

                {/* Action Column */}
                <td className="px-5 py-4 text-right">
                  <button
                    onClick={() => onViewInvoice(inv)}
                    className="inline-flex items-center gap-1.5 text-neutral-400 hover:text-white transition-colors"
                  >
                    <FileText className="size-4 text-neutral-400 group-hover:text-amber-400 transition-colors" />
                    <span className="text-xs font-normal font-sans leading-4 underline-offset-2 hover:underline">
                      View invoice
                    </span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
