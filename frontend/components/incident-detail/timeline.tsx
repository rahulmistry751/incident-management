import React from 'react';
import { Database, Cpu, User } from 'lucide-react';
import { TimelineEvent } from '@/types/incident';
import { getRelativeTime } from '@/lib/utils';

interface TimelineProps {
  events: TimelineEvent[];
}

const getActorAvatar = (role: 'system' | 'ai' | 'operator', name: string) => {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
  switch (role) {
    case 'system':
      return {
        bg: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800/40',
        icon: Database,
        label: initials,
      };
    case 'ai':
      return {
        bg: 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800/40',
        icon: Cpu,
        label: 'AI',
      };
    case 'operator':
      return {
        bg: 'bg-zinc-100 text-zinc-800 border-zinc-200 dark:bg-zinc-850 dark:text-zinc-300 dark:border-zinc-700',
        icon: User,
        label: initials,
      };
  }
};

export const Timeline: React.FC<TimelineProps> = ({ events }) => {
  return (
    <section
      className="bg-white border border-zinc-200/80 rounded-lg shadow-sm p-6 flex flex-col gap-5"
      aria-label="Activity timeline log"
    >
      <div>
        <h3 className="text-sm font-bold tracking-tight text-zinc-900">Activity Timeline</h3>
        <p className="text-[11px] text-zinc-500">Chronological history of ticket operations</p>
      </div>

      <div className="relative flex flex-col gap-6">
        {/* Vertical line running down behind the badges */}
        <div className="absolute left-[15px] top-1.5 bottom-1.5 w-px bg-zinc-200 z-0" />

        {events.map((evt) => {
          const av = getActorAvatar(evt.role, evt.actor);
          const Icon = av.icon;
          return (
            <div key={evt.id} className="relative pl-10 flex flex-col gap-1.5 z-10 font-sans">
              {/* Circle icon container aligned with line */}
              <div className="absolute left-0 top-0.5 z-20 h-8 w-8">
                {/* Solid circular background mask to block the vertical line from overlapping or showing through */}
                <div className="absolute inset-0 bg-white rounded-full z-0" />

                {/* Styled avatar on top of the mask */}
                <div
                  className={`relative h-8 w-8 rounded-full border flex items-center justify-center font-bold text-xs shadow-sm ${av.bg} z-10`}
                >
                  <Icon className="h-3.5 w-3.5" />
                </div>
              </div>

              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-zinc-900">{evt.actor}</span>
                <span className="text-zinc-400 font-medium text-[10px]">
                  {getRelativeTime(evt.timestamp)}
                </span>
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed font-medium break-words">
                {evt.message}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
};
