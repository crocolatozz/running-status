import {ChevronDown, RefreshCw, X} from 'lucide-react';
import {useEffect, useState} from 'react';
import {CHANGELOG_ENTRIES} from '../data/changelog';
import {APP_VERSION} from '../data/urea1bEquipments';

interface ChangelogModalProps {
  isOpen: boolean;
  onClose: () => void;
  updateAvailable: boolean;
  isCheckingUpdate: boolean;
  isReloadingForUpdate: boolean;
  onCheckUpdate: () => void;
}

export function ChangelogModal({
  isOpen,
  onClose,
  updateAvailable,
  isCheckingUpdate,
  isReloadingForUpdate,
  onCheckUpdate,
}: ChangelogModalProps) {
  const [expandedVersions, setExpandedVersions] = useState<Set<string>>(
    () => new Set([APP_VERSION]),
  );

  // Reset accordion state when modal opens so the latest version is expanded and older ones collapsed
  useEffect(() => {
    if (isOpen) {
      setExpandedVersions(new Set([APP_VERSION]));
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const toggleVersion = (version: string) => {
    setExpandedVersions((prev) => {
      const next = new Set(prev);
      if (next.has(version)) {
        next.delete(version);
      } else {
        next.add(version);
      }
      return next;
    });
  };

  const hasPendingUpdate = updateAvailable || isReloadingForUpdate;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-3 backdrop-blur-xs sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="changelog-modal-title"
      onClick={onClose}
    >
      <div
        className="flex max-h-[84dvh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-[#334155] bg-[#0f172a] shadow-2xl shadow-slate-950/90"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between gap-3 border-b border-[#334155] bg-[#0f172a] px-4 py-3.5 sm:px-5">
          <div className="flex min-w-0 items-center gap-2">
            <h2
              id="changelog-modal-title"
              className="truncate font-display text-lg font-bold tracking-wide text-slate-100 sm:text-xl"
            >
              Changelog
            </h2>
            <span className="inline-flex shrink-0 items-center rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 font-mono text-[11px] font-semibold text-emerald-300 tabular-nums">
              v{APP_VERSION}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#334155] bg-[#1e293b] text-slate-300 transition-colors hover:border-slate-500 hover:text-white active:scale-95"
            aria-label="Close changelog modal"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* Top Action Bar: Manual Check Update */}
        <div className="flex items-center justify-between gap-3 border-b border-[#334155]/80 bg-[#1e293b]/55 px-4 py-3 sm:px-5">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-200">
              {hasPendingUpdate ? 'New version ready to install' : `Running Status v${APP_VERSION}`}
            </p>
            <p className="truncate text-[11px] text-slate-400">
              {hasPendingUpdate
                ? 'Waiting for safe idle & Firestore sync window...'
                : 'Check Service Worker for the latest release'}
            </p>
          </div>

          <button
            type="button"
            onClick={onCheckUpdate}
            disabled={isCheckingUpdate || isReloadingForUpdate}
            className={`inline-flex min-h-[36px] shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold tracking-wide transition-colors active:scale-95 disabled:cursor-not-allowed disabled:opacity-70 whitespace-nowrap ${
              hasPendingUpdate
                ? 'border-amber-500/60 bg-amber-500/15 text-amber-300'
                : 'border-emerald-500/50 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25'
            }`}
          >
            <RefreshCw
              className={`h-3.5 w-3.5 shrink-0 ${
                isCheckingUpdate || hasPendingUpdate ? 'animate-spin' : ''
              }`}
              aria-hidden="true"
            />
            <span>
              {isReloadingForUpdate
                ? 'Reloading...'
                : isCheckingUpdate
                  ? 'Checking...'
                  : hasPendingUpdate
                    ? 'Update Ready'
                    : 'Check Update'}
            </span>
          </button>
        </div>

        {/* Accordion Changelog Body */}
        <div className="flex-1 space-y-2 overflow-y-auto overscroll-contain px-4 py-3.5 sm:px-5">
          {CHANGELOG_ENTRIES.map((entry) => {
            const isExpanded = expandedVersions.has(entry.version);
            const isCurrent = entry.version === APP_VERSION;

            return (
              <div
                key={entry.version}
                className={`overflow-hidden rounded-xl border transition-colors ${
                  isCurrent
                    ? 'border-emerald-500/35 bg-[#1e293b]/90'
                    : 'border-[#334155] bg-[#1e293b]/60'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleVersion(entry.version)}
                  aria-expanded={isExpanded}
                  className="flex w-full items-center justify-between gap-2 px-3.5 py-2.5 text-left transition-colors hover:bg-[#1e293b]"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="font-mono text-sm font-bold text-slate-100 tabular-nums">
                      v{entry.version}
                    </span>
                    <span
                      className={`rounded-md border px-1.5 py-0.5 text-[10px] font-bold tracking-wider uppercase ${
                        isCurrent
                          ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
                          : 'border-[#334155] bg-[#0f172a] text-slate-400'
                      }`}
                    >
                      {entry.tag}
                    </span>
                  </div>

                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${
                      isExpanded ? 'rotate-180 text-slate-200' : ''
                    }`}
                    aria-hidden="true"
                  />
                </button>

                {isExpanded && (
                  <ul className="space-y-1.5 border-t border-[#334155]/70 px-3.5 py-3 text-xs leading-relaxed text-slate-300">
                    {entry.changes.map((change, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span
                          className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                            isCurrent ? 'bg-emerald-400' : 'bg-slate-500'
                          }`}
                          aria-hidden="true"
                        />
                        <span>{change}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
