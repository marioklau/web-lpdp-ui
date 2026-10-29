import { ArrowRight } from 'lucide-react';
import type { Page } from '@/types';

interface HomeMapPreviewProps {
  onNavigate: (page: Page) => void;
}

export default function HomeMapPreview({ onNavigate }: HomeMapPreviewProps) {
  return (
    <section className="bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2 items-center">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-gold-600">
              Peta Awardee
            </span>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl font-semibold text-navy-900">
              Distribusi Awardee di Seluruh Indonesia
            </h2>
            <p className="mt-4 text-navy-600 leading-relaxed">
              Peta interaktif memvisualisasikan sebaran awardee LPDP UI per
              provinsi. Warna yang lebih pekat menunjukkan jumlah awardee yang
              lebih banyak. Arahkan kursor untuk melihat ringkasan, lalu klik
              provinsi untuk melihat profil awardee.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-navy-700">
              <li className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-gold-400" />
                Choropleth berdasarkan jumlah awardee
              </li>
              <li className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-gold-400" />
                Filter alumni &amp; awardee aktif
              </li>
              <li className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-gold-400" />
                Profil awardee: foto, nama, dan pekerjaan
              </li>
            </ul>
            <button
              onClick={() => onNavigate('peta')}
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-navy-900 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-navy-800"
            >
              Buka Peta Lengkap
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="relative rounded-2xl border border-navy-100 shadow-card overflow-hidden bg-navy-50">
            <div className="aspect-[4/3] grid place-items-center bg-gradient-to-br from-navy-800 to-navy-950 p-8">
              <div className="grid grid-cols-6 gap-1.5 w-full max-w-sm">
                {Array.from({ length: 24 }).map((_, i) => (
                  <span
                    key={i}
                    className="aspect-square rounded-sm"
                    style={{
                      backgroundColor: `rgba(226, 172, 52, ${0.1 + (i % 8) * 0.11})`,
                    }}
                  />
                ))}
              </div>
            </div>
            <div className="p-4 text-center text-xs text-navy-500">
              Pratinjau peta — buka halaman peta untuk versi interaktif penuh
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
