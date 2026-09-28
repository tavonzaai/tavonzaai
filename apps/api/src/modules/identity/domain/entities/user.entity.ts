// ============================================================================
// User Domain Entity
// ============================================================================

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  role: 'super_admin' | 'owner' | 'manager' | 'staff' | 'kitchen';
  organizationId?: string | null;
  isActive: boolean;
  isEmailVerified: boolean;
  refreshToken?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface OtpCode {
  id: string;
  userId: string;
  code: string;
  type: 'email_verification' | 'password_reset';
  expiresAt: Date;
  usedAt?: Date | null;
  createdAt: Date;
}
