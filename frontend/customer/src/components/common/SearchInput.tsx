'use client';

import React, { useState, useEffect } from 'react';
import { Search, X, Loader2 } from 'lucide-react';

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  isLoading?: boolean;
  className?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search...',
  debounceMs = 300,
  isLoading = false,
  className = '',
}: SearchInputProps) {
  const [internalValue, setInternalValue] = useState(value);

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  useEffect(() => {
    if (debounceMs <= 0) return;
    const timer = setTimeout(() => {
      if (internalValue !== value) {
        onChange(internalValue);
      }
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [internalValue, debounceMs, onChange, value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInternalValue(val);
    if (debounceMs <= 0) {
      onChange(val);
    }
  };

  const handleClear = () => {
    setInternalValue('');
    onChange('');
  };

  return (
    <div className={`relative flex items-center ${className}`}>
      <Search className="absolute left-3.5 w-4 h-4 text-zinc-400 pointer-events-none" />
      <input
        type="text"
        value={internalValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full h-10 pl-9 pr-8 bg-zinc-900/80 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/40 transition-all"
      />
      {isLoading ? (
        <Loader2 className="absolute right-3 w-4 h-4 text-amber-500 animate-spin" />
      ) : internalValue ? (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2.5 p-1 text-zinc-500 hover:text-white rounded-md transition-colors"
          title="Clear search"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      ) : null}
    </div>
  );
}

export default SearchInput;
