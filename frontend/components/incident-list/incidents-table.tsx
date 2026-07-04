import React from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, ChevronRight } from 'lucide-react';
import { Incident } from '@/types/incident';
import { formatDate } from '@/lib/utils';
import { getSeverityStyles, getStatusStyles } from '@/components/ui/badge';

interface IncidentsTableProps {
  filteredAndSortedIncidents: Incident[];
  paginatedIncidents: Incident[];
  searchQuery: string;
  statusFilter: string;
  severityFilter: string;
  clearFilters: () => void;
}

export const IncidentsTable: React.FC<IncidentsTableProps> = ({
  filteredAndSortedIncidents,
  paginatedIncidents,
  searchQuery,
  statusFilter,
  severityFilter,
  clearFilters,
}) => {
  const router = useRouter();

  if (filteredAndSortedIncidents.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-zinc-200/80 shadow-sm p-12 text-center flex flex-col items-center justify-center">
        <AlertCircle className="h-10 w-10 text-zinc-400 mb-3" />
        <h4 className="text-sm font-bold text-zinc-950">No matching incidents</h4>
        <p className="text-xs text-zinc-500 max-w-sm mt-1">
          No results match the current query criteria. Try clearing search query or adjusting options.
        </p>
        {(searchQuery || statusFilter !== 'ALL' || severityFilter !== 'ALL') && (
          <button
            onClick={clearFilters}
            className="mt-4 px-4 py-2 border border-zinc-250 bg-zinc-50 hover:bg-zinc-100 rounded-lg text-xs font-semibold text-zinc-700 cursor-pointer"
          >
            Clear All Filters
          </button>
        )}
      </div>
    );
  }

  return (
    <>
      {/* A. Desktop striped data table */}
      <div className="hidden md:block bg-white rounded-lg border border-zinc-200/80 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-zinc-50/70 border-b border-zinc-200/60 text-zinc-500 font-bold uppercase tracking-wider">
              <th className="px-6 py-3.5 font-semibold">Incident ID</th>
              <th className="px-6 py-3.5 font-semibold">Title</th>
              <th className="px-6 py-3.5 font-semibold">Description</th>
              <th className="px-6 py-3.5 font-semibold">Severity</th>
              <th className="px-6 py-3.5 font-semibold">Status</th>
              <th className="px-6 py-3.5 font-semibold">Logged At</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-150">
            {paginatedIncidents.map((incident, idx) => {
              const sev = getSeverityStyles(incident.severity);
              const stat = getStatusStyles(incident.status);
              return (
                <tr
                  key={incident.id}
                  onClick={() => router.push(`/incident/${incident.id}`)}
                  className={`cursor-pointer transition-colors hover:bg-blue-50/45 ${
                    idx % 2 === 0 ? 'bg-white' : 'bg-zinc-50/40'
                  }`}
                >
                  <td className="px-6 py-3.5 font-mono font-bold text-[#1a56db] select-all">
                    {incident.id.substring(0, 8)}
                  </td>
                  <td className="px-6 py-3.5 font-semibold text-zinc-900 max-w-[180px] truncate">
                    {incident.title}
                  </td>
                  <td className="px-6 py-3.5 text-zinc-500 max-w-[280px] truncate">
                    {incident.description}
                  </td>
                  <td className="px-6 py-3.5">
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
                  <td className="px-6 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${stat.pill}`}
                    >
                      {stat.text}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-zinc-500 font-medium whitespace-nowrap">
                    {formatDate(incident.createdAt)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* B. Mobile cards layout */}
      <div className="flex flex-col gap-4 md:hidden">
        {paginatedIncidents.map((incident) => {
          const sev = getSeverityStyles(incident.severity);
          const stat = getStatusStyles(incident.status);
          return (
            <article
              key={incident.id}
              onClick={() => router.push(`/incident/${incident.id}`)}
              className="bg-white p-5 rounded-lg border border-zinc-200/80 shadow-sm flex flex-col gap-4 active:bg-zinc-50 transition-colors cursor-pointer"
            >
              <div className="flex justify-between items-center">
                <span className="font-mono font-bold text-[#1a56db] select-all text-xs">
                  ID: {incident.id.substring(0, 8)}
                </span>
                <div className="flex gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold border ${sev.badge}`}
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: sev.colorCode }}
                    />
                    {sev.text}
                  </span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold border ${stat.pill}`}
                  >
                    {stat.text}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-sm text-zinc-900 leading-snug">{incident.title}</h4>
                <p className="text-xs text-zinc-500 line-clamp-2 mt-1 break-words">
                  {incident.description}
                </p>
              </div>

              <div className="border-t border-zinc-150 pt-3 flex justify-between items-center text-[10px] text-zinc-400 font-medium">
                <span>Logged {formatDate(incident.createdAt)}</span>
                <span className="text-[#1a56db] font-bold flex items-center gap-0.5">
                  <span>Review details</span>
                  <ChevronRight className="h-3 w-3" />
                </span>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
};
