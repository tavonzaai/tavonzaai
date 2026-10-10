import React from 'react';
import { PlanDefinition } from '../types';

interface WorkspaceCapacityProps {
  currentPlan: PlanDefinition;
  restaurantsUsed?: number;
  branchesUsed?: number;
  staffUsed?: number;
}

export const WorkspaceCapacity: React.FC<WorkspaceCapacityProps> = ({
  currentPlan,
  restaurantsUsed = 2,
  branchesUsed = 6,
  staffUsed = 24,
}) => {
  const restaurantsAvail =
    typeof currentPlan.restaurantsLimit === 'number'
      ? currentPlan.restaurantsLimit - restaurantsUsed
      : 'Unlimited';

  const branchesAvail =
    typeof currentPlan.branchesLimit === 'number'
      ? currentPlan.branchesLimit - branchesUsed
      : 'Unlimited';

  const staffAvail =
    typeof currentPlan.staffLimit === 'number'
      ? currentPlan.staffLimit - staffUsed
      : 'Unlimited';

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-zinc-100 text-xl font-normal font-sans leading-6">
          Your workspace capacity
        </h2>
        <p className="text-neutral-400 text-sm font-normal font-sans leading-4">
          Usage updates in real time across your organization.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Restaurants */}
        <div className="p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-800 flex flex-col justify-start items-start gap-2.5">
          <div className="w-full flex justify-between items-start">
            <span className="text-zinc-100 text-base font-normal font-sans leading-5 tracking-tight">
              Restaurants
            </span>
            <div className="flex items-center">
              <span className="text-neutral-50 text-sm font-medium font-sans leading-4">
                {restaurantsUsed}{' '}
              </span>
              <span className="text-zinc-500 text-sm font-medium font-sans leading-4">
                / {currentPlan.restaurantsLimit}
              </span>
            </div>
          </div>

          {/* Capacity Progress Bar */}
          <div className="w-full h-1.5 bg-neutral-700/60 rounded-[999px] overflow-hidden relative">
            <div
              className="h-full bg-yellow-500 rounded-[999px] transition-all duration-500"
              style={{
                width: `${
                  typeof currentPlan.restaurantsLimit === 'number'
                    ? (restaurantsUsed / currentPlan.restaurantsLimit) * 100
                    : 25
                }%`,
              }}
            />
          </div>

          <div className="text-zinc-500 text-sm font-medium font-sans leading-4">
            {restaurantsAvail} available
          </div>
        </div>

        {/* Card 2: Branches */}
        <div className="p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-800 flex flex-col justify-start items-start gap-2.5">
          <div className="w-full flex justify-between items-start">
            <span className="text-zinc-100 text-base font-normal font-sans leading-5 tracking-tight">
              Branches
            </span>
            <div className="flex items-center">
              <span className="text-neutral-50 text-sm font-medium font-sans leading-4">
                {branchesUsed}{' '}
              </span>
              <span className="text-zinc-500 text-sm font-medium font-sans leading-4">
                / {currentPlan.branchesLimit}
              </span>
            </div>
          </div>

          {/* Capacity Progress Bar */}
          <div className="w-full h-1.5 bg-neutral-700/60 rounded-[999px] overflow-hidden relative">
            <div
              className="h-full bg-yellow-500 rounded-[999px] transition-all duration-500"
              style={{
                width: `${
                  typeof currentPlan.branchesLimit === 'number'
                    ? (branchesUsed / currentPlan.branchesLimit) * 100
                    : 30
                }%`,
              }}
            />
          </div>

          <div className="text-zinc-500 text-sm font-medium font-sans leading-4">
            {branchesAvail} available
          </div>
        </div>

        {/* Card 3: Staff members */}
        <div className="p-4 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-800 flex flex-col justify-start items-start gap-2.5">
          <div className="w-full flex justify-between items-start">
            <span className="text-zinc-100 text-base font-normal font-sans leading-5 tracking-tight">
              Staff members
            </span>
            <div className="flex items-center">
              <span className="text-neutral-50 text-sm font-medium font-sans leading-4">
                {staffUsed}{' '}
              </span>
              <span className="text-zinc-500 text-sm font-medium font-sans leading-4">
                / {currentPlan.staffLimit}
              </span>
            </div>
          </div>

          {/* Capacity Progress Bar */}
          <div className="w-full h-1.5 bg-neutral-700/60 rounded-[999px] overflow-hidden relative">
            <div
              className="h-full bg-yellow-500 rounded-[999px] transition-all duration-500"
              style={{
                width: `${
                  typeof currentPlan.staffLimit === 'number'
                    ? (staffUsed / currentPlan.staffLimit) * 100
                    : 48
                }%`,
              }}
            />
          </div>

          <div className="text-zinc-500 text-sm font-medium font-sans leading-4">
            {staffAvail} available
          </div>
        </div>
      </div>
    </div>
  );
};
