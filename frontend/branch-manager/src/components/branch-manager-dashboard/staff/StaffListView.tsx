'use client';

import React, { useState } from 'react';
import { ArrowRight, User } from 'lucide-react';
import { StaffCardData } from '../types';
import { INITIAL_STAFF } from '../data';

interface StaffListViewProps {
  onSelectStaff: (staffId: string) => void;
}

export default function StaffListView({ onSelectStaff }: StaffListViewProps) {
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  const filterTabs = ['ALL', 'Waiters', 'Kitchen', 'Bartenders', 'Cashiers', 'Assistant Manager'];

  const filteredStaff = INITIAL_STAFF.filter((staff) => {
    if (roleFilter === 'ALL') return true;
    return staff.role === roleFilter;
  });

  const getStatusBadge = (status: StaffCardData['status']) => {
    if (status === 'Active') {
      return (
        <div className="px-2.5 py-1.5 bg-green-500/10 rounded-md flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
          <span className="text-green-500 text-xs font-medium font-['Inter'] leading-4">Active</span>
        </div>
      );
    }
    if (status === 'Break') {
      return (
        <div className="px-2.5 py-1.5 bg-yellow-400/10 rounded-md flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full" />
          <span className="text-yellow-400 text-xs font-medium font-['Inter'] leading-4">Break</span>
        </div>
      );
    }
    return (
      <div className="px-2.5 py-1.5 bg-red-400/10 rounded-md flex items-center gap-1.5">
        <div className="w-1.5 h-1.5 bg-red-400 rounded-full" />
        <span className="text-red-400 text-xs font-medium font-['Inter'] leading-4">Late</span>
      </div>
    );
  };

  return (
    <div className="flex-1 p-6 lg:p-8 space-y-6 max-w-7xl animate-in fade-in duration-200">
      {/* Role Filter Chips */}
      <div className="flex flex-wrap items-center gap-2">
        {filterTabs.map((tab) => {
          const isActive = roleFilter === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setRoleFilter(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium font-['Poppins'] transition outline outline-1 outline-offset-[-1px] ${
                isActive
                  ? 'bg-yellow-400 text-neutral-900 outline-neutral-700 shadow-sm'
                  : 'bg-transparent text-white outline-neutral-700 hover:bg-neutral-800/60'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Staff Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredStaff.map((staff) => (
          <div
            key={staff.id}
            onClick={() => onSelectStaff(staff.id)}
            className="p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-800 flex flex-col justify-start items-start gap-3.5 hover:outline-neutral-700 hover:shadow-lg transition cursor-pointer group"
          >
            {/* Header */}
            <div className="w-full flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 p-2 bg-zinc-800 rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-800 flex justify-center items-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-white text-base font-medium font-['Poppins'] leading-5 group-hover:text-amber-400 transition">
                    {staff.name}
                  </span>
                  <span className="text-neutral-400 text-xs font-normal font-['Poppins'] leading-4">
                    {staff.role}
                  </span>
                </div>
              </div>

              {getStatusBadge(staff.status)}
            </div>

            <div className="w-full h-px bg-neutral-800" />

            {/* Details */}
            <div className="w-full flex flex-col gap-2.5 font-['Inter']">
              <div className="flex justify-between items-center">
                <span className="text-neutral-400 text-xs font-normal">Current Shift</span>
                <span className="text-white text-sm font-normal truncate max-w-[210px] text-right">
                  {staff.currentShift}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-neutral-400 text-xs font-normal">Current Assignment</span>
                <span className="text-white text-sm font-normal truncate max-w-[210px] text-right">
                  {staff.currentAssignment}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-neutral-400 text-xs font-normal">Station / Tables</span>
                <span className="text-white text-sm font-normal truncate max-w-[210px] text-right">
                  {staff.stationTables}
                </span>
              </div>
            </div>

            <div className="w-full h-px bg-neutral-800" />

            {/* Footer */}
            <div className="w-full flex justify-between items-center">
              <span className="text-neutral-400 text-sm font-normal font-['Inter']">
                Clock-in: {staff.clockInTime}
              </span>
              <div className="flex items-center gap-1 text-amber-500 group-hover:text-amber-400">
                <span className="text-sm font-medium font-['Poppins'] leading-9">
                  View Details
                </span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
