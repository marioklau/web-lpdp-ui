import { useState } from 'react';
import {
  BookOpen,
  Briefcase,
  FileText,
  FlaskConical,
  Map as MapIcon,
  Pencil,
  Plus,
  Save,
  Trash2,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react';
import { useContent, type SaveResult } from '@/lib/contentContext';
import {
  Field,
  SaveStatus,
  SectionHeader,
  btnDanger,
  btnGhost,
  btnGold,
  btnPrimary,
  inputClass,
  textareaClass,
} from '@/components/admin/ui';
import type { Program } from '@/types';

const ICONS: Record<string, LucideIcon> = {
  Users,
  FlaskConical,
  FileText,
  Map: MapIcon,
  Briefcase,
  BookOpen,
};

const ICON_OPTIONS = Object.keys(ICONS);

export default function ProgramsTab() {
  const { programs, savePrograms } = useContent();
  const [editing, setEditing] = useState<Program | null>(null);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<SaveResult | null>(null);

  const startNew = () => {
    setEditing({
      id: crypto.randomUUID(),
      title: '',
      description: '',
      icon: 'FileText',
    });
  };

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    const exists = programs.some((item) => item.id === editing.id);
    const next = exists
      ? programs.map((item) => (item.id === editing.id ? editing : item))
      : [...programs, editing];
    const res = await savePrograms(next);
    setResult(res);
    setSaving(false);
    if (res.ok) setEditing(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Hapus program ini?')) return;
    const res = await savePrograms(programs.filter((item) => item.id !== id));
    setResult(res);
    if (editing?.id === id) setEditing(null);
  };

  return (
    <div>
      <SectionHeader
        title="Program Unggulan"
        desc="Program yang tampil di beranda."
        action={
          <button className={btnGold} onClick={startNew}>
            <Plus className="h-4 w-4" /> Tambah Program
          </button>
        }
      />

      {editing && (
        <div className="mb-6 rounded-xl border border-navy-200 bg-navy-50/50 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-navy-900">
              {programs.some((item) => item.id === editing.id)
                ? 'Edit Program'
                : 'Program Baru'}
            </h3>
            <button
              className="text-navy-500 hover:text-navy-900"
              onClick={() => setEditing(null)}
              aria-label="Tutup editor"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid gap-4">
            <Field label="Judul">
              <input
                className={inputClass}
                value={editing.title}
                onChange={(event) =>
                  setEditing({ ...editing, title: event.target.value })
                }
              />
            </Field>
            <Field label="Deskripsi">
              <textarea
                rows={3}
                className={textareaClass}
                value={editing.description}
                onChange={(event) =>
                  setEditing({ ...editing, description: event.target.value })
                }
              />
            </Field>
            <Field label="Ikon">
              <select
                className={inputClass}
                value={editing.icon}
                onChange={(event) =>
                  setEditing({ ...editing, icon: event.target.value })
                }
              >
                {ICON_OPTIONS.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="mt-5 flex gap-2">
            <button
              className={btnPrimary}
              onClick={handleSave}
              disabled={saving || !editing.title.trim()}
            >
              <Save className="h-4 w-4" />
              {saving ? 'Menyimpan...' : 'Simpan Program'}
            </button>
            <button className={btnGhost} onClick={() => setEditing(null)}>
              Batal
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {programs.map((program) => {
          const Icon = ICONS[program.icon] ?? FileText;
          return (
            <div
              key={program.id}
              className="rounded-xl border border-navy-100 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-navy-900 text-gold-300">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-semibold text-navy-900">
                      {program.title}
                    </h3>
                    <p className="mt-1 text-sm text-navy-600">
                      {program.description}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex justify-end gap-2">
                <button className={btnGhost} onClick={() => setEditing(program)}>
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </button>
                <button
                  className={btnDanger}
                  onClick={() => handleDelete(program.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" /> Hapus
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {programs.length === 0 && (
        <p className="rounded-xl border border-dashed border-navy-200 px-4 py-10 text-center text-sm text-navy-500">
          Belum ada program. Klik "Tambah Program".
        </p>
      )}

      <SaveStatus result={result} />
    </div>
  );
}
