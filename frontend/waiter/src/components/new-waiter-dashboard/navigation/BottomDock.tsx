'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { LayoutGrid, Home, UtensilsCrossed, Bell, User } from 'lucide-react';
import { waiterService } from '@/redux/features/waiterApi';
import { getCookie } from '@/redux/api/baseApi';

interface BottomDockProps {
  activeTab?: 'floor' | 'home' | 'order' | 'orders' | 'jarvis' | 'alert' | 'alerts' | 'profile';
  onNavigateTab?: (tab: string) => void;
  showFloorLabel?: boolean;
  forceVisible?: boolean;
  alertCount?: number;
}

export default function BottomDock({
  activeTab,
  onNavigateTab,
  showFloorLabel = true,
  forceVisible = false,
  alertCount: propAlertCount,
}: BottomDockProps) {
  const router = useRouter();
  const pathname = usePathname();
  const dockRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [liveAlertCount, setLiveAlertCount] = useState<number>(0);

  // Poll live active customer alerts from backend API GET /waiter/alerts?branchId=...
  useEffect(() => {
    let isMounted = true;
    async function fetchAlertCount() {
      try {
        const rawBranchId = getCookie('tavonza_branch_id');
        const branchId =
          rawBranchId && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(rawBranchId)
            ? rawBranchId
            : 'ce7b4318-5e2e-4fcd-a459-0e1bc80a6f27';

        const apiAlerts = await waiterService.getMyAlerts(branchId);
        if (isMounted && Array.isArray(apiAlerts)) {
          const activeCount = apiAlerts.filter(
            (a) => a.status === 'pending' || a.status === 'acknowledged'
          ).length;
          setLiveAlertCount(activeCount);
        }
      } catch (err) {
        // ignore background poll errors
      }
    }

    fetchAlertCount();
    const interval = setInterval(fetchAlertCount, 8000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const displayAlertCount = propAlertCount !== undefined ? propAlertCount : liveAlertCount;

  // Automatically derive active tab from URL route if not explicitly supplied
  const derivedTab = (() => {
    if (activeTab) return activeTab;
    if (!pathname) return 'floor';
    if (pathname.includes('/orders')) return 'order';
    if (pathname.includes('/jarvis')) return 'jarvis';
    if (pathname.includes('/alert')) return 'alert';
    if (pathname.includes('/profile')) return 'profile';
    if (pathname.includes('/floor')) return 'floor';
    return 'floor';
  })();

  const isFloorActive = derivedTab === 'floor' || derivedTab === 'home';
  const isOrderActive = derivedTab === 'order' || derivedTab === 'orders';
  const isJarvisActive = derivedTab === 'jarvis';
  const isAlertActive = derivedTab === 'alert' || derivedTab === 'alerts';
  const isProfileActive = derivedTab === 'profile';

  useEffect(() => {
    setIsVisible(true);
  }, [pathname]);

  useEffect(() => {
    if (forceVisible) {
      setIsVisible(true);
      return;
    }

    const scrollContainer = document.getElementById('new-waiter-scroll-container');
    let lastScrollY = scrollContainer
      ? scrollContainer.scrollTop
      : window.scrollY || document.documentElement.scrollTop;
    let ticking = false;

    // 1. Scroll listener (fires for container or window)
    const handleScroll = (e: Event) => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          let currentY = 0;
          const target = e.target;
          if (target === document || target === window) {
            currentY = window.scrollY || document.documentElement.scrollTop;
          } else if (target instanceof HTMLElement) {
            currentY = target.scrollTop;
          } else if (scrollContainer) {
            currentY = scrollContainer.scrollTop;
          }

          const delta = currentY - lastScrollY;

          if (delta > 4) {
            // Scrolling down -> smoothly show dock
            setIsVisible(true);
          } else if (delta < -4) {
            // Scrolling above (up) -> smoothly hide dock
            setIsVisible(false);
          }

          lastScrollY = currentY;
          ticking = false;
        });
        ticking = true;
      }
    };

    // 2. Mouse wheel / trackpad listener (instant response)
    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) < 3) return;
      if (e.deltaY > 3) {
        // Scrolling down -> show dock
        setIsVisible(true);
      } else if (e.deltaY < -3) {
        // Scrolling above (up) -> hide dock
        setIsVisible(false);
      }
    };

    // 3. Mobile touch gesture listener
    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches && e.touches[0]) {
        touchStartY = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!e.touches || !e.touches[0]) return;
      const currentY = e.touches[0].clientY;
      const delta = touchStartY - currentY;
      if (delta > 6) {
        // Finger swiped up = scrolled down -> show dock
        setIsVisible(true);
        touchStartY = currentY;
      } else if (delta < -6) {
        // Finger swiped down = scrolled above (up) -> hide dock
        setIsVisible(false);
        touchStartY = currentY;
      }
    };

    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    }
    document.addEventListener('scroll', handleScroll, { capture: true, passive: true });
    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', handleScroll);
      }
      document.removeEventListener('scroll', handleScroll, { capture: true });
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [forceVisible, pathname]);

  const handleNav = (tab: string, path: string) => {
    if (onNavigateTab) {
      onNavigateTab(tab);
    } else {
      router.push(path);
    }
  };

  return (
    <>
      {/* Subtle hover/touch activation strip at bottom so user can always reveal dock */}
      {!isVisible && (
        <div
          onMouseEnter={() => setIsVisible(true)}
          onTouchStart={() => setIsVisible(true)}
          onClick={() => setIsVisible(true)}
          className="absolute bottom-0 left-0 right-0 h-6 z-30 pointer-events-auto cursor-pointer"
        />
      )}

      <div
        ref={dockRef}
        className={`w-full h-18 bg-black/85 backdrop-blur-xl border-t border-white/10 shadow-[0px_-10px_30px_rgba(0,0,0,0.8)] flex flex-col justify-between px-3 pt-2 pb-2 absolute bottom-0 left-0 right-0 z-40 select-none transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform ${
          isVisible
            ? 'translate-y-0 opacity-100 pointer-events-auto'
            : 'translate-y-[140%] opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center justify-around w-full">
          {/* 1. Floor (matching Figma with 4-square LayoutGrid icon) */}
          <button
            onClick={() => handleNav('home', '/new-waiter-dashboard/home')}
            className="flex flex-col items-center justify-center gap-1 w-14 cursor-pointer transition-transform duration-150 active:scale-90 group"
          >
            {showFloorLabel ? (
              <Home
                className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${
                  isFloorActive
                    ? 'text-yellow-400 stroke-[2.2]'
                    : 'text-neutral-400 group-hover:text-white'
                }`}
              />
            ) : (
              <Home
                className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${
                  isFloorActive
                    ? 'text-yellow-400 stroke-[2.2]'
                    : 'text-slate-500 group-hover:text-white'
                }`}
              />
            )}
            <span
              className={`text-[10px] font-medium font-['Inter'] ${
                isFloorActive
                  ? 'text-yellow-400 font-semibold underline decoration-yellow-400'
                  : 'text-neutral-400'
              }`}
            >
              {showFloorLabel ? 'Home' : 'Floor'}
            </span>
          </button>

          {/* 2. Order */}
          <button
            onClick={() => handleNav('order', '/new-waiter-dashboard/orders')}
            className="flex flex-col items-center justify-center gap-1 w-14 cursor-pointer transition-transform duration-150 active:scale-90 group"
          >
            <UtensilsCrossed
              className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${
                isOrderActive
                  ? 'text-yellow-400 stroke-[2.2]'
                  : 'text-neutral-400 group-hover:text-white'
              }`}
            />
            <span
              className={`text-[10px] font-medium font-['Inter'] ${
                isOrderActive
                  ? 'text-yellow-400 font-semibold underline decoration-yellow-400'
                  : 'text-neutral-400'
              }`}
            >
              Order
            </span>
          </button>

          {/* 3. JARVIS Center AI Button */}
          <button
            onClick={() => handleNav('jarvis', '/new-waiter-dashboard/jarvis')}
            className="flex flex-col items-center justify-center -mt-6 cursor-pointer group transition-transform duration-150 active:scale-95"
          >
            <div
              className={`w-12 h-12 rounded-full   flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-active:scale-95 overflow-hidden ${
                isJarvisActive
                  ? 'border-2 border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.5)] ring-2 ring-yellow-400/30'
                  : 'border-2 border-neutral-500 shadow-[0_0_15px_rgba(0,0,0,0.6)]'
              }`}
            >
              <div className="relative w-full h-full overflow-hidden flex items-center justify-center">
                <Image
                  src="/images/jarvis-robot.jpg"
                  alt="JARVIS"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <span
              className={`text-[10px] font-medium font-['Inter'] mt-1 ${
                isJarvisActive
                  ? 'text-yellow-400 font-semibold underline decoration-yellow-400'
                  : 'text-violet-100/60'
              }`}
            >
              JARVIS
            </span>
          </button>

          {/* 4. Alert */}
          <button
            onClick={() => handleNav('alert', '/new-waiter-dashboard/alerts')}
            className="flex flex-col items-center justify-center gap-1 w-14 cursor-pointer transition-transform duration-150 active:scale-90 group relative"
          >
            <div className="relative">
              <Bell
                className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${
                  isAlertActive
                    ? 'text-yellow-400 stroke-[2.2]'
                    : 'text-neutral-400 group-hover:text-white'
                }`}
              />
              {displayAlertCount > 0 && (
                <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center absolute -top-1 -right-2 text-white text-[9px] font-bold animate-pulse shadow-sm">
                  {displayAlertCount > 99 ? '99+' : displayAlertCount}
                </div>
              )}
            </div>
            <span
              className={`text-[10px] font-medium font-['Inter'] ${
                isAlertActive
                  ? 'text-yellow-400 font-semibold underline decoration-yellow-400'
                  : 'text-neutral-400'
              }`}
            >
              Alert
            </span>
          </button>

          {/* 5. Profile */}
          <button
            onClick={() => handleNav('profile', '/new-waiter-dashboard/profile')}
            className="flex flex-col items-center justify-center gap-1 w-14 cursor-pointer transition-transform duration-150 active:scale-90 group"
          >
            <User
              className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${
                isProfileActive
                  ? 'text-yellow-400 stroke-[2.2]'
                  : 'text-violet-100/60 group-hover:text-white'
              }`}
            />
            <span
              className={`text-[10px] font-medium font-['Inter'] ${
                isProfileActive
                  ? 'text-yellow-400 font-semibold underline decoration-yellow-400'
                  : 'text-violet-100/60'
              }`}
            >
              Profile
            </span>
          </button>
        </div>
      </div>
    </>
  );
}
