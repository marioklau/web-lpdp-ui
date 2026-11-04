import { ArrowRight } from 'lucide-react';
import { useContent } from '@/lib/contentContext';
import type { Page } from '@/types';

interface HomeMapPreviewProps {
  onNavigate: (page: Page) => void;
}

export default function HomeMapPreview({ onNavigate }: HomeMapPreviewProps) {
  const { homepage } = useContent();

  return (
    <section className="bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2 items-center">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-gold-600">
              {homepage.mapEyebrow}
            </span>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl font-semibold text-navy-900">
              {homepage.mapTitle}
            </h2>
            <p className="mt-4 text-navy-600 leading-relaxed">
              {homepage.mapBody}
            </p>
            <ul className="mt-6 space-y-3 text-sm text-navy-700">
              {homepage.mapPoints.map((point) => (
                <li key={point} className="flex items-center gap-3">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-gold-400" />
                  {point}
                </li>
              ))}
            </ul>
            <button
              onClick={() => onNavigate('peta')}
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-navy-900 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-navy-800"
            >
              {homepage.mapCta}
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
                      backgroundColor: `color-mix(in srgb, #e2ac34 ${8 + (i % 8) * 12}%, #c5c8d0)`,
                    }}
                  />
                ))}
              </div>
            </div>
            <div className="p-4 text-center text-xs text-navy-500">
              {homepage.mapCaption}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
