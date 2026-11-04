import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowDown, ArrowRight, Heart, Instagram } from 'lucide-react';
import { WhatsAppIcon } from '@/components/BrandIcons';
import { useContent } from '@/lib/contentContext';
import { formatCount, useSitePulse } from '@/lib/sitePulse';
import type { Page } from '@/types';

gsap.registerPlugin(ScrollTrigger);

interface HeroProps {
  onNavigate: (page: Page, anchor?: string) => void;
}

export default function Hero({ onNavigate }: HeroProps) {
  const { candidate, homepage } = useContent();
  const { loves, loved, giveLove } = useSitePulse();
  const sectionRef = useRef<HTMLElement>(null);
  const beats = candidate.tagline
    .split(',')
    .map((part) => part.replace(/\.$/, '').trim())
    .filter(Boolean);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      gsap.to('.hero-watermark', {
        yPercent: 18,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });
      gsap.to('.hero-orb', {
        yPercent: -30,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });
      gsap.utils.toArray<HTMLElement>('.hero-shot').forEach((shot) => {
        const depth = Number(shot.dataset.depth || 24);
        gsap.to(shot, {
          y: depth,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        });
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[calc(100svh-4rem)] flex-col overflow-hidden bg-navy-950 sm:min-h-[calc(100svh-5rem)]"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800" />
      <div className="hero-orb absolute -right-24 top-0 h-[28rem] w-[28rem] rounded-full bg-gold-400/15 blur-3xl" />
      <div className="absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-navy-500/30 blur-3xl" />
      <div
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
        }}
      />
      <p className="hero-watermark pointer-events-none absolute -right-[6vw] bottom-10 z-0 hidden select-none font-serif text-[14rem] leading-none text-transparent hero-outline xl:block">
        {homepage.heroWatermark}
      </p>

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full bg-gold-400/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-gold-300 ring-1 ring-gold-400/30">
              {homepage.heroEyebrow}
            </span>
            <h1 className="mt-6 font-serif text-6xl font-semibold leading-none text-white sm:text-7xl lg:text-8xl">
              {candidate.name}
            </h1>
            <p className="mt-4 text-base font-medium text-gold-300 sm:text-lg">
              {candidate.position}
            </p>
            {homepage.heroCompanion && (
              <button
                onClick={() => onNavigate('jejak')}
                className="mt-3 text-left text-sm text-navy-200 underline decoration-gold-400/70 underline-offset-4 transition-colors hover:text-white"
              >
                {homepage.heroCompanion}
              </button>
            )}

            <div className="mt-8 space-y-1">
              {(beats.length > 0 ? beats : [candidate.tagline]).map((beat, index) => (
                <p
                  key={beat}
                  className={`font-serif text-2xl leading-tight sm:text-4xl ${
                    index === beats.length - 1 ? 'text-gold-300' : 'text-white'
                  }`}
                >
                  {beat}
                  {index < beats.length - 1 ? '.' : ''}
                </p>
              ))}
            </div>

            {candidate.bio && (
              <p className="mt-6 hidden max-w-xl text-sm leading-relaxed text-navy-200 sm:block sm:text-base">
                {candidate.bio}
              </p>
            )}

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                onClick={() => onNavigate('jejak')}
                className="inline-flex items-center gap-2 rounded-lg bg-gold-400 px-6 py-3 text-sm font-semibold text-navy-900 shadow-soft transition-all hover:bg-gold-300"
              >
                {homepage.heroPrimaryCta}
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => onNavigate('home', 'visi-misi')}
                className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-white/10"
              >
                {homepage.heroSecondaryCta}
              </button>
              <button
                type="button"
                onClick={giveLove}
                aria-pressed={loved}
                aria-label={`Hati ${formatCount(loves)}`}
                className="inline-flex items-center gap-2 rounded-full bg-white/10 py-1.5 pl-1.5 pr-4 ring-1 ring-rose-300/50 transition hover:bg-white/15"
              >
                <span className="grid h-11 w-11 place-items-center rounded-full bg-rose-500 text-white shadow-soft">
                  <Heart
                    className={`h-6 w-6 ${loved ? 'fill-white' : ''}`}
                    strokeWidth={1.75}
                  />
                </span>
                <span className="min-w-6 text-sm font-semibold tabular-nums text-white">
                  {formatCount(loves)}
                </span>
              </button>
            </div>

            {homepage.heroSupport && (
              <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-gold-400/30 bg-gold-400/10 px-4 py-2 font-serif text-base text-white sm:text-lg">
                <Heart className="h-4 w-4 fill-rose-400 text-rose-400" aria-hidden="true" />
                <span>{homepage.heroSupport}</span>
              </p>
            )}

            <div className="mt-5 flex flex-wrap gap-4 text-sm text-navy-100">
              <a
                href={homepage.whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 transition-colors hover:text-gold-300"
              >
                <WhatsAppIcon className="h-4 w-4" />
                {homepage.whatsappLabel}
              </a>
              <a
                href={homepage.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 transition-colors hover:text-gold-300"
              >
                <Instagram className="h-4 w-4" />
                {homepage.instagramLabel}
              </a>
            </div>
          </div>

          <div className="relative mx-auto h-[26rem] w-full max-w-lg sm:h-[32rem]">
            <div className="hero-shot absolute left-0 top-8 z-10 w-[48%]" data-depth="42">
              <div className="hero-float" style={{ animationDuration: '7.6s' }}>
                <img
                  src="/asset/sutan-forum.jpg"
                  alt="Sutan Dami berbicara di sebuah forum"
                  className="h-48 w-full -rotate-6 rounded-2xl border border-white/15 object-cover object-[center_22%] shadow-card sm:h-60"
                />
              </div>
            </div>
            <div className="hero-shot absolute right-0 top-0 z-10 w-[50%]" data-depth="-28">
              <div className="hero-float" style={{ animationDuration: '6.4s', animationDelay: '-1.6s' }}>
                <img
                  src="/asset/sutan-ui.jpg"
                  alt="Sutan Dami di kampus Universitas Indonesia"
                  className="h-52 w-full rotate-3 rounded-2xl border border-white/15 object-cover object-[center_18%] shadow-card sm:h-64"
                />
              </div>
            </div>
            <div className="hero-shot absolute bottom-0 left-[16%] z-20 w-[64%]" data-depth="14">
              <div className="hero-float" style={{ animationDuration: '8.8s', animationDelay: '-2.2s' }}>
                <figure className="relative -rotate-2 transition-transform duration-500 hover:rotate-0 hover:scale-[1.03]">
                  <img
                    src={candidate.photoUrl || '/asset/sutan-pasfoto.jpg'}
                    alt={homepage.heroCaption || candidate.name}
                    className="h-60 w-full rounded-3xl border-2 border-gold-400/60 object-cover object-top shadow-card sm:h-72"
                  />
                  {homepage.heroCaption && (
                    <figcaption className="absolute bottom-3 left-3 rounded-full bg-navy-950/85 px-3 py-1 text-xs font-medium text-gold-300">
                      {homepage.heroCaption}
                    </figcaption>
                  )}
                </figure>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => onNavigate('home', 'visi-misi')}
          className="mt-10 hidden items-center gap-2 self-start text-xs font-semibold uppercase tracking-[0.2em] text-navy-300 hover:text-gold-300 sm:inline-flex"
        >
          <ArrowDown className="h-4 w-4" />
          {homepage.heroScrollHint}
        </button>
      </div>

      {homepage.heroMarquee.length > 0 && (
      <div className="relative overflow-hidden border-t border-white/10 bg-navy-950/80">
        <div className="hero-marquee-track flex w-max gap-8 py-3">
          {[...homepage.heroMarquee, ...homepage.heroMarquee].map((item, index) => (
            <span
              key={`${item}-${index}`}
              className="text-xs font-semibold uppercase tracking-[0.28em] text-gold-300/80"
            >
              {item}
              <span className="ml-8 text-gold-500">·</span>
            </span>
          ))}
        </div>
      </div>
      )}
    </section>
  );
}
