'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { logoutAdminSession } from '@/lib/auth';
import { useAppDispatch } from '@/redux/store';
import { logout } from '@/redux/slices/authSlice';
import { logoutUser } from '@/redux/features/authApi';
import { rtkBaseApi } from '@/redux/api/baseApi';

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
      dispatch(logout());
      dispatch(rtkBaseApi.util.resetApiState());
      toast.success('Admin console session logged out.');
      router.replace('/login');
    }
  };

  return { handleLogout };
}
