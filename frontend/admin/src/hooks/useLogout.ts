'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { logoutAdminSession } from '@/lib/auth';
import { useAppDispatch } from '@/redux/store';
import { setUser } from '@/redux/slices/authSlice';
import { logoutUser } from '@/redux/features/authApi';

export function useLogout() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser());
    } catch {
      // Ignore network errors on logout
    } finally {
      logoutAdminSession();
      dispatch(setUser(null));
      toast.success('Admin console session logged out.');
      router.replace('/login');
    }
  };

  return { handleLogout };
}
