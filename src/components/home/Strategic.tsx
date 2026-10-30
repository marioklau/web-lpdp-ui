import { ArrowRight, Database, Network, Users } from 'lucide-react';
import type { Page } from '@/types';

interface StrategicProps {
  onNavigate: (page: Page, anchor?: string) => void;
}

const pillars = [
  {
    index: '01',
    title: 'Satu Data Kelurahan',
    program: 'AKSARA Digital',
    icon: Database,
    body: 'Pengajuan dana kedatangan, dana hidup bulanan, tunjangan buku, dana riset, dan reimburse SIMAK UI masih sering dimulai dari template Word yang diunduh lalu diedit manual. Cara itu rawan salah ketik dan dokumen wajib yang terlewat.',
    points: [
      'Awardee mengisi formulir terpandu, bukan menyunting berkas kosong.',
      'Data pribadi dan data beasiswa terisi otomatis serta tervalidasi.',
      'Setiap jenis dana punya daftar periksa dokumen wajib.',
      'Berkas yang dihasilkan mengikuti template LPDP dan siap diunggah ke e-beasiswa.',
    ],
  },
  {
    index: '02',
    title: 'RT sebagai ujung tombak',
    program: 'AKSARA Connect',
    icon: Users,
    body: 'Beban divisi di kepengurusan kelurahan akan disesuaikan agar kerja proporsional. Setiap RT diperkuat supaya komunikasi, pendataan, dan kegiatan lintas angkatan serta fakultas tidak menggantung di segelintir orang.',
    points: [
      'Susunan minimal setiap RT: 1 Ketua, 1 Sekretaris, dan 3 Anggota.',
      'RT menjadi kanal terdekat untuk aspirasi dan pelaksanaan program.',
      'Jejaring lintas angkatan dan fakultas dijalankan dari bawah, bukan hanya dari pusat kelurahan.',
    ],
  },
  {
    index: '03',
    title: 'Sponsorship dan jejaring luar',
    program: 'AKSARA Sinergi',
    icon: Network,
    body: 'Program kelurahan perlu kaki yang lebih panjang dari iuran semata. Setiap kegiatan didorong memiliki sponsorship, dan kelurahan membuka kolaborasi dengan instansi serta kelurahan LPDP lain di Jabodetabek.',
    points: [
      'Sponsorship melekat pada kegiatan, supaya program lebih berkelanjutan.',
      'Kolaborasi eksternal dengan instansi yang relevan bagi awardee.',
      'Saling berbagi program dan jejaring antarkelurahan LPDP se-Jabodetabek.',
    ],
  },
];

export default function Strategic({ onNavigate }: StrategicProps) {
  return (
    <section id="strategi" className="bg-navy-900 py-16 text-white sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <span className="text-xs font-semibold uppercase tracking-wider text-gold-300">
            Program strategis
          </span>
          <h2 className="mt-3 font-serif text-3xl font-semibold sm:text-4xl">
            Tiga kerja yang akan dijalankan
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-navy-100">
            Kepemimpinan bukan hanya tentang siapa yang memimpin, melainkan
            tentang siapa yang dilibatkan, siapa yang didengarkan, dan seberapa
            besar manfaat yang dapat dihadirkan.
          </p>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-navy-300">
            Kelurahan LPDP UI 14.0 diarahkan sebagai rumah bersama yang
            ber-AKSARA: aspiratif, kolaboratif, solutif, adaptif, responsif,
            dan asyik. Rumah bersama, ruang berkarya.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <article
                key={pillar.index}
                className="flex flex-col rounded-3xl border border-white/10 bg-white/5 p-7"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-serif text-3xl text-gold-300">
                    {pillar.index}
                  </span>
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-gold-400 text-navy-900">
                    <Icon className="h-5 w-5" />
                  </span>
                </div>
                <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-gold-300">
                  {pillar.program}
                </p>
                <h3 className="mt-2 font-serif text-2xl font-semibold">
                  {pillar.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-navy-200">
                  {pillar.body}
                </p>
                <ul className="mt-5 space-y-2.5 text-sm leading-relaxed text-navy-100">
                  {pillar.points.map((point) => (
                    <li key={point} className="flex gap-2.5">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-400" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <button
            onClick={() => onNavigate('surat')}
            className="inline-flex items-center gap-2 rounded-lg bg-gold-400 px-6 py-3 text-sm font-semibold text-navy-900 transition-colors hover:bg-gold-300"
          >
            Coba layanan pengajuan dana
            <ArrowRight className="h-4 w-4" />
          </button>
          <button
            onClick={() => onNavigate('home', 'program')}
            className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
            Lihat delapan program
          </button>
        </div>
      </div>
    </section>
  );
}
