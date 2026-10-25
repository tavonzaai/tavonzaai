import { SetMetadata } from '@nestjs/common';
import type { ScopeType } from '@/authorization';

export const SCOPE_KEY = 'requiredScope';

export interface RequiredScopeMetadata {
  type: ScopeType;
  param?: string;
}

export const RequireScope = (type: ScopeType, param = 'id') =>
  SetMetadata(SCOPE_KEY, { type, param } satisfies RequiredScopeMetadata);
