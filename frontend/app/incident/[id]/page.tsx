'use client';

import React, { useState, useEffect, useRef, use, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, Loader2, ShieldAlert } from 'lucide-react';
import { IncidentDetail, IncidentStatus, TimelineEvent, AnalysisReport } from '@/types/incident';
import { getRelativeTime } from '@/lib/utils';

// Modular Detail Components
import { DetailContent } from '@/components/incident-detail/detail-content';
import { Timeline } from '@/components/incident-detail/timeline';
import { AiDiagnostics } from '@/components/incident-detail/ai-diagnostics';

interface IncidentDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function IncidentDetailPage({ params }: IncidentDetailPageProps) {
  // Resolve route parameters using React 19 use hook
  const { id } = use(params);
  const router = useRouter();

  // Core Data States
  const [incident, setIncident] = useState<IncidentDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [statusUpdating, setStatusUpdating] = useState<boolean>(false);
  const [statusSuccess, setStatusSuccess] = useState<boolean>(false);

  // AI Diagnostic Pipeline State
  const [analysisRunning, setAnalysisRunning] = useState<boolean>(false);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [latestAnalysis, setLatestAnalysis] = useState<AnalysisReport | null>(null);

  // Custom interactive timeline events
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);

  // Ref to cancel EventSource on unmount
  const eventSourceRef = useRef<EventSource | null>(null);

  // Fetch incident particulars
  const fetchIncidentDetail = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/incidents/${id}`);
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('Incident not found in the registers.');
        }
        throw new Error('Failed to retrieve incident details.');
      }
      const data: IncidentDetail = await res.json();
      setIncident(data);

      // Initialize timeline events based on creation date
      const createdDate = new Date(data.createdAt);
      const initialEvents: TimelineEvent[] = [
        {
          id: 'evt-1',
          actor: 'System Monitor',
          role: 'system',
          message: `Anomaly pattern detected. Triggered auto-registration for issue priority.`,
          timeLabel: getRelativeTime(createdDate),
          timestamp: createdDate,
        },
        {
          id: 'evt-2',
          actor: 'System Intake',
          role: 'operator',
          message: `Ticket successfully opened with initial status set to "${data.status}" and severity "${data.severity}".`,
          timeLabel: getRelativeTime(new Date(createdDate.getTime() + 30000)),
          timestamp: new Date(createdDate.getTime() + 30000),
        },
      ];

      // Add historical analyses to the timeline
      if (data.analyses && data.analyses.length > 0) {
        data.analyses.forEach((analysis) => {
          initialEvents.push({
            id: `evt-analysis-${analysis.id}`,
            actor: 'AI Diagnostic Engine',
            role: 'ai',
            message: `AI Diagnostic Report #${analysis.id.substring(
              0,
              4
            )} generated. Severity recommended: "${analysis.recommendedSeverity}".`,
            timeLabel: getRelativeTime(new Date(analysis.createdAt)),
            timestamp: new Date(analysis.createdAt),
          });
        });
      }

      // Sort timeline events chronologically (newest first)
      initialEvents.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      setTimelineEvents(initialEvents);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchIncidentDetail();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [id, fetchIncidentDetail]);

  // Update Status handler (propagates changes instantly)
  const handleStatusChange = async (newStatus: IncidentStatus) => {
    if (!incident) return;
    setStatusUpdating(true);
    setStatusSuccess(false);

    try {
      const res = await fetch(`/api/incidents/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        throw new Error('Failed to update status.');
      }

      setIncident((prev) => (prev ? { ...prev, status: newStatus } : null));

      // Add status change to the timeline instantly
      const newEvent: TimelineEvent = {
        id: `evt-status-${Date.now()}`,
        actor: 'Operator Console',
        role: 'operator',
        message: `Status updated manually to "${newStatus}".`,
        timeLabel: getRelativeTime(new Date()),
        timestamp: new Date(),
      };
      setTimelineEvents((prev) => [newEvent, ...prev]);

      setStatusSuccess(true);
      setTimeout(() => setStatusSuccess(false), 3000);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setStatusUpdating(false);
    }
  };

  // Run AI Analysis Pipeline Stream
  const runAiAnalysisStream = () => {
    if (analysisRunning) return;

    setAnalysisRunning(true);
    setStreamError(null);
    setCurrentStep(1);
    setLatestAnalysis(null);

    // Subscribe to EventSource
    const es = new EventSource(`/api/incidents/${id}/analyze/stream`);
    eventSourceRef.current = es;

    es.addEventListener('progress', (e) => {
      const progressMessage = e.data;
      console.log('Progress Event:', progressMessage);

      if (progressMessage.includes('Analyzing')) {
        setCurrentStep(1);
      } else if (progressMessage.includes('severity')) {
        setCurrentStep(2);
      } else if (progressMessage.includes('recommendations')) {
        setCurrentStep(3);
      }
    });

    es.addEventListener('result', (e) => {
      try {
        const payload: AnalysisReport = JSON.parse(e.data);
        setLatestAnalysis(payload);

        // Update incident locally
        setIncident((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            analyses: [payload, ...prev.analyses],
          };
        });

        // Add timeline event
        const newEvent: TimelineEvent = {
          id: `evt-analysis-${payload.id}`,
          actor: 'AI Diagnostic Engine',
          role: 'ai',
          message: `AI Diagnostic Report #${payload.id.substring(
            0,
            4
          )} generated. Summary: "${payload.summary.substring(0, 60)}…".`,
          timeLabel: getRelativeTime(new Date()),
          timestamp: new Date(),
        };
        setTimelineEvents((prev) => [newEvent, ...prev]);
      } catch (err) {
        console.error('Error parsing SSE analysis output:', err);
      }
    });

    es.addEventListener('completed', () => {
      setCurrentStep(4);
      setAnalysisRunning(false);
      es.close();
      eventSourceRef.current = null;
    });

    es.addEventListener('error', (e: any) => {
      console.error('Stream failure event:', e);
      const errMsg = e.data || 'Connection reset. Diagnostic process failed.';
      setStreamError(errMsg);
      setAnalysisRunning(false);
      es.close();
      eventSourceRef.current = null;
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-[#f7f8fa] text-zinc-900 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-[#1a56db]" />
        <p className="text-zinc-500 animate-pulse font-medium">Fetching details…</p>
      </div>
    );
  }

  if (error || !incident) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-[#f7f8fa] p-6 text-center">
        <ShieldAlert className="h-14 w-14 text-red-600 mb-4" />
        <h2 className="text-lg font-bold tracking-tight text-zinc-950 mb-2">Record Access Failure</h2>
        <p className="text-xs text-zinc-500 max-w-sm mb-6">{error || 'Could not load details'}</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold rounded-lg text-xs transition-all shadow-sm active:scale-95"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f7f8fa] text-zinc-900 font-sans text-[14px]">
      {/* Detail Header bar */}
      <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4 min-w-0">
            <Link
              href="/"
              className="p-2 border border-zinc-200 rounded-lg text-zinc-500 hover:text-zinc-950 hover:bg-zinc-50 transition-all flex items-center justify-center"
              aria-label="Back to dashboard view"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="h-5 w-px bg-zinc-200" />
            <div className="min-w-0">
              <span className="text-[10px] text-zinc-400 block font-mono font-bold tracking-wider">
                INCIDENT // <span className="text-zinc-600">{incident.id.toUpperCase()}</span>
              </span>
              <h1 className="text-xs sm:text-sm font-bold text-zinc-900 truncate max-w-xs sm:max-w-md">
                {incident.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {statusSuccess && (
              <span className="text-xs text-green-600 animate-fade-in flex items-center gap-1 font-semibold">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Updated!
              </span>
            )}

            {/* Status select dropdown */}
            <div className="relative">
              <label htmlFor="status-select-detail" className="sr-only">
                Update status dropdown
              </label>
              <select
                id="status-select-detail"
                value={incident.status}
                disabled={statusUpdating}
                onChange={(e) => handleStatusChange(e.target.value as IncidentStatus)}
                className="pl-3 pr-8 py-1.5 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-lg text-xs font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20 disabled:opacity-50 transition-all cursor-pointer"
              >
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace Grid */}
      <main className="max-w-7xl w-full mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 items-start">
        {/* Left Column: Context details, description, and activity timeline */}
        <section className="lg:col-span-2 flex flex-col gap-6" aria-label="Incident context and timeline">
          <DetailContent incident={incident} />
          <Timeline events={timelineEvents} />
        </section>

        {/* Right Column: AI Diagnostics Center */}
        <AiDiagnostics
          analysisRunning={analysisRunning}
          runAiAnalysisStream={runAiAnalysisStream}
          currentStep={currentStep}
          streamError={streamError}
          latestAnalysis={latestAnalysis}
        />
      </main>
    </div>
  );
}
