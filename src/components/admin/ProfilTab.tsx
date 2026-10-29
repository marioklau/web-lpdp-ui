import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { Save, Upload } from 'lucide-react';
import { useContent, type SaveResult } from '@/lib/contentContext';
import {
  Field,
  SaveStatus,
  SectionHeader,
  btnPrimary,
  inputClass,
  textareaClass,
} from '@/components/admin/ui';
import type { Candidate } from '@/types';

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Gagal membaca file.'));
    reader.readAsDataURL(file);
  });
}

async function compressImage(file: File): Promise<string> {
  const original = await fileToDataUrl(file);
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Format gambar tidak didukung.'));
    img.src = original;
  });

  const maxSizes = [900, 700, 520];
  const qualities = [0.82, 0.7, 0.6, 0.5];
  let last = original;

  for (const maxSize of maxSizes) {
    const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas tidak didukung.');
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    for (const quality of qualities) {
      last = canvas.toDataURL('image/jpeg', quality);
      if (last.length <= 420000) return last;
    }
  }

  return last;
}

export default function ProfilTab() {
  const { candidate, saveCandidate } = useContent();
  const [form, setForm] = useState<Candidate>(candidate);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<SaveResult | null>(null);
  const [photoError, setPhotoError] = useState('');
  const [processing, setProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setForm(candidate);
  }, [candidate]);

  const update = (key: keyof Candidate, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    const res = await saveCandidate(form);
    setResult(res);
    setSaving(false);
  };

  const handlePhotoFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setPhotoError('File harus berupa gambar (JPG/PNG).');
      return;
    }
    setPhotoError('');
    setProcessing(true);
    try {
      const dataUrl = await compressImage(file);
      update('photoUrl', dataUrl);
    } catch (err) {
      setPhotoError(
        err instanceof Error ? err.message : 'Gagal memproses gambar.',
      );
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div>
      <SectionHeader
        title="Profil Kandidat"
        desc="Data ini tampil di bagian hero halaman beranda."
      />

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex shrink-0 flex-col items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Klik untuk mengganti foto"
            className="group relative block h-40 w-32 overflow-hidden rounded-xl border border-navy-100"
          >
            <img
              src={form.photoUrl || candidate.photoUrl}
              alt={form.name || 'Foto kandidat'}
              className="h-full w-full object-cover"
            />
            <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-navy-900/60 text-[11px] font-semibold text-white opacity-0 transition group-hover:opacity-100">
              <Upload className="h-5 w-5" />
              Ganti Foto
            </span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoFile}
          />
          <p className="max-w-[8rem] text-center text-xs text-navy-500">
            Klik foto untuk mengganti. JPG/PNG, otomatis dikompres.
          </p>
          {processing && (
            <p className="text-xs text-navy-600">Memproses foto…</p>
          )}
          {photoError && (
            <p className="max-w-[8rem] text-center text-xs text-red-600">
              {photoError}
            </p>
          )}
        </div>

        <div className="grid flex-1 gap-4 sm:grid-cols-2">
          <Field label="Nama">
            <input
              className={inputClass}
              value={form.name}
              onChange={(event) => update('name', event.target.value)}
            />
          </Field>
          <Field label="Posisi">
            <input
              className={inputClass}
              value={form.position}
              onChange={(event) => update('position', event.target.value)}
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Tagline">
              <input
                className={inputClass}
                value={form.tagline}
                onChange={(event) => update('tagline', event.target.value)}
              />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Bio">
              <textarea
                rows={3}
                className={textareaClass}
                value={form.bio}
                onChange={(event) => update('bio', event.target.value)}
              />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field
              label="URL Foto"
              hint="Opsional. Klik foto di samping untuk unggah dari perangkat, atau tempel URL gambar publik di sini."
            >
              <input
                className={inputClass}
                value={form.photoUrl.startsWith('data:') ? '' : form.photoUrl}
                placeholder={
                  form.photoUrl.startsWith('data:')
                    ? 'Foto diunggah dari perangkat'
                    : 'https://contoh.id/foto.jpg'
                }
                onChange={(event) => update('photoUrl', event.target.value)}
              />
            </Field>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <button className={btnPrimary} onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4" />
          {saving ? 'Menyimpan...' : 'Simpan Profil'}
        </button>
      </div>

      <SaveStatus result={result} />
    </div>
  );
}
