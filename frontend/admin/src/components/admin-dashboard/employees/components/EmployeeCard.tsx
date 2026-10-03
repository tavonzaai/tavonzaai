'use client';

import React from 'react';
import { Clock, Phone, Mail, Star, Edit3, Trash2 } from 'lucide-react';
import { Employee } from '../types';

export interface EmployeeCardProps {
  employee: Employee;
  onEdit: (emp: Employee) => void;
  onDelete: (empId: string) => void;
}

export default function EmployeeCard({
  employee,
  onEdit,
  onDelete,
}: EmployeeCardProps) {
  const getRoleBadge = (role: Employee['role']) => {
    switch (role) {
      case 'Head Waiter':
      case 'Waiter':
        return 'bg-yellow-500/10 text-orange-500 border-yellow-500/20';
      case 'Head Chef':
      case 'Chef':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'Bartender':
      case 'Barista':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Hostess':
      case 'Host':
        return 'bg-pink-500/10 text-pink-400 border-pink-500/20';
      case 'Manager':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default:
        return 'bg-zinc-800 text-zinc-300 border-zinc-700';
    }
  };

  const isOnDuty =
    employee.status === 'On Shift' || employee.status === 'On Duty';

  const isAccuracyGood = employee.accuracy >= 90;

  return (
    <div className="w-full p-4 bg-white/5 hover:bg-white/[0.07] rounded-xl border border-white/10 hover:border-white/20 backdrop-blur-[10.20px] flex flex-col justify-between transition-all duration-200 shadow-lg group space-y-4">
      {/* Top Profile Header */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          {/* Avatar + Status Indicator */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={employee.avatar}
                alt={employee.name}
                className="size-12 rounded-2xl object-cover border border-white/10"
              />
              <span
                className={`size-3.5 absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-neutral-900 ${
                  isOnDuty ? 'bg-emerald-500' : 'bg-zinc-500'
                }`}
              />
            </div>

            {/* Name + Role */}
            <div>
              <h4 className="text-neutral-50 text-base font-bold font-['Inter'] leading-5">
                {employee.name}
              </h4>
              <div className="mt-1">
                <span
                  className={`text-xs font-semibold font-['Inter'] px-2 py-0.5 rounded-md border ${getRoleBadge(
                    employee.role
                  )}`}
                >
                  {employee.role}
                </span>
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <div
            className={`px-2 py-0.5 rounded-md text-xs font-semibold font-['Inter'] ${
              isOnDuty
                ? 'bg-green-500/10 text-green-400'
                : 'bg-zinc-800 text-neutral-400'
            }`}
          >
            {isOnDuty ? '● ' + employee.status : employee.status}
          </div>
        </div>

        {/* Shift Hours */}
        <div className="flex items-center gap-1.5 text-neutral-400 text-sm font-['Inter'] pt-1">
          <Clock className="w-3.5 h-3.5 text-neutral-400" />
          <span>{employee.shiftHours}</span>
        </div>

        {/* Performance Metrics */}
        <div className="space-y-2 pt-2 border-t border-white/5 text-sm font-['Inter']">
          {/* Rating */}
          <div className="flex items-center justify-between">
            <span className="text-zinc-400 text-sm">Rating</span>
            <div className="flex items-center gap-1 text-amber-500 font-semibold">
              <Star className="w-3 h-3 fill-amber-500" />
              <span>{employee.rating.toFixed(1)}</span>
            </div>
          </div>

          {/* Tables Today */}
          <div className="flex items-center justify-between">
            <span className="text-zinc-400 text-sm">Tables Today</span>
            <span className="text-white font-semibold">{employee.tablesToday}</span>
          </div>

          {/* Accuracy */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400 text-sm">Accuracy</span>
              <span
                className={`font-semibold ${
                  isAccuracyGood ? 'text-green-400' : 'text-yellow-500'
                }`}
              >
                {employee.accuracy}%
              </span>
            </div>
            {/* Accuracy Progress Bar */}
            <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isAccuracyGood ? 'bg-green-500' : 'bg-yellow-500'
                }`}
                style={{ width: `${employee.accuracy}%` }}
              />
            </div>
          </div>
        </div>

        {/* Contact Information & Bio */}
        <div className="space-y-1.5 pt-2 border-t border-white/5 text-sm text-neutral-400 font-['Inter']">
          <div className="flex items-center gap-2 truncate">
            <Phone className="w-3 h-3 text-neutral-400 shrink-0" />
            <span className="truncate">{employee.phone}</span>
          </div>
          <div className="flex items-center gap-2 truncate">
            <Mail className="w-3 h-3 text-neutral-400 shrink-0" />
            <span className="truncate">{employee.email}</span>
          </div>
          <p className="text-xs text-neutral-400 line-clamp-1 pt-1 italic">
            {employee.bio}
          </p>
        </div>
      </div>

      {/* Footer Action Buttons with Yellow Hover Effect & Delete Button */}
      <div className="pt-3 border-t border-white/5 flex items-center gap-2">
        <button
          type="button"
          onClick={() => onEdit(employee)}
          className="flex-1 h-9 py-2 bg-white/5 hover:bg-yellow-500 text-white hover:text-white border border-white/10 hover:border-yellow-500 rounded-[10px] text-sm font-semibold flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer group/btn"
        >
          <Edit3 className="w-3.5 h-3.5 transition-transform group-hover/btn:scale-110" />
          <span>Edit</span>
        </button>

        {/* Delete Button */}
        <button
          type="button"
          onClick={() => onDelete(employee.id)}
          className="size-9 rounded-[10px] border border-white/10 hover:border-red-500/40 bg-white/5 hover:bg-red-500/15 flex items-center justify-center text-zinc-400 hover:text-red-400 transition-all duration-200 cursor-pointer group/del"
          title="Delete Employee"
        >
          <Trash2 className="w-4 h-4 transition-transform group-hover/del:scale-110" />
        </button>
      </div>
    </div>
  );
}
