import React from 'react';
import { X, ChevronDown, RefreshCw } from 'lucide-react';
import { TableFormData } from '../types';
import { TableQrMatrix } from '../TableQrMatrix';

interface EditTableModalProps {
  isOpen: boolean;
  tableForm: TableFormData;
  onChange: (form: TableFormData) => void;
  qrSeed: number;
  isRegenerating: boolean;
  onRegenerateQr: () => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const EditTableModal: React.FC<EditTableModalProps> = ({
  isOpen,
  tableForm,
  onChange,
  qrSeed,
  isRegenerating,
  onRegenerateQr,
  onClose,
  onSubmit,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-[560px] max-w-full p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-800 flex flex-col justify-start items-center gap-4 shadow-2xl animate-in fade-in scale-95 duration-150">
        {/* Header */}
        <div className="w-full flex justify-between items-start">
          <div className="flex flex-col justify-start items-start gap-1">
            <h3 className="text-white text-lg font-medium font-['Poppins'] leading-5">
              Edit Table
            </h3>
            <p className="text-neutral-400 text-xs font-normal font-['Poppins'] leading-4">
              Complete the details below, then save your changes.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 px-2.5 py-2 bg-gray-300/10 hover:bg-gray-300/20 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 flex justify-center items-center text-gray-200 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Divider */}
        <div className="w-full h-0 outline outline-1 outline-offset-[-0.50px] outline-neutral-800" />

        {/* Form Fields Container */}
        <form onSubmit={onSubmit} className="w-full flex flex-col gap-4">
          <div className="w-full p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-800 flex flex-col justify-start items-center gap-4">
            {/* Table Number */}
            <div className="self-stretch flex flex-col justify-start items-start gap-2">
              <label className="text-white text-sm font-normal font-['Inter'] leading-4">
                Table Number
              </label>
              <input
                type="text"
                required
                value={tableForm.number}
                onChange={(e) => onChange({ ...tableForm, number: e.target.value })}
                className="self-stretch h-11 px-3.5 py-3 bg-neutral-900 rounded-lg border border-neutral-800 text-stone-200 text-sm focus:outline-none focus:border-amber-400 font-['Inter']"
              />
            </div>

            {/* Capacity & Status */}
            <div className="self-stretch grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Capacity */}
              <div className="flex flex-col justify-start items-start gap-2">
                <label className="text-white text-sm font-normal font-['Inter'] leading-4">
                  Capacity
                </label>
                <input
                  type="number"
                  min={1}
                  max={40}
                  required
                  value={tableForm.capacity}
                  onChange={(e) => onChange({ ...tableForm, capacity: Number(e.target.value) })}
                  className="self-stretch h-11 px-3.5 py-3 bg-neutral-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 text-stone-300 text-sm focus:outline-none focus:border-amber-400 font-['Inter']"
                />
              </div>

              {/* Status */}
              <div className="flex flex-col justify-start items-start gap-2">
                <label className="text-white text-sm font-normal font-['Inter'] leading-4">
                  Status
                </label>
                <div className="self-stretch relative">
                  <select
                    value={tableForm.status}
                    onChange={(e) => onChange({ ...tableForm, status: e.target.value as any })}
                    className="w-full h-11 px-3.5 py-3 bg-neutral-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 text-stone-300 text-sm font-normal font-['Inter'] appearance-none focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    <option value="Available">Available</option>
                    <option value="Occupied">Occupied</option>
                    <option value="Reserved">Reserved</option>
                  </select>
                  <ChevronDown className="size-4 text-stone-300 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Automatic Generate QR Section */}
          <div className="w-full flex flex-col justify-start items-center gap-3 py-1">
            <span className="text-stone-500 text-sm font-normal font-['Inter'] leading-4">
              Automatic Generate
            </span>

            <div className="relative size-28 bg-neutral-950 rounded-[4px] p-2 flex items-center justify-center border border-neutral-800/80 shadow-inner">
              <div className="absolute top-1 left-1 size-3.5 border-t-2 border-l-2 border-yellow-400 rounded-tl-[2px] pointer-events-none" />
              <div className="absolute top-1 right-1 size-3.5 border-t-2 border-r-2 border-yellow-400 rounded-tr-[2px] pointer-events-none" />
              <div className="absolute bottom-1 left-1 size-3.5 border-b-2 border-l-2 border-yellow-400 rounded-bl-[2px] pointer-events-none" />
              <div className="absolute bottom-1 right-1 size-3.5 border-b-2 border-r-2 border-yellow-400 rounded-br-[2px] pointer-events-none" />

              <TableQrMatrix seed={qrSeed} size={88} lightColor="#facc15" darkColor="#0a0a0a" />
            </div>

            <button
              type="button"
              onClick={onRegenerateQr}
              className="inline-flex justify-center items-center gap-1.5 text-yellow-400 hover:text-yellow-300 text-sm font-normal font-['Inter'] leading-4 transition-colors cursor-pointer"
            >
              <RefreshCw className={`size-3.5 text-yellow-400 ${isRegenerating ? 'animate-spin' : ''}`} />
              <span>Re-generate</span>
            </button>
          </div>

          {/* Modal Action Buttons: Cancel & Save Changes */}
          <div className="inline-flex justify-end items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 text-white text-base font-medium font-['Inter'] leading-5 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2.5 bg-yellow-400 hover:bg-yellow-300 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 text-neutral-800 text-base font-medium font-['Inter'] leading-5 transition-colors cursor-pointer shadow-sm"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
