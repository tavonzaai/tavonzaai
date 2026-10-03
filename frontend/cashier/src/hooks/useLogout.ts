'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { logoutCashierSession } from '@/lib/auth';
import { useAppDispatch } from '@/redux/store';
import { setUser } from '@/redux/slices/authSlice';

export function useLogout() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const handleLogout = async () => {
    logoutCashierSession();
    dispatch(setUser(null));
    toast.success('Terminal shift locked. Cash drawer reconciliation logged.');
    router.replace('/login');
  };

  return { handleLogout };
}
