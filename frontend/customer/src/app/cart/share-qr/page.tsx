'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  RefreshCw,
  Share2,
  Check,
  Users,
  Sparkles,
  CheckCircle2,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import DesktopSplitLayout from '@/components/layout/DesktopSplitLayout';

// Authentic Dynamic QR Code SVG matching Figma styling
function DynamicQrCodeSvg({ code }: { code: string }) {
  return (
    <div className="relative w-44 h-44 bg-black/90 p-2.5 rounded-lg flex items-center justify-center border border-[#FFB900]">
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        shapeRendering="crispEdges"
      >
        {/* Finder Patterns (Top-Left, Top-Right, Bottom-Left) */}
        {/* Top-Left */}
        <rect x="6" y="6" width="24" height="24" fill="#FFB900" />
        <rect x="9" y="9" width="18" height="18" fill="black" />
        <rect x="12" y="12" width="12" height="12" fill="white" />

        {/* Top-Right */}
        <rect x="70" y="6" width="24" height="24" fill="#FFB900" />
        <rect x="73" y="9" width="18" height="18" fill="black" />
        <rect x="76" y="12" width="12" height="12" fill="white" />

        {/* Bottom-Left */}
        <rect x="6" y="70" width="24" height="24" fill="#FFB900" />
        <rect x="9" y="73" width="18" height="18" fill="black" />
        <rect x="12" y="76" width="12" height="12" fill="white" />

        {/* Alignment Pattern */}
        <rect x="68" y="68" width="14" height="14" fill="#FFB900" />
        <rect x="71" y="71" width="8" height="8" fill="black" />
        <rect x="73" y="73" width="4" height="4" fill="white" />

        {/* Timing Lines */}
        <rect x="34" y="12" width="4" height="4" fill="white" />
        <rect x="42" y="12" width="4" height="4" fill="white" />
        <rect x="50" y="12" width="4" height="4" fill="white" />
        <rect x="58" y="12" width="4" height="4" fill="white" />
        <rect x="12" y="34" width="4" height="4" fill="white" />
        <rect x="12" y="42" width="4" height="4" fill="white" />
        <rect x="12" y="50" width="4" height="4" fill="white" />
        <rect x="12" y="58" width="4" height="4" fill="white" />

        {/* QR Data Matrix modules */}
        <rect x="34" y="24" width="6" height="6" fill="#FFB900" />
        <rect x="44" y="24" width="6" height="6" fill="white" />
        <rect x="54" y="24" width="6" height="6" fill="#FFB900" />
        <rect x="34" y="34" width="8" height="8" fill="white" />
        <rect x="46" y="36" width="6" height="6" fill="#FFB900" />
        <rect x="56" y="34" width="8" height="8" fill="white" />
        <rect x="24" y="44" width="6" height="6" fill="white" />
        <rect x="34" y="46" width="6" height="6" fill="#FFB900" />
        <rect x="44" y="44" width="12" height="12" fill="#FFB900" />
        <rect x="60" y="46" width="6" height="6" fill="white" />
        <rect x="70" y="44" width="6" height="6" fill="#FFB900" />
        <rect x="80" y="46" width="6" height="6" fill="white" />
        <rect x="24" y="56" width="6" height="6" fill="#FFB900" />
        <rect x="36" y="58" width="6" height="6" fill="white" />
        <rect x="46" y="56" width="6" height="6" fill="#FFB900" />
        <rect x="56" y="58" width="6" height="6" fill="white" />
        <rect x="66" y="56" width="6" height="6" fill="#FFB900" />
        <rect x="34" y="68" width="8" height="8" fill="white" />
        <rect x="46" y="70" width="6" height="6" fill="#FFB900" />
        <rect x="56" y="68" width="8" height="8" fill="white" />
        <rect x="34" y="80" width="6" height="6" fill="#FFB900" />
        <rect x="44" y="80" width="6" height="6" fill="white" />
        <rect x="54" y="80" width="6" height="6" fill="#FFB900" />
      </svg>

      {/* Center Tavonza Golden Token */}
      <div className="absolute inset-0 m-auto w-9 h-9 rounded-full bg-neutral-950 border border-[#FFB900] flex items-center justify-center text-yellow-400 text-xs font-bold font-poppins shadow-md">
        T
      </div>
    </div>
  );
}

interface FriendSlot {
  id: number;
  name: string;
  role: string;
  status: 'connected' | 'waiting';
  orderStatus: 'ready' | 'ordering' | 'waiting';
  avatar: string;
  itemsCount: number;
  total: number;
}

function ShareQrContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { tableNumber, totalAmount, cart } = useCart();

  const activeTable = searchParams.get('table') || tableNumber || 'Table 08';

  const [sessionCode, setSessionCode] = useState('TVZ-8841-GRP');
  const [secondsRemaining, setSecondsRemaining] = useState(30);
  const [isCopied, setIsCopied] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedFriendModal, setSelectedFriendModal] = useState<FriendSlot | null>(null);

  // 4 Friends at Table 08
  const [friends, setFriends] = useState<FriendSlot[]>([
    {
      id: 1,
      name: 'You (Host)',
      role: 'Host',
      status: 'connected',
      orderStatus: 'ready',
      avatar: '👑',
      itemsCount: cart.length > 0 ? cart.length : 2,
      total: totalAmount > 0 ? totalAmount : 38.0,
    },
    {
      id: 2,
      name: 'Alex M.',
      role: 'Guest 1',
      status: 'connected',
      orderStatus: 'ready',
      avatar: '🙋‍♂️',
      itemsCount: 2,
      total: 24.5,
    },
    {
      id: 3,
      name: 'Sarah K.',
      role: 'Guest 2',
      status: 'connected',
      orderStatus: 'ready',
      avatar: '🙋‍♀️',
      itemsCount: 1,
      total: 16.0,
    },
    {
      id: 4,
      name: 'Friend 4',
      role: 'Guest 3',
      status: 'waiting',
      orderStatus: 'waiting',
      avatar: '⏳',
      itemsCount: 0,
      total: 0.0,
    },
  ]);

  // Check if all 4 friends completed their process
  const all4Connected = friends.every((f) => f.status === 'connected');
  const all4ProcessComplete = friends.every(
    (f) => f.status === 'connected' && f.orderStatus === 'ready'
  );

  // 30-second live countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          handleGenerateNewCode();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleGenerateNewCode = () => {
    setIsSpinning(true);
    const randomHex = Math.floor(1000 + Math.random() * 9000);
    setSessionCode(`TVZ-${randomHex}-GRP`);
    setSecondsRemaining(30);
    setTimeout(() => setIsSpinning(false), 500);
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/scan?table=${encodeURIComponent(
      activeTable
    )}&connect=${encodeURIComponent(sessionCode)}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join ${activeTable} at Tavonza`,
          text: `Join ${activeTable} to order individually from your phone!`,
          url: shareUrl,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 3000);
    } catch {
      alert(`Share link copied: ${shareUrl}`);
    }
  };

  // Simulate 4th friend connecting and completing their process
  const handleToggleFriend4 = () => {
    setFriends((prev) =>
      prev.map((f) => {
        if (f.id === 4) {
          if (f.status === 'waiting') {
            return {
              ...f,
              name: 'Liam D.',
              status: 'connected',
              orderStatus: 'ready',
              avatar: '🙋‍♂️',
              itemsCount: 2,
              total: 22.0,
            };
          } else {
            return {
              ...f,
              name: 'Friend 4',
              status: 'waiting',
              orderStatus: 'waiting',
              avatar: '⏳',
              itemsCount: 0,
              total: 0.0,
            };
          }
        }
        return f;
      })
    );
  };

  const handleProceedIndividualOrder = () => {
    const lastId = typeof window !== 'undefined' ? (localStorage.getItem('tavonza_last_submitted_order_id') || '') : '';
    const orderParam = lastId ? `&order=${encodeURIComponent(lastId)}` : '';
    router.push(
      `/orders/waiting?table=${encodeURIComponent(
        activeTable
      )}&mode=individual&session=${encodeURIComponent(sessionCode)}${orderParam}`
    );
  };

  const formattedSeconds = String(secondsRemaining).padStart(2, '0');

  return (
    <DesktopSplitLayout
      imageSrc="/images/slide3.jpg"
      imageAlt="Tavonza Private Table QR"
      badgeText="Private Table Connect"
      activeTable={activeTable}
      headline={
        <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight leading-tight font-poppins">
          Invite Friends to <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500">
            Order Individually
          </span>
        </h1>
      }
      subheadline="Share your private table QR code with up to 4 guests. Each person scans and orders on their own phone under Table 08."
      sideFooterExtra={
        <div className="p-4 bg-neutral-900/80 border border-neutral-700/60 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-400/20 text-yellow-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-white text-xs font-semibold font-montserrat">Connected Friends</span>
              <span className="text-yellow-400 text-sm font-bold">
                {friends.filter((f) => f.status === 'connected').length} of 4 Joined
              </span>
            </div>
          </div>
          <span className="text-xs text-emerald-400 font-mono font-semibold">
            {all4ProcessComplete ? '4/4 Ready' : 'In Progress'}
          </span>
        </div>
      }
    >
      <div className="w-full flex flex-col gap-6">
        
        {/* Status Bar / Back Navigation */}
        <header className="w-full flex items-center justify-between pt-1">
          {/* Back button from Figma: width 20, height 20 in round #191818 */}
          <button
            type="button"
            onClick={() => router.back()}
            className="w-9 h-9 bg-[#191818] border border-neutral-800 rounded-full flex items-center justify-center hover:bg-neutral-800 transition cursor-pointer"
            title="Go Back"
          >
            <ArrowLeft className="w-4 h-4 text-white" />
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400 font-montserrat">
              Active Table: <span className="text-white font-semibold">{activeTable}</span>
            </span>
          </div>
        </header>

        {/* ============================================================== */}
        {/* FIGMA SPEC CARD: "SCAN QR Code" Container */}
        {/* Outline: 1px rgba(255, 255, 255, 0.10) solid, Radius: 10px */}
        {/* ============================================================== */}
        <div
          className="w-full rounded-[10px] p-6 sm:p-7 flex flex-col items-center gap-6 shadow-2xl relative text-center"
          style={{
            background: 'rgba(255, 255, 255, 0.02)',
            outline: '1px rgba(255, 255, 255, 0.10) solid',
            outlineOffset: '-1px',
          }}
        >
          {/* Title Header */}
          <div className="flex flex-col items-center gap-2.5 max-w-[280px]">
            <h1 className="text-2xl font-medium font-poppins tracking-[1px] leading-tight">
              <span className="text-[#B88548] font-semibold">SCAN</span>{' '}
              <span className="text-white font-semibold">QR Code</span>
            </h1>
            <p className="text-[#979797] text-xs font-poppins leading-[15.6px] font-normal">
              Your QR code is private. If you share it with your guest, they can scan it with their camera to add you as a connect.
            </p>
          </div>

          {/* Golden Framed QR Code Section (200px box with 2px #FFB900 border) */}
          <div className="flex flex-col items-center gap-4">
            <div
              className="w-[200px] h-[198px] rounded-[12px] flex items-center justify-center relative shadow-[0_0_24px_rgba(255,185,0,0.20)]"
              style={{
                background: 'rgba(17.16, 17.16, 17.16, 0.70)',
                border: '2px #FFB900 solid',
              }}
            >
              <DynamicQrCodeSvg code={sessionCode} />
            </div>

            {/* Countdown Timer from Figma */}
            <div className="inline-flex items-center gap-1.5 font-poppins">
              <span className="text-[#ACACAC] text-sm font-normal">Time:</span>
              <span className="text-[#FA6C6C] text-xs font-medium tracking-wide">
                00:{formattedSeconds}sec
              </span>
            </div>
          </div>

          {/* Generate New Code Link from Figma */}
          <button
            type="button"
            onClick={handleGenerateNewCode}
            className="inline-flex items-center gap-2 text-white hover:text-yellow-400 transition cursor-pointer text-base font-inter font-normal active:scale-95 group"
          >
            <RefreshCw
              className={`w-4 h-4 text-white group-hover:text-yellow-400 transition-transform ${
                isSpinning ? 'animate-spin' : ''
              }`}
            />
            <span>Generate new code</span>
          </button>

          {/* Figma Share Button: w-full, height 36px, bg #FFD60A, rounded 8px */}
          <button
            type="button"
            onClick={handleShare}
            className="w-full max-w-[322px] h-[38px] bg-[#FFD60A] hover:bg-yellow-300 active:scale-[0.99] text-black text-sm font-inter font-semibold rounded-[8px] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0px_4px_14px_rgba(255,214,10,0.30)]"
          >
            {isCopied ? (
              <>
                <Check className="w-4 h-4 text-black stroke-[3]" />
                <span>Link Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 text-black" />
                <span>Share</span>
              </>
            )}
          </button>

        </div>

        {/* ============================================================== */}
        {/* 4 FRIENDS TABLE PROCESS STATUS TRACKER */}
        {/* ============================================================== */}
        <div className="w-full bg-[#111111]/90 border border-neutral-800 rounded-xl p-4 sm:p-5 flex flex-col gap-3.5 shadow-lg">
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-yellow-400" />
              <h2 className="text-white text-sm font-semibold font-montserrat">
                4 Friends Status at {activeTable}
              </h2>
            </div>

            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                all4ProcessComplete
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }`}
            >
              {friends.filter((f) => f.orderStatus === 'ready').length}/4 Process Complete
            </span>
          </div>

          {/* 4 Friends Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            {friends.map((friend) => {
              const isReady = friend.orderStatus === 'ready';
              const isWaiting = friend.status === 'waiting';

              return (
                <div
                  key={friend.id}
                  onClick={() => setSelectedFriendModal(friend)}
                  className={`p-3 rounded-xl border flex flex-col gap-1.5 transition cursor-pointer relative overflow-hidden ${
                    isReady
                      ? 'bg-neutral-900/90 border-amber-500/40 hover:border-amber-400'
                      : 'bg-neutral-950/70 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-lg">{friend.avatar}</span>
                    {isReady ? (
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        Ready
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] text-zinc-400 font-medium bg-neutral-800 px-1.5 py-0.5 rounded-md">
                        <Clock className="w-2.5 h-2.5" />
                        Waiting
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col min-w-0">
                    <span className="text-white text-xs font-semibold font-montserrat truncate">
                      {friend.name}
                    </span>
                    <span className="text-zinc-400 text-[11px] font-poppins">
                      {isReady
                        ? `${friend.itemsCount} items ($${friend.total.toFixed(2)})`
                        : 'Scanning QR code...'}
                    </span>
                  </div>

                  <span className="text-[10px] text-yellow-500/80 hover:text-yellow-400 font-medium underline pt-0.5">
                    Click to view details
                  </span>
                </div>
              );
            })}
          </div>

          {/* Helper simulator toggle to test 4th friend completing process */}
          <div className="pt-1 flex items-center justify-between border-t border-neutral-800/80 text-xs">
            <span className="text-zinc-400 text-[11px]">Testing 4-friend flow:</span>
            <button
              type="button"
              onClick={handleToggleFriend4}
              className="text-[11px] text-amber-400 hover:text-yellow-300 font-medium underline transition cursor-pointer"
            >
              {friends[3].status === 'waiting'
                ? '+ Simulate Friend 4 Joining & Ready'
                : 'Reset Friend 4 to Waiting'}
            </button>
          </div>
        </div>

        {/* ALL 4 PROCESS COMPLETE CELEBRATION BANNER */}
        {all4ProcessComplete && (
          <div className="w-full bg-gradient-to-r from-emerald-500/20 via-emerald-500/10 to-neutral-900 border border-emerald-500/40 rounded-xl p-3.5 flex items-center gap-3 animate-in fade-in zoom-in-95">
            <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-400">
              <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-white text-xs font-semibold font-montserrat">
                All 4 Friends Complete!
              </span>
              <span className="text-zinc-300 text-[11px] font-poppins">
                Everyone has selected their dishes. You can now place your individual order!
              </span>
            </div>
          </div>
        )}

        {/* BOTTOM CTA: Order Individually */}
        <div className="w-full pt-1 flex flex-col gap-2">
          <button
            type="button"
            onClick={handleProceedIndividualOrder}
            className={`w-full py-3.5 text-base font-semibold font-inter rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg ${
              all4ProcessComplete
                ? 'bg-yellow-400 hover:bg-yellow-300 text-neutral-950 shadow-[0px_6px_20px_rgba(227,172,56,0.40)]'
                : 'bg-white hover:bg-neutral-200 text-[#0B0B0B]'
            }`}
          >
            <span>
              {all4ProcessComplete
                ? 'All 4 Ready: Order Individually Now'
                : 'Proceed to Order Individually'}
            </span>
            <span>&rarr;</span>
          </button>

          <p className="text-center text-[11px] text-zinc-500 font-poppins">
            Each friend will pay for their own items individually at Table 08.
          </p>
        </div>

      </div>

      {/* INDIVIDUAL FRIEND DETAILS MODAL */}
      {selectedFriendModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex flex-col gap-4 text-left shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{selectedFriendModal.avatar}</span>
                <div className="flex flex-col">
                  <h3 className="text-white text-sm font-semibold font-montserrat">
                    {selectedFriendModal.name}
                  </h3>
                  <span className="text-[11px] text-zinc-400">
                    {selectedFriendModal.role} • {activeTable}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedFriendModal(null)}
                className="text-zinc-400 hover:text-white text-xs px-2 py-1 rounded bg-neutral-800 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-2 text-xs font-montserrat">
              <div className="flex justify-between py-1 border-b border-neutral-800/50">
                <span className="text-zinc-400">Connection Status:</span>
                <span className="text-white font-medium capitalize">
                  {selectedFriendModal.status}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-800/50">
                <span className="text-zinc-400">Order Process:</span>
                <span
                  className={
                    selectedFriendModal.orderStatus === 'ready'
                      ? 'text-emerald-400 font-semibold'
                      : 'text-amber-400 font-semibold'
                  }
                >
                  {selectedFriendModal.orderStatus === 'ready'
                    ? 'Selection Complete (Ready to Order)'
                    : 'Awaiting Selection'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-800/50">
                <span className="text-zinc-400">Items in Individual Cart:</span>
                <span className="text-white font-medium">
                  {selectedFriendModal.itemsCount} items
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-zinc-400">Subtotal:</span>
                <span className="text-yellow-400 font-semibold">
                  ${selectedFriendModal.total.toFixed(2)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedFriendModal(null)}
              className="w-full py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold font-inter rounded-xl transition cursor-pointer"
            >
              Close Details
            </button>
          </div>
        </div>
      )}
    </DesktopSplitLayout>
  );
}

export default function ShareQrPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-screen bg-black flex items-center justify-center text-white">
          <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ShareQrContent />
    </Suspense>
  );
}
