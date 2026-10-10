import { Injectable, Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE, type DrizzleDatabase, organizations } from '@tavonza/database';
import { DrizzleQueryBuilder } from '../../../../common/database';
import type { Organization } from '../../domain/entities/organization.entity';

@Injectable()
export class DrizzleOrganizationRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDatabase) {}

  async create(data: { name: string; slug: string; ownerId: string }): Promise<Organization> {
    const [created] = await this.db
      .insert(organizations)
      .values({
        name: data.name,
        slug: data.slug,
        ownerId: data.ownerId,
      })
      .returning();

    return this.mapToEntity(created);
  }

  async findById(id: string): Promise<Organization | null> {
    const [row] = await this.db
      .select()
      .from(organizations)
      .where(eq(organizations.id, id))
      .limit(1);

    return row ? this.mapToEntity(row) : null;
  }

  async findBySlug(slug: string): Promise<Organization | null> {
    const [row] = await this.db
      .select()
      .from(organizations)
      .where(eq(organizations.slug, slug))
      .limit(1);

    return row ? this.mapToEntity(row) : null;
  }

  async findAll(options?: {
    ownerId?: string;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ data: Organization[]; meta: any }> {
    const builder = DrizzleQueryBuilder.from(this.db, organizations)
      .paginate({ page: options?.page, limit: options?.limit })
      .filterExact({ ownerId: options?.ownerId })
      .search(options?.search, [organizations.name, organizations.slug])
      .sort(options?.sortBy, options?.sortOrder, organizations.createdAt);

    return builder.execute((r) => this.mapToEntity(r));
  }

  async findByOwnerId(ownerId: string): Promise<Organization[]> {
    return DrizzleQueryBuilder.from(this.db, organizations)
      .filterExact({ ownerId })
      .sort(organizations.createdAt, 'desc')
      .executePlain((r) => this.mapToEntity(r));
  }

  async update(id: string, data: Partial<{ name: string; slug: string }>): Promise<Organization | null> {
    const [updated] = await this.db
      .update(organizations)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(organizations.id, id))
      .returning();

    return updated ? this.mapToEntity(updated) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db
      .delete(organizations)
      .where(eq(organizations.id, id))
      .returning();

    return result.length > 0;
  }

  private mapToEntity(row: any): Organization {
    return {
      id: row.id,
      name: row.name,
      ownerId: row.ownerId,
      slug: row.slug,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
