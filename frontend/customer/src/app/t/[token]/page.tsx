'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { setCookie } from '@/redux/api/baseApi';

export default function TableJoinPage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const token = params?.token;

  useEffect(() => {
    if (!token) return;
    setCookie('tavonza_qr_token', token);
    router.replace(`/login?qr=${encodeURIComponent(token)}`);
  }, [token, router]);

  return (
    <div className="w-full min-h-screen bg-black flex flex-col items-center justify-center text-white p-4">
      <div className="w-10 h-10 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-stone-300 text-sm font-medium tracking-wide">Opening your table...</p>
    </div>
  );
}
