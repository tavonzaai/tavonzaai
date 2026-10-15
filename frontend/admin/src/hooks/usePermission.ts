import { useAppSelector } from '@/redux/hooks';
import { useGetMyCapabilitiesQuery } from '@/redux/features/roleApi';

export function usePermission() {
  const user = useAppSelector((state) => state.auth.user);
  const { data: myCapabilities } = useGetMyCapabilitiesQuery(undefined, {
    skip: !user,
  });

  const effectiveRole = (
    myCapabilities?.globalRole ||
    user?.globalRole ||
    user?.role ||
    ''
  ).toUpperCase();

  const permissions: string[] =
    myCapabilities?.permissions && myCapabilities.permissions.length > 0
      ? myCapabilities.permissions
      : user?.permissions || [];

  const isSuperAdmin =
    effectiveRole === 'SUPER_ADMIN' ||
    effectiveRole === 'PLATFORM_SUPER_ADMIN' ||
    effectiveRole === 'ORGANIZATION_OWNER';

  /**
   * Check if current user has a specific atomic permission
   */
  const hasPermission = (permission: string): boolean => {
    if (isSuperAdmin) return true;
    if (permissions.includes('*') || permissions.includes('*:*')) return true;
    if (permissions.includes(permission)) return true;

    // Check wildcard module matching e.g. "orders:*" matches "orders:read"
    const [moduleName] = permission.split(':');
    if (moduleName && permissions.includes(`${moduleName}:*`)) return true;

    return false;
  };

  /**
   * Check if current user has ANY of the specified permissions
   */
  const hasAnyPermission = (...perms: string[]): boolean => {
    if (isSuperAdmin) return true;
    if (perms.length === 0) return true;
    return perms.some((p) => hasPermission(p));
  };

  /**
   * Check if current user has ALL specified permissions
   */
  const hasAllPermissions = (...perms: string[]): boolean => {
    if (isSuperAdmin) return true;
    if (perms.length === 0) return true;
    return perms.every((p) => hasPermission(p));
  };

  return {
    user,
    role: effectiveRole,
    dynamicRole: myCapabilities?.role || null,
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isSuperAdmin,
  };
}
