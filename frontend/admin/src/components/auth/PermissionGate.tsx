import React from 'react';
import { usePermission } from '@/hooks/usePermission';

export interface PermissionGateProps {
  permission?: string;
  anyOf?: string[];
  allOf?: string[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const PermissionGate: React.FC<PermissionGateProps> = ({
  permission,
  anyOf,
  allOf,
  fallback = null,
  children,
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermission();

  let isAllowed = true;

  if (permission && !hasPermission(permission)) {
    isAllowed = false;
  }
  if (anyOf && !hasAnyPermission(...anyOf)) {
    isAllowed = false;
  }
  if (allOf && !hasAllPermissions(...allOf)) {
    isAllowed = false;
  }

  if (!isAllowed) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default PermissionGate;
