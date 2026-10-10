'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import BottomDock from './BottomDock';
import NewWaiterShellContext from './NewWaiterShellContext';
import AskAiModal from '../modals/AskAiModal';
import DraggableAiButton from '../../common/DraggableAiButton';

interface NewWaiterShellProps {
  children: React.ReactNode;
}

export default function NewWaiterShell({ children }: NewWaiterShellProps) {
  const pathname = usePathname();
  const [isAskAiOpen, setIsAskAiOpen] = useState(false);

  // Login page has its own standalone full-screen splash layout
  const isLoginPage = pathname === '/new-waiter-dashboard/login';
  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <NewWaiterShellContext.Provider value={{ inShell: true }}>
      <div className="w-full min-h-screen bg-neutral-950 flex flex-col items-center justify-start p-0 sm:p-4 md:p-6 font-sans selection:bg-amber-400 selection:text-black">
        {/* Central Mobile Frame (Figma: w-96 / 384px - 420px) */}
        <div className="w-full h-[100dvh] max-w-[420px] sm:h-auto sm:min-h-[700px] sm:max-h-[94vh] md:max-w-[600px] md:min-h-[800px] lg:max-w-[420px] lg:min-h-[868px] lg:max-h-[94vh] bg-black relative flex flex-col justify-between overflow-hidden sm:border sm:border-white/10 sm:shadow-[0_0_50px_rgba(0,0,0,0.9)]"> 
          {/* Scrollable Content Container */}
          <div
            id="new-waiter-scroll-container"
            className="flex-1 overflow-y-auto pb-28 custom-scrollbar relative"
          >
            {/* Active Page View */}
            {children}
          </div>

          {/* The ONE and ONLY Persistent Bottom Dock with smooth hide/show animation across all pages */}
          <BottomDock showFloorLabel={true} forceVisible={false} />
        </div>

        {/* Draggable Floating Ask AI Assistant Button */}
        <DraggableAiButton
          isOpen={isAskAiOpen}
          onToggle={() => setIsAskAiOpen((prev) => !prev)}
          defaultBottom={96}
          defaultRight={24}
          storageKey="new_waiter_ask_ai_pos"
        />

        {/* Ask AI Assistant Floating Chat Modal */}
        <AskAiModal isOpen={isAskAiOpen} onClose={() => setIsAskAiOpen(false)} />
      </div>
    </NewWaiterShellContext.Provider>
  );
}
