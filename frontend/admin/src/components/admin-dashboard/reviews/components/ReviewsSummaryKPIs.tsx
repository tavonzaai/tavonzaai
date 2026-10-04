'use client';

import React from 'react';
import { ReviewsSummaryData } from '../types';

interface ReviewsSummaryKPIsProps {
  summary: ReviewsSummaryData;
}

export default function ReviewsSummaryKPIs({ summary }: ReviewsSummaryKPIsProps) {
  return (
    <div className="w-full   p-6 rounded-2xl  shadow-xl">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-center">
        {/* 1. Total Reviews Block */}
        <div className="flex flex-col justify-start space-y-1.5">
          <div className="text-stone-300 text-base font-medium font-['Inter'] leading-5">
            Total Reviews
          </div>
          <div className="flex items-center gap-3.5 pt-1">
            <span className="text-white text-5xl font-bold font-['Inter'] leading-10 tracking-tight">
              {summary.totalReviews}
            </span>
            <div className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center">
              <span className="text-emerald-400 text-sm font-semibold font-['Inter'] leading-4">
                +{summary.growthPercentage}
              </span>
            </div>
          </div>
          <div className="text-gray-400 text-sm font-normal font-['Inter'] leading-4 pt-1">
            Growth in reviews on this year
          </div>
        </div>

        {/* 2. Average Rating Block */}
        <div className="flex flex-col justify-start space-y-1.5">
          <div className="text-stone-300 text-base font-medium font-['Inter'] leading-5">
            Average Rating
          </div>
          <div className="flex items-center gap-3 pt-1">
            <span className="text-white text-5xl font-bold font-['Inter'] leading-10 tracking-tight">
              {summary.averageRating}
            </span>
          </div>
          <div className="text-gray-400 text-sm font-normal font-['Inter'] leading-4 pt-1">
            Average rating on this year
          </div>
        </div>

        {/* 3. Replied & Pending Reply Counts */}
        <div className="flex flex-col gap-3  items-center justify-around py-2 px-4  rounded-xl ">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="text-emerald-500 text-4xl font-bold font-['Inter'] leading-8">
              {summary.repliedCount}
            </div>
            <div className="text-gray-400 text-sm font-normal font-['Inter'] leading-4 mt-1">
              Replied
            </div>
          </div>
           
          <div className="flex flex-col items-center justify-center text-center">
            <div className="text-yellow-500 text-4xl font-bold font-['Inter'] leading-8">
              {summary.pendingCount}
            </div>
            <div className="text-gray-400 text-sm font-normal font-['Inter'] leading-4 mt-1">
              Pending Reply
            </div>
          </div>
        </div>

        {/* 4. Rating Distribution Progress Bars (5★ to 1★) */}
        <div className="flex flex-col justify-center space-y-2 w-full">
          {summary.distribution.map((d) => (
            <div key={d.stars} className="flex items-center gap-3.5 w-full">
              <span className="text-white text-sm font-normal font-['Inter'] w-3 text-center">
                {d.stars}
              </span>
              <div className="flex-1 h-1.5 bg-neutral-800 rounded-[3px] overflow-hidden relative">
                <div
                  className={`h-full rounded-[3px] transition-all duration-500 ${d.colorClass}`}
                  style={{ width: `${d.percentage}%` }}
                />
              </div>
              <span className="text-neutral-200 text-sm font-normal font-['Inter'] w-8 text-right">
                {d.countStr}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
