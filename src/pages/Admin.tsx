import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  BarChart3,
  Building2,
  Database,
  FileText,
  Inbox,
  LayoutDashboard,
  LogOut,
  Map as MapIcon,
  MessageSquareText,
  Newspaper,
  Shield,
  Sparkles,
  Store,
  Target,
  User,
  Users,
  Wifi,
  Home,
} from 'lucide-react';
import type { User as FirebaseUser } from 'firebase/auth';
import Dashboard from '@/components/admin/Dashboard';
import ProfilTab from '@/components/admin/ProfilTab';
import HomeTab from '@/components/admin/HomeTab';
import VisiMisiTab from '@/components/admin/VisiMisiTab';
import ProgramsTab from '@/components/admin/ProgramsTab';
import StatsTab from '@/components/admin/StatsTab';
import ProvincesTab from '@/components/admin/ProvincesTab';
import AwardeesTab from '@/components/admin/AwardeesTab';
import NewsTab from '@/components/admin/NewsTab';
import TemplatesTab from '@/components/admin/TemplatesTab';
import MarketTab from '@/components/admin/MarketTab';
import KosTab from '@/components/admin/KosTab';
import { AspirationsTab, SubmissionsTab } from '@/components/admin/InboxTabs';
import {
  Field,
  btnGhost,
  btnPrimary,
  inputClass,
} from '@/components/admin/ui';
import { useContent, type SaveResult } from '@/lib/contentContext';
import {
  deleteKosListing,
  deleteLetterSubmission,
  deleteMarketListing,
  fetchAspirations,
  fetchKosListings,
  fetchLetterSubmissions,
  fetchMarketListings,
  isFirebaseConfigured,
  saveKosListing,
  signInAdmin,
  signOutAdmin,
  watchAdmin,
} from '@/lib/firebase';
import { KOS_LISTINGS_STORAGE_KEY, toKosPayload } from '@/lib/kos';
import { SAMPLE_KOS_LISTINGS } from '@/lib/kosSamples';
import { useLocalStorage } from '@/lib/useLocalStorage';
import { SAMPLE_MARKET_LISTINGS } from '@/lib/marketSamples';
import type {
  Aspiration,
  KosListing,
  LetterSubmission,
  MarketListing,
} from '@/types';

type Tab =
  | 'dashboard'
  | 'profil'
  | 'beranda'
  | 'visimisi'
  | 'program'
  | 'statistik'
  | 'provinsi'
  | 'awardee'
  | 'berita'
  | 'template'
  | 'pengajuan'
  | 'aspirasi'
  | 'pasar'
  | 'kos';

const tabs: { id: Tab; label: string; icon: typeof User }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'profil', label: 'Profil', icon: User },
  { id: 'beranda', label: 'Beranda', icon: Home },
  { id: 'visimisi', label: 'Visi & Misi', icon: Target },
  { id: 'program', label: 'Program', icon: Sparkles },
  { id: 'statistik', label: 'Statistik', icon: BarChart3 },
  { id: 'provinsi', label: 'Provinsi', icon: MapIcon },
  { id: 'awardee', label: 'Awardee', icon: Users },
  { id: 'berita', label: 'Berita', icon: Newspaper },
  { id: 'template', label: 'Template Surat', icon: FileText },
  { id: 'pengajuan', label: 'Pengajuan Dana', icon: Inbox },
  { id: 'aspirasi', label: 'Aspirasi', icon: MessageSquareText },
  { id: 'pasar', label: 'Pasar Awardee', icon: Store },
  { id: 'kos', label: 'Katalog Kos', icon: Building2 },
];

function mergeById<T extends { id: string }>(local: T[], remote: T[]): T[] {
  const map = new Map<string, T>();
  for (const item of local) map.set(item.id, item);
  for (const item of remote) map.set(item.id, item);
  return [...map.values()];
}

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(isFirebaseConfigured);
  const { source } = useContent();

  const [localSubmissions, setLocalSubmissions] = useLocalStorage<
    LetterSubmission[]
  >('lpdp_letter_submissions', []);
  const [localAspirations] = useLocalStorage<Aspiration[]>(
    'lpdp_aspirations',
    [],
  );
  const [localMarket, setLocalMarket] = useLocalStorage<MarketListing[]>(
    'lpdp_market_listings',
    [],
  );
  const [localKos, setLocalKos] = useLocalStorage<KosListing[]>(
    KOS_LISTINGS_STORAGE_KEY,
    [],
  );
  const [remoteSubmissions, setRemoteSubmissions] = useState<
    LetterSubmission[]
  >([]);
  const [remoteAspirations, setRemoteAspirations] = useState<Aspiration[]>([]);
  const [remoteMarket, setRemoteMarket] = useState<MarketListing[]>([]);
  const [remoteKos, setRemoteKos] = useState<KosListing[]>([]);
  const [inboxLoading, setInboxLoading] = useState(false);
  const [inboxError, setInboxError] = useState('');
  const [inboxNote, setInboxNote] = useState('');

  useEffect(() => {
    const unsubscribe = watchAdmin((nextUser) => {
      setUser(nextUser);
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  const loadInbox = useCallback(async () => {
    if (!isFirebaseConfigured) {
      setRemoteSubmissions([]);
      setRemoteAspirations([]);
      setRemoteMarket([]);
      setRemoteKos([]);
      setInboxError('');
      return;
    }
    setInboxLoading(true);
    setInboxError('');
    const [submissions, aspirations, market, kos] = await Promise.all([
      fetchLetterSubmissions(),
      fetchAspirations(),
      fetchMarketListings(),
      fetchKosListings(),
    ]);
    if (
      submissions === null ||
      aspirations === null ||
      market === null ||
      kos === null
    ) {
      setInboxError(
        'Sebagian data gagal dimuat dari Firebase. Pastikan Anda login dan aturan Firestore sudah diterapkan.',
      );
    }
    if (submissions) setRemoteSubmissions(submissions);
    if (aspirations) setRemoteAspirations(aspirations);
    if (market) setRemoteMarket(market);
    if (kos) setRemoteKos(kos);
    setInboxLoading(false);
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    if (user) void loadInbox();
  }, [user, loadInbox]);

  useEffect(() => {
    if (!user) {
      setRemoteSubmissions([]);
      setRemoteAspirations([]);
      setRemoteMarket([]);
      setRemoteKos([]);
    }
  }, [user]);

  const submissions = useMemo(
    () =>
      mergeById(localSubmissions, remoteSubmissions).sort((a, b) =>
        b.createdAt.localeCompare(a.createdAt),
      ),
    [localSubmissions, remoteSubmissions],
  );

  const aspirations = useMemo(
    () =>
      mergeById(localAspirations, remoteAspirations).sort((a, b) =>
        b.createdAt.localeCompare(a.createdAt),
      ),
    [localAspirations, remoteAspirations],
  );

  const marketListings = useMemo(
    () =>
      mergeById(mergeById(SAMPLE_MARKET_LISTINGS, localMarket), remoteMarket).sort(
        (a, b) => b.createdAt.localeCompare(a.createdAt),
      ),
    [localMarket, remoteMarket],
  );

  const kosListings = useMemo(
    () =>
      mergeById(mergeById(SAMPLE_KOS_LISTINGS, localKos), remoteKos).sort(
        (a, b) => b.createdAt.localeCompare(a.createdAt),
      ),
    [localKos, remoteKos],
  );

  const deleteSubmission = async (id: string) => {
    const submission = submissions.find((item) => item.id === id);
    const title = submission?.templateTitle ?? 'pengajuan ini';
    if (
      !window.confirm(
        `Hapus "${title}"? Tindakan ini tidak dapat dibatalkan.`,
      )
    ) {
      return;
    }

    if (isFirebaseConfigured) {
      const deleted = await deleteLetterSubmission(id);
      if (!deleted) {
        setInboxNote(
          'Gagal menghapus pengajuan dari Firebase. Periksa login dan aturan Firestore.',
        );
        return;
      }
    }

    setLocalSubmissions((prev) => prev.filter((item) => item.id !== id));
    setRemoteSubmissions((prev) => prev.filter((item) => item.id !== id));
    setInboxNote(
      isFirebaseConfigured
        ? 'Pengajuan dana berhasil dihapus dari Firebase.'
        : 'Pengajuan dana dihapus dari browser ini.',
    );
  };

  const deleteListing = async (id: string) => {
    const listing = marketListings.find((item) => item.id === id);
    const title = listing?.title ?? 'iklan ini';
    if (
      !window.confirm(`Hapus "${title}"? Tindakan ini tidak dapat dibatalkan.`)
    ) {
      return;
    }

    const isRemote = remoteMarket.some((item) => item.id === id);
    if (isFirebaseConfigured && isRemote) {
      const deleted = await deleteMarketListing(id);
      if (!deleted) {
        setInboxNote(
          'Gagal menghapus iklan dari Firebase. Periksa login dan aturan Firestore.',
        );
        return;
      }
    }

    setLocalMarket((prev) => prev.filter((item) => item.id !== id));
    setRemoteMarket((prev) => prev.filter((item) => item.id !== id));
    setInboxNote(
      isRemote
        ? 'Iklan pasar berhasil dihapus dari Firebase.'
        : 'Iklan pasar dihapus dari browser ini.',
    );
  };

  const saveKos = async (listing: KosListing): Promise<SaveResult> => {
    const name = listing.name.trim();
    const address = listing.address.trim();
    if (!name || !address) {
      return {
        ok: false,
        persisted: false,
        message: 'Nama dan alamat kos wajib diisi.',
      };
    }
    if (
      !Number.isFinite(listing.lat) ||
      !Number.isFinite(listing.lng) ||
      listing.lat < -90 ||
      listing.lat > 90 ||
      listing.lng < -180 ||
      listing.lng > 180
    ) {
      return {
        ok: false,
        persisted: false,
        message: 'Koordinat lokasi kos tidak valid.',
      };
    }

    const payload = toKosPayload({
      ...listing,
      name,
      address,
      price: Math.max(0, Math.floor(listing.price)),
      facilities: [...new Set(listing.facilities)],
      contact: listing.contact.trim(),
      imageUrl: listing.imageUrl.trim(),
      notes: listing.notes.trim(),
    });
    const isRemote = remoteKos.some((item) => item.id === listing.id);

    if (isFirebaseConfigured) {
      const saved = await saveKosListing(isRemote ? listing.id : null, payload);
      if (!saved) {
        return {
          ok: false,
          persisted: false,
          message:
            'Gagal menyimpan kos ke Firebase. Periksa login dan aturan Firestore.',
        };
      }
      setRemoteKos((prev) =>
        isRemote
          ? prev.map((item) => (item.id === saved.id ? saved : item))
          : [saved, ...prev],
      );
      setLocalKos((prev) => prev.filter((item) => item.id !== listing.id));
      setInboxNote('Kos berhasil disimpan ke Firebase.');
      return {
        ok: true,
        persisted: true,
        message:
          'Kos berhasil disimpan ke Firebase dan tampil di katalog publik.',
      };
    }

    const id = listing.id || crypto.randomUUID();
    const next: KosListing = { ...payload, id, isSample: false };
    setLocalKos((prev) =>
      prev.some((item) => item.id === id)
        ? prev.map((item) => (item.id === id ? next : item))
        : [next, ...prev],
    );
    setInboxNote('Kos disimpan di browser ini.');
    return {
      ok: true,
      persisted: false,
      message:
        'Kos disimpan di browser ini. Hubungkan Firebase agar tampil untuk semua pengunjung.',
    };
  };

  const deleteKos = async (id: string): Promise<SaveResult | null> => {
    const listing = kosListings.find((item) => item.id === id);
    if (!listing || listing.isSample) return null;
    if (
      !window.confirm(
        `Hapus "${listing.name}"? Tindakan ini tidak dapat dibatalkan.`,
      )
    ) {
      return null;
    }

    const isRemote = remoteKos.some((item) => item.id === id);
    if (isFirebaseConfigured && isRemote) {
      const deleted = await deleteKosListing(id);
      if (!deleted) {
        return {
          ok: false,
          persisted: false,
          message:
            'Gagal menghapus kos dari Firebase. Periksa login dan aturan Firestore.',
        };
      }
    }

    setLocalKos((prev) => prev.filter((item) => item.id !== id));
    setRemoteKos((prev) => prev.filter((item) => item.id !== id));
    setInboxNote(
      isRemote
        ? 'Kos berhasil dihapus dari Firebase.'
        : 'Kos dihapus dari browser ini.',
    );
    return {
      ok: true,
      persisted: isRemote,
      message: isRemote
        ? 'Kos berhasil dihapus dari Firebase.'
        : 'Kos dihapus dari browser ini.',
    };
  };

  const handleSignOut = async () => {
    await signOutAdmin();
    setTab('dashboard');
  };

  if (isFirebaseConfigured && authLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-navy-50">
        <p className="text-sm text-navy-600">Memeriksa sesi admin...</p>
      </main>
    );
  }

  if (isFirebaseConfigured && !user) {
    return <AdminLogin />;
  }

  return (
    <main className="min-h-screen bg-navy-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-navy-900 text-gold-300">
              <Shield className="h-6 w-6" />
            </span>
            <div>
              <h1 className="font-serif text-2xl font-semibold text-navy-900 sm:text-3xl">
                Panel Admin
              </h1>
              <p className="text-sm text-navy-600">
                Kelola konten kampanye dan layanan LPDP UI
              </p>
            </div>
          </div>

          {user && (
            <div className="flex items-center gap-3">
              <span className="hidden text-sm text-navy-600 sm:inline">
                {user.email}
              </span>
              <button className={btnGhost} onClick={handleSignOut}>
                <LogOut className="h-4 w-4" /> Keluar
              </button>
            </div>
          )}
        </div>

        {!isFirebaseConfigured && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-gold-200 bg-gold-50 px-5 py-4 text-sm text-gold-800">
            <Database className="mt-0.5 h-5 w-5 shrink-0 text-gold-600" />
            <p>
              <strong>Mode demo lokal.</strong> Semua perubahan tersimpan di
              browser ini. Isi kredensial Firebase di <code>.env</code> untuk
              mengaktifkan login admin dan sinkronisasi konten.
            </p>
          </div>
        )}

        {isFirebaseConfigured && source !== 'firebase' && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-gold-200 bg-gold-50 px-5 py-4 text-sm text-gold-800">
            <Wifi className="mt-0.5 h-5 w-5 shrink-0 text-gold-600" />
            <p>
              Firebase terhubung, tetapi konten masih memakai data contoh/lokal.
              Simpan salah satu tab untuk membuat dokumen konten di Firestore.
            </p>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          <aside className="sticky top-24 h-fit rounded-2xl border border-navy-100 bg-white p-3 shadow-soft">
            <nav className="flex gap-1 overflow-x-auto lg:flex-col">
              {tabs.map((item) => {
                const Icon = item.icon;
                const active = tab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setTab(item.id)}
                    className={`inline-flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                      active
                        ? 'bg-navy-900 text-gold-300'
                        : 'text-navy-700 hover:bg-navy-50'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </aside>

          <section className="rounded-2xl border border-navy-100 bg-white p-6 shadow-soft sm:p-8">
            {tab === 'dashboard' && (
              <Dashboard
                submissions={submissions}
                aspirations={aspirations}
                listings={marketListings}
                kosCount={kosListings.length}
                inboxLoading={inboxLoading}
                onRefreshInbox={loadInbox}
              />
            )}
            {tab === 'profil' && <ProfilTab />}
            {tab === 'beranda' && <HomeTab />}
            {tab === 'visimisi' && <VisiMisiTab />}
            {tab === 'program' && <ProgramsTab />}
            {tab === 'statistik' && <StatsTab />}
            {tab === 'provinsi' && <ProvincesTab />}
            {tab === 'awardee' && <AwardeesTab />}
            {tab === 'berita' && <NewsTab />}
            {tab === 'template' && <TemplatesTab />}
            {tab === 'pengajuan' && (
              <SubmissionsTab
                submissions={submissions}
                loading={inboxLoading}
                error={inboxError}
                note={inboxNote}
                onRefresh={loadInbox}
                onDelete={deleteSubmission}
              />
            )}
            {tab === 'aspirasi' && (
              <AspirationsTab
                aspirations={aspirations}
                loading={inboxLoading}
                error={inboxError}
                onRefresh={loadInbox}
              />
            )}
            {tab === 'pasar' && (
              <MarketTab
                listings={marketListings}
                loading={inboxLoading}
                error={inboxError}
                onRefresh={loadInbox}
                onDelete={deleteListing}
              />
            )}
            {tab === 'kos' && (
              <KosTab
                listings={kosListings}
                loading={inboxLoading}
                error={inboxError}
                onRefresh={loadInbox}
                onSave={saveKos}
                onDelete={deleteKos}
              />
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    const result = await signInAdmin(email.trim(), password);
    if (!result.ok) setError(result.message);
    setLoading(false);
  };

  return (
    <main className="grid min-h-screen place-items-center bg-navy-50 px-4 py-16">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl border border-navy-100 bg-white p-8 shadow-soft"
      >
        <span className="grid h-12 w-12 place-items-center rounded-xl bg-navy-900 text-gold-300">
          <Shield className="h-6 w-6" />
        </span>
        <h1 className="mt-5 font-serif text-2xl font-semibold text-navy-900">
          Masuk Admin
        </h1>
        <p className="mt-1 text-sm text-navy-600">
          Gunakan akun admin yang terdaftar di Firebase Authentication.
        </p>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-5 space-y-4">
          <Field label="Email">
            <input
              type="email"
              autoComplete="username"
              className={inputClass}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </Field>
          <Field label="Kata Sandi">
            <input
              type="password"
              autoComplete="current-password"
              className={inputClass}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </Field>
          <button
            type="submit"
            className={`${btnPrimary} w-full`}
            disabled={loading}
          >
            {loading ? 'Memeriksa...' : 'Masuk'}
          </button>
        </div>

        <p className="mt-5 text-xs leading-relaxed text-navy-500">
          Belum punya akun? Buat pengguna baru di Firebase Console →
          Authentication → Users, lalu aktifkan provider Email/Password.
        </p>
      </form>
    </main>
  );
}
