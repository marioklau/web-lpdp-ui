import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight } from 'lucide-react';
import { useContent } from '@/lib/contentContext';
import type { Page } from '@/types';

gsap.registerPlugin(ScrollTrigger);

interface JejakTeaserProps {
  onNavigate: (page: Page) => void;
}

const frames = [
  {
    src: '/asset/sutan-utama-damai.jpg',
    alt: 'Sutan Dami tersenyum dengan jaket kuning',
    caption: 'Nomor urut 4',
    className: 'left-0 top-6 w-[48%] -rotate-3',
    depth: 36,
    duration: '7.2s',
    fit: 'object-top',
  },
  {
    src: '/asset/sutan-studio-satu.jpg',
    alt: 'Sutan Dami mengangkat satu jari',
    caption: 'Studio',
    className: 'right-0 top-0 w-[46%] rotate-2',
    depth: -24,
    duration: '8.4s',
    fit: 'object-top',
  },
  {
    src: '/asset/sutan-utama-semangat.jpg',
    alt: 'Sutan Dami dengan tangan terkepal',
    caption: 'Sutan Dami',
    className: 'bottom-2 left-[16%] w-[64%] -rotate-1',
    depth: 12,
    duration: '6.6s',
    fit: 'object-top',
  },
];

export default function JejakTeaser({ onNavigate }: JejakTeaserProps) {
  const { homepage } = useContent();
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
            {homepage.jejakEyebrow}
          </span>
          <h2 className="mt-3 font-serif text-3xl font-semibold text-navy-900 sm:text-5xl">
            {homepage.jejakTitle}
          </h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-navy-700 sm:text-lg">
            {homepage.jejakBody}
          </p>
          <button
            onClick={() => onNavigate('jejak')}
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-navy-900 px-6 py-3 text-sm font-semibold text-gold-300 transition-colors hover:bg-navy-800"
          >
            {homepage.jejakCta}
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
