import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MapPin } from 'lucide-react';
import { JEJAK_CHAPTERS, JEJAK_PHOTOS } from '@/lib/jejak';

gsap.registerPlugin(ScrollTrigger);

const PLACES = ['Rote Ndao', 'Surabaya', 'Jakarta', 'Depok', 'UI'];

export default function JourneyMap() {
  const pinRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const placeRef = useRef<HTMLParagraphElement>(null);
  const titleRef = useRef<HTMLParagraphElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const pin = pinRef.current;
    const track = trackRef.current;
    if (!pin || !track) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      pin.setAttribute('data-motion', 'off');
      return;
    }

    const stations = Array.from(track.querySelectorAll<HTMLElement>('.map-station'));
    const pins = stations.map((station) => station.querySelector<HTMLElement>('.map-pin'));
    let current = 0;

    const applyActive = (index: number) => {
      current = index;
      const chapter = JEJAK_CHAPTERS[index];
      stations.forEach((station, i) => {
        station.classList.toggle('is-here', i === index);
      });
      if (placeRef.current) placeRef.current.textContent = chapter.place;
      if (titleRef.current) titleRef.current.textContent = chapter.title;
      if (countRef.current) {
        countRef.current.textContent = String(index + 1).padStart(2, '0');
      }
    };

    const distance = () => Math.max(0, track.scrollWidth - pin.clientWidth);
    const navOffset = () => (window.innerWidth >= 640 ? 80 : 64);

    const ctx = gsap.context(() => {
      const motion = gsap.timeline({
        scrollTrigger: {
          trigger: pin,
          start: () => `top ${navOffset()}px`,
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.75,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (progressRef.current) {
              progressRef.current.style.transform = `scaleX(${self.progress})`;
            }
            const needle = pin.querySelector('.map-needle');
            const needleX = needle
              ? needle.getBoundingClientRect().left
              : window.innerWidth * 0.28;
            let nearest = 0;
            let best = Number.POSITIVE_INFINITY;
            pins.forEach((marker, index) => {
              if (!marker) return;
              const delta = Math.abs(marker.getBoundingClientRect().left - needleX);
              if (delta < best) {
                best = delta;
                nearest = index;
              }
            });
            if (nearest !== current) applyActive(nearest);
          },
        },
      });

      motion.to(track, { x: () => -distance(), ease: 'none' }, 0);
      motion.to('.map-far', { x: () => -distance() * 0.22, ease: 'none' }, 0);
    }, pin);

    const refresh = () => ScrollTrigger.refresh();
    track.querySelectorAll('img').forEach((img) => {
      if (!img.complete) img.addEventListener('load', refresh, { once: true });
    });

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={pinRef}
      className="jejak-map-pin relative h-[calc(100svh-4rem)] overflow-hidden bg-navy-950 text-white sm:h-[calc(100svh-5rem)]"
    >
      <div className="map-grid pointer-events-none absolute inset-0 opacity-70" />
      <div className="map-far pointer-events-none absolute -left-[15%] top-0 h-full w-[160%]">
        <span className="absolute left-[8%] top-[18%] h-40 w-40 rounded-full border border-gold-400/20" />
        <span className="absolute left-[28%] top-[62%] h-56 w-56 rounded-full border border-white/10" />
        <span className="absolute left-[52%] top-[12%] h-28 w-72 rounded-full bg-gold-400/5 blur-2xl" />
        <span className="absolute left-[74%] bottom-[20%] h-48 w-48 rounded-full border border-gold-400/15" />
        {PLACES.map((place, index) => (
          <span
            key={place}
            className="absolute font-serif text-4xl text-white/[0.06] sm:text-6xl"
            style={{ left: `${8 + index * 18}%`, top: `${22 + (index % 3) * 18}%` }}
          >
            {place}
          </span>
        ))}
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start justify-between gap-4 px-4 py-4 sm:px-8 sm:py-6">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-gold-300">
            Peta jejak
          </p>
          <p ref={placeRef} className="mt-1 font-serif text-2xl sm:text-3xl">
            {JEJAK_CHAPTERS[0].place}
          </p>
          <p ref={titleRef} className="mt-1 max-w-xs text-sm text-navy-200 sm:max-w-md">
            {JEJAK_CHAPTERS[0].title}
          </p>
          <div className="mt-3 h-px w-28 bg-white/15">
            <div ref={progressRef} className="map-progress h-full w-full bg-gold-400" />
          </div>
        </div>
        <p className="font-serif text-3xl text-gold-300 sm:text-5xl">
          <span ref={countRef}>01</span>
          <span className="text-base text-white/35 sm:text-xl">
            /{String(JEJAK_CHAPTERS.length).padStart(2, '0')}
          </span>
        </p>
      </div>

      <div className="map-needle pointer-events-none absolute bottom-[7.5rem] left-[28%] top-[46%] z-20 w-px bg-gold-400/50">
        <span className="absolute left-1/2 top-full grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-gold-300 bg-navy-950 shadow-[0_0_0_8px_rgba(226,172,52,0.15)]">
          <img
            src={JEJAK_PHOTOS.campaign}
            alt=""
            className="h-11 w-11 rounded-full object-cover object-[center_12%]"
          />
        </span>
      </div>

      <div className="jejak-map-scroller h-full">
        <div ref={trackRef} className="jejak-map-track relative flex h-full items-stretch">
          <div className="w-[6vw] shrink-0" />
          <div className="pointer-events-none absolute bottom-[7.5rem] left-0 right-0 h-px bg-[repeating-linear-gradient(90deg,#e2ac34_0_14px,transparent_14px_24px)]" />

          {JEJAK_CHAPTERS.map((chapter, index) => (
            <article
              key={chapter.id}
              className={`map-station relative h-full w-[86vw] shrink-0 sm:w-[62vw] lg:w-[44vw] ${
                index === 0 ? 'is-here' : ''
              }`}
            >
              <div className="map-card absolute inset-x-3 top-[5.5rem] bottom-[5.75rem] flex min-h-0 flex-col sm:inset-x-5 sm:top-24 sm:bottom-28">
                {chapter.image ? (
                  <div
                    className={`min-h-0 flex-1 overflow-hidden rounded-2xl border border-gold-400/30 shadow-card ${
                      chapter.imageFit === 'contain'
                        ? 'flex items-center justify-center bg-[#d10f1a]'
                        : ''
                    }`}
                  >
                    <img
                      src={chapter.image}
                      alt={chapter.imageAlt ?? chapter.title}
                      className={
                        chapter.imageFit === 'contain'
                          ? 'h-full max-h-full w-auto max-w-full object-contain'
                          : 'h-full w-full object-cover object-[center_16%]'
                      }
                    />
                  </div>
                ) : (
                  <div className="grid min-h-28 flex-1 place-items-center rounded-2xl border border-dashed border-gold-400/35 bg-white/5">
                    <span className="font-serif text-5xl text-gold-300/80">{chapter.year}</span>
                  </div>
                )}
                <div className="mt-2 shrink-0 rounded-2xl border border-white/10 bg-navy-900/85 p-3 backdrop-blur-sm sm:mt-3 sm:p-4">
                  <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-gold-300">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    {chapter.place}
                    <span className="text-white/30">·</span>
                    {chapter.year}
                  </p>
                  <h3 className="mt-1.5 font-serif text-lg leading-tight sm:text-2xl">
                    {chapter.title}
                  </h3>
                  <p className="mt-1.5 line-clamp-2 text-[13px] leading-snug text-navy-200 [@media(max-height:540px)]:hidden sm:line-clamp-3 sm:text-sm sm:leading-relaxed">
                    {chapter.summary}
                  </p>
                </div>
              </div>
              <span className="map-pin absolute bottom-[6.15rem] left-1/2 z-10 grid h-11 min-w-11 -translate-x-1/2 place-items-center rounded-full border border-gold-300 bg-navy-950 px-2 text-[11px] font-bold text-gold-300">
                {chapter.year}
              </span>
            </article>
          ))}
          <div className="w-[62vw] shrink-0" />
        </div>
      </div>

      <p className="pointer-events-none absolute inset-x-0 bottom-5 z-30 text-center text-[10px] font-semibold uppercase tracking-[0.22em] text-gold-300/80">
        Gulir ke bawah, peta berjalan ke kanan
      </p>
    </section>
  );
}
