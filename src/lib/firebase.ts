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
  orderBy,
  query,
  setDoc,
} from 'firebase/firestore';
import type {
  Aspiration,
  LetterSubmission,
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
