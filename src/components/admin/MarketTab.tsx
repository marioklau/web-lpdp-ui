import { PackageSearch, RefreshCw, Trash2 } from 'lucide-react';
import {
  EmptyState,
  SectionHeader,
  btnGhost,
} from '@/components/admin/ui';
import type { MarketListing } from '@/types';

function formatPrice(value: number): string {
  if (value <= 0) return 'Gratis / Nego';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string): string {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('id-ID');
}

function whatsappLink(contact: string): string {
  const digits = contact.replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('0')) return `https://wa.me/62${digits.slice(1)}`;
  if (digits.startsWith('8')) return `https://wa.me/62${digits}`;
  return `https://wa.me/${digits}`;
}

export default function MarketTab({
  listings,
  loading,
  error,
  onRefresh,
  onDelete,
}: {
  listings: MarketListing[];
  loading: boolean;
  error: string;
  onRefresh: () => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div>
      <SectionHeader
        title="Pasar Awardee"
        desc="Iklan jual beli barang bekas antar-awardee. Transaksi berlangsung di luar platform."
        action={
          <button className={btnGhost} onClick={onRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Memuat...' : 'Muat Ulang'}
          </button>
        }
      />

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {listings.length === 0 && !loading ? (
        <EmptyState message="Belum ada iklan pasar." />
      ) : (
        <div className="space-y-3">
          {listings.map((listing) => {
            const wa = whatsappLink(listing.contact);
            return (
              <div
                key={listing.id}
                className="rounded-xl border border-navy-100 p-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                  <div className="h-24 w-32 shrink-0 overflow-hidden rounded-lg border border-navy-100 bg-navy-50">
                    {listing.imageUrl ? (
                      <img
                        src={listing.imageUrl}
                        alt={listing.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="grid h-full place-items-center text-navy-300">
                        <PackageSearch className="h-8 w-8" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-navy-900">
                          {listing.title}
                        </p>
                        <p className="text-xs text-navy-500">
                          {listing.category} · {listing.condition} ·{' '}
                          {formatDate(listing.createdAt)}
                        </p>
                      </div>
                      <span className="rounded-lg bg-gold-50 px-2.5 py-1 text-sm font-bold text-gold-700">
                        {formatPrice(listing.price)}
                      </span>
                    </div>

                    <p className="mt-2 line-clamp-2 whitespace-pre-wrap text-sm text-navy-700">
                      {listing.description}
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-navy-500">
                      <span>{listing.sellerName}</span>
                      <span>{listing.city}</span>
                      {wa ? (
                        <a
                          href={wa}
                          target="_blank"
                          rel="noreferrer"
                          className="font-medium text-navy-700 underline decoration-navy-300 underline-offset-2 hover:text-navy-900"
                        >
                          {listing.contact}
                        </a>
                      ) : (
                        <span>{listing.contact}</span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => onDelete(listing.id)}
                    className="inline-flex shrink-0 items-center gap-1 self-start rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                    title="Hapus iklan"
                    aria-label={`Hapus iklan ${listing.title}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Hapus
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
