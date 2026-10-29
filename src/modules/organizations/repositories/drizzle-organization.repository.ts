import { Injectable, Inject } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import {
  DRIZZLE,
  type DrizzleDatabase,
  organizations,
  restaurants,
  branches,
  staff,
  staffAssignments,
} from '@/database';
import { DrizzleQueryBuilder } from '../../../common/database';
import type { Organization } from '../domain/organization.entity';

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

  async findAccessibleByUserId(userId: string): Promise<Organization[]> {
    const owned = await this.findByOwnerId(userId);
    const assignedRows = await this.db
      .select({
        id: organizations.id,
        name: organizations.name,
        ownerId: organizations.ownerId,
        slug: organizations.slug,
        createdAt: organizations.createdAt,
        updatedAt: organizations.updatedAt,
      })
      .from(staff)
      .innerJoin(staffAssignments, eq(staffAssignments.staffId, staff.id))
      .innerJoin(branches, eq(staffAssignments.branchId, branches.id))
      .innerJoin(restaurants, eq(branches.restaurantId, restaurants.id))
      .innerJoin(organizations, eq(restaurants.organizationId, organizations.id))
      .where(and(eq(staff.userId, userId), eq(staffAssignments.isActive, true)));

    const byId = new Map<string, Organization>();
    for (const org of owned) {
      byId.set(org.id, org);
    }
    for (const row of assignedRows) {
      if (!byId.has(row.id)) {
        byId.set(row.id, this.mapToEntity(row));
      }
    }
    return Array.from(byId.values());
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
