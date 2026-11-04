import { ArrowRight, Database, Handshake, HeartHandshake, MessageSquareText, Network, Sun, Users, type LucideIcon } from 'lucide-react';
import { useContent } from '@/lib/contentContext';
import type { Page } from '@/types';

interface StrategicProps {
  onNavigate: (page: Page, anchor?: string) => void;
}

const pillarIcons: Record<string, LucideIcon> = {
  Database,
  Users,
  Network,
  Sun,
  Handshake,
  HeartHandshake,
  MessageSquareText,
};

export default function Strategic({ onNavigate }: StrategicProps) {
  const { homepage } = useContent();

  return (
    <section id="strategi" className="bg-navy-900 py-16 text-white sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <span className="text-xs font-semibold uppercase tracking-wider text-gold-300">
            {homepage.strategicEyebrow}
          </span>
          <h2 className="mt-3 font-serif text-3xl font-semibold sm:text-4xl">
            {homepage.strategicTitle}
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-navy-100">
            {homepage.strategicLead}
          </p>
          {homepage.strategicNote && (
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-navy-300">
              {homepage.strategicNote}
            </p>
          )}
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {homepage.pillars.map((pillar, index) => {
            const Icon = pillarIcons[pillar.icon] ?? Database;
            return (
              <article
                key={pillar.id || pillar.title}
                className="flex flex-col rounded-3xl border border-white/10 bg-white/5 p-7"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-serif text-3xl text-gold-300">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-gold-400 text-navy-900">
                    <Icon className="h-5 w-5" />
                  </span>
                </div>
                <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-gold-300">
                  {pillar.program}
                </p>
                <h3 className="mt-2 font-serif text-2xl font-semibold">
                  {pillar.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-navy-200">
                  {pillar.body}
                </p>
                <ul className="mt-5 space-y-2.5 text-sm leading-relaxed text-navy-100">
                  {pillar.points.map((point) => (
                    <li key={point} className="flex gap-2.5">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-400" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <button
            onClick={() => onNavigate('surat')}
            className="inline-flex items-center gap-2 rounded-lg bg-gold-400 px-6 py-3 text-sm font-semibold text-navy-900 transition-colors hover:bg-gold-300"
          >
            {homepage.strategicCta}
            <ArrowRight className="h-4 w-4" />
          </button>
          <button
            onClick={() => onNavigate('home', 'program')}
            className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
            {homepage.strategicSecondaryCta}
          </button>
        </div>
      </div>
    </section>
  );
}
