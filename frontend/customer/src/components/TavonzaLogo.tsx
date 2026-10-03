'use client';

import React from 'react';

export function TavonzaLogoIcon({ className = 'w-16 h-16' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Outer Golden Ring */}
      <circle cx="50" cy="50" r="38" stroke="#FACC15" strokeWidth="9" />
      {/* Top and Bottom Notch Gaps */}
      <rect x="44" y="6" width="12" height="12" fill="#000000" />
      <rect x="44" y="82" width="12" height="12" fill="#000000" />
      {/* Inner Concentric Target Circle */}
      <circle cx="50" cy="50" r="20" stroke="#FACC15" strokeWidth="6" />
      {/* Center Dot */}
      <circle cx="50" cy="50" r="6" fill="#FACC15" />
    </svg>
  );
}

export function TavonzaLogo({ size = 'lg' }: { size?: 'sm' | 'md' | 'lg' }) {
  const iconSizes = { sm: 'w-10 h-10', md: 'w-14 h-14', lg: 'w-20 h-20' };
  const textSizes = { sm: 'text-2xl', md: 'text-3xl', lg: 'text-4xl' };

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <TavonzaLogoIcon className={iconSizes[size]} />
      <div className={`font-black font-['Outfit'] tracking-tight flex items-center justify-center ${textSizes[size]}`}>
        <span className="text-white">Tavonza</span>
        <span className="text-yellow-400">AI</span>
      </div>
    </div>
  );
}
