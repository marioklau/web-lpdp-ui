import { Target } from 'lucide-react';
import { useContent } from '@/lib/contentContext';

export default function VisionMission() {
  const { visionMission } = useContent();

  return (
    <section id="visi-misi" className="bg-navy-50 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-semibold uppercase tracking-wider text-gold-600">
            Visi &amp; Misi
          </span>
          <h2 className="mt-3 font-serif text-3xl sm:text-4xl font-semibold text-navy-900">
            Arah Perjuangan
          </h2>
          <div className="mt-6 h-1 w-16 mx-auto rounded-full bg-gold-400" />
        </div>

        {/* Vision card */}
        <div className="mt-12 max-w-4xl mx-auto">
          <div className="rounded-2xl bg-white border border-navy-100 shadow-soft p-8 sm:p-10">
            <div className="flex items-start gap-4">
              <span className="grid place-items-center h-12 w-12 rounded-xl bg-navy-900 text-gold-300 shrink-0">
                <Target className="h-6 w-6" />
              </span>
              <div>
                <h3 className="font-serif text-xl font-semibold text-navy-900">Visi</h3>
                <p className="mt-2 text-navy-700 leading-relaxed">
                  {visionMission.vision}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mission cards */}
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visionMission.missions.map((m, i) => (
            <div
              key={i}
              className="group rounded-2xl bg-white border border-navy-100 shadow-soft p-6 transition-all hover:shadow-card hover:-translate-y-1"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="grid place-items-center h-8 w-8 rounded-lg bg-gold-400 text-navy-900 font-bold text-sm">
                  {i + 1}
                </span>
                <span className="h-px flex-1 bg-navy-100 group-hover:bg-gold-300 transition-colors" />
              </div>
              <p className="text-sm text-navy-700 leading-relaxed">{m}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
