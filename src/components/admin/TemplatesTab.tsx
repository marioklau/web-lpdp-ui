import { useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  FileText,
  Pencil,
  Plus,
  Save,
  Trash2,
  X,
} from 'lucide-react';
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
import {
  DEFAULT_FIELD_GROUP,
  DEFAULT_FORM_TITLE,
  buildFormBody,
  deriveFields,
  resolveTemplateFields,
  resolveTemplateFormat,
  slugFieldKey,
} from '@/lib/letterTemplate';
import type {
  LetterDocument,
  LetterFormField,
  LetterTemplate,
} from '@/types';

const NEW_FORM_FIELDS: LetterFormField[] = [
  { key: 'nama', label: 'Nama', group: DEFAULT_FIELD_GROUP, required: true },
  { key: 'kampus', label: 'Kampus', group: DEFAULT_FIELD_GROUP, required: true },
  { key: 'negara', label: 'Negara', group: DEFAULT_FIELD_GROUP, required: true },
  {
    key: 'jenisDana',
    label: 'Jenis Dana Pengajuan',
    group: DEFAULT_FIELD_GROUP,
    required: true,
    readOnly: true,
    defaultValue: '{{type}}',
  },
  {
    key: 'jumlah',
    label: 'Jumlah',
    group: DEFAULT_FIELD_GROUP,
    required: true,
    readOnly: true,
    defaultValue: '{{amount}}',
  },
  { key: 'namaBank', label: 'Nama Bank', group: 'Data Bank', required: true },
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
];

const KEY_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;

function moveItem<T>(items: T[], index: number, direction: -1 | 1): T[] {
  const target = index + direction;
  if (target < 0 || target >= items.length) return items;
  const next = [...items];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

export default function TemplatesTab() {
  const { letterTemplates, saveLetterTemplates } = useContent();
  const [editing, setEditing] = useState<LetterTemplate | null>(null);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<SaveResult | null>(null);
  const [error, setError] = useState('');

  const startNew = () => {
    setResult(null);
    setError('');
    setEditing({
      id: crypto.randomUUID(),
      format: 'form',
      type: 'Form Pengajuan',
      title: '',
      description: '',
      amount: 'Rp 0,-',
      formTitle: DEFAULT_FORM_TITLE,
      formNote: '',
      fields: NEW_FORM_FIELDS.map((field) => ({ ...field })),
      documents: [],
      bodyTemplate: '',
    });
  };

  const startEdit = (template: LetterTemplate) => {
    setResult(null);
    setError('');
    setEditing({
      ...template,
      format: resolveTemplateFormat(template),
      formTitle: template.formTitle ?? DEFAULT_FORM_TITLE,
      formNote: template.formNote ?? '',
      fields: (template.fields?.length
        ? template.fields
        : deriveFields(template)
      ).map((field) => ({ ...field })),
      documents: (template.documents ?? []).map((document) => ({
        ...document,
      })),
    });
  };

  const update = (patch: Partial<LetterTemplate>) => {
    setEditing((prev) => (prev ? { ...prev, ...patch } : prev));
  };

  const updateField = (index: number, patch: Partial<LetterFormField>) => {
    setEditing((prev) => {
      if (!prev) return prev;
      const fields = (prev.fields ?? []).map((field, i) =>
        i === index ? { ...field, ...patch } : field,
      );
      return { ...prev, fields };
    });
  };

  const addField = () => {
    setEditing((prev) => {
      if (!prev) return prev;
      const keys = (prev.fields ?? []).map((field) => field.key);
      return {
        ...prev,
        fields: [
          ...(prev.fields ?? []),
          {
            key: slugFieldKey('Field Baru', keys),
            label: 'Field Baru',
            group: DEFAULT_FIELD_GROUP,
            required: true,
          },
        ],
      };
    });
  };

  const removeField = (index: number) => {
    setEditing((prev) =>
      prev
        ? {
            ...prev,
            fields: (prev.fields ?? []).filter((_, i) => i !== index),
          }
        : prev,
    );
  };

  const updateDocument = (
    index: number,
    patch: Partial<LetterDocument>,
  ) => {
    setEditing((prev) => {
      if (!prev) return prev;
      const documents = (prev.documents ?? []).map((document, i) =>
        i === index ? { ...document, ...patch } : document,
      );
      return { ...prev, documents };
    });
  };

  const addDocument = () => {
    setEditing((prev) => {
      if (!prev) return prev;
      const keys = (prev.documents ?? []).map((document) => document.key);
      return {
        ...prev,
        documents: [
          ...(prev.documents ?? []),
          {
            key: slugFieldKey('Dokumen', keys),
            label: 'Dokumen Pendukung Baru',
            required: true,
            numbered: true,
          },
        ],
      };
    });
  };

  const removeDocument = (index: number) => {
    setEditing((prev) =>
      prev
        ? {
            ...prev,
            documents: (prev.documents ?? []).filter((_, i) => i !== index),
          }
        : prev,
    );
  };

  const changeFormat = (format: 'form' | 'text') => {
    setEditing((prev) => {
      if (!prev) return prev;
      if (format === 'form' && !prev.fields?.length) {
        const derived = deriveFields({ ...prev, fields: undefined });
        return {
          ...prev,
          format,
          formTitle: prev.formTitle ?? DEFAULT_FORM_TITLE,
          fields: derived.length
            ? derived
            : NEW_FORM_FIELDS.map((field) => ({ ...field })),
        };
      }
      return { ...prev, format };
    });
  };

  const handleSave = async () => {
    if (!editing) return;
    const format = resolveTemplateFormat(editing);
    const fields = (editing.fields ?? []).map((field) => ({
      ...field,
      key: field.key.trim(),
      label: field.label.trim(),
      group: field.group?.trim() || undefined,
      defaultValue: field.defaultValue?.trim() || undefined,
    }));
    const documents = (editing.documents ?? []).map((document) => ({
      ...document,
      key: document.key.trim(),
      label: document.label.trim(),
    }));

    if (!editing.title.trim()) {
      setError('Judul template wajib diisi.');
      return;
    }

    if (format === 'form') {
      if (!fields.length) {
        setError('Tambahkan minimal satu field isian untuk form beasiswa.');
        return;
      }
      const invalidField = fields.find(
        (field) => !field.label || !KEY_PATTERN.test(field.key),
      );
      if (invalidField) {
        setError(
          'Setiap field wajib memiliki label dan key yang valid (huruf/angka/underscore, tanpa spasi).',
        );
        return;
      }
      const invalidDocument = documents.find(
        (document) => !document.label || !KEY_PATTERN.test(document.key),
      );
      if (invalidDocument) {
        setError(
          'Setiap dokumen wajib memiliki label dan key yang valid (huruf/angka/underscore, tanpa spasi).',
        );
        return;
      }
      const fieldKeys = fields.map((field) => field.key);
      const documentKeys = documents.map((document) => document.key);
      const allKeys = [...fieldKeys, ...documentKeys];
      if (new Set(allKeys).size !== allKeys.length) {
        setError('Key field dan dokumen tidak boleh sama.');
        return;
      }
      if (allKeys.length > 60) {
        setError('Maksimal 60 field dan dokumen dalam satu template.');
        return;
      }
    } else if (!editing.bodyTemplate.trim()) {
      setError('Isi template surat wajib diisi.');
      return;
    }

    const normalizedFields =
      format === 'form'
        ? fields
        : deriveFields({
            ...editing,
            documents: [],
            fields: undefined,
          });
    const base: LetterTemplate = {
      ...editing,
      type: editing.type.trim() || 'Surat',
      title: editing.title.trim(),
      description: editing.description.trim(),
      amount: editing.amount.trim(),
      format,
      formTitle:
        format === 'form'
          ? editing.formTitle?.trim() || DEFAULT_FORM_TITLE
          : editing.formTitle,
      formNote: format === 'form' ? editing.formNote?.trim() : undefined,
      fields: normalizedFields,
      documents: format === 'form' ? documents : [],
    };
    const normalized: LetterTemplate = {
      ...base,
      bodyTemplate:
        format === 'form'
          ? buildFormBody(base, normalizedFields)
          : editing.bodyTemplate.trim(),
    };

    setSaving(true);
    const exists = letterTemplates.some((item) => item.id === normalized.id);
    const next = exists
      ? letterTemplates.map((item) =>
          item.id === normalized.id ? normalized : item,
        )
      : [...letterTemplates, normalized];
    const res = await saveLetterTemplates(next);
    setResult(res);
    setSaving(false);
    if (res.ok) {
      setEditing(null);
      setError('');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Hapus template surat ini?')) return;
    const res = await saveLetterTemplates(
      letterTemplates.filter((item) => item.id !== id),
    );
    setResult(res);
    if (editing?.id === id) setEditing(null);
  };

  const format = editing ? resolveTemplateFormat(editing) : 'form';
  const fields = editing?.fields ?? [];
  const documents = editing?.documents ?? [];

  return (
    <div>
      <SectionHeader
        title="Template Surat"
        desc="Atur format form beasiswa, field isian, dokumen pendukung, dan teks PDF."
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
                onChange={(event) => update({ type: event.target.value })}
              />
            </Field>
            <Field label="Judul">
              <input
                className={inputClass}
                value={editing.title}
                onChange={(event) => update({ title: event.target.value })}
              />
            </Field>
            <Field
              label="Nominal"
              hint="Nilai tetap yang tampil di form dan tidak dapat diubah pemohon."
            >
              <input
                className={inputClass}
                value={editing.amount}
                onChange={(event) => update({ amount: event.target.value })}
              />
            </Field>
            <Field
              label="Format PDF"
              hint="Form beasiswa memakai tabel isian dan lampiran gambar."
            >
              <select
                className={inputClass}
                value={format}
                onChange={(event) =>
                  changeFormat(event.target.value as 'form' | 'text')
                }
              >
                <option value="form">Form Beasiswa (tabel isian)</option>
                <option value="text">Surat Teks (isi template)</option>
              </select>
            </Field>
            <div className="sm:col-span-2">
              <Field label="Deskripsi">
                <textarea
                  rows={2}
                  className={textareaClass}
                  value={editing.description}
                  onChange={(event) =>
                    update({ description: event.target.value })
                  }
                />
              </Field>
            </div>
          </div>

          {format === 'form' ? (
            <div className="mt-6 space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Judul di PDF"
                  hint="Teks utama yang muncul di bagian atas PDF."
                >
                  <input
                    className={inputClass}
                    value={editing.formTitle ?? ''}
                    onChange={(event) =>
                      update({ formTitle: event.target.value })
                    }
                  />
                </Field>
                <Field
                  label="Catatan di PDF"
                  hint="Opsional, tampil di bawah tabel isian."
                >
                  <input
                    className={inputClass}
                    value={editing.formNote ?? ''}
                    onChange={(event) =>
                      update({ formNote: event.target.value })
                    }
                  />
                </Field>
              </div>

              <section>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-semibold text-navy-900">
                      Field Isian Mahasiswa
                    </h4>
                    <p className="mt-1 text-xs text-navy-500">
                      Urutan di sini menentukan urutan field di halaman surat
                      dan PDF.
                    </p>
                  </div>
                  <button className={btnGhost} onClick={addField}>
                    <Plus className="h-4 w-4" /> Tambah Field
                  </button>
                </div>

                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <div
                      key={`field-${index}`}
                      className="rounded-lg border border-navy-200 bg-white p-3"
                    >
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <Field label="Label">
                          <input
                            className={inputClass}
                            value={field.label}
                            onChange={(event) =>
                              updateField(index, {
                                label: event.target.value,
                              })
                            }
                          />
                        </Field>
                        <Field label="Key" hint="Tanpa spasi, unik.">
                          <input
                            className={inputClass}
                            value={field.key}
                            onChange={(event) =>
                              updateField(index, { key: event.target.value })
                            }
                          />
                        </Field>
                        <Field label="Grup">
                          <input
                            className={inputClass}
                            value={field.group ?? ''}
                            onChange={(event) =>
                              updateField(index, { group: event.target.value })
                            }
                          />
                        </Field>
                        <Field label="Tipe Input">
                          <select
                            className={inputClass}
                            value={field.type ?? 'text'}
                            onChange={(event) =>
                              updateField(index, {
                                type: event.target.value as
                                  | 'text'
                                  | 'textarea',
                              })
                            }
                          >
                            <option value="text">Teks</option>
                            <option value="textarea">Teks Panjang</option>
                          </select>
                        </Field>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
                        <label className="inline-flex items-center gap-2 text-xs font-medium text-navy-700">
                          <input
                            type="checkbox"
                            checked={field.required !== false}
                            onChange={(event) =>
                              updateField(index, {
                                required: event.target.checked,
                              })
                            }
                          />
                          Wajib diisi
                        </label>
                        <label className="inline-flex items-center gap-2 text-xs font-medium text-navy-700">
                          <input
                            type="checkbox"
                            checked={field.readOnly === true}
                            onChange={(event) =>
                              updateField(index, {
                                readOnly: event.target.checked,
                              })
                            }
                          />
                          Otomatis (tidak bisa diubah pemohon)
                        </label>
                        {field.readOnly && (
                          <div className="min-w-[220px] flex-1">
                            <Field
                              label="Nilai otomatis"
                              hint="Gunakan {{type}} atau {{amount}}."
                            >
                              <input
                                className={inputClass}
                                value={field.defaultValue ?? ''}
                                onChange={(event) =>
                                  updateField(index, {
                                    defaultValue: event.target.value,
                                  })
                                }
                              />
                            </Field>
                          </div>
                        )}
                        <div className="ml-auto flex gap-1">
                          <button
                            className={btnGhost}
                            onClick={() =>
                              update({
                                fields: moveItem(fields, index, -1),
                              })
                            }
                            disabled={index === 0}
                            aria-label="Naikkan field"
                          >
                            <ArrowUp className="h-3.5 w-3.5" />
                          </button>
                          <button
                            className={btnGhost}
                            onClick={() =>
                              update({
                                fields: moveItem(fields, index, 1),
                              })
                            }
                            disabled={index === fields.length - 1}
                            aria-label="Turunkan field"
                          >
                            <ArrowDown className="h-3.5 w-3.5" />
                          </button>
                          <button
                            className={btnDanger}
                            onClick={() => removeField(index)}
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Hapus
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {fields.length === 0 && (
                    <EmptyState message="Belum ada field isian. Klik Tambah Field." />
                  )}
                </div>
              </section>

              <section>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-semibold text-navy-900">
                      Dokumen Pendukung
                    </h4>
                    <p className="mt-1 text-xs text-navy-500">
                      Setiap dokumen diunggah sebagai gambar dan dilampirkan ke
                      PDF.
                    </p>
                  </div>
                  <button className={btnGhost} onClick={addDocument}>
                    <Plus className="h-4 w-4" /> Tambah Dokumen
                  </button>
                </div>

                <div className="space-y-3">
                  {documents.map((document, index) => (
                    <div
                      key={`document-${index}`}
                      className="rounded-lg border border-navy-200 bg-white p-3"
                    >
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Field label="Label Dokumen">
                          <input
                            className={inputClass}
                            value={document.label}
                            onChange={(event) =>
                              updateDocument(index, {
                                label: event.target.value,
                              })
                            }
                          />
                        </Field>
                        <Field label="Key" hint="Tanpa spasi, unik.">
                          <input
                            className={inputClass}
                            value={document.key}
                            onChange={(event) =>
                              updateDocument(index, {
                                key: event.target.value,
                              })
                            }
                          />
                        </Field>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
                        <label className="inline-flex items-center gap-2 text-xs font-medium text-navy-700">
                          <input
                            type="checkbox"
                            checked={document.required !== false}
                            onChange={(event) =>
                              updateDocument(index, {
                                required: event.target.checked,
                              })
                            }
                          />
                          Wajib diunggah
                        </label>
                        <label className="inline-flex items-center gap-2 text-xs font-medium text-navy-700">
                          <input
                            type="checkbox"
                            checked={document.numbered !== false}
                            onChange={(event) =>
                              updateDocument(index, {
                                numbered: event.target.checked,
                              })
                            }
                          />
                          Beri nomor
                        </label>
                        <div className="ml-auto flex gap-1">
                          <button
                            className={btnGhost}
                            onClick={() =>
                              update({
                                documents: moveItem(documents, index, -1),
                              })
                            }
                            disabled={index === 0}
                            aria-label="Naikkan dokumen"
                          >
                            <ArrowUp className="h-3.5 w-3.5" />
                          </button>
                          <button
                            className={btnGhost}
                            onClick={() =>
                              update({
                                documents: moveItem(documents, index, 1),
                              })
                            }
                            disabled={index === documents.length - 1}
                            aria-label="Turunkan dokumen"
                          >
                            <ArrowDown className="h-3.5 w-3.5" />
                          </button>
                          <button
                            className={btnDanger}
                            onClick={() => removeDocument(index)}
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Hapus
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {documents.length === 0 && (
                    <EmptyState message="Belum ada dokumen pendukung. Klik Tambah Dokumen." />
                  )}
                </div>
              </section>
            </div>
          ) : (
            <div className="mt-6">
              <Field
                label="Isi Template"
                hint="Gunakan {{namaField}} untuk kolom yang diisi pemohon."
              >
                <textarea
                  rows={14}
                  className={`${textareaClass} font-mono text-xs leading-relaxed`}
                  value={editing.bodyTemplate}
                  onChange={(event) =>
                    update({ bodyTemplate: event.target.value })
                  }
                />
              </Field>
            </div>
          )}

          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

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
        {letterTemplates.map((template) => {
          const templateFormat = resolveTemplateFormat(template);
          const fieldCount = resolveTemplateFields(template).length;
          return (
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
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-gold-600">
                        {template.type}
                      </p>
                      <span className="rounded-full bg-navy-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-navy-700">
                        {templateFormat === 'form'
                          ? `${fieldCount} field · ${template.documents?.length ?? 0} dokumen`
                          : 'Surat teks'}
                      </span>
                    </div>
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
                <button className={btnGhost} onClick={() => startEdit(template)}>
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
          );
        })}
      </div>

      {letterTemplates.length === 0 && (
        <EmptyState message="Belum ada template surat." />
      )}

      <SaveStatus result={result} />
    </div>
  );
}
