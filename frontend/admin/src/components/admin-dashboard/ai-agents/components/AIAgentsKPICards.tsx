'use client';

import React from 'react';
import { AIAgentsKPIs } from '../types';

interface AIAgentsKPICardsProps {
  kpis: AIAgentsKPIs;
}

export default function AIAgentsKPICards({ kpis }: AIAgentsKPICardsProps) {
  const cards = [
    {
      id: 'total',
      label: 'Total Agents',
      value: kpis.totalAgents.toString().padStart(2, '0'),
      color: 'text-white',
    },
    {
      id: 'running',
      label: 'Active & Running',
      value: kpis.runningCount.toString().padStart(2, '0'),
      color: 'text-emerald-400',
    },
    {
      id: 'paused',
      label: 'Paused',
      value: kpis.pausedCount.toString().padStart(2, '0'),
      color: 'text-amber-400',
    },
    {
      id: 'idle',
      label: 'Idle',
      value: kpis.idleCount.toString().padStart(2, '0'),
      color: 'text-slate-400',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
      {cards.map((card) => (
        <div
          key={card.id}
          className="h-20 bg-neutral-900 rounded-[10px] shadow-[0px_0px_2px_0px_rgba(255,185,0,1.00)] outline outline-1 outline-black/5 px-5 flex flex-col justify-center transition-all duration-200 hover:scale-[1.01]"
        >
          <span className={`text-2xl font-bold font-['Inter'] leading-5 ${card.color}`}>
            {card.value}
          </span>
          <span className="text-zinc-400 text-sm font-semibold font-['Inter'] leading-5 mt-1 truncate">
            {card.label}
          </span>
        </div>
      ))}
    </div>
  );
}
