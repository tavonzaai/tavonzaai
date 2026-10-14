import { useAppSelector } from '@/redux/store';

export function useOrganizationId(): string | null {
  const tenantId = useAppSelector((state) => state.tenant.organizationId);
  const userId = useAppSelector((state) => state.auth.user?.organizationId);
  return tenantId || userId || null;
}
