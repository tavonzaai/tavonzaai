// ============================================================================
// @tavonza/authorization — HTTP Adapter: Decorators & Metadata Keys
// ============================================================================
// Standardized metadata keys and route-level authorization declaration helpers.
// Compatible with NestJS, Express metadata reflections, or custom routers.
// ============================================================================

export const PERMISSIONS_METADATA_KEY = 'permissions';
export const AUTHORIZATION_RULE_KEY = 'authorization:rule';

export interface AuthorizationRuleOptions {
  resource: string;
  action: string;
  requireOwnership?: boolean;
  scopeType?: string;
}

/**
 * Standard Custom Decorator implementation that works with NestJS SetMetadata
 * or direct Reflect.defineMetadata.
 */
function createMetadataDecorator<T>(metadataKey: string, value: T): MethodDecorator & ClassDecorator {
  return ((
    target: object,
    _propertyKey?: string | symbol,
    descriptor?: TypedPropertyDescriptor<any>,
  ) => {
    const reflectAny = typeof Reflect !== 'undefined' ? (Reflect as any) : undefined;
    if (descriptor) {
      // Method decorator
      if (reflectAny && typeof reflectAny.defineMetadata === 'function') {
        reflectAny.defineMetadata(metadataKey, value, descriptor.value);
      }
      return descriptor;
    }
    // Class decorator
    if (reflectAny && typeof reflectAny.defineMetadata === 'function') {
      reflectAny.defineMetadata(metadataKey, value, target);
    }
    return target as any;
  }) as MethodDecorator & ClassDecorator;
}

/**
 * Declares one or more capability permissions required to execute the route.
 * Example: @RequirePermissions('orders:read') or @RequirePermissions('orders.read')
 */
export function RequirePermissions(...permissions: string[]): MethodDecorator & ClassDecorator {
  return createMetadataDecorator(PERMISSIONS_METADATA_KEY, permissions);
}

/**
 * Declares a structured authorization requirement on a route.
 * Example: @Authorize({ resource: 'order', action: 'create' })
 */
export function Authorize(options: AuthorizationRuleOptions): MethodDecorator & ClassDecorator {
  return createMetadataDecorator(AUTHORIZATION_RULE_KEY, options);
}
