import { useEffect, useMemo, useState } from 'react';
import { Plus, Save, Trash2 } from 'lucide-react';
import { useContent, type SaveResult } from '@/lib/contentContext';
import {
  EmptyState,
  SaveStatus,
  SectionHeader,
  btnDanger,
  btnGhost,
  btnPrimary,
} from '@/components/admin/ui';
import type { ProvinceData } from '@/types';

const cellInput =
  'w-full rounded-md border border-navy-200 bg-white px-2 py-1.5 text-sm text-navy-900 outline-none transition focus:border-navy-500 focus:ring-2 focus:ring-navy-500/20';

export default function ProvincesTab() {
  const { provinces, saveProvinces } = useContent();
  const [form, setForm] = useState<ProvinceData[]>(provinces);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<SaveResult | null>(null);

  useEffect(() => {
    setForm(provinces);
  }, [provinces]);

  const totals = useMemo(
    () =>
      form.reduce(
        (acc, item) => ({
          awardee: acc.awardee + item.awardeeCount,
          active: acc.active + item.activeAwardeeCount,
          alumni: acc.alumni + item.alumniCount,
        }),
        { awardee: 0, active: 0, alumni: 0 },
      ),
    [form],
  );

  const update = (index: number, patch: Partial<ProvinceData>) => {
    setForm((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    );
  };

  const handleSave = async () => {
    setSaving(true);
    const res = await saveProvinces(form);
    setResult(res);
    setSaving(false);
  };

  return (
    <div>
      <SectionHeader
        title="Data Provinsi"
        desc="Angka sebaran awardee per provinsi untuk peta interaktif."
        action={
          <button
            className={btnGhost}
            onClick={() =>
              setForm((prev) => [
                ...prev,
                {
                  id: `ID-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
                  name: 'Provinsi Baru',
                  awardeeCount: 0,
                  activeAwardeeCount: 0,
                  alumniCount: 0,
                },
              ])
            }
          >
            <Plus className="h-4 w-4" /> Tambah Provinsi
          </button>
        }
      />

      {form.length === 0 ? (
        <EmptyState message="Belum ada data provinsi." />
      ) : (
        <div className="max-h-[520px] overflow-auto rounded-xl border border-navy-100">
          <table className="w-full min-w-[620px] text-sm">
            <thead className="sticky top-0 z-10 bg-navy-50">
              <tr className="text-left text-navy-600">
                <th className="px-3 py-2 font-medium">Provinsi</th>
                <th className="w-28 px-3 py-2 text-right font-medium">Awardee</th>
                <th className="w-24 px-3 py-2 text-right font-medium">Aktif</th>
                <th className="w-24 px-3 py-2 text-right font-medium">Alumni</th>
                <th className="w-12 px-2 py-2" />
              </tr>
            </thead>
            <tbody>
              {form.map((province, index) => (
                <tr key={province.id} className="border-t border-navy-50">
                  <td className="px-3 py-1.5">
                    <input
                      className={cellInput}
                      value={province.name}
                      onChange={(event) =>
                        update(index, { name: event.target.value })
                      }
                    />
                  </td>
                  <td className="px-3 py-1.5">
                    <input
                      type="number"
                      min={0}
                      className={`${cellInput} text-right`}
                      value={province.awardeeCount}
                      onChange={(event) =>
                        update(index, {
                          awardeeCount: Number(event.target.value) || 0,
                        })
                      }
                    />
                  </td>
                  <td className="px-3 py-1.5">
                    <input
                      type="number"
                      min={0}
                      className={`${cellInput} text-right`}
                      value={province.activeAwardeeCount}
                      onChange={(event) =>
                        update(index, {
                          activeAwardeeCount: Number(event.target.value) || 0,
                        })
                      }
                    />
                  </td>
                  <td className="px-3 py-1.5">
                    <input
                      type="number"
                      min={0}
                      className={`${cellInput} text-right`}
                      value={province.alumniCount}
                      onChange={(event) =>
                        update(index, {
                          alumniCount: Number(event.target.value) || 0,
                        })
                      }
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <button
                      className={btnDanger}
                      onClick={() =>
                        setForm((prev) => prev.filter((_, i) => i !== index))
                      }
                      aria-label={`Hapus ${province.name}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="sticky bottom-0 bg-navy-900 text-white">
              <tr>
                <td className="px-3 py-2 text-sm font-semibold">Total</td>
                <td className="px-3 py-2 text-right text-sm font-semibold">
                  {totals.awardee}
                </td>
                <td className="px-3 py-2 text-right text-sm font-semibold">
                  {totals.active}
                </td>
                <td className="px-3 py-2 text-right text-sm font-semibold">
                  {totals.alumni}
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      <div className="mt-6">
        <button className={btnPrimary} onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4" />
          {saving ? 'Menyimpan...' : 'Simpan Data Provinsi'}
        </button>
      </div>

      <SaveStatus result={result} />
    </div>
  );
}
