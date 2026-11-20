import {Ban, Clock, Pause, Play} from 'lucide-react';
import {memo} from 'react';
import type {EquipmentRecord, EquipmentStatus} from '../types/equipment';
import {formatRelativeTime, formatTime24} from '../utils/time';

interface EquipmentRowProps {
  equipment: EquipmentRecord;
  now: number;
  onStatusChange: (tag: string, nextStatus: EquipmentStatus) => void;
}

const STATUS_OPTIONS: readonly {
  value: EquipmentStatus;
  label: string;
  Icon: typeof Play;
  activePillClass: string;
  activeTextClass: string;
  translateClass: string;
}[] = [
  {
    value: 'RUNNING',
    label: 'RUNNING',
    Icon: Play,
    activePillClass: 'bg-emerald-500 shadow-sm',
    activeTextClass: 'font-bold text-slate-950',
    translateClass: 'translate-x-0',
  },
  {
    value: 'STANDBY',
    label: 'STANDBY',
    Icon: Pause,
    activePillClass: 'bg-amber-500 shadow-sm',
    activeTextClass: 'font-bold text-slate-950',
    translateClass: 'translate-x-full',
  },
  {
    value: 'IGNORE',
    label: 'IGNORE',
    Icon: Ban,
    activePillClass: 'bg-slate-600 shadow-sm',
    activeTextClass: 'font-bold text-white',
    translateClass: 'translate-x-[200%]',
  },
];

export const EquipmentRow = memo(function EquipmentRow({
  equipment,
  now,
  onStatusChange,
}: EquipmentRowProps) {
  const time24 = formatTime24(equipment.updatedAt);
  const relative = formatRelativeTime(equipment.updatedAt, now);
  const activeOption =
    STATUS_OPTIONS.find((option) => option.value === equipment.status) ?? STATUS_OPTIONS[0];

  return (
    <li className="flex flex-col gap-2.5 rounded-xl border border-[#334155] bg-[#1e293b] px-3.5 py-3 transition-colors duration-150 hover:border-slate-500/80 md:flex-row md:items-center md:justify-between md:gap-4 md:px-4">
      {/* Top Row (Mobile) / Left Column (Desktop): Enlarged Tag & Inline Right Timestamp */}
      <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
        <div className="truncate font-mono text-lg font-bold tracking-tight text-slate-100 tabular-nums">
          {equipment.tag}
        </div>
        <div className="flex shrink-0 items-center gap-1.5 text-xs text-slate-400 tabular-nums">
          {equipment.hasPendingWrites ? (
            <Clock
              className="h-3.5 w-3.5 shrink-0 animate-pulse text-amber-400"
              aria-label="Syncing status update"
            />
          ) : (
            <Clock className="h-3.5 w-3.5 shrink-0 text-slate-500" aria-hidden="true" />
          )}
          <span>{time24}</span>
          <span aria-hidden="true">·</span>
          <span>{relative}</span>
        </div>
      </div>

      {/* Smooth Sliding 3-State Status Selector */}
      <div
        role="group"
        aria-label={`Status selector for ${equipment.tag}`}
        className="overflow-hidden rounded-lg border border-[#334155] bg-[#0f172a] p-1 md:w-[320px] md:shrink-0"
      >
        <div className="relative grid grid-cols-3 overflow-hidden rounded-md">
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute inset-y-0 left-0 w-1/3 rounded-md transition-all duration-200 ease-out ${activeOption.translateClass} ${activeOption.activePillClass}`}
          />

          {STATUS_OPTIONS.map(({value, label, Icon, activeTextClass}) => {
            const isActive = equipment.status === value;
            return (
              <button
                key={value}
                type="button"
                aria-pressed={isActive}
                onClick={() => {
                  if (!isActive) {
                    onStatusChange(equipment.tag, value);
                  }
                }}
                className={`relative z-10 flex min-h-[42px] items-center justify-center gap-1.5 rounded-md px-2 text-[12.5px] font-bold tracking-wide transition-colors duration-150 active:scale-95 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-emerald-400 sm:min-h-[38px] ${
                  isActive ? activeTextClass : 'text-slate-300 hover:text-white'
                }`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0 stroke-[2.5]" aria-hidden="true" />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </li>
  );
});
