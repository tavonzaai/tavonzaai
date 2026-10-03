import React from 'react';

/**
 * 8-ray sun/sparkle icon matching Figma exactly
 */
export function YellowSparkleIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={`${className} shrink-0 text-yellow-400`} viewBox="0 0 24 24" fill="none">
      {/* 4 Cardinal Rays */}
      <line x1="12" y1="3" x2="12" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="12" y1="18" x2="12" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="3" y1="12" x2="6" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="18" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* 4 Diagonal Accent Points */}
      <circle cx="16.5" cy="7.5" r="1.2" fill="currentColor" />
      <circle cx="7.5" cy="16.5" r="1.2" fill="currentColor" />
      <circle cx="16.5" cy="16.5" r="1.2" fill="currentColor" />
      <circle cx="7.5" cy="7.5" r="1.2" fill="currentColor" />
    </svg>
  );
}

/**
 * Fuchsia steaming pan / skillet icon matching Figma cooking status
 */
export function FuchsiaCookingPanIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg
      className={`${className} shrink-0 text-fuchsia-500`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 14h13a2 2 0 0 1 2 2v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-1a2 2 0 0 1 2-2Z" />
      <path d="M18 15h3" />
      <path d="M6 10c0-1.5 1-2 1-3.5" />
      <path d="M10 10c0-1.5 1-2 1-3.5" />
      <path d="M14 10c0-1.5 1-2 1-3.5" />
    </svg>
  );
}

/**
 * Green rounded clock timer icon matching Figma
 */
export function GreenClockIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <div className={`relative ${className} shrink-0 flex items-center justify-center`}>
      <div className="w-3.5 h-3.5 rounded-full border-[1.4px] border-emerald-600 flex items-center justify-center">
        <div className="w-[1.2px] h-[3.5px] bg-emerald-600 -mt-1 ml-0.5 rounded-xs" />
      </div>
    </div>
  );
}
