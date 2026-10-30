export interface JejakChapter {
  id: string;
  year: string;
  place: string;
  title: string;
  summary: string;
  points: string[];
  image?: string;
  imageAlt?: string;
}

export const JEJAK_PHOTOS = {
  portrait: '/asset/sutan-pasfoto.jpg',
  classroom: '/asset/sutan-kelas.jpg',
  together: '/asset/sutan-bersama.jpg',
};

export const SUTAN = {
  familiarName: 'Sutan Dami',
  fullName: 'Azarya Kairossutan Sacri Pusaka Dami',
  role: 'Calon Lurah Kelurahan LPDP UI 2026',
  origin: 'Rote Ndao',
  email: 'sutandami@gmail.com',
  phone: '+62 812-3379-7977',
  phoneHref: 'https://wa.me/6281233797977',
  whatsapp: 'https://wa.me/6281233797977',
  linkedin: 'https://www.linkedin.com/in/azarya-dami/',
  instagram: 'https://instagram.com/sutan_azarya.dami',
  cvUrl: '/dokumen/cv-sutan-dami.pdf',
};

export const JEJAK_CHAPTERS: JejakChapter[] = [
  {
    id: 'rote',
    year: 'Akar',
    place: 'Rote Ndao',
    title: 'Pulau yang ikut dibawa pergi',
    summary:
      'Sutan Dami adalah putra daerah Rote Ndao. Nama lengkapnya Azarya Kairossutan Sacri Pusaka Dami. Yang ia bawa dari pulau itu bukan hanya asal, melainkan arah: teknologi yang inklusif, dan akses digital yang lebih merata bagi daerah yang masih menunggu.',
    points: [
      'Putra daerah asal Rote Ndao',
      'Berkomitmen pada solusi teknologi yang berdampak dan berkelanjutan',
    ],
    image: '/asset/sutan-dekat.jpg',
    imageAlt: 'Sutan Dami tersenyum, berkacamata, mengenakan kemeja biru',
  },
  {
    id: 'petra',
    year: '2020',
    place: 'Surabaya',
    title: 'Masuk kampus dengan beasiswa penuh',
    summary:
      'Agustus 2020 ia memulai Sarjana Informatika di Universitas Kristen Petra. Kuliahnya ditanggung sepenuhnya oleh beasiswa. Di perjalanan yang sama ia terpilih dalam XP Young Leader Scholarship, program pengembangan kepemimpinan yang kompetitif.',
    points: [
      'Sarjana Informatika, Universitas Kristen Petra (2020–2024)',
      'Beasiswa penuh 100%',
      'XP Young Leader Scholarship',
    ],
  },
  {
    id: 'membangun',
    year: '2021',
    place: 'Surabaya',
    title: 'Mulai membangun, sambil mengajar',
    summary:
      'Setahun setelah masuk kampus, ia sudah mengerjakan sistem sungguhan. Di CV Yoong Motor ia membangun aplikasi alur kerja untuk lebih dari 200 karyawan. Di laboratorium Informatika Petra ia mendampingi lebih dari 200 mahasiswa. Di luar kelas, ia memimpin UKM Catur dan menjadi wakil ketua divisi IT sebuah lomba logika kampus.',
    points: [
      'Backend freelance CV Yoong Motor — persetujuan cuti dari 3 hari menjadi 1 hari',
      'Asisten dosen pemrograman, web, dan sistem informasi',
      'Ketua UKM Catur dan Wakil Ketua Divisi IT Informatics Rally',
    ],
  },
  {
    id: 'mpm',
    year: '2022',
    place: 'Universitas Kristen Petra',
    title: 'Memimpin rumah aspirasi mahasiswa',
    summary:
      'Ia dipercaya menjadi Ketua Majelis Perwakilan Mahasiswa. MPM adalah lembaga legislatif 25 anggota yang mengawasi lebih dari 15 organisasi kemahasiswaan. Dari kursi itu ia mengawal aspirasi lebih dari 3.000 mahasiswa aktif dan memimpin Kongres Mahasiswa Universitas.',
    points: [
      'Ketua MPM UK Petra, Juni 2022 – Juli 2023',
      'Lebih dari 20 kasus aspirasi dan pembahasan regulasi kampus',
      'Pengawasan program UKM dan komunitas mahasiswa',
    ],
    image: '/asset/sutan-forum.jpg',
    imageAlt: 'Sutan Dami berbicara di depan peserta menggunakan mikrofon',
  },
  {
    id: 'dampak',
    year: '2023',
    place: 'Jakarta & Surabaya',
    title: 'Teknologi yang berpihak pada orang',
    summary:
      'Magang backend di PT Inti Utama Solusindo membawanya ke sistem kesehatan: integrasi SATUSEHAT dan lebih dari 5.000 data rekam medis. Di tahun yang sama, proyek PKM-KC ABLEMENT — pengenalan bahasa isyarat berbasis AI — didanai Kemendikbudristek. Ia juga mengantongi Silver Certificate Cisco, mengurus media GMKI Surabaya, dan memimpin panitia pemilu raya kampus.',
    points: [
      'Magang backend: Django, SATUSEHAT, konflik jadwal turun hingga 80%',
      'PKM-KC ABLEMENT, video recognition bahasa isyarat',
      'Ketua Panitia PEMIRA: 5 kampanye, lebih dari 1.000 peserta, tanpa pelanggaran',
    ],
  },
  {
    id: 'lulus',
    year: '2024',
    place: 'Surabaya',
    title: 'Lulus cumlaude, rumah kedua tetap dijaga',
    summary:
      'September 2024 ia lulus dengan IPK 3,68, predikat cumlaude dan aktif berprestasi. Sebelum dan sesudah wisuda ia sempat menjadi ketua Flobamora — rumah pemuda NTT di Surabaya — membangun backend platform karier Ngejob, dan membimbing kelompok kecil sebagai mentor.',
    points: [
      'IPK 3,68/4,00 · Cumlaude dan Aktif Berprestasi',
      'Ketua Flobamora “Ketong Semua Basodara”',
      'Backend Ngejob: 25+ endpoint, lebih dari 100 pengujian otomatis',
    ],
  },
  {
    id: 'lpdp',
    year: '2025',
    place: 'UI · Kemendagri · Rote',
    title: 'Pulang dalam bentuk yang baru',
    summary:
      'Lewat jalur Afirmasi Daerah, ia menjadi awardee LPDP dan mulai menempuh Magister Teknologi Informasi di Universitas Indonesia. Siang harinya ia fullstack developer di PT Bentang Inspira Teknologi, mengerjakan SIPADU dan SIPD HUB untuk Pusat Data dan Informasi Kementerian Dalam Negeri. Di luar itu ia kembali mengabdi ke Rote lewat komunitas beasiswa BBaF, memimpin divisi website Basic Step Indonesia, dan masuk 20 besar pelatihan IBM Granite dari lebih dari 500 peserta.',
    points: [
      'Awardee LPDP Afirmasi Daerah, Batch 2 tahun 2025',
      'Mahasiswa S2 Teknologi Informasi, Universitas Indonesia',
      'SIPD HUB Kemendagri: 30+ API, 500+ pengguna pusat dan daerah',
      'IBM Granite: peringkat 20 dari 500+ peserta se-Indonesia',
    ],
    image: '/asset/sutan-ui.jpg',
    imageAlt: 'Sutan Dami di kampus Universitas Indonesia dengan jaket kuning',
  },
  {
    id: 'aksara',
    year: '2026',
    place: 'Kelurahan LPDP UI',
    title: 'Garis ini sampai di rumah bersama',
    summary:
      'Tahun ini ia menyelesaikan TOEFL ITP dengan skor 513 dan menyabet predikat Arcade Champion di Google Cloud — 77 lencana, 84 poin. Ia juga membangun lebih dari 40 API untuk Pengurus Nasional Perkumpulan Senior GMKI. Semua garis itu kini ia bawa ke satu tawaran: AKSARA, kepemimpinan yang mendengar, menghubungkan, dan menyelesaikan.',
    points: [
      'TOEFL ITP 513',
      'Google Cloud Arcade Champion',
      'Backend Pengurus Nasional Perkumpulan Senior GMKI',
      'Mengusung AKSARA untuk Kelurahan LPDP UI 2026',
    ],
    image: '/asset/sutan-pasfoto.jpg',
    imageAlt: 'Foto formal Sutan Dami, calon lurah Kelurahan LPDP UI',
  },
];

export const JEJAK_HIGHLIGHTS: { value: string; label: string }[] = [
  { value: '3,68', label: 'IPK cumlaude Informatika' },
  { value: '513', label: 'Skor TOEFL ITP' },
  { value: '77', label: 'Lencana Google Cloud' },
  { value: '20', label: 'Besar IBM Granite, dari 500+' },
  { value: '40+', label: 'API untuk jaringan senior GMKI' },
  { value: '500+', label: 'Pengguna layanan SIPD yang ia kerjakan' },
];
