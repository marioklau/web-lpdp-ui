import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  GraduationCap,
  Info,
  Loader2,
  MapPin,
  Search,
  Star,
  Wallet,
  X,
} from 'lucide-react';
import KosMap from '@/components/kos/KosMap';
import { WhatsAppIcon } from '@/components/BrandIcons';
import {
  fetchKosListings,
  isFirebaseConfigured,
  rateKosListing,
} from '@/lib/firebase';
import { SAMPLE_KOS_LISTINGS } from '@/lib/kosSamples';
import {
  KOS_CAMPUSES,
  KOS_FACILITIES,
  KOS_GENDERS,
  KOS_LISTINGS_STORAGE_KEY,
  KOS_MY_RATINGS_STORAGE_KEY,
  KOS_RATINGS_STORAGE_KEY,
  campusInfo,
  formatKosDistance,
  formatKosPrice,
  formatKosRating,
  genderLabel,
  kosDistanceKm,
  kosRatingValue,
  kosWhatsAppLink,
  type KosRatingAggregate,
} from '@/lib/kos';
import { useLocalStorage } from '@/lib/useLocalStorage';
import type { KosCampus, KosGender, KosListing } from '@/types';

type CampusFilter = 'all' | KosCampus;
type GenderFilter = 'all' | KosGender;
type SortKey = 'rating' | 'price-asc' | 'price-desc' | 'distance';

const SORT_OPTIONS: { id: SortKey; label: string }[] = [
  { id: 'rating', label: 'Rating tertinggi' },
  { id: 'price-asc', label: 'Harga termurah' },
  { id: 'price-desc', label: 'Harga tertinggi' },
  { id: 'distance', label: 'Terdekat dari kampus' },
];

const MAX_PRICE = 3000000;
const PRICE_STEP = 100000;

function RatingStars({
  value,
  size = 'sm',
}: {
  value: number;
  size?: 'sm' | 'lg';
}) {
  const dimension = size === 'lg' ? 'h-5 w-5' : 'h-3.5 w-3.5';
  return (
    <span className="inline-flex items-center gap-0.5" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${dimension} ${
            star <= Math.round(value)
              ? 'fill-gold-400 text-gold-400'
              : 'text-navy-200'
          }`}
        />
      ))}
    </span>
  );
}

function KosCard({
  listing,
  onOpen,
}: {
  listing: KosListing;
  onOpen: () => void;
}) {
  const info = campusInfo(listing.campus);
  const rating = kosRatingValue(listing);
  const previewFacilities = listing.facilities.slice(0, 3);
  const remaining = listing.facilities.length - previewFacilities.length;

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onOpen();
        }
      }}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-soft transition hover:-translate-y-1 hover:shadow-card focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-navy-800 to-navy-950">
        {listing.imageUrl ? (
          <img
            src={listing.imageUrl}
            alt={listing.name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full place-items-center">
            <Building2 className="h-14 w-14 text-gold-300/60" />
          </div>
        )}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-navy-950/80 px-2.5 py-1 text-[11px] font-semibold text-gold-300 backdrop-blur-sm">
            {info.label}
          </span>
          <span className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-navy-700 backdrop-blur-sm">
            {genderLabel(listing.gender)}
          </span>
          {listing.isSample && (
            <span className="rounded-full bg-gold-400 px-2.5 py-1 text-[11px] font-semibold text-navy-900">
              Contoh
            </span>
          )}
        </div>
        <span className="absolute bottom-3 right-3 rounded-lg bg-gold-400 px-3 py-1.5 text-sm font-bold text-navy-900 shadow-soft">
          {formatKosPrice(listing.price)}
          <span className="text-[10px] font-semibold">/bln</span>
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-serif text-lg font-semibold leading-snug text-navy-900">
          {listing.name}
        </h3>
        <p className="mt-1.5 flex items-start gap-1.5 text-xs leading-relaxed text-navy-500">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold-600" />
          {listing.address}
        </p>
        <p className="mt-1 flex items-center gap-1.5 text-xs text-navy-500">
          <GraduationCap className="h-3.5 w-3.5 text-gold-600" />
          {formatKosDistance(listing)}
        </p>

        <div className="mt-3 flex items-center gap-2">
          <RatingStars value={rating} />
          <span className="text-xs font-semibold text-navy-800">
            {listing.ratingCount ? formatKosRating(rating) : 'Baru'}
          </span>
          {listing.ratingCount > 0 && (
            <span className="text-xs text-navy-400">
              ({listing.ratingCount} rating)
            </span>
          )}
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {previewFacilities.map((facility) => (
            <span
              key={facility}
              className="rounded-full bg-navy-50 px-2.5 py-1 text-[11px] text-navy-600"
            >
              {facility}
            </span>
          ))}
          {remaining > 0 && (
            <span className="rounded-full bg-gold-50 px-2.5 py-1 text-[11px] font-semibold text-gold-700">
              +{remaining}
            </span>
          )}
        </div>

        <div className="mt-4 flex-1" />
        <span className="inline-flex items-center justify-center gap-1 text-sm font-semibold text-navy-900 transition group-hover:text-gold-600">
          Lihat detail
          <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </article>
  );
}

export default function KosPage() {
  const [localListings] = useLocalStorage<KosListing[]>(
    KOS_LISTINGS_STORAGE_KEY,
    [],
  );
  const [remoteListings, setRemoteListings] = useState<KosListing[]>([]);
  const [loading, setLoading] = useState(isFirebaseConfigured);
  const [loadError, setLoadError] = useState('');

  const [localRatings, setLocalRatings] = useLocalStorage<
    Record<string, KosRatingAggregate>
  >(KOS_RATINGS_STORAGE_KEY, {});
  const [myRatings, setMyRatings] = useLocalStorage<Record<string, number>>(
    KOS_MY_RATINGS_STORAGE_KEY,
    {},
  );

  const [campus, setCampus] = useState<CampusFilter>('all');
  const [gender, setGender] = useState<GenderFilter>('all');
  const [maxPrice, setMaxPrice] = useState(0);
  const [facilities, setFacilities] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortKey>('rating');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [ratingBusy, setRatingBusy] = useState(false);
  const [ratingError, setRatingError] = useState('');
  const [ratingNotice, setRatingNotice] = useState('');

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    let cancelled = false;
    setLoading(true);
    void fetchKosListings().then((items) => {
      if (cancelled) return;
      if (items === null) {
        setLoadError(
          'Data kos dari server gagal dimuat. Menampilkan data contoh dan data yang tersimpan di browser ini. Pastikan aturan Firestore terbaru (firestore.rules) sudah di-deploy.',
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

  const remoteIds = useMemo(
    () => new Set(remoteListings.map((item) => item.id)),
    [remoteListings],
  );

  const listings = useMemo(() => {
    const map = new Map<string, KosListing>();
    for (const item of SAMPLE_KOS_LISTINGS) map.set(item.id, item);
    for (const item of localListings) map.set(item.id, item);
    for (const item of remoteListings) map.set(item.id, item);
    return [...map.values()];
  }, [localListings, remoteListings]);

  const ratedListings = useMemo(
    () =>
      listings.map((listing) => {
        if (remoteIds.has(listing.id)) return listing;
        const local = localRatings[listing.id];
        if (!local) return listing;
        return {
          ...listing,
          ratingSum: listing.ratingSum + local.sum,
          ratingCount: listing.ratingCount + local.count,
        };
      }),
    [listings, localRatings, remoteIds],
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const result = ratedListings.filter((listing) => {
      if (campus !== 'all' && listing.campus !== campus) return false;
      if (gender !== 'all' && listing.gender !== gender) return false;
      if (maxPrice > 0 && listing.price > maxPrice) return false;
      if (
        facilities.length > 0 &&
        !facilities.every((facility) =>
          listing.facilities.includes(facility),
        )
      ) {
        return false;
      }
      if (!needle) return true;
      return [
        listing.name,
        listing.address,
        listing.notes,
        ...listing.facilities,
      ].some((value) => value.toLowerCase().includes(needle));
    });

    result.sort((a, b) => {
      switch (sort) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'distance':
          return kosDistanceKm(a) - kosDistanceKm(b);
        default:
          return (
            kosRatingValue(b) - kosRatingValue(a) ||
            b.ratingCount - a.ratingCount
          );
      }
    });

    return result;
  }, [ratedListings, campus, gender, maxPrice, facilities, query, sort]);

  const campusCounts = useMemo(
    () => ({
      depok: ratedListings.filter((item) => item.campus === 'depok').length,
      salemba: ratedListings.filter((item) => item.campus === 'salemba').length,
    }),
    [ratedListings],
  );

  const averageRating = useMemo(() => {
    const rated = ratedListings.filter((item) => item.ratingCount > 0);
    if (!rated.length) return 0;
    return (
      rated.reduce((total, item) => total + kosRatingValue(item), 0) /
      rated.length
    );
  }, [ratedListings]);

  const cheapestPrice = useMemo(() => {
    if (!ratedListings.length) return 0;
    return Math.min(...ratedListings.map((item) => item.price));
  }, [ratedListings]);

  const selected = useMemo(
    () => ratedListings.find((item) => item.id === selectedId) ?? null,
    [ratedListings, selectedId],
  );

  const myRating = selected ? myRatings[selected.id] : undefined;
  const filtersActive =
    campus !== 'all' ||
    gender !== 'all' ||
    maxPrice > 0 ||
    facilities.length > 0 ||
    query.trim() !== '';

  useEffect(() => {
    if (!selectedId) return;
    const previousOverflow = document.body.style.overflow;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedId(null);
    };
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKey);
    };
  }, [selectedId]);

  useEffect(() => {
    setRatingError('');
    setRatingNotice('');
  }, [selectedId]);

  const openListing = (id: string) => {
    setSelectedId(id);
    setRatingError('');
    setRatingNotice('');
  };

  const toggleFacility = (facility: string) => {
    setFacilities((current) =>
      current.includes(facility)
        ? current.filter((item) => item !== facility)
        : [...current, facility],
    );
  };

  const resetFilters = () => {
    setCampus('all');
    setGender('all');
    setMaxPrice(0);
    setFacilities([]);
    setQuery('');
    setSort('rating');
  };

  const submitRating = async (value: number) => {
    if (!selected || ratingBusy || myRatings[selected.id]) return;
    setRatingBusy(true);
    setRatingError('');
    setRatingNotice('');

    if (isFirebaseConfigured && remoteIds.has(selected.id)) {
      const result = await rateKosListing(selected.id, value);
      if (!result) {
        setRatingBusy(false);
        setRatingError(
          'Rating gagal dikirim ke server. Periksa koneksi lalu coba lagi.',
        );
        return;
      }
      setRemoteListings((current) =>
        current.map((item) =>
          item.id === selected.id
            ? {
                ...item,
                ratingSum: result.ratingSum,
                ratingCount: result.ratingCount,
              }
            : item,
        ),
      );
    } else {
      setLocalRatings((current) => {
        const aggregate = current[selected.id] ?? { sum: 0, count: 0 };
        return {
          ...current,
          [selected.id]: {
            sum: aggregate.sum + value,
            count: aggregate.count + 1,
          },
        };
      });
    }

    setMyRatings((current) => ({ ...current, [selected.id]: value }));
    setRatingBusy(false);
    setRatingNotice('Terima kasih! Rating Anda sudah tersimpan.');
  };

  const selectedWhatsApp = selected ? kosWhatsAppLink(selected.contact) : '';

  return (
    <div className="bg-navy-950">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800" />
        <div className="absolute -right-24 top-0 h-80 w-80 rounded-full bg-gold-400/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-navy-500/20 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <span className="inline-flex items-center gap-2 rounded-full bg-gold-400/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-gold-300 ring-1 ring-gold-400/30">
            <GraduationCap className="h-3.5 w-3.5" />
            Katalog kos awardee
          </span>
          <h1 className="mt-5 font-serif text-5xl font-semibold leading-[1.05] text-white sm:text-6xl">
            Katalog Kos
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-navy-200 sm:text-lg">
            Cari kos dekat UI Depok dan UI Salemba. Bandingkan harga, rating,
            perlengkapan, dan titik lokasinya langsung di peta.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#katalog"
              className="inline-flex items-center gap-2 rounded-lg bg-gold-400 px-6 py-3 text-sm font-semibold text-navy-900 transition-colors hover:bg-gold-300"
            >
              Jelajahi katalog
              <ArrowRight className="h-4 w-4" />
            </a>
            {KOS_CAMPUSES.map((info) => (
              <button
                key={info.id}
                onClick={() => {
                  setCampus(info.id);
                  document
                    .getElementById('katalog')
                    ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                {info.label}
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-gold-300">
                  {campusCounts[info.id]}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-2 text-sm">
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-navy-100">
              <strong className="text-gold-300">{ratedListings.length}</strong>{' '}
              kos terdaftar
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-navy-100">
              <Star className="mr-1 inline h-3.5 w-3.5 fill-gold-400 text-gold-400" />
              <strong className="text-gold-300">
                {formatKosRating(averageRating)}
              </strong>{' '}
              rata-rata rating
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-navy-100">
              Mulai{' '}
              <strong className="text-gold-300">
                {formatKosPrice(cheapestPrice)}
              </strong>
              /bulan
            </span>
          </div>
        </div>
      </section>

      <section
        id="katalog"
        className="scroll-mt-24 bg-navy-50 py-12 sm:py-16"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {loadError && (
            <div className="mb-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{loadError}</span>
            </div>
          )}
          {!isFirebaseConfigured && (
            <div className="mb-4 flex items-start gap-3 rounded-xl border border-gold-200 bg-gold-50 px-4 py-3 text-sm text-gold-800">
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                Mode demo lokal: data kos tambahan dan rating hanya tersimpan di
                browser ini. Hubungkan Firebase agar katalog tampil untuk semua
                pengunjung.
              </span>
            </div>
          )}
          <div className="mb-4 flex items-start gap-3 rounded-xl border border-navy-100 bg-white px-4 py-3 text-sm text-navy-600">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" />
            <span>
              Kos bertanda <strong>Contoh</strong> adalah data ilustrasi. Harga
              dan ketersediaan dapat berubah; selalu konfirmasi langsung ke
              pemilik kos sebelum membayar.
            </span>
          </div>

          <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-soft sm:p-6">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setCampus('all')}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                  campus === 'all'
                    ? 'bg-gold-400 text-navy-900 shadow-soft'
                    : 'border border-navy-200 bg-white text-navy-700 hover:border-gold-300'
                }`}
              >
                Semua kampus
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] ${
                    campus === 'all'
                      ? 'bg-navy-900/10 text-navy-900'
                      : 'bg-navy-50 text-navy-500'
                  }`}
                >
                  {ratedListings.length}
                </span>
              </button>
              {KOS_CAMPUSES.map((info) => (
                <button
                  key={info.id}
                  onClick={() => setCampus(info.id)}
                  className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                    campus === info.id
                      ? 'bg-gold-400 text-navy-900 shadow-soft'
                      : 'border border-navy-200 bg-white text-navy-700 hover:border-gold-300'
                  }`}
                >
                  <GraduationCap className="h-4 w-4" />
                  {info.label}
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] ${
                      campus === info.id
                        ? 'bg-navy-900/10 text-navy-900'
                        : 'bg-navy-50 text-navy-500'
                    }`}
                  >
                    {campusCounts[info.id]}
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_200px_210px]">
              <label className="relative block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Cari nama kos, alamat, atau perlengkapan..."
                  aria-label="Cari kos"
                  className="w-full rounded-lg border border-navy-200 bg-white py-2.5 pl-10 pr-3.5 text-sm text-navy-900 outline-none transition focus:border-navy-500 focus:ring-2 focus:ring-navy-500/20"
                />
              </label>
              <select
                value={gender}
                onChange={(event) =>
                  setGender(event.target.value as GenderFilter)
                }
                aria-label="Filter tipe kos"
                className="w-full rounded-lg border border-navy-200 bg-white px-3.5 py-2.5 text-sm text-navy-900 outline-none transition focus:border-navy-500 focus:ring-2 focus:ring-navy-500/20"
              >
                <option value="all">Semua tipe</option>
                {KOS_GENDERS.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value as SortKey)}
                aria-label="Urutkan kos"
                className="w-full rounded-lg border border-navy-200 bg-white px-3.5 py-2.5 text-sm text-navy-900 outline-none transition focus:border-navy-500 focus:ring-2 focus:ring-navy-500/20"
              >
                {SORT_OPTIONS.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-4 rounded-xl border border-navy-100 bg-navy-50/60 px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="inline-flex items-center gap-2 font-medium text-navy-800">
                  <Wallet className="h-4 w-4 text-gold-600" />
                  Harga maksimum per bulan
                </span>
                <span className="font-semibold text-navy-900">
                  {maxPrice === 0
                    ? 'Semua harga'
                    : `≤ ${formatKosPrice(maxPrice)}`}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={MAX_PRICE}
                step={PRICE_STEP}
                value={maxPrice}
                onChange={(event) => setMaxPrice(Number(event.target.value))}
                aria-label="Harga maksimum per bulan"
                className="mt-2 w-full accent-gold-400"
              />
              <div className="flex justify-between text-[11px] text-navy-500">
                <span>Semua harga</span>
                <span>{formatKosPrice(MAX_PRICE)}</span>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-gold-600">
                Perlengkapan
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {KOS_FACILITIES.map((facility) => {
                  const active = facilities.includes(facility);
                  return (
                    <button
                      key={facility}
                      type="button"
                      onClick={() => toggleFacility(facility)}
                      aria-pressed={active}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                        active
                          ? 'border-gold-400 bg-gold-400 text-navy-900'
                          : 'border-navy-200 bg-white text-navy-700 hover:border-gold-300'
                      }`}
                    >
                      {active && <Check className="h-3.5 w-3.5" />}
                      {facility}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-navy-100 pt-4 text-sm">
              <p className="text-navy-600">
                <strong className="text-navy-900">{filtered.length}</strong> kos
                sesuai filter
                {loading && (
                  <span className="ml-2 inline-flex items-center gap-1 text-xs text-navy-400">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    memuat data server
                  </span>
                )}
              </p>
              {filtersActive && (
                <button
                  onClick={resetFilters}
                  className="font-semibold text-gold-700 transition hover:text-gold-600"
                >
                  Reset filter
                </button>
              )}
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-soft">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-navy-100 px-5 py-4">
              <div>
                <h2 className="font-serif text-lg font-semibold text-navy-900">
                  Peta kos
                </h2>
                <p className="text-xs text-navy-500">
                  Klik penanda untuk membuka detail kos.
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs text-navy-600">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-gold-400" />
                  UI Depok
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-navy-600" />
                  UI Salemba
                </span>
              </div>
            </div>
            <div className="h-[380px] sm:h-[440px]">
              <KosMap
                listings={filtered}
                campus={campus}
                selectedId={selectedId}
                onSelect={openListing}
              />
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-serif text-2xl font-semibold text-navy-900">
                Daftar kos
              </h2>
              <p className="mt-1 text-sm text-navy-600">
                {filtered.length} dari {ratedListings.length} kos ditampilkan.
                Urut:{' '}
                {SORT_OPTIONS.find((item) => item.id === sort)?.label}.
              </p>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-dashed border-navy-200 bg-white px-4 py-16 text-center">
              <Building2 className="mx-auto h-10 w-10 text-navy-300" />
              <p className="mt-3 font-semibold text-navy-800">
                Belum ada kos yang cocok.
              </p>
              <p className="mt-1 text-sm text-navy-500">
                Coba longgarkan harga, kurangi perlengkapan, atau ubah kata
                kunci.
              </p>
              {filtersActive && (
                <button
                  onClick={resetFilters}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-navy-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-800"
                >
                  Reset filter
                </button>
              )}
            </div>
          ) : (
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((listing) => (
                <KosCard
                  key={listing.id}
                  listing={listing}
                  onOpen={() => openListing(listing.id)}
                />
              ))}
            </div>
          )}

          <p className="mt-8 text-center text-xs leading-relaxed text-navy-500">
            Katalog Kos adalah layanan informasi komunitas. Kelurahan LPDP UI
            tidak memungut biaya dan tidak menjamin kualitas kos. Selalu
            kunjungi lokasi dan periksa kesepakatan sebelum membayar.
          </p>
        </div>
      </section>

      {selected && (
        <div
          className="fixed inset-0 z-[1100] grid place-items-center overflow-y-auto bg-navy-950/70 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="kos-modal-title"
          onClick={() => setSelectedId(null)}
        >
          <div
            className="max-h-[92vh] w-full max-w-2xl overflow-auto rounded-2xl bg-white shadow-card"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="relative h-48 bg-gradient-to-br from-navy-800 to-navy-950 sm:h-60">
              {selected.imageUrl ? (
                <img
                  src={selected.imageUrl}
                  alt={selected.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="grid h-full place-items-center">
                  <Building2 className="h-16 w-16 text-gold-300/60" />
                </div>
              )}
              <div className="absolute left-4 top-4 flex flex-wrap gap-1.5">
                <span className="rounded-full bg-navy-950/80 px-3 py-1 text-[11px] font-semibold text-gold-300 backdrop-blur-sm">
                  {campusInfo(selected.campus).label}
                </span>
                <span className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-navy-700 backdrop-blur-sm">
                  {genderLabel(selected.gender)}
                </span>
                {selected.isSample && (
                  <span className="rounded-full bg-gold-400 px-3 py-1 text-[11px] font-semibold text-navy-900">
                    Contoh
                  </span>
                )}
              </div>
              <button
                onClick={() => setSelectedId(null)}
                className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-navy-950/70 text-white transition hover:bg-navy-950"
                aria-label="Tutup detail kos"
              >
                <X className="h-5 w-5" />
              </button>
              <span className="absolute bottom-4 right-4 rounded-lg bg-gold-400 px-3 py-1.5 text-sm font-bold text-navy-900 shadow-soft">
                {formatKosPrice(selected.price)}
                <span className="text-[10px] font-semibold">/bln</span>
              </span>
            </div>

            <div className="p-6 sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h3
                  id="kos-modal-title"
                  className="font-serif text-2xl font-semibold text-navy-900"
                >
                  {selected.name}
                </h3>
                <div className="flex items-center gap-2">
                  <RatingStars value={kosRatingValue(selected)} />
                  <span className="text-sm font-semibold text-navy-800">
                    {selected.ratingCount
                      ? `${formatKosRating(kosRatingValue(selected))} (${selected.ratingCount})`
                      : 'Belum ada rating'}
                  </span>
                </div>
              </div>

              <p className="mt-2 flex items-start gap-2 text-sm text-navy-600">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" />
                {selected.address}
              </p>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-navy-600">
                <span className="inline-flex items-center gap-1.5">
                  <GraduationCap className="h-4 w-4 text-gold-600" />
                  {campusInfo(selected.campus).label}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-gold-600" />
                  {formatKosDistance(selected)}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Wallet className="h-4 w-4 text-gold-600" />
                  {formatKosPrice(selected.price)}/bulan
                </span>
              </div>

              {selected.notes && (
                <p className="mt-4 rounded-xl bg-navy-50 px-4 py-3 text-sm leading-relaxed text-navy-700">
                  {selected.notes}
                </p>
              )}

              <div className="mt-5">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-gold-600">
                  Perlengkapan
                </h4>
                {selected.facilities.length > 0 ? (
                  <ul className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {selected.facilities.map((facility) => (
                      <li
                        key={facility}
                        className="flex items-center gap-2 rounded-lg bg-navy-50 px-3 py-2 text-xs text-navy-700"
                      >
                        <Check className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                        {facility}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-navy-500">
                    Belum ada data perlengkapan.
                  </p>
                )}
              </div>

              <div className="mt-5 rounded-xl border border-navy-100 bg-navy-50/60 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-semibold text-navy-900">
                      Beri rating kos ini
                    </h4>
                    <p className="mt-0.5 text-xs text-navy-500">
                      {myRating
                        ? `Rating Anda: ${myRating}/5`
                        : 'Pilih 1 sampai 5 bintang. Satu rating per perangkat.'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const active = myRating ? star <= myRating : false;
                      return (
                        <button
                          key={star}
                          type="button"
                          onClick={() => void submitRating(star)}
                          disabled={ratingBusy || Boolean(myRating)}
                          aria-label={`Beri ${star} bintang`}
                          className="rounded p-0.5 transition hover:scale-110 disabled:cursor-not-allowed"
                        >
                          <Star
                            className={`h-7 w-7 ${
                              active
                                ? 'fill-gold-400 text-gold-400'
                                : 'text-navy-300'
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
                {ratingBusy && (
                  <p className="mt-2 inline-flex items-center gap-2 text-xs text-navy-500">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Mengirim rating...
                  </p>
                )}
                {ratingError && (
                  <p className="mt-2 text-xs font-medium text-red-600">
                    {ratingError}
                  </p>
                )}
                {ratingNotice && (
                  <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {ratingNotice}
                  </p>
                )}
              </div>

              <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                {selectedWhatsApp ? (
                  <a
                    href={selectedWhatsApp}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-navy-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-800"
                  >
                    <WhatsAppIcon className="h-4 w-4" />
                    Hubungi pemilik
                  </a>
                ) : (
                  <span className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-navy-100 px-5 py-2.5 text-sm font-semibold text-navy-500">
                    Kontak belum tersedia
                  </span>
                )}
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${selected.lat},${selected.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-navy-200 px-5 py-2.5 text-sm font-semibold text-navy-800 transition hover:bg-navy-50"
                >
                  <MapPin className="h-4 w-4" />
                  Buka di Google Maps
                </a>
              </div>

              {selected.isSample && (
                <p className="mt-4 text-[11px] text-gold-700">
                  Data kos ini masih contoh. Rating yang Anda berikan tersimpan
                  di perangkat ini.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
