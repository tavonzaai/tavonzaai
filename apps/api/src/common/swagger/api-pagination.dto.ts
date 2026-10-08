import { ApiProperty } from '@nestjs/swagger';
import type { PaginationMeta } from '@tavonza/contracts';

export class PaginationMetaDto implements PaginationMeta {
  @ApiProperty({ example: 1, description: 'Current page number (1-indexed)' })
  page!: number;

  @ApiProperty({ example: 20, description: 'Number of items per page' })
  limit!: number;

  @ApiProperty({ example: 45, description: 'Total number of items matching filter criteria' })
  total!: number;

  @ApiProperty({ example: 3, description: 'Total number of available pages' })
  totalPages!: number;

  @ApiProperty({ example: 3, description: 'Alias for totalPages for backward compatibility', required: false })
  totalPage?: number;

  @ApiProperty({ example: true, description: 'True if subsequent page exists' })
  hasNextPage!: boolean;

  @ApiProperty({ example: false, description: 'True if previous page exists' })
  hasPreviousPage!: boolean;
}
