import React from 'react';
import { Brain, Sparkles, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { AnalysisReport } from '@/types/incident';
import { getSeverityStyles } from '@/components/ui/badge';

interface AiDiagnosticsProps {
  analysisRunning: boolean;
  runAiAnalysisStream: () => void;
  currentStep: number;
  streamError: string | null;
  latestAnalysis: AnalysisReport | null;
}

const getRootCauses = (analysisResult: AnalysisReport | null): string[] => {
  if (!analysisResult || !analysisResult.rootCause) return [];

  return analysisResult.rootCause
    .split('\n')
    .map((line) => line.replace(/^\d+[\.\-\s]*/, '').trim())
    .filter((line) => line.length > 0);
};

export const AiDiagnostics: React.FC<AiDiagnosticsProps> = ({
  analysisRunning,
  runAiAnalysisStream,
  currentStep,
  streamError,
  latestAnalysis,
}) => {
  return (
    <aside
      className="flex flex-col gap-6 sticky top-24"
      id="ai-analysis-panel"
      aria-label="AI diagnostics container"
    >
      <article className="p-6 bg-white border border-zinc-200/80 rounded-lg shadow-sm flex flex-col gap-6 font-sans">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg text-[#1a56db]">
            <Brain className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-tight text-zinc-950">AI Diagnostics Center</h3>
            <p className="text-[10px] text-zinc-500 font-medium">
              Auto-compiled diagnostic summary report
            </p>
          </div>
        </div>

        {/* Trigger diagnostics button */}
        {!analysisRunning ? (
          <button
            onClick={runAiAnalysisStream}
            className="w-full py-2.5 bg-[#1a56db] hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-all active:scale-95 shadow-sm shadow-blue-500/10 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="h-4 w-4" />
            <span>Run AI Diagnostic Analysis</span>
          </button>
        ) : (
          <div className="w-full py-2.5 bg-zinc-50 text-zinc-500 border border-zinc-200 rounded-lg text-xs font-bold flex items-center justify-center gap-2 select-none cursor-not-allowed">
            <Loader2 className="h-4 w-4 animate-spin text-[#1a56db]" />
            <span>Running Diagnostics…</span>
          </div>
        )}

        {/* Stepper Pipeline checklist (active while connecting/running) */}
        {(analysisRunning || currentStep > 0) && (
          <div className="border-t border-zinc-200/60 pt-4 flex flex-col gap-4 animate-fade-in">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">
              Diagnostic Phases
            </span>

            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-3 text-xs">
                <div className="mt-0.5">
                  {currentStep > 1 ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : currentStep === 1 ? (
                    <Loader2 className="h-4 w-4 animate-spin text-[#1a56db]" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border border-zinc-300" />
                  )}
                </div>
                <div>
                  <span
                    className={`font-semibold block ${
                      currentStep >= 1 ? 'text-zinc-900' : 'text-zinc-400'
                    }`}
                  >
                    Analyzing incident logs
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 text-xs">
                <div className="mt-0.5">
                  {currentStep > 2 ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : currentStep === 2 ? (
                    <Loader2 className="h-4 w-4 animate-spin text-[#1a56db]" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border border-zinc-300" />
                  )}
                </div>
                <div>
                  <span
                    className={`font-semibold block ${
                      currentStep >= 2 ? 'text-zinc-900' : 'text-zinc-400'
                    }`}
                  >
                    Determining target severity
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 text-xs">
                <div className="mt-0.5">
                  {currentStep > 3 ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : currentStep === 3 ? (
                    <Loader2 className="h-4 w-4 animate-spin text-[#1a56db]" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border border-zinc-300" />
                  )}
                </div>
                <div>
                  <span
                    className={`font-semibold block ${
                      currentStep >= 3 ? 'text-zinc-900' : 'text-zinc-400'
                    }`}
                  >
                    Generating recommendations
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error notifications */}
        {streamError && (
          <div className="p-3 border border-red-200 bg-red-50 text-red-700 rounded-lg flex items-start gap-2 text-xs">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <div className="font-medium">
              <span className="font-bold block">Execution Interrupted</span>
              <span>{streamError}</span>
            </div>
          </div>
        )}

        {/* AI Diagnostics Output Panel */}
        {latestAnalysis && (
          <div className="border-t border-zinc-200/60 pt-5 flex flex-col gap-5 animate-in fade-in slide-in-from-bottom duration-300">
            {/* 1. Summary Card */}
            <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-lg flex flex-col gap-2">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">
                Executive Summary
              </span>
              <p className="text-xs text-zinc-700 leading-relaxed break-words font-medium">
                {latestAnalysis.summary}
              </p>
            </div>

            {/* 2. Recommended Severity with confidence bar */}
            {(() => {
              const recSev = getSeverityStyles(latestAnalysis.recommendedSeverity);
              return (
                <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-lg flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">
                      Recommended Severity
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold border ${recSev.badge}`}
                    >
                      {recSev.text}
                    </span>
                  </div>

                  {/* Confidence bar meter */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-[10px] font-bold">
                      <span className="text-zinc-500">Engine Confidence</span>
                      <span style={{ color: recSev.color }}>{recSev.confidence}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-200 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{
                          width: `${recSev.confidence}%`,
                          backgroundColor: recSev.color,
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* 3. Numbered Root Cause list */}
            <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-lg flex flex-col gap-3">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">
                Root Cause &amp; Mitigations
              </span>

              <ol className="flex flex-col gap-3">
                {getRootCauses(latestAnalysis).map((cause, idx) => (
                  <li
                    key={idx}
                    className="flex gap-2.5 items-start text-xs leading-relaxed font-semibold text-zinc-700"
                  >
                    {/* Number bullet badge */}
                    <div className="h-5 w-5 bg-blue-50 border border-blue-200 text-[#1a56db] rounded-full flex items-center justify-center shrink-0 font-bold text-[10px]">
                      {idx + 1}
                    </div>
                    <span className="mt-0.5 break-words">{cause}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </article>
    </aside>
  );
};
