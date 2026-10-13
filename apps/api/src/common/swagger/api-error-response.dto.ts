import { ApiProperty } from '@nestjs/swagger';
import { ErrorCode, type ApiErrorResponse, type ApiFieldError } from '@tavonza/contracts';

export class ApiFieldErrorDto implements ApiFieldError {
  @ApiProperty({
    description: 'Path of the offending field',
    example: 'email',
  })
  path!: string;

  @ApiProperty({
    description: 'Validation or constraint error message for this field',
    example: 'email must be a valid email address',
  })
  message!: string;
}

export class ApiErrorResponseDto implements ApiErrorResponse {
  @ApiProperty({
    description: 'Indicates the request failed',
    example: false,
  })
  success!: false;

  @ApiProperty({
    description: 'HTTP status code',
    example: 400,
  })
  statusCode!: number;

  @ApiProperty({
    description: 'Machine-readable stable error code',
    enum: Object.values(ErrorCode),
    example: ErrorCode.VALIDATION_FAILED,
  })
  errorCode!: ErrorCode;

  @ApiProperty({
    description: 'Human-readable error summary',
    example: 'Validation failed for incoming request body.',
  })
  message!: string;

  @ApiProperty({
    type: [ApiFieldErrorDto],
    description: 'List of specific field validation errors (empty array if not applicable)',
    example: [
      {
        path: 'email',
        message: 'email must be a valid email address',
      },
    ],
  })
  errorMessages!: ApiFieldErrorDto[];

  @ApiProperty({
    description: 'URL path of the failed request',
    example: '/api/v1/auth/register',
  })
  path!: string;

  @ApiProperty({
    description: 'HTTP method used',
    example: 'POST',
  })
  method!: string;

  @ApiProperty({
    description: 'Correlation request ID for distributed tracing',
    example: 'req-4c8d-8a1e-b49d102e3a5f',
  })
  requestId!: string;

  @ApiProperty({
    description: 'ISO-8601 timestamp of when the error occurred',
    example: '2026-10-08T14:30:00.000Z',
  })
  timestamp!: string;

  @ApiProperty({
    required: false,
    description: 'Diagnostic debug information (only available in development environment)',
    example: {
      detail: 'Key (email)=(user@example.com) already exists.',
    },
  })
  debug?: Record<string, unknown>;
}

export class HealthCheckResponseDto {
  @ApiProperty({ example: 'ok', description: 'Application operational status' })
  status!: string;

  @ApiProperty({ example: '2026-10-08T14:30:00.000Z', description: 'Current server UTC ISO timestamp' })
  timestamp!: string;
}

export class RootInfoResponseDto {
  @ApiProperty({ example: 'Tavonza AI API', description: 'Application service name' })
  service!: string;

  @ApiProperty({ example: 'online', description: 'Application operational status' })
  status!: string;

  @ApiProperty({ example: '/docs', description: 'Path to interactive Swagger documentation' })
  docs!: string;
}
