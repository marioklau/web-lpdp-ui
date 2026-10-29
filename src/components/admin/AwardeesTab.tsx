import { useEffect, useMemo, useState } from 'react';
import { Pencil, Plus, Save, Search, Trash2, X } from 'lucide-react';
import { useContent, type SaveResult } from '@/lib/contentContext';
import {
  EmptyState,
  Field,
  SaveStatus,
  SectionHeader,
  btnDanger,
  btnGhost,
  btnPrimary,
  inputClass,
} from '@/components/admin/ui';
import type { AwardeeProfile } from '@/types';

const rowAction =
  'grid h-8 w-8 place-items-center rounded-md border border-navy-200 text-navy-600 transition hover:bg-navy-50';

export default function AwardeesTab() {
  const { awardees, provinces, saveAwardees } = useContent();
  const [form, setForm] = useState<AwardeeProfile[]>(awardees);
  const [query, setQuery] = useState('');
  const [provinceFilter, setProvinceFilter] = useState('all');
  const [editing, setEditing] = useState<AwardeeProfile | null>(null);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<SaveResult | null>(null);

  useEffect(() => {
    setForm(awardees);
  }, [awardees]);

  const provinceName = useMemo(
    () => new Map(provinces.map((province) => [province.id, province.name])),
    [provinces],
  );

  const sampleCount = form.filter((item) => item.isSample).length;

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return form.filter((item) => {
      if (provinceFilter !== 'all' && item.provinceId !== provinceFilter) {
        return false;
      }
      if (!keyword) return true;
      return [
        item.name,
        item.occupation,
        provinceName.get(item.provinceId) ?? '',
      ].some((value) => value.toLowerCase().includes(keyword));
    });
  }, [form, provinceFilter, provinceName, query]);

  const startAdd = () => {
    setFormError('');
    setEditing({
      id: crypto.randomUUID(),
      provinceId: provinces[0]?.id ?? '',
      name: '',
      occupation: '',
      photoUrl: '',
      isSample: false,
    });
  };

  const startEdit = (item: AwardeeProfile) => {
    setFormError('');
    setEditing({ ...item, isSample: false });
  };

  const commitEditor = () => {
    if (!editing) return;

    const name = editing.name.trim();
    const occupation = editing.occupation.trim();
    const photoUrl = editing.photoUrl.trim();

    if (!name || !occupation || !editing.provinceId || !photoUrl) {
      setFormError('Nama, pekerjaan, provinsi, dan URL foto wajib diisi.');
      return;
    }

    const cleaned: AwardeeProfile = {
      ...editing,
      name,
      occupation,
      photoUrl,
      isSample: false,
    };

    setForm((prev) => {
      const exists = prev.some((item) => item.id === cleaned.id);
      return exists
        ? prev.map((item) => (item.id === cleaned.id ? cleaned : item))
        : [...prev, cleaned];
    });
    setEditing(null);
    setFormError('');
  };

  const removeProfile = (item: AwardeeProfile) => {
    if (!window.confirm(`Hapus profil ${item.name}?`)) return;
    setForm((prev) => prev.filter((profile) => profile.id !== item.id));
    if (editing?.id === item.id) setEditing(null);
  };

  const clearSamples = () => {
    if (sampleCount === 0) return;
    if (
      !window.confirm(
        `Hapus ${sampleCount} profil contoh? Data resmi yang sudah ada tidak terhapus.`,
      )
    ) {
      return;
    }
    setForm((prev) => prev.filter((item) => !item.isSample));
  };

  const handleSave = async () => {
    setSaving(true);
    const res = await saveAwardees(form);
    setResult(res);
    setSaving(false);
  };

  return (
    <div>
      <SectionHeader
        title="Data Awardee"
        desc="Profil yang tampil saat provinsi diklik di peta: foto, nama, dan pekerjaan."
        action={
          <div className="flex flex-wrap items-center gap-2">
            {sampleCount > 0 && (
              <button className={btnDanger} onClick={clearSamples}>
                <Trash2 className="h-3.5 w-3.5" /> Hapus Contoh
              </button>
            )}
            <button className={btnPrimary} onClick={startAdd}>
              <Plus className="h-4 w-4" /> Tambah Awardee
            </button>
          </div>
        }
      />

      {editing && (
        <div className="mb-6 rounded-xl border border-navy-200 bg-navy-50/70 p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-serif text-lg font-semibold text-navy-900">
                {form.some((item) => item.id === editing.id)
                  ? 'Edit Awardee'
                  : 'Awardee Baru'}
              </h3>
              <p className="mt-1 text-xs text-navy-500">
                Perubahan disimpan permanen setelah tombol Simpan Perubahan
                ditekan.
              </p>
            </div>
            <button
              onClick={() => {
                setEditing(null);
                setFormError('');
              }}
              className={rowAction}
              aria-label="Tutup editor"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Nama">
              <input
                className={inputClass}
                value={editing.name}
                maxLength={120}
                onChange={(event) =>
                  setEditing((prev) =>
                    prev ? { ...prev, name: event.target.value } : prev,
                  )
                }
                placeholder="Nama lengkap awardee"
              />
            </Field>
            <Field label="Pekerjaan">
              <input
                className={inputClass}
                value={editing.occupation}
                maxLength={120}
                onChange={(event) =>
                  setEditing((prev) =>
                    prev ? { ...prev, occupation: event.target.value } : prev,
                  )
                }
                placeholder="Contoh: Dosen, Peneliti, Software Engineer"
              />
            </Field>
            <Field label="Provinsi">
              <select
                className={inputClass}
                value={editing.provinceId}
                onChange={(event) =>
                  setEditing((prev) =>
                    prev ? { ...prev, provinceId: event.target.value } : prev,
                  )
                }
              >
                {provinces.map((province) => (
                  <option key={province.id} value={province.id}>
                    {province.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field
              label="URL Foto"
              hint="Gunakan URL gambar publik (JPG/PNG) atau path lokal seperti /foto.jpg."
            >
              <div className="flex items-center gap-2">
                <input
                  className={inputClass}
                  value={editing.photoUrl}
                  maxLength={500}
                  onChange={(event) =>
                    setEditing((prev) =>
                      prev ? { ...prev, photoUrl: event.target.value } : prev,
                    )
                  }
                  placeholder="https://contoh.id/foto.jpg"
                />
                {editing.photoUrl && (
                  <img
                    src={editing.photoUrl}
                    alt="Pratinjau foto"
                    className="h-10 w-10 shrink-0 rounded-full border border-navy-200 bg-white object-cover"
                  />
                )}
              </div>
            </Field>
          </div>

          {formError && (
            <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {formError}
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <button className={btnPrimary} onClick={commitEditor}>
              <Save className="h-4 w-4" /> Simpan Profil
            </button>
            <button
              className={btnGhost}
              onClick={() => {
                setEditing(null);
                setFormError('');
              }}
            >
              Batal
            </button>
          </div>
        </div>
      )}

      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" />
          <input
            className={`${inputClass} pl-10`}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari nama, pekerjaan, atau provinsi..."
          />
        </div>
        <select
          className={`${inputClass} sm:w-64`}
          value={provinceFilter}
          onChange={(event) => setProvinceFilter(event.target.value)}
        >
          <option value="all">Semua provinsi</option>
          {provinces.map((province) => (
            <option key={province.id} value={province.id}>
              {province.name}
            </option>
          ))}
        </select>
      </div>

      {form.length === 0 ? (
        <EmptyState message="Belum ada data awardee. Klik Tambah Awardee untuk memulai." />
      ) : filtered.length === 0 ? (
        <EmptyState message="Tidak ada awardee yang cocok dengan pencarian." />
      ) : (
        <div className="max-h-[560px] overflow-auto rounded-xl border border-navy-100">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="sticky top-0 z-10 bg-navy-50">
              <tr className="text-left text-navy-600">
                <th className="w-16 px-3 py-2 font-medium">Foto</th>
                <th className="px-3 py-2 font-medium">Nama</th>
                <th className="px-3 py-2 font-medium">Pekerjaan</th>
                <th className="px-3 py-2 font-medium">Provinsi</th>
                <th className="w-24 px-3 py-2 text-right font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} className="border-t border-navy-50">
                  <td className="px-3 py-2">
                    <img
                      src={item.photoUrl}
                      alt={`Foto ${item.name}`}
                      loading="lazy"
                      className="h-10 w-10 rounded-full border border-navy-100 bg-navy-50 object-cover"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-navy-900">
                        {item.name}
                      </span>
                      {item.isSample && (
                        <span className="rounded-full bg-gold-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gold-700">
                          Contoh
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-navy-600">{item.occupation}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-navy-600">
                    {provinceName.get(item.provinceId) ?? item.provinceId}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex justify-end gap-1.5">
                      <button
                        className={rowAction}
                        onClick={() => startEdit(item)}
                        title="Edit awardee"
                        aria-label={`Edit ${item.name}`}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        className={`${rowAction} border-red-200 text-red-600 hover:bg-red-50`}
                        onClick={() => removeProfile(item)}
                        title="Hapus awardee"
                        aria-label={`Hapus ${item.name}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button className={btnPrimary} onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4" />
          {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
        <p className="text-xs text-navy-500">
          {form.length} profil · {sampleCount} contoh · menampilkan{' '}
          {filtered.length}
        </p>
      </div>

      <SaveStatus result={result} />
    </div>
  );
}
