import { useState } from 'react';
import {
  AlertTriangle,
  Send,
  CheckCircle2,
  MessageSquareText,
  Link2,
} from 'lucide-react';
import { isFirebaseConfigured, submitAspiration } from '@/lib/firebase';
import { useLocalStorage } from '@/lib/useLocalStorage';
import type { Aspiration } from '@/types';

export default function AspirationContact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  const [, setLocalAspirations] = useLocalStorage<Aspiration[]>(
    'lpdp_aspirations',
    [],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setWarning('');
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError('Mohon lengkapi semua kolom.');
      return;
    }
    const payload = {
      name: name.trim(),
      email: email.trim(),
      message: message.trim(),
    };

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
    setSubmitted(true);
    setName('');
    setEmail('');
    setMessage('');
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
              Aspirasi &amp; Kontak
            </span>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl font-semibold text-navy-900">
              Sampaikan Aspirasi Anda
            </h2>
            <p className="mt-4 text-navy-600 leading-relaxed max-w-lg">
              Aspirasi Didengar. Sampaikan ide, kritik, atau harapan Anda untuk
              Kelurahan LPDP UI 2026.
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-3">
                <span className="grid place-items-center h-10 w-10 rounded-xl bg-navy-900 text-gold-300 shrink-0">
                  <MessageSquareText className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-navy-900">
                    Saluran Aspirasi Terbuka
                  </p>
                  <p className="text-sm text-navy-600">
                    Form ini terkirim langsung ke tim AKSARA.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="grid place-items-center h-10 w-10 rounded-xl bg-navy-900 text-gold-300 shrink-0">
                  <Link2 className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-navy-900">
                    Pendaftaran DPT
                  </p>
                  <a
                    href="https://bit.ly/47uIMTB"
                    target="_blank"
                    rel="noreferrer"
                    className="break-all text-sm text-navy-600 hover:text-gold-600 transition-colors"
                  >
                    bit.ly/47uIMTB
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
              <div>
                <label className="block text-sm font-medium text-navy-800 mb-1.5">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  maxLength={200}
                  className="w-full rounded-lg border border-navy-200 bg-white px-4 py-2.5 text-sm text-navy-900 outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-500/20 transition"
                  placeholder="Nama Anda"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-800 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  maxLength={320}
                  className="w-full rounded-lg border border-navy-200 bg-white px-4 py-2.5 text-sm text-navy-900 outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-500/20 transition"
                  placeholder="email@contoh.id"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-800 mb-1.5">
                  Aspirasi
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  required
                  maxLength={5000}
                  className="w-full rounded-lg border border-navy-200 bg-white px-4 py-2.5 text-sm text-navy-900 outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-500/20 transition resize-none"
                  placeholder="Tuliskan masukan Anda..."
                />
              </div>
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-gold-400 px-6 py-3 text-sm font-semibold text-navy-900 shadow-soft transition-all hover:bg-gold-300"
              >
                <Send className="h-4 w-4" />
                Kirim Aspirasi
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
