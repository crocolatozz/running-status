import {PlusSquare, Share, X} from 'lucide-react';
import {useEffect, useState} from 'react';

interface IOSInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function IOSInstallModal({isOpen, onClose}: IOSInstallModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsVisible(false);
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      setIsVisible(true);
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm transition-opacity duration-200 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="ios-install-title"
    >
      <div
        className={`w-full max-w-sm rounded-2xl border border-[#334155] bg-[#1e293b] p-5 shadow-2xl transition-all duration-200 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <h2
            id="ios-install-title"
            className="font-display text-xl font-bold tracking-wide text-slate-100"
          >
            Install on iPhone or iPad
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-[#0f172a] hover:text-slate-100"
            aria-label="Close install instructions"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <p className="mt-1.5 text-xs text-slate-400">
          Add Running Status Checker to your Home Screen for full-screen offline access.
        </p>

        <div className="mt-4 space-y-2.5 text-sm text-slate-300">
          <div className="flex items-center gap-3 rounded-xl border border-[#334155] bg-[#0f172a] p-3">
            <Share className="h-5 w-5 shrink-0 text-emerald-400" aria-hidden="true" />
            <p>
              1. Tap the <span className="font-semibold text-white">Share</span> button in Safari&apos;s
              toolbar.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-[#334155] bg-[#0f172a] p-3">
            <PlusSquare className="h-5 w-5 shrink-0 text-emerald-400" aria-hidden="true" />
            <p>
              2. Scroll down and tap{' '}
              <span className="font-semibold text-white">Add to Home Screen</span>.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-5 flex min-h-[44px] w-full items-center justify-center rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-400 active:scale-95"
        >
          Got It
        </button>
      </div>
    </div>
  );
}
