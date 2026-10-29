import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class RestaurantAddressDto {
  @ApiPropertyOptional({ example: '123 Main Street' })
  @IsOptional()
  @IsString()
  street?: string;

  @ApiPropertyOptional({ example: 'New York' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: 'NY' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({ example: '10001' })
  @IsOptional()
  @IsString()
  postalCode?: string;

  @ApiPropertyOptional({ example: 'USA' })
  @IsOptional()
  @IsString()
  country?: string;
}

export class CreateRestaurantDto {
  @ApiPropertyOptional({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', description: 'Organization ID owning this restaurant. Derived from the actor when omitted.' })
  @IsUUID()
  @IsOptional()
  organizationId?: string;

  @ApiProperty({ example: 'Tasty Bites Grill & Bar' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(255)
  name!: string;

  @ApiPropertyOptional({ example: 'tasty-bites-grill' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.toLowerCase().trim().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '')
      : value
  )
  @MaxLength(100)
  slug?: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/logo.png' })
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiPropertyOptional({ example: 'Artisanal burgers and craft cocktails.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Physical or registered address (string or address object)',
    example: { street: '123 Main St', city: 'New York', state: 'NY', postalCode: '10001', country: 'USA' },
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        if (typeof parsed === 'object' && parsed !== null) return parsed;
      } catch {
        return value;
      }
    }
    return value;
  })
  address?: RestaurantAddressDto | string | Record<string, any>;

  @ApiPropertyOptional({ example: 'ACTIVE', enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'] })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toUpperCase() : value))
  status?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: '+1-555-123-4567' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: '+1-555-123-4567', description: 'Alias for phone' })
  @IsOptional()
  @IsString()
  contactNo?: string;

  @ApiPropertyOptional({ example: '+1-555-123-4567', description: 'Alias for phone' })
  @IsOptional()
  @IsString()
  contactNumber?: string;

  @ApiPropertyOptional({ example: 'contact@restaurant.com' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ example: 'https://restaurant.com' })
  @IsOptional()
  @IsString()
  websiteUrl?: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/cover.png' })
  @IsOptional()
  @IsString()
  coverImageUrl?: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/banner.png' })
  @IsOptional()
  @IsString()
  bannerUrl?: string;

  @ApiPropertyOptional({ example: ['https://cdn.example.com/img1.png'], type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}

export class UpdateRestaurantDto {
  @ApiPropertyOptional({ example: 'Tasty Bites Grill & Lounge' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({ example: 'tasty-bites-grill-lounge' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.toLowerCase().trim().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '')
      : value
  )
  @MaxLength(100)
  slug?: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/new-logo.png' })
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiPropertyOptional({ example: 'Updated description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Physical or registered address (string or address object)',
    example: { street: '123 Main St', city: 'New York', state: 'NY', postalCode: '10001', country: 'USA' },
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        if (typeof parsed === 'object' && parsed !== null) return parsed;
      } catch {
        return value;
      }
    }
    return value;
  })
  address?: RestaurantAddressDto | string | Record<string, any>;

  @ApiPropertyOptional({ example: 'ACTIVE', enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'] })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toUpperCase() : value))
  status?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: '+1-555-123-4567' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: '+1-555-123-4567', description: 'Alias for phone' })
  @IsOptional()
  @IsString()
  contactNo?: string;

  @ApiPropertyOptional({ example: '+1-555-123-4567', description: 'Alias for phone' })
  @IsOptional()
  @IsString()
  contactNumber?: string;

  @ApiPropertyOptional({ example: 'contact@restaurant.com' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ example: 'https://restaurant.com' })
  @IsOptional()
  @IsString()
  websiteUrl?: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/cover.png' })
  @IsOptional()
  @IsString()
  coverImageUrl?: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/banner.png' })
  @IsOptional()
  @IsString()
  bannerUrl?: string;

  @ApiPropertyOptional({ example: ['https://cdn.example.com/img1.png'], type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}

export class RestaurantResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', description: 'Restaurant UUID' })
  id!: string;

  @ApiProperty({ example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901', description: 'Organization UUID owning this restaurant' })
  organizationId!: string;

  @ApiProperty({ example: 'Tasty Bites Grill & Bar', description: 'Restaurant business name' })
  name!: string;

  @ApiProperty({ example: 'tasty-bites-grill', description: 'Restaurant unique slug' })
  slug!: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/logo.png', description: 'Brand logo image URL' })
  logoUrl?: string | null;

  @ApiPropertyOptional({ example: 'Artisanal burgers and craft cocktails.', description: 'Restaurant description' })
  description?: string | null;

  @ApiProperty({ example: true, description: 'Active status' })
  isActive!: boolean;

  @ApiProperty({ example: 'ACTIVE', description: 'Lifecycle status' })
  status!: string;

  @ApiPropertyOptional({
    example: { street: '123 Main St', city: 'New York', state: 'NY', postalCode: '10001', country: 'USA' },
    description: 'Physical or registered address',
  })
  address?: any | null;

  @ApiPropertyOptional({ example: '+1-555-123-4567', description: 'Contact phone' })
  phone?: string | null;

  @ApiPropertyOptional({ example: 'contact@restaurant.com', description: 'Contact email' })
  email?: string | null;

  @ApiPropertyOptional({ example: 'https://restaurant.com', description: 'Website URL' })
  websiteUrl?: string | null;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/cover.png', description: 'Cover image URL' })
  coverImageUrl?: string | null;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/banner.png', description: 'Banner image URL' })
  bannerUrl?: string | null;

  @ApiPropertyOptional({ example: ['https://cdn.example.com/img1.png'], type: [String], description: 'Gallery image URLs' })
  images?: string[] | null;

  @ApiProperty({ example: '2026-10-01T12:00:00.000Z', description: 'Creation timestamp' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-10-01T12:00:00.000Z', description: 'Update timestamp' })
  updatedAt!: Date;
}

export class CheckSlugResponseDto {
  @ApiProperty({ example: true, description: 'Whether the slug is available' })
  available!: boolean;

  @ApiProperty({ example: 'tasty-bites', description: 'The queried slug' })
  slug!: string;

  @ApiPropertyOptional({ example: 'tasty-bites-4x9a', description: 'Suggested alternative if unavailable' })
  suggestedSlug?: string;
}

export class RestaurantPaginatedResponseDto {
  @ApiProperty({ type: [RestaurantResponseDto], description: 'List of restaurants' })
  data!: RestaurantResponseDto[];

  @ApiProperty({
    example: { page: 1, limit: 12, total: 1, totalPages: 1 },
    description: 'Pagination metadata'
  })
  meta!: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class QueryRestaurantDto {
  @ApiPropertyOptional({ description: 'Filter by organization UUID', example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901' })
  @IsOptional()
  @IsUUID()
  organizationId?: string;

  @ApiPropertyOptional({ description: 'Search term for name, slug, or description', example: 'Tasty' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ default: 1, example: 1 })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ default: 12, example: 12 })
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ default: 'createdAt', example: 'createdAt' })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc', example: 'desc' })
  @IsOptional()
  sortOrder?: 'asc' | 'desc';

  @ApiPropertyOptional({ default: false, example: false, description: 'Whether to include soft-deleted records' })
  @IsOptional()
  includeDeleted?: boolean;
}
