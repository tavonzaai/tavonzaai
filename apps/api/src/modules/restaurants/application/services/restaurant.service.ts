import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { DrizzleRestaurantRepository } from '../../infrastructure/persistence/drizzle-restaurant.repository';
import type {
  CreateRestaurantDto,
  UpdateRestaurantDto,
  RestaurantResponseDto,
} from '../../presentation/http/dto/restaurant.dto';
import type { Restaurant } from '../../domain/entities/restaurant.entity';

@Injectable()
export class RestaurantService {
  constructor(private readonly restaurantRepo: DrizzleRestaurantRepository) {}

  async create(dto: CreateRestaurantDto): Promise<RestaurantResponseDto> {
    const slug = dto.slug || this.generateSlug(dto.name);

    const existing = await this.restaurantRepo.findBySlug(slug);
    if (existing) {
      throw new ConflictException(`Restaurant with slug "${slug}" already exists`);
    }

    const restaurant = await this.restaurantRepo.create({
      organizationId: dto.organizationId,
      name: dto.name,
      slug,
      logoUrl: dto.logoUrl,
      description: dto.description,
    });

    return this.toResponseDto(restaurant);
  }

  async findById(id: string): Promise<RestaurantResponseDto> {
    const restaurant = await this.restaurantRepo.findById(id);
    if (!restaurant) {
      throw new NotFoundException(`Restaurant with ID "${id}" not found`);
    }
    return this.toResponseDto(restaurant);
  }

  async findByOrganizationId(organizationId: string): Promise<RestaurantResponseDto[]> {
    const restaurants = await this.restaurantRepo.findByOrganizationId(organizationId);
    return restaurants.map((r) => this.toResponseDto(r));
  }

  async update(id: string, dto: UpdateRestaurantDto): Promise<RestaurantResponseDto> {
    const restaurant = await this.restaurantRepo.findById(id);
    if (!restaurant) {
      throw new NotFoundException(`Restaurant with ID "${id}" not found`);
    }

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
