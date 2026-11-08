import { useState } from 'react';
import {
  Building2,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Star,
  Trash2,
  X,
} from 'lucide-react';
import {
  EmptyState,
  Field,
  SaveStatus,
  SectionHeader,
  btnDanger,
  btnGhost,
  btnGold,
  btnPrimary,
  inputClass,
  textareaClass,
} from '@/components/admin/ui';
import {
  KOS_CAMPUSES,
  KOS_FACILITIES,
  KOS_GENDERS,
  campusInfo,
  formatKosPrice,
  formatKosRating,
  genderLabel,
  kosRatingValue,
} from '@/lib/kos';
import type { SaveResult } from '@/lib/contentContext';
import type { KosCampus, KosListing } from '@/types';

function newListing(): KosListing {
  const center = campusInfo('depok').center;
  return {
    id: '',
    name: '',
    campus: 'depok',
    gender: 'campur',
    address: '',
    price: 1500000,
    facilities: [],
    contact: '',
    imageUrl: '',
    lat: center.lat,
    lng: center.lng,
    notes: '',
    ratingSum: 0,
    ratingCount: 0,
    createdAt: new Date().toISOString(),
    isSample: false,
  };
}

export default function KosTab({
  listings,
  loading,
  error,
  onRefresh,
  onSave,
  onDelete,
}: {
  listings: KosListing[];
  loading: boolean;
  error: string;
  onRefresh: () => void;
  onSave: (listing: KosListing) => Promise<SaveResult>;
  onDelete: (id: string) => Promise<SaveResult | null>;
}) {
  const [editing, setEditing] = useState<KosListing | null>(null);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<SaveResult | null>(null);

  const update = (patch: Partial<KosListing>) => {
    setEditing((current) => (current ? { ...current, ...patch } : current));
  };

  const startNew = () => {
    setResult(null);
    setEditing(newListing());
  };

  const startEdit = (listing: KosListing) => {
    setResult(null);
    setEditing({ ...listing, facilities: [...listing.facilities] });
  };

  const handleCampusChange = (campus: KosCampus) => {
    if (!editing) return;
    const previous = campusInfo(editing.campus).center;
    const next = campusInfo(campus).center;
    const onPreviousCenter =
      editing.lat === previous.lat && editing.lng === previous.lng;
    update({
      campus,
      ...(onPreviousCenter ? { lat: next.lat, lng: next.lng } : {}),
    });
  };

  const useCampusCenter = () => {
    if (!editing) return;
    const center = campusInfo(editing.campus).center;
    update({ lat: center.lat, lng: center.lng });
  };

  const toggleFacility = (facility: string) => {
    if (!editing) return;
    update({
      facilities: editing.facilities.includes(facility)
        ? editing.facilities.filter((item) => item !== facility)
        : [...editing.facilities, facility],
    });
  };

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    const res = await onSave(editing);
    setResult(res);
    setSaving(false);
    if (res.ok) setEditing(null);
  };

  const handleDelete = async (id: string) => {
    setResult(null);
    const res = await onDelete(id);
    if (res) setResult(res);
  };

  return (
    <div>
      <SectionHeader
        title="Katalog Kos"
        desc="Kelola data kos di sekitar UI Depok dan UI Salemba."
        action={
          <div className="flex flex-wrap gap-2">
            <button className={btnGhost} onClick={onRefresh} disabled={loading}>
              <RefreshCw
                className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
              />
              {loading ? 'Memuat...' : 'Muat Ulang'}
            </button>
            <button className={btnGold} onClick={startNew}>
              <Plus className="h-4 w-4" /> Tambah Kos
            </button>
          </div>
        }
      />

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {editing && (
        <div className="mb-6 rounded-xl border border-navy-200 bg-navy-50/50 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-navy-900">
              {listings.some((item) => item.id === editing.id)
                ? 'Edit Kos'
                : 'Kos Baru'}
            </h3>
            <button
              className="text-navy-500 hover:text-navy-900"
              onClick={() => setEditing(null)}
              aria-label="Tutup editor"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid gap-4">
            <Field label="Nama Kos">
              <input
                className={inputClass}
                value={editing.name}
                onChange={(event) => update({ name: event.target.value })}
                placeholder="Contoh: Kos Putri Melati"
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Kampus">
                <select
                  className={inputClass}
                  value={editing.campus}
                  onChange={(event) =>
                    handleCampusChange(event.target.value as KosCampus)
                  }
                >
                  {KOS_CAMPUSES.map((info) => (
                    <option key={info.id} value={info.id}>
                      {info.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Tipe Kos">
                <select
                  className={inputClass}
                  value={editing.gender}
                  onChange={(event) =>
                    update({
                      gender: event.target.value as KosListing['gender'],
                    })
                  }
                >
                  {KOS_GENDERS.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Harga per Bulan (Rp)">
                <input
                  type="number"
                  min={0}
                  step={50000}
                  className={inputClass}
                  value={editing.price}
                  onChange={(event) =>
                    update({
                      price: Math.max(0, Math.floor(Number(event.target.value))),
                    })
                  }
                />
              </Field>
              <Field label="Kontak WhatsApp" hint="Nomor HP atau WhatsApp pemilik.">
                <input
                  className={inputClass}
                  value={editing.contact}
                  onChange={(event) => update({ contact: event.target.value })}
                  placeholder="0812xxxxxxx"
                />
              </Field>
            </div>

            <Field label="Alamat">
              <input
                className={inputClass}
                value={editing.address}
                onChange={(event) => update({ address: event.target.value })}
                placeholder="Jl. ..., Kelurahan, Kota"
              />
            </Field>

            <Field
              label="URL Foto"
              hint="Opsional. Gunakan tautan gambar publik (https://...)."
            >
              <input
                className={inputClass}
                value={editing.imageUrl}
                onChange={(event) => update({ imageUrl: event.target.value })}
                placeholder="https://..."
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Latitude">
                <input
                  type="number"
                  step={0.000001}
                  className={inputClass}
                  value={editing.lat}
                  onChange={(event) =>
                    update({ lat: Number(event.target.value) })
                  }
                />
              </Field>
              <Field label="Longitude">
                <input
                  type="number"
                  step={0.000001}
                  className={inputClass}
                  value={editing.lng}
                  onChange={(event) =>
                    update({ lng: Number(event.target.value) })
                  }
                />
              </Field>
            </div>

            <p className="-mt-2 text-xs text-navy-500">
              Tip: klik kanan titik lokasi di Google Maps untuk menyalin
              koordinat.{' '}
              <button
                type="button"
                onClick={useCampusCenter}
                className="font-semibold text-navy-700 underline decoration-navy-300 underline-offset-2 hover:text-navy-900"
              >
                Gunakan titik kampus
              </button>
            </p>

            <Field label="Catatan">
              <textarea
                rows={3}
                className={textareaClass}
                value={editing.notes}
                onChange={(event) => update({ notes: event.target.value })}
                placeholder="Aturan sewa, deposit, fasilitas tambahan, dan informasi lain."
              />
            </Field>

            <div>
              <span className="mb-1.5 block text-sm font-medium text-navy-800">
                Perlengkapan
              </span>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {KOS_FACILITIES.map((facility) => {
                  const active = editing.facilities.includes(facility);
                  return (
                    <label
                      key={facility}
                      className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition ${
                        active
                          ? 'border-gold-400 bg-gold-50 text-navy-900'
                          : 'border-navy-200 bg-white text-navy-700 hover:border-gold-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={active}
                        onChange={() => toggleFacility(facility)}
                        className="accent-gold-500"
                      />
                      {facility}
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <button
              className={btnPrimary}
              onClick={() => void handleSave()}
              disabled={saving || !editing.name.trim() || !editing.address.trim()}
            >
              <Save className="h-4 w-4" />
              {saving ? 'Menyimpan...' : 'Simpan Kos'}
            </button>
            <button className={btnGhost} onClick={() => setEditing(null)}>
              Batal
            </button>
            {editing.ratingCount > 0 && (
              <span className="text-xs text-navy-500 sm:ml-auto">
                Rating {formatKosRating(kosRatingValue(editing))} dari{' '}
                {editing.ratingCount} penilai (tidak diubah).
              </span>
            )}
          </div>
        </div>
      )}

      {listings.length === 0 && !loading ? (
        <EmptyState
          message={'Belum ada data kos. Klik "Tambah Kos".'}
        />
      ) : (
        <div className="space-y-3">
          {listings.map((listing) => {
            const rating = kosRatingValue(listing);
            return (
              <div
                key={listing.id}
                className="rounded-xl border border-navy-100 p-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                  <div className="h-20 w-28 shrink-0 overflow-hidden rounded-lg border border-navy-100 bg-navy-50">
                    {listing.imageUrl ? (
                      <img
                        src={listing.imageUrl}
                        alt={listing.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="grid h-full place-items-center text-navy-300">
                        <Building2 className="h-8 w-8" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-navy-900">
                          {listing.name}
                        </p>
                        <p className="text-xs text-navy-500">
                          {campusInfo(listing.campus).label} ·{' '}
                          {genderLabel(listing.gender)} ·{' '}
                          {formatKosPrice(listing.price)}/bln
                          {listing.isSample ? ' · Contoh' : ''}
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-1 rounded-lg bg-gold-50 px-2.5 py-1 text-xs font-semibold text-gold-700">
                        <Star className="h-3.5 w-3.5 fill-gold-500 text-gold-500" />
                        {listing.ratingCount
                          ? `${formatKosRating(rating)} (${listing.ratingCount})`
                          : 'Baru'}
                      </span>
                    </div>

                    <p className="mt-1.5 text-sm text-navy-700">
                      {listing.address}
                    </p>
                    <p className="mt-1 text-xs text-navy-500">
                      {listing.facilities.length} perlengkapan ·{' '}
                      {listing.contact || 'Kontak belum diisi'}
                    </p>
                  </div>

                  {listing.isSample ? (
                    <span className="shrink-0 rounded-lg bg-gold-50 px-2.5 py-1.5 text-xs font-semibold text-gold-700">
                      Data contoh
                    </span>
                  ) : (
                    <div className="flex shrink-0 gap-2 self-start">
                      <button
                        className={btnGhost}
                        onClick={() => startEdit(listing)}
                      >
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </button>
                      <button
                        className={btnDanger}
                        onClick={() => void handleDelete(listing.id)}
                        aria-label={`Hapus ${listing.name}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Hapus
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <SaveStatus result={result} />
    </div>
  );
}
