import React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { Incident } from '@/types/incident';
import { formatDate } from '@/lib/utils';
import { getSeverityStyles, getStatusStyles } from '@/components/ui/badge';

interface RecentIncidentsProps {
  recentIncidents: Incident[];
  onNavigateToList: () => void;
}

export const RecentIncidents: React.FC<RecentIncidentsProps> = ({
  recentIncidents,
  onNavigateToList,
}) => {
  const router = useRouter();

  return (
    <section className="bg-white rounded-lg border border-zinc-200/80 shadow-sm p-6 flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-bold tracking-tight text-zinc-900">Recent Incidents</h3>
          <p className="text-[11px] text-zinc-500">Newly registered anomalies requiring review</p>
        </div>
        <button
          onClick={onNavigateToList}
          className="text-xs font-bold text-[#1a56db] hover:text-blue-700 flex items-center gap-0.5 hover:underline cursor-pointer"
        >
          <span>View All Incidents</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {recentIncidents.length === 0 ? (
        <div className="text-center py-8 p-4 text-xs font-semibold text-zinc-500 bg-zinc-50/50 rounded-lg border border-dashed border-zinc-200">
          No incidents registered yet. Create one to begin.
        </div>
      ) : (
        <div className="overflow-x-auto -mx-6">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-zinc-50/70 border-y border-zinc-200/60 text-zinc-500 font-bold uppercase tracking-wider">
                <th className="px-6 py-3 font-semibold">Incident ID</th>
                <th className="px-6 py-3 font-semibold">Title</th>
                <th className="px-6 py-3 font-semibold">Severity</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 font-semibold">Logged At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-150">
              {recentIncidents.map((incident) => {
                const sev = getSeverityStyles(incident.severity);
                const stat = getStatusStyles(incident.status);
                return (
                  <tr
                    key={incident.id}
                    onClick={() => router.push(`/incident/${incident.id}`)}
                    className="hover:bg-zinc-50/80 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-3 font-mono font-bold text-[#1a56db] select-all">
                      {incident.id.substring(0, 8)}
                    </td>
                    <td className="px-6 py-3 font-semibold text-zinc-900 truncate max-w-xs">
                      {incident.title}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${sev.badge}`}
                      >
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ backgroundColor: sev.colorCode }}
                        />
                        {sev.text}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${stat.pill}`}
                      >
                        {stat.text}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-zinc-500 font-medium">
                      {formatDate(incident.createdAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};
