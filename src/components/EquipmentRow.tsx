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
}[] = [
  {value: 'RUNNING', label: 'RUNNING', Icon: Play},
  {value: 'STANDBY', label: 'STANDBY', Icon: Pause},
  {value: 'IGNORE', label: 'IGNORE', Icon: Ban},
];

function getButtonClasses(option: EquipmentStatus, isActive: boolean): string {
  const base =
    'flex min-h-[42px] sm:min-h-[38px] items-center justify-center gap-1.5 rounded-md px-2.5 text-[11px] sm:text-xs tracking-wide transition-colors duration-150 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-emerald-400';

  if (!isActive) {
    return `${base} font-medium text-slate-400 hover:bg-slate-800/80 hover:text-slate-200`;
  }

  switch (option) {
    case 'RUNNING':
      return `${base} bg-[#10b981] font-semibold text-slate-950 shadow-sm`;
    case 'STANDBY':
      return `${base} bg-[#f59e0b] font-semibold text-slate-950 shadow-sm`;
    case 'IGNORE':
      return `${base} bg-[#64748b] font-semibold text-white ring-1 ring-[#ef4444]/70 shadow-sm`;
  }
}

export const EquipmentRow = memo(function EquipmentRow({
  equipment,
  now,
  onStatusChange,
}: EquipmentRowProps) {
  const time24 = formatTime24(equipment.updatedAt);
  const relative = formatRelativeTime(equipment.updatedAt, now);

  return (
    <li className="flex flex-col gap-2.5 rounded-xl border border-[#334155] bg-[#1e293b] px-3.5 py-3 transition-colors duration-150 hover:border-slate-500/80 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-4">
      <div className="min-w-0">
        <div className="font-mono text-[15px] font-bold tracking-tight text-slate-100 tabular-nums sm:text-base">
          {equipment.tag}
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-slate-400 tabular-nums">
          <Clock className="h-3 w-3 shrink-0 text-slate-500" aria-hidden="true" />
          <span>{time24}</span>
          <span aria-hidden="true">·</span>
          <span>{relative}</span>
          {equipment.hasPendingWrites && (
            <>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1 font-medium text-amber-400">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" aria-hidden="true" />
                <span>Pending sync</span>
              </span>
            </>
          )}
        </div>
      </div>

      <div
        role="group"
        aria-label={`Status selector for ${equipment.tag}`}
        className="grid grid-cols-3 gap-1 rounded-lg border border-[#334155] bg-[#0f172a] p-1 sm:w-[310px] sm:shrink-0"
      >
        {STATUS_OPTIONS.map(({value, label, Icon}) => {
          const isActive = equipment.status === value;
          const iconClass =
            isActive && value === 'IGNORE' ? 'h-3.5 w-3.5 shrink-0 text-red-300' : 'h-3.5 w-3.5 shrink-0';

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
              className={getButtonClasses(value, isActive)}
            >
              <Icon className={iconClass} aria-hidden="true" />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </li>
  );
});
