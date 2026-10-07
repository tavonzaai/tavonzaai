import { Injectable, Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE, type DrizzleDatabase, restaurants } from '@tavonza/database';
import { DrizzleQueryBuilder } from '../../../../common/database';
import type { Restaurant } from '../../domain/entities/restaurant.entity';

@Injectable()
export class DrizzleRestaurantRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDatabase) {}

  async create(data: {
    organizationId: string;
    name: string;
    slug: string;
    logoUrl?: string;
    description?: string;
  }): Promise<Restaurant> {
    const [created] = await this.db
      .insert(restaurants)
      .values({
        organizationId: data.organizationId,
        name: data.name,
        slug: data.slug,
        logoUrl: data.logoUrl,
        description: data.description,
      })
      .returning();

    return this.mapToEntity(created);
  }

  async findById(id: string): Promise<Restaurant | null> {
    const [row] = await this.db
      .select()
      .from(restaurants)
      .where(eq(restaurants.id, id))
      .limit(1);

    return row ? this.mapToEntity(row) : null;
  }

  async findBySlug(slug: string): Promise<Restaurant | null> {
    const [row] = await this.db
      .select()
      .from(restaurants)
      .where(eq(restaurants.slug, slug))
      .limit(1);

    return row ? this.mapToEntity(row) : null;
  }

  async findAll(options?: {
    organizationId?: string;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    includeDeleted?: boolean;
  }): Promise<{ data: Restaurant[]; meta: any }> {
    const builder = DrizzleQueryBuilder.from(this.db, restaurants)
      .paginate({ page: options?.page, limit: options?.limit })
      .filterExact({ organizationId: options?.organizationId })
      .search(options?.search, [restaurants.name, restaurants.slug, restaurants.description])
      .softDelete({
        column: restaurants.isActive,
        activeValue: true,
        includeDeleted: options?.includeDeleted,
      })
      .sort(options?.sortBy, options?.sortOrder, restaurants.createdAt);

    return builder.execute((r) => this.mapToEntity(r));
  }

  async findByOrganizationId(organizationId: string, includeDeleted = false): Promise<Restaurant[]> {
    return DrizzleQueryBuilder.from(this.db, restaurants)
      .filterExact({ organizationId })
      .softDelete({
        column: restaurants.isActive,
        activeValue: true,
        includeDeleted,
      })
      .sort(restaurants.createdAt, 'desc')
      .executePlain((r) => this.mapToEntity(r));
  }

  async softDelete(id: string): Promise<Restaurant | null> {
    return this.update(id, { isActive: false });
  }

  async update(
    id: string,
    data: Partial<{
      name: string;
      slug: string;
      logoUrl: string | null;
      description: string | null;
      isActive: boolean;
    }>,
  ): Promise<Restaurant | null> {
    const [updated] = await this.db
      .update(restaurants)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(restaurants.id, id))
      .returning();

    return updated ? this.mapToEntity(updated) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db
      .delete(restaurants)
      .where(eq(restaurants.id, id))
      .returning();

    return result.length > 0;
  }

  private mapToEntity(row: any): Restaurant {
    return {
      id: row.id,
      organizationId: row.organizationId,
      name: row.name,
      slug: row.slug,
      logoUrl: row.logoUrl,
      description: row.description,
      isActive: row.isActive ?? true,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
