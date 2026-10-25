// ============================================================================
// Query Builder Types & Contracts
// ============================================================================

import type { SQL, SQLWrapper } from 'drizzle-orm';
import type { PgColumn, PgTable } from 'drizzle-orm/pg-core';

export type SortOrder = 'asc' | 'desc' | 'ASC' | 'DESC';

export interface PaginationParams {
  page?: number | string | null;
  limit?: number | string | null;
  maxLimit?: number;
  defaultLimit?: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  totalPage: number; // Backward compatibility alias
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface RangeFilterValue<T = any> {
  gt?: T | null;
  gte?: T | null;
  lt?: T | null;
  lte?: T | null;
}

export interface SoftDeleteOptions {
  column?: PgColumn | any;
  activeValue?: any;
  deletedValue?: any;
  includeDeleted?: boolean;
}

export interface JoinDefinition {
  type: 'inner' | 'left' | 'right' | 'full';
  table: PgTable | any;
  on: SQL | SQLWrapper;
}

export interface BaseQueryFilterOptions {
  search?: string | null;
  searchColumns?: (PgColumn | SQL | any)[];
  page?: number | string | null;
  limit?: number | string | null;
  sortBy?: string | PgColumn | any;
  sortOrder?: SortOrder | null;
  includeDeleted?: boolean;
}
