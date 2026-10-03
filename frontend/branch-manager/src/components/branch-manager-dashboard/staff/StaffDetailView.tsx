'use client';

import React, { useState } from 'react';
import { ArrowLeft, User, ChevronDown, Sliders, Activity, Check } from 'lucide-react';

interface StaffDetailViewProps {
  staffId?: string;
  onBack: () => void;
  onUpdateShift?: (info: string) => void;
}

export default function StaffDetailView({
  staffId = 'sarah-miller',
  onBack,
  onUpdateShift,
}: StaffDetailViewProps) {
  const [status, setStatus] = useState<'Active' | 'Break' | 'Off Duty'>('Active');
  const [section, setSection] = useState('Floor Section A');
  const [tables, setTables] = useState('Tables 01, 04, 12');
  const [shiftSchedule, setShiftSchedule] = useState('Lunch Shift (10:00 AM - 4:00 PM)');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const handleUpdate = () => {
    setUpdateSuccess(true);
    if (onUpdateShift) {
      onUpdateShift(`Updated schedule for Sarah Miller to ${shiftSchedule}`);
    }
    setTimeout(() => setUpdateSuccess(false), 3000);
  };

  return (
    <div className="flex-1 p-6 lg:p-8 space-y-6 max-w-7xl animate-in fade-in duration-200">
      {/* Top Navigation Bar */}
      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-neutral-400 hover:text-white transition group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-neutral-400 group-hover:-translate-x-1 transition" />
          <span className="text-xs font-semibold font-['Poppins'] leading-4">Back to floor</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="text-neutral-500 text-sm md:text-base font-medium font-['Inter'] leading-4">
            Branch Role:
          </span>
          <div className="px-3 py-1.5 bg-yellow-400/10 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 flex items-center">
            <span className="text-white text-sm font-medium font-['Inter']">Waiters</span>
          </div>
        </div>
      </div>

      {/* Staff Profile Card */}
      <div className="p-5 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-800 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 bg-zinc-800 rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-800 flex items-center justify-center shrink-0">
              <User className="w-6 h-6 text-white" />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-white text-lg font-medium font-['Poppins'] leading-5">
                  Sarah Miller
                </span>
                <div className="px-2 py-0.5 bg-green-500/10 rounded-md flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  <span className="text-green-500 text-xs font-normal font-['Inter']">
                    {status}
                  </span>
                </div>
              </div>
              <span className="text-neutral-500 text-xs font-normal font-['Poppins']">
                Waiters · Phone: +1 (555) 234-5678 · Clocked in: 09:55 AM
              </span>
            </div>
          </div>

          <div className="relative flex items-center gap-3">
            <span className="text-neutral-500 text-sm font-semibold font-['Inter']">Status:</span>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                className="px-3 py-2 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 flex items-center gap-2 hover:bg-neutral-800 transition cursor-pointer"
              >
                <span className="text-stone-300 text-sm font-medium font-['Inter']">{status}</span>
                <ChevronDown className="w-4 h-4 text-stone-300" />
              </button>

              {showStatusDropdown && (
                <div className="absolute right-0 mt-1 w-32 bg-neutral-900 border border-neutral-700 rounded-lg shadow-xl z-20 py-1 font-['Inter'] text-xs">
                  {(['Active', 'Break', 'Off Duty'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => {
                        setStatus(st);
                        setShowStatusDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 text-stone-200 hover:bg-neutral-800 hover:text-amber-400 transition"
                    >
                      {st}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="w-full h-px bg-neutral-800" />

        {/* 4 Summary Stats Boxes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3 bg-black/30 rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-800 flex flex-col gap-1.5">
            <span className="text-neutral-500 text-xs font-normal font-['Inter']">
              Current Shift
            </span>
            <span className="text-stone-300 text-sm font-semibold font-['Inter'] truncate">
              {shiftSchedule}
            </span>
          </div>

          <div className="p-3 bg-black/30 rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-800 flex flex-col gap-1.5">
            <span className="text-neutral-500 text-xs font-normal font-['Inter']">
              Current Assignment
            </span>
            <span className="text-blue-400 text-sm font-semibold font-['Inter'] truncate">
              {section}
            </span>
          </div>

          <div className="p-3 bg-black/30 rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-800 flex flex-col gap-1.5">
            <span className="text-neutral-500 text-xs font-normal font-['Inter']">
              Station / Assigned Tables
            </span>
            <span className="text-green-500 text-sm font-semibold font-['Inter'] truncate">
              {tables}
            </span>
          </div>

          <div className="p-3 bg-black/30 rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-800 flex flex-col gap-1.5">
            <span className="text-neutral-500 text-xs font-normal font-['Inter']">
              Orders / Avg Serve Time
            </span>
            <span className="text-stone-300 text-sm font-semibold font-['Inter'] truncate">
              14 Orders (11m)
            </span>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Manager Controls & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        {/* Controls */}
        <div className="p-5 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-800 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-white" />
            <h2 className="text-white text-base font-medium font-['Poppins']">
              Manager Operational Controls
            </h2>
          </div>

          <div className="w-full h-px bg-neutral-800" />

          <div className="flex flex-col gap-2">
            <label className="text-white text-sm font-normal font-['Inter']">
              Reassign Floor Section & Station
            </label>
            <input
              type="text"
              value={section}
              onChange={(e) => setSection(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-neutral-950/60 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 text-stone-300 text-sm font-['Inter'] focus:outline-neutral-700"
              placeholder="e.g. Floor Section A"
            />
            <input
              type="text"
              value={tables}
              onChange={(e) => setTables(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-neutral-950/60 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 text-stone-300 text-sm font-['Inter'] focus:outline-neutral-700"
              placeholder="e.g. Tables 01, 04, 12"
            />
          </div>

          <div className="w-full h-px bg-neutral-800" />

          <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3.5">
            <div className="flex-1 flex flex-col gap-2">
              <label className="text-white text-sm font-normal font-['Inter']">
                Update Shift Schedule
              </label>
              <select
                value={shiftSchedule}
                onChange={(e) => setShiftSchedule(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-neutral-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 text-stone-300 text-sm font-['Inter'] focus:outline-neutral-600 cursor-pointer"
              >
                <option value="Lunch Shift (10:00 AM - 4:00 PM)">Lunch Shift (10:00 AM - 4:00 PM)</option>
                <option value="Morning Shift (8:00 AM - 3:00 PM)">Morning Shift (8:00 AM - 3:00 PM)</option>
                <option value="Dinner Shift (4:00 PM - 11:00 PM)">Dinner Shift (4:00 PM - 11:00 PM)</option>
                <option value="Closing Shift (6:00 PM - 1:00 AM)">Closing Shift (6:00 PM - 1:00 AM)</option>
              </select>
            </div>

            <button
              type="button"
              onClick={handleUpdate}
              className="px-5 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-neutral-900 font-medium font-['Inter'] text-sm rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-700 transition flex items-center justify-center gap-1.5 active:scale-95 shrink-0"
            >
              {updateSuccess ? (
                <>
                  <Check className="w-4 h-4 text-black" />
                  <span>Saved</span>
                </>
              ) : (
                <span>Update</span>
              )}
            </button>
          </div>
        </div>

        {/* Activity */}
        <div className="p-5 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-800 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-white" />
            <h2 className="text-white text-base font-medium font-['Poppins']">
              Recent Operational Activity
            </h2>
          </div>

          <div className="w-full h-px bg-neutral-800" />

          <div className="flex flex-col gap-2.5">
            {[
              'Created Order #1042 for Table 04',
              'Delivered check to Table 12',
              'Assigned Section A by Manager Alex',
              'Clocked in for Lunch Shift',
            ].map((activityText, idx) => (
              <div
                key={idx}
                className="w-full px-3.5 py-3 bg-neutral-950/60 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-800 flex items-center gap-3"
              >
                <div className="px-2 py-1 bg-yellow-500/10 rounded-md flex justify-center items-center shrink-0">
                  <span className="text-yellow-500 text-xs font-medium font-['Inter'] leading-4">
                    12.15 PM
                  </span>
                </div>
                <span className="text-stone-300 text-sm font-normal font-['Inter'] leading-5">
                  {activityText}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
