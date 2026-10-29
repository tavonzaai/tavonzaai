import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { DrizzleRestaurantRepository } from '../repositories/drizzle-restaurant.repository';
import { DrizzleOrganizationRepository } from '../../organizations/repositories/drizzle-organization.repository';
import type {
  CreateRestaurantDto,
  UpdateRestaurantDto,
  RestaurantResponseDto,
  CheckSlugResponseDto,
} from '../dto/restaurant.dto';
import type { Restaurant } from '../domain/restaurant.entity';
import type { JwtPayload } from '../../identity/adapters/jwt.strategy';
import { assertCanAccessOrganization, isSuperAdmin } from '../../../common/auth/actor.util';

@Injectable()
export class RestaurantService {
  private readonly restaurantRepo: DrizzleRestaurantRepository;
  private readonly orgRepo: DrizzleOrganizationRepository;

  constructor(
    restaurantRepo: DrizzleRestaurantRepository,
    orgRepo: DrizzleOrganizationRepository,
  ) {
    this.restaurantRepo = restaurantRepo;
    this.orgRepo = orgRepo;
  }

  async create(user: JwtPayload, dto: CreateRestaurantDto): Promise<RestaurantResponseDto> {
    const organizationId = await this.resolveWritableOrganizationId(user, dto.organizationId);

    // Resolve base slug and ensure uniqueness without throwing unexpected 409
    const baseSlug = dto.slug ? this.generateSlug(dto.slug) : this.generateSlug(dto.name);
    const slug = await this.resolveUniqueSlug(baseSlug);

    // Synchronize status and isActive
    let status = dto.status ? dto.status.toUpperCase() : undefined;
    let isActive = dto.isActive;

    if (status !== undefined && isActive === undefined) {
      isActive = status === 'ACTIVE';
    } else if (isActive !== undefined && status === undefined) {
      status = isActive ? 'ACTIVE' : 'INACTIVE';
    } else if (status === undefined && isActive === undefined) {
      status = 'ACTIVE';
      isActive = true;
    }

    // Resolve phone with aliases
    const phone = dto.phone || dto.contactNo || dto.contactNumber || null;

    // Synchronize coverImageUrl and bannerUrl if only one is provided
    const coverImageUrl = dto.coverImageUrl || dto.bannerUrl || null;
    const bannerUrl = dto.bannerUrl || dto.coverImageUrl || null;

    const restaurant = await this.restaurantRepo.create({
      organizationId,
      name: dto.name.trim(),
      slug,
      logoUrl: dto.logoUrl ?? null,
      description: dto.description ?? null,
      isActive,
      status,
      address: dto.address ?? null,
      phone,
      email: dto.email ? dto.email.trim().toLowerCase() : null,
      websiteUrl: dto.websiteUrl ? dto.websiteUrl.trim() : null,
      coverImageUrl,
      bannerUrl,
      images: dto.images ?? null,
    });

    return this.toResponseDto(restaurant);
  }

  async checkSlugAvailability(slug: string): Promise<CheckSlugResponseDto> {
    const normalized = this.generateSlug(slug);
    const existing = await this.restaurantRepo.findBySlug(normalized);
    if (!existing) {
      return {
        available: true,
        slug: normalized,
      };
    }

    const suggestedSlug = await this.resolveUniqueSlug(normalized);
    return {
      available: false,
      slug: normalized,
      suggestedSlug,
    };
  }

  async findById(user: JwtPayload, id: string): Promise<RestaurantResponseDto> {
    const restaurant = await this.restaurantRepo.findById(id);
    if (!restaurant) {
      throw new NotFoundException(`Restaurant with ID "${id}" not found`);
    }
    await this.assertRestaurantAccess(user, restaurant.organizationId);
    return this.toResponseDto(restaurant);
  }

  async findByOrganizationId(
    user: JwtPayload,
    organizationId: string,
    includeDeleted = false,
  ): Promise<RestaurantResponseDto[]> {
    await this.assertRestaurantAccess(user, organizationId);
    const restaurants = await this.restaurantRepo.findByOrganizationId(organizationId, includeDeleted);
    return restaurants.map((r) => this.toResponseDto(r));
  }

  async findAll(user: JwtPayload, options?: any): Promise<{ data: RestaurantResponseDto[]; meta: any }> {
    const organizationId = await this.resolveReadableOrganizationId(user, options?.organizationId);
    const res = await this.restaurantRepo.findAll({ ...options, organizationId });
    return {
      data: res.data.map((r) => this.toResponseDto(r)),
      meta: res.meta,
    };
  }

  async softDelete(user: JwtPayload, id: string): Promise<RestaurantResponseDto> {
    const restaurant = await this.restaurantRepo.findById(id);
    if (!restaurant) {
      throw new NotFoundException(`Restaurant with ID "${id}" not found`);
    }
    await this.assertRestaurantAccess(user, restaurant.organizationId);
    const updated = await this.restaurantRepo.softDelete(id);
    if (!updated) {
      throw new NotFoundException(`Failed to soft-delete restaurant "${id}"`);
    }
    return this.toResponseDto(updated);
  }

  async update(user: JwtPayload, id: string, dto: UpdateRestaurantDto): Promise<RestaurantResponseDto> {
    const restaurant = await this.restaurantRepo.findById(id);
    if (!restaurant) {
      throw new NotFoundException(`Restaurant with ID "${id}" not found`);
    }
    await this.assertRestaurantAccess(user, restaurant.organizationId);

    const updateData: Parameters<DrizzleRestaurantRepository['update']>[1] = {};

    if (dto.name !== undefined) {
      updateData.name = dto.name.trim();
    }

    if (dto.slug !== undefined) {
      const normalizedSlug = this.generateSlug(dto.slug);
      if (normalizedSlug !== restaurant.slug) {
        const existing = await this.restaurantRepo.findBySlug(normalizedSlug);
        if (existing && existing.id !== id) {
          throw new ConflictException(`Slug "${normalizedSlug}" is already taken`);
        }
        updateData.slug = normalizedSlug;
      }
    }

    if (dto.logoUrl !== undefined) {
      updateData.logoUrl = dto.logoUrl;
    }

    if (dto.description !== undefined) {
      updateData.description = dto.description;
    }

    if (dto.address !== undefined) {
      updateData.address = dto.address;
    }

    // Resolve phone with aliases
    const phone = dto.phone ?? dto.contactNo ?? dto.contactNumber;
    if (phone !== undefined) {
      updateData.phone = phone;
    }

    if (dto.email !== undefined) {
      updateData.email = dto.email ? dto.email.trim().toLowerCase() : null;
    }

    if (dto.websiteUrl !== undefined) {
      updateData.websiteUrl = dto.websiteUrl ? dto.websiteUrl.trim() : null;
    }

    if (dto.coverImageUrl !== undefined || dto.bannerUrl !== undefined) {
      const cover = dto.coverImageUrl ?? dto.bannerUrl;
      const banner = dto.bannerUrl ?? dto.coverImageUrl;
      if (cover !== undefined) updateData.coverImageUrl = cover;
      if (banner !== undefined) updateData.bannerUrl = banner;
    }

    if (dto.images !== undefined) {
      updateData.images = dto.images;
    }

    // Bidirectional status & isActive sync
    let status = dto.status ? dto.status.toUpperCase() : undefined;
    let isActive = dto.isActive;

    if (status !== undefined && isActive === undefined) {
      isActive = status === 'ACTIVE';
    } else if (isActive !== undefined && status === undefined) {
      status = isActive ? 'ACTIVE' : 'INACTIVE';
    }

    if (status !== undefined) {
      updateData.status = status;
    }
    if (isActive !== undefined) {
      updateData.isActive = isActive;
    }

    const updated = await this.restaurantRepo.update(id, updateData);
    if (!updated) {
      throw new NotFoundException(`Restaurant not found after update`);
    }

    return this.toResponseDto(updated);
  }

  private async assertRestaurantAccess(user: JwtPayload, organizationId: string): Promise<void> {
    const org = await this.orgRepo.findById(organizationId);
    if (!org) {
      throw new NotFoundException(`Organization with ID "${organizationId}" not found`);
    }
    assertCanAccessOrganization(user, org);
  }

  private async resolveWritableOrganizationId(user: JwtPayload, requestedId?: string): Promise<string> {
    if (isSuperAdmin(user)) {
      if (!requestedId) {
        throw new ForbiddenException('organizationId is required');
      }
      const org = await this.orgRepo.findById(requestedId);
      if (!org) {
        throw new NotFoundException(`Organization with ID "${requestedId}" not found`);
      }
      return org.id;
    }

    const owned = await this.orgRepo.findByOwnerId(user.sub);
    if (owned.length === 0) {
      throw new ForbiddenException('No organization is associated with this account');
    }
    if (requestedId && !owned.some((org) => org.id === requestedId)) {
      throw new ForbiddenException('You do not have access to this organization');
    }
    const fallbackId = owned[0]?.id;
    if (!requestedId && !user.organizationId && !fallbackId) {
      throw new ForbiddenException('No organization is associated with this account');
    }
    return requestedId || user.organizationId || fallbackId!;
  }

  private async resolveReadableOrganizationId(
    user: JwtPayload,
    requestedId?: string,
  ): Promise<string | undefined> {
    if (isSuperAdmin(user)) {
      return requestedId;
    }
    return this.resolveWritableOrganizationId(user, requestedId);
  }

  private generateSlug(name: string): string {
    return (
      name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || `rest-${Date.now()}`
    );
  }

  private async resolveUniqueSlug(baseSlug: string): Promise<string> {
    let slug = baseSlug;
    let attempt = 0;
    while (await this.restaurantRepo.findBySlug(slug)) {
      attempt++;
      slug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;
      if (attempt > 10) break;
    }
    return slug;
  }

  private toResponseDto(restaurant: Restaurant): RestaurantResponseDto {
    return {
      id: restaurant.id,
      organizationId: restaurant.organizationId,
      name: restaurant.name,
      slug: restaurant.slug,
      logoUrl: restaurant.logoUrl,
      description: restaurant.description,
      isActive: restaurant.isActive,
      status: restaurant.status,
      address: restaurant.address,
      phone: restaurant.phone,
      email: restaurant.email,
      websiteUrl: restaurant.websiteUrl,
      coverImageUrl: restaurant.coverImageUrl,
      bannerUrl: restaurant.bannerUrl,
      images: restaurant.images,
      createdAt: restaurant.createdAt,
      updatedAt: restaurant.updatedAt,
    };
  }
}
