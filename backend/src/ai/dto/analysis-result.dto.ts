export type IncidentSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface AnalysisResult {
  summary: string;
  recommendedSeverity: IncidentSeverity;
  rootCause: string;
}
