#!/usr/bin/env node
/**
 * End-to-end static + unit verification for the four product requirements:
 * 1) Role analytics dashboards (no getAll for KPIs)
 * 2) Branch manager menu categories module
 * 3) Waiter assigned-table order scoping
 * 4) No Assistant Manager in branch manager UI
 */
import { spawnSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
let failed = 0;

function ok(label) {
  console.log(`  PASS  ${label}`);
}
function fail(label, detail) {
  failed += 1;
  console.error(`  FAIL  ${label}${detail ? `\n         ${detail}` : ''}`);
}

function read(rel) {
  const p = resolve(root, rel);
  if (!existsSync(p)) return null;
  return readFileSync(p, 'utf8');
}

console.log('\n=== 1) Analytics APIs for all roles ===');
{
  const ctrl = read('apps/api/src/modules/analytics/presentation/http/analytics.controller.ts') || '';
  const required = [
    "Get('overview')",
    "Get('branch-dashboard')",
    "Get('waiter-dashboard')",
    "Get('cashier-dashboard')",
    "Get('kitchen-dashboard')",
    "Get('bartender-dashboard')",
    "Get('customer-dashboard')",
  ];
  for (const r of required) {
    if (ctrl.includes(r)) ok(`controller has ${r}`);
    else fail(`controller missing ${r}`);
  }

  const managerDash = read('frontend/manager/src/components/branch-manager-dashboard/dashboard/DashboardView.tsx') || '';
  if (managerDash.includes('getBranchDashboardAnalytics')) ok('manager dashboard uses analytics API');
  else fail('manager dashboard not wired to analytics');
  if (!managerDash.includes('getOrders(') && !managerDash.includes('getTables(')) {
    ok('manager dashboard does not call getOrders/getTables');
  } else fail('manager dashboard still calls getOrders/getTables');

  const cashier = read('frontend/cashier/src/components/updated-cashier-dashboard/CashierDashboardView.tsx') || '';
  if (cashier.includes('getCashierDashboardAnalytics') && cashier.includes('dashboardKpis')) {
    ok('cashier KPIs from analytics API');
  } else fail('cashier KPIs not wired to analytics');
  if (cashier.includes('$9,860')) fail('cashier still shows hardcoded fake revenue');
  else ok('cashier fake KPI placeholders removed');

  const kitchen = read('frontend/kitchen/src/components/updated-kitchen-dashboard/KitchenDashboardView.tsx') || '';
  if (kitchen.includes('getKitchenDashboardAnalytics') && kitchen.includes('analyticsCounts')) {
    ok('kitchen filter counts from analytics API');
  } else fail('kitchen counts not wired to analytics');

  const admin = read('frontend/admin/src/components/new-admin-dashboard/views/DashboardView.tsx') || '';
  if (admin.includes('useGetAnalyticsOverviewQuery')) ok('admin dashboard uses analytics overview');
  else fail('admin dashboard missing analytics overview');

  const waiterApi = read('frontend/waiter/src/redux/features/waiterApi.ts') || '';
  if (waiterApi.includes('getWaiterDashboardAnalytics')) ok('waiter analytics client exists');
  else fail('waiter analytics client missing');
}

console.log('\n=== 2) Branch manager menu categories module ===');
{
  const view = read('frontend/manager/src/components/branch-manager-dashboard/menu/MenuCategoriesView.tsx');
  const sidebar = read('frontend/manager/src/components/branch-manager-dashboard/Sidebar.tsx') || '';
  const routes = read('frontend/manager/src/components/branch-manager-dashboard/routes.ts') || '';
  const shell = read('frontend/manager/src/components/branch-manager-dashboard/BranchManagerDashboard.tsx') || '';
  const api = read('frontend/manager/src/redux/features/branchManagerApi.ts') || '';

  if (view) ok('MenuCategoriesView exists');
  else fail('MenuCategoriesView missing');
  if (sidebar.includes("tabKey: 'Categories'")) ok('Categories nav item present');
  else fail('Categories nav missing');
  if (routes.includes('Categories')) ok('Categories route mapped');
  else fail('Categories route missing');
  if (shell.includes('MenuCategoriesView')) ok('Categories view mounted in dashboard shell');
  else fail('Categories view not mounted');
  if (api.includes("'/menus/categories'") && api.includes('restaurantId')) {
    ok('createCategory posts to /menus/categories with restaurantId');
  } else fail('createCategory contract incomplete');
  if (api.includes('Cannot create menu category: restaurantId is missing')) {
    ok('createCategory refuses branchId-as-restaurantId fallback');
  } else fail('createCategory still allows invalid restaurantId fallback');
}

console.log('\n=== 3) Waiter assigned-table order scoping ===');
{
  const repo = read('apps/api/src/modules/waiter/infrastructure/persistence/drizzle-waiter-order.repository.ts') || '';
  const svc = read('apps/api/src/modules/waiter/application/services/waiter.service.ts') || '';
  const api = read('frontend/waiter/src/redux/features/waiterApi.ts') || '';

  if (repo.includes('assignedIds.length === 0') && repo.includes('return []')) {
    ok('backend returns [] when waiter has no assignments');
  } else fail('backend empty-assignment guard missing');
  if (repo.includes('ALL_TABLES is intentionally ignored')) ok('backend ignores ALL_TABLES');
  else fail('backend ALL_TABLES ignore missing');
  if (repo.includes('!assignedIds.includes(resolvedTableId)')) {
    ok('backend rejects tableId outside assignment set');
  } else fail('backend tableId ownership check missing');
  if (svc.includes("scope: 'MY_TABLES'")) ok('waiter service forces MY_TABLES scope');
  else fail('waiter service does not force MY_TABLES');
  if (api.includes("q.append('scope', 'MY_TABLES')")) ok('frontend always requests MY_TABLES');
  else fail('frontend does not force MY_TABLES');
  if (!api.includes('/orders/branch/')) ok('frontend removed /orders/branch fallback');
  else fail('frontend still falls back to /orders/branch (branch-wide leak)');
}

console.log('\n=== 4) No Assistant Manager for branch managers ===');
{
  const staffList = read('frontend/manager/src/components/branch-manager-dashboard/staff/StaffListView.tsx') || '';
  const addModal = read('frontend/manager/src/components/branch-manager-dashboard/staff/AddStaffModal.tsx') || '';
  const types = read('frontend/manager/src/components/branch-manager-dashboard/types.ts') || '';
  const policy = read('apps/api/src/modules/authorization/application/branch-access.policy.ts') || '';

  if (!/filterTabs\s*=\s*\[[^\]]*Assistant Manager/.test(staffList.replace(/\n/g, ' '))) {
    ok('StaffListView filter tabs exclude Assistant Manager');
  } else fail('StaffListView still references Assistant Manager');
  if (staffList.includes("roleUpper !== 'BRANCH_MANAGER'")) ok('staff list hides BRANCH_MANAGER peers');
  else fail('staff list does not filter BRANCH_MANAGER');
  if (!/value:\s*'BRANCH_MANAGER'/.test(addModal) && !/label:\s*'Assistant Manager'/.test(addModal)) {
    ok('AddStaffModal cannot create Assistant Manager / BRANCH_MANAGER');
  } else fail('AddStaffModal still allows BRANCH_MANAGER');
  if (!types.includes('Assistant Manager')) ok('StaffCardData type has no Assistant Manager');
  else fail('types still include Assistant Manager');
  if (policy.includes("'BRANCH_MANAGER'") === false || !policy.includes("BRANCH_MANAGER_CREATABLE_ROLES = [\n  'BRANCH_MANAGER'")) {
    // creatable list must not include BRANCH_MANAGER
    if (!/BRANCH_MANAGER_CREATABLE_ROLES = \[[^\]]*BRANCH_MANAGER/.test(policy.replace(/\s+/g, ' '))) {
      ok('backend BRANCH_MANAGER_CREATABLE_ROLES excludes BRANCH_MANAGER');
    } else fail('backend still allows creating BRANCH_MANAGER');
  }
}

console.log('\n=== Unit specs ===');
{
  const r = spawnSync(
    'pnpm',
    [
      'exec',
      'node',
      '--experimental-strip-types',
      '--test',
      'src/modules/authorization/application/branch-access.policy.spec.ts',
      'src/modules/waiter/infrastructure/persistence/waiter-order-scope.spec.ts',
      'src/modules/analytics/application/analytics-role-dashboards.spec.ts',
      'src/modules/branches/domain/staff-list-filter.spec.ts',
    ],
    { cwd: resolve(root, 'apps/api'), encoding: 'utf8' },
  );
  const out = `${r.stdout || ''}\n${r.stderr || ''}`;
  const passMatch = out.match(/ℹ pass (\d+)/);
  const failMatch = out.match(/ℹ fail (\d+)/);
  const passes = passMatch ? Number(passMatch[1]) : 0;
  const fails = failMatch ? Number(failMatch[1]) : 1;
  if (r.status === 0 && fails === 0 && passes > 0) ok(`node tests passed (${passes})`);
  else fail('node unit tests failed', out.slice(-800));
}

console.log('\n=== Summary ===');
if (failed === 0) {
  console.log('All requirement checks passed.\n');
  process.exit(0);
}
console.error(`${failed} check(s) failed.\n`);
process.exit(1);
