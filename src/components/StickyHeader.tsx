import {Activity, Cloud, Database, Search, WifiOff, X} from 'lucide-react';
import type {RefObject} from 'react';
import type {EquipmentStatus, SyncMode} from '../types/equipment';
import {PWAInstallButton} from './PWAInstallButton';

export type StatusFilter = 'ALL' | EquipmentStatus;

interface StickyHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  searchInputRef: RefObject<HTMLInputElement | null>;
  statusFilter: StatusFilter;
  onStatusFilterChange: (next: StatusFilter) => void;
  counts: {
    RUNNING: number;
    STANDBY: number;
    IGNORE: number;
  };
  syncMode: SyncMode;
  isOnline: boolean;
  onPWAInstalled: () => void;
}

export function StickyHeader({
  searchQuery,
  onSearchChange,
  searchInputRef,
  statusFilter,
  onStatusFilterChange,
  counts,
  syncMode,
  isOnline,
  onPWAInstalled,
}: StickyHeaderProps) {
  const toggleFilter = (target: EquipmentStatus) => {
    onStatusFilterChange(statusFilter === target ? 'ALL' : target);
  };

  const renderSyncBadge = () => {
    if (!isOnline) {
      return (
        <div
          className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-amber-500/35 bg-amber-500/10 px-2 py-1 text-[11px] font-medium text-amber-300 whitespace-nowrap"
          title="Offline Mode — Local cache active, updates will sync on reconnect"
        >
          <WifiOff className="h-3 w-3 shrink-0" aria-hidden="true" />
          <span>Offline Mode</span>
        </div>
      );
    }

    if (syncMode === 'firestore') {
      return (
        <div
          className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-emerald-500/35 bg-emerald-500/10 px-2 py-1 text-[11px] font-medium text-emerald-300 whitespace-nowrap"
          title="Live Sync — Connected to Cloud Firestore"
        >
          <Cloud className="h-3 w-3 shrink-0" aria-hidden="true" />
          <span>Live Sync</span>
        </div>
      );
    }

    return (
      <div
        className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-[#334155] bg-[#1e293b] px-2 py-1 text-[11px] font-medium text-slate-300 whitespace-nowrap"
        title="Running in local browser storage mode"
      >
        <Database className="h-3 w-3 shrink-0 text-emerald-400" aria-hidden="true" />
        <span>Local Sync</span>
      </div>
    );
  };

  return (
    <header className="sticky top-0 z-30 border-b border-[#334155] bg-[#0f172a]/95 backdrop-blur-md">
      <div className="mx-auto max-w-5xl px-3 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2 sm:px-6 sm:pt-[max(0.75rem,env(safe-area-inset-top))] sm:pb-3">
        {/* Top Row: Brand & Sync Indicator */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <Activity className="h-5 w-5 shrink-0 text-[#10b981]" aria-hidden="true" />
            <h1 className="truncate font-display text-xl font-bold tracking-wide text-slate-100 sm:text-2xl">
              Running Status Checker
            </h1>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <PWAInstallButton onInstalled={onPWAInstalled} />
            {renderSyncBadge()}
          </div>
        </div>

        {/* Bottom Row: Search Input & Compact Summary Counters */}
        <div className="mt-2 flex flex-col gap-2 sm:mt-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              ref={searchInputRef}
              type="search"
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search tag (e.g. GA101, GB302)..."
              aria-label="Filter equipment by tag code"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="characters"
              spellCheck={false}
              className="h-10 w-full rounded-lg border border-[#334155] bg-[#1e293b] pr-9 pl-9 font-mono text-base text-slate-100 placeholder:font-sans placeholder:text-sm placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
            />
            {searchQuery.length > 0 && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute top-1/2 right-1.5 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-[#0f172a] hover:text-slate-100"
                aria-label="Clear search filter"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            )}
          </div>

          {/* Interactive Compact Status Counters */}
          <div
            className="grid grid-cols-3 gap-1.5 sm:flex sm:shrink-0 sm:items-center"
            role="group"
            aria-label="Filter equipment by status"
          >
            <button
              type="button"
              onClick={() => toggleFilter('RUNNING')}
              aria-pressed={statusFilter === 'RUNNING'}
              className={`flex min-h-[34px] items-center justify-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap sm:min-h-[40px] sm:px-3 ${
                statusFilter === 'RUNNING'
                  ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                  : 'border-[#334155] bg-[#1e293b] text-slate-300 hover:border-slate-500'
              }`}
            >
              <span className="text-[11px] font-semibold tracking-wider text-emerald-400">
                RUNNING
              </span>
              <span className="font-mono font-bold text-slate-100 tabular-nums">
                {counts.RUNNING}
              </span>
            </button>

            <button
              type="button"
              onClick={() => toggleFilter('STANDBY')}
              aria-pressed={statusFilter === 'STANDBY'}
              className={`flex min-h-[34px] items-center justify-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap sm:min-h-[40px] sm:px-3 ${
                statusFilter === 'STANDBY'
                  ? 'border-amber-500 bg-amber-500/20 text-amber-300'
                  : 'border-[#334155] bg-[#1e293b] text-slate-300 hover:border-slate-500'
              }`}
            >
              <span className="text-[11px] font-semibold tracking-wider text-amber-400">
                STANDBY
              </span>
              <span className="font-mono font-bold text-slate-100 tabular-nums">
                {counts.STANDBY}
              </span>
            </button>

            <button
              type="button"
              onClick={() => toggleFilter('IGNORE')}
              aria-pressed={statusFilter === 'IGNORE'}
              className={`flex min-h-[34px] items-center justify-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap sm:min-h-[40px] sm:px-3 ${
                statusFilter === 'IGNORE'
                  ? 'border-red-500/70 bg-red-500/15 text-red-300'
                  : 'border-[#334155] bg-[#1e293b] text-slate-300 hover:border-slate-500'
              }`}
            >
              <span className="text-[11px] font-semibold tracking-wider text-red-400">
                IGNORE
              </span>
              <span className="font-mono font-bold text-slate-100 tabular-nums">
                {counts.IGNORE}
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
