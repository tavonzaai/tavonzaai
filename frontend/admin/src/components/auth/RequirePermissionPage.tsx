'use client';

import React from 'react';
import { usePermission } from '@/hooks/usePermission';
import { ShieldAlert } from 'lucide-react';

export interface RequirePermissionPageProps {
  permission?: string;
  anyOf?: string[];
  allOf?: string[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function RequirePermissionPage({
  permission,
  anyOf,
  allOf,
  fallback,
  children,
}: RequirePermissionPageProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, isSuperAdmin } = usePermission();

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

  if (isSuperAdmin) {
    isAllowed = true;
  }

  if (!isAllowed) {
    if (fallback) return <>{fallback}</>;

    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center bg-neutral-950 rounded-2xl border border-neutral-800 text-white">
        <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mb-4">
          <ShieldAlert className="size-7" />
        </div>
        <h2 className="text-xl font-bold font-['Inter']">Access Denied</h2>
        <p className="text-sm text-neutral-400 mt-2 max-w-md font-['Inter']">
          Your assigned role does not have the required permissions{' '}
          {permission && <span className="text-amber-400 font-mono text-xs">({permission})</span>} to access this section.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}

export default RequirePermissionPage;
