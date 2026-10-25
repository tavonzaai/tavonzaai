import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { DrizzleRestaurantRepository } from '../../infrastructure/persistence/drizzle-restaurant.repository';
import { DrizzleOrganizationRepository } from '../../../organizations/infrastructure/persistence/drizzle-organization.repository';
import type {
  CreateRestaurantDto,
  UpdateRestaurantDto,
  RestaurantResponseDto,
} from '../../presentation/http/dto/restaurant.dto';
import type { Restaurant } from '../../domain/entities/restaurant.entity';
import type { JwtPayload } from '../../../identity/infrastructure/adapters/jwt.strategy';
import { assertCanAccessOrganization, isSuperAdmin } from '../../../../common/auth/actor.util';

@Injectable()
export class RestaurantService {
  constructor(
    private readonly restaurantRepo: DrizzleRestaurantRepository,
    private readonly orgRepo: DrizzleOrganizationRepository,
  ) {}

  async create(user: JwtPayload, dto: CreateRestaurantDto): Promise<RestaurantResponseDto> {
    const organizationId = await this.resolveWritableOrganizationId(user, dto.organizationId);
    const slug = dto.slug || this.generateSlug(dto.name);

    const existing = await this.restaurantRepo.findBySlug(slug);
    if (existing) {
      throw new ConflictException(`Restaurant with slug "${slug}" already exists`);
    }

    const restaurant = await this.restaurantRepo.create({
      organizationId,
      name: dto.name,
      slug,
      logoUrl: dto.logoUrl,
      description: dto.description,
    });

    return this.toResponseDto(restaurant);
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

    if (dto.slug && dto.slug !== restaurant.slug) {
      const existing = await this.restaurantRepo.findBySlug(dto.slug);
      if (existing && existing.id !== id) {
        throw new ConflictException(`Slug "${dto.slug}" is already taken`);
      }
    }

    const updated = await this.restaurantRepo.update(id, dto);
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
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || `rest-${Date.now()}`;
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
      createdAt: restaurant.createdAt,
      updatedAt: restaurant.updatedAt,
    };
  }
}
