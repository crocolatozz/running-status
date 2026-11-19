import {Download} from 'lucide-react';
import {usePWAInstall} from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  onInstalled?: () => void;
  onOpenIOSGuide: () => void;
}

export function PWAInstallButton({onInstalled, onOpenIOSGuide}: PWAInstallButtonProps) {
  const {isInstallable, isInstalled, isIOS, install} = usePWAInstall();

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
        className="inline-flex min-h-[34px] shrink-0 items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400 transition-colors hover:bg-emerald-500/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 active:scale-95 whitespace-nowrap"
        aria-label="Install Running Status Checker app"
      >
        <Download className="h-3.5 w-3.5" aria-hidden="true" />
        <span>Install</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <button
        type="button"
        onClick={onOpenIOSGuide}
        className="inline-flex min-h-[34px] shrink-0 items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400 transition-colors hover:bg-emerald-500/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 active:scale-95 whitespace-nowrap"
        aria-label="Install on iPhone or iPad"
      >
        <Download className="h-3.5 w-3.5" aria-hidden="true" />
        <span>Install</span>
      </button>
    );
  }

  return null;
}
