export interface PaginationParams {
  page?: number | string | null;
  limit?: number | string | null;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  totalPage?: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface BaseQueryParams extends PaginationParams {
  search?: string | null;
  sortBy?: string | null;
  sortOrder?: 'asc' | 'desc' | 'ASC' | 'DESC' | null;
  includeDeleted?: boolean;
}

export interface ApiResponse<T = any> {
  statusCode?: number;
  success?: boolean;
  message: string;
  data: T;
  meta?: PaginationMeta | any;
}
