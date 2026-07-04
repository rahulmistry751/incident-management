import React from 'react';
import { IncidentDetail } from '@/types/incident';
import { formatFriendlyDate } from '@/lib/utils';
import { StatusBadge, SeverityBadge } from '@/components/ui/badge';

interface DetailContentProps {
  incident: IncidentDetail;
}

export const DetailContent: React.FC<DetailContentProps> = ({ incident }) => {
  return (
    <article className="p-6 bg-white border border-zinc-200/80 rounded-lg shadow-sm flex flex-col gap-6">
      {/* Badges bar */}
      <div className="flex flex-wrap items-center gap-3">
        <StatusBadge status={incident.status} />
        <SeverityBadge severity={incident.severity} />
      </div>

      {/* Title */}
      <div>
        <h2 className="text-xl font-extrabold tracking-tight text-zinc-950 text-wrap: balance">
          {incident.title}
        </h2>
        <span className="text-[10px] font-medium text-zinc-400 block mt-1">
          Registered on {formatFriendlyDate(incident.createdAt)} (Updated{' '}
          {formatFriendlyDate(incident.updatedAt)})
        </span>
      </div>

      {/* Description block */}
      <div className="border-t border-zinc-200/60 pt-4">
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
          Description
        </h3>
        <p className="text-zinc-700 dark:text-zinc-600 leading-relaxed break-words whitespace-pre-wrap">
          {incident.description}
        </p>
      </div>
    </article>
  );
};
