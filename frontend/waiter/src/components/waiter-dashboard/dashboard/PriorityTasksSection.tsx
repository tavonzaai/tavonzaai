'use client';

import React, { useState } from 'react';
import { ChevronRight, Check } from 'lucide-react';
import { PriorityTask } from '../types';

export interface PriorityTasksSectionProps {
  tasks: PriorityTask[];
  onViewAll?: () => void;
  onTaskClick?: (task: PriorityTask) => void;
}

export default function PriorityTasksSection({
  tasks: initialTasks,
  onViewAll,
  onTaskClick,
}: PriorityTasksSectionProps) {
  const [tasks, setTasks] = useState<PriorityTask[]>(initialTasks);

  const toggleTask = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  };

  return (
    <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5 backdrop-blur-xl shadow-xl flex flex-col justify-between h-full">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div>
            <h3 className="text-white text-lg font-semibold font-['Inter'] leading-tight">
              My Priority Tasks
            </h3>
            <p className="text-zinc-400 text-sm font-normal font-['Inter'] mt-0.5">
              Immediate Actions
            </p>
          </div>

          <button
            type="button"
            onClick={onViewAll}
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-white text-sm font-semibold rounded-xl inline-flex items-center gap-1 transition-colors cursor-pointer shadow-sm shadow-amber-500/20"
          >
            <span>View All</span>
            <ChevronRight className="w-3 h-3 text-white" />
          </button>
        </div>

        {/* Tasks List */}
        <div className="space-y-2.5 mt-4">
          {tasks.map((task) => (
            <div
              key={task.id}
              onClick={() => onTaskClick?.(task)}
              className={`p-3 bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 rounded-xl flex items-center justify-between gap-3 transition-all cursor-pointer ${
                task.completed ? 'opacity-50 line-through' : ''
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className={`w-2 h-2 rounded-full ${task.dotColor} flex-shrink-0`} />
                <span className="text-white text-sm font-normal font-['Inter'] truncate">
                  {task.title}
                </span>
              </div>

              {/* <button
                type="button"
                onClick={(e) => toggleTask(task.id, e)}
                className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors cursor-pointer ${
                  task.completed
                    ? 'bg-amber-500 border-amber-500 text-white'
                    : 'border-zinc-700 hover:border-amber-400 text-transparent'
                }`}
              >
                <Check className="w-3 h-3 stroke-[3]" />
              </button> */}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 pt-2 text-xs text-zinc-400 text-right">
        {tasks.filter((t) => !t.completed).length} pending actions
      </div>
    </div>
  );
}
