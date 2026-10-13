'use client';

import React from 'react';
import { Inbox, AlertCircle, RefreshCw } from 'lucide-react';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-zinc-850 bg-zinc-900/30 ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-zinc-800/60 border border-zinc-700/50 flex items-center justify-center text-zinc-400 mb-4 shadow-inner">
        {icon || <Inbox className="w-7 h-7 text-zinc-500" />}
      </div>
      <h3 className="text-base font-semibold text-zinc-200 tracking-tight">{title}</h3>
      {description && (
        <p className="mt-1 text-xs text-zinc-500 max-w-sm leading-relaxed">{description}</p>
      )}
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-xs transition-colors shadow-md"
        >
          {action.icon}
          <span>{action.label}</span>
        </button>
      )}
    </div>
  );
}

export interface LoadingStateProps {
  message?: string;
  className?: string;
}

export function LoadingState({
  message = 'Loading data...',
  className = 'py-16',
}: LoadingStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center text-center ${className}`}>
      <div className="w-9 h-9 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mb-3" />
      <p className="text-xs font-medium text-zinc-400 tracking-wide">{message}</p>
    </div>
  );
}

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  className = '',
}: ErrorStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-red-500/20 bg-red-950/10 text-red-400 ${className}`}
    >
      <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-3">
        <AlertCircle className="w-6 h-6 text-red-400" />
      </div>
      <h4 className="text-sm font-semibold text-red-200">{title}</h4>
      <p className="mt-1 text-xs text-red-300/80 max-w-md">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-200 text-xs font-medium border border-red-500/40 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Try Again</span>
        </button>
      )}
    </div>
  );
}
