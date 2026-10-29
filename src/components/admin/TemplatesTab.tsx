import { useState } from 'react';
import { FileText, Pencil, Plus, Save, Trash2, X } from 'lucide-react';
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
import type { LetterTemplate } from '@/types';

const SAMPLE_BODY = `KOP SURAT
IKATAN KELUARGA BESAR LPDP UNIVERSITAS INDONESIA
Jl. —, Depok, Jawa Barat
Email: pengurus@lpdp-ui.id

SURAT KETERANGAN
Nomor: {{nomorSurat}}

Yang bertanda tangan di bawah ini menerangkan bahwa:

Nama          : {{nama}}
NPM/NIM       : {{npm}}
Program Studi : {{programStudi}}
Fakultas      : {{fakultas}}
Angkatan      : {{angkatan}}

Surat ini dibuat untuk keperluan: {{keperluan}}

Depok, {{tanggal}}
Pengurus LPDP UI`;

export default function TemplatesTab() {
  const { letterTemplates, saveLetterTemplates } = useContent();
  const [editing, setEditing] = useState<LetterTemplate | null>(null);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<SaveResult | null>(null);

  const startNew = () => {
    setEditing({
      id: crypto.randomUUID(),
      type: 'Surat Keterangan',
      title: '',
      description: '',
      amount: 'Rp 0,-',
      bodyTemplate: SAMPLE_BODY,
    });
  };

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    const exists = letterTemplates.some((item) => item.id === editing.id);
    const next = exists
      ? letterTemplates.map((item) =>
          item.id === editing.id ? editing : item,
        )
      : [...letterTemplates, editing];
    const res = await saveLetterTemplates(next);
    setResult(res);
    setSaving(false);
    if (res.ok) setEditing(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Hapus template surat ini?')) return;
    const res = await saveLetterTemplates(
      letterTemplates.filter((item) => item.id !== id),
    );
    setResult(res);
    if (editing?.id === id) setEditing(null);
  };

  return (
    <div>
      <SectionHeader
        title="Template Surat"
        desc="Template yang tersedia di halaman Layanan Surat."
        action={
          <button className={btnGold} onClick={startNew}>
            <Plus className="h-4 w-4" /> Tambah Template
          </button>
        }
      />

      {editing && (
        <div className="mb-6 rounded-xl border border-navy-200 bg-navy-50/50 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-navy-900">
              {letterTemplates.some((item) => item.id === editing.id)
                ? 'Edit Template'
                : 'Template Baru'}
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
            <Field label="Jenis Surat">
              <input
                className={inputClass}
                value={editing.type}
                onChange={(event) =>
                  setEditing({ ...editing, type: event.target.value })
                }
              />
            </Field>
            <Field label="Judul">
              <input
                className={inputClass}
                value={editing.title}
                onChange={(event) =>
                  setEditing({ ...editing, title: event.target.value })
                }
              />
            </Field>
            <Field
              label="Nominal"
              hint="Nilai tetap yang tampil di form dan tidak dapat diubah pemohon."
            >
              <input
                className={inputClass}
                value={editing.amount}
                onChange={(event) =>
                  setEditing({ ...editing, amount: event.target.value })
                }
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Deskripsi">
                <textarea
                  rows={2}
                  className={textareaClass}
                  value={editing.description}
                  onChange={(event) =>
                    setEditing({ ...editing, description: event.target.value })
                  }
                />
              </Field>
            </div>
            <div className="sm:col-span-2">
              {editing.documents?.length ? (
                <div className="rounded-lg border border-navy-200 bg-white p-4">
                  <p className="text-sm font-medium text-navy-900">
                    Format Form Beasiswa
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-navy-500">
                    Form dan daftar dokumen mengikuti template PDF resmi. Isi
                    template tidak dapat diubah dari panel ini.
                  </p>
                  <ol className="mt-3 space-y-2">
                    {editing.documents.map((document, index) => (
                      <li
                        key={document.key}
                        className="flex gap-2 text-xs text-navy-700"
                      >
                        <span className="font-semibold text-navy-500">
                          {document.numbered === false ? '•' : `${index + 1}.`}
                        </span>
                        <span>
                          {document.label}
                          {document.required === false ? ' (opsional)' : ''}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              ) : (
                <Field
                  label="Isi Template"
                  hint="Gunakan {{namaField}} untuk kolom yang diisi pemohon."
                >
                  <textarea
                    rows={14}
                    className={`${textareaClass} font-mono text-xs leading-relaxed`}
                    value={editing.bodyTemplate}
                    onChange={(event) =>
                      setEditing({ ...editing, bodyTemplate: event.target.value })
                    }
                  />
                </Field>
              )}
            </div>
          </div>

          <div className="mt-5 flex gap-2">
            <button
              className={btnPrimary}
              onClick={handleSave}
              disabled={saving || !editing.title.trim()}
            >
              <Save className="h-4 w-4" />
              {saving ? 'Menyimpan...' : 'Simpan Template'}
            </button>
            <button className={btnGhost} onClick={() => setEditing(null)}>
              Batal
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {letterTemplates.map((template) => (
          <div
            key={template.id}
            className="rounded-xl border border-navy-100 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-navy-900 text-gold-300">
                  <FileText className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gold-600">
                    {template.type}
                  </p>
                  <h3 className="font-semibold text-navy-900">
                    {template.title}
                  </h3>
                  <p className="mt-1 text-sm font-semibold text-gold-700">
                    {template.amount}
                  </p>
                  <p className="mt-1 text-sm text-navy-600">
                    {template.description}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-3 flex justify-end gap-2">
              <button className={btnGhost} onClick={() => setEditing(template)}>
                <Pencil className="h-3.5 w-3.5" /> Edit
              </button>
              <button
                className={btnDanger}
                onClick={() => handleDelete(template.id)}
              >
                <Trash2 className="h-3.5 w-3.5" /> Hapus
              </button>
            </div>
          </div>
        ))}
      </div>

      {letterTemplates.length === 0 && (
        <EmptyState message="Belum ada template surat." />
      )}

      <SaveStatus result={result} />
    </div>
  );
}
