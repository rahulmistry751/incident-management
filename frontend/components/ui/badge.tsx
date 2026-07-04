import React from 'react';
import { IncidentStatus, IncidentSeverity } from '@/types/incident';

export interface StatusStyle {
  pill: string;
  badge: string;
  dot: string;
  text: string;
}

export interface SeverityStyle {
  badge: string;
  text: string;
  colorCode: string;
  color: string; // for compatibility
  dotColor: string;
  activeClass: string;
  inactiveClass: string;
  confidence: number;
}

export const getStatusStyles = (status: IncidentStatus): StatusStyle => {
  switch (status) {
    case 'OPEN':
      return {
        pill: 'bg-transparent text-red-700 border-red-200 dark:bg-transparent dark:text-red-400 dark:border-red-900/40',
        badge: 'bg-transparent text-red-700 border-red-200 dark:bg-transparent dark:text-red-400 dark:border-red-900/40',
        dot: 'bg-red-600',
        text: 'Open'
      };
    case 'IN_PROGRESS':
      return {
        pill: 'bg-transparent text-blue-700 border-blue-200 dark:bg-transparent dark:text-blue-400 dark:border-blue-800/50',
        badge: 'bg-transparent text-blue-700 border-blue-200 dark:bg-transparent dark:text-blue-400 dark:border-blue-800/50',
        dot: 'bg-blue-600 pulsing-dot',
        text: 'In Progress'
      };
    case 'RESOLVED':
      return {
        pill: 'bg-transparent text-green-700 border-green-200 dark:bg-transparent dark:text-green-400 dark:border-green-800/50',
        badge: 'bg-transparent text-green-700 border-green-200 dark:bg-transparent dark:text-green-400 dark:border-green-800/50',
        dot: 'bg-green-600',
        text: 'Resolved'
      };
  }
};

export const getSeverityStyles = (sev: IncidentSeverity): SeverityStyle => {
  switch (sev) {
    case 'CRITICAL':
      return {
        badge: 'bg-transparent text-red-800 border-red-200 dark:bg-transparent dark:text-red-400 dark:border-red-900/40',
        text: 'Critical',
        colorCode: '#e02424',
        color: '#e02424',
        dotColor: 'bg-red-500',
        activeClass: 'bg-transparent text-red-700 border-red-300 focus-visible:ring-red-500/20',
        inactiveClass: 'bg-white text-zinc-500 border-zinc-200 hover:bg-zinc-50',
        confidence: 96
      };
    case 'HIGH':
      return {
        badge: 'bg-transparent text-orange-800 border-orange-200 dark:bg-transparent dark:text-orange-400 dark:border-orange-900/40',
        text: 'High',
        colorCode: '#ff5a1f',
        color: '#ff5a1f',
        dotColor: 'bg-orange-500',
        activeClass: 'bg-transparent text-orange-700 border-orange-300 focus-visible:ring-orange-500/20',
        inactiveClass: 'bg-white text-zinc-500 border-zinc-200 hover:bg-zinc-50',
        confidence: 88
      };
    case 'MEDIUM':
      return {
        badge: 'bg-transparent text-yellow-800 border-yellow-200 dark:bg-transparent dark:text-yellow-400 dark:border-yellow-900/40',
        text: 'Medium',
        colorCode: '#e3a008',
        color: '#e3a008',
        dotColor: 'bg-yellow-500',
        activeClass: 'bg-transparent text-yellow-700 border-yellow-300 focus-visible:ring-yellow-500/20',
        inactiveClass: 'bg-white text-zinc-500 border-zinc-200 hover:bg-zinc-50',
        confidence: 75
      };
    case 'LOW':
      return {
        badge: 'bg-transparent text-green-800 border-green-200 dark:bg-transparent dark:text-green-400 dark:border-green-900/40',
        text: 'Low',
        colorCode: '#057a55',
        color: '#057a55',
        dotColor: 'bg-green-500',
        activeClass: 'bg-transparent text-green-700 border-green-300 focus-visible:ring-green-500/20',
        inactiveClass: 'bg-white text-zinc-500 border-zinc-200 hover:bg-zinc-50',
        confidence: 90
      };
  }
};

export const StatusBadge: React.FC<{ status: IncidentStatus }> = ({ status }) => {
  const styles = getStatusStyles(status);
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${styles.pill}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${styles.dot}`} />
      {styles.text}
    </span>
  );
};

export const SeverityBadge: React.FC<{ severity: IncidentSeverity }> = ({ severity }) => {
  const styles = getSeverityStyles(severity);
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${styles.badge}`}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: styles.colorCode }} />
      {styles.text}
    </span>
  );
};
