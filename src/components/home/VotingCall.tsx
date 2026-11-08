import { CalendarDays, Mic2 } from 'lucide-react';

export default function VotingCall() {
  return (
    <section
      id="hak-suara"
      className="relative overflow-hidden bg-[#ffe14a] text-navy-950"
    >
      <p
        aria-hidden="true"
        className="pointer-events-none absolute -right-6 top-0 select-none font-serif text-[11rem] font-black leading-none tracking-tighter text-navy-950/[0.07] sm:text-[16rem]"
      >
        4
      </p>

      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14 lg:px-8">
        <div>
          <p className="inline-flex items-center rounded-full bg-navy-950 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-300">
            Nomor urut 4 · AKSARA
          </p>
          <h2 className="mt-5 max-w-xl font-serif text-4xl font-semibold leading-[1.05] sm:text-5xl">
            Pakai hak suaramu. Pilih Sutan.
          </h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-navy-900/80 sm:text-lg">
            Sutan Azarya Dami, S.Kom, Calon Lurah LPDP UI 14.0. Aspiratif,
            kolaboratif, solutif, adaptif, responsif, dan asyik.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <article className="rounded-2xl bg-navy-950 p-5 text-white shadow-card">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-gold-400 text-navy-950">
                <CalendarDays className="h-5 w-5" aria-hidden="true" />
              </span>
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-gold-300">
                Hak suara
              </p>
              <h3 className="mt-2 font-serif text-2xl font-semibold leading-tight">
                19–26 November 2026
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-navy-100">
                Pada Hari Voting, gunakan hak suaramu dan pilih nomor urut 4,
                AKSARA.
              </p>
            </article>

            <article className="rounded-2xl border border-navy-950/10 bg-white/80 p-5 shadow-card backdrop-blur-sm">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-navy-950 text-gold-300">
                <Mic2 className="h-5 w-5" aria-hidden="true" />
              </span>
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-gold-700">
                Debat Calon Lurah
              </p>
              <h3 className="mt-2 font-serif text-2xl font-semibold leading-tight">
                Sabtu, 14 November 2026
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-navy-700">
                Hadir dan dukung Sutan di Debat Calon Lurah LPDP UI 14.0.
                Datang, dengarkan, dan beri semangat dari kursi penonton.
              </p>
            </article>
          </div>
        </div>

        <figure className="mx-auto w-full max-w-md lg:max-w-none">
          <img
            src="/asset/poster-aksara-4.jpg"
            alt="Poster nomor urut 4 AKSARA, Sutan Azarya Dami, S.Kom, Calon Lurah LPDP UI 14.0"
            className="w-full rounded-3xl border-4 border-navy-950 object-cover shadow-card"
          />
          <figcaption className="mt-3 text-center text-sm font-medium text-navy-900/70">
            Coblos 4 · AKSARA
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
