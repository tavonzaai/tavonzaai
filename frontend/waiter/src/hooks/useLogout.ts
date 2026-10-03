'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { logoutWaiterSession } from '@/lib/auth';
import { useAppDispatch } from '@/redux/store';
import { setUser } from '@/redux/slices/authSlice';

export function useLogout() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const handleLogout = async () => {
    logoutWaiterSession();
    dispatch(setUser(null));
    toast.success('Waiter shift locked and logged out.');
    router.replace('/login');
  };

  return { handleLogout };
}
