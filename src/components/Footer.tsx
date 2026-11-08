import { GraduationCap, Instagram, Link2, MapPin } from 'lucide-react';
import BallotMark from '@/components/BallotMark';
import { WhatsAppIcon } from '@/components/BrandIcons';
import { useContent } from '@/lib/contentContext';
import type { Page } from '@/types';

interface FooterProps {
  onNavigate: (page: Page) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const { homepage } = useContent();

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
              {homepage.footerBlurb}
            </p>
            <p className="mt-4 text-xs text-navy-400">
              {homepage.footerNote}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Navigasi</h4>
            <ul className="space-y-2 text-sm">
              {[
                { id: 'home', label: 'Beranda' },
                { id: 'jejak', label: 'Jejak Sutan' },
                { id: 'peta', label: 'Peta Awardee' },
                { id: 'pasar', label: 'Pasar Awardee' },
                { id: 'kos', label: 'Katalog Kos' },
                { id: 'aspirasi', label: 'Aspirasi & Kontak' },
                { id: 'surat', label: 'Layanan Pengajuan Dana' },
                { id: 'admin', label: 'Admin' },
              ].map((l) => (
                <li key={l.id}>
                  <button
                    onClick={() => onNavigate(l.id as Page)}
                    className="inline-flex items-center gap-2 text-navy-300 hover:text-gold-300 transition-colors"
                  >
                    <BallotMark />
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
                <span>{homepage.address}</span>
              </li>
              <li className="flex items-start gap-2">
                <Link2 className="h-4 w-4 mt-0.5 text-gold-400 shrink-0" />
                <a
                  href={homepage.dptUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="break-all hover:text-gold-300 transition-colors"
                >
                  {homepage.dptLabel}: {homepage.dptDisplay || homepage.dptUrl}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <WhatsAppIcon className="h-4 w-4 mt-0.5 text-gold-400 shrink-0" />
                <a
                  href={homepage.whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-gold-300 transition-colors"
                >
                  {homepage.whatsappLabel}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Instagram className="h-4 w-4 mt-0.5 text-gold-400 shrink-0" />
                <a
                  href={homepage.instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-gold-300 transition-colors"
                >
                  {homepage.instagramLabel}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-navy-800/60 flex flex-col sm:flex-row justify-between gap-3 text-xs text-navy-400">
          <span>
            © {new Date().getFullYear()} {homepage.footerCopyright}
          </span>
          <span>{homepage.footerTagline}</span>
        </div>
      </div>
    </footer>
  );
}
