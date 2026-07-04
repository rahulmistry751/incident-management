import React from 'react';
import { Menu, RefreshCw, PlusCircle } from 'lucide-react';

interface HeaderProps {
  currentTab: 'dashboard' | 'list' | 'create';
  setCurrentTab: (tab: 'dashboard' | 'list' | 'create') => void;
  setIsMobileSidebarOpen: (isOpen: boolean) => void;
  onRefresh: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  setIsMobileSidebarOpen,
  onRefresh,
}) => {
  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-zinc-200/80 flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="lg:hidden p-2 -ml-2 rounded-lg text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100"
          aria-label="Open sidebar menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h2 className="text-base sm:text-lg font-bold text-zinc-900 capitalize tracking-tight">
          {currentTab === 'create' ? 'Register Incident' : `${currentTab} Console`}
        </h2>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onRefresh}
          className="p-2 rounded-lg text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 border border-zinc-200 transition-all"
          aria-label="Refresh incidents"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
        <button
          onClick={() => setCurrentTab('create')}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1a56db] hover:bg-blue-700 text-white font-semibold rounded-lg text-xs transition-all active:scale-95 shadow-sm shadow-blue-500/10"
        >
          <PlusCircle className="h-4 w-4" />
          <span className="hidden sm:inline">New Incident</span>
        </button>
      </div>
    </header>
  );
};
