import React from 'react';
import { X, FileText, Printer } from 'lucide-react';
import { toast } from 'sonner';
import { InvoiceItem } from '../types';

interface InvoiceDetailModalProps {
  invoice: InvoiceItem;
  onClose: () => void;
}

export const InvoiceDetailModal: React.FC<InvoiceDetailModalProps> = ({ invoice, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-400/10 text-amber-400">
              <FileText className="size-5" />
            </div>
            <div>
              <h3 className="text-white text-base font-semibold">Official Tax Invoice</h3>
              <p className="text-xs text-neutral-400">{invoice.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          <div className="flex justify-between items-start pb-4 border-b border-neutral-800">
            <div>
              <span className="text-neutral-500 block">Billed to:</span>
              <strong className="text-white text-sm block">Tavonza Kitchen Ltd.</strong>
              <span className="text-neutral-400">Robert Geo (Admin)</span>
            </div>
            <div className="text-right">
              <span className="text-neutral-500 block">Invoice Date:</span>
              <span className="text-white font-mono">{invoice.date}</span>
            </div>
          </div>

          <div className="space-y-2 py-2 border-b border-neutral-800">
            <div className="flex justify-between text-neutral-400">
              <span>Subscription Service:</span>
              <span className="text-white">{invoice.plan}</span>
            </div>
            <div className="flex justify-between text-neutral-400">
              <span>Payment Method:</span>
              <span className="text-white">{invoice.paymentMethod}</span>
            </div>
            <div className="flex justify-between text-neutral-400">
              <span>Subtotal:</span>
              <span className="text-white font-mono">{invoice.subtotal}</span>
            </div>
            <div className="flex justify-between text-neutral-400">
              <span>VAT / Sales Tax (5%):</span>
              <span className="text-white font-mono">{invoice.vat}</span>
            </div>
            <div className="flex justify-between text-white font-bold text-sm pt-2 border-t border-neutral-800">
              <span>Total Paid:</span>
              <span className="text-amber-400 font-mono">{invoice.amount}</span>
            </div>
          </div>

          <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-800 text-[11px] text-neutral-400 flex justify-between items-center">
            <span>Payment Status</span>
            <span className="px-2 py-0.5 rounded bg-green-500/10 text-green-500 font-semibold">
              Paid in full
            </span>
          </div>
        </div>

        <div className="p-4 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between">
          <button
            onClick={() => {
              toast.success('Downloading official PDF receipt...');
              window.print();
            }}
            className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-neutral-950 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
          >
            <Printer className="size-3.5 text-neutral-950" />
            <span>Print / Download PDF</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
