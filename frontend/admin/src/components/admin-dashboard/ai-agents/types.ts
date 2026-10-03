export type AgentStatus = 'running' | 'paused' | 'idle';

export interface AgentActivityLog {
  id: string;
  timestamp: string;
  action: string;
  impactScore?: string;
  type: 'info' | 'success' | 'warning';
}

export interface AIAgentItem {
  id: string;
  name: string;
  status: AgentStatus;
  description: string;
  actionsToday: number;
  lastAction: string;
  impact: string;
  themeColor: 'green' | 'amber' | 'indigo' | 'pink' | 'violet' | 'cyan';
  iconType: 'revenue' | 'inventory' | 'customer' | 'reputation' | 'labor' | 'menu';
  autonomyLevel: 'Full Auto' | 'Approval Required' | 'Supervised';
  accuracyRate: string;
  logs: AgentActivityLog[];
}

export interface AIAgentsKPIs {
  totalAgents: number;
  runningCount: number;
  pausedCount: number;
  idleCount: number;
  totalActionsToday: number;
}
