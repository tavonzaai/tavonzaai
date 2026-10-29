import { Injectable, Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE, type DrizzleDatabase, restaurants } from '@/database';
import { DrizzleQueryBuilder } from '../../../common/database';
import type { Restaurant } from '../domain/restaurant.entity';

@Injectable()
export class DrizzleRestaurantRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDatabase) {}

  async create(data: {
    organizationId: string;
    name: string;
    slug: string;
    logoUrl?: string | null;
    description?: string | null;
    isActive?: boolean;
    status?: string;
    address?: any | null;
    phone?: string | null;
    email?: string | null;
    websiteUrl?: string | null;
    coverImageUrl?: string | null;
    bannerUrl?: string | null;
    images?: string[] | null;
  }): Promise<Restaurant> {
    const isActive = data.isActive ?? true;
    const status = data.status ?? (isActive ? 'ACTIVE' : 'INACTIVE');

    const [created] = await this.db
      .insert(restaurants)
      .values({
        organizationId: data.organizationId,
        name: data.name,
        slug: data.slug,
        logoUrl: data.logoUrl,
        description: data.description,
        isActive,
        status,
        address: data.address,
        phone: data.phone,
        email: data.email,
        websiteUrl: data.websiteUrl,
        coverImageUrl: data.coverImageUrl,
        bannerUrl: data.bannerUrl,
        images: data.images,
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
    return this.update(id, { isActive: false, status: 'INACTIVE' });
  }

  async update(
    id: string,
    data: Partial<{
      name: string;
      slug: string;
      logoUrl: string | null;
      description: string | null;
      isActive: boolean;
      status: string;
      address: any | null;
      phone: string | null;
      email: string | null;
      websiteUrl: string | null;
      coverImageUrl: string | null;
      bannerUrl: string | null;
      images: string[] | null;
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
    const isActive = row.isActive ?? true;
    return {
      id: row.id,
      organizationId: row.organizationId,
      name: row.name,
      slug: row.slug,
      logoUrl: row.logoUrl ?? null,
      description: row.description ?? null,
      isActive,
      status: row.status ?? (isActive ? 'ACTIVE' : 'INACTIVE'),
      address: row.address ?? null,
      phone: row.phone ?? null,
      email: row.email ?? null,
      websiteUrl: row.websiteUrl ?? null,
      coverImageUrl: row.coverImageUrl ?? null,
      bannerUrl: row.bannerUrl ?? null,
      images: row.images ?? null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
