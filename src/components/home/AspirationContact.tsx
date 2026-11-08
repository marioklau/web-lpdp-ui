import { useState } from 'react';
import {
  AlertTriangle,
  Paperclip,
  Send,
  CheckCircle2,
  MessageSquareText,
  Search,
  Instagram,
  X,
} from 'lucide-react';
import { WhatsAppIcon } from '@/components/BrandIcons';
import { prepareAspirationFile } from '@/lib/attachment';
import { useContent } from '@/lib/contentContext';
import { isFirebaseConfigured, submitAspiration } from '@/lib/firebase';
import { useLocalStorage } from '@/lib/useLocalStorage';
import type { Aspiration } from '@/types';

type AspirationMode = 'anonymous' | 'contact';

const fieldClass =
  'w-full rounded-lg border border-navy-200 bg-white px-4 py-2.5 text-sm text-navy-900 outline-none transition focus:border-navy-500 focus:ring-2 focus:ring-navy-500/20';

interface AspirationContactProps {
  onOpenDpt: () => void;
}

export default function AspirationContact({ onOpenDpt }: AspirationContactProps) {
  const [mode, setMode] = useState<AspirationMode>('anonymous');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [message, setMessage] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  const [, setLocalAspirations] = useLocalStorage<Aspiration[]>(
    'lpdp_aspirations',
    [],
  );
  const { homepage } = useContent();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setWarning('');
    const anonymous = mode === 'anonymous';
    if (!message.trim()) {
      setError('Tuliskan aspirasi Anda.');
      return;
    }
    if (!anonymous) {
      if (!name.trim() || !email.trim() || !whatsapp.trim()) {
        setError('Lengkapi nama, email, dan WhatsApp agar aspirasi bisa ditindaklanjuti.');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        setError('Masukkan email yang valid.');
        return;
      }
      if (whatsapp.replace(/\D/g, '').length < 9) {
        setError('Masukkan nomor WhatsApp yang valid.');
        return;
      }
      if (!agreed) {
        setError('Centang persetujuan penggunaan data untuk tindak lanjut.');
        return;
      }
    }

    let attachment = { name: '', type: '', data: '' };
    if (!anonymous && file) {
      try {
        attachment = await prepareAspirationFile(file);
      } catch (fileError) {
        setError(fileError instanceof Error ? fileError.message : 'Dokumen tidak dapat diproses.');
        return;
      }
    }

    const payload = {
      anonymous,
      name: anonymous ? '' : name.trim(),
      email: anonymous ? '' : email.trim(),
      whatsapp: anonymous ? '' : whatsapp.trim(),
      message: message.trim(),
      attachmentName: attachment.name,
      attachmentType: attachment.type,
      attachmentData: attachment.data,
    };

    setSubmitting(true);
    const saved = isFirebaseConfigured ? await submitAspiration(payload) : null;
    const aspiration: Aspiration = saved ?? {
      id: crypto.randomUUID(),
      ...payload,
      createdAt: new Date().toISOString(),
    };

    setLocalAspirations((prev) => [
      aspiration,
      ...prev.filter((item) => item.id !== aspiration.id),
    ]);

    setWarning(
      isFirebaseConfigured && !saved
        ? 'Aspirasi tersimpan di browser ini, tetapi gagal dikirim ke server. Silakan coba lagi nanti.'
        : '',
    );
    setSubmitting(false);
    setSubmitted(true);
    setName('');
    setEmail('');
    setWhatsapp('');
    setMessage('');
    setAgreed(false);
    setFile(null);
    setTimeout(() => {
      setSubmitted(false);
      setWarning('');
    }, 8000);
  };

  return (
    <section id="aspirasi" className="bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2 items-start">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-gold-600">
              {homepage.contactEyebrow}
            </span>
            <h1 className="mt-3 font-serif text-3xl sm:text-4xl font-semibold text-navy-900">
              {homepage.contactTitle}
            </h1>
            <p className="mt-4 text-navy-600 leading-relaxed max-w-lg">
              {homepage.contactIntro}
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-3">
                <span className="grid place-items-center h-10 w-10 rounded-xl bg-navy-900 text-gold-300 shrink-0">
                  <MessageSquareText className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-navy-900">
                    {homepage.contactChannelTitle}
                  </p>
                  <p className="text-sm text-navy-600">
                    {homepage.contactChannelBody}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onOpenDpt}
                className="flex w-full items-start gap-3 rounded-xl text-left transition hover:bg-navy-50"
              >
                <span className="grid place-items-center h-10 w-10 rounded-xl bg-navy-900 text-gold-300 shrink-0">
                  <Search className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-navy-900">DPT Fix</p>
                  <p className="text-sm text-navy-600">
                    Cari nama, program studi, atau fakultas pada daftar pemilih tetap.
                  </p>
                </div>
              </button>
              <div className="flex items-start gap-3">
                <span className="grid place-items-center h-10 w-10 rounded-xl bg-navy-900 text-gold-300 shrink-0">
                  <WhatsAppIcon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-navy-900">{homepage.whatsappLabel}</p>
                  <a
                    href={homepage.whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-navy-600 hover:text-gold-600 transition-colors"
                  >
                    {homepage.phone}
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="grid place-items-center h-10 w-10 rounded-xl bg-navy-900 text-gold-300 shrink-0">
                  <Instagram className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-navy-900">{homepage.instagramLabel}</p>
                  <a
                    href={homepage.instagramUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-navy-600 hover:text-gold-600 transition-colors"
                  >
                    {homepage.instagramHandle}
                  </a>
                </div>
              </div>
            </div>

            <p className="mt-6 text-xs text-navy-400">
              Status penyimpanan:{' '}
              <span className={isFirebaseConfigured ? 'text-emerald-600 font-semibold' : 'text-gold-600 font-semibold'}>
                {isFirebaseConfigured
                  ? 'Tersambung ke Firebase'
                  : 'Mode lokal — aspirasi disimpan di browser'}
              </span>
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-2xl bg-navy-50 border border-navy-100 shadow-soft p-6 sm:p-8"
          >
            {submitted && (
              <div className="mb-4 flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700 animate-fade-in">
                <CheckCircle2 className="h-5 w-5" />
                Aspirasi Anda telah tercatat. Terima kasih!
              </div>
            )}
            {warning && (
              <div className="mb-4 flex items-start gap-2 rounded-lg bg-gold-50 border border-gold-200 px-4 py-3 text-sm text-gold-800 animate-fade-in">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{warning}</span>
              </div>
            )}
            {error && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMode('anonymous')}
                  className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                    mode === 'anonymous'
                      ? 'bg-navy-900 text-gold-300'
                      : 'border border-navy-200 bg-white text-navy-700 hover:bg-navy-100'
                  }`}
                >
                  Anonim
                </button>
                <button
                  type="button"
                  onClick={() => setMode('contact')}
                  className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                    mode === 'contact'
                      ? 'bg-navy-900 text-gold-300'
                      : 'border border-navy-200 bg-white text-navy-700 hover:bg-navy-100'
                  }`}
                >
                  Dengan data
                </button>
              </div>
              <p className="text-xs leading-relaxed text-navy-500">
                {mode === 'anonymous'
                  ? 'Cukup tulis aspirasi. Nama Anda tidak diminta dan tidak tersimpan.'
                  : 'Nama, email, dan WhatsApp hanya dipakai tim AKSARA untuk menindaklanjuti aspirasi ini. Data tidak dipublikasikan.'}
              </p>

              {mode === 'contact' && (
                <>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-navy-800" htmlFor="aspirasi-nama">
                      Nama
                    </label>
                    <input
                      id="aspirasi-nama"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      maxLength={200}
                      className={fieldClass}
                      placeholder="Nama Anda"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-navy-800" htmlFor="aspirasi-email">
                      Email
                    </label>
                    <input
                      id="aspirasi-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      maxLength={320}
                      className={fieldClass}
                      placeholder="email@contoh.id"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-navy-800" htmlFor="aspirasi-wa">
                      WhatsApp
                    </label>
                    <input
                      id="aspirasi-wa"
                      type="tel"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      required
                      maxLength={40}
                      className={fieldClass}
                      placeholder="08xx atau +62"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-navy-800" htmlFor="aspirasi-pesan">
                  Aspirasi
                </label>
                <textarea
                  id="aspirasi-pesan"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  required
                  maxLength={5000}
                  className={`${fieldClass} resize-none`}
                  placeholder="Tuliskan masukan Anda..."
                />
              </div>

              {mode === 'contact' && (
                <>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-navy-800" htmlFor="aspirasi-bukti">
                      Bukti <span className="font-normal text-navy-400">(opsional, gambar, Word, atau PDF)</span>
                    </label>
                    {file ? (
                      <div className="flex items-center justify-between gap-3 rounded-lg border border-navy-200 bg-white px-4 py-2.5 text-sm text-navy-800">
                        <span className="inline-flex min-w-0 items-center gap-2">
                          <Paperclip className="h-4 w-4 shrink-0 text-gold-600" />
                          <span className="truncate">{file.name}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setFile(null)}
                          className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-navy-500 hover:bg-navy-100"
                          aria-label="Hapus dokumen"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <input
                        id="aspirasi-bukti"
                        type="file"
                        accept="image/*,.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                        className="block w-full text-sm text-navy-700 file:mr-3 file:rounded-lg file:border-0 file:bg-navy-900 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-gold-300"
                      />
                    )}
                  </div>
                  <label className="flex items-start gap-2 text-xs leading-relaxed text-navy-600">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(event) => setAgreed(event.target.checked)}
                      className="mt-0.5 h-4 w-4 accent-navy-900"
                    />
                    <span>
                      Saya setuju nama, email, dan WhatsApp saya digunakan hanya untuk tindak lanjut aspirasi ini.
                    </span>
                  </label>
                </>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gold-400 px-6 py-3 text-sm font-semibold text-navy-900 shadow-soft transition-all hover:bg-gold-300 disabled:opacity-60"
              >
                <Send className="h-4 w-4" />
                {submitting ? 'Mengirim...' : 'Kirim Aspirasi'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
