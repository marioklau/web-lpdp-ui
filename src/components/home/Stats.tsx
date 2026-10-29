import { UserCheck, BadgeCheck, Map as MapIcon, CalendarClock } from 'lucide-react';
import { useContent } from '@/lib/contentContext';
import type { StatItem } from '@/types';

const icons: Record<string, typeof UserCheck> = {
  s1: UserCheck,
  s2: BadgeCheck,
  s3: MapIcon,
  s4: CalendarClock,
};

function StatCard({ stat }: { stat: StatItem }) {
  const Icon = icons[stat.id] ?? BadgeCheck;
  return (
    <div className="relative rounded-2xl bg-white border border-navy-100 shadow-soft p-6 overflow-hidden">
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gold-400/10" />
      <span className="grid place-items-center h-11 w-11 rounded-xl bg-navy-900 text-gold-300 mb-4">
        <Icon className="h-5 w-5" />
      </span>
      <p className="font-serif text-3xl sm:text-4xl font-bold text-navy-900">
        {stat.value}
      </p>
      <p className="mt-1 text-sm text-navy-600">{stat.label}</p>
      {stat.isPlaceholder && (
        <p className="mt-2 text-[10px] uppercase tracking-wider text-gold-600 font-semibold">
          Data Contoh
        </p>
      )}
    </div>
  );
}

export default function Stats() {
  const { stats } = useContent();

  return (
    <section className="bg-navy-50 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-semibold uppercase tracking-wider text-gold-600">
            Statistik
          </span>
          <h2 className="mt-3 font-serif text-3xl sm:text-4xl font-semibold text-navy-900">
            Jejaring dalam Angka
          </h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <StatCard key={s.id} stat={s} />
          ))}
        </div>
      </div>
    </section>
  );
}
