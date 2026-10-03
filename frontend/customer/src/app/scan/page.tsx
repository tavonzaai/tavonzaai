'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, QrCode, CheckCircle2, Users, ArrowRight } from 'lucide-react';
import { TavonzaLogoIcon } from '@/components/TavonzaLogo';
import { setCookie } from '@/redux/api/baseApi';

function ScanRedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [status, setStatus] = useState<'verifying' | 'connected' | 'redirecting'>('verifying');
  const tableParam = searchParams.get('table') || 'Table 08';
  const connectParam = searchParams.get('connect');

  const formattedTable = tableParam.toLowerCase().startsWith('table')
    ? tableParam
    : `Table ${tableParam.padStart(2, '0')}`;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCookie('tavonza_table', formattedTable);
      if (connectParam) {
        setCookie('tavonza_connected_session', connectParam);
        setCookie('tavonza_guest_mode', 'individual');
      }
    }

    if (connectParam) {
      // Connect to table session flow (for friends scanning host QR code)
      const t1 = setTimeout(() => setStatus('connected'), 600);
      const t2 = setTimeout(() => {
        router.replace(
          `/menu?table=${encodeURIComponent(formattedTable)}&connected=true&connect=${encodeURIComponent(connectParam)}`
        );
      }, 1600);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    } else {
      // Standard scan table flow
      const t = setTimeout(() => {
        router.replace(`/register?table=${encodeURIComponent(formattedTable)}`);
      }, 800);
      return () => clearTimeout(t);
    }
  }, [router, formattedTable, connectParam]);

  return (
    <div className="w-full min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 select-none font-sans">
      <div className="w-full max-w-sm bg-neutral-950 border border-neutral-800 rounded-2xl p-6 sm:p-8 flex flex-col items-center gap-6 shadow-2xl text-center">
        <TavonzaLogoIcon className="w-14 h-14 text-yellow-400" />

        {connectParam ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              {status === 'connected' ? (
                <CheckCircle2 className="w-6 h-6 text-green-400 animate-in zoom-in" />
              ) : (
                <Users className="w-6 h-6 text-yellow-400 animate-pulse" />
              )}
            </div>

            <div className="flex flex-col gap-1">
              <h1 className="text-white text-lg font-semibold font-poppins">
                {status === 'connected' ? 'Connected to Table Session!' : 'Joining Table Session...'}
              </h1>
              <p className="text-neutral-400 text-xs font-montserrat">
                {formattedTable} • Session: <span className="text-yellow-400 font-mono">{connectParam}</span>
              </p>
            </div>

            <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-zinc-300 font-montserrat leading-relaxed">
              You are connected with your friends. You can now browse the menu and <span className="text-yellow-400 font-semibold">order individually</span> under this table!
            </div>

            <button
              type="button"
              onClick={() =>
                router.replace(
                  `/menu?table=${encodeURIComponent(formattedTable)}&connected=true&connect=${encodeURIComponent(connectParam)}`
                )
              }
              className="w-full mt-2 py-3 bg-yellow-400 hover:bg-yellow-300 text-neutral-950 text-sm font-semibold font-inter rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <span>Go to Menu & Order</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 animate-pulse">
            <div className="flex items-center gap-2 text-stone-300 text-sm font-montserrat">
              <QrCode className="w-4 h-4 text-yellow-400" />
              <span>Table {formattedTable} Verified. Loading...</span>
            </div>
            <Loader2 className="w-6 h-6 text-yellow-400 animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}

export default function ScanPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-screen bg-black flex items-center justify-center text-white">
          <Loader2 className="w-8 h-8 text-yellow-400 animate-spin" />
        </div>
      }
    >
      <ScanRedirectContent />
    </Suspense>
  );
}
