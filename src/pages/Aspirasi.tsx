import { useState } from 'react';
import AspirationContact from '@/components/home/AspirationContact';
import DptFix from '@/components/aspirasi/DptFix';

type AspirasiTab = 'kontak' | 'dpt';

const tabs: { id: AspirasiTab; label: string }[] = [
  { id: 'kontak', label: 'Aspirasi & Kontak' },
  { id: 'dpt', label: 'DPT Fix' },
];

export default function Aspirasi() {
  const [tab, setTab] = useState<AspirasiTab>('kontak');

  return (
    <main>
      <div className="border-b border-navy-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
          <div role="tablist" aria-label="Submenu Aspirasi" className="flex gap-2">
            {tabs.map((item) => {
              const active = tab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setTab(item.id)}
                  className={`rounded-t-xl px-4 py-3 text-sm font-semibold transition-colors ${
                    active
                      ? 'bg-navy-900 text-gold-300'
                      : 'bg-navy-50 text-navy-600 hover:bg-navy-100 hover:text-navy-900'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      {tab === 'kontak' ? (
        <AspirationContact onOpenDpt={() => setTab('dpt')} />
      ) : (
        <DptFix />
      )}
    </main>
  );
}
