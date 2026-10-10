// ============================================================================
// Drizzle Query Builder — Standardized Query Construction Engine
// ============================================================================

import {
  SQL,
  SQLWrapper,
  sql,
  and,
  or,
  eq,
  ne,
  inArray,
  isNull,
  isNotNull,
  ilike,
  gt,
  gte,
  lt,
  lte,
  asc,
  desc,
} from 'drizzle-orm';
import type { PgColumn, PgTable } from 'drizzle-orm/pg-core';
import type { DrizzleDatabase } from '@tavonza/database';
import type {
  SortOrder,
  PaginationParams,
  PaginationMeta,
  PaginatedResult,
  RangeFilterValue,
  SoftDeleteOptions,
  JoinDefinition,
  BaseQueryFilterOptions,
} from './query-builder.types';

export class DrizzleQueryBuilder<TTable extends PgTable = any> {
  private selection: Record<string, any> | null = null;
  private conditions: (SQL | SQLWrapper)[] = [];
  private orderClauses: (SQL | SQLWrapper)[] = [];
  private joins: JoinDefinition[] = [];
  private page = 1;
  private limit: number | null = null;
  private paginationConfigured = false;
  private afterExecuteHook?: (rows: any[]) => Promise<any[]> | any[];

  constructor(
    private readonly db: DrizzleDatabase,
    private readonly table: TTable,
  ) {}

  /**
   * Factory method to start building a query on a given table.
   */
  static from<T extends PgTable>(db: DrizzleDatabase, table: T): DrizzleQueryBuilder<T> {
    return new DrizzleQueryBuilder<T>(db, table);
  }

  /**
   * Specify fields to select. If omitted, selects default columns from table.
   */
  select<TSelection extends Record<string, any>>(fields: TSelection): this {
    this.selection = fields;
    return this;
  }

  /**
   * Append one or more raw SQL conditions (joined via AND).
   */
  where(...conditions: (SQL | SQLWrapper | undefined | null | false)[]): this {
    for (const cond of conditions) {
      if (cond) {
        this.conditions.push(cond);
      }
    }
    return this;
  }

  andWhere(...conditions: (SQL | SQLWrapper | undefined | null | false)[]): this {
    return this.where(...conditions);
  }

  /**
   * Append a composite OR group of conditions.
   */
  orWhere(...conditions: (SQL | SQLWrapper | undefined | null | false)[]): this {
    const valid = conditions.filter(Boolean) as (SQL | SQLWrapper)[];
    if (valid.length > 0) {
      this.conditions.push(or(...valid)!);
    }
    return this;
  }

  /**
   * Add exact match equality filters for key-value pairs.
   * Empty string, undefined, and null values are safely ignored.
   */
  filterExact(
    filters: Record<string, any> | undefined | null,
    columnMap?: Record<string, PgColumn | any>,
  ): this {
    if (!filters) return this;

    for (const [key, value] of Object.entries(filters)) {
      if (value === undefined || value === null || value === '') continue;

      const column = columnMap?.[key] ?? (this.table as any)[key];
      if (column) {
        this.conditions.push(eq(column, value));
      }
    }
    return this;
  }

  /**
   * Add IN array filters for key-value array pairs.
   */
  filterIn(
    filters: Record<string, any[] | undefined | null> | undefined | null,
    columnMap?: Record<string, PgColumn | any>,
  ): this {
    if (!filters) return this;

    for (const [key, list] of Object.entries(filters)) {
      if (!Array.isArray(list) || list.length === 0) continue;
      const column = columnMap?.[key] ?? (this.table as any)[key];
      if (column) {
        this.conditions.push(inArray(column, list));
      }
    }
    return this;
  }

  /**
   * Add range filters (gte, lte, gt, lt).
   */
  filterRange(
    column: PgColumn | SQL | any,
    range?: RangeFilterValue | null,
  ): this {
    if (!column || !range) return this;

    if (range.gte !== undefined && range.gte !== null && range.gte !== '') {
      this.conditions.push(gte(column, range.gte));
    }
    if (range.gt !== undefined && range.gt !== null && range.gt !== '') {
      this.conditions.push(gt(column, range.gt));
    }
    if (range.lte !== undefined && range.lte !== null && range.lte !== '') {
      this.conditions.push(lte(column, range.lte));
    }
    if (range.lt !== undefined && range.lt !== null && range.lt !== '') {
      this.conditions.push(lt(column, range.lt));
    }
    return this;
  }

  /**
   * Add IS NULL or IS NOT NULL check.
   */
  filterNull(column: PgColumn | any, shouldBeNull: boolean): this {
    if (!column) return this;
    this.conditions.push(shouldBeNull ? isNull(column) : isNotNull(column));
    return this;
  }

  /**
   * Full-text / substring search using ILIKE across one or multiple columns.
   */
  search(
    term?: string | null,
    columns?: (PgColumn | SQL | any)[] | PgColumn | any,
  ): this {
    if (!term || typeof term !== 'string') return this;
    const trimmed = term.trim();
    if (!trimmed) return this;

    const cols: (PgColumn | SQL)[] = Array.isArray(columns)
      ? columns
      : columns
        ? [columns]
        : [];

    if (cols.length === 0) return this;

    const pattern = `%${trimmed}%`;
    const searchConditions = cols
      .filter(Boolean)
      .map((col) => ilike(col as any, pattern));

    if (searchConditions.length > 0) {
      this.conditions.push(or(...searchConditions)!);
    }
    return this;
  }

  /**
   * Soft-delete handling.
   * If includeDeleted is false or omitted, adds condition to exclude deleted records.
   */
  softDelete(options?: SoftDeleteOptions | boolean): this {
    if (options === true) {
      // Shorthand for including deleted
      return this;
    }

    const opts: SoftDeleteOptions = typeof options === 'object' && options !== null ? options : {};
    if (opts.includeDeleted) {
      return this;
    }

    const col = opts.column ?? (this.table as any).isActive ?? (this.table as any).status;
    if (!col) return this;

    if (opts.deletedValue !== undefined) {
      this.conditions.push(ne(col, opts.deletedValue));
    } else if (opts.activeValue !== undefined) {
      this.conditions.push(eq(col, opts.activeValue));
    } else {
      // Default heuristics based on column name
      if ((this.table as any).isActive && col === (this.table as any).isActive) {
        this.conditions.push(eq(col, true));
      } else if ((this.table as any).status && col === (this.table as any).status) {
        this.conditions.push(ne(col, 'DELETED'));
      }
    }
    return this;
  }

  /**
   * Configure pagination params (page, limit, maxLimit, defaultLimit).
   */
  paginate(params?: PaginationParams | null): this {
    this.paginationConfigured = true;
    const defaultLimit = params?.defaultLimit ?? 10;
    const maxLimit = params?.maxLimit ?? 100;

    let p = params?.page !== undefined && params?.page !== null ? Number(params.page) : 1;
    if (isNaN(p) || p < 1) p = 1;

    let l = params?.limit !== undefined && params?.limit !== null ? Number(params.limit) : defaultLimit;
    if (isNaN(l) || l < 1) l = defaultLimit;
    if (l > maxLimit) l = maxLimit;

    this.page = p;
    this.limit = l;
    return this;
  }

  /**
   * Configure sorting column and direction.
   */
  sort(
    sortBy?: string | PgColumn | any,
    sortOrder?: SortOrder | string | null,
    defaultColumn?: PgColumn | SQL | any,
  ): this {
    let targetCol: any = null;

    if (typeof sortBy === 'string' && sortBy.trim()) {
      const trimmed = sortBy.trim();
      targetCol = (this.table as any)[trimmed] ?? defaultColumn;
    } else if (sortBy && typeof sortBy === 'object') {
      targetCol = sortBy;
    } else {
      targetCol = defaultColumn ?? (this.table as any).createdAt;
    }

    if (!targetCol) return this;

    const isAsc = String(sortOrder ?? 'desc').toLowerCase() === 'asc';
    this.orderClauses.push(isAsc ? asc(targetCol) : desc(targetCol));
    return this;
  }

  /**
   * Custom order by clause.
   */
  orderBy(...orderClauses: (SQL | SQLWrapper)[]): this {
    this.orderClauses.push(...orderClauses);
    return this;
  }

  /**
   * Joins.
   */
  innerJoin(table: PgTable | any, on: SQL | SQLWrapper): this {
    this.joins.push({ type: 'inner', table, on });
    return this;
  }

  leftJoin(table: PgTable | any, on: SQL | SQLWrapper): this {
    this.joins.push({ type: 'left', table, on });
    return this;
  }

  rightJoin(table: PgTable | any, on: SQL | SQLWrapper): this {
    this.joins.push({ type: 'right', table, on });
    return this;
  }

  fullJoin(table: PgTable | any, on: SQL | SQLWrapper): this {
    this.joins.push({ type: 'full', table, on });
    return this;
  }

  /**
   * Hook for post-query hydration / relation loading.
   */
  afterExecute(fn: (rows: any[]) => Promise<any[]> | any[]): this {
    this.afterExecuteHook = fn;
    return this;
  }

  /**
   * Apply standard base query filter options (search, sort, pagination, softDelete).
   */
  applyBaseOptions(options?: BaseQueryFilterOptions): this {
    if (!options) return this;

    if (options.search && options.searchColumns) {
      this.search(options.search, options.searchColumns);
    }
    if (options.sortBy) {
      this.sort(options.sortBy, options.sortOrder);
    }
    if (options.page !== undefined || options.limit !== undefined) {
      this.paginate({ page: options.page, limit: options.limit });
    }
    if (!options.includeDeleted) {
      this.softDelete();
    }
    return this;
  }

  /**
   * Build the Drizzle select query with joins, conditions, order, and pagination.
   */
  private buildSelectQuery(): any {
    let q = this.selection
      ? (this.db as any).select(this.selection).from(this.table)
      : (this.db as any).select().from(this.table);

    for (const j of this.joins) {
      if (j.type === 'inner') q = q.innerJoin(j.table, j.on);
      else if (j.type === 'left') q = q.leftJoin(j.table, j.on);
      else if (j.type === 'right') q = q.rightJoin(j.table, j.on);
      else if (j.type === 'full') q = q.fullJoin(j.table, j.on);
    }

    if (this.conditions.length > 0) {
      q = q.where(and(...this.conditions));
    }

    if (this.orderClauses.length > 0) {
      q = q.orderBy(...this.orderClauses);
    }

    if (this.limit !== null) {
      const offset = (this.page - 1) * this.limit;
      q = q.limit(this.limit).offset(offset);
    }

    return q;
  }

  /**
   * Build count query using identical joins and conditions.
   */
  private buildCountQuery(): any {
    let q = (this.db as any)
      .select({ total: sql<number>`cast(count(*) as integer)` })
      .from(this.table);

    for (const j of this.joins) {
      if (j.type === 'inner') q = q.innerJoin(j.table, j.on);
      else if (j.type === 'left') q = q.leftJoin(j.table, j.on);
      else if (j.type === 'right') q = q.rightJoin(j.table, j.on);
      else if (j.type === 'full') q = q.fullJoin(j.table, j.on);
    }

    if (this.conditions.length > 0) {
      q = q.where(and(...this.conditions));
    }

    return q;
  }

  /**
   * Execute full paginated query returning `{ data, meta }`.
   */
  async execute<T = any>(mapFn?: (row: any) => T): Promise<PaginatedResult<T>> {
    if (!this.paginationConfigured) {
      this.paginate({ page: 1, limit: 10 });
    }

    const [countResult, selectResult] = await Promise.all([
      this.buildCountQuery(),
      this.buildSelectQuery(),
    ]);

    const total = Number(countResult[0]?.total ?? 0);
    const limit = this.limit ?? 10;
    const page = this.page;
    const totalPages = Math.ceil(total / limit) || (total === 0 ? 0 : 1);

    let rows: any[] = selectResult;
    if (this.afterExecuteHook) {
      rows = await this.afterExecuteHook(rows);
    }

    const data: T[] = mapFn ? rows.map(mapFn) : (rows as T[]);

    const meta: PaginationMeta = {
      page,
      limit,
      total,
      totalPages,
      totalPage: totalPages, // Backward compatibility
      hasNextPage: page * limit < total,
      hasPreviousPage: page > 1,
    };

    return { data, meta };
  }

  /**
   * Execute plain query returning array `T[]` without pagination envelope.
   * Preserves backward compatibility for list endpoints returning plain arrays.
   */
  async executePlain<T = any>(mapFn?: (row: any) => T): Promise<T[]> {
    const query = this.buildSelectQuery();
    let rows: any[] = await query;

    if (this.afterExecuteHook) {
      rows = await this.afterExecuteHook(rows);
    }

    return mapFn ? rows.map(mapFn) : (rows as T[]);
  }

  /**
   * Execute query returning a single row or null.
   */
  async executeOne<T = any>(mapFn?: (row: any) => T): Promise<T | null> {
    this.limit = 1;
    this.page = 1;
    const rows = await this.executePlain(mapFn);
    return rows[0] ?? null;
  }

  /**
   * Execute count query only.
   */
  async executeCount(): Promise<number> {
    const result = await this.buildCountQuery();
    return Number(result[0]?.total ?? 0);
  }
}
