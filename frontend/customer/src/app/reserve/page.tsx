'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import InstantReserveModal from '@/components/dashboard/InstantReserveModal';

export default function ReservePage() {
  const router = useRouter();

  return (
    <div className="w-full min-h-screen bg-black text-white flex flex-col justify-center items-center p-4 relative font-sans">
      <InstantReserveModal
        restaurantName="Maison Verde - Tuscan Trattoria"
        onClose={() => router.push('/menu')}
        onSuccess={() => router.push('/menu')}
      />
    </div>
  );
}
