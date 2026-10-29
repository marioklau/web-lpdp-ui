import { GraduationCap, Mail, MapPin, Phone } from 'lucide-react';
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
              Landing page kampanye kandidat Pengurus Ikatan Keluarga Besar LPDP
              Universitas Indonesia. Bersama membangun jejaring alumni yang
              berdaya dan berdampak.
            </p>
            <p className="mt-4 text-xs text-navy-400">
              Data yang ditampilkan berupa contoh (placeholder) dan belum
              merupakan data resmi.
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
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gold-400 shrink-0" />
                <span>pengurus@lpdp-ui.id</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gold-400 shrink-0" />
                <span>+62 21 0000 0000</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-navy-800/60 flex flex-col sm:flex-row justify-between gap-3 text-xs text-navy-400">
          <span>
            © {new Date().getFullYear()} Kampanye Pengurus LPDP UI. Dibuat untuk
            tujuan demonstrasi.
          </span>
          <span>Desain & pengembangan oleh tim kampanye.</span>
        </div>
      </div>
    </footer>
  );
}
