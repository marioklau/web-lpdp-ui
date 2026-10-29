import { ArrowRight, Sparkles } from 'lucide-react';
import { useContent } from '@/lib/contentContext';
import type { Page } from '@/types';

interface HeroProps {
  onNavigate: (page: Page, anchor?: string) => void;
}

export default function Hero({ onNavigate }: HeroProps) {
  const { candidate } = useContent();

  return (
    <section className="relative overflow-hidden bg-navy-900">
      {/* Decorative gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-navy-900 via-navy-800 to-navy-950" />
      <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-gold-400/10 blur-3xl" />
      <div className="absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-navy-500/20 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-28">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full bg-gold-400/15 px-4 py-1.5 text-xs font-semibold text-gold-300 ring-1 ring-gold-400/30">
              <Sparkles className="h-3.5 w-3.5" />
              AKSARA · Pemilu Lurah Kelurahan LPDP UI 2026
            </span>
            <h1 className="mt-5 font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold text-white leading-tight">
              {candidate.name}
            </h1>
            <p className="mt-3 text-lg text-gold-300 font-medium">
              {candidate.position}
            </p>
            <p className="mt-5 text-base sm:text-lg text-navy-200 leading-relaxed max-w-xl">
              {candidate.tagline}
            </p>
            {candidate.bio && (
              <p className="mt-3 text-sm text-navy-300 leading-relaxed max-w-xl">
                {candidate.bio}
              </p>
            )}

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={() => onNavigate('home', 'visi-misi')}
                className="inline-flex items-center gap-2 rounded-lg bg-gold-400 px-6 py-3 text-sm font-semibold text-navy-900 shadow-soft transition-all hover:bg-gold-300 hover:shadow-card"
              >
                Lihat Visi &amp; Misi
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => onNavigate('surat')}
                className="inline-flex items-center gap-2 rounded-lg border border-navy-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-navy-800"
              >
                Layanan Pengajuan Dana
              </button>
            </div>
          </div>

          {/* Candidate photo */}
          <div className="relative animate-fade-up" style={{ animationDelay: '0.15s' }}>
            <div className="relative mx-auto max-w-sm lg:max-w-md">
              <div className="absolute -inset-4 rounded-3xl bg-gold-400/15 blur-2xl" />
              <div className="relative rounded-3xl border border-gold-400/40 overflow-hidden shadow-card">
                {candidate.photoUrl ? (
                  <>
                    <img
                      src={candidate.photoUrl}
                      alt={candidate.name}
                      className="w-full h-[420px] sm:h-[500px] object-cover object-top"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-950/90 to-transparent p-5">
                      <p className="text-white font-medium text-sm">{candidate.name}</p>
                      <p className="text-gold-300 text-xs">{candidate.position}</p>
                    </div>
                  </>
                ) : (
                  <div className="flex h-[420px] sm:h-[500px] flex-col items-center justify-center gap-5 bg-gradient-to-br from-navy-800 via-navy-900 to-navy-950 p-8 text-center">
                    <span className="rounded-full bg-gold-400/15 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.25em] text-gold-300 ring-1 ring-gold-400/30">
                      AKSARA 2026
                    </span>
                    <div className="grid w-full max-w-xs grid-cols-2 gap-2.5">
                      {[
                        ['A', 'Aspiratif'],
                        ['K', 'Kolaboratif'],
                        ['S', 'Solutif'],
                        ['A', 'Adaptif'],
                        ['R', 'Responsif'],
                        ['A', 'Amanah'],
                      ].map(([letter, value]) => (
                        <div
                          key={value}
                          className="flex items-center gap-2 rounded-lg border border-gold-400/20 bg-white/5 px-3 py-2 text-left"
                        >
                          <span className="grid h-6 w-6 shrink-0 place-items-center rounded bg-gold-400 text-xs font-bold text-navy-900">
                            {letter}
                          </span>
                          <span className="text-xs font-medium text-navy-100">
                            {value}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="h-px w-16 bg-gold-400/50" />
                    <p className="font-serif text-lg leading-relaxed text-white">
                      {candidate.tagline}
                    </p>
                    <p className="text-xs text-gold-300">{candidate.position}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
