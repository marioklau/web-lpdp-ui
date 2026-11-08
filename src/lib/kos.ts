import type { KosCampus, KosGender, KosListing } from '@/types';

export interface KosCampusInfo {
  id: KosCampus;
  label: string;
  short: string;
  center: { lat: number; lng: number };
}

export const KOS_CAMPUSES: KosCampusInfo[] = [
  {
    id: 'depok',
    label: 'UI Depok',
    short: 'Depok',
    center: { lat: -6.3625, lng: 106.827 },
  },
  {
    id: 'salemba',
    label: 'UI Salemba',
    short: 'Salemba',
    center: { lat: -6.1944, lng: 106.8497 },
  },
];

export const KOS_GENDERS: { id: KosGender; label: string }[] = [
  { id: 'putra', label: 'Putra' },
  { id: 'putri', label: 'Putri' },
  { id: 'campur', label: 'Campur' },
];

export const KOS_FACILITIES = [
  'AC',
  'Kipas Angin',
  'WiFi',
  'Kasur',
  'Lemari',
  'Meja Belajar',
  'Kamar Mandi Dalam',
  'Kamar Mandi Bersama',
  'Dapur Bersama',
  'Kulkas',
  'Listrik Termasuk',
  'Air Termasuk',
  'Parkir',
  'Laundry',
  'Keamanan 24 Jam',
  'TV',
];

export const KOS_LISTINGS_STORAGE_KEY = 'lpdp_kos_listings';
export const KOS_RATINGS_STORAGE_KEY = 'lpdp_kos_ratings';
export const KOS_MY_RATINGS_STORAGE_KEY = 'lpdp_kos_my_ratings';

export interface KosRatingAggregate {
  sum: number;
  count: number;
}

export function campusInfo(id: KosCampus): KosCampusInfo {
  return KOS_CAMPUSES.find((campus) => campus.id === id) ?? KOS_CAMPUSES[0];
}

export function genderLabel(id: KosGender): string {
  return KOS_GENDERS.find((gender) => gender.id === id)?.label ?? 'Campur';
}

export function formatKosPrice(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Math.max(0, Math.floor(value)));
}

export function kosRatingValue(
  listing: Pick<KosListing, 'ratingSum' | 'ratingCount'>,
): number {
  if (listing.ratingCount <= 0) return 0;
  return listing.ratingSum / listing.ratingCount;
}

export function formatKosRating(value: number): string {
  return value.toLocaleString('id-ID', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}

export function distanceKm(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number,
): number {
  const earthRadius = 6371;
  const deltaLat = toRadians(toLat - fromLat);
  const deltaLng = toRadians(toLng - fromLng);
  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(toRadians(fromLat)) *
      Math.cos(toRadians(toLat)) *
      Math.sin(deltaLng / 2) ** 2;
  return 2 * earthRadius * Math.asin(Math.sqrt(a));
}

export function kosDistanceKm(
  listing: Pick<KosListing, 'campus' | 'lat' | 'lng'>,
): number {
  const center = campusInfo(listing.campus).center;
  return distanceKm(center.lat, center.lng, listing.lat, listing.lng);
}

export function formatKosDistance(listing: Pick<KosListing, 'campus' | 'lat' | 'lng'>): string {
  const km = kosDistanceKm(listing);
  if (!Number.isFinite(km)) return 'Lokasi belum diatur';
  if (km < 1) return `${Math.max(50, Math.round((km * 1000) / 50) * 50)} m dari kampus`;
  return `${km.toLocaleString('id-ID', { maximumFractionDigits: 1 })} km dari kampus`;
}

export function kosWhatsAppLink(contact: string): string {
  const digits = contact.replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('0')) return `https://wa.me/62${digits.slice(1)}`;
  if (digits.startsWith('8')) return `https://wa.me/62${digits}`;
  return `https://wa.me/${digits}`;
}

export function toKosPayload(
  listing: KosListing,
): Omit<KosListing, 'id' | 'isSample'> {
  return {
    name: listing.name,
    campus: listing.campus,
    gender: listing.gender,
    address: listing.address,
    price: listing.price,
    facilities: listing.facilities,
    contact: listing.contact,
    imageUrl: listing.imageUrl,
    lat: listing.lat,
    lng: listing.lng,
    notes: listing.notes,
    ratingSum: listing.ratingSum,
    ratingCount: listing.ratingCount,
    createdAt: listing.createdAt,
  };
}
