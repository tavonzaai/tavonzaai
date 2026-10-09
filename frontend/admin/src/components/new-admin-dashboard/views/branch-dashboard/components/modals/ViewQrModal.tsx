import React from 'react';
import { X, Copy, Printer } from 'lucide-react';
import { toast } from 'sonner';
import { TableItem } from '../types';
import { TableQrMatrix } from '../TableQrMatrix';

interface ViewQrModalProps {
  table: TableItem | null;
  branchName: string;
  onClose: () => void;
}

export const ViewQrModal: React.FC<ViewQrModalProps> = ({
  table,
  branchName,
  onClose,
}) => {
  if (!table) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-[460px] max-w-full p-6 bg-neutral-900 rounded-2xl outline outline-1 outline-neutral-800 flex flex-col items-center gap-5 shadow-2xl animate-in fade-in scale-95 duration-150">
        <div className="w-full flex justify-between items-start">
          <div>
            <h3 className="text-white text-lg font-semibold font-['Inter']">
              Table {table.number}
            </h3>
            <p className="text-neutral-400 text-xs font-normal">
              {branchName} · {table.capacity} guests
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* QR Standee Card Preview */}
        <div className="w-full p-6 bg-neutral-950 rounded-xl border border-neutral-800 flex flex-col items-center gap-4">
          <span className="text-xs uppercase tracking-wider text-amber-400 font-semibold">
            Tavonza Smart Dining
          </span>

          <div className="relative p-3 bg-white rounded-lg shadow-xl">
            <TableQrMatrix
              seed={(table.number.charCodeAt(1) || 42) * 7}
              size={160}
              lightColor="#000000"
              darkColor="#ffffff"
            />
          </div>

          <div className="text-center">
            <p className="text-white font-medium text-sm">Scan to Order & Pay</p>
            <p className="text-neutral-500 text-xs">Table {table.number} · {branchName}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="w-full grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(table.qrCodeUrl);
              toast.success('QR Code link copied to clipboard!');
            }}
            className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Copy className="size-3.5" />
            <span>Copy Link</span>
          </button>

          <button
            type="button"
            onClick={() => {
              toast.success(`Printing standee label for ${table.number}...`);
            }}
            className="px-3 py-2 bg-yellow-400 hover:bg-yellow-300 text-neutral-900 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="size-3.5" />
            <span>Print Standee</span>
          </button>
        </div>
      </div>
    </div>
  );
};
