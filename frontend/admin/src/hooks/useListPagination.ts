'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { DEFAULT_PAGE_SIZE } from '@/lib/pagination';

export function useListPagination(options?: { enabled?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const enabled = options?.enabled !== false;

  const page = useMemo(() => {
    const raw = Number(searchParams.get('page') || '1');
    return Number.isFinite(raw) && raw >= 1 ? Math.floor(raw) : 1;
  }, [searchParams]);

  const setPage = useCallback(
    (next: number) => {
      if (!enabled) return;
      const params = new URLSearchParams(searchParams.toString());
      const safe = Math.max(1, Math.floor(Number(next) || 1));
      if (safe <= 1) params.delete('page');
      else params.set('page', String(safe));
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [enabled, pathname, router, searchParams],
  );

  const resetPage = useCallback(() => setPage(1), [setPage]);

  const clampToTotalPages = useCallback(
    (totalPages?: number) => {
      if (typeof totalPages === 'number' && totalPages > 0 && page > totalPages) {
        setPage(totalPages);
      }
    },
    [page, setPage],
  );

  return { page, limit: DEFAULT_PAGE_SIZE, setPage, resetPage, clampToTotalPages };
}

export function useClampPage(page: number, totalPages: number | undefined, setPage: (page: number) => void) {
  useEffect(() => {
    if (typeof totalPages === 'number' && totalPages > 0 && page > totalPages) {
      setPage(totalPages);
    }
  }, [page, setPage, totalPages]);
}

export function useClientPage(resetKey?: string | number) {
  const [page, setPage] = useState(1);
  useEffect(() => {
    setPage(1);
  }, [resetKey]);
  return { page, limit: DEFAULT_PAGE_SIZE, setPage };
}
