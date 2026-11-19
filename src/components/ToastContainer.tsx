import {AlertTriangle, CheckCircle2, Info, X} from 'lucide-react';
import type {ToastItem, ToastVariant} from '../types/equipment';

interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

const VARIANT_STYLES: Record<
  ToastVariant,
  {
    container: string;
    iconColor: string;
    Icon: typeof CheckCircle2;
  }
> = {
  success: {
    container: 'border-emerald-500/35 bg-[#1e293b]/95',
    iconColor: 'text-emerald-400',
    Icon: CheckCircle2,
  },
  info: {
    container: 'border-sky-500/35 bg-[#1e293b]/95',
    iconColor: 'text-sky-400',
    Icon: Info,
  },
  warning: {
    container: 'border-amber-500/40 bg-[#1e293b]/95',
    iconColor: 'text-amber-400',
    Icon: AlertTriangle,
  },
};

export function ToastContainer({toasts, onDismiss}: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-[max(1rem,env(safe-area-inset-bottom))] z-50 flex flex-col items-center gap-2 px-4 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-full sm:max-w-sm sm:items-end sm:px-0"
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map((toast) => {
        const style = VARIANT_STYLES[toast.variant];
        const Icon = style.Icon;

        return (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border px-3.5 py-2.5 shadow-xl shadow-slate-950/60 backdrop-blur-md transition-all duration-150 ${style.container}`}
          >
            <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${style.iconColor}`} aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-100 sm:text-sm">{toast.title}</p>
              {toast.message && (
                <p className="mt-0.5 truncate text-xs text-slate-400">{toast.message}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-[#0f172a] hover:text-slate-100"
              aria-label="Dismiss notification"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
