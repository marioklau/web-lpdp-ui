import { GraduationCap, Link2, MapPin } from 'lucide-react';
import type { Page } from '@/types';

interface FooterProps {
  onNavigate: (page: Page) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="bg-navy-950 text-navy-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <span className="grid place-items-center h-10 w-10 rounded-xl bg-gold-400 text-navy-900">
                <GraduationCap className="h-6 w-6" />
              </span>
              <span className="font-serif text-lg font-semibold text-white">
                LPDP UI
              </span>
            </div>
            <p className="text-sm text-navy-300 max-w-md leading-relaxed">
              Landing page kampanye AKSARA, Calon Lurah Kelurahan LPDP UI 2026.
              Bersama menghadirkan kepemimpinan yang aspiratif, kolaboratif,
              solutif, adaptif, responsif, dan amanah.
            </p>
            <p className="mt-4 text-xs text-navy-400">
              Data statistik dan peta masih berupa contoh (placeholder) dan
              belum merupakan data resmi.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Navigasi</h4>
            <ul className="space-y-2 text-sm">
              {[
                { id: 'home', label: 'Beranda' },
                { id: 'peta', label: 'Peta Awardee' },
                { id: 'surat', label: 'Layanan Surat' },
                { id: 'admin', label: 'Admin' },
              ].map((l) => (
                <li key={l.id}>
                  <button
                    onClick={() => onNavigate(l.id as Page)}
                    className="text-navy-300 hover:text-gold-300 transition-colors"
                  >
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Kontak</h4>
            <ul className="space-y-3 text-sm text-navy-300">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 text-gold-400 shrink-0" />
                <span>Kampus UI, Depok, Jawa Barat</span>
              </li>
              <li className="flex items-start gap-2">
                <Link2 className="h-4 w-4 mt-0.5 text-gold-400 shrink-0" />
                <a
                  href="https://bit.ly/47uIMTB"
                  target="_blank"
                  rel="noreferrer"
                  className="break-all hover:text-gold-300 transition-colors"
                >
                  Pendaftaran DPT: bit.ly/47uIMTB
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-navy-800/60 flex flex-col sm:flex-row justify-between gap-3 text-xs text-navy-400">
          <span>
            © {new Date().getFullYear()} AKSARA — Calon Lurah Kelurahan LPDP UI.
            Dibuat untuk tujuan demonstrasi.
          </span>
          <span>Desain & pengembangan oleh tim AKSARA.</span>
        </div>
      </div>
    </footer>
  );
}
