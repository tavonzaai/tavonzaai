import { applyDecorators } from '@nestjs/common';
import {
  ApiResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
  ApiInternalServerErrorResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { ApiErrorResponseDto } from './api-error-response.dto';

export type StandardErrorStatus = 400 | 401 | 403 | 404 | 409 | 422 | 500;

export function ApiStandardErrors(...statuses: StandardErrorStatus[]) {
  const decorators = [];
  const targetStatuses = statuses.length > 0 ? statuses : [400, 401, 403, 404, 500];

  for (const status of targetStatuses) {
    switch (status) {
      case 400:
        decorators.push(
          ApiBadRequestResponse({
            description: 'Bad Request / Validation Failure',
            type: ApiErrorResponseDto,
          }),
        );
        break;
      case 401:
        decorators.push(
          ApiUnauthorizedResponse({
            description: 'Unauthorized: Missing or invalid authentication token',
            type: ApiErrorResponseDto,
          }),
        );
        break;
      case 403:
        decorators.push(
          ApiForbiddenResponse({
            description: 'Forbidden: Insufficient capabilities or tenant boundary mismatch',
            type: ApiErrorResponseDto,
          }),
        );
        break;
      case 404:
        decorators.push(
          ApiNotFoundResponse({
            description: 'Resource not found',
            type: ApiErrorResponseDto,
          }),
        );
        break;
      case 409:
        decorators.push(
          ApiConflictResponse({
            description: 'Conflict / Unique constraint violation',
            type: ApiErrorResponseDto,
          }),
        );
        break;
      case 422:
        decorators.push(
          ApiResponse({
            status: 422,
            description: 'Unprocessable Entity / Business Rule Violation',
            type: ApiErrorResponseDto,
          }),
        );
        break;
      case 500:
        decorators.push(
          ApiInternalServerErrorResponse({
            description: 'Internal server error',
            type: ApiErrorResponseDto,
          }),
        );
        break;
    }
  }

  return applyDecorators(...decorators);
}

export function ApiPaginationQuery(options?: {
  defaultLimit?: number;
  sortColumns?: string[];
  defaultSortBy?: string;
}) {
  const sortExample = options?.defaultSortBy || 'createdAt';
  return applyDecorators(
    ApiQuery({
      name: 'page',
      required: false,
      type: Number,
      example: 1,
      description: 'Page index for pagination (1-based)',
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      example: options?.defaultLimit ?? 20,
      description: 'Maximum number of items to return per page (default: 20, max: 100)',
    }),
    ApiQuery({
      name: 'search',
      required: false,
      type: String,
      example: '',
      description: 'Optional search text to filter by primary text fields',
    }),
    ApiQuery({
      name: 'sortBy',
      required: false,
      type: String,
      example: sortExample,
      description: `Column to sort by (e.g. ${options?.sortColumns ? options.sortColumns.join(', ') : 'createdAt, name'})`,
    }),
    ApiQuery({
      name: 'sortOrder',
      required: false,
      enum: ['asc', 'desc'],
      example: 'desc',
      description: 'Sort order direction: "asc" or "desc"',
    }),
  );
}
