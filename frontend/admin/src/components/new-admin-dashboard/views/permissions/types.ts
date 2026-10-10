import React from 'react';

export interface RoleDefinition {
  id: string;
  name: string;
  staffCount: number;
  isLocked?: boolean;
}

export interface PermissionItem {
  id: string;
  label: string;
  category: string;
}

export interface PermissionCategory {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  permissions: PermissionItem[];
}
