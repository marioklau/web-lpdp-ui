import { useEffect, useState } from 'react';
import { Plus, Save, Trash2 } from 'lucide-react';
import { useContent, type SaveResult } from '@/lib/contentContext';
import {
  Field,
  SaveStatus,
  SectionHeader,
  btnGhost,
  btnPrimary,
  inputClass,
  textareaClass,
} from '@/components/admin/ui';

export default function VisiMisiTab() {
  const { visionMission, saveVisionMission } = useContent();
  const [eyebrow, setEyebrow] = useState(visionMission.eyebrow ?? '');
  const [title, setTitle] = useState(visionMission.title ?? '');
  const [intro, setIntro] = useState(visionMission.intro ?? '');
  const [vision, setVision] = useState(visionMission.vision);
  const [missions, setMissions] = useState<string[]>(visionMission.missions);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<SaveResult | null>(null);

  useEffect(() => {
    setEyebrow(visionMission.eyebrow ?? '');
    setTitle(visionMission.title ?? '');
    setIntro(visionMission.intro ?? '');
    setVision(visionMission.vision);
    setMissions(visionMission.missions);
  }, [visionMission]);

  const updateMission = (index: number, value: string) => {
    setMissions((prev) => prev.map((item, i) => (i === index ? value : item)));
  };

  const handleSave = async () => {
    setSaving(true);
    const res = await saveVisionMission({
      eyebrow,
      title,
      intro,
      vision,
      missions: missions.map((item) => item.trim()).filter(Boolean),
    });
    setResult(res);
    setSaving(false);
  };

  return (
    <div>
      <SectionHeader
        title="Visi & Misi"
        desc="Arah perjuangan yang tampil di beranda."
      />

      <Field label="Label kecil">
        <input
          className={inputClass}
          value={eyebrow}
          onChange={(event) => setEyebrow(event.target.value)}
        />
      </Field>
      <div className="mt-4">
        <Field label="Judul bagian">
          <input
            className={inputClass}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </Field>
      </div>
      <div className="mt-4">
        <Field label="Pengantar">
          <textarea
            rows={3}
            className={textareaClass}
            value={intro}
            onChange={(event) => setIntro(event.target.value)}
          />
        </Field>
      </div>

      <div className="mt-4">
      <Field label="Visi">
        <textarea
          rows={4}
          className={textareaClass}
          value={vision}
          onChange={(event) => setVision(event.target.value)}
        />
      </Field>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-medium text-navy-800">Misi</p>
          <button
            className={btnGhost}
            onClick={() => setMissions((prev) => [...prev, ''])}
          >
            <Plus className="h-4 w-4" /> Tambah Misi
          </button>
        </div>

        <div className="space-y-3">
          {missions.map((mission, index) => (
            <div key={index} className="flex items-start gap-2">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-navy-900 text-sm font-bold text-gold-300">
                {index + 1}
              </span>
              <textarea
                rows={2}
                className={textareaClass}
                value={mission}
                onChange={(event) => updateMission(index, event.target.value)}
              />
              <button
                onClick={() =>
                  setMissions((prev) => prev.filter((_, i) => i !== index))
                }
                className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-red-200 text-red-600 transition hover:bg-red-50"
                aria-label={`Hapus misi ${index + 1}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <button className={btnPrimary} onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4" />
          {saving ? 'Menyimpan...' : 'Simpan Visi & Misi'}
        </button>
      </div>

      <SaveStatus result={result} />
    </div>
  );
}
