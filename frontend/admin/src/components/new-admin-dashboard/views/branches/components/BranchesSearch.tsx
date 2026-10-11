import React from 'react';
import { Search } from 'lucide-react';

interface BranchesSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const BranchesSearch: React.FC<BranchesSearchProps> = ({
  searchQuery,
  onSearchChange,
}) => {
  return (
    <div className="relative w-full sm:w-72">
      <Search className="size-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search branches..."
        className="w-full h-9 pl-9 pr-3 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 font-sans"
      />
    </div>
  );
};
