'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function HomeRedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const params = searchParams.toString();
    const target = params ? `/menu?${params}` : '/menu';
    router.replace(target);
  }, [router, searchParams]);

  return (
    <div className="w-full min-h-screen bg-black flex flex-col items-center justify-center text-white p-4">
      <div className="w-10 h-10 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-stone-300 text-sm font-medium tracking-wide">
        Redirecting to Tavonza Menu...
      </p>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-screen bg-black flex items-center justify-center text-white">
          <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <HomeRedirectContent />
    </Suspense>
  );
}
