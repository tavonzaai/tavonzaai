import { useState, useEffect, useMemo } from 'react';
import {
  useGetUsersQuery,
  useGetBranchesQuery,
  useGetBranchStaffQuery,
} from '@/redux/features/adminApi';
import { useGetRolesQuery } from '@/redux/features/roleApi';
import { restaurantService } from '@/redux/features/restaurantApi';

export interface ManagerUserOption {
  id: string;
  name: string;
  email: string;
  roleLabel: string;
}

export function useBranchManagers(branchId?: string) {
  // 1. Fetch branches so we know which branch(es) exist
  const { data: branchesData, isLoading: loadingBranches } = useGetBranchesQuery({
    page: 1,
    limit: 100,
  });

  const effectiveBranchId = branchId || branchesData?.data?.[0]?.id;

  // 2. Fetch staff for the primary/selected branch via RTK Query
  const { data: directStaffData, isLoading: loadingDirectStaff } = useGetBranchStaffQuery(
    { branchId: effectiveBranchId as string },
    { skip: !effectiveBranchId },
  );

  // 3. Also fetch all users and dynamic roles
  const { data: usersData, isLoading: loadingUsers } = useGetUsersQuery({ limit: 100 });
  const { data: roles = [], isLoading: loadingRoles } = useGetRolesQuery();

  // 4. In case there are multiple branches, fetch all branch staff asynchronously
  const [allBranchStaff, setAllBranchStaff] = useState<any[]>([]);
  const [loadingAllBranchStaff, setLoadingAllBranchStaff] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const branches = branchesData?.data || [];
    if (!Array.isArray(branches) || branches.length === 0) return;

    // Collect all branch IDs to fetch staff from
    const branchIds = Array.from(
      new Set(
        [branchId, ...branches.map((b: any) => b.id)].filter(Boolean) as string[],
      ),
    );

    async function loadAllStaff() {
      setLoadingAllBranchStaff(true);
      try {
        const staffArrays = await Promise.all(
          branchIds.map(async (bId) => {
            try {
              return await restaurantService.getBranchStaff(bId);
            } catch {
              return [];
            }
          }),
        );
        if (isMounted) {
          setAllBranchStaff(staffArrays.flat());
        }
      } catch (e) {
        console.error('Error fetching all branch staff:', e);
      } finally {
        if (isMounted) setLoadingAllBranchStaff(false);
      }
    }

    loadAllStaff();

    return () => {
      isMounted = false;
    };
  }, [branchId, branchesData]);

  // Combine and deduplicate manager staff
  const managerUsers = useMemo<ManagerUserOption[]>(() => {
    const list: ManagerUserOption[] = [];
    const seen = new Set<string>();

    const addManager = (
      id: string,
      name: string,
      email: string,
      roleLabel = 'Branch Manager',
    ) => {
      const cleanName = (name || '').trim();
      const cleanEmail = (email || '').trim();
      if (!cleanName && !cleanEmail) return;

      const dedupeKey = `${cleanName.toLowerCase()}_${cleanEmail.toLowerCase()}`;
      if (seen.has(dedupeKey)) return;
      seen.add(dedupeKey);

      list.push({
        id: id || cleanEmail || cleanName,
        name: cleanName || cleanEmail,
        email: cleanEmail,
        roleLabel,
      });
    };

    // Priority 1: Direct staff from the active branch query (GET /branches/:branchId/staff)
    const directStaff = Array.isArray(directStaffData) ? directStaffData : [];
    directStaff.forEach((member: any) => {
      const roleStr = String(member.role || '').toUpperCase();
      if (roleStr === 'BRANCH_MANAGER' || roleStr.includes('MANAGER')) {
        addManager(
          member.userId || member.staffId || member.id,
          member.name,
          member.email,
          'Branch Manager',
        );
      }
    });

    // Priority 2: Staff from all organization branches
    allBranchStaff.forEach((member: any) => {
      const roleStr = String(member.role || '').toUpperCase();
      if (roleStr === 'BRANCH_MANAGER' || roleStr.includes('MANAGER')) {
        addManager(
          member.userId || member.staffId || member.id,
          member.name,
          member.email,
          'Branch Manager',
        );
      }
    });

    // Priority 3: Any users from GET /users with manager roles or email pattern
    const allUsers: any[] = usersData?.data || [];
    const managerRoleIds = new Set(
      roles
        .filter(
          (r) =>
            r.slug.toLowerCase().includes('manager') ||
            r.name.toLowerCase().includes('manager'),
        )
        .map((r) => r.id),
    );

    allUsers.forEach((u: any) => {
      const roleStr = String(u.role || u.globalRole || '').toUpperCase();
      const dynamicRoleStr = String(
        u.dynamicRole || u.dynamicRoleSlug || '',
      ).toUpperCase();
      const email = String(u.email || '').toLowerCase();

      const isManager =
        roleStr.includes('MANAGER') ||
        roleStr === 'BRANCH_MANAGER' ||
        dynamicRoleStr.includes('MANAGER') ||
        (Array.isArray(u.assignments) &&
          u.assignments.some((a: any) =>
            String(a.role || '').toUpperCase().includes('MANAGER'),
          )) ||
        (u.userRole?.roleId && managerRoleIds.has(u.userRole.roleId)) ||
        email.startsWith('manager') ||
        email.includes('manager@');

      if (isManager) {
        addManager(
          u.id,
          u.name,
          u.email,
          u.dynamicRole ||
            (u.role && u.role !== 'STAFF' && u.role !== 'CUSTOMER'
              ? u.role.replace(/_/g, ' ')
              : 'Branch Manager'),
        );
      }
    });

    return list;
  }, [directStaffData, allBranchStaff, usersData, roles]);

  return {
    managerUsers,
    isLoading:
      loadingDirectStaff ||
      loadingBranches ||
      loadingUsers ||
      loadingRoles ||
      loadingAllBranchStaff,
  };
}
