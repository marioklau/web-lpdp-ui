import { useEffect, useState } from 'react';
import { Calendar, ArrowUpRight, X } from 'lucide-react';
import { useContent } from '@/lib/contentContext';
import type { NewsItem } from '@/types';

export default function News() {
  const { news } = useContent();
  const [selected, setSelected] = useState<NewsItem | null>(null);

  useEffect(() => {
    if (!selected) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelected(null);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKey);
    };
  }, [selected]);

  return (
    <section className="bg-navy-50 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-gold-600">
              Berita &amp; Kegiatan
            </span>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl font-semibold text-navy-900">
              Kabar Terbaru
            </h2>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {news.map((n) => (
            <article
              key={n.id}
              className="group rounded-2xl bg-white border border-navy-100 shadow-soft overflow-hidden transition-all hover:shadow-card hover:-translate-y-1"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={n.imageUrl}
                  alt={n.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute top-3 left-3 rounded-full bg-navy-900/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-gold-300">
                  {n.category}
                </span>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 text-xs text-navy-500 mb-2">
                  <Calendar className="h-3.5 w-3.5" />
                  {n.date}
                </div>
                <h3 className="font-serif text-lg font-semibold text-navy-900 leading-snug">
                  {n.title}
                </h3>
                <p className="mt-2 text-sm text-navy-600 leading-relaxed line-clamp-2">
                  {n.excerpt}
                </p>
                <button
                  onClick={() => setSelected(n)}
                  className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-navy-900 group-hover:text-gold-600 transition-colors"
                >
                  Selengkapnya
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-[1100] grid place-items-center overflow-y-auto bg-navy-950/70 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="news-modal-title"
          onClick={() => setSelected(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-2xl bg-white shadow-card"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="relative h-56 sm:h-72">
              {selected.imageUrl ? (
                <img
                  src={selected.imageUrl}
                  alt={selected.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="grid h-full place-items-center bg-navy-100 text-sm text-navy-500">
                  Tanpa gambar
                </div>
              )}
              <span className="absolute top-4 left-4 rounded-full bg-navy-900/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-gold-300">
                {selected.category}
              </span>
              <button
                onClick={() => setSelected(null)}
                className="absolute top-4 right-4 grid h-9 w-9 place-items-center rounded-full bg-navy-950/70 text-white transition hover:bg-navy-950"
                aria-label="Tutup berita"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-2 text-xs text-navy-500">
                <Calendar className="h-3.5 w-3.5" />
                {selected.date}
              </div>
              <h3
                id="news-modal-title"
                className="mt-2 font-serif text-2xl font-semibold text-navy-900"
              >
                {selected.title}
              </h3>
              <p className="mt-4 whitespace-pre-wrap text-navy-700 leading-relaxed">
                {selected.excerpt}
              </p>
              <p className="mt-6 text-xs text-navy-400">
                Ringkasan berita. Hubungi pengurus untuk informasi lengkap.
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
