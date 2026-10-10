import React from 'react';
import { X } from 'lucide-react';
import { MenuFormData } from '../types';

interface EditMenuModalProps {
  isOpen: boolean;
  menuForm: MenuFormData;
  onChange: (form: MenuFormData) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const EditMenuModal: React.FC<EditMenuModalProps> = ({
  isOpen,
  menuForm,
  onChange,
  onClose,
  onSubmit,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-[520px] max-w-full p-5 bg-neutral-900 rounded-xl outline outline-1 outline-neutral-800 flex flex-col gap-4 shadow-2xl animate-in fade-in scale-95 duration-150">
        <div className="w-full flex justify-between items-start">
          <div>
            <h3 className="text-white text-lg font-medium font-['Poppins']">
              Edit Menu Item
            </h3>
            <p className="text-neutral-400 text-xs">
              Modify details for this dish or drink.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-4 pt-1">
          <div className="flex flex-col gap-2">
            <label className="text-white text-sm font-normal">Item Name</label>
            <input
              type="text"
              required
              value={menuForm.name}
              onChange={(e) => onChange({ ...menuForm, name: e.target.value })}
              className="h-11 px-3.5 py-3 bg-neutral-900 rounded-lg border border-neutral-800 text-stone-200 text-sm focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <label className="text-white text-sm font-normal">Category</label>
              <select
                value={menuForm.category}
                onChange={(e) => onChange({ ...menuForm, category: e.target.value })}
                className="h-11 px-3 bg-neutral-900 rounded-lg border border-neutral-800 text-stone-300 text-sm focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                <option value="Main Course">Main Course</option>
                <option value="Starters">Starters</option>
                <option value="Beverages">Beverages</option>
                <option value="Desserts">Desserts</option>
                <option value="Sides">Sides</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-white text-sm font-normal">Price</label>
              <input
                type="text"
                required
                value={menuForm.price}
                onChange={(e) => onChange({ ...menuForm, price: e.target.value })}
                className="h-11 px-3.5 py-3 bg-neutral-900 rounded-lg border border-neutral-800 text-stone-200 text-sm focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-white text-sm font-normal">Status</label>
            <select
              value={menuForm.status}
              onChange={(e) => onChange({ ...menuForm, status: e.target.value as any })}
              className="h-11 px-3 bg-neutral-900 rounded-lg border border-neutral-800 text-stone-300 text-sm focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="Active">Active</option>
              <option value="Disable">Disable</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-neutral-900 rounded-lg text-sm font-medium transition-colors cursor-pointer shadow-sm"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
