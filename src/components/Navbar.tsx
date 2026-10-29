import { useState } from 'react';
import { GraduationCap, Menu, X } from 'lucide-react';
import type { Page } from '@/types';

interface NavbarProps {
  page: Page;
  onNavigate: (page: Page) => void;
}

const links: { id: Page; label: string }[] = [
  { id: 'home', label: 'Beranda' },
  { id: 'peta', label: 'Peta Awardee' },
  { id: 'surat', label: 'Layanan Surat' },
  { id: 'admin', label: 'Admin' },
];

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
                Kampanye Pengurus
              </span>
            </span>
          </button>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <button
                key={l.id}
                onClick={() => handleNav(l.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  page === l.id
                    ? 'text-gold-300 bg-navy-800/60'
                    : 'text-navy-100 hover:text-white hover:bg-navy-800/40'
                }`}
              >
                {l.label}
              </button>
            ))}
          </nav>

          <div className="hidden md:block">
            <button
              onClick={() => handleNav('surat')}
              className="inline-flex items-center gap-2 rounded-lg bg-gold-400 px-5 py-2.5 text-sm font-semibold text-navy-900 shadow-soft transition-all hover:bg-gold-300 hover:shadow-card"
            >
              Ajukan Surat
            </button>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen((o) => !o)}
            className="md:hidden grid place-items-center h-10 w-10 rounded-lg text-navy-100 hover:bg-navy-800/60"
            aria-label="Menu"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-navy-800/60 bg-navy-900 animate-fade-in">
          <nav className="mx-auto max-w-7xl px-4 py-3 flex flex-col gap-1">
            {links.map((l) => (
              <button
                key={l.id}
                onClick={() => handleNav(l.id)}
                className={`px-4 py-3 rounded-lg text-left text-sm font-medium ${
                  page === l.id
                    ? 'text-gold-300 bg-navy-800/60'
                    : 'text-navy-100 hover:bg-navy-800/40'
                }`}
              >
                {l.label}
              </button>
            ))}
            <button
              onClick={() => handleNav('surat')}
              className="mt-2 rounded-lg bg-gold-400 px-4 py-3 text-sm font-semibold text-navy-900"
            >
              Ajukan Surat
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
