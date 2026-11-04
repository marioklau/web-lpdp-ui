import { useEffect, useState } from 'react';
import { Plus, Save, Trash2 } from 'lucide-react';
import { useContent, type SaveResult } from '@/lib/contentContext';
import {
  Field,
  SaveStatus,
  SectionHeader,
  btnDanger,
  btnGhost,
  btnPrimary,
  inputClass,
  textareaClass,
} from '@/components/admin/ui';
import type { HomePageContent, HomePillar } from '@/types';

const sections = [
  { id: 'hero', label: 'Awal beranda' },
  { id: 'program', label: 'Program' },
  { id: 'strategi', label: 'Strategi' },
  { id: 'jejak', label: 'Jejak' },
  { id: 'peta', label: 'Peta' },
  { id: 'kabar', label: 'Angka & kabar' },
  { id: 'kontak', label: 'Kontak' },
] as const;

type SectionId = (typeof sections)[number]['id'];

const iconOptions = [
  'Database',
  'Users',
  'Network',
  'Sun',
  'Handshake',
  'HeartHandshake',
  'MessageSquareText',
];

export default function HomeTab() {
  const { homepage, saveHomepage } = useContent();
  const [form, setForm] = useState<HomePageContent>(homepage);
  const [section, setSection] = useState<SectionId>('hero');
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<SaveResult | null>(null);

  useEffect(() => {
    setForm(homepage);
  }, [homepage]);

  const set = <K extends keyof HomePageContent>(key: K, value: HomePageContent[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updatePillar = (index: number, patch: Partial<HomePillar>) => {
    setForm((prev) => ({
      ...prev,
      pillars: prev.pillars.map((pillar, itemIndex) =>
        itemIndex === index ? { ...pillar, ...patch } : pillar,
      ),
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    const res = await saveHomepage({
      ...form,
      heroMarquee: form.heroMarquee.map((item) => item.trim()).filter(Boolean),
      mapPoints: form.mapPoints.map((item) => item.trim()).filter(Boolean),
      pillars: form.pillars
        .map((pillar) => ({
          ...pillar,
          id: pillar.id || crypto.randomUUID(),
          points: pillar.points.map((point) => point.trim()).filter(Boolean),
        }))
        .filter((pillar) => pillar.title.trim() || pillar.body.trim()),
    });
    setResult(res);
    setSaving(false);
  };

  return (
    <div>
      <SectionHeader
        title="Teks Beranda"
        desc="Judul, pengantar, dan kontak yang tampil di beranda. Nama besar di hero diubah di tab Profil. Isi visi dan daftar misi diubah di tab Visi & Misi. Kartu program, angka statistik, dan berita tetap di tab masing-masing."
      />

      <div className="mb-6 flex gap-2 overflow-x-auto">
        {sections.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setSection(item.id)}
            className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium ${
              section === item.id
                ? 'bg-navy-900 text-gold-300'
                : 'border border-navy-200 text-navy-700 hover:bg-navy-50'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {section === 'hero' && (
        <div className="grid gap-4">
          <Field label="Label kecil di atas nama">
            <input className={inputClass} value={form.heroEyebrow} onChange={(event) => set('heroEyebrow', event.target.value)} />
          </Field>
          <Field label="Tautan di bawah posisi" hint="Contoh: bersama Sutan Dami">
            <input className={inputClass} value={form.heroCompanion} onChange={(event) => set('heroCompanion', event.target.value)} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Tombol utama">
              <input className={inputClass} value={form.heroPrimaryCta} onChange={(event) => set('heroPrimaryCta', event.target.value)} />
            </Field>
            <Field label="Tombol kedua">
              <input className={inputClass} value={form.heroSecondaryCta} onChange={(event) => set('heroSecondaryCta', event.target.value)} />
            </Field>
          </div>
          <Field label="Kalimat dukungan">
            <input className={inputClass} value={form.heroSupport} onChange={(event) => set('heroSupport', event.target.value)} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Tulisan besar di latar">
              <input className={inputClass} value={form.heroWatermark} onChange={(event) => set('heroWatermark', event.target.value)} />
            </Field>
            <Field label="Keterangan foto">
              <input className={inputClass} value={form.heroCaption} onChange={(event) => set('heroCaption', event.target.value)} />
            </Field>
          </div>
          <Field label="Teks gulir">
            <input className={inputClass} value={form.heroScrollHint} onChange={(event) => set('heroScrollHint', event.target.value)} />
          </Field>
          <Field label="Teks berjalan" hint="Satu kata atau frasa per baris.">
            <textarea
              rows={6}
              className={textareaClass}
              value={form.heroMarquee.join('\n')}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, heroMarquee: event.target.value.split('\n') }))
              }
            />
          </Field>
        </div>
      )}

      {section === 'program' && (
        <div className="grid gap-4">
          <Field label="Label kecil">
            <input className={inputClass} value={form.programsEyebrow} onChange={(event) => set('programsEyebrow', event.target.value)} />
          </Field>
          <Field label="Judul">
            <input className={inputClass} value={form.programsTitle} onChange={(event) => set('programsTitle', event.target.value)} />
          </Field>
          <Field label="Pengantar">
            <textarea rows={4} className={textareaClass} value={form.programsIntro} onChange={(event) => set('programsIntro', event.target.value)} />
          </Field>
        </div>
      )}

      {section === 'strategi' && (
        <div className="grid gap-4">
          <Field label="Label kecil">
            <input className={inputClass} value={form.strategicEyebrow} onChange={(event) => set('strategicEyebrow', event.target.value)} />
          </Field>
          <Field label="Judul">
            <input className={inputClass} value={form.strategicTitle} onChange={(event) => set('strategicTitle', event.target.value)} />
          </Field>
          <Field label="Paragraf utama">
            <textarea rows={3} className={textareaClass} value={form.strategicLead} onChange={(event) => set('strategicLead', event.target.value)} />
          </Field>
          <Field label="Catatan">
            <textarea rows={3} className={textareaClass} value={form.strategicNote} onChange={(event) => set('strategicNote', event.target.value)} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Tombol utama">
              <input className={inputClass} value={form.strategicCta} onChange={(event) => set('strategicCta', event.target.value)} />
            </Field>
            <Field label="Tombol kedua">
              <input className={inputClass} value={form.strategicSecondaryCta} onChange={(event) => set('strategicSecondaryCta', event.target.value)} />
            </Field>
          </div>
          {form.pillars.map((pillar, index) => (
            <div key={pillar.id || index} className="rounded-xl border border-navy-100 p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-navy-900">Pilar {index + 1}</p>
                <button
                  type="button"
                  className={btnDanger}
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      pillars: prev.pillars.filter((_, itemIndex) => itemIndex !== index),
                    }))
                  }
                >
                  <Trash2 className="h-3.5 w-3.5" /> Hapus
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Nama program">
                  <input className={inputClass} value={pillar.program} onChange={(event) => updatePillar(index, { program: event.target.value })} />
                </Field>
                <Field label="Ikon">
                  <select className={inputClass} value={pillar.icon} onChange={(event) => updatePillar(index, { icon: event.target.value })}>
                    {iconOptions.map((icon) => (
                      <option key={icon} value={icon}>{icon}</option>
                    ))}
                  </select>
                </Field>
              </div>
              <div className="mt-3">
                <Field label="Judul">
                  <input className={inputClass} value={pillar.title} onChange={(event) => updatePillar(index, { title: event.target.value })} />
                </Field>
              </div>
              <div className="mt-3">
                <Field label="Penjelasan">
                  <textarea rows={3} className={textareaClass} value={pillar.body} onChange={(event) => updatePillar(index, { body: event.target.value })} />
                </Field>
              </div>
              <div className="mt-3">
                <Field label="Butir" hint="Satu butir per baris.">
                  <textarea
                    rows={4}
                    className={textareaClass}
                    value={pillar.points.join('\n')}
                    onChange={(event) => updatePillar(index, { points: event.target.value.split('\n') })}
                  />
                </Field>
              </div>
            </div>
          ))}
          <button
            type="button"
            className={btnGhost}
            onClick={() =>
              setForm((prev) => ({
                ...prev,
                pillars: [
                  ...prev.pillars,
                  {
                    id: crypto.randomUUID(),
                    icon: 'Database',
                    program: '',
                    title: '',
                    body: '',
                    points: [],
                  },
                ],
              }))
            }
          >
            <Plus className="h-4 w-4" /> Tambah pilar
          </button>
        </div>
      )}

      {section === 'jejak' && (
        <div className="grid gap-4">
          <Field label="Label kecil">
            <input className={inputClass} value={form.jejakEyebrow} onChange={(event) => set('jejakEyebrow', event.target.value)} />
          </Field>
          <Field label="Judul">
            <input className={inputClass} value={form.jejakTitle} onChange={(event) => set('jejakTitle', event.target.value)} />
          </Field>
          <Field label="Pengantar">
            <textarea rows={4} className={textareaClass} value={form.jejakBody} onChange={(event) => set('jejakBody', event.target.value)} />
          </Field>
          <Field label="Tombol">
            <input className={inputClass} value={form.jejakCta} onChange={(event) => set('jejakCta', event.target.value)} />
          </Field>
        </div>
      )}

      {section === 'peta' && (
        <div className="grid gap-4">
          <Field label="Label kecil">
            <input className={inputClass} value={form.mapEyebrow} onChange={(event) => set('mapEyebrow', event.target.value)} />
          </Field>
          <Field label="Judul">
            <input className={inputClass} value={form.mapTitle} onChange={(event) => set('mapTitle', event.target.value)} />
          </Field>
          <Field label="Pengantar">
            <textarea rows={4} className={textareaClass} value={form.mapBody} onChange={(event) => set('mapBody', event.target.value)} />
          </Field>
          <Field label="Butir" hint="Satu butir per baris.">
            <textarea
              rows={4}
              className={textareaClass}
              value={form.mapPoints.join('\n')}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, mapPoints: event.target.value.split('\n') }))
              }
            />
          </Field>
          <Field label="Tombol">
            <input className={inputClass} value={form.mapCta} onChange={(event) => set('mapCta', event.target.value)} />
          </Field>
          <Field label="Keterangan pratinjau">
            <input className={inputClass} value={form.mapCaption} onChange={(event) => set('mapCaption', event.target.value)} />
          </Field>
        </div>
      )}

      {section === 'kabar' && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Label statistik">
            <input className={inputClass} value={form.statsEyebrow} onChange={(event) => set('statsEyebrow', event.target.value)} />
          </Field>
          <Field label="Judul statistik">
            <input className={inputClass} value={form.statsTitle} onChange={(event) => set('statsTitle', event.target.value)} />
          </Field>
          <Field label="Label kabar">
            <input className={inputClass} value={form.newsEyebrow} onChange={(event) => set('newsEyebrow', event.target.value)} />
          </Field>
          <Field label="Judul kabar">
            <input className={inputClass} value={form.newsTitle} onChange={(event) => set('newsTitle', event.target.value)} />
          </Field>
        </div>
      )}

      {section === 'kontak' && (
        <div className="grid gap-4">
          <Field label="Label kecil">
            <input className={inputClass} value={form.contactEyebrow} onChange={(event) => set('contactEyebrow', event.target.value)} />
          </Field>
          <Field label="Judul">
            <input className={inputClass} value={form.contactTitle} onChange={(event) => set('contactTitle', event.target.value)} />
          </Field>
          <Field label="Pengantar">
            <textarea rows={3} className={textareaClass} value={form.contactIntro} onChange={(event) => set('contactIntro', event.target.value)} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Judul saluran">
              <input className={inputClass} value={form.contactChannelTitle} onChange={(event) => set('contactChannelTitle', event.target.value)} />
            </Field>
            <Field label="Penjelasan saluran">
              <input className={inputClass} value={form.contactChannelBody} onChange={(event) => set('contactChannelBody', event.target.value)} />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Label DPT">
              <input className={inputClass} value={form.dptLabel} onChange={(event) => set('dptLabel', event.target.value)} />
            </Field>
            <Field label="Teks tautan DPT">
              <input className={inputClass} value={form.dptDisplay} onChange={(event) => set('dptDisplay', event.target.value)} />
            </Field>
            <Field label="URL DPT">
              <input className={inputClass} value={form.dptUrl} onChange={(event) => set('dptUrl', event.target.value)} />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Label WhatsApp">
              <input className={inputClass} value={form.whatsappLabel} onChange={(event) => set('whatsappLabel', event.target.value)} />
            </Field>
            <Field label="Nomor">
              <input className={inputClass} value={form.phone} onChange={(event) => set('phone', event.target.value)} />
            </Field>
            <Field label="Tautan WhatsApp">
              <input className={inputClass} value={form.whatsappUrl} onChange={(event) => set('whatsappUrl', event.target.value)} />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Label Instagram">
              <input className={inputClass} value={form.instagramLabel} onChange={(event) => set('instagramLabel', event.target.value)} />
            </Field>
            <Field label="Nama akun">
              <input className={inputClass} value={form.instagramHandle} onChange={(event) => set('instagramHandle', event.target.value)} />
            </Field>
            <Field label="Tautan Instagram">
              <input className={inputClass} value={form.instagramUrl} onChange={(event) => set('instagramUrl', event.target.value)} />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Email">
              <input className={inputClass} value={form.email} onChange={(event) => set('email', event.target.value)} />
            </Field>
            <Field label="Tautan LinkedIn">
              <input className={inputClass} value={form.linkedinUrl} onChange={(event) => set('linkedinUrl', event.target.value)} />
            </Field>
          </div>
          <Field label="Tautan CV">
            <input className={inputClass} value={form.cvUrl} onChange={(event) => set('cvUrl', event.target.value)} />
          </Field>
          <Field label="Alamat di footer">
            <input className={inputClass} value={form.address} onChange={(event) => set('address', event.target.value)} />
          </Field>
          <Field label="Deskripsi footer">
            <textarea rows={3} className={textareaClass} value={form.footerBlurb} onChange={(event) => set('footerBlurb', event.target.value)} />
          </Field>
          <Field label="Catatan footer">
            <textarea rows={2} className={textareaClass} value={form.footerNote} onChange={(event) => set('footerNote', event.target.value)} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Hak cipta" hint="Tahun ditambahkan otomatis di depan.">
              <input className={inputClass} value={form.footerCopyright} onChange={(event) => set('footerCopyright', event.target.value)} />
            </Field>
            <Field label="Tagline footer">
              <input className={inputClass} value={form.footerTagline} onChange={(event) => set('footerTagline', event.target.value)} />
            </Field>
          </div>
        </div>
      )}

      <div className="mt-6">
        <button className={btnPrimary} onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4" />
          {saving ? 'Menyimpan...' : 'Simpan teks beranda'}
        </button>
      </div>
      <SaveStatus result={result} />
    </div>
  );
}
