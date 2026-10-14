import type { PaginationMeta } from '@tavonza/contracts';

export const DEFAULT_PAGE_SIZE = 12;
export const PAGE_SIZE_OPTIONS = [12, 24, 48];

export function buildPaginationMeta(
  page: number,
  limit: number,
  total: number,
): PaginationMeta {
  const totalPages = Math.max(1, Math.ceil(total / limit) || 1);
  const safePage = Math.min(Math.max(1, page), totalPages);
  return {
    page: safePage,
    limit,
    total,
    totalPages,
    hasNextPage: safePage < totalPages,
    hasPreviousPage: safePage > 1,
  };
}

export function paginateItems<T>(
  items: T[],
  page: number,
  limit: number = DEFAULT_PAGE_SIZE,
): { items: T[]; meta: PaginationMeta } {
  const meta = buildPaginationMeta(page, limit, items.length);
  const start = (meta.page - 1) * limit;
  return {
    items: items.slice(start, start + limit),
    meta,
  };
}
