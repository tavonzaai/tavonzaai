import React from 'react';
import { MenuItem } from '../types';

interface BranchMenuTabProps {
  menuItems: MenuItem[];
  onOpenEditMenu: (item: MenuItem) => void;
  onDuplicateMenu: (item: MenuItem) => void;
  onToggleMenuStatus: (item: MenuItem) => void;
  onDeleteMenu: (item: MenuItem) => void;
}

export const BranchMenuTab: React.FC<BranchMenuTabProps> = ({
  menuItems,
  onOpenEditMenu,
  onDuplicateMenu,
  onToggleMenuStatus,
  onDeleteMenu,
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="w-full overflow-x-auto rounded-xl border border-zinc-800 bg-neutral-900/50 shadow-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-900 border-b border-zinc-800">
              <th className="px-5 py-3 text-white text-sm font-semibold font-['Inter'] leading-5">
                Item
              </th>
              <th className="px-5 py-3 text-white text-sm font-semibold font-['Inter'] leading-5">
                Category
              </th>
              <th className="px-5 py-3 text-white text-sm font-semibold font-['Inter'] leading-5">
                Price
              </th>
              <th className="px-5 py-3 text-white text-sm font-semibold font-['Inter'] leading-5 text-center">
                Status
              </th>
              <th className="px-5 py-3 text-white text-sm font-semibold font-['Inter'] leading-5 text-center">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {menuItems.map((item) => (
              <tr key={item.id} className="hover:bg-zinc-900/40 transition-colors">
                {/* Item */}
                <td className="px-5 py-4 text-neutral-200 text-base font-medium font-['Inter'] leading-4">
                  {item.name}
                </td>

                {/* Category */}
                <td className="px-5 py-4 text-neutral-200 text-base font-medium font-['Inter'] leading-4">
                  {item.category}
                </td>

                {/* Price */}
                <td className="px-5 py-4 text-neutral-200 text-base font-medium font-['Inter'] leading-4">
                  {item.price}
                </td>

                {/* Status */}
                <td className="px-5 py-3 text-center">
                  <span
                    className={`inline-flex px-3 py-1.5 rounded-md text-sm font-medium font-['Inter'] leading-4 ${
                      item.status === 'Active'
                        ? 'bg-green-500/10 text-green-500'
                        : 'bg-neutral-400/20 text-neutral-400'
                    }`}
                  >
                    {item.status}
                  </span>
                </td>

                {/* Actions matching Figma: Edit, Duplicate, Disable / Enable, Delete */}
                <td className="px-5 py-4 text-center">
                  <div className="flex items-center justify-center gap-6">
                    <button
                      type="button"
                      onClick={() => onOpenEditMenu(item)}
                      className="text-neutral-400 hover:text-white text-xs font-normal font-['Inter'] leading-4 transition-colors cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDuplicateMenu(item)}
                      className="text-neutral-400 hover:text-white text-xs font-normal font-['Inter'] leading-4 transition-colors cursor-pointer"
                    >
                      Duplicate
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleMenuStatus(item)}
                      className="text-neutral-400 hover:text-white text-xs font-normal font-['Inter'] leading-4 transition-colors cursor-pointer"
                    >
                      {item.status === 'Active' ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteMenu(item)}
                      className="text-red-400 hover:text-red-300 text-xs font-normal font-['Inter'] leading-4 transition-colors cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
