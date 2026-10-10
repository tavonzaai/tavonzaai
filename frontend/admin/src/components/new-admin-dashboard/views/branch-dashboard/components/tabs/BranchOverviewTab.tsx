import React from 'react';
import { BranchItem } from '../../../../types';
import { StaffMember } from '../types';

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
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Row of 4 Metric Cards matching Figma snippet */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Today's Revenue */}
        <div className="p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-300/20 flex flex-col justify-start items-start gap-3.5 shadow-xl">
          <div className="self-stretch inline-flex justify-between items-center">
            <span className="text-white text-lg font-semibold font-['Inter']">
              Today’s Revenue
            </span>
          </div>
          <div className="self-stretch h-0 outline outline-1 outline-offset-[-0.50px] outline-neutral-800" />
          <div className="self-stretch flex flex-col justify-start items-start gap-3">
            <span className="text-white text-2xl font-medium font-['Inter'] leading-7">
              ৳ 184,260
            </span>
            <span className="text-green-500 text-sm font-normal font-['Poppins'] leading-4">
              ↑ 8.4% from yesterday
            </span>
          </div>
        </div>

        {/* Card 2: Orders */}
        <div className="p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-300/20 flex flex-col justify-start items-start gap-3.5 shadow-xl">
          <div className="self-stretch inline-flex justify-between items-center">
            <span className="text-white text-lg font-semibold font-['Inter']">
              Orders
            </span>
          </div>
          <div className="self-stretch h-0 outline outline-1 outline-offset-[-0.50px] outline-neutral-800" />
          <div className="self-stretch flex flex-col justify-start items-start gap-3">
            <span className="text-white text-2xl font-medium font-['Inter'] leading-7">
              146
            </span>
            <span className="text-green-500 text-sm font-normal font-['Inter'] leading-4">
              12 currently open
            </span>
          </div>
        </div>

        {/* Card 3: Tables */}
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

        {/* Card 4: Staff on duty */}
        <div className="p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-300/20 flex flex-col justify-start items-start gap-3.5 shadow-xl">
          <div className="self-stretch inline-flex justify-between items-center">
            <span className="text-white text-lg font-semibold font-['Inter']">
              Staff on duty
            </span>
          </div>
          <div className="self-stretch h-0 outline outline-1 outline-offset-[-0.50px] outline-neutral-800" />
          <div className="self-stretch flex flex-col justify-start items-start gap-3">
            <span className="text-white text-2xl font-medium font-['Inter'] leading-7">
              {staffList.filter((s) => s.status === 'Active').length}
            </span>
            <span className="text-green-500 text-sm font-normal font-['Inter'] leading-4">
              4 shifts starting soon
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Two-Column Section matching Figma snippet */}
      <div className="flex flex-col lg:flex-row items-stretch gap-5">
        {/* Column 1 (Left): Today’s Operations */}
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
                8 orders preparing
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
                3 pending settlements
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
                All shifts covered
              </span>
            </div>
          </div>
        </div>

        {/* Column 2 (Right): Branch Information */}
        <div className="w-full lg:w-[460px] p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-800 flex flex-col justify-start items-center gap-4 shadow-xl">
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
                {branch.manager}
              </span>
            </div>

            {/* Phone */}
            <div className="self-stretch flex justify-between items-center">
              <span className="text-neutral-500 text-base font-medium font-['Poppins'] leading-5">
                Phone
              </span>
              <span className="text-white text-base font-medium font-['Inter'] leading-5">
                {branch.contactNumber || '992548756'}
              </span>
            </div>

            {/* Address */}
            <div className="self-stretch flex justify-between items-center">
              <span className="text-neutral-500 text-base font-medium font-['Poppins'] leading-5">
                Address
              </span>
              <span className="text-white text-base font-medium font-['Inter'] leading-5">
                {branch.location}
              </span>
            </div>

            {/* Operating hours */}
            <div className="self-stretch flex justify-between items-center">
              <span className="text-neutral-500 text-base font-medium font-['Poppins'] leading-5">
                Operating hours
              </span>
              <span className="text-white text-base font-medium font-['Inter'] leading-5">
                {branch.hours || `${branch.openingTime || '09:00'} – ${branch.closingTime || '23:00'}`}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
