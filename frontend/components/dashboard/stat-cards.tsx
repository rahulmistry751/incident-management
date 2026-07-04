import React from 'react';

interface StatCardsProps {
  totalCount: number;
  openCount: number;
  resolvedCount: number;
  criticalCount: number;
}

export const StatCards: React.FC<StatCardsProps> = ({
  totalCount,
  openCount,
  resolvedCount,
  criticalCount,
}) => {
  const stats = [
    { label: 'Total Incidents', count: totalCount, colorClass: 'text-zinc-900' },
    { label: 'Open Tickets', count: openCount, colorClass: 'text-blue-600' },
    { label: 'Resolved Tickets', count: resolvedCount, colorClass: 'text-green-700' },
    { label: 'Critical Failures', count: criticalCount, colorClass: 'text-red-600' },
  ] as const;

  return (
    <section className="grid grid-cols-2 lg:grid-cols-4 gap-4" aria-label="Stat cards summary">
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className="p-5 bg-white rounded-lg border border-zinc-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-all"
        >
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">{stat.label}</span>
          <span className={`text-3xl font-extrabold ${stat.colorClass} mt-2 font-variant-numeric: tabular-nums`}>
            {stat.count}
          </span>
        </div>
      ))}
    </section>
  );
};
