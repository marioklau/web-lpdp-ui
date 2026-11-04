import { ArrowDown, Download, Instagram, Linkedin, Mail } from 'lucide-react';
import { WhatsAppIcon } from '@/components/BrandIcons';
import JourneyMap from '@/components/jejak/JourneyMap';
import { useContent } from '@/lib/contentContext';
import { JEJAK_HIGHLIGHTS, JEJAK_PHOTOS, SUTAN } from '@/lib/jejak';

export default function Jejak() {
  const { homepage } = useContent();

  return (
    <div className="bg-navy-950 text-white">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-navy-900 to-navy-950" />
        <div className="absolute -left-20 top-8 h-64 w-64 rounded-full bg-gold-400/10 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:py-20">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-gold-400/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-gold-300 ring-1 ring-gold-400/30">
              Mengenal lebih dekat
            </span>
            <h1 className="mt-5 font-serif text-5xl font-semibold leading-[0.95] sm:text-7xl">
              Jejak Sutan
            </h1>
            <p className="mt-4 text-lg text-gold-300">{SUTAN.fullName}</p>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-navy-200 sm:text-lg">
              Gulir ke bawah. Petanya berjalan ke kanan — dari Rote Ndao, lewat
              Surabaya, sampai ke rumah bersama di Kelurahan LPDP UI.
            </p>
            <div className="mt-8 flex flex-wrap gap-2">
              {[SUTAN.origin, 'Informatika 3,68', 'Awardee LPDP', 'S2 TI UI'].map(
                (chip) => (
                  <span
                    key={chip}
                    className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-navy-100"
                  >
                    {chip}
                  </span>
                ),
              )}
            </div>
            <p className="mt-8 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-gold-300">
              <ArrowDown className="h-4 w-4 animate-bounce" />
              Masuk ke peta
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-sm">
            <div className="absolute -inset-3 rounded-[2rem] bg-gold-400/15 blur-2xl" />
            <img
              src={JEJAK_PHOTOS.portrait}
              alt={SUTAN.familiarName}
              className="relative aspect-[3/4] w-full rounded-[2rem] border border-gold-400/40 object-cover object-top shadow-card"
            />
            <p className="absolute bottom-4 left-4 right-4 rounded-xl bg-navy-950/80 px-4 py-3 text-sm backdrop-blur-sm">
              <span className="block font-semibold">{SUTAN.familiarName}</span>
              <span className="text-gold-300">{SUTAN.role}</span>
            </p>
          </div>
        </div>
      </section>

      <JourneyMap />

      <section className="relative overflow-hidden bg-navy-950 py-20 sm:py-28">
        <div className="pointer-events-none absolute -left-20 top-0 h-72 w-72 rounded-full bg-gold-400/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-8 lg:grid-cols-2">
            <img
              src={JEJAK_PHOTOS.classroom}
              alt="Sutan Dami presentasi di kelas magister tentang Satu Data Kemendagri"
              className="h-72 w-full rounded-3xl object-cover sm:h-96"
            />
            <img
              src={JEJAK_PHOTOS.together}
              alt="Foto bersama penerima beasiswa LPDP"
              className="h-72 w-full rounded-3xl object-cover sm:h-96"
            />
          </div>

          <div className="mt-12 max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-300">
              Lanjut baca
            </p>
            <h2 className="mt-3 font-serif text-4xl font-semibold sm:text-6xl">
              Garis besarnya sudah lewat. Angkanya ada di CV.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-navy-200 sm:text-lg">
              {SUTAN.familiarName} menyusun sistem untuk pemerintah, organisasi,
              dan mahasiswa. Di kelas magister ia mengangkat Satu Data
              Kemendagri — kerja yang sama yang ingin ia bawa ke kelurahan.
            </p>
          </div>

          <dl className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {JEJAK_HIGHLIGHTS.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-white/10 bg-white/5 p-6"
              >
                <dt className="font-serif text-4xl text-gold-300">{item.value}</dt>
                <dd className="mt-2 text-sm text-navy-200">{item.label}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-10 flex flex-wrap gap-3">
            <a
              href={homepage.cvUrl || SUTAN.cvUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-gold-400 px-6 py-3 text-sm font-semibold text-navy-900 transition-colors hover:bg-gold-300"
            >
              <Download className="h-4 w-4" />
              Buka CV lengkap
            </a>
            <a
              href={homepage.linkedinUrl || SUTAN.linkedin}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              <Linkedin className="h-4 w-4" />
              LinkedIn
            </a>
            <a
              href={homepage.whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              <WhatsAppIcon className="h-4 w-4" />
              WhatsApp
            </a>
            <a
              href={homepage.instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              <Instagram className="h-4 w-4" />
              Instagram
            </a>
          </div>

          <div className="mt-8 flex flex-col gap-3 text-sm text-navy-300 sm:flex-row sm:flex-wrap sm:gap-6">
            <a href={`mailto:${homepage.email}`} className="inline-flex items-center gap-2 hover:text-gold-300">
              <Mail className="h-4 w-4 text-gold-400" />
              {homepage.email}
            </a>
            <a
              href={homepage.whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 hover:text-gold-300"
            >
              <WhatsAppIcon className="h-4 w-4 text-gold-400" />
              {homepage.phone}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
