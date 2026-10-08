import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsUrl,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateRestaurantDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', description: 'Organization ID owning this restaurant' })
  @IsUUID()
  @IsNotEmpty()
  organizationId!: string;

  @ApiProperty({ example: 'Tasty Bites Grill & Bar' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(255)
  name!: string;

  @ApiPropertyOptional({ example: 'tasty-bites-grill' })
  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9-]+$/, { message: 'Slug can only contain lowercase alphanumeric characters and hyphens' })
  @MaxLength(100)
  slug?: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/logo.png' })
  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @ApiPropertyOptional({ example: 'Artisanal burgers and craft cocktails.' })
  @IsOptional()
  @IsString()
  description?: string;
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
  @Matches(/^[a-z0-9-]+$/, { message: 'Slug can only contain lowercase alphanumeric characters and hyphens' })
  @MaxLength(100)
  slug?: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/new-logo.png' })
  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @ApiPropertyOptional({ example: 'Updated description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
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

  @ApiProperty({ example: '2026-10-01T12:00:00.000Z', description: 'Creation timestamp' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-10-01T12:00:00.000Z', description: 'Update timestamp' })
  updatedAt!: Date;
}

export class RestaurantPaginatedResponseDto {
  @ApiProperty({ type: [RestaurantResponseDto], description: 'List of restaurants' })
  data!: RestaurantResponseDto[];

  @ApiProperty({
    example: { page: 1, limit: 10, total: 1, totalPages: 1 },
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

  @ApiPropertyOptional({ default: 10, example: 10 })
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

