import React from 'react';
import { LayoutDashboard, List, PlusCircle, Brain, Clock, X } from 'lucide-react';

interface SidebarProps {
  currentTab: 'dashboard' | 'list' | 'create';
  setCurrentTab: (tab: 'dashboard' | 'list' | 'create') => void;
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (isOpen: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  isMobileSidebarOpen,
  setIsMobileSidebarOpen,
}) => {
  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'list', name: 'Incidents List', icon: List },
    { id: 'create', name: 'Create Incident', icon: PlusCircle },
  ] as const;

  return (
    <>
      {/* 1. Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-zinc-200/80 shrink-0">
        {/* Sidebar Logo */}
        <div className="h-16 flex items-center px-6 border-b border-zinc-200/80">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#1a56db] rounded-lg text-white">
              <Brain className="h-5 w-5" />
            </div>
            <span className="font-extrabold text-lg text-zinc-900 tracking-tight">Incident Center</span>
          </div>
        </div>
        {/* Navigation links */}
        <nav className="flex-1 px-4 py-6 flex flex-col gap-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                  active
                    ? 'bg-blue-50 text-[#1a56db]'
                    : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950'
                }`}
              >
                <Icon className={`h-5 w-5 ${active ? 'text-[#1a56db]' : 'text-zinc-400'}`} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>
        {/* Sidebar Footer info */}
        <div className="p-4 border-t border-zinc-200/80 bg-zinc-50/50">
          <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
            <Clock className="h-4 w-4 text-zinc-400" />
            <span>Console Status: Connected</span>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay Drawer */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden animate-fade-in">
          {/* Backdrop blur */}
          <div
            className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          {/* Slider Drawer Panel */}
          <aside className="relative flex flex-col w-72 max-w-xs bg-white h-full shadow-2xl p-6 border-r border-zinc-200 animate-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between pb-6 border-b border-zinc-200">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-[#1a56db] rounded-lg text-white">
                  <Brain className="h-5 w-5" />
                </div>
                <span className="font-extrabold text-lg text-zinc-900 tracking-tight">Incident Console</span>
              </div>
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="p-1 rounded-lg text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100"
                aria-label="Close sidebar menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 py-6 flex flex-col gap-1.5">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentTab(item.id);
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                      active
                        ? 'bg-blue-50 text-[#1a56db]'
                        : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950'
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${active ? 'text-[#1a56db]' : 'text-zinc-400'}`} />
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-zinc-200 text-xs text-zinc-500 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Diagnostic System v1.0.0</span>
            </div>
          </aside>
        </div>
      )}
    </>
  );
};
