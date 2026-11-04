import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ImagePlus,
  Loader2,
  MapPin,
  PackageSearch,
  Plus,
  Search,
  ShoppingBag,
  Tag,
  Trash2,
  X,
} from 'lucide-react';
import { WhatsAppIcon } from '@/components/BrandIcons';
import { prepareImageAttachment } from '@/lib/attachment';
import {
  fetchMarketListings,
  isFirebaseConfigured,
  submitMarketListing,
} from '@/lib/firebase';
import { SAMPLE_MARKET_LISTINGS } from '@/lib/marketSamples';
import { useLocalStorage } from '@/lib/useLocalStorage';
import type { MarketListing } from '@/types';

const LISTING_KEY = 'lpdp_market_listings';

const CATEGORIES = [
  'Furnitur',
  'Elektronik',
  'Peralatan Kos',
  'Buku & Alat Belajar',
  'Pakaian',
  'Kendaraan',
  'Lainnya',
];

const CONDITIONS = ['Seperti baru', 'Bekas layak pakai', 'Perlu perbaikan'];

interface ListingForm {
  sellerName: string;
  contact: string;
  city: string;
  title: string;
  category: string;
  condition: string;
  price: string;
  description: string;
  imageUrl: string;
  confirmed: boolean;
}

const EMPTY_FORM: ListingForm = {
  sellerName: '',
  contact: '',
  city: '',
  title: '',
  category: CATEGORIES[0],
  condition: CONDITIONS[0],
  price: '',
  description: '',
  imageUrl: '',
  confirmed: false,
};

function formatPrice(value: number): string {
  if (value <= 0) return 'Gratis / Nego';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function whatsappLink(contact: string): string {
  const digits = contact.replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('0')) return `https://wa.me/62${digits.slice(1)}`;
  if (digits.startsWith('8')) return `https://wa.me/62${digits}`;
  return `https://wa.me/${digits}`;
}

export default function PasarPage() {
  const [localListings, setLocalListings] = useLocalStorage<MarketListing[]>(
    LISTING_KEY,
    [],
  );
  const [remoteListings, setRemoteListings] = useState<MarketListing[]>([]);
  const [loading, setLoading] = useState(isFirebaseConfigured);
  const [loadError, setLoadError] = useState('');
  const [notice, setNotice] = useState('');
  const [warning, setWarning] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Semua');
  const [form, setForm] = useState<ListingForm>(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [processingImage, setProcessingImage] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    let cancelled = false;
    setLoading(true);
    void fetchMarketListings().then((items) => {
      if (cancelled) return;
      if (items === null) {
        setLoadError(
          'Iklan dari server gagal dimuat. Menampilkan iklan yang tersimpan di browser ini.',
        );
      } else {
        setRemoteListings(items);
      }
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const listings = useMemo(() => {
    const map = new Map<string, MarketListing>();
    for (const item of SAMPLE_MARKET_LISTINGS) map.set(item.id, item);
    for (const item of localListings) map.set(item.id, item);
    for (const item of remoteListings) map.set(item.id, item);
    return [...map.values()].sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    );
  }, [localListings, remoteListings]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return listings.filter((item) => {
      const matchCategory = category === 'Semua' || item.category === category;
      if (!matchCategory) return false;
      if (!needle) return true;
      return [item.title, item.description, item.city, item.category].some(
        (value) => value.toLowerCase().includes(needle),
      );
    });
  }, [listings, query, category]);

  const updateForm = (patch: Partial<ListingForm>) => {
    setForm((current) => ({ ...current, ...patch }));
  };

  const handleImage = async (file: File) => {
    setProcessingImage(true);
    setFormError('');
    try {
      const dataUrl = await prepareImageAttachment(file);
      updateForm({ imageUrl: dataUrl });
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : 'Gagal memproses gambar.',
      );
    } finally {
      setProcessingImage(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError('');
    setNotice('');
    setWarning('');

    if (processingImage) {
      setFormError('Tunggu hingga foto selesai diproses.');
      return;
    }

    const price = Number(form.price);
    if (
      !form.sellerName.trim() ||
      !form.contact.trim() ||
      !form.city.trim() ||
      !form.title.trim() ||
      !form.description.trim()
    ) {
      setFormError('Mohon lengkapi nama penjual, kontak, lokasi, barang, dan deskripsi.');
      return;
    }
    if (form.contact.replace(/\D/g, '').length < 9) {
      setFormError('Nomor WhatsApp minimal 9 digit, contoh 081234567890.');
      return;
    }
    if (!Number.isFinite(price) || price < 0) {
      setFormError('Harga harus berupa angka 0 atau lebih. Isi 0 untuk gratis/nego.');
      return;
    }
    if (form.description.trim().length < 10) {
      setFormError('Deskripsi minimal 10 karakter agar pembeli mendapat informasi jelas.');
      return;
    }
    if (!form.confirmed) {
      setFormError('Centang konfirmasi bahwa transaksi dilakukan di luar platform.');
      return;
    }

    const payload = {
      sellerName: form.sellerName.trim(),
      contact: form.contact.trim(),
      city: form.city.trim(),
      title: form.title.trim(),
      category: form.category,
      condition: form.condition,
      price: Math.floor(price),
      description: form.description.trim(),
      imageUrl: form.imageUrl,
    };

    setSubmitting(true);
    const saved = isFirebaseConfigured
      ? await submitMarketListing(payload)
      : null;

    const listing: MarketListing = saved ?? {
      id: crypto.randomUUID(),
      ...payload,
      createdAt: new Date().toISOString(),
    };

    setLocalListings((current) => [
      listing,
      ...current.filter((item) => item.id !== listing.id),
    ]);
    if (saved) {
      setRemoteListings((current) => [
        saved,
        ...current.filter((item) => item.id !== saved.id),
      ]);
    }

    setForm(EMPTY_FORM);
    setShowForm(false);
    setSubmitting(false);
    setNotice(
      saved
        ? 'Iklan berhasil dipasang dan sudah tampil di halaman Pasar Awardee.'
        : 'Iklan tersimpan di browser ini. Hubungkan Firebase agar iklan tampil untuk semua pengunjung.',
    );
    if (isFirebaseConfigured && !saved) {
      setWarning(
        'Gagal mengirim iklan ke server. Iklan tetap tersimpan di browser ini; silakan coba lagi nanti.',
      );
    }
  };

  const removeImage = () => updateForm({ imageUrl: '' });

  return (
    <div className="bg-navy-950">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800" />
        <div className="absolute -right-24 top-0 h-80 w-80 rounded-full bg-gold-400/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-navy-500/20 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <span className="inline-flex items-center gap-2 rounded-full bg-gold-400/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-gold-300 ring-1 ring-gold-400/30">
            <ShoppingBag className="h-3.5 w-3.5" />
            Ruang jual beli awardee
          </span>
          <h1 className="mt-5 font-serif text-5xl font-semibold leading-[1.05] text-white sm:text-6xl">
            Pasar Awardee
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-navy-200 sm:text-lg">
            Lemari, kasur, meja, elektronik, hingga buku kuliah. Temukan barang
            bekas layak pakai dari sesama awardee, atau pasang iklan barang yang
            sudah tidak terpakai.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                setShowForm(true);
                setNotice('');
                setWarning('');
                window.setTimeout(() => {
                  document
                    .getElementById('form-iklan')
                    ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 50);
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-gold-400 px-6 py-3 text-sm font-semibold text-navy-900 transition-colors hover:bg-gold-300"
            >
              <Plus className="h-4 w-4" />
              Pasang Iklan
            </button>
            <a
              href="#daftar-iklan"
              className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              <PackageSearch className="h-4 w-4" />
              Lihat Iklan
            </a>
            <span className="text-sm text-navy-300">
              <strong className="text-gold-300">{listings.length}</strong> iklan
              terpasang
            </span>
          </div>

          <div className="mt-8 flex items-start gap-3 rounded-2xl border border-gold-400/25 bg-gold-400/10 px-5 py-4 text-sm text-gold-100">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-gold-300" />
            <p>
              <strong className="text-gold-300">Transaksi di luar platform.</strong>{' '}
              Kelurahan LPDP UI hanya menyediakan ruang iklan. Pembayaran,
              pengiriman, pengecekan barang, dan kesepakatan harga dilakukan
              langsung antara penjual dan pembeli. Selalu cek barang sebelum
              membayar dan hindari transfer ke rekening yang tidak terverifikasi.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-navy-50 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {notice && (
            <div className="mb-4 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{notice}</span>
            </div>
          )}
          {warning && (
            <div className="mb-4 flex items-start gap-3 rounded-xl border border-gold-200 bg-gold-50 px-4 py-3 text-sm text-gold-800">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{warning}</span>
            </div>
          )}
          {loadError && (
            <div className="mb-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{loadError}</span>
            </div>
          )}
          {!isFirebaseConfigured && (
            <div className="mb-4 rounded-xl border border-gold-200 bg-gold-50 px-4 py-3 text-sm text-gold-800">
              Mode demo lokal: iklan hanya tersimpan di browser ini. Isi
              kredensial Firebase untuk menampilkan iklan ke semua pengunjung.
            </div>
          )}

          {showForm && (
            <div
              id="form-iklan"
              className="mb-8 rounded-2xl border border-navy-100 bg-white p-6 shadow-soft sm:p-8"
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-serif text-2xl font-semibold text-navy-900">
                    Pasang Iklan Barang
                  </h2>
                  <p className="mt-1 text-sm text-navy-600">
                    Isi data barang dengan jelas. Iklan akan tampil di halaman
                    ini dan dapat dihubungi lewat WhatsApp.
                  </p>
                </div>
                <button
                  onClick={() => setShowForm(false)}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-navy-200 text-navy-600 transition hover:bg-navy-50"
                  aria-label="Tutup formulir"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {formError && (
                <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium text-navy-800">
                      Nama Penjual
                    </span>
                    <input
                      className="w-full rounded-lg border border-navy-200 bg-white px-3.5 py-2.5 text-sm text-navy-900 outline-none transition focus:border-navy-500 focus:ring-2 focus:ring-navy-500/20"
                      value={form.sellerName}
                      onChange={(event) =>
                        updateForm({ sellerName: event.target.value })
                      }
                      placeholder="Nama lengkap / panggilan"
                      required
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium text-navy-800">
                      Nomor WhatsApp
                    </span>
                    <input
                      type="tel"
                      inputMode="tel"
                      className="w-full rounded-lg border border-navy-200 bg-white px-3.5 py-2.5 text-sm text-navy-900 outline-none transition focus:border-navy-500 focus:ring-2 focus:ring-navy-500/20"
                      value={form.contact}
                      onChange={(event) =>
                        updateForm({ contact: event.target.value })
                      }
                      placeholder="081234567890"
                      required
                    />
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium text-navy-800">
                      Nama Barang
                    </span>
                    <input
                      className="w-full rounded-lg border border-navy-200 bg-white px-3.5 py-2.5 text-sm text-navy-900 outline-none transition focus:border-navy-500 focus:ring-2 focus:ring-navy-500/20"
                      value={form.title}
                      onChange={(event) =>
                        updateForm({ title: event.target.value })
                      }
                      placeholder="Contoh: Lemari pakaian 2 pintu"
                      required
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium text-navy-800">
                      Lokasi
                    </span>
                    <input
                      className="w-full rounded-lg border border-navy-200 bg-white px-3.5 py-2.5 text-sm text-navy-900 outline-none transition focus:border-navy-500 focus:ring-2 focus:ring-navy-500/20"
                      value={form.city}
                      onChange={(event) =>
                        updateForm({ city: event.target.value })
                      }
                      placeholder="Contoh: Depok, UI"
                      required
                    />
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium text-navy-800">
                      Kategori
                    </span>
                    <select
                      className="w-full rounded-lg border border-navy-200 bg-white px-3.5 py-2.5 text-sm text-navy-900 outline-none transition focus:border-navy-500 focus:ring-2 focus:ring-navy-500/20"
                      value={form.category}
                      onChange={(event) =>
                        updateForm({ category: event.target.value })
                      }
                    >
                      {CATEGORIES.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium text-navy-800">
                      Kondisi
                    </span>
                    <select
                      className="w-full rounded-lg border border-navy-200 bg-white px-3.5 py-2.5 text-sm text-navy-900 outline-none transition focus:border-navy-500 focus:ring-2 focus:ring-navy-500/20"
                      value={form.condition}
                      onChange={(event) =>
                        updateForm({ condition: event.target.value })
                      }
                    >
                      {CONDITIONS.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium text-navy-800">
                      Harga (Rp)
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      className="w-full rounded-lg border border-navy-200 bg-white px-3.5 py-2.5 text-sm text-navy-900 outline-none transition focus:border-navy-500 focus:ring-2 focus:ring-navy-500/20"
                      value={form.price}
                      onChange={(event) =>
                        updateForm({ price: event.target.value })
                      }
                      placeholder="0 untuk gratis/nego"
                      required
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-navy-800">
                    Deskripsi Barang
                  </span>
                  <textarea
                    rows={4}
                    className="w-full resize-y rounded-lg border border-navy-200 bg-white px-3.5 py-2.5 text-sm text-navy-900 outline-none transition focus:border-navy-500 focus:ring-2 focus:ring-navy-500/20"
                    value={form.description}
                    onChange={(event) =>
                      updateForm({ description: event.target.value })
                    }
                    placeholder="Jelaskan kondisi, ukuran, alasan dijual, dan info lain yang membantu pembeli."
                    required
                  />
                </label>

                <div>
                  <span className="mb-1.5 block text-sm font-medium text-navy-800">
                    Foto Barang (opsional)
                  </span>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) void handleImage(file);
                    }}
                  />
                  {form.imageUrl ? (
                    <div className="relative w-fit">
                      <img
                        src={form.imageUrl}
                        alt="Pratinjau foto barang"
                        className="h-40 w-56 rounded-xl border border-navy-200 object-cover"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-navy-950/80 text-white transition hover:bg-red-600"
                        aria-label="Hapus foto"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      disabled={processingImage}
                      className="inline-flex items-center gap-2 rounded-lg border border-dashed border-navy-300 px-4 py-3 text-sm font-medium text-navy-700 transition hover:border-navy-500 hover:bg-navy-50 disabled:opacity-60"
                    >
                      {processingImage ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ImagePlus className="h-4 w-4" />
                      )}
                      {processingImage ? 'Memproses foto...' : 'Unggah Foto'}
                    </button>
                  )}
                  <p className="mt-1 text-xs text-navy-500">
                    Maksimal 10 MB. Foto otomatis diperkecil agar hemat ruang.
                  </p>
                </div>

                <label className="flex items-start gap-3 rounded-lg border border-navy-100 bg-navy-50 px-4 py-3 text-sm text-navy-700">
                  <input
                    type="checkbox"
                    checked={form.confirmed}
                    onChange={(event) =>
                      updateForm({ confirmed: event.target.checked })
                    }
                    className="mt-0.5 h-4 w-4 rounded border-navy-300 text-navy-900"
                  />
                  <span>
                    Saya memahami bahwa transaksi jual beli dilakukan di luar
                    platform dan menjadi tanggung jawab penjual serta pembeli.
                  </span>
                </label>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="submit"
                    disabled={submitting || processingImage}
                    className="inline-flex items-center gap-2 rounded-lg bg-navy-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                    {submitting ? 'Mengirim...' : 'Terbitkan Iklan'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="rounded-lg border border-navy-200 px-4 py-2.5 text-sm font-medium text-navy-700 transition hover:bg-navy-50"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </div>
          )}

          <div id="daftar-iklan" className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-serif text-2xl font-semibold text-navy-900">
                Iklan Terbaru
              </h2>
              <p className="mt-1 text-sm text-navy-600">
                {filtered.length} dari {listings.length} iklan ditampilkan.
              </p>
            </div>
            <button
              onClick={() => {
                setShowForm(true);
                setNotice('');
                setWarning('');
              }}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-gold-400 px-5 py-2.5 text-sm font-semibold text-navy-900 transition hover:bg-gold-300"
            >
              <Plus className="h-4 w-4" />
              Pasang Iklan
            </button>
          </div>

          <div className="mb-6 grid gap-3 sm:grid-cols-[1fr_220px]">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Cari barang, lokasi, atau deskripsi..."
                className="w-full rounded-lg border border-navy-200 bg-white py-2.5 pl-10 pr-3.5 text-sm text-navy-900 outline-none transition focus:border-navy-500 focus:ring-2 focus:ring-navy-500/20"
              />
            </label>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="w-full rounded-lg border border-navy-200 bg-white px-3.5 py-2.5 text-sm text-navy-900 outline-none transition focus:border-navy-500 focus:ring-2 focus:ring-navy-500/20"
            >
              <option value="Semua">Semua Kategori</option>
              {CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-navy-200 bg-white px-4 py-16 text-sm text-navy-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Memuat iklan...
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-navy-200 bg-white px-4 py-16 text-center">
              <ShoppingBag className="mx-auto h-10 w-10 text-navy-300" />
              <p className="mt-3 font-semibold text-navy-800">
                Belum ada iklan yang cocok.
              </p>
              <p className="mt-1 text-sm text-navy-500">
                Coba ubah kata kunci atau kategori, atau pasang iklan pertama.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((listing) => {
                const wa = whatsappLink(listing.contact);
                return (
                  <article
                    key={listing.id}
                    className="flex flex-col overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-soft transition hover:shadow-card"
                  >
                    <div className="relative aspect-[4/3] bg-navy-100">
                      {listing.imageUrl ? (
                        <img
                          src={listing.imageUrl}
                          alt={listing.title}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="grid h-full place-items-center text-navy-300">
                          <PackageSearch className="h-12 w-12" />
                        </div>
                      )}
                      <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
                        <span className="rounded-full bg-navy-950/80 px-2.5 py-1 text-[11px] font-semibold text-gold-300 backdrop-blur-sm">
                          {listing.category}
                        </span>
                        <span className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-navy-700 backdrop-blur-sm">
                          {listing.condition}
                        </span>
                        {listing.isSample && (
                          <span className="rounded-full bg-gold-400 px-2.5 py-1 text-[11px] font-semibold text-navy-900">
                            Contoh
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col p-5">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-serif text-lg font-semibold leading-snug text-navy-900">
                          {listing.title}
                        </h3>
                        <span className="shrink-0 rounded-lg bg-gold-50 px-2.5 py-1 text-sm font-bold text-gold-700">
                          {formatPrice(listing.price)}
                        </span>
                      </div>
                      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-navy-600">
                        {listing.description}
                      </p>
                      <div className="mt-3 space-y-1.5 text-xs text-navy-500">
                        <p className="inline-flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-gold-600" />
                          {listing.city}
                        </p>
                        <p className="inline-flex items-center gap-1.5">
                          <Tag className="h-3.5 w-3.5 text-gold-600" />
                          {listing.sellerName} · {formatDate(listing.createdAt)}
                        </p>
                      </div>
                      <div className="mt-4 flex-1" />
                      {wa ? (
                        <a
                          href={wa}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-800"
                        >
                          <WhatsAppIcon className="h-4 w-4" />
                          Hubungi Penjual
                        </a>
                      ) : (
                        <span className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-navy-100 px-4 py-2.5 text-sm font-semibold text-navy-500">
                          Kontak tidak tersedia
                        </span>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          <p className="mt-8 text-center text-xs leading-relaxed text-navy-500">
            Pasar Awardee adalah ruang iklan komunitas. Kelurahan LPDP UI tidak
            memungut biaya, tidak menjamin kualitas barang, dan tidak terlibat
            dalam transaksi. Laporkan iklan mencurigakan ke admin melalui kanal
            aspirasi.
          </p>
        </div>
      </section>
    </div>
  );
}
