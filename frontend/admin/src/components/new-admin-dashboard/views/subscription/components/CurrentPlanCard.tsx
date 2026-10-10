import React from 'react';
import { PlanDefinition } from '../types';

interface CurrentPlanCardProps {
  currentPlan: PlanDefinition;
}

export const CurrentPlanCard: React.FC<CurrentPlanCardProps> = ({ currentPlan }) => {
  return (
    <div className="p-5 bg-neutral-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-800 flex flex-col justify-start items-start gap-4">
      <div className="w-full pb-2 flex flex-col justify-start items-start gap-1">
        <div className="text-zinc-500 text-sm font-medium font-sans leading-4 tracking-wide">
          Current plan
        </div>
        <div className="text-zinc-100 text-2xl font-normal font-sans leading-7">
          {currentPlan.name} Plan
        </div>
        <div className="flex items-baseline gap-1 mt-0.5">
          <span className="text-gray-200 text-xl font-bold font-sans leading-7">
            ${currentPlan.price}
          </span>
          <span className="text-zinc-500 text-xs font-medium font-sans leading-4">
            /month
          </span>
        </div>
      </div>

      <div className="w-full h-0 outline outline-1 outline-offset-[-0.50px] outline-neutral-800" />

      {/* Billing details grid: Billing cycle, Started on, Next renewal */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-neutral-800 pt-1">
        <div className="py-2 sm:py-0 sm:px-4 first:pl-0 flex flex-col gap-1">
          <span className="text-zinc-500 text-sm font-medium font-sans tracking-wide">
            Billing cycle
          </span>
          <span className="text-zinc-100 text-base font-normal font-sans">
            Monthly
          </span>
        </div>

        <div className="py-2 sm:py-0 sm:px-4 flex flex-col gap-1">
          <span className="text-zinc-500 text-sm font-medium font-sans tracking-wide">
            Started on
          </span>
          <span className="text-zinc-100 text-base font-normal font-sans">
            15 Jan 2026
          </span>
        </div>

        <div className="py-2 sm:py-0 sm:px-4 flex flex-col gap-1">
          <span className="text-zinc-500 text-sm font-medium font-sans tracking-wide">
            Next renewal
          </span>
          <span className="text-zinc-100 text-base font-normal font-sans">
            15 Nov 2026
          </span>
        </div>
      </div>
    </div>
  );
};
