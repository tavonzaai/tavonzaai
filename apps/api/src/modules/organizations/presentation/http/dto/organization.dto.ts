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
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty() ownerId!: string;
  @ApiProperty() slug!: string;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
}
