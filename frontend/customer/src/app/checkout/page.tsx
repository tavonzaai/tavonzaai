'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function CheckoutRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const table = searchParams.get('table') || 'Table 8';
    router.replace(`/checkout/payment?table=${encodeURIComponent(table)}`);
  }, [router, searchParams]);

  return (
    <div className="w-full min-h-screen bg-[#111111] flex items-center justify-center text-white">
      <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-screen bg-[#111111] flex items-center justify-center text-white">
          <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CheckoutRedirect />
    </Suspense>
  );
}

