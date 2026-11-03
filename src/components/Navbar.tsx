import { useState } from 'react';
import { Eye, GraduationCap, Menu, X } from 'lucide-react';
import { formatCount, useSitePulse } from '@/lib/sitePulse';
import type { Page } from '@/types';

interface NavbarProps {
  page: Page;
  onNavigate: (page: Page) => void;
}

const links: { id: Page; label: string }[] = [
  { id: 'home', label: 'Beranda' },
  { id: 'jejak', label: 'Jejak Sutan' },
  { id: 'peta', label: 'Peta Awardee' },
  { id: 'pasar', label: 'Pasar Awardee' },
  { id: 'admin', label: 'Admin' },
];

function ViewBadge() {
  const { views } = useSitePulse();

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full bg-navy-950/70 px-2 py-0.5 text-[11px] font-semibold text-gold-300"
      title="Jumlah dilihat"
    >
      <Eye className="h-3.5 w-3.5" aria-hidden="true" />
      <span className="tabular-nums">{formatCount(views)}</span>
      <span className="sr-only">dilihat</span>
    </span>
  );
}

export default function Navbar({ page, onNavigate }: NavbarProps) {
  const [open, setOpen] = useState(false);

  const handleNav = (p: Page) => {
    onNavigate(p);
    setOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-[1000] bg-navy-900/95 backdrop-blur-md border-b border-navy-800/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 sm:h-20 items-center justify-between">
          <button
            onClick={() => handleNav('home')}
            className="flex items-center gap-3 group"
          >
            <span className="grid place-items-center h-10 w-10 rounded-xl bg-gold-400 text-navy-900 shadow-soft">
              <GraduationCap className="h-6 w-6" />
            </span>
            <span className="flex flex-col leading-tight text-left">
              <span className="font-serif text-white text-base sm:text-lg font-semibold">
                LPDP UI
              </span>
              <span className="text-[10px] sm:text-xs text-gold-300 tracking-wider uppercase">
                AKSARA · Calon Lurah 2026
              </span>
            </span>
          </button>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {links.map((l) => (
              <button
                key={l.id}
                onClick={() => handleNav(l.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  page === l.id
                    ? 'text-gold-300 bg-navy-800/60'
                    : 'text-navy-100 hover:text-white hover:bg-navy-800/40'
                }`}
              >
                {l.label}
                {l.id === 'home' && <ViewBadge />}
              </button>
            ))}
          </nav>

          <div className="hidden lg:block">
            <button
              onClick={() => handleNav('surat')}
              className={`inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold shadow-soft transition-all ${
                page === 'surat'
                  ? 'bg-gold-300 text-navy-900'
                  : 'bg-gold-400 text-navy-900 hover:bg-gold-300 hover:shadow-card'
              }`}
            >
              Layanan Pengajuan Dana
            </button>
          </div>

          {/* Mobile toggle */}
          <div className="flex items-center gap-2 lg:hidden">
            <ViewBadge />
            <button
              onClick={() => setOpen((o) => !o)}
              className="grid place-items-center h-10 w-10 rounded-lg text-navy-100 hover:bg-navy-800/60"
              aria-label="Menu"
            >
              {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden border-t border-navy-800/60 bg-navy-900 animate-fade-in">
          <nav className="mx-auto max-w-7xl px-4 py-3 flex flex-col gap-1">
            {links.map((l) => (
              <button
                key={l.id}
                onClick={() => handleNav(l.id)}
                className={`inline-flex items-center gap-2 px-4 py-3 rounded-lg text-left text-sm font-medium ${
                  page === l.id
                    ? 'text-gold-300 bg-navy-800/60'
                    : 'text-navy-100 hover:bg-navy-800/40'
                }`}
              >
                {l.label}
                {l.id === 'home' && <ViewBadge />}
              </button>
            ))}
            <button
              onClick={() => handleNav('surat')}
              className={`mt-2 rounded-lg px-4 py-3 text-sm font-semibold text-navy-900 ${
                page === 'surat' ? 'bg-gold-300' : 'bg-gold-400'
              }`}
            >
              Layanan Pengajuan Dana
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
