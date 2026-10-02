'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Wifi } from 'lucide-react';
import BottomDock from './BottomDock';
import NewWaiterShellContext from './NewWaiterShellContext';

/**
 * 📱 Pixel-Perfect iOS Status Bar (9:41, Cellular, Wi-Fi, Battery)
 */
function MobileStatusBar({ currentTime = '9:41' }: { currentTime?: string }) {
  return (
    <div className="w-full h-14 px-6 flex items-center justify-between z-30 select-none text-white font-['SF_Pro',-apple-system,sans-serif] shrink-0 sticky top-0 bg-black/90 backdrop-blur-md border-b border-white/5">
      <span className="text-[15px] font-semibold tracking-tight">{currentTime}</span>
      <div className="w-20 h-4 bg-black/50 rounded-full blur-[1px] hidden sm:block" />
      <div className="flex items-center gap-2">
        <div className="flex items-end gap-0.5 h-3">
          <div className="w-[3px] h-[4px] bg-white rounded-xs" />
          <div className="w-[3px] h-[6px] bg-white rounded-xs" />
          <div className="w-[3px] h-[8px] bg-white rounded-xs" />
          <div className="w-[3px] h-[10px] bg-white rounded-xs" />
        </div>
        <Wifi className="w-3.5 h-3.5 stroke-[2.5]" />
        <div className="flex items-center gap-0.5">
          <div className="w-[22px] h-[11px] rounded-[3px] border border-white/80 p-[1.5px] flex items-center">
            <div className="w-full h-full bg-white rounded-[1.5px]" />
          </div>
          <div className="w-[1.5px] h-[4px] bg-white/80 rounded-r-[1px]" />
        </div>
      </div>
    </div>
  );
}

interface NewWaiterShellProps {
  children: React.ReactNode;
}

export default function NewWaiterShell({ children }: NewWaiterShellProps) {
  const pathname = usePathname();
  const [liveTime, setLiveTime] = useState('9:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setLiveTime(
        now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // Login page has its own standalone full-screen splash layout
  const isLoginPage = pathname === '/new-waiter-dashboard/login';
  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <NewWaiterShellContext.Provider value={{ inShell: true }}>
      <div className="w-full min-h-screen bg-neutral-950 flex flex-col items-center justify-start p-0 sm:p-4 md:p-6 font-sans selection:bg-amber-400 selection:text-black">
        {/* Central Mobile Frame (Figma: w-96 / 384px - 420px) */}
        <div className="w-full max-w-[420px] min-h-screen sm:min-h-[868px] sm:max-h-[94vh] sm:rounded-[36px] bg-black relative flex flex-col justify-between overflow-hidden sm:border sm:border-white/10 sm:shadow-[0_0_50px_rgba(0,0,0,0.9)]">
          
          {/* Scrollable Content Container */}
          <div
            id="new-waiter-scroll-container"
            className="flex-1 overflow-y-auto pb-28 custom-scrollbar relative"
          >
            {/* iOS Top Status Bar (9:41) */}
            <MobileStatusBar currentTime={liveTime} />

            {/* Active Page View */}
            {children}
          </div>

          {/* The ONE and ONLY Persistent Bottom Dock used by all pages */}
          <BottomDock showFloorLabel={true} />
        </div>
      </div>
    </NewWaiterShellContext.Provider>
  );
}
