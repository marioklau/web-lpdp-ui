import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight } from 'lucide-react';
import type { Page } from '@/types';

gsap.registerPlugin(ScrollTrigger);

interface JejakTeaserProps {
  onNavigate: (page: Page) => void;
}

const frames = [
  {
    src: '/asset/sutan-dekat.jpg',
    alt: 'Sutan Dami tersenyum, berkacamata',
    caption: 'Rote Ndao',
    className: 'left-0 top-10 w-[54%] -rotate-3',
    depth: 36,
    duration: '7.2s',
    fit: 'object-[center_20%]',
  },
  {
    src: '/asset/sutan-kelas.jpg',
    alt: 'Sutan Dami presentasi di kelas magister',
    caption: 'Kelas UI',
    className: 'right-0 top-0 w-[52%] rotate-2',
    depth: -24,
    duration: '8.4s',
    fit: 'object-center',
  },
  {
    src: '/asset/sutan-bersama.jpg',
    alt: 'Foto bersama penerima beasiswa LPDP',
    caption: 'Bersama awardee',
    className: 'bottom-0 left-[18%] w-[62%] -rotate-1',
    depth: 12,
    duration: '6.6s',
    fit: 'object-center',
  },
];

export default function JejakTeaser({ onNavigate }: JejakTeaserProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.teaser-shot').forEach((shot) => {
        gsap.fromTo(
          shot,
          { y: Number(shot.dataset.from || 40), opacity: 0.4 },
          {
            y: 0,
            opacity: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top 85%',
              end: 'center 55%',
              scrub: true,
            },
          },
        );
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-navy-50 py-16 sm:py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-gold-600">
            Mengenal lebih dekat
          </span>
          <h2 className="mt-3 font-serif text-3xl font-semibold text-navy-900 sm:text-5xl">
            Jejak Sutan
          </h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-navy-700 sm:text-lg">
            Di balik nama AKSARA ada Sutan Dami, putra Rote Ndao, lulusan
            informatika, awardee LPDP, dan mahasiswa magister di UI. Garis
            hidupnya berjalan dari pulau, ke ruang organisasi, lalu ke sistem
            yang dipakai orang banyak.
          </p>
          <button
            onClick={() => onNavigate('jejak')}
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-navy-900 px-6 py-3 text-sm font-semibold text-gold-300 transition-colors hover:bg-navy-800"
          >
            Susuri garis hidupnya
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="relative mx-auto h-[28rem] w-full max-w-xl sm:h-[32rem]">
          {frames.map((frame) => (
            <div
              key={frame.src}
              className={`teaser-shot absolute ${frame.className}`}
              data-from={frame.depth}
            >
              <div className="hero-float" style={{ animationDuration: frame.duration }}>
                <figure className="relative">
                  <img
                    src={frame.src}
                    alt={frame.alt}
                    className={`h-44 w-full rounded-2xl object-cover shadow-card sm:h-52 ${frame.fit}`}
                  />
                  <figcaption className="absolute bottom-3 left-3 rounded-full bg-navy-950/80 px-3 py-1 text-[11px] font-medium text-gold-300">
                    {frame.caption}
                  </figcaption>
                </figure>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
