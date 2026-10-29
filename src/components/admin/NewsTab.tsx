import { useState } from 'react';
import { Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import { useContent, type SaveResult } from '@/lib/contentContext';
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
import type { NewsItem } from '@/types';

export default function NewsTab() {
  const { news, saveNews } = useContent();
  const [editing, setEditing] = useState<NewsItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<SaveResult | null>(null);

  const startNew = () => {
    setEditing({
      id: crypto.randomUUID(),
      title: '',
      excerpt: '',
      date: new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
      category: 'Kegiatan',
      imageUrl: '',
    });
  };

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    const exists = news.some((item) => item.id === editing.id);
    const next = exists
      ? news.map((item) => (item.id === editing.id ? editing : item))
      : [...news, editing];
    const res = await saveNews(next);
    setResult(res);
    setSaving(false);
    if (res.ok) setEditing(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Hapus berita ini?')) return;
    const res = await saveNews(news.filter((item) => item.id !== id));
    setResult(res);
    if (editing?.id === id) setEditing(null);
  };

  return (
    <div>
      <SectionHeader
        title="Berita & Kegiatan"
        desc="Kartu berita yang tampil di beranda."
        action={
          <button className={btnGold} onClick={startNew}>
            <Plus className="h-4 w-4" /> Tambah Berita
          </button>
        }
      />

      {editing && (
        <div className="mb-6 rounded-xl border border-navy-200 bg-navy-50/50 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-navy-900">
              {news.some((item) => item.id === editing.id)
                ? 'Edit Berita'
                : 'Berita Baru'}
            </h3>
            <button
              className="text-navy-500 hover:text-navy-900"
              onClick={() => setEditing(null)}
              aria-label="Tutup editor"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field label="Judul">
                <input
                  className={inputClass}
                  value={editing.title}
                  onChange={(event) =>
                    setEditing({ ...editing, title: event.target.value })
                  }
                />
              </Field>
            </div>
            <Field label="Tanggal" hint="Contoh: 12 Oktober 2026">
              <input
                className={inputClass}
                value={editing.date}
                onChange={(event) =>
                  setEditing({ ...editing, date: event.target.value })
                }
              />
            </Field>
            <Field label="Kategori">
              <input
                className={inputClass}
                value={editing.category}
                onChange={(event) =>
                  setEditing({ ...editing, category: event.target.value })
                }
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="URL Gambar">
                <input
                  className={inputClass}
                  value={editing.imageUrl}
                  onChange={(event) =>
                    setEditing({ ...editing, imageUrl: event.target.value })
                  }
                />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Ringkasan">
                <textarea
                  rows={3}
                  className={textareaClass}
                  value={editing.excerpt}
                  onChange={(event) =>
                    setEditing({ ...editing, excerpt: event.target.value })
                  }
                />
              </Field>
            </div>
          </div>

          <div className="mt-5 flex gap-2">
            <button
              className={btnPrimary}
              onClick={handleSave}
              disabled={saving || !editing.title.trim()}
            >
              <Save className="h-4 w-4" />
              {saving ? 'Menyimpan...' : 'Simpan Berita'}
            </button>
            <button className={btnGhost} onClick={() => setEditing(null)}>
              Batal
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {news.map((item) => (
          <div
            key={item.id}
            className="flex gap-3 overflow-hidden rounded-xl border border-navy-100"
          >
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt={item.title}
                className="h-28 w-28 shrink-0 object-cover"
              />
            ) : (
              <div className="grid h-28 w-28 shrink-0 place-items-center bg-navy-50 text-xs text-navy-400">
                Tanpa gambar
              </div>
            )}
            <div className="min-w-0 flex-1 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gold-600">
                {item.category} · {item.date}
              </p>
              <h3 className="mt-1 text-sm font-semibold text-navy-900">
                {item.title}
              </h3>
              <p className="mt-1 line-clamp-2 text-xs text-navy-600">
                {item.excerpt}
              </p>
              <div className="mt-2 flex gap-2">
                <button
                  className={btnGhost}
                  onClick={() => setEditing(item)}
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </button>
                <button
                  className={btnDanger}
                  onClick={() => handleDelete(item.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" /> Hapus
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {news.length === 0 && <EmptyState message="Belum ada berita." />}

      <SaveStatus result={result} />
    </div>
  );
}
