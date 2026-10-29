import { Database, RefreshCw, Wifi } from 'lucide-react';
import { useContent } from '@/lib/contentContext';
import { isFirebaseConfigured } from '@/lib/firebase';
import {
  SaveStatus,
  SectionHeader,
  btnGhost,
} from '@/components/admin/ui';
import type { Aspiration, LetterSubmission } from '@/types';

export default function Dashboard({
  submissions,
  aspirations,
  inboxLoading,
  onRefreshInbox,
}: {
  submissions: LetterSubmission[];
  aspirations: Aspiration[];
  inboxLoading: boolean;
  onRefreshInbox: () => void;
}) {
  const {
    programs,
    provinces,
    news,
    letterTemplates,
    source,
    lastSave,
    refresh,
    loading,
  } = useContent();

  const pending = submissions.filter((item) => item.status === 'diajukan').length;

  const cards = [
    {
      label: 'Pengajuan Surat',
      value: submissions.length,
      sub: `${pending} menunggu`,
    },
    {
      label: 'Aspirasi Masuk',
      value: aspirations.length,
      sub: 'dari pengunjung',
    },
    { label: 'Program', value: programs.length, sub: 'terdaftar' },
    { label: 'Provinsi', value: provinces.length, sub: 'terdata' },
    { label: 'Berita', value: news.length, sub: 'publikasi' },
    { label: 'Template Surat', value: letterTemplates.length, sub: 'tersedia' },
  ];

  const sourceLabel =
    source === 'firebase'
      ? 'Firebase — tersinkron'
      : source === 'local'
        ? 'Penyimpanan lokal browser'
        : 'Data contoh (belum disimpan)';

  const sourceTone =
    source === 'firebase'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
      : 'border-gold-200 bg-gold-50 text-gold-800';

  const handleRefresh = () => {
    void refresh();
    onRefreshInbox();
  };

  return (
    <div>
      <SectionHeader
        title="Dashboard"
        desc="Ringkasan konten dan aktivitas layanan."
        action={
          <button
            className={btnGhost}
            onClick={handleRefresh}
            disabled={loading || inboxLoading}
          >
            <RefreshCw
              className={`h-4 w-4 ${loading || inboxLoading ? 'animate-spin' : ''}`}
            />
            Muat Ulang Data
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-navy-100 bg-navy-50/50 p-5"
          >
            <p className="font-serif text-3xl font-bold text-navy-900">
              {card.value}
            </p>
            <p className="mt-1 text-sm text-navy-700">{card.label}</p>
            <p className="mt-1 text-xs text-gold-600">{card.sub}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className={`rounded-xl border px-5 py-4 text-sm ${sourceTone}`}>
          <div className="flex items-center gap-2 font-semibold">
            {source === 'firebase' ? (
              <Wifi className="h-4 w-4" />
            ) : (
              <Database className="h-4 w-4" />
            )}
            Sumber konten: {sourceLabel}
          </div>
          {!isFirebaseConfigured && (
            <p className="mt-2 text-xs leading-relaxed">
              Isi kredensial Firebase di <code>.env</code> untuk mengaktifkan
              login admin dan sinkronisasi. Tanpa itu, semua perubahan tersimpan
              di browser ini.
            </p>
          )}
          {isFirebaseConfigured && source !== 'firebase' && (
            <p className="mt-2 text-xs leading-relaxed">
              Simpan salah satu tab konten untuk membuat dokumen{' '}
              <code>site/content</code> di Firestore.
            </p>
          )}
        </div>

        <div className="rounded-xl border border-navy-100 px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-navy-500">
            Status penyimpanan terakhir
          </p>
          {lastSave ? (
            <SaveStatus result={lastSave} />
          ) : (
            <p className="mt-2 text-sm text-navy-500">
              Belum ada perubahan yang disimpan dari panel ini.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
