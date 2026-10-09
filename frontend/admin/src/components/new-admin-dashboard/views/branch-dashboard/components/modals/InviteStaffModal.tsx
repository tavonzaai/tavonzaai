import React from 'react';
import { X, ChevronDown } from 'lucide-react';
import { StaffInviteFormData } from '../types';

interface InviteStaffModalProps {
  isOpen: boolean;
  branchName?: string;
  inviteForm: StaffInviteFormData;
  onChange: (form: StaffInviteFormData) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const InviteStaffModal: React.FC<InviteStaffModalProps> = ({
  isOpen,
  branchName,
  inviteForm,
  onChange,
  onClose,
  onSubmit,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-[560px] max-w-full p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-800 flex flex-col justify-start items-end gap-4 shadow-2xl animate-in fade-in scale-95 duration-150">
        {/* Modal Header */}
        <div className="w-full flex justify-between items-start">
          <div className="w-96 flex flex-col justify-start items-start gap-1">
            <h3 className="text-white text-lg font-medium font-['Poppins'] leading-5">
              Invite Staff
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

        {/* Form Container */}
        <form onSubmit={onSubmit} className="w-full flex flex-col gap-4">
          <div className="w-full p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-800 flex flex-col justify-start items-center gap-4">
            {/* Full Name */}
            <div className="self-stretch flex flex-col justify-start items-start gap-2">
              <label className="text-white text-sm font-normal font-['Inter'] leading-4">
                Full Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Liam Henderson"
                value={inviteForm.name}
                onChange={(e) => onChange({ ...inviteForm, name: e.target.value })}
                className="self-stretch h-11 px-3.5 py-3 bg-neutral-900 rounded-lg border border-neutral-800 text-stone-200 text-sm focus:outline-none focus:border-amber-400 font-['Inter']"
              />
            </div>

            {/* Role & Branch */}
            <div className="self-stretch grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Role */}
              <div className="flex flex-col justify-start items-start gap-2">
                <label className="text-white text-sm font-normal font-['Inter'] leading-4">
                  Role
                </label>
                <div className="self-stretch relative">
                  <select
                    value={inviteForm.role}
                    onChange={(e) => onChange({ ...inviteForm, role: e.target.value })}
                    className="w-full h-11 px-3.5 py-3 bg-neutral-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 text-stone-300 text-sm font-normal font-['Inter'] appearance-none focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    <option value="Manager">Manager</option>
                    <option value="Branch Manager">Branch Manager</option>
                    <option value="Waiter">Waiter</option>
                    <option value="Chef">Chef</option>
                    <option value="Cashier">Cashier</option>
                  </select>
                  <ChevronDown className="size-4 text-stone-300 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Branch */}
              <div className="flex flex-col justify-start items-start gap-2">
                <label className="text-white text-sm font-normal font-['Inter'] leading-4">
                  Branch
                </label>
                <div className="self-stretch relative">
                  <select
                    value={inviteForm.branch}
                    onChange={(e) => onChange({ ...inviteForm, branch: e.target.value })}
                    className="w-full h-11 px-3.5 py-3 bg-neutral-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 text-stone-300 text-sm font-normal font-['Inter'] appearance-none focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    <option value="Georgia Flagship">Georgia Flagship</option>
                    <option value="Florida Flagship">Florida Flagship</option>
                    <option value="Illinois Flagship">Illinois Flagship</option>
                    <option value="Texas Flagship">Texas Flagship</option>
                    <option value="Gulshan Flagship">Gulshan Flagship</option>
                    {branchName && <option value={branchName}>{branchName}</option>}
                  </select>
                  <ChevronDown className="size-4 text-stone-300 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Modal Buttons: Cancel & Save */}
          <div className="inline-flex justify-end items-center gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 text-white text-base font-medium font-['Inter'] leading-5 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-2.5 bg-yellow-400 hover:bg-yellow-300 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 text-neutral-800 text-base font-medium font-['Inter'] leading-5 transition-colors cursor-pointer shadow-sm"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
