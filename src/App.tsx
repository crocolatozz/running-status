import {SearchX} from 'lucide-react';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {ChangelogModal} from './components/ChangelogModal';
import {EquipmentRow} from './components/EquipmentRow';
import {StickyHeader, type StatusFilter} from './components/StickyHeader';
import {ToastContainer} from './components/ToastContainer';
import {useOnlineStatus} from './hooks/useOnlineStatus';
import {useSmartPwaUpdate} from './hooks/useSmartPwaUpdate';
import {getSyncMode, subscribeEquipments, updateEquipmentStatus} from './services/firebase';
import type {
  EquipmentRecord,
  EquipmentStatus,
  FirestoreSyncMetadata,
  ToastItem,
  ToastVariant,
} from './types/equipment';
import {formatTime24} from './utils/time';

const TAP_COOLDOWN_MS = 400;

function normalizeTagForSearch(value: string): string {
  return value.replace(/[-\s]+/g, '').toUpperCase();
}

export default function App() {
  const [equipments, setEquipments] = useState<EquipmentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [isChangelogOpen, setIsChangelogOpen] = useState(false);
  const [syncMetadata, setSyncMetadata] = useState<FirestoreSyncMetadata>({
    fromCache: false,
    hasPendingWrites: false,
  });

  const appRootRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const toastTimersRef = useRef<Map<string, number>>(new Map());
  const lastTapByTagRef = useRef<Map<string, number>>(new Map());
  const equipmentsRef = useRef<EquipmentRecord[]>(equipments);
  equipmentsRef.current = equipments;

  const isOnline = useOnlineStatus();
  const syncMode = getSyncMode();

  const dismissToast = useCallback((id: string) => {
    const timer = toastTimersRef.current.get(id);
    if (timer !== undefined) {
      window.clearTimeout(timer);
      toastTimersRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const pushToast = useCallback(
    (variant: ToastVariant, title: string, message?: string) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev.slice(-2), {id, variant, title, message}]);

      const timer = window.setTimeout(() => {
        dismissToast(id);
      }, 2600);
      toastTimersRef.current.set(id, timer);
    },
    [dismissToast],
  );

  const hasAnyPendingWrites = useMemo(
    () =>
      syncMetadata.hasPendingWrites ||
      equipments.some((item) => Boolean(item.hasPendingWrites)),
    [equipments, syncMetadata.hasPendingWrites],
  );

  const {
    updateAvailable,
    isCheckingUpdate,
    isReloadingForUpdate,
    checkForUpdates,
  } = useSmartPwaUpdate({
    hasPendingWrites: hasAnyPendingWrites,
    pushToast,
  });

  useEffect(() => {
    const timersMap = toastTimersRef.current;
    return () => {
      timersMap.forEach((timerId) => window.clearTimeout(timerId));
      timersMap.clear();
    };
  }, []);

  // Safari bfcache guard: explicitly enforce opacity = '1' when resuming from background
  useEffect(() => {
    const handlePageShow = () => {
      if (appRootRef.current) {
        appRootRef.current.style.opacity = '1';
      }
    };

    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeEquipments(
      (records, metadata) => {
        setEquipments(records);
        setSyncMetadata(metadata);
        setIsLoading(false);
      },
      (err) => {
        setIsLoading(false);
        pushToast('error', `Firestore error (${err.code})`, err.message);
      },
    );

    return () => unsubscribe();
  }, [pushToast]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === '/' &&
        !isChangelogOpen &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isChangelogOpen]);

  const filteredEquipments = useMemo(() => {
    const normalizedQuery = normalizeTagForSearch(searchQuery);
    return equipments.filter((item) => {
      const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        normalizeTagForSearch(item.tag).includes(normalizedQuery);
      return matchesStatus && matchesQuery;
    });
  }, [equipments, searchQuery, statusFilter]);

  const handleStatusChange = useCallback(
    (tag: string, nextStatus: EquipmentStatus) => {
      const currentRecord = equipmentsRef.current.find((item) => item.tag === tag);
      if (currentRecord?.status === nextStatus) {
        return;
      }

      const tapTimestamp = Date.now();
      const lastTap = lastTapByTagRef.current.get(tag) ?? 0;
      if (tapTimestamp - lastTap < TAP_COOLDOWN_MS) {
        return;
      }
      lastTapByTagRef.current.set(tag, tapTimestamp);

      setEquipments((prev) =>
        prev.map((item) =>
          item.tag === tag
            ? {
                ...item,
                status: nextStatus,
                updatedAt: tapTimestamp,
                hasPendingWrites: syncMode === 'firestore',
              }
            : item,
        ),
      );

      const variant: ToastVariant =
        nextStatus === 'RUNNING' ? 'running' : nextStatus === 'STANDBY' ? 'standby' : 'ignore';

      pushToast(
        variant,
        `${tag} set to ${nextStatus}`,
        isOnline
          ? `Updated at ${formatTime24(tapTimestamp)}`
          : `Queued offline at ${formatTime24(tapTimestamp)}`,
      );

      updateEquipmentStatus(tag, nextStatus, (err) => {
        pushToast('error', `Sync error on ${tag} (${err.code})`, err.message);
      });
    },
    [isOnline, pushToast, syncMode],
  );

  const hasActiveFilter = searchQuery.trim().length > 0 || statusFilter !== 'ALL';

  return (
    <div
      ref={appRootRef}
      className="app-shell app-fade-in flex flex-col bg-[#0f172a] text-slate-100"
      style={{paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1.5rem)'}}
    >
      <StickyHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchInputRef={searchInputRef}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        syncMode={syncMode}
        isOnline={isOnline}
        syncMetadata={syncMetadata}
        updateAvailable={updateAvailable}
        isCheckingUpdate={isCheckingUpdate}
        isReloadingForUpdate={isReloadingForUpdate}
        onOpenChangelog={() => setIsChangelogOpen(true)}
      />

      <main className="mx-auto w-full max-w-5xl flex-1 px-3 pt-4 pb-6 sm:px-6 sm:pt-6">
        <div className="mb-3 flex items-center justify-between gap-2 sm:mb-4">
          <h2 className="font-display text-lg font-bold tracking-wide text-slate-100 sm:text-xl">
            Urea 1B Equipment List
          </h2>
          <span className="text-xs font-medium text-slate-400 tabular-nums whitespace-nowrap">
            {hasActiveFilter
              ? `${filteredEquipments.length} of ${equipments.length} units`
              : `${equipments.length} units`}
          </span>
        </div>

        {isLoading ? (
          <ul className="space-y-2.5" aria-label="Loading equipment list">
            {Array.from({length: 8}).map((_, idx) => (
              <li
                key={idx}
                className="flex flex-col gap-2.5 rounded-xl border border-[#334155] bg-[#1e293b] px-4 py-3 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex flex-1 items-center justify-between gap-2">
                  <div className="h-5 w-32 rounded bg-slate-700/60" />
                  <div className="h-3.5 w-24 rounded bg-slate-700/40" />
                </div>
                <div className="h-11 w-full rounded-lg bg-[#0f172a] md:w-[320px]" />
              </li>
            ))}
          </ul>
        ) : filteredEquipments.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-[#334155] bg-[#1e293b] px-6 py-12 text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#334155] bg-[#0f172a] text-slate-400">
              <SearchX className="h-5 w-5" aria-hidden="true" />
            </div>
            <h3 className="mt-3 font-display text-lg font-bold tracking-wide text-slate-100">
              No matching equipment
            </h3>
            <p className="mt-1 max-w-sm text-xs text-slate-400 sm:text-sm">
              No Urea 1B equipment tags match your current search or status filter.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('ALL');
              }}
              className="mt-4 inline-flex min-h-[40px] items-center justify-center rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 transition-colors hover:bg-emerald-400 active:scale-95"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <ul className="space-y-2.5" aria-label="Urea 1B equipment statuses">
            {filteredEquipments.map((equipment) => (
              <EquipmentRow
                key={equipment.tag}
                equipment={equipment}
                onStatusChange={handleStatusChange}
              />
            ))}
          </ul>
        )}
      </main>

      <footer className="mx-auto w-full max-w-5xl px-3 pt-2 sm:px-6">
        <div className="border-t border-[#334155]/70 pt-4 text-center text-xs text-slate-500">
          <span>©2026 — Developed by FIKRI</span>
        </div>
      </footer>

      <ChangelogModal
        isOpen={isChangelogOpen}
        onClose={() => setIsChangelogOpen(false)}
        updateAvailable={updateAvailable}
        isCheckingUpdate={isCheckingUpdate}
        isReloadingForUpdate={isReloadingForUpdate}
        onCheckUpdate={checkForUpdates}
      />

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
