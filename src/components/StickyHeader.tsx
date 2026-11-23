import {Cloud, Database, RefreshCw, Search, WifiOff, X} from 'lucide-react';
import type {RefObject} from 'react';
import {APP_VERSION} from '../data/urea1bEquipments';
import type {EquipmentStatus, FirestoreSyncMetadata, SyncMode} from '../types/equipment';

export type StatusFilter = 'ALL' | EquipmentStatus;

interface StickyHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  searchInputRef: RefObject<HTMLInputElement | null>;
  statusFilter: StatusFilter;
  onStatusFilterChange: (next: StatusFilter) => void;
  syncMode: SyncMode;
  isOnline: boolean;
  syncMetadata: FirestoreSyncMetadata;
  updateAvailable: boolean;
  isCheckingUpdate: boolean;
  isReloadingForUpdate: boolean;
  onOpenChangelog: () => void;
}

const FILTER_TABS: readonly {
  value: StatusFilter;
  label: string;
  activeClass: string;
}[] = [
  {
    value: 'ALL',
    label: 'ALL',
    activeClass: 'border-blue-500 bg-blue-500/15 text-blue-300',
  },
  {
    value: 'RUNNING',
    label: 'RUNNING',
    activeClass: 'border-emerald-500 bg-emerald-500/15 text-emerald-300',
  },
  {
    value: 'STANDBY',
    label: 'STANDBY',
    activeClass: 'border-amber-500 bg-amber-500/15 text-amber-300',
  },
  {
    value: 'IGNORE',
    label: 'IGNORE',
    activeClass: 'border-slate-400 bg-slate-500/20 text-slate-200',
  },
];

export function StickyHeader({
  searchQuery,
  onSearchChange,
  searchInputRef,
  statusFilter,
  onStatusFilterChange,
  syncMode,
  isOnline,
  syncMetadata,
  updateAvailable,
  isCheckingUpdate,
  isReloadingForUpdate,
  onOpenChangelog,
}: StickyHeaderProps) {
  const hasPendingUpdate = updateAvailable || isReloadingForUpdate;

  const renderSyncBadge = () => {
    if (syncMode !== 'firestore') {
      return (
        <div
          className="inline-flex shrink-0 items-center gap-1 rounded-md border border-[#334155] bg-[#1e293b] px-2 py-1 text-[11px] font-medium text-slate-300 whitespace-nowrap sm:gap-1.5"
          title="Running in local browser storage mode"
        >
          <Database className="h-3 w-3 shrink-0 text-emerald-400" aria-hidden="true" />
          <span>Local Sync</span>
        </div>
      );
    }

    if (!isOnline) {
      return (
        <div
          className="inline-flex shrink-0 items-center gap-1 rounded-md border border-orange-500/35 bg-orange-500/10 px-2 py-1 text-[11px] font-medium text-orange-300 whitespace-nowrap sm:gap-1.5"
          title="Offline Mode — Cached data active, updates queued locally"
        >
          <WifiOff className="h-3 w-3 shrink-0" aria-hidden="true" />
          <span>Offline Mode</span>
        </div>
      );
    }

    if (syncMetadata.hasPendingWrites) {
      return (
        <div
          className="inline-flex shrink-0 animate-pulse items-center gap-1 rounded-md border border-amber-500/35 bg-amber-500/10 px-2 py-1 text-[11px] font-medium text-amber-300 whitespace-nowrap sm:gap-1.5"
          title="Syncing pending updates to Cloud Firestore"
        >
          <RefreshCw className="h-3 w-3 shrink-0" aria-hidden="true" />
          <span>Syncing...</span>
        </div>
      );
    }

    if (syncMetadata.fromCache) {
      return (
        <div
          className="inline-flex shrink-0 items-center gap-1 rounded-md border border-orange-500/35 bg-orange-500/10 px-2 py-1 text-[11px] font-medium text-orange-300 whitespace-nowrap sm:gap-1.5"
          title="Serving cached snapshot — awaiting live server sync"
        >
          <WifiOff className="h-3 w-3 shrink-0" aria-hidden="true" />
          <span>Offline Mode</span>
        </div>
      );
    }

    return (
      <div
        className="inline-flex shrink-0 items-center gap-1 rounded-md border border-emerald-500/35 bg-emerald-500/10 px-2 py-1 text-[11px] font-medium text-emerald-300 whitespace-nowrap sm:gap-1.5"
        title="Live Sync — Connected to Cloud Firestore"
      >
        <Cloud className="h-3 w-3 shrink-0" aria-hidden="true" />
        <span>Live Sync</span>
      </div>
    );
  };

  return (
    <header
      className="sticky top-0 z-30 border-b border-[#334155] bg-[#0f172a]"
      style={{
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 26px)',
        paddingBottom: '0.75rem',
      }}
    >
      <div className="mx-auto max-w-5xl px-3 sm:px-6">
        {/* Top Row: Unified Pulse SVG + Brand Title + Version Pill & Sync Telemetry */}
        <div className="flex items-center justify-between gap-1.5 sm:gap-2.5">
          <div className="flex min-w-0 items-center gap-1.5 sm:gap-2.5">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-5 w-5 shrink-0 text-[#10b981] sm:h-7 sm:w-7"
              aria-hidden="true"
            >
              <path
                d="M2 12H5.5L8 5L12 19L15.5 9L18 12H22"
                stroke="currentColor"
                strokeWidth="2.25"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <h1 className="truncate font-display text-lg font-bold tracking-tight text-slate-100 sm:text-2xl">
              Running Status
            </h1>
            <button
              type="button"
              onClick={onOpenChangelog}
              aria-label={
                hasPendingUpdate
                  ? `Version ${APP_VERSION} — update ready, open changelog`
                  : `Version ${APP_VERSION} — open changelog and check for updates`
              }
              title={
                hasPendingUpdate
                  ? 'Update ready — waiting for safe idle/sync window'
                  : 'View changelog & check for updates'
              }
              className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[11px] font-semibold tabular-nums transition-colors active:scale-95 whitespace-nowrap ${
                hasPendingUpdate
                  ? 'border-amber-500/60 bg-amber-500/15 text-amber-300 hover:bg-amber-500/25'
                  : 'border-[#334155] bg-[#1e293b] text-slate-300 hover:border-slate-500 hover:text-slate-100'
              }`}
            >
              <span>v{APP_VERSION}</span>
              <RefreshCw
                className={`h-2.5 w-2.5 shrink-0 ${
                  isCheckingUpdate || hasPendingUpdate ? 'animate-spin' : ''
                }`}
                aria-hidden="true"
              />
            </button>
          </div>

          <div className="flex shrink-0 items-center">{renderSyncBadge()}</div>
        </div>

        {/* Bottom Row: Search Input & 4 Proportional Filter Tabs */}
        <div className="mt-2.5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
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
              placeholder="Search equipment tag (e.g. GA101, GB302)..."
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

          <div
            className="grid grid-cols-4 gap-1.5 sm:w-[340px] sm:shrink-0"
            role="group"
            aria-label="Filter equipment by status"
          >
            {FILTER_TABS.map(({value, label, activeClass}) => {
              const isActive = statusFilter === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => onStatusFilterChange(value)}
                  aria-pressed={isActive}
                  className={`flex min-h-[38px] items-center justify-center rounded-lg border px-1.5 text-xs font-extrabold tracking-wide transition-colors active:scale-95 whitespace-nowrap sm:min-h-[40px] ${
                    isActive
                      ? activeClass
                      : 'border-[#334155] bg-[#1e293b] text-slate-200 hover:border-slate-500 hover:text-white'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
}
