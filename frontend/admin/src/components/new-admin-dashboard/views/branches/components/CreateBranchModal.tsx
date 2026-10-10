import React, { useState } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { RestaurantItem } from '../../../types';
import { BranchFormData } from '../types';

interface CreateBranchModalProps {
  restaurants: RestaurantItem[];
  onClose: () => void;
  onSubmit: (form: BranchFormData) => void;
}

export const CreateBranchModal: React.FC<CreateBranchModalProps> = ({
  restaurants,
  onClose,
  onSubmit,
}) => {
  const [createForm, setCreateForm] = useState<BranchFormData>({
    restaurantId: restaurants[0]?.id || 'rest-1',
    restaurantName: restaurants[0]?.name || 'Tavonza Kitchen',
    name: '',
    address: 'Cusseta, Georgia',
    contactNumber: '992548756',
    manager: 'Nobin Mille',
    status: 'Active',
    openingTime: '09:00',
    closingTime: '23:00',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(createForm);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-[560px] max-w-full p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-800 flex flex-col justify-start items-end gap-4 shadow-2xl animate-in fade-in scale-95 duration-150">
        {/* Modal Header */}
        <div className="w-full flex justify-between items-start">
          <div className="w-96 flex flex-col justify-start items-start gap-1">
            <h3 className="text-white text-lg font-medium font-['Poppins'] leading-5">
              Create Branch
            </h3>
            <p className="text-neutral-400 text-xs font-normal font-['Poppins'] leading-4">
              Complete the details below, then save your changes.
            </p>
          </div>

          <button
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
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <div className="w-full p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-800 flex flex-col justify-start items-center gap-4">
            {/* Row 1: Restaurant & Branch Name */}
            <div className="self-stretch grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col justify-start items-start gap-2">
                <label className="text-white text-sm font-normal font-['Inter'] leading-4">
                  Restaurant
                </label>
                <div className="self-stretch relative">
                  <select
                    value={createForm.restaurantId}
                    onChange={(e) => {
                      const selected = restaurants.find((r) => r.id === e.target.value);
                      setCreateForm({
                        ...createForm,
                        restaurantId: e.target.value,
                        restaurantName: selected ? selected.name : createForm.restaurantName,
                      });
                    }}
                    className="w-full h-11 px-3.5 py-3 bg-neutral-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 text-stone-300 text-sm font-normal font-['Inter'] appearance-none focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    {restaurants.map((rest) => (
                      <option key={rest.id} value={rest.id}>
                        {rest.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="size-4 text-stone-300 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div className="flex flex-col justify-start items-start gap-2">
                <label className="text-white text-sm font-normal font-['Inter'] leading-4">
                  Branch Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Illinois Flagship"
                  value={createForm.name}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, name: e.target.value })
                  }
                  className="self-stretch h-11 px-3.5 py-3 bg-neutral-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 text-stone-200 text-sm focus:outline-none focus:border-amber-400 font-['Inter']"
                />
              </div>
            </div>

            {/* Row 2: Address & Contact Number */}
            <div className="self-stretch grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col justify-start items-start gap-2">
                <label className="text-white text-sm font-normal font-['Inter'] leading-4">
                  Address
                </label>
                <input
                  type="text"
                  placeholder="Cusseta, Georgia"
                  value={createForm.address}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, address: e.target.value })
                  }
                  className="self-stretch h-11 px-3.5 py-3 bg-neutral-900 rounded-lg border border-neutral-800 text-stone-200 text-sm focus:outline-none focus:border-amber-400 font-['Inter']"
                />
              </div>

              <div className="flex flex-col justify-start items-start gap-2">
                <label className="text-white text-sm font-normal font-['Inter'] leading-4">
                  Contact Number
                </label>
                <input
                  type="text"
                  placeholder="992548756"
                  value={createForm.contactNumber}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      contactNumber: e.target.value,
                    })
                  }
                  className="self-stretch h-11 px-3.5 py-3 bg-neutral-900 rounded-lg border border-neutral-800 text-stone-200 text-sm focus:outline-none focus:border-amber-400 font-['Inter']"
                />
              </div>
            </div>

            {/* Row 3: Branch Manager & Status */}
            <div className="self-stretch grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col justify-start items-start gap-2">
                <label className="text-white text-sm font-normal font-['Inter'] leading-4">
                  Branch Manager
                </label>
                <div className="self-stretch relative">
                  <select
                    value={createForm.manager}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, manager: e.target.value })
                    }
                    className="w-full h-11 px-3.5 py-3 bg-neutral-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 text-stone-300 text-sm font-normal font-['Inter'] appearance-none focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    <option value="Nobin Mille">Nobin Mille</option>
                    <option value="Samira Khan">Samira Khan</option>
                    <option value="Mikel">Mikel</option>
                    <option value="Glory">Glory</option>
                    <option value="Robert Geo">Robert Geo</option>
                  </select>
                  <ChevronDown className="size-4 text-stone-300 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div className="flex flex-col justify-start items-start gap-2">
                <label className="text-white text-sm font-normal font-['Inter'] leading-4">
                  Status
                </label>
                <div className="self-stretch relative">
                  <select
                    value={createForm.status}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        status: e.target.value as 'Active' | 'Setup' | 'Closed',
                      })
                    }
                    className="w-full h-11 px-3.5 py-3 bg-neutral-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 text-stone-300 text-sm font-normal font-['Inter'] appearance-none focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Setup">Setup</option>
                    <option value="Closed">Closed</option>
                  </select>
                  <ChevronDown className="size-4 text-stone-300 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Row 4: Opening Time & Closing Time */}
            <div className="self-stretch grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col justify-start items-start gap-2">
                <label className="text-white text-sm font-normal font-['Inter'] leading-4">
                  Opening Time
                </label>
                <input
                  type="text"
                  value={createForm.openingTime}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      openingTime: e.target.value,
                    })
                  }
                  placeholder="09:00"
                  className="self-stretch h-11 px-3.5 py-3 bg-neutral-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 text-stone-300 text-sm font-normal font-['Inter'] focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex flex-col justify-start items-start gap-2">
                <label className="text-white text-sm font-normal font-['Inter'] leading-4">
                  Closing Time
                </label>
                <input
                  type="text"
                  value={createForm.closingTime}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      closingTime: e.target.value,
                    })
                  }
                  placeholder="23:00"
                  className="self-stretch h-11 px-3.5 py-3 bg-neutral-900 rounded-lg border border-neutral-800 text-stone-300 text-sm font-normal font-['Inter'] focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>

          {/* Modal Footer Buttons */}
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
