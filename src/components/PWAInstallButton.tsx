import {Download, Share, PlusSquare, X} from 'lucide-react';
import {useEffect, useState} from 'react';
import {usePWAInstall} from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  onInstalled?: () => void;
}

export function PWAInstallButton({onInstalled}: PWAInstallButtonProps) {
  const {isInstallable, isInstalled, isIOS, install} = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    if (!showIOSGuide) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowIOSGuide(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showIOSGuide]);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    const handleInstallClick = async () => {
      const accepted = await install();
      if (accepted) {
        onInstalled?.();
      }
    };

    return (
      <button
        type="button"
        onClick={handleInstallClick}
        className="inline-flex min-h-[36px] shrink-0 items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/15 px-3 py-1.5 text-xs font-medium text-emerald-300 transition-colors hover:bg-emerald-500/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 whitespace-nowrap"
        aria-label="Install Running Status Checker app"
      >
        <Download className="h-3.5 w-3.5" aria-hidden="true" />
        <span>Install</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className="inline-flex min-h-[36px] shrink-0 items-center gap-1.5 rounded-lg border border-[#334155] bg-[#1e293b] px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:border-slate-500 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 whitespace-nowrap"
          aria-label="How to install on iOS"
        >
          <Download className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
          <span>Install App</span>
        </button>

        {showIOSGuide && (
          <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/75 p-4 backdrop-blur-sm sm:items-center"
            onClick={() => setShowIOSGuide(false)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="ios-install-title"
          >
            <div
              className="w-full max-w-sm rounded-2xl border border-[#334155] bg-[#1e293b] p-5 shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-3">
                <h2
                  id="ios-install-title"
                  className="font-display text-xl font-bold tracking-wide text-slate-100"
                >
                  Install on iPhone / iPad
                </h2>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-[#0f172a] hover:text-slate-100"
                  aria-label="Close install instructions"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              <div className="mt-4 space-y-3 text-sm text-slate-300">
                <div className="flex items-center gap-3 rounded-xl border border-[#334155] bg-[#0f172a] p-3">
                  <Share className="h-5 w-5 shrink-0 text-emerald-400" aria-hidden="true" />
                  <p>
                    1. Tap the <span className="font-semibold text-white">Share</span> button in
                    Safari&apos;s toolbar.
                  </p>
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-[#334155] bg-[#0f172a] p-3">
                  <PlusSquare className="h-5 w-5 shrink-0 text-emerald-400" aria-hidden="true" />
                  <p>
                    2. Scroll down and select{' '}
                    <span className="font-semibold text-white">Add to Home Screen</span>.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 flex min-h-[44px] w-full items-center justify-center rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-400"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
}
