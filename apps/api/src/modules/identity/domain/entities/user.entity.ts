// ============================================================================
// User Domain Entity
// ============================================================================

import type { Permission, Scope } from '@tavonza/authorization';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  contactNo?: string | null;
  phone?: string | null;
  role: string; // Label (e.g. 'customer', 'waiter', 'kitchen', 'cashier', 'manager', 'owner', 'super_admin')
  avatar?: string | null;
  status?: string;
  permissions: Permission[];
  scopes: Scope[];
  organizationId?: string | null;
  isActive: boolean;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  refreshToken?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface OtpCode {
  id: string;
  userId: string;
  code: string;
  type: 'email_verification' | 'phone_verification' | 'password_reset';
  expiresAt: Date;
  usedAt?: Date | null;
  createdAt: Date;
}
