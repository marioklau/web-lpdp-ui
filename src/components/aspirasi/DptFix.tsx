import { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { DPT_FIX } from '@/lib/dptFix';

function includes(query: string, value: string) {
  return value.toLowerCase().includes(query);
}

function matchesFaculty(query: string, fakultas: string) {
  const code = fakultas.toLowerCase();
  if (code === query) return true;
  return query.length >= 4 && code.startsWith(query);
}

export default function DptFix() {
  const [query, setQuery] = useState('');
  const needle = query.trim().toLowerCase();

  const results = useMemo(() => {
    if (!needle) return DPT_FIX;
    return DPT_FIX.filter(
      (row) =>
        includes(needle, row.nama) ||
        includes(needle, row.prodi) ||
        matchesFaculty(needle, row.fakultas),
    );
  }, [needle]);

  return (
    <section id="dpt-fix" className="bg-white py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <span className="text-xs font-semibold uppercase tracking-wider text-gold-600">
          Daftar pemilih tetap
        </span>
        <h1 className="mt-3 font-serif text-3xl font-semibold text-navy-900 sm:text-4xl">
          DPT Fix
        </h1>
        <p className="mt-4 max-w-2xl leading-relaxed text-navy-600">
          Cari nama, program studi, atau fakultas. Daftar ini memuat{' '}
          {DPT_FIX.length} pemilih sesuai berkas DPT Fix.
        </p>

        <div className="relative mt-8 max-w-xl">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari nama, prodi, atau fakultas"
            aria-label="Cari nama, program studi, atau fakultas"
            className="w-full rounded-xl border border-navy-200 bg-white py-3 pl-11 pr-11 text-sm text-navy-900 outline-none transition focus:border-navy-500 focus:ring-2 focus:ring-navy-500/20"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-navy-400 hover:bg-navy-50 hover:text-navy-700"
              aria-label="Hapus pencarian"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <p className="mt-4 text-sm text-navy-500">
          <span className="font-semibold text-navy-900">{results.length}</span>{' '}
          dari {DPT_FIX.length} nama ditampilkan
        </p>

        {results.length === 0 ? (
          <p className="mt-8 rounded-2xl border border-dashed border-navy-200 bg-navy-50 px-6 py-10 text-center text-sm text-navy-600">
            Tidak ada nama yang cocok dengan pencarian ini.
          </p>
        ) : (
          <>
            <ul className="mt-6 space-y-3 md:hidden">
              {results.map((row) => (
                <li
                  key={row.no}
                  className="rounded-2xl border border-navy-100 bg-navy-50/60 px-4 py-4"
                >
                  <p className="text-xs font-semibold uppercase tracking-wider text-gold-700">
                    No. {row.no}
                  </p>
                  <p className="mt-1 font-semibold text-navy-900">{row.nama}</p>
                  <p className="mt-1 text-sm text-navy-600">
                    {row.fakultas} · {row.prodi}
                  </p>
                </li>
              ))}
            </ul>

            <div className="mt-6 hidden overflow-hidden rounded-2xl border border-navy-100 md:block">
              <div className="max-h-[70vh] overflow-auto">
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 bg-navy-900 text-white">
                    <tr>
                      <th className="w-16 px-4 py-3 font-semibold">No</th>
                      <th className="px-4 py-3 font-semibold">Nama</th>
                      <th className="w-32 px-4 py-3 font-semibold">Fakultas</th>
                      <th className="px-4 py-3 font-semibold">Program studi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((row, index) => (
                      <tr
                        key={row.no}
                        className={index % 2 === 0 ? 'bg-white' : 'bg-navy-50/70'}
                      >
                        <td className="px-4 py-3 tabular-nums text-navy-500">
                          {row.no}
                        </td>
                        <td className="px-4 py-3 font-medium text-navy-900">
                          {row.nama}
                        </td>
                        <td className="px-4 py-3 text-navy-700">{row.fakultas}</td>
                        <td className="px-4 py-3 text-navy-700">{row.prodi}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
