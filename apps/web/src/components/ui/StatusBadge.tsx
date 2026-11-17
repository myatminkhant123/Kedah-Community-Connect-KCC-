import type { ReportPriority, ReportStatus } from '@kcc/shared';

const STATUS_STYLES: Record<ReportStatus, string> = {
  SUBMITTED: 'bg-slate-100 text-slate-800 border-slate-300',
  UNDER_REVIEW: 'bg-amber-50 text-amber-800 border-amber-300',
  ASSIGNED: 'bg-sky-50 text-sky-800 border-sky-300',
  IN_PROGRESS: 'bg-indigo-50 text-indigo-800 border-indigo-300',
  RESOLVED: 'bg-emerald-50 text-emerald-800 border-emerald-300',
  REJECTED: 'bg-rose-50 text-rose-800 border-rose-300',
  CANCELLED: 'bg-zinc-100 text-zinc-700 border-zinc-300',
  REOPENED: 'bg-orange-50 text-orange-800 border-orange-300',
};

const PRIORITY_STYLES: Record<ReportPriority, string> = {
  LOW: 'bg-slate-100 text-slate-700',
  NORMAL: 'bg-blue-50 text-blue-700',
  HIGH: 'bg-amber-100 text-amber-800',
  URGENT: 'bg-rose-100 text-rose-800',
};

export function StatusBadge({ status }: { status: ReportStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[status]}`}
    >
      {status.replace(/_/g, ' ')}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: ReportPriority }) {
  return (
    <span
      className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${PRIORITY_STYLES[priority]}`}
    >
      {priority}
    </span>
  );
}
