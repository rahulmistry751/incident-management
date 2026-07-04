export type IncidentStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
export type IncidentSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Incident {
  id: string;
  title: string;
  description: string;
  status: IncidentStatus;
  severity: IncidentSeverity;
  createdAt: string;
  updatedAt: string;
}

export interface AnalysisReport {
  id: string;
  summary: string;
  recommendedSeverity: IncidentSeverity;
  rootCause: string;
  createdAt: string;
}

export interface IncidentDetail {
  id: string;
  title: string;
  description: string;
  status: IncidentStatus;
  severity: IncidentSeverity;
  createdAt: string;
  updatedAt: string;
  analyses: AnalysisReport[];
}

export interface TimelineEvent {
  id: string;
  actor: string;
  role: 'system' | 'ai' | 'operator';
  message: string;
  timeLabel: string;
  timestamp: Date;
}
