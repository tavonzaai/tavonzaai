import React from 'react';
import { BranchItem } from '../../../../types';
import { StaffMember } from '../types';
import { useGetAnalyticsOverviewQuery } from '@/redux/features/adminApi';

interface BranchOverviewTabProps {
  branch: BranchItem;
  availableTables: number;
  totalTables: number;
  occupiedTables: number;
  staffList: StaffMember[];
}

export const BranchOverviewTab: React.FC<BranchOverviewTabProps> = ({
  branch,
  availableTables,
  totalTables,
  occupiedTables,
  staffList,
}) => {
  // Query live branch analytics overview if branch ID is available
  const { data: analytics, isLoading: isAnalyticsLoading } = useGetAnalyticsOverviewQuery(
    branch?.id ? { branchId: branch.id } : undefined,
    { skip: !branch?.id }
  );

  const hasRevenueData = isAnalyticsLoading || (analytics && typeof analytics.paidRevenue === 'number');
  const hasOrdersData = isAnalyticsLoading || (analytics && typeof analytics.ordersCount === 'number');
  const hasTablesData = typeof totalTables === 'number';
  const hasStaffData = Array.isArray(staffList);

  // Operations API data: Rendered only when live operations API response is present
  const operationsData =
    (branch as any)?.operations ||
    (analytics as any)?.operations ||
    null;
  const hasOperationsData = Boolean(operationsData);

  const activeStaffCount = staffList.filter((s) => s.status === 'Active').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Row of Metric Cards — Only display cards backed by live API or props */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Today's Revenue */}
        {hasRevenueData && (
          <div className="p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-300/20 flex flex-col justify-start items-start gap-3.5 shadow-xl">
            <div className="self-stretch inline-flex justify-between items-center">
              <span className="text-white text-lg font-semibold font-['Inter']">
                Today’s Revenue
              </span>
            </div>
            <div className="self-stretch h-0 outline outline-1 outline-offset-[-0.50px] outline-neutral-800" />
            <div className="self-stretch flex flex-col justify-start items-start gap-3">
              {isAnalyticsLoading ? (
                <div className="h-7 w-28 bg-neutral-800 rounded animate-pulse" />
              ) : (
                <span className="text-white text-2xl font-medium font-['Inter'] leading-7">
                  ${Number(analytics?.paidRevenue ?? 0).toLocaleString()}
                </span>
              )}
              <span className="text-green-500 text-sm font-normal font-['Poppins'] leading-4">
                {analytics?.paidRevenue && analytics.paidRevenue > 0
                  ? 'Total settled revenue'
                  : 'Live sales overview'}
              </span>
            </div>
          </div>
        )}

        {/* Card 2: Orders */}
        {hasOrdersData && (
          <div className="p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-300/20 flex flex-col justify-start items-start gap-3.5 shadow-xl">
            <div className="self-stretch inline-flex justify-between items-center">
              <span className="text-white text-lg font-semibold font-['Inter']">
                Orders
              </span>
            </div>
            <div className="self-stretch h-0 outline outline-1 outline-offset-[-0.50px] outline-neutral-800" />
            <div className="self-stretch flex flex-col justify-start items-start gap-3">
              {isAnalyticsLoading ? (
                <div className="h-7 w-20 bg-neutral-800 rounded animate-pulse" />
              ) : (
                <span className="text-white text-2xl font-medium font-['Inter'] leading-7">
                  {analytics?.ordersCount ?? 0}
                </span>
              )}
              <span className="text-green-500 text-sm font-normal font-['Inter'] leading-4">
                {analytics?.pendingOrders !== undefined
                  ? `${analytics.pendingOrders} currently open / pending`
                  : 'Live order tracking'}
              </span>
            </div>
          </div>
        )}

        {/* Card 3: Tables */}
        {hasTablesData && (
          <div className="p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-300/20 flex flex-col justify-start items-start gap-3.5 shadow-xl">
            <div className="self-stretch inline-flex justify-between items-center">
              <span className="text-white text-lg font-semibold font-['Inter']">
                Tables
              </span>
            </div>
            <div className="self-stretch h-0 outline outline-1 outline-offset-[-0.50px] outline-neutral-800" />
            <div className="self-stretch flex flex-col justify-start items-start gap-3">
              <span className="text-white text-2xl font-medium font-['Inter'] leading-7">
                {availableTables} / {totalTables}
              </span>
              <span className="text-green-500 text-sm font-normal font-['Inter'] leading-4">
                {Math.round((occupiedTables / (totalTables || 1)) * 100)}% occupancy
              </span>
            </div>
          </div>
        )}

        {/* Card 4: Staff on duty */}
        {hasStaffData && (
          <div className="p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-300/20 flex flex-col justify-start items-start gap-3.5 shadow-xl">
            <div className="self-stretch inline-flex justify-between items-center">
              <span className="text-white text-lg font-semibold font-['Inter']">
                Staff on duty
              </span>
            </div>
            <div className="self-stretch h-0 outline outline-1 outline-offset-[-0.50px] outline-neutral-800" />
            <div className="self-stretch flex flex-col justify-start items-start gap-3">
              <span className="text-white text-2xl font-medium font-['Inter'] leading-7">
                {activeStaffCount}
              </span>
              <span className="text-green-500 text-sm font-normal font-['Inter'] leading-4">
                {staffList.length} total staff assigned
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Section — Side-by-side if operations API data exists, or clean layout */}
      <div className={`flex flex-col ${hasOperationsData ? 'lg:flex-row items-stretch' : 'items-start'} gap-5`}>
        {/* Column 1 (Left): Today’s Operations (Preserved without deletion; shown only when live operations API exists) */}
        {hasOperationsData && (
          <div className="flex-1 p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-800 flex flex-col justify-start items-start gap-3.5 shadow-xl">
            <div className="self-stretch flex flex-col justify-start items-start gap-2">
              <h3 className="text-white text-xl font-medium font-['Poppins'] leading-6">
                Today’s Operations
              </h3>
              <span className="text-stone-300 text-sm font-normal font-['Inter'] leading-4">
                Real-time branch activity
              </span>
            </div>

            <div className="self-stretch h-0 outline outline-1 outline-offset-[-0.50px] outline-neutral-800" />

            <div className="self-stretch flex flex-col justify-start items-start gap-1.5">
              {/* Kitchen Operation */}
              <div className="self-stretch px-3.5 py-3 bg-neutral-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 flex justify-between items-center gap-2">
                <div className="flex justify-start items-center gap-2">
                  <div className="size-2 bg-amber-500 rounded-full shrink-0" />
                  <span className="text-white text-base font-medium font-['Poppins'] leading-5">
                    Kitchen
                  </span>
                </div>
                <span className="text-stone-300 text-base font-normal font-['Inter'] leading-5">
                  {operationsData?.kitchen?.status ||
                    `${operationsData?.kitchen?.preparingOrders ?? 0} orders preparing`}
                </span>
              </div>

              {/* Payments Operation */}
              <div className="self-stretch px-3.5 py-3 bg-neutral-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 flex justify-between items-center gap-2">
                <div className="flex justify-start items-center gap-2">
                  <div className="size-2 bg-green-500 rounded-full shrink-0" />
                  <span className="text-white text-base font-medium font-['Poppins'] leading-5">
                    Payments
                  </span>
                </div>
                <span className="text-stone-300 text-base font-normal font-['Inter'] leading-5">
                  {operationsData?.payments?.status ||
                    `${operationsData?.payments?.pendingSettlements ?? 0} pending settlements`}
                </span>
              </div>

              {/* Staff Operation */}
              <div className="self-stretch px-3.5 py-3 bg-neutral-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 flex justify-between items-center gap-2">
                <div className="flex justify-start items-center gap-2">
                  <div className="size-2 bg-yellow-400 rounded-full shrink-0" />
                  <span className="text-white text-base font-medium font-['Poppins'] leading-5">
                    Staff
                  </span>
                </div>
                <span className="text-stone-300 text-base font-normal font-['Inter'] leading-5">
                  {operationsData?.staff?.status || 'All shifts covered'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Column 2 (Right): Branch Information */}
        <div className={`w-full ${hasOperationsData ? 'lg:w-[460px]' : 'max-w-2xl'} p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-800 flex flex-col justify-start items-center gap-4 shadow-xl`}>
          <div className="self-stretch flex flex-col justify-start items-start gap-1.5">
            <h3 className="text-white text-lg font-semibold font-['Poppins']">
              Branch Information
            </h3>
            <span className="text-neutral-500 text-sm font-medium font-['Poppins'] leading-4">
              Location and management details
            </span>
          </div>

          <div className="self-stretch px-4 py-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-800 flex flex-col justify-start items-center gap-3">
            {/* Manager */}
            <div className="self-stretch flex justify-between items-center">
              <span className="text-neutral-500 text-base font-medium font-['Poppins'] leading-5">
                Manager
              </span>
              <span className="text-white text-base font-medium font-['Inter'] leading-5">
                {branch.manager || '—'}
              </span>
            </div>

            {/* Phone */}
            <div className="self-stretch flex justify-between items-center">
              <span className="text-neutral-500 text-base font-medium font-['Poppins'] leading-5">
                Phone
              </span>
              <span className="text-white text-base font-medium font-['Inter'] leading-5">
                {branch.contactNumber || (branch as any)?.phone || '—'}
              </span>
            </div>

            {/* Address */}
            <div className="self-stretch flex justify-between items-center">
              <span className="text-neutral-500 text-base font-medium font-['Poppins'] leading-5">
                Address
              </span>
              <span className="text-white text-base font-medium font-['Inter'] leading-5">
                {branch.location || '—'}
              </span>
            </div>

            {/* Operating hours */}
            <div className="self-stretch flex justify-between items-center">
              <span className="text-neutral-500 text-base font-medium font-['Poppins'] leading-5">
                Operating hours
              </span>
              <span className="text-white text-base font-medium font-['Inter'] leading-5">
                {branch.hours ||
                  (branch.openingTime && branch.closingTime
                    ? `${branch.openingTime} – ${branch.closingTime}`
                    : '—')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
