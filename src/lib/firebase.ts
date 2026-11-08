import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  getAuth,
  type User,
} from 'firebase/auth';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  setDoc,
} from 'firebase/firestore';
import type {
  Aspiration,
  KosListing,
  LetterSubmission,
  MarketListing,
  SiteContent,
} from '@/types';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string | undefined,
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId,
);

const app = isFirebaseConfigured
  ? getApps().length
    ? getApp()
    : initializeApp(firebaseConfig)
  : null;

export const db = app ? getFirestore(app) : null;
export const auth = app ? getAuth(app) : null;

const SUBMISSIONS_COLLECTION = 'letterSubmissions';
const ASPIRATIONS_COLLECTION = 'aspirations';
const MARKET_COLLECTION = 'marketListings';
const KOS_COLLECTION = 'kosListings';

// ---------------------------------------------------------------------------
// Konten situs
// ---------------------------------------------------------------------------

export async function fetchSiteContent(): Promise<Partial<SiteContent> | null> {
  if (!db) return null;
  try {
    const snap = await getDoc(doc(db, 'site', 'content'));
    if (!snap.exists()) return null;
    return snap.data() as Partial<SiteContent>;
  } catch (error) {
    console.error('Gagal membaca konten dari Firestore', error);
    return null;
  }
}

export async function saveSiteContent(content: SiteContent): Promise<boolean> {
  if (!db) return false;
  try {
    await setDoc(doc(db, 'site', 'content'), content);
    return true;
  } catch (error) {
    console.error('Gagal menyimpan konten ke Firestore', error);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Autentikasi admin
// ---------------------------------------------------------------------------

export function watchAdmin(callback: (user: User | null) => void): () => void {
  if (!auth) {
    callback(null);
    return () => undefined;
  }
  return onAuthStateChanged(auth, callback);
}

export async function signInAdmin(
  email: string,
  password: string,
): Promise<{ ok: boolean; message: string }> {
  if (!auth) return { ok: false, message: 'Firebase belum dikonfigurasi.' };
  try {
    await signInWithEmailAndPassword(auth, email, password);
    return { ok: true, message: '' };
  } catch (error) {
    const code = (error as { code?: string }).code ?? '';
    const messages: Record<string, string> = {
      'auth/invalid-email': 'Format email tidak valid.',
      'auth/user-not-found': 'Akun admin tidak ditemukan.',
      'auth/wrong-password': 'Kata sandi salah.',
      'auth/invalid-credential': 'Email atau kata sandi salah.',
      'auth/too-many-requests': 'Terlalu banyak percobaan. Coba lagi nanti.',
      'auth/network-request-failed': 'Gagal terhubung ke jaringan.',
    };
    return {
      ok: false,
      message: messages[code] ?? 'Gagal masuk. Periksa email dan kata sandi.',
    };
  }
}

export async function signOutAdmin(): Promise<void> {
  if (auth) await signOut(auth);
}

// ---------------------------------------------------------------------------
// Pengajuan surat
// ---------------------------------------------------------------------------

export async function submitLetter(
  data: Pick<LetterSubmission, 'templateId' | 'templateTitle' | 'fields'>,
): Promise<LetterSubmission | null> {
  if (!db) return null;
  const createdAt = new Date().toISOString();
  try {
    const ref = await addDoc(collection(db, SUBMISSIONS_COLLECTION), {
      ...data,
      createdAt,
    });
    return {
      id: ref.id,
      templateId: data.templateId,
      templateTitle: data.templateTitle,
      fields: data.fields,
      createdAt,
    };
  } catch (error) {
    console.error('Gagal menyimpan pengajuan surat', error);
    return null;
  }
}

export async function fetchLetterSubmissions(): Promise<LetterSubmission[] | null> {
  if (!db) return [];
  try {
    const snap = await getDocs(
      query(collection(db, SUBMISSIONS_COLLECTION), orderBy('createdAt', 'desc')),
    );
    return snap.docs.map((item) => {
      const data = item.data();
      return {
        id: item.id,
        templateId: String(data.templateId ?? ''),
        templateTitle: String(data.templateTitle ?? ''),
        fields: (data.fields ?? {}) as Record<string, string>,
        createdAt: String(data.createdAt ?? ''),
      };
    });
  } catch (error) {
    console.error('Gagal membaca pengajuan surat', error);
    return null;
  }
}

export async function deleteLetterSubmission(id: string): Promise<boolean> {
  if (!db) return false;
  try {
    await deleteDoc(doc(db, SUBMISSIONS_COLLECTION, id));
    return true;
  } catch (error) {
    console.error('Gagal menghapus pengajuan surat', error);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Aspirasi
// ---------------------------------------------------------------------------

export async function submitAspiration(
  data: Pick<Aspiration, 'name' | 'email' | 'message'>,
): Promise<Aspiration | null> {
  if (!db) return null;
  const createdAt = new Date().toISOString();
  try {
    const ref = await addDoc(collection(db, ASPIRATIONS_COLLECTION), {
      ...data,
      createdAt,
    });
    return { id: ref.id, ...data, createdAt };
  } catch (error) {
    console.error('Gagal menyimpan aspirasi', error);
    return null;
  }
}

export interface SiteMetrics {
  views: number;
  loves: number;
}

const LOCAL_METRICS_KEY = 'aksara_metrics';
const METRICS_EVENT = 'aksara-metrics';

function readLocalMetrics(): SiteMetrics {
  try {
    const raw = localStorage.getItem(LOCAL_METRICS_KEY);
    if (!raw) return { views: 0, loves: 0 };
    const parsed = JSON.parse(raw) as Partial<SiteMetrics>;
    return {
      views: Math.max(0, Math.floor(Number(parsed.views ?? 0))),
      loves: Math.max(0, Math.floor(Number(parsed.loves ?? 0))),
    };
  } catch {
    return { views: 0, loves: 0 };
  }
}

function writeLocalMetrics(next: SiteMetrics) {
  localStorage.setItem(LOCAL_METRICS_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(METRICS_EVENT));
}

export function subscribeSiteMetrics(
  onChange: (metrics: SiteMetrics) => void,
): () => void {
  if (!db) {
    onChange(readLocalMetrics());
    const refresh = () => onChange(readLocalMetrics());
    window.addEventListener(METRICS_EVENT, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(METRICS_EVENT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }

  return onSnapshot(
    doc(db, 'site', 'metrics'),
    (snap) => {
      const data = snap.data();
      onChange({
        views: Math.max(0, Math.floor(Number(data?.views ?? 0))),
        loves: Math.max(0, Math.floor(Number(data?.loves ?? 0))),
      });
    },
    (error) => {
      console.error('Gagal membaca metrik situs', error);
      onChange(readLocalMetrics());
    },
  );
}

export async function bumpSiteMetric(field: 'views' | 'loves'): Promise<boolean> {
  if (!db) {
    const current = readLocalMetrics();
    writeLocalMetrics({
      views: current.views + (field === 'views' ? 1 : 0),
      loves: current.loves + (field === 'loves' ? 1 : 0),
    });
    return true;
  }

  const ref = doc(db, 'site', 'metrics');
  try {
    await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(ref);
      if (!snap.exists()) {
        transaction.set(ref, {
          views: field === 'views' ? 1 : 0,
          loves: field === 'loves' ? 1 : 0,
        });
        return;
      }
      const data = snap.data();
      const views = Math.max(0, Math.floor(Number(data.views ?? 0)));
      const loves = Math.max(0, Math.floor(Number(data.loves ?? 0)));
      transaction.update(ref, {
        views: views + (field === 'views' ? 1 : 0),
        loves: loves + (field === 'loves' ? 1 : 0),
      });
    });
    return true;
  } catch (error) {
    console.error('Gagal memperbarui metrik situs', error);
    return false;
  }
}

export async function fetchAspirations(): Promise<Aspiration[] | null> {
  if (!db) return [];
  try {
    const snap = await getDocs(
      query(collection(db, ASPIRATIONS_COLLECTION), orderBy('createdAt', 'desc')),
    );
    return snap.docs.map((item) => {
      const data = item.data();
      return {
        id: item.id,
        name: String(data.name ?? ''),
        email: String(data.email ?? ''),
        message: String(data.message ?? ''),
        createdAt: String(data.createdAt ?? ''),
      };
    });
  } catch (error) {
    console.error('Gagal membaca aspirasi', error);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Pasar awardee
// ---------------------------------------------------------------------------

function toMarketListing(id: string, data: Record<string, unknown>): MarketListing {
  return {
    id,
    sellerName: String(data.sellerName ?? ''),
    contact: String(data.contact ?? ''),
    city: String(data.city ?? ''),
    title: String(data.title ?? ''),
    category: String(data.category ?? ''),
    condition: String(data.condition ?? ''),
    price: Math.max(0, Math.floor(Number(data.price ?? 0))),
    description: String(data.description ?? ''),
    imageUrl: String(data.imageUrl ?? ''),
    createdAt: String(data.createdAt ?? ''),
  };
}

export async function submitMarketListing(
  data: Omit<MarketListing, 'id' | 'createdAt'>,
): Promise<MarketListing | null> {
  if (!db) return null;
  const createdAt = new Date().toISOString();
  try {
    const ref = await addDoc(collection(db, MARKET_COLLECTION), {
      ...data,
      createdAt,
    });
    return { id: ref.id, ...data, createdAt };
  } catch (error) {
    console.error('Gagal menyimpan iklan pasar', error);
    return null;
  }
}

export async function fetchMarketListings(): Promise<MarketListing[] | null> {
  if (!db) return [];
  try {
    const snap = await getDocs(
      query(collection(db, MARKET_COLLECTION), orderBy('createdAt', 'desc')),
    );
    return snap.docs.map((item) =>
      toMarketListing(item.id, item.data() as Record<string, unknown>),
    );
  } catch (error) {
    console.error('Gagal membaca iklan pasar', error);
    return null;
  }
}

export async function deleteMarketListing(id: string): Promise<boolean> {
  if (!db) return false;
  try {
    await deleteDoc(doc(db, MARKET_COLLECTION, id));
    return true;
  } catch (error) {
    console.error('Gagal menghapus iklan pasar', error);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Katalog kos
// ---------------------------------------------------------------------------

function toKosListing(id: string, data: Record<string, unknown>): KosListing {
  const facilities = Array.isArray(data.facilities)
    ? data.facilities.map((item) => String(item)).filter(Boolean)
    : [];

  return {
    id,
    name: String(data.name ?? ''),
    campus: data.campus === 'salemba' ? 'salemba' : 'depok',
    gender:
      data.gender === 'putri' || data.gender === 'campur'
        ? data.gender
        : 'putra',
    address: String(data.address ?? ''),
    price: Math.max(0, Math.floor(Number(data.price ?? 0))),
    facilities,
    contact: String(data.contact ?? ''),
    imageUrl: String(data.imageUrl ?? ''),
    lat: Number(data.lat ?? 0),
    lng: Number(data.lng ?? 0),
    notes: String(data.notes ?? ''),
    ratingSum: Math.max(0, Math.floor(Number(data.ratingSum ?? 0))),
    ratingCount: Math.max(0, Math.floor(Number(data.ratingCount ?? 0))),
    createdAt: String(data.createdAt ?? ''),
  };
}

export async function fetchKosListings(): Promise<KosListing[] | null> {
  if (!db) return [];
  try {
    const snap = await getDocs(
      query(collection(db, KOS_COLLECTION), orderBy('createdAt', 'desc')),
    );
    return snap.docs.map((item) =>
      toKosListing(item.id, item.data() as Record<string, unknown>),
    );
  } catch (error) {
    console.error('Gagal membaca katalog kos', error);
    return null;
  }
}

export async function saveKosListing(
  id: string | null,
  data: Omit<KosListing, 'id' | 'isSample'>,
): Promise<KosListing | null> {
  if (!db) return null;
  try {
    if (id) {
      await setDoc(doc(db, KOS_COLLECTION, id), data);
      return { id, ...data };
    }
    const ref = await addDoc(collection(db, KOS_COLLECTION), data);
    return { id: ref.id, ...data };
  } catch (error) {
    console.error('Gagal menyimpan katalog kos', error);
    return null;
  }
}

export async function deleteKosListing(id: string): Promise<boolean> {
  if (!db) return false;
  try {
    await deleteDoc(doc(db, KOS_COLLECTION, id));
    return true;
  } catch (error) {
    console.error('Gagal menghapus katalog kos', error);
    return false;
  }
}

export async function rateKosListing(
  id: string,
  rating: number,
): Promise<{ ratingSum: number; ratingCount: number } | null> {
  if (!db) return null;
  const value = Math.max(1, Math.min(5, Math.round(rating)));
  const ref = doc(db, KOS_COLLECTION, id);

  try {
    let next = { ratingSum: 0, ratingCount: 0 };
    await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(ref);
      if (!snap.exists()) throw new Error('Kos tidak ditemukan.');
      const data = snap.data();
      const ratingSum = Math.max(0, Math.floor(Number(data.ratingSum ?? 0)));
      const ratingCount = Math.max(0, Math.floor(Number(data.ratingCount ?? 0)));
      next = {
        ratingSum: ratingSum + value,
        ratingCount: ratingCount + 1,
      };
      transaction.update(ref, next);
    });
    return next;
  } catch (error) {
    console.error('Gagal mengirim rating kos', error);
    return null;
  }
}
