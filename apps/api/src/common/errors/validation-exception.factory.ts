import { HttpStatus, ValidationError } from '@nestjs/common';
import { ErrorCode, type ApiFieldError } from '@tavonza/contracts';
import { AppException } from './app.exception';

function extractFieldErrors(errors: ValidationError[], parentPath = ''): ApiFieldError[] {
  const result: ApiFieldError[] = [];

  for (const error of errors) {
    const currentPath = parentPath ? `${parentPath}.${error.property}` : error.property;

    if (error.constraints) {
      for (const message of Object.values(error.constraints)) {
        result.push({
          path: currentPath,
          message,
        });
      }
    }

    if (error.children && error.children.length > 0) {
      result.push(...extractFieldErrors(error.children, currentPath));
    }
  }

  return result;
}

export function createValidationException(errors: ValidationError[]): AppException {
  const fieldErrors = extractFieldErrors(errors);
  const firstMessage = fieldErrors[0]?.message || 'Validation failed';

  return new AppException(
    HttpStatus.BAD_REQUEST,
    ErrorCode.VALIDATION_FAILED,
    `Validation failed: ${firstMessage}`,
    {
      errorMessages: fieldErrors,
    },
  );
}
