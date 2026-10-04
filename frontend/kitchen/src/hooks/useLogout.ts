'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { logoutKitchenSession } from '@/lib/auth';
import { useAppDispatch } from '@/redux/store';
import { setUser } from '@/redux/slices/authSlice';
import { logoutUser } from '@/redux/features/authApi';

export function useLogout() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser());
    } catch {}
    logoutKitchenSession();
    dispatch(setUser(null));
    toast.success('Kitchen shift signed out. Station locked.');
    router.replace('/login');
  };

  return { handleLogout };
}
