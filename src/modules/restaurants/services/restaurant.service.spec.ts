import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { RestaurantService } from './restaurant.service.ts';
import type { JwtPayload } from '../../identity/adapters/jwt.strategy.ts';
import type { Restaurant } from '../domain/restaurant.entity.ts';

// Mock repository
function createMockRepo(initialRestaurants: Restaurant[] = []) {
  const data: Restaurant[] = [...initialRestaurants];

  return {
    data,
    async create(input: any): Promise<Restaurant> {
      const restaurant: Restaurant = {
        id: `rest-${data.length + 1}`,
        organizationId: input.organizationId,
        name: input.name,
        slug: input.slug,
        logoUrl: input.logoUrl ?? null,
        description: input.description ?? null,
        isActive: input.isActive ?? true,
        status: input.status ?? (input.isActive ? 'ACTIVE' : 'INACTIVE'),
        address: input.address ?? null,
        phone: input.phone ?? null,
        email: input.email ?? null,
        websiteUrl: input.websiteUrl ?? null,
        coverImageUrl: input.coverImageUrl ?? null,
        bannerUrl: input.bannerUrl ?? null,
        images: input.images ?? null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      data.push(restaurant);
      return restaurant;
    },
    async findById(id: string): Promise<Restaurant | null> {
      return data.find((r) => r.id === id) ?? null;
    },
    async findBySlug(slug: string): Promise<Restaurant | null> {
      return data.find((r) => r.slug === slug) ?? null;
    },
    async update(id: string, updates: any): Promise<Restaurant | null> {
      const idx = data.findIndex((r) => r.id === id);
      if (idx === -1) return null;
      data[idx] = {
        ...data[idx],
        ...updates,
        updatedAt: new Date(),
      };
      return data[idx];
    },
    async softDelete(id: string): Promise<Restaurant | null> {
      return this.update(id, { isActive: false, status: 'INACTIVE' });
    },
    async findAll() {
      return { data, meta: { total: data.length } };
    },
    async findByOrganizationId(orgId: string) {
      return data.filter((r) => r.organizationId === orgId);
    },
  };
}

function createMockOrgRepo() {
  const org = {
    id: 'org-123',
    ownerId: 'user-1',
    name: 'Test Org',
    slug: 'test-org',
  };
  return {
    async findById(id: string) {
      return id === org.id ? org : null;
    },
    async findByOwnerId(userId: string) {
      return userId === org.ownerId ? [org] : [];
    },
    async findAccessibleByUserId(userId: string) {
      return userId === org.ownerId || userId === 'admin-2' ? [org] : [];
    },
  };
}

const mockUser: JwtPayload = {
  sub: 'user-1',
  email: 'owner@example.com',
  globalRole: 'ADMIN' as any,
  organizationId: 'org-123',
};

describe('RestaurantService - Enhanced Restaurant Creation & Management', () => {
  it('creates a restaurant with full address, contact info, images, and default status', async () => {
    const repo = createMockRepo();
    const orgRepo = createMockOrgRepo();
    const service = new RestaurantService(repo as any, orgRepo as any);

    const result = await service.create(mockUser, {
      name: 'Tasty Bites Grill',
      organizationId: 'org-123',
      address: {
        street: '123 Main Street',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'USA',
      },
      phone: '+1-555-123-4567',
      email: 'info@tastybites.com',
      websiteUrl: 'https://tastybites.com',
      logoUrl: 'https://cdn.example.com/logo.png',
      coverImageUrl: 'https://cdn.example.com/cover.png',
      images: ['https://cdn.example.com/img1.png', 'https://cdn.example.com/img2.png'],
    });

    assert.equal(result.name, 'Tasty Bites Grill');
    assert.equal(result.slug, 'tasty-bites-grill');
    assert.equal(result.status, 'ACTIVE');
    assert.equal(result.isActive, true);
    assert.deepEqual(result.address, {
      street: '123 Main Street',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'USA',
    });
    assert.equal(result.phone, '+1-555-123-4567');
    assert.equal(result.email, 'info@tastybites.com');
    assert.equal(result.websiteUrl, 'https://tastybites.com');
    assert.equal(result.coverImageUrl, 'https://cdn.example.com/cover.png');
    assert.equal(result.bannerUrl, 'https://cdn.example.com/cover.png'); // synced fallback
    assert.equal(result.images?.length, 2);
  });

  it('supports phone aliases (contactNo, contactNumber)', async () => {
    const repo = createMockRepo();
    const orgRepo = createMockOrgRepo();
    const service = new RestaurantService(repo as any, orgRepo as any);

    const res1 = await service.create(mockUser, {
      name: 'Bistro One',
      contactNo: '+1-555-001',
    });
    assert.equal(res1.phone, '+1-555-001');

    const res2 = await service.create(mockUser, {
      name: 'Bistro Two',
      contactNumber: '+1-555-002',
    });
    assert.equal(res2.phone, '+1-555-002');
  });

  it('handles slug collision automatically with short suffix without throwing 409', async () => {
    const repo = createMockRepo([
      {
        id: 'rest-existing',
        organizationId: 'org-123',
        name: 'The Crown',
        slug: 'the-crown',
        isActive: true,
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    const orgRepo = createMockOrgRepo();
    const service = new RestaurantService(repo as any, orgRepo as any);

    const result = await service.create(mockUser, {
      name: 'The Crown',
      slug: 'the-crown',
    });

    assert.notEqual(result.slug, 'the-crown');
    assert.ok(result.slug.startsWith('the-crown-'));
    assert.equal(result.status, 'ACTIVE');
  });

  it('synchronizes status and isActive bidirectionally', async () => {
    const repo = createMockRepo();
    const orgRepo = createMockOrgRepo();
    const service = new RestaurantService(repo as any, orgRepo as any);

    // Explicit INACTIVE status
    const resInactive = await service.create(mockUser, {
      name: 'Closed Venue',
      status: 'INACTIVE',
    });
    assert.equal(resInactive.status, 'INACTIVE');
    assert.equal(resInactive.isActive, false);

    // Explicit isActive: false
    const resFalse = await service.create(mockUser, {
      name: 'Dormant Cafe',
      isActive: false,
    });
    assert.equal(resFalse.status, 'INACTIVE');
    assert.equal(resFalse.isActive, false);

    // Explicit isActive: true
    const resTrue = await service.create(mockUser, {
      name: 'Open Cafe',
      isActive: true,
    });
    assert.equal(resTrue.status, 'ACTIVE');
    assert.equal(resTrue.isActive, true);
  });

  it('checks slug availability and returns suggestions when taken', async () => {
    const repo = createMockRepo([
      {
        id: 'rest-taken',
        organizationId: 'org-123',
        name: 'Unique Bistro',
        slug: 'unique-bistro',
        isActive: true,
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    const orgRepo = createMockOrgRepo();
    const service = new RestaurantService(repo as any, orgRepo as any);

    // Available slug
    const check1 = await service.checkSlugAvailability('fresh-cafe');
    assert.equal(check1.available, true);
    assert.equal(check1.slug, 'fresh-cafe');
    assert.equal(check1.suggestedSlug, undefined);

    // Taken slug
    const check2 = await service.checkSlugAvailability('unique-bistro');
    assert.equal(check2.available, false);
    assert.equal(check2.slug, 'unique-bistro');
    assert.ok(check2.suggestedSlug?.startsWith('unique-bistro-'));
  });

  it('updates extended restaurant fields and respects status sync', async () => {
    const repo = createMockRepo();
    const orgRepo = createMockOrgRepo();
    const service = new RestaurantService(repo as any, orgRepo as any);

    const created = await service.create(mockUser, {
      name: 'Original Spot',
    });

    const updated = await service.update(mockUser, created.id, {
      name: 'Upgraded Spot',
      phone: '+44 20 7946 0991',
      status: 'INACTIVE',
      coverImageUrl: 'https://cdn.example.com/banner-new.png',
      address: '456 High Street, London',
    });

    assert.equal(updated.name, 'Upgraded Spot');
    assert.equal(updated.phone, '+44 20 7946 0991');
    assert.equal(updated.status, 'INACTIVE');
    assert.equal(updated.isActive, false);
    assert.equal(updated.coverImageUrl, 'https://cdn.example.com/banner-new.png');
    assert.equal(updated.bannerUrl, 'https://cdn.example.com/banner-new.png');
    assert.equal(updated.address, '456 High Street, London');
  });

  it('lets an organization admin create a restaurant without owning the org row', async () => {
    const repo = createMockRepo();
    const orgRepo = createMockOrgRepo();
    const service = new RestaurantService(repo as any, orgRepo as any);
    const admin: JwtPayload = {
      sub: 'admin-2',
      email: 'admin2@example.com',
      globalRole: 'ADMIN' as any,
      role: 'ADMIN',
      organizationId: 'org-123',
      scopes: [{ type: 'organization', id: 'org-123' }],
    };

    const result = await service.create(admin, {
      name: 'Admin Brand',
      organizationId: 'org-123',
    });

    assert.equal(result.organizationId, 'org-123');
    assert.equal(result.name, 'Admin Brand');
  });
});

