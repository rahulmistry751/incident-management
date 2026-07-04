import React from 'react';

interface ChartsSectionProps {
  totalCount: number;
  openCount: number;
  inProgressCount: number;
  resolvedCount: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
}

export const ChartsSection: React.FC<ChartsSectionProps> = ({
  totalCount,
  openCount,
  inProgressCount,
  resolvedCount,
  criticalCount,
  highCount,
  mediumCount,
  lowCount,
}) => {
  // SVGs Donut Chart calculation variables
  const r = 40;
  const circ = 2 * Math.PI * r;
  const statusCounts = [openCount, inProgressCount, resolvedCount];
  const statusSum = openCount + inProgressCount + resolvedCount || 1;
  const statusColors = ['#e02424', '#1a56db', '#057a55']; // Red (Open), Blue (In Progress), Green (Resolved)

  // Calculate offsets for donut chart
  let accumulatedPercent = 0;

  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-6" aria-label="Incident charts analysis">
      {/* Severity bar chart */}
      <div className="p-6 bg-white rounded-lg border border-zinc-200/80 shadow-sm flex flex-col gap-6">
        <div>
          <h3 className="text-sm font-bold tracking-tight text-zinc-900">Severity Distribution</h3>
          <p className="text-[11px] text-zinc-500">Breakdown of incidents by risk priority</p>
        </div>

        <div className="flex flex-col gap-4">
          {[
            { key: 'CRITICAL', label: 'Critical', count: criticalCount, color: '#e02424' },
            { key: 'HIGH', label: 'High', count: highCount, color: '#ff5a1f' },
            { key: 'MEDIUM', label: 'Medium', count: mediumCount, color: '#e3a008' },
            { key: 'LOW', label: 'Low', count: lowCount, color: '#057a55' },
          ].map((sev) => {
            const pct = totalCount > 0 ? (sev.count / totalCount) * 100 : 0;
            return (
              <div key={sev.key} className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-zinc-700">{sev.label}</span>
                  <span className="text-zinc-500 font-variant-numeric: tabular-nums">
                    {sev.count} ({Math.round(pct)}%)
                  </span>
                </div>
                <div className="h-3 w-full bg-zinc-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: sev.color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Donut chart for status distribution */}
      <div className="p-6 bg-white rounded-lg border border-zinc-200/80 shadow-sm flex flex-col gap-4">
        <div>
          <h3 className="text-sm font-bold tracking-tight text-zinc-900">Status Distribution</h3>
          <p className="text-[11px] text-zinc-500">Lifecycle progress overview</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-4">
          {/* Donut SVG */}
          <div className="relative h-32 w-32 shrink-0">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r={r} fill="transparent" stroke="#e4e4e7" strokeWidth="8" />
              {statusCounts.map((count, index) => {
                const pct = (count / statusSum) * circ;
                const strokeDashoffset = circ - (accumulatedPercent / statusSum) * circ;
                accumulatedPercent += count;

                if (count === 0) return null;
                return (
                  <circle
                    key={index}
                    cx="50"
                    cy="50"
                    r={r}
                    fill="transparent"
                    stroke={statusColors[index]}
                    strokeWidth="8"
                    strokeDasharray={circ}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />
                );
              })}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-extrabold text-zinc-900 tracking-tight font-variant-numeric: tabular-nums">
                {totalCount}
              </span>
              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wide">Total</span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-[#e02424]" />
              <div className="text-xs">
                <span className="font-semibold text-zinc-700">Open:</span>{' '}
                <span className="text-zinc-500 font-bold font-variant-numeric: tabular-nums">{openCount}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-[#1a56db]" />
              <div className="text-xs">
                <span className="font-semibold text-zinc-700">In Progress:</span>{' '}
                <span className="text-zinc-500 font-bold font-variant-numeric: tabular-nums">{inProgressCount}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-[#057a55]" />
              <div className="text-xs">
                <span className="font-semibold text-zinc-700">Resolved:</span>{' '}
                <span className="text-zinc-500 font-bold font-variant-numeric: tabular-nums">{resolvedCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
