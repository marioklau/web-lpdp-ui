import { useMemo, useState } from 'react';
import {
  FileText,
  Check,
  Download,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  Image as ImageIcon,
  Trash2,
  Upload,
} from 'lucide-react';
import { generateLetterPdf, renderTemplate } from '@/lib/pdf';
import {
  ATTACHMENT_FIELD,
  isImageDataUrl,
  prepareImageAttachment,
} from '@/lib/attachment';
import { isFirebaseConfigured, submitLetter } from '@/lib/firebase';
import { useContent } from '@/lib/contentContext';
import { useLocalStorage } from '@/lib/useLocalStorage';
import type {
  LetterDocument,
  LetterTemplate,
  LetterSubmission,
} from '@/types';

type Step = 0 | 1 | 2 | 3 | 4;

const stepLabels = ['Pilih Jenis', 'Isi Formulir', 'Periksa Data', 'Selesai'];

const FIELD_LABELS: Record<string, string> = {
  nama: 'Nama',
  namaBank: 'Nama Bank',
  namaAccount: 'Nama Account',
  nomorRekening: 'Nomor Rekening',
  bicSwift: 'BIC / Swift Code',
  iban: 'IBAN / ABA / BSB',
  kampus: 'Kampus',
  negara: 'Negara',
  jenisDana: 'Jenis Dana Pengajuan',
  jumlah: 'Jumlah',
  tanggal: 'Tanggal',
  keperluan: 'Keperluan',
  [ATTACHMENT_FIELD]: 'Dokumen Pendukung',
};

const PRIMARY_FIELDS = ['nama', 'kampus', 'negara', 'jenisDana', 'jumlah'];
const BANK_FIELDS = [
  'namaBank',
  'namaAccount',
  'nomorRekening',
  'bicSwift',
  'iban',
];

const FIXED_FIELDS = new Set(['jenisDana', 'jumlah']);
const OPTIONAL_FIELDS = new Set([
  'tanggal',
  'bicSwift',
  'iban',
  ATTACHMENT_FIELD,
]);
const LEGACY_ATTACHMENT: LetterDocument = {
  key: ATTACHMENT_FIELD,
  label: 'Dokumen Pendukung',
  required: false,
  numbered: false,
};

function humanizeField(key: string): string {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, (char) => char.toUpperCase());
}

function fieldLabel(key: string, documents: LetterDocument[]): string {
  const document = documents.find((item) => item.key === key);
  return document?.label ?? FIELD_LABELS[key] ?? humanizeField(key);
}

function extractPlaceholders(bodyTemplate: string): string[] {
  const matches = [...bodyTemplate.matchAll(/{{\s*(\w+)\s*}}/g)];
  return [...new Set(matches.map((match) => match[1]))];
}

export default function SuratPage() {
  const { letterTemplates } = useContent();
  const [step, setStep] = useState<Step>(0);
  const [template, setTemplate] = useState<LetterTemplate | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [attachmentNames, setAttachmentNames] = useState<
    Record<string, string>
  >({});
  const [processingKey, setProcessingKey] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [persistIssue, setPersistIssue] = useState('');
  const [submissions, setSubmissions] = useLocalStorage<LetterSubmission[]>(
    'lpdp_letter_submissions',
    [],
  );

  const documents = useMemo(
    () => template?.documents ?? [],
    [template],
  );
  const documentKeys = useMemo(
    () => new Set(documents.map((document) => document.key)),
    [documents],
  );
  const placeholders = useMemo(() => {
    if (!template) return [] as string[];
    return extractPlaceholders(template.bodyTemplate);
  }, [template]);

  const fieldKeys = useMemo(
    () => placeholders.filter((key) => !documentKeys.has(key)),
    [placeholders, documentKeys],
  );

  const primaryKeys = useMemo(
    () => PRIMARY_FIELDS.filter((key) => fieldKeys.includes(key)),
    [fieldKeys],
  );
  const bankKeys = useMemo(
    () => BANK_FIELDS.filter((key) => fieldKeys.includes(key)),
    [fieldKeys],
  );
  const otherKeys = useMemo(
    () =>
      fieldKeys.filter(
        (key) =>
          key !== ATTACHMENT_FIELD &&
          !PRIMARY_FIELDS.includes(key) &&
          !BANK_FIELDS.includes(key),
      ),
    [fieldKeys],
  );

  const uploadItems = useMemo(() => {
    if (documents.length) return documents;
    return fieldKeys.includes(ATTACHMENT_FIELD) ? [LEGACY_ATTACHMENT] : [];
  }, [documents, fieldKeys]);

  const labelFor = (key: string) => fieldLabel(key, documents);

  const selectTemplate = (selected: LetterTemplate) => {
    const initial: Record<string, string> = {};
    extractPlaceholders(selected.bodyTemplate).forEach((key) => {
      initial[key] = '';
    });
    selected.documents?.forEach((document) => {
      initial[document.key] = '';
    });
    initial.jenisDana = selected.type;
    initial.jumlah = selected.amount;

    setTemplate(selected);
    setFields(initial);
    setAttachmentNames({});
    setProcessingKey(null);
    setError('');
    setPersistIssue('');
    setStep(1);
  };

  const handleFieldChange = (key: string, value: string) => {
    if (FIXED_FIELDS.has(key)) return;
    setFields((prev) => ({ ...prev, [key]: value }));
  };

  const handleImageUpload = async (key: string, file: File) => {
    setProcessingKey(key);
    setError('');
    try {
      const dataUrl = await prepareImageAttachment(file);
      setFields((prev) => ({ ...prev, [key]: dataUrl }));
      setAttachmentNames((prev) => ({ ...prev, [key]: file.name }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memproses gambar.');
    } finally {
      setProcessingKey(null);
    }
  };

  const removeAttachment = (key: string) => {
    setFields((prev) => ({ ...prev, [key]: '' }));
    setAttachmentNames((prev) => ({ ...prev, [key]: '' }));
  };

  const goReview = () => {
    setError('');
    if (processingKey) {
      setError('Tunggu hingga gambar selesai diproses.');
      return;
    }

    const missingFields = fieldKeys.filter(
      (key) =>
        key !== ATTACHMENT_FIELD &&
        !OPTIONAL_FIELDS.has(key) &&
        !fields[key]?.trim(),
    );
    const requiredDocuments = documents.filter(
      (document) => document.required !== false,
    );
    const missingDocuments = requiredDocuments.filter(
      (document) => !isImageDataUrl(fields[document.key]),
    );

    if (missingFields.length || missingDocuments.length) {
      const messages: string[] = [];
      if (missingFields.length) {
        messages.push(
          `Mohon isi: ${missingFields.map((key) => labelFor(key)).join(', ')}`,
        );
      }
      if (missingDocuments.length) {
        messages.push(
          `Mohon unggah: ${missingDocuments
            .map((document) => document.label)
            .join(', ')}`,
        );
      }
      setError(messages.join(' '));
      return;
    }

    if (JSON.stringify(fields).length > 900_000) {
      setError(
        'Total ukuran data terlalu besar. Silakan gunakan gambar yang lebih kecil.',
      );
      return;
    }

    setStep(2);
  };

  const finalize = async () => {
    if (!template || submitting) return;
    setSubmitting(true);

    const saved = isFirebaseConfigured
      ? await submitLetter({
          templateId: template.id,
          templateTitle: template.title,
          fields,
        })
      : null;

    const failedToSync = isFirebaseConfigured && !saved;
    const submission: LetterSubmission = saved ?? {
      id: crypto.randomUUID(),
      templateId: template.id,
      templateTitle: template.title,
      fields,
      status: 'diajukan',
      createdAt: new Date().toISOString(),
    };

    setPersistIssue(
      failedToSync
        ? 'Pengajuan tersimpan di browser ini, tetapi gagal dikirim ke server. Periksa koneksi, lalu ajukan ulang atau hubungi admin.'
        : '',
    );
    setSubmissions((prev) => [
      submission,
      ...prev.filter((item) => item.id !== submission.id),
    ]);
    setSubmitting(false);
    setStep(3);
  };

  const downloadPdf = async () => {
    if (!template) return;
    await generateLetterPdf(
      template,
      fields,
      `surat-${template.id}-${Date.now()}.pdf`,
    );
  };

  const reset = () => {
    setStep(0);
    setTemplate(null);
    setFields({});
    setAttachmentNames({});
    setProcessingKey(null);
    setError('');
    setPersistIssue('');
  };

  const renderTextField = (key: string) => {
    const value = fields[key] || '';
    const isWide = key === 'keperluan';

    return (
      <div key={key} className={isWide ? 'sm:col-span-2' : ''}>
        <label className="mb-1.5 block text-sm font-medium text-navy-800">
          {labelFor(key)}
          {OPTIONAL_FIELDS.has(key) && !FIXED_FIELDS.has(key) && (
            <span className="ml-1 text-xs font-normal text-navy-400">
              (opsional)
            </span>
          )}
        </label>
        {FIXED_FIELDS.has(key) ? (
          <div className="space-y-1">
            <input
              value={value}
              readOnly
              className="w-full rounded-lg border border-navy-200 bg-navy-50 px-4 py-2.5 text-sm font-semibold text-navy-900"
            />
            <p className="text-xs text-navy-500">
              Sudah ditetapkan dan tidak dapat diubah.
            </p>
          </div>
        ) : key === 'keperluan' ? (
          <textarea
            value={value}
            onChange={(event) => handleFieldChange(key, event.target.value)}
            rows={3}
            maxLength={1000}
            className="w-full resize-none rounded-lg border border-navy-200 bg-white px-4 py-2.5 text-sm text-navy-900 outline-none transition focus:border-navy-500 focus:ring-2 focus:ring-navy-500/20"
            placeholder={`Masukkan ${labelFor(key).toLowerCase()}`}
          />
        ) : (
          <input
            type="text"
            value={value}
            onChange={(event) => handleFieldChange(key, event.target.value)}
            maxLength={200}
            className="w-full rounded-lg border border-navy-200 bg-white px-4 py-2.5 text-sm text-navy-900 outline-none transition focus:border-navy-500 focus:ring-2 focus:ring-navy-500/20"
            placeholder={`Masukkan ${labelFor(key).toLowerCase()}`}
          />
        )}
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-navy-50">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gold-600">
            <FileText className="h-4 w-4" />
            Layanan Surat
          </span>
          <h1 className="mt-3 font-serif text-3xl font-semibold text-navy-900 sm:text-4xl">
            Pengajuan Surat Resmi
          </h1>
          <p className="mt-4 text-navy-600">
            Ajukan surat resmi dalam empat langkah sederhana. Hasil dapat diunduh
            sebagai PDF.
          </p>
        </div>

        <div className="mx-auto mb-8 flex max-w-2xl items-center justify-between">
          {stepLabels.map((label, i) => (
            <div key={label} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center">
                <span
                  className={`grid h-9 w-9 place-items-center rounded-full text-sm font-semibold transition-all ${
                    i <= step - 1 || (i === 0 && step === 0)
                      ? i === step
                        ? 'bg-navy-900 text-gold-300 ring-4 ring-navy-200'
                        : 'bg-gold-400 text-navy-900'
                      : i === step
                        ? 'bg-navy-900 text-gold-300 ring-4 ring-navy-200'
                        : 'border border-navy-200 bg-white text-navy-400'
                  }`}
                >
                  {i < step ? <Check className="h-4 w-4" /> : i + 1}
                </span>
                <span className="mt-1.5 w-16 text-center text-[10px] text-navy-600 sm:text-xs">
                  {label}
                </span>
              </div>
              {i < stepLabels.length - 1 && (
                <div className="relative top-[-12px] mx-2 h-0.5 flex-1 bg-navy-200">
                  <div
                    className="h-full bg-gold-400 transition-all"
                    style={{ width: i < step ? '100%' : '0%' }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-navy-100 bg-white p-6 shadow-soft sm:p-8">
          {step === 0 && (
            <div>
              <h2 className="mb-4 font-serif text-xl font-semibold text-navy-900">
                Pilih Jenis Surat
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {letterTemplates.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => selectTemplate(item)}
                    className="group rounded-xl border border-navy-200 p-5 text-left transition-all hover:border-navy-500 hover:shadow-soft"
                  >
                    <span className="mb-3 grid h-10 w-10 place-items-center rounded-lg bg-navy-900 text-gold-300">
                      <FileText className="h-5 w-5" />
                    </span>
                    <h3 className="font-semibold text-navy-900">{item.type}</h3>
                    <p className="mt-1 text-sm font-semibold text-gold-700">
                      {item.amount}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-navy-600">
                      {item.description}
                    </p>
                    <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-navy-900 group-hover:text-gold-600">
                      Pilih <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 1 && template && (
            <div>
              <h2 className="mb-1 font-serif text-xl font-semibold text-navy-900">
                Isi Formulir
              </h2>
              <p className="mb-5 text-sm text-navy-600">{template.title}</p>
              {error && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {primaryKeys.length > 0 && (
                <section>
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gold-600">
                    Data Pemohon
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {primaryKeys.map(renderTextField)}
                  </div>
                </section>
              )}

              {bankKeys.length > 0 && (
                <section className="mt-6 border-t border-navy-100 pt-6">
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gold-600">
                    Data Bank
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {bankKeys.map(renderTextField)}
                  </div>
                </section>
              )}

              {otherKeys.length > 0 && (
                <section className="mt-6 border-t border-navy-100 pt-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {otherKeys.map(renderTextField)}
                  </div>
                </section>
              )}

              {uploadItems.length > 0 && (
                <section className="mt-6 border-t border-navy-100 pt-6">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-gold-600">
                    Dokumen Pendukung
                  </h3>
                  <p className="mb-4 mt-1 text-sm text-navy-600">
                    Unggah scan atau foto untuk setiap dokumen berikut. Gambar
                    akan dikompres otomatis.
                  </p>
                  <div className="space-y-3">
                    {uploadItems.map((document, index) => {
                      const value = fields[document.key] || '';
                      const ready = isImageDataUrl(value);
                      const processing = processingKey === document.key;
                      const required = document.required !== false;
                      const numbered = document.numbered !== false;

                      return (
                        <div
                          key={document.key}
                          className="rounded-xl border border-navy-200 bg-white p-4"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div className="flex min-w-0 items-start gap-3">
                              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-navy-900 text-xs font-semibold text-gold-300">
                                {numbered ? index + 1 : <ImageIcon className="h-4 w-4" />}
                              </span>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-navy-900">
                                  {document.label}
                                </p>
                                <p className="mt-0.5 text-xs text-navy-500">
                                  {required
                                    ? 'Wajib diunggah.'
                                    : 'Opsional, dapat dikosongkan.'}
                                </p>
                              </div>
                            </div>
                            <span
                              className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${
                                required
                                  ? 'bg-gold-100 text-gold-800'
                                  : 'bg-navy-100 text-navy-600'
                              }`}
                            >
                              {required ? 'Wajib' : 'Opsional'}
                            </span>
                          </div>

                          {ready ? (
                            <div className="mt-3 rounded-lg border border-navy-200 bg-navy-50 p-3">
                              <div className="flex items-start gap-3">
                                <img
                                  src={value}
                                  alt={document.label}
                                  className="h-24 w-24 rounded border border-navy-200 bg-white object-contain"
                                />
                                <div className="min-w-0 flex-1">
                                  <p className="break-all text-sm font-medium text-navy-900">
                                    {attachmentNames[document.key] ||
                                      'Gambar dokumen'}
                                  </p>
                                  <p className="mt-1 text-xs text-navy-500">
                                    Gambar akan disematkan ke PDF.
                                  </p>
                                  <div className="mt-2 flex flex-wrap gap-2">
                                    <label className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-navy-200 bg-white px-3 py-1.5 text-xs font-medium text-navy-700 hover:bg-navy-50">
                                      <ImageIcon className="h-3.5 w-3.5" /> Ganti
                                      <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        disabled={processingKey !== null}
                                        onChange={(event) => {
                                          const file = event.target.files?.[0];
                                          if (file) {
                                            void handleImageUpload(
                                              document.key,
                                              file,
                                            );
                                          }
                                          event.target.value = '';
                                        }}
                                      />
                                    </label>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        removeAttachment(document.key)
                                      }
                                      className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" /> Hapus
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="mt-3">
                              <label
                                className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-navy-300 bg-navy-50/60 px-4 py-2.5 text-sm font-medium text-navy-700 hover:bg-navy-50 ${
                                  processingKey !== null
                                    ? 'cursor-not-allowed opacity-60'
                                    : ''
                                }`}
                              >
                                <Upload className="h-4 w-4" />
                                {processing ? 'Memproses...' : 'Pilih gambar'}
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  disabled={processingKey !== null}
                                  onChange={(event) => {
                                    const file = event.target.files?.[0];
                                    if (file) {
                                      void handleImageUpload(document.key, file);
                                    }
                                    event.target.value = '';
                                  }}
                                />
                              </label>
                              <p className="mt-1.5 text-xs text-navy-500">
                                JPG/PNG, maksimal 10 MB — dikompres otomatis.
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              <div className="mt-6 flex justify-between">
                <button
                  onClick={reset}
                  className="inline-flex items-center gap-2 rounded-lg border border-navy-200 px-5 py-2.5 text-sm font-medium text-navy-700 hover:bg-navy-50"
                >
                  <ArrowLeft className="h-4 w-4" /> Kembali
                </button>
                <button
                  onClick={goReview}
                  disabled={processingKey !== null}
                  className="inline-flex items-center gap-2 rounded-lg bg-navy-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-navy-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Periksa Data <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && template && (
            <div>
              <h2 className="mb-1 font-serif text-xl font-semibold text-navy-900">
                Periksa Data
              </h2>
              <p className="mb-5 text-sm text-navy-600">
                Pastikan semua data sudah benar sebelum mengajukan.
              </p>

              <div className="mb-6 grid gap-3 sm:grid-cols-2">
                {fieldKeys
                  .filter((key) => key !== ATTACHMENT_FIELD)
                  .map((key) => (
                    <div
                      key={key}
                      className="rounded-lg border border-navy-100 bg-navy-50 px-4 py-3"
                    >
                      <p className="text-xs text-navy-500">{labelFor(key)}</p>
                      <p className="mt-0.5 break-words text-sm font-medium text-navy-900">
                        {fields[key] || '—'}
                      </p>
                    </div>
                  ))}
              </div>

              {uploadItems.some((document) =>
                isImageDataUrl(fields[document.key]),
              ) && (
                <div className="mb-6">
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gold-600">
                    Dokumen Pendukung
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {uploadItems.map((document, index) => {
                      const value = fields[document.key] || '';
                      if (!isImageDataUrl(value)) return null;

                      return (
                        <div
                          key={document.key}
                          className="rounded-lg border border-navy-200 bg-navy-50 p-3"
                        >
                          <p className="text-xs font-medium text-navy-700">
                            {document.numbered !== false ? `${index + 1}. ` : ''}
                            {document.label}
                          </p>
                          <img
                            src={value}
                            alt={document.label}
                            className="mt-2 max-h-40 rounded border border-navy-200 bg-white object-contain"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="mb-6 rounded-lg bg-navy-900 p-5 text-navy-100">
                <h3 className="mb-2 text-sm font-semibold text-gold-300">
                  Ringkasan Surat
                </h3>
                <pre className="max-h-60 overflow-auto whitespace-pre-wrap font-sans text-xs text-navy-200">
                  {renderTemplate(template, fields)}
                </pre>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-2 rounded-lg border border-navy-200 px-5 py-2.5 text-sm font-medium text-navy-700 hover:bg-navy-50"
                >
                  <ArrowLeft className="h-4 w-4" /> Edit
                </button>
                <button
                  onClick={finalize}
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-lg bg-gold-400 px-6 py-2.5 text-sm font-semibold text-navy-900 hover:bg-gold-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Check className="h-4 w-4" />
                  {submitting ? 'Mengirim...' : 'Ajukan Surat'}
                </button>
              </div>
            </div>
          )}

          {step === 3 && template && (
            <div className="py-6 text-center">
              <span className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="h-8 w-8" />
              </span>
              <h2 className="font-serif text-2xl font-semibold text-navy-900">
                {persistIssue ? 'Pengajuan Tersimpan Lokal' : 'Pengajuan Berhasil'}
              </h2>
              <p className="mx-auto mt-2 max-w-md text-navy-600">
                {persistIssue
                  ? 'Pengajuan belum terkirim ke server, tetapi data masih tersimpan di browser ini.'
                  : 'Surat Anda telah diajukan dengan status menunggu persetujuan admin. Anda dapat mengunduh PDF draf di bawah ini.'}
              </p>

              {persistIssue && (
                <div className="mx-auto mt-4 flex max-w-lg items-start gap-2 rounded-lg border border-gold-200 bg-gold-50 px-4 py-3 text-left text-sm text-gold-800">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{persistIssue}</span>
                </div>
              )}

              <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-gold-100 px-4 py-1.5 text-sm font-medium text-gold-800">
                <Clock className="h-4 w-4" />
                Status: Menunggu Persetujuan
              </div>

              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <button
                  onClick={downloadPdf}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-navy-900 px-6 py-3 text-sm font-semibold text-white hover:bg-navy-800"
                >
                  <Download className="h-4 w-4" /> Unduh PDF
                </button>
                <button
                  onClick={reset}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-navy-200 px-6 py-3 text-sm font-medium text-navy-700 hover:bg-navy-50"
                >
                  Ajukan Surat Lain
                </button>
              </div>
            </div>
          )}
        </div>

        {submissions.length > 0 && (
          <div className="mt-8 rounded-2xl border border-navy-100 bg-white p-6 shadow-soft">
            <h3 className="mb-4 font-serif text-lg font-semibold text-navy-900">
              Riwayat Pengajuan
            </h3>
            <div className="space-y-3">
              {submissions.map((submission) => (
                <div
                  key={submission.id}
                  className="flex items-center justify-between rounded-lg border border-navy-100 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-navy-900">
                      {submission.templateTitle}
                    </p>
                    <p className="text-xs text-navy-500">
                      {new Date(submission.createdAt).toLocaleString('id-ID')}
                    </p>
                  </div>
                  <StatusBadge status={submission.status} />
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="mt-6 text-center text-xs text-navy-400">
          Status penyimpanan:{' '}
          <span
            className={
              isFirebaseConfigured
                ? 'font-semibold text-emerald-600'
                : 'font-semibold text-gold-600'
            }
          >
            {isFirebaseConfigured
              ? 'Tersambung ke Firebase'
              : 'Mode lokal — pengajuan disimpan di browser'}
          </span>
        </p>
      </div>
    </main>
  );
}

function StatusBadge({ status }: { status: LetterSubmission['status'] }) {
  const map = {
    diajukan: {
      label: 'Menunggu',
      icon: Clock,
      cls: 'bg-gold-100 text-gold-800',
    },
    disetujui: {
      label: 'Disetujui',
      icon: CheckCircle2,
      cls: 'bg-emerald-100 text-emerald-700',
    },
    ditolak: {
      label: 'Ditolak',
      icon: XCircle,
      cls: 'bg-red-100 text-red-700',
    },
  };
  const { label, icon: Icon, cls } = map[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${cls}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}
