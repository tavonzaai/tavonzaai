'use client';

import React, { useState, useMemo } from 'react';
import {
  AIAgentsHeader,
  AIAgentsKPICards,
  AIAgentsGrid,
  AIAgentDetailsModal,
} from './components';
import { INITIAL_AI_AGENTS } from './aiAgentsData';
import { AIAgentItem, AIAgentsKPIs } from './types';
import { CheckCircle, X } from 'lucide-react';

export default function AIAgentsView() {
  const [agents, setAgents] = useState<AIAgentItem[]>(INITIAL_AI_AGENTS);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<AIAgentItem | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Dynamic KPIs Computation
  const kpis = useMemo<AIAgentsKPIs>(() => {
    const running = agents.filter((a) => a.status === 'running').length;
    const paused = agents.filter((a) => a.status === 'paused').length;
    const idle = agents.filter((a) => a.status === 'idle').length;
    const totalActions = agents.reduce((acc, a) => acc + a.actionsToday, 0);

    return {
      totalAgents: agents.length,
      runningCount: running,
      pausedCount: paused,
      idleCount: idle,
      totalActionsToday: totalActions,
    };
  }, [agents]);

  // Handlers
  const handleToggleStatus = (targetAgent: AIAgentItem) => {
    const nextStatus = targetAgent.status === 'running' ? 'paused' : 'running';
    setAgents((prev) =>
      prev.map((a) => (a.id === targetAgent.id ? { ...a, status: nextStatus } : a))
    );

    if (selectedAgent && selectedAgent.id === targetAgent.id) {
      setSelectedAgent((prev) => (prev ? { ...prev, status: nextStatus } : null));
    }

    showToast(
      nextStatus === 'running'
        ? `AI Agent "${targetAgent.name}" resumed and active.`
        : `AI Agent "${targetAgent.name}" paused.`
    );
  };

  const handleRefreshAnalysis = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setAgents((prev) =>
        prev.map((a) =>
          a.status === 'running'
            ? { ...a, actionsToday: a.actionsToday + Math.floor(Math.random() * 3) + 1, lastAction: 'Just now' }
            : a
        )
      );
      showToast('Live operations analysis refreshed across all autonomous agents.');
    }, 1000);
  };

  const handleTriggerInstantRun = (agentId: string) => {
    const agent = agents.find((a) => a.id === agentId);
    if (!agent) return;

    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: 'Just now',
      action: `Executed instant autonomous optimization for ${agent.name}`,
      type: 'success' as const,
    };

    const updatedAgent: AIAgentItem = {
      ...agent,
      status: 'running',
      actionsToday: agent.actionsToday + 1,
      lastAction: 'Just now',
      logs: [newLog, ...agent.logs],
    };

    setAgents((prev) => prev.map((a) => (a.id === agentId ? updatedAgent : a)));
    setSelectedAgent(updatedAgent);
    showToast(`Instant run executed for "${agent.name}"!`);
  };

  const handleOpenDetails = (agent: AIAgentItem) => {
    setSelectedAgent(agent);
    setIsDetailsOpen(true);
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200 pb-16 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 px-4 py-3 bg-[#18191c] border border-amber-500/50 rounded-xl shadow-2xl text-white text-sm flex items-center justify-between gap-3 animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-2.5">
            <CheckCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 1. Header (Title, Subtitle, Refresh Analysis Button) */}
      <AIAgentsHeader
        onRefresh={handleRefreshAnalysis}
        isRefreshing={isRefreshing}
      />

      {/* 2. Top 4 KPI Cards with Gold Border Glow */}
      <AIAgentsKPICards kpis={kpis} />

      {/* 3. 6 AI Agents Grid */}
      <AIAgentsGrid
        agents={agents}
        onToggleStatus={handleToggleStatus}
        onOpenDetails={handleOpenDetails}
      />

      {/* 4. AIAgent Details Modal with Activity Stream */}
      <AIAgentDetailsModal
        agent={selectedAgent}
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedAgent(null);
        }}
        onToggleStatus={handleToggleStatus}
        onTriggerInstantRun={handleTriggerInstantRun}
      />
    </div>
  );
}
