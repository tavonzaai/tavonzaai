import React from 'react';
import { Layers, SlidersHorizontal, Info } from 'lucide-react';
import { MenuItem, CategoryItem } from '../types';
import { PaginationBar } from '@/components/common';
import { paginateItems } from '@/lib/pagination';
import { useClientPage, useClampPage } from '@/hooks/useListPagination';

interface BranchMenuTabProps {
  menuItems: MenuItem[];
  categories: CategoryItem[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  onOpenManageCategories: () => void;
  onOpenEditMenu: (item: MenuItem) => void;
  onDuplicateMenu: (item: MenuItem) => void;
  onToggleMenuStatus: (item: MenuItem) => void;
  onDeleteMenu: (item: MenuItem) => void;
}

export const BranchMenuTab: React.FC<BranchMenuTabProps> = ({
  menuItems,
  categories,
  selectedCategory,
  onSelectCategory,
  onOpenManageCategories,
  onOpenEditMenu,
  onDuplicateMenu,
  onToggleMenuStatus,
  onDeleteMenu,
}) => {
  const { page, setPage } = useClientPage(menuItems.length);
  const paged = paginateItems(menuItems, page);
  useClampPage(page, paged.meta.totalPages, setPage);

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Category Section above Menu */}
      {categories.length === 0 ? (
        <div className="p-4 bg-yellow-400/10 border border-yellow-400/20 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-400/20 rounded-lg text-yellow-400 shrink-0">
              <Info className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-white text-sm font-medium">No menu categories created yet</h4>
              <p className="text-zinc-400 text-xs">
                Create categories to organize menu items for this branch.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenManageCategories}
            className="px-3.5 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-neutral-900 text-xs font-semibold rounded-lg transition shrink-0 cursor-pointer shadow-sm"
          >
            + Add Category
          </button>
        </div>
      ) : (
        <div className="p-3 bg-neutral-900/70 rounded-xl border border-neutral-800 flex flex-wrap items-center justify-between gap-2.5 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onSelectCategory('All Categories')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium font-['Poppins'] transition border cursor-pointer ${
                selectedCategory === 'All Categories'
                  ? 'bg-yellow-400 text-neutral-900 border-yellow-400 shadow-sm'
                  : 'bg-neutral-950/70 text-stone-300 border-neutral-800 hover:bg-neutral-800 hover:text-white'
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => {
              const isSelected =
                selectedCategory.toLowerCase() === cat.name.toLowerCase() ||
                selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onSelectCategory(cat.name)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium font-['Poppins'] transition border cursor-pointer ${
                    isSelected
                      ? 'bg-yellow-400 text-neutral-900 border-yellow-400 shadow-sm'
                      : 'bg-neutral-950/70 text-stone-300 border-neutral-800 hover:bg-neutral-800 hover:text-white'
                  }`}
                >
                  {cat.name}
                  {cat.itemCount !== undefined && (
                    <span className="ml-1.5 opacity-75 text-[11px] font-mono">
                      ({cat.itemCount})
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={onOpenManageCategories}
            className="px-3 py-1.5 text-xs text-stone-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg border border-neutral-700 transition flex items-center gap-1.5 cursor-pointer ml-auto"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-yellow-400" />
            <span>Manage Categories</span>
          </button>
        </div>
      )}
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
            {paged.items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-neutral-400 font-medium">
                  No menu items found. Click &quot;Add Menu Item&quot; to add one.
                </td>
              </tr>
            ) : (
              paged.items.map((item) => (
                <tr key={item.id} className="hover:bg-zinc-900/40 transition-colors">
                  <td className="px-5 py-4 text-neutral-200 text-base font-medium font-['Inter'] leading-4">
                    {item.name}
                  </td>
                  <td className="px-5 py-4 text-neutral-200 text-base font-medium font-['Inter'] leading-4">
                    {item.category}
                  </td>
                  <td className="px-5 py-4 text-neutral-200 text-base font-medium font-['Inter'] leading-4">
                    {item.price}
                  </td>
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
              ))
            )}
          </tbody>
        </table>
      </div>
      <PaginationBar meta={paged.meta} onPageChange={setPage} />
    </div>
  );
};
