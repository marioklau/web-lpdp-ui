import { useMemo, useState } from 'react';
import { Map as MapIcon, Users, BadgeCheck, GraduationCap, Info } from 'lucide-react';
import IndonesiaMap from '@/components/IndonesiaMap';
import { useContent } from '@/lib/contentContext';

type FilterKey = 'awardeeCount' | 'activeAwardeeCount' | 'alumniCount';

const filters: { key: FilterKey; label: string; icon: typeof Users }[] = [
  { key: 'awardeeCount', label: 'Total Awardee', icon: Users },
  { key: 'activeAwardeeCount', label: 'Awardee Aktif', icon: BadgeCheck },
  { key: 'alumniCount', label: 'Alumni', icon: GraduationCap },
];

export default function PetaPage() {
  const [filter, setFilter] = useState<FilterKey>('awardeeCount');
  const { provinces: data, awardees, source } = useContent();
  const dataLoaded = source === 'firebase';

  const maxValue = useMemo(
    () => Math.max(...data.map((d) => d[filter] || 0), 1),
    [data, filter],
  );

  const totalAwardee = data.reduce((s, d) => s + d.awardeeCount, 0);
  const totalActive = data.reduce((s, d) => s + d.activeAwardeeCount, 0);
  const totalAlumni = data.reduce((s, d) => s + d.alumniCount, 0);

  // Legenda: 5 gradasi
  const legendSteps = [0, 0.2, 0.4, 0.6, 0.8, 1];

  function legendColor(ratio: number): string {
    const start = [174, 191, 233];
    const end = [178, 119, 22];
    const r = Math.round(start[0] + (end[0] - start[0]) * ratio);
    const g = Math.round(start[1] + (end[1] - start[1]) * ratio);
    const b = Math.round(start[2] + (end[2] - start[2]) * ratio);
    return `rgb(${r}, ${g}, ${b})`;
  }

  return (
    <main className="bg-navy-50 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gold-600">
            <MapIcon className="h-4 w-4" />
            Peta Interaktif
          </span>
          <h1 className="mt-3 font-serif text-3xl sm:text-4xl font-semibold text-navy-900">
            Sebaran Awardee LPDP UI
          </h1>
          <p className="mt-4 text-navy-600">
            Arahkan kursor ke provinsi untuk melihat jumlah awardee secara
            cepat, lalu klik untuk melihat rincian dan profil awardee. Warna
            lebih pekat menunjukkan jumlah lebih besar.
          </p>
        </div>

        {/* Status banner */}
        {!dataLoaded && (
          <div className="mb-6 flex items-start gap-3 rounded-xl bg-gold-50 border border-gold-200 px-5 py-4 text-sm text-gold-800">
            <Info className="h-5 w-5 mt-0.5 shrink-0 text-gold-600" />
            <p>
              <strong>Status data: belum tersinkron.</strong> Angka yang
              ditampilkan berasal dari <strong>data contoh/lokal</strong> dan
              bukan data resmi LPDP UI. Setelah admin menyimpan konten ke
              Firebase, peta akan menampilkan data terkini.
            </p>
          </div>
        )}

        {/* Filter */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-navy-700 mr-1">Filter:</span>
          {filters.map((f) => {
            const Icon = f.icon;
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  active
                    ? 'bg-navy-900 text-gold-300 shadow-soft'
                    : 'bg-white text-navy-700 border border-navy-200 hover:border-navy-400'
                }`}
              >
                <Icon className="h-4 w-4" />
                {f.label}
              </button>
            );
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <IndonesiaMap
              data={data}
              awardees={awardees}
              filter={filter}
              dataLoaded={dataLoaded}
            />

            {/* Legend */}
            <div className="mt-4 rounded-xl bg-white border border-navy-100 shadow-soft p-5">
              <h4 className="text-sm font-semibold text-navy-900 mb-3">
                Legenda — {filters.find((f) => f.key === filter)?.label}
              </h4>
              <div className="flex items-center gap-1">
                {legendSteps.map((s, i) => (
                  <div key={i} className="flex-1">
                    <div
                      className="h-4 rounded-sm"
                      style={{ backgroundColor: legendColor(s) }}
                    />
                    <p className="mt-1 text-[10px] text-navy-500 text-center">
                      {i === 0
                        ? '0'
                        : Math.round(maxValue * s).toString()}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-2 flex justify-between text-xs text-navy-500">
                <span>Sedikit</span>
                <span>Banyak</span>
              </div>
            </div>
          </div>

          {/* Side stats */}
          <aside className="space-y-4">
            <div className="rounded-2xl bg-white border border-navy-100 shadow-soft p-6">
              <h4 className="font-serif text-lg font-semibold text-navy-900 mb-4">
                Ringkasan Nasional
              </h4>
              <div className="space-y-4">
                {[
                  { label: 'Total Awardee', value: totalAwardee, icon: Users },
                  { label: 'Awardee Aktif', value: totalActive, icon: BadgeCheck },
                  { label: 'Alumni', value: totalAlumni, icon: GraduationCap },
                ].map((it) => {
                  const Icon = it.icon;
                  return (
                    <div key={it.label} className="flex items-center gap-3">
                      <span className="grid place-items-center h-10 w-10 rounded-xl bg-navy-900 text-gold-300">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="font-serif text-2xl font-bold text-navy-900">
                          {it.value}
                        </p>
                        <p className="text-xs text-navy-500">{it.label}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="mt-4 text-[10px] text-gold-600 uppercase tracking-wider font-semibold">
                Data Contoh
              </p>
            </div>

            <div className="rounded-2xl bg-navy-900 text-navy-100 p-6">
              <h4 className="font-serif text-lg font-semibold text-white mb-2">
                Catatan
              </h4>
              <p className="text-sm text-navy-200 leading-relaxed">
                Data peta bersumber dari GeoJSON provinsi Indonesia. Saat
                database terhubung, jumlah akan diperbarui otomatis berdasarkan
                tabel provinsi.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
