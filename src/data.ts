import type {
  AwardeeProfile,
  Candidate,
  VisionMission,
  Program,
  StatItem,
  ProvinceData,
  NewsItem,
  LetterDocument,
  LetterFormField,
  LetterTemplate,
} from '@/types';

// ---------------------------------------------------------------------------
// DATA CONTOH (PLACEHOLDER)
// Semua data di bawah ini adalah CONTOH dan bukan data resmi LPDP UI.
// Data ini menjadi fallback awal; setelah Firebase dikonfigurasi dan admin
// menyimpan konten, halaman publik memakai data dari Firestore
// (lihat src/lib/content.tsx dan src/lib/firebase.ts).
// ---------------------------------------------------------------------------

export const CANDIDATE: Candidate = {
  name: 'AKSARA',
  position: 'Calon Lurah Kelurahan LPDP UI 2026',
  tagline:
    'Aspirasi Didengar, Kolaborasi Diperkuat, Dampak Diwujudkan.',
  photoUrl: '',
  bio: 'Kelurahan LPDP UI bukan sekadar wadah berkumpulnya para penerima beasiswa, melainkan rumah bersama tempat aspirasi didengarkan, potensi dikembangkan, solidaritas diperkuat, dan kontribusi diwujudkan.',
};

export const VISION_MISSION: VisionMission = {
  vision:
    'Mewujudkan Kelurahan LPDP UI sebagai rumah bersama yang inklusif, kolaboratif, inovatif, dan berdaya saing melalui kepemimpinan yang aspiratif, responsif, serta berintegritas untuk menghadirkan kebermanfaatan nyata bagi seluruh awardee dan masyarakat.',
  missions: [
    'Aspiratif — Membangun ruang komunikasi terbuka, partisipatif, dan inklusif untuk menghimpun serta memperjuangkan aspirasi seluruh awardee LPDP UI tanpa membedakan program studi, angkatan, maupun latar belakang.',
    'Kolaboratif — Memperkuat solidaritas, kekeluargaan, jejaring lintas disiplin, dan sinergi antarsesama awardee melalui kegiatan akademik, sosial, profesional, serta pengabdian masyarakat.',
    'Solutif — Menghadirkan program dan layanan yang relevan untuk menjawab kebutuhan, tantangan akademik, kesejahteraan, serta pengembangan kapasitas awardee melalui solusi yang konkret dan berkelanjutan.',
    'Adaptif — Mendorong budaya inovasi, kreativitas, literasi digital, dan pengembangan diri agar Kelurahan LPDP UI mampu beradaptasi dengan dinamika pendidikan, teknologi, serta kebutuhan awardee.',
    'Responsif — Mewujudkan kepengurusan yang komunikatif, mudah diakses, cepat tanggap, dan peduli terhadap kebutuhan maupun permasalahan awardee melalui mekanisme komunikasi serta tindak lanjut yang jelas.',
    'Amanah — Menjalankan kepemimpinan yang berintegritas, transparan, akuntabel, dan bertanggung jawab dengan mengedepankan kepentingan bersama serta memastikan setiap program memiliki hasil yang terukur.',
  ],
};

export const PROGRAMS: Program[] = [
  {
    id: 'p1',
    title: 'AKSARA Mendengar',
    description:
      'Forum aspirasi, survei kebutuhan, dan kanal komunikasi awardee.',
    icon: 'MessageSquareText',
  },
  {
    id: 'p2',
    title: 'AKSARA Connect',
    description:
      'Networking, mentoring, serta kolaborasi lintas angkatan dan program studi.',
    icon: 'Handshake',
  },
  {
    id: 'p3',
    title: 'AKSARA Care',
    description:
      'Solidaritas, dukungan sosial, dan kepedulian terhadap sesama awardee.',
    icon: 'HeartHandshake',
  },
  {
    id: 'p4',
    title: 'AKSARA Academy',
    description:
      'Sharing akademik, riset, publikasi, dan pengembangan kompetensi.',
    icon: 'GraduationCap',
  },
  {
    id: 'p5',
    title: 'AKSARA Impact',
    description:
      'Pengabdian masyarakat, inovasi sosial, dan kontribusi nyata.',
    icon: 'Globe2',
  },
  {
    id: 'p6',
    title: 'AKSARA Transparan',
    description:
      'Publikasi kegiatan, laporan kinerja, dan evaluasi kepengurusan.',
    icon: 'ShieldCheck',
  },
];

// Data provinsi CONTOH — angka awardee hanya ilustrasi.
export const PROVINCE_DATA: ProvinceData[] = [
  { id: 'ID-AC', name: 'Aceh', awardeeCount: 24, activeAwardeeCount: 8, alumniCount: 16 },
  { id: 'ID-SU', name: 'Sumatera Utara', awardeeCount: 52, activeAwardeeCount: 15, alumniCount: 37 },
  { id: 'ID-SB', name: 'Sumatera Barat', awardeeCount: 38, activeAwardeeCount: 11, alumniCount: 27 },
  { id: 'ID-RI', name: 'Riau', awardeeCount: 30, activeAwardeeCount: 9, alumniCount: 21 },
  { id: 'ID-JA', name: 'Jambi', awardeeCount: 18, activeAwardeeCount: 5, alumniCount: 13 },
  { id: 'ID-SS', name: 'Sumatera Selatan', awardeeCount: 41, activeAwardeeCount: 12, alumniCount: 29 },
  { id: 'ID-BB', name: 'Kepulauan Bangka Belitung', awardeeCount: 12, activeAwardeeCount: 4, alumniCount: 8 },
  { id: 'ID-BE', name: 'Bengkulu', awardeeCount: 11, activeAwardeeCount: 3, alumniCount: 8 },
  { id: 'ID-LA', name: 'Lampung', awardeeCount: 27, activeAwardeeCount: 8, alumniCount: 19 },
  { id: 'ID-KR', name: 'Kepulauan Riau', awardeeCount: 15, activeAwardeeCount: 4, alumniCount: 11 },
  { id: 'ID-JK', name: 'DKI Jakarta', awardeeCount: 180, activeAwardeeCount: 45, alumniCount: 135 },
  { id: 'ID-JB', name: 'Jawa Barat', awardeeCount: 156, activeAwardeeCount: 42, alumniCount: 114 },
  { id: 'ID-JT', name: 'Jawa Tengah', awardeeCount: 120, activeAwardeeCount: 33, alumniCount: 87 },
  { id: 'ID-YO', name: 'Daerah Istimewa Yogyakarta', awardeeCount: 95, activeAwardeeCount: 28, alumniCount: 67 },
  { id: 'ID-JI', name: 'Jawa Timur', awardeeCount: 132, activeAwardeeCount: 38, alumniCount: 94 },
  { id: 'ID-BT', name: 'Banten', awardeeCount: 64, activeAwardeeCount: 18, alumniCount: 46 },
  { id: 'ID-BA', name: 'Bali', awardeeCount: 33, activeAwardeeCount: 10, alumniCount: 23 },
  { id: 'ID-NB', name: 'Nusa Tenggara Barat', awardeeCount: 22, activeAwardeeCount: 6, alumniCount: 16 },
  { id: 'ID-NT', name: 'Nusa Tenggara Timur', awardeeCount: 19, activeAwardeeCount: 5, alumniCount: 14 },
  { id: 'ID-KB', name: 'Kalimantan Barat', awardeeCount: 24, activeAwardeeCount: 7, alumniCount: 17 },
  { id: 'ID-KT', name: 'Kalimantan Tengah', awardeeCount: 16, activeAwardeeCount: 4, alumniCount: 12 },
  { id: 'ID-KS', name: 'Kalimantan Selatan', awardeeCount: 26, activeAwardeeCount: 7, alumniCount: 19 },
  { id: 'ID-KI', name: 'Kalimantan Timur', awardeeCount: 31, activeAwardeeCount: 9, alumniCount: 22 },
  { id: 'ID-KU', name: 'Kalimantan Utara', awardeeCount: 8, activeAwardeeCount: 2, alumniCount: 6 },
  { id: 'ID-SA', name: 'Sulawesi Utara', awardeeCount: 21, activeAwardeeCount: 6, alumniCount: 15 },
  { id: 'ID-ST', name: 'Sulawesi Tengah', awardeeCount: 17, activeAwardeeCount: 5, alumniCount: 12 },
  { id: 'ID-SN', name: 'Sulawesi Selatan', awardeeCount: 48, activeAwardeeCount: 14, alumniCount: 34 },
  { id: 'ID-SG', name: 'Sulawesi Tenggara', awardeeCount: 14, activeAwardeeCount: 4, alumniCount: 10 },
  { id: 'ID-SR', name: 'Sulawesi Barat', awardeeCount: 10, activeAwardeeCount: 3, alumniCount: 7 },
  { id: 'ID-GO', name: 'Gorontalo', awardeeCount: 9, activeAwardeeCount: 2, alumniCount: 7 },
  { id: 'ID-MA', name: 'Maluku', awardeeCount: 11, activeAwardeeCount: 3, alumniCount: 8 },
  { id: 'ID-MU', name: 'Maluku Utara', awardeeCount: 8, activeAwardeeCount: 2, alumniCount: 6 },
  { id: 'ID-PB', name: 'Papua Barat', awardeeCount: 7, activeAwardeeCount: 2, alumniCount: 5 },
  { id: 'ID-PD', name: 'Papua Barat Daya', awardeeCount: 5, activeAwardeeCount: 1, alumniCount: 4 },
  { id: 'ID-PA', name: 'Papua', awardeeCount: 13, activeAwardeeCount: 3, alumniCount: 10 },
  { id: 'ID-PS', name: 'Papua Selatan', awardeeCount: 4, activeAwardeeCount: 1, alumniCount: 3 },
  { id: 'ID-PT', name: 'Papua Tengah', awardeeCount: 5, activeAwardeeCount: 1, alumniCount: 4 },
  { id: 'ID-PE', name: 'Papua Pegunungan', awardeeCount: 3, activeAwardeeCount: 1, alumniCount: 2 },
];

const SAMPLE_MEN = [
  'Aditya',
  'Rizky',
  'Fajar',
  'Bagas',
  'Dimas',
  'Reza',
  'Arif',
  'Hendra',
  'Yoga',
  'Bayu',
  'Ilham',
  'Galih',
  'Farhan',
  'Raka',
  'Andi',
];

const SAMPLE_WOMEN = [
  'Nadia',
  'Salsabila',
  'Intan',
  'Ayu',
  'Laras',
  'Maya',
  'Putri',
  'Dewi',
  'Rani',
  'Sinta',
  'Aulia',
  'Nabila',
  'Kirana',
  'Fitri',
  'Zahra',
];

const SAMPLE_LAST_NAMES = [
  'Pratama',
  'Nugroho',
  'Saputra',
  'Hidayat',
  'Prabowo',
  'Kusuma',
  'Santoso',
  'Firmansyah',
  'Setiawan',
  'Wijaya',
  'Hartono',
  'Siregar',
  'Ramadhan',
  'Mahendra',
  'Utama',
  'Permana',
  'Kurniawan',
  'Wibowo',
  'Susanto',
  'Gunawan',
];

const SAMPLE_OCCUPATIONS = [
  'Dosen',
  'Peneliti',
  'Analis Kebijakan',
  'Dokter',
  'Konsultan',
  'Software Engineer',
  'Guru',
  'Wirausaha',
  'ASN',
  'Data Scientist',
  'Arsitek',
  'Perawat',
  'Manajer Proyek',
  'Akuntan',
  'Jurnalis',
  'Psikolog',
  'Desainer',
  'Farmasi',
  'Hakim',
  'Ekonom',
];

// Profil contoh (3 per provinsi) agar panel peta bisa langsung menampilkan
// foto, nama, dan pekerjaan. Ganti dengan data resmi saat sudah tersedia.
export const AWARDEE_PROFILES: AwardeeProfile[] = PROVINCE_DATA.flatMap(
  (province, provinceIndex) =>
    Array.from({ length: 3 }, (_, offset) => {
      const seed = provinceIndex * 3 + offset;
      const index = Math.floor(seed / 2);
      const isWoman = seed % 2 === 1;
      const first = isWoman
        ? SAMPLE_WOMEN[index % SAMPLE_WOMEN.length]
        : SAMPLE_MEN[index % SAMPLE_MEN.length];
      const last = SAMPLE_LAST_NAMES[index % SAMPLE_LAST_NAMES.length];

      return {
        id: `sample-${province.id}-${offset + 1}`,
        provinceId: province.id,
        name: `${first} ${last}`,
        occupation:
          SAMPLE_OCCUPATIONS[
            (seed * 5 + provinceIndex) % SAMPLE_OCCUPATIONS.length
          ],
        photoUrl: `https://randomuser.me/api/portraits/${
          isWoman ? 'women' : 'men'
        }/${index % 90}.jpg`,
        isSample: true,
      } satisfies AwardeeProfile;
    }),
);

const totalAlumni = PROVINCE_DATA.reduce(
  (sum, item) => sum + item.alumniCount,
  0,
);
const totalActive = PROVINCE_DATA.reduce(
  (sum, item) => sum + item.activeAwardeeCount,
  0,
);

// Statistik CONTOH — diturunkan dari data provinsi agar konsisten.
export const STATS: StatItem[] = [
  {
    id: 's1',
    label: 'Alumni LPDP UI',
    value: totalAlumni.toLocaleString('id-ID'),
    isPlaceholder: true,
  },
  {
    id: 's2',
    label: 'Awardee Aktif',
    value: totalActive.toLocaleString('id-ID'),
    isPlaceholder: true,
  },
  {
    id: 's3',
    label: 'Provinsi Terdata',
    value: String(PROVINCE_DATA.length),
    isPlaceholder: true,
  },
  { id: 's4', label: 'Pembaruan Data', value: '20 Okt 2026', isPlaceholder: true },
];

export const NEWS: NewsItem[] = [
  {
    id: 'n1',
    title: 'Pendaftaran DPT Pemilu Lurah Kelurahan LPDP UI 2026 Dibuka',
    excerpt:
      'Suaramu menentukan masa depan Kelurahan LPDP UI! Pastikan namamu sudah terdaftar dalam Daftar Pemilih Tetap (DPT) melalui https://bit.ly/47uIMTB sebelum menentukan pilihan. Jangan cuma jadi penonton, jadilah bagian dari perubahan. Satu suara, satu harapan, untuk Kelurahan LPDP UI yang lebih baik. Dari Awardee, Oleh Awardee, untuk Awardee!',
    date: '29 Oktober 2026',
    category: 'Pengumuman',
    imageUrl:
      'https://images.pexels.com/photos/6684408/pexels-photo-6684408.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
  {
    id: 'n2',
    title: 'AKSARA — Gerakan Bersama untuk Kelurahan LPDP UI 2026',
    excerpt:
      'Kami percaya bahwa Kelurahan LPDP UI bukan sekadar wadah berkumpulnya para penerima beasiswa, melainkan rumah bersama tempat aspirasi didengarkan, potensi dikembangkan, solidaritas diperkuat, dan kontribusi diwujudkan. Melalui semangat AKSARA, kami berkomitmen menghadirkan kepemimpinan yang aspiratif, kolaboratif, solutif, adaptif, responsif, dan amanah.',
    date: '20 Oktober 2026',
    category: 'Kampanye',
    imageUrl:
      'https://images.pexels.com/photos/16420473/pexels-photo-16420473.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
  {
    id: 'n3',
    title: 'Enam Program Unggulan AKSARA',
    excerpt:
      'AKSARA Mendengar, AKSARA Connect, AKSARA Care, AKSARA Academy, AKSARA Impact, dan AKSARA Transparan dirancang untuk menghadirkan solusi konkret, memperkuat kolaborasi lintas angkatan, serta mewujudkan dampak nyata bagi seluruh awardee dan masyarakat.',
    date: '12 Oktober 2026',
    category: 'Program',
    imageUrl:
      'https://images.pexels.com/photos/5538594/pexels-photo-5538594.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
];

const buildScholarshipForm = (documents: LetterDocument[]) => {
  const lines = [
    'FORM PENGAJUAN DANA BEASISWA',
    '',
    'Nama                               : {{nama}}',
    'Nama Bank                          : {{namaBank}}',
    'Nama Account                       : {{namaAccount}}',
    'Nomor Rekening                     : {{nomorRekening}}',
    'BIC / Swift Code                   : {{bicSwift}}',
    'IBAN / ABA / BSB                   : {{iban}}',
    'Kampus                             : {{kampus}}',
    'Negara                             : {{negara}}',
    'Jenis Dana Pengajuan dan Jumlahnya : {{jenisDana}} — {{jumlah}}',
    '',
    'Dokumen Pendukung:',
  ];

  documents.forEach((document, index) => {
    lines.push(
      document.numbered === false
        ? document.label
        : `${index + 1}. ${document.label}`,
    );
    lines.push(`{{${document.key}}}`);
    lines.push('');
  });

  return lines.join('\n').trimEnd();
};

const DOKUMEN_HIDUP: LetterDocument[] = [
  {
    key: 'lampiran_1',
    label: 'SURAT KETERANGAN MAHASISWA AKTIF FASILKOM – MTI UI',
  },
  {
    key: 'lampiran_2',
    label: 'ISIAN RENCANA STUDI (IRS / KRS)',
  },
  {
    key: 'lampiran_3',
    label:
      'RINGKASAN DATA AKADEMIS – SCLM (STUDENT LIFE CYCLE MANAGEMENT) UI',
  },
  {
    key: 'lampiran_4',
    label: 'SURAT KETERANGAN (PENGANTAR) DOMISILI',
  },
];

const DOKUMEN_KEDATANGAN: LetterDocument[] = [
  {
    key: 'lampiran_1',
    label: 'SURAT PENGANTAR (KETERANGAN) DOMISILI',
  },
  {
    key: 'lampiran_2',
    label: 'KARTU TANDA PENDUDUK',
  },
  {
    key: 'lampiran_3',
    label: 'KARTU KELUARGA',
  },
  {
    key: 'lampiran_4',
    label:
      'LoA Unconditional (SURAT KETERANGAN DITERIMA CALON MAHASISWA BARU UI – LULUS SIMAK UI)',
  },
  {
    key: 'lampiran_5',
    label:
      'LoG (SURAT KETERANGAN PENERIMA BEASISWA PENDIDIKAN INDONESIA MTI UI di UI - LPDP)',
  },
  {
    key: 'lampiran_6',
    label:
      'BUKTI ALAMAT KAMPUS MTI UI (TEMPAT PERKULIAHAN) diambil dari BOOKLET KURIKULUM FASILKOM UI',
  },
];

const DOKUMEN_SIMAK: LetterDocument[] = [
  {
    key: 'lampiran_1',
    label: 'Bukti Invoice/Tagihan Pembayaran',
  },
  {
    key: 'lampiran_2',
    label:
      'Bukti Pembayaran (Bayar via Virtual Account / VA Livin by Mandiri)',
  },
  {
    key: 'lampiran_3',
    label:
      'Bukti Pelunasan Pendaftaran SIMAK UI Gel. 2 Tahun 2026 (Status "LUNAS" pada Riwayat Pendaftaran)',
  },
  {
    key: 'lampiran_4',
    label:
      'Bukti Pelunasan Pendaftaran SIMAK UI Gel. 2 Tahun 2026 (Penerbitan Kartu Ujian Digital)',
  },
  {
    key: 'lampiran_5',
    label: 'Unconditional Letter of Acceptance',
  },
  {
    key: 'lampiran_6',
    label: 'Bukti Detail Pembayaran SIMAK UI',
    required: false,
    numbered: false,
  },
];

const SCHOLARSHIP_FIELDS: LetterFormField[] = [
  { key: 'nama', label: 'Nama', group: 'Data Pemohon', required: true },
  { key: 'kampus', label: 'Kampus', group: 'Data Pemohon', required: true },
  { key: 'negara', label: 'Negara', group: 'Data Pemohon', required: true },
  {
    key: 'jenisDana',
    label: 'Jenis Dana Pengajuan',
    group: 'Data Pemohon',
    required: true,
    readOnly: true,
    defaultValue: '{{type}}',
  },
  {
    key: 'jumlah',
    label: 'Jumlah',
    group: 'Data Pemohon',
    required: true,
    readOnly: true,
    defaultValue: '{{amount}}',
  },
  {
    key: 'namaBank',
    label: 'Nama Bank',
    group: 'Data Bank',
    required: true,
  },
  {
    key: 'namaAccount',
    label: 'Nama Account',
    group: 'Data Bank',
    required: true,
  },
  {
    key: 'nomorRekening',
    label: 'Nomor Rekening',
    group: 'Data Bank',
    required: true,
  },
  {
    key: 'bicSwift',
    label: 'BIC / Swift Code',
    group: 'Data Bank',
    required: false,
  },
  {
    key: 'iban',
    label: 'IBAN / ABA / BSB',
    group: 'Data Bank',
    required: false,
  },
];

export const LETTER_TEMPLATES: LetterTemplate[] = [
  {
    id: 'dana-hidup',
    type: 'Dana Hidup Bulanan',
    title: 'Form Pengajuan Dana Beasiswa — Dana Hidup Bulanan',
    description: 'Pengajuan dana hidup bulanan beserta dokumen pendukung.',
    amount: 'Rp 15.000.000,-',
    format: 'form',
    formTitle: 'FORM PENGAJUAN DANA BEASISWA',
    fields: SCHOLARSHIP_FIELDS.map((field) => ({ ...field })),
    documents: DOKUMEN_HIDUP,
    bodyTemplate: buildScholarshipForm(DOKUMEN_HIDUP),
  },
  {
    id: 'dana-kedatangan',
    type: 'Dana Kedatangan',
    title: 'Form Pengajuan Dana Beasiswa — Dana Kedatangan',
    description: 'Pengajuan dana kedatangan beserta dokumen pendukung.',
    amount: 'Rp 10.000.000,-',
    format: 'form',
    formTitle: 'FORM PENGAJUAN DANA BEASISWA',
    fields: SCHOLARSHIP_FIELDS.map((field) => ({ ...field })),
    documents: DOKUMEN_KEDATANGAN,
    bodyTemplate: buildScholarshipForm(DOKUMEN_KEDATANGAN),
  },
  {
    id: 'dana-pendaftaran',
    type: 'Dana Pendaftaran',
    title: 'Form Pengajuan Dana Beasiswa — Dana Pendaftaran SIMAK UI',
    description: 'Pengajuan dana pendaftaran SIMAK UI beserta dokumen pendukung.',
    amount: 'Rp 1.350.000,-',
    format: 'form',
    formTitle: 'FORM PENGAJUAN DANA BEASISWA',
    fields: SCHOLARSHIP_FIELDS.map((field) => ({ ...field })),
    documents: DOKUMEN_SIMAK,
    bodyTemplate: buildScholarshipForm(DOKUMEN_SIMAK),
  },
  {
    id: 'tunjangan-buku',
    type: 'Dana Tunjangan Buku',
    title: 'Form Pengajuan Dana Beasiswa — Dana Tunjangan Buku',
    description: 'Pengajuan dana tunjangan buku beserta dokumen pendukung.',
    amount: 'Rp 10.000.000,-',
    format: 'form',
    formTitle: 'FORM PENGAJUAN DANA BEASISWA',
    fields: SCHOLARSHIP_FIELDS.map((field) => ({ ...field })),
    documents: DOKUMEN_HIDUP,
    bodyTemplate: buildScholarshipForm(DOKUMEN_HIDUP),
  },
];
