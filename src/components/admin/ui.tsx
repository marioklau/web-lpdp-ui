import type { ReactNode } from 'react';
import { CheckCircle2, Info, XCircle, type LucideIcon } from 'lucide-react';
import type { SaveResult } from '@/lib/contentContext';

export const inputClass =
  'w-full rounded-lg border border-navy-200 bg-white px-3.5 py-2.5 text-sm text-navy-900 outline-none transition focus:border-navy-500 focus:ring-2 focus:ring-navy-500/20';

export const textareaClass = `${inputClass} resize-y`;

export const btnPrimary =
  'inline-flex items-center justify-center gap-2 rounded-lg bg-navy-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-800 disabled:cursor-not-allowed disabled:opacity-60';

export const btnGold =
  'inline-flex items-center justify-center gap-2 rounded-lg bg-gold-400 px-5 py-2.5 text-sm font-semibold text-navy-900 transition hover:bg-gold-300 disabled:cursor-not-allowed disabled:opacity-60';

export const btnGhost =
  'inline-flex items-center justify-center gap-2 rounded-lg border border-navy-200 px-4 py-2 text-sm font-medium text-navy-700 transition hover:bg-navy-50';

export const btnDanger =
  'inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50';

export function SectionHeader({
  title,
  desc,
  action,
}: {
  title: string;
  desc?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h2 className="font-serif text-xl font-semibold text-navy-900">{title}</h2>
        {desc && <p className="mt-1 text-sm text-navy-600">{desc}</p>}
      </div>
      {action}
    </div>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-navy-800">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-navy-500">{hint}</span>}
    </label>
  );
}

export function SaveStatus({ result }: { result: SaveResult | null }) {
  if (!result) return null;

  let Icon: LucideIcon = CheckCircle2;
  let tone = 'border-emerald-200 bg-emerald-50 text-emerald-700';
  if (!result.ok) {
    Icon = XCircle;
    tone = 'border-red-200 bg-red-50 text-red-700';
  } else if (!result.persisted) {
    Icon = Info;
    tone = 'border-gold-200 bg-gold-50 text-gold-800';
  }

  return (
    <div className={`mt-4 flex items-start gap-2 rounded-lg border px-4 py-3 text-sm ${tone}`}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{result.message}</span>
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <p className="rounded-xl border border-dashed border-navy-200 px-4 py-10 text-center text-sm text-navy-500">
      {message}
    </p>
  );
}
