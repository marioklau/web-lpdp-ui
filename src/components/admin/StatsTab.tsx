import { useEffect, useState } from 'react';
import { Plus, Save, Trash2 } from 'lucide-react';
import { useContent, type SaveResult } from '@/lib/contentContext';
import {
  EmptyState,
  Field,
  SaveStatus,
  SectionHeader,
  btnDanger,
  btnGhost,
  btnPrimary,
  inputClass,
} from '@/components/admin/ui';
import type { StatItem } from '@/types';

export default function StatsTab() {
  const { stats, saveStats } = useContent();
  const [form, setForm] = useState<StatItem[]>(stats);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<SaveResult | null>(null);

  useEffect(() => {
    setForm(stats);
  }, [stats]);

  const update = (index: number, patch: Partial<StatItem>) => {
    setForm((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    );
  };

  const handleSave = async () => {
    setSaving(true);
    const res = await saveStats(form);
    setResult(res);
    setSaving(false);
  };

  return (
    <div>
      <SectionHeader
        title="Statistik"
        desc="Kartu angka yang tampil di beranda."
        action={
          <button
            className={btnGhost}
            onClick={() =>
              setForm((prev) => [
                ...prev,
                {
                  id: `s-${crypto.randomUUID()}`,
                  label: '',
                  value: '',
                  isPlaceholder: true,
                },
              ])
            }
          >
            <Plus className="h-4 w-4" /> Tambah Statistik
          </button>
        }
      />

      <div className="space-y-3">
        {form.map((stat, index) => (
          <div
            key={stat.id}
            className="grid gap-3 rounded-xl border border-navy-100 p-4 sm:grid-cols-[1fr_1fr_auto_auto] sm:items-end"
          >
            <Field label={`Label ${index + 1}`}>
              <input
                className={inputClass}
                value={stat.label}
                onChange={(event) => update(index, { label: event.target.value })}
              />
            </Field>
            <Field label="Nilai">
              <input
                className={inputClass}
                value={stat.value}
                onChange={(event) => update(index, { value: event.target.value })}
              />
            </Field>
            <label className="flex items-center gap-2 pb-2.5 text-sm text-navy-700">
              <input
                type="checkbox"
                checked={Boolean(stat.isPlaceholder)}
                onChange={(event) =>
                  update(index, { isPlaceholder: event.target.checked })
                }
                className="h-4 w-4 rounded border-navy-300"
              />
              Data contoh
            </label>
            <button
              className={btnDanger}
              onClick={() =>
                setForm((prev) => prev.filter((_, i) => i !== index))
              }
              aria-label={`Hapus statistik ${index + 1}`}
            >
              <Trash2 className="h-3.5 w-3.5" /> Hapus
            </button>
          </div>
        ))}
      </div>

      {form.length === 0 && <EmptyState message="Belum ada statistik." />}

      <div className="mt-6">
        <button className={btnPrimary} onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4" />
          {saving ? 'Menyimpan...' : 'Simpan Statistik'}
        </button>
      </div>

      <SaveStatus result={result} />
    </div>
  );
}
