import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class CreateOrganizationDto {
  @ApiProperty({ example: 'Tasty Bites Group', description: 'Name of the organization' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(255)
  name!: string;

  @ApiPropertyOptional({ example: 'tasty-bites', description: 'Unique slug for URL routing' })
  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9-]+$/, { message: 'Slug can only contain lowercase alphanumeric characters and hyphens' })
  @MaxLength(100)
  slug?: string;
}

export class UpdateOrganizationDto {
  @ApiPropertyOptional({ example: 'Tasty Bites Group International' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({ example: 'tasty-bites-intl' })
  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9-]+$/, { message: 'Slug can only contain lowercase alphanumeric characters and hyphens' })
  @MaxLength(100)
  slug?: string;
}

export class OrganizationResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', description: 'Organization UUID' })
  id!: string;

  @ApiProperty({ example: 'Tasty Bites Group', description: 'Organization display name' })
  name!: string;

  @ApiProperty({ example: 'f0e1d2c3-b4a5-6789-0123-456789abcdef', description: 'Platform owner user UUID' })
  ownerId!: string;

  @ApiProperty({ example: 'tasty-bites', description: 'Unique URL slug' })
  slug!: string;

  @ApiProperty({ example: '2026-10-01T12:00:00.000Z', description: 'Creation timestamp' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-10-01T12:00:00.000Z', description: 'Update timestamp' })
  updatedAt!: Date;
}

export class OrganizationPaginatedResponseDto {
  @ApiProperty({ type: [OrganizationResponseDto], description: 'List of organization records' })
  data!: OrganizationResponseDto[];

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

export class QueryOrganizationDto {
  @ApiPropertyOptional({ description: 'Search term for name or slug', example: 'Tasty' })
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
}

