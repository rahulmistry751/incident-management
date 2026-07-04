'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, ShieldAlert } from 'lucide-react';
import { Incident, IncidentSeverity, IncidentStatus } from '@/types/incident';

// Modular Layout Components
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';

// Modular Dashboard Components
import { StatCards } from '@/components/dashboard/stat-cards';
import { ChartsSection } from '@/components/dashboard/charts-section';
import { RecentIncidents } from '@/components/dashboard/recent-incidents';

// Modular Incident List Components
import { FiltersToolbar } from '@/components/incident-list/filters-toolbar';
import { IncidentsTable } from '@/components/incident-list/incidents-table';
import { Pagination } from '@/components/incident-list/pagination';

// Modular Create Incident Components
import { CreateForm } from '@/components/create-incident/create-form';
import { SuccessScreen } from '@/components/create-incident/success-screen';

export default function AppConsole() {
  // Navigation State
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'list' | 'create'>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // Core Data State
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filtering State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [sortNewest, setSortNewest] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const limit = 10;

  // Auto-reset page on query change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, severityFilter]);

  // Create Incident Form State
  const [createSuccess, setCreateSuccess] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Fetch all incidents
  const fetchAllIncidents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/incidents?page=1&limit=10');
      if (!res.ok) {
        throw new Error('Failed to connect to incident backend service.');
      }
      const json = await res.json();
      setIncidents(json.data || []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllIncidents();
  }, [fetchAllIncidents]);

  // Derived Statistics (for Dashboard)
  const totalCount = incidents.length;
  const openCount = incidents.filter((i) => i.status === 'OPEN').length;
  const inProgressCount = incidents.filter((i) => i.status === 'IN_PROGRESS').length;
  const resolvedCount = incidents.filter((i) => i.status === 'RESOLVED').length;

  const criticalCount = incidents.filter((i) => i.severity === 'CRITICAL').length;
  const highCount = incidents.filter((i) => i.severity === 'HIGH').length;
  const mediumCount = incidents.filter((i) => i.severity === 'MEDIUM').length;
  const lowCount = incidents.filter((i) => i.severity === 'LOW').length;

  // Handle Form Submission
  const handleCreateSubmit = async (
    title: string,
    description: string,
    severity: IncidentSeverity,
    status: IncidentStatus
  ) => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          severity,
          status,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to create incident record.');
      }

      const newIncident = await res.json();

      // Update local state immediately
      setIncidents((prev) => [newIncident, ...prev]);
      setCreateSuccess(true);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setCreateSuccess(false);
  };

  // Client-Side Search, Filter, and Sort (for List Tab)
  const filteredAndSortedIncidents = incidents
    .filter((i) => {
      const matchesSearch =
        i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'ALL' || i.status === statusFilter;
      const matchesSeverity = severityFilter === 'ALL' || i.severity === severityFilter;

      return matchesSearch && matchesStatus && matchesSeverity;
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortNewest ? dateB - dateA : dateA - dateB;
    });

  // Client-Side Slicing Pagination
  const totalItems = filteredAndSortedIncidents.length;
  const totalPages = Math.ceil(totalItems / limit) || 1;
  const paginatedIncidents = filteredAndSortedIncidents.slice(
    (currentPage - 1) * limit,
    currentPage * limit
  );

  // Recent Incidents (Top 5 for Dashboard)
  const recentIncidents = [...incidents]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setSeverityFilter('ALL');
  };

  return (
    <div className="flex min-h-screen bg-[#f7f8fa] text-zinc-900 font-sans text-[14px]">
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        isMobileSidebarOpen={isMobileSidebarOpen}
        setIsMobileSidebarOpen={setIsMobileSidebarOpen}
      />

      {/* Main Panel Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          setIsMobileSidebarOpen={setIsMobileSidebarOpen}
          onRefresh={fetchAllIncidents}
        />

        <main className="flex-1 overflow-y-auto p-6 max-w-7xl w-full mx-auto flex flex-col gap-6">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-[#1a56db]" />
              <p className="text-zinc-500 animate-pulse font-medium">Fetching details…</p>
            </div>
          ) : error ? (
            <div className="p-8 border border-red-200 bg-red-50/50 rounded-lg flex flex-col items-center text-center">
              <ShieldAlert className="h-12 w-12 text-red-600 mb-3" />
              <h3 className="text-base font-bold text-zinc-900">Console Sync Failure</h3>
              <p className="text-xs text-zinc-500 max-w-md mt-1">{error}</p>
              <button
                onClick={fetchAllIncidents}
                className="mt-4 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold rounded-lg text-xs cursor-pointer"
              >
                Retry Synced Run
              </button>
            </div>
          ) : (
            <>
              {/* TAB 1: DASHBOARD VIEW */}
              {currentTab === 'dashboard' && (
                <div className="flex flex-col gap-6 animate-fade-in">
                  <StatCards
                    totalCount={totalCount}
                    openCount={openCount}
                    resolvedCount={resolvedCount}
                    criticalCount={criticalCount}
                  />

                  <ChartsSection
                    totalCount={totalCount}
                    openCount={openCount}
                    inProgressCount={inProgressCount}
                    resolvedCount={resolvedCount}
                    criticalCount={criticalCount}
                    highCount={highCount}
                    mediumCount={mediumCount}
                    lowCount={lowCount}
                  />

                  <RecentIncidents
                    recentIncidents={recentIncidents}
                    onNavigateToList={() => setCurrentTab('list')}
                  />
                </div>
              )}

              {/* TAB 2: INCIDENTS LIST VIEW */}
              {currentTab === 'list' && (
                <div className="flex flex-col gap-6 animate-fade-in">
                  <FiltersToolbar
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                    severityFilter={severityFilter}
                    setSeverityFilter={setSeverityFilter}
                    sortNewest={sortNewest}
                    setSortNewest={setSortNewest}
                  />

                  <section className="flex-1 flex flex-col">
                    <IncidentsTable
                      filteredAndSortedIncidents={filteredAndSortedIncidents}
                      paginatedIncidents={paginatedIncidents}
                      searchQuery={searchQuery}
                      statusFilter={statusFilter}
                      severityFilter={severityFilter}
                      clearFilters={clearFilters}
                    />

                    {filteredAndSortedIncidents.length > 0 && (
                      <Pagination
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                        totalPages={totalPages}
                        totalItems={totalItems}
                      />
                    )}
                  </section>
                </div>
              )}

              {/* TAB 3: CREATE INCIDENT VIEW */}
              {currentTab === 'create' && (
                <div className="max-w-2xl mx-auto w-full animate-fade-in py-4">
                  {createSuccess ? (
                    <SuccessScreen
                      onResetForm={handleResetForm}
                      onViewDashboard={() => {
                        handleResetForm();
                        setCurrentTab('dashboard');
                      }}
                    />
                  ) : (
                    <CreateForm
                      onSubmit={handleCreateSubmit}
                      isSubmitting={isSubmitting}
                      onCancel={() => {
                        handleResetForm();
                        setCurrentTab('dashboard');
                      }}
                    />
                  )}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
