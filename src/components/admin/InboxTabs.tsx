import { Check, RefreshCw, Trash2, X } from 'lucide-react';
import {
  EmptyState,
  SectionHeader,
  btnGhost,
} from '@/components/admin/ui';
import { isImageDataUrl } from '@/lib/attachment';
import { useContent } from '@/lib/contentContext';
import { resolveTemplateFields } from '@/lib/letterTemplate';
import type { Aspiration, LetterFormField, LetterSubmission } from '@/types';

const FIELD_LABELS: Record<string, string> = {
  nama: 'Nama',
  namaBank: 'Nama Bank',
  namaAccount: 'Nama Account',
  nomorRekening: 'Nomor Rekening',
  bicSwift: 'BIC / Swift Code',
  iban: 'IBAN / ABA / BSB',
  kampus: 'Kampus',
  negara: 'Negara',
  jenisDana: 'Jenis Dana',
  jumlah: 'Jumlah',
  dokumenPendukung: 'Dokumen Pendukung',
};

function fieldLabel(
  key: string,
  documents: { key: string; label: string }[] | undefined,
  fields: LetterFormField[],
): string {
  return (
    documents?.find((document) => document.key === key)?.label ??
    fields.find((field) => field.key === key)?.label ??
    FIELD_LABELS[key] ??
    key.replace(/([A-Z])/g, ' $1')
  );
}

function formatDate(value: string): string {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('id-ID');
}

function StatusPill({ status }: { status: LetterSubmission['status'] }) {
  const styles = {
    diajukan: 'bg-gold-100 text-gold-800',
    disetujui: 'bg-emerald-100 text-emerald-700',
    ditolak: 'bg-red-100 text-red-700',
  };
  const labels = {
    diajukan: 'Menunggu',
    disetujui: 'Disetujui',
    ditolak: 'Ditolak',
  };
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}

function Notice({
  tone,
  message,
}: {
  tone: 'error' | 'info';
  message: string;
}) {
  const cls =
    tone === 'error'
      ? 'border-red-200 bg-red-50 text-red-700'
      : 'border-gold-200 bg-gold-50 text-gold-800';
  return <div className={`mb-4 rounded-lg border px-4 py-3 text-sm ${cls}`}>{message}</div>;
}

export function SubmissionsTab({
  submissions,
  loading,
  error,
  note,
  onRefresh,
  onUpdateStatus,
  onDelete,
}: {
  submissions: LetterSubmission[];
  loading: boolean;
  error: string;
  note: string;
  onRefresh: () => void;
  onUpdateStatus: (id: string, status: LetterSubmission['status']) => void;
  onDelete: (id: string) => void;
}) {
  const { letterTemplates } = useContent();

  return (
    <div>
      <SectionHeader
        title="Pengajuan Surat"
        desc="Pengajuan dari pengunjung dan statusnya."
        action={
          <button className={btnGhost} onClick={onRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Memuat...' : 'Muat Ulang'}
          </button>
        }
      />

      {error && <Notice tone="error" message={error} />}
      {note && <Notice tone="info" message={note} />}

      {submissions.length === 0 && !loading ? (
        <EmptyState message="Belum ada pengajuan surat." />
      ) : (
        <div className="space-y-3">
          {submissions.map((submission) => {
            const template = letterTemplates.find(
              (item) => item.id === submission.templateId,
            );
            const templateFields = template
              ? resolveTemplateFields(template)
              : [];

            return (
            <div
              key={submission.id}
              className="rounded-xl border border-navy-100 p-4"
            >
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <p className="font-semibold text-navy-900">
                    {submission.templateTitle}
                  </p>
                  <p className="text-xs text-navy-500">
                    {formatDate(submission.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusPill status={submission.status} />
                  {submission.status === 'diajukan' && (
                    <>
                      <button
                        onClick={() =>
                          onUpdateStatus(submission.id, 'disetujui')
                        }
                        className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700"
                      >
                        <Check className="h-3.5 w-3.5" /> Setujui
                      </button>
                      <button
                        onClick={() => onUpdateStatus(submission.id, 'ditolak')}
                        className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700"
                      >
                        <X className="h-3.5 w-3.5" /> Tolak
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => onDelete(submission.id)}
                    className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                    title="Hapus pengajuan"
                    aria-label={`Hapus pengajuan ${submission.templateTitle}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Hapus
                  </button>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
                {Object.entries(submission.fields).map(([key, value]) => {
                  const isAttachment = isImageDataUrl(value);
                  const label = fieldLabel(
                    key,
                    template?.documents,
                    templateFields,
                  );

                  return (
                    <div
                      key={key}
                      className={`rounded bg-navy-50 px-2 py-1 ${
                        isAttachment ? 'col-span-2 sm:col-span-3' : ''
                      }`}
                    >
                      <span className="text-navy-500">{label}: </span>
                      {isAttachment ? (
                        <a
                          href={value}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1 block w-fit"
                        >
                          <img
                            src={value}
                            alt={label}
                            className="max-h-40 rounded border border-navy-200 bg-white object-contain"
                          />
                        </a>
                      ) : (
                        <span className="break-words text-navy-900">
                          {value.length > 200 ? `${value.slice(0, 200)}…` : value}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function AspirationsTab({
  aspirations,
  loading,
  error,
  onRefresh,
}: {
  aspirations: Aspiration[];
  loading: boolean;
  error: string;
  onRefresh: () => void;
}) {
  return (
    <div>
      <SectionHeader
        title="Aspirasi Masuk"
        desc="Masukan dari pengunjung halaman beranda."
        action={
          <button className={btnGhost} onClick={onRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Memuat...' : 'Muat Ulang'}
          </button>
        }
      />

      {error && <Notice tone="error" message={error} />}

      {aspirations.length === 0 && !loading ? (
        <EmptyState message="Belum ada aspirasi." />
      ) : (
        <div className="space-y-3">
          {aspirations.map((aspiration) => (
            <div
              key={aspiration.id}
              className="rounded-xl border border-navy-100 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-navy-900">
                    {aspiration.name}
                  </p>
                  <p className="text-xs text-navy-500">{aspiration.email}</p>
                </div>
                <span className="text-xs text-navy-500">
                  {formatDate(aspiration.createdAt)}
                </span>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm text-navy-700">
                {aspiration.message}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
