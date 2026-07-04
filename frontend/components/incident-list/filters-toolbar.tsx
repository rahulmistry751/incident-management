import React from 'react';
import { Search, X, ArrowUpDown } from 'lucide-react';

interface FiltersToolbarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  severityFilter: string;
  setSeverityFilter: (severity: string) => void;
  sortNewest: boolean;
  setSortNewest: (sort: boolean) => void;
}

export const FiltersToolbar: React.FC<FiltersToolbarProps> = ({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  severityFilter,
  setSeverityFilter,
  sortNewest,
  setSortNewest,
}) => {
  return (
    <section className="bg-white rounded-lg border border-zinc-200/80 shadow-sm p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
      {/* Left: text search */}
      <div className="relative w-full md:w-80">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
        <input
          type="text"
          placeholder="Search incident title, description, or ID…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value.trim())}
          className="w-full pl-9 pr-4 py-2 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 focus:bg-white focus:border-[#1a56db] rounded-lg text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20 transition-all font-semibold"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-950 cursor-pointer"
            aria-label="Clear search text query"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Right: filter selections */}
      <div className="w-full md:w-auto flex flex-wrap gap-3 items-center justify-end">
        {/* Status */}
        <div className="flex items-center gap-1.5">
          <label htmlFor="list-status-select" className="text-xs font-bold text-zinc-500 uppercase tracking-wide">
            Status
          </label>
          <select
            id="list-status-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-lg text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20 font-semibold cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>

        {/* Severity */}
        <div className="flex items-center gap-1.5">
          <label htmlFor="list-severity-select" className="text-xs font-bold text-zinc-500 uppercase tracking-wide">
            Severity
          </label>
          <select
            id="list-severity-select"
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-3 py-1.5 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-lg text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20 font-semibold cursor-pointer"
          >
            <option value="ALL">All Severities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>

        {/* Date Sort toggle */}
        <button
          onClick={() => setSortNewest(!sortNewest)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-lg text-xs font-semibold active:scale-95 transition-all text-zinc-700 cursor-pointer"
        >
          <ArrowUpDown className="h-3.5 w-3.5" />
          <span>Date: {sortNewest ? 'Newest' : 'Oldest'}</span>
        </button>
      </div>
    </section>
  );
};
