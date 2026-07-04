import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  totalPages: number;
  totalItems: number;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  setCurrentPage,
  totalPages,
  totalItems,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between border-t border-zinc-200/60 pt-5 mt-5 gap-4">
      <span className="text-xs text-zinc-500 font-medium font-variant-numeric: tabular-nums">
        Showing Page {currentPage} of {totalPages} ({totalItems} total items)
      </span>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage <= 1}
          className="p-1.5 border border-zinc-200 rounded-lg bg-white hover:bg-zinc-50 text-zinc-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-1">
          {[...Array(totalPages)].map((_, idx) => {
            const pNum = idx + 1;
            if (totalPages > 5 && Math.abs(pNum - currentPage) > 2) {
              if (pNum === 1 || pNum === totalPages) {
                return (
                  <span key={pNum} className="text-xs text-zinc-400 px-0.5">
                    ...
                  </span>
                );
              }
              return null;
            }
            return (
              <button
                key={pNum}
                onClick={() => setCurrentPage(pNum)}
                className={`h-8 w-8 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                  pNum === currentPage
                    ? 'bg-[#1a56db] border-[#1a56db] text-white shadow-sm'
                    : 'bg-white border-zinc-200 hover:bg-zinc-50 text-zinc-700'
                }`}
              >
                {pNum}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage >= totalPages}
          className="p-1.5 border border-[#e4e4e7] rounded-lg bg-white hover:bg-zinc-50 text-zinc-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
