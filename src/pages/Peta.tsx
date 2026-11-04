import { useEffect, useMemo, useState } from 'react';
import { BadgeCheck, GraduationCap, Info, Search, Users } from 'lucide-react';
import IndonesiaMap from '@/components/IndonesiaMap';
import { useContent } from '@/lib/contentContext';
import {
  areaValue,
  buildProvinceAreas,
  buildRegencyAreas,
  choroplethColor,
  type CountKey,
  type MapArea,
} from '@/lib/mapChoropleth';

const filters: { key: CountKey; label: string; icon: typeof Users }[] = [
  { key: 'awardeeCount', label: 'Total Awardee', icon: Users },
  { key: 'activeAwardeeCount', label: 'Awardee Aktif', icon: BadgeCheck },
  { key: 'alumniCount', label: 'Alumni', icon: GraduationCap },
];

function useGeoJson(url: string) {
  const [data, setData] = useState<GeoJSON.FeatureCollection | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error(`Berkas peta gagal dimuat (${response.status}).`);
        return response.json() as Promise<GeoJSON.FeatureCollection>;
      })
      .then((collection) => {
        if (cancelled) return;
        setData(collection);
        setLoading(false);
      })
      .catch((reason: Error) => {
        if (cancelled) return;
        setError(reason.message || 'Gagal memuat peta.');
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [url]);

  return { data, error, loading };
}

export default function PetaPage() {
  const [filter, setFilter] = useState<CountKey>('awardeeCount');
  const [provinceId, setProvinceId] = useState<string | null>(null);
  const [regencyId, setRegencyId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const { provinces, awardees, source } = useContent();
  const dataLoaded = source === 'firebase';

  const base = import.meta.env.BASE_URL;
  const provincesGeo = useGeoJson(`${base}data/indonesia-provinces.geojson`);
  const regenciesGeo = useGeoJson(`${base}data/indonesia-kabkota.geojson`);

  const provinceAreas = useMemo(
    () =>
      provincesGeo.data ? buildProvinceAreas(provincesGeo.data, provinces) : [],
    [provincesGeo.data, provinces],
  );

  const activeProvince = provinceAreas.find((area) => area.id === provinceId) ?? null;

  const regencyAreas = useMemo(() => {
    if (!activeProvince || !regenciesGeo.data) return [];
    const datum = provinces.find((item) => item.id === activeProvince.id);
    return buildRegencyAreas(regenciesGeo.data, activeProvince.name, datum);
  }, [activeProvince, provinces, regenciesGeo.data]);

  const drilled = Boolean(activeProvince && regenciesGeo.data);
  const areas = drilled ? regencyAreas : provinceAreas;
  const fitKey = drilled ? activeProvince!.id : 'indonesia';

  const ranked = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return [...areas]
      .filter((area) => !needle || area.name.toLowerCase().includes(needle))
      .sort(
        (a, b) =>
          areaValue(b, filter) - areaValue(a, filter) ||
          a.name.localeCompare(b.name, 'id'),
      );
  }, [areas, filter, query]);

  const visibleIds = useMemo(
    () => (query.trim() ? ranked.map((area) => area.id) : null),
    [query, ranked],
  );

  const maxValue = useMemo(
    () => Math.max(...areas.map((area) => areaValue(area, filter)), 1),
    [areas, filter],
  );

  const selected =
    (drilled ? regencyAreas.find((area) => area.id === regencyId) : null) ??
    activeProvince;

  const selectedAwardees = useMemo(() => {
    if (!activeProvince || regencyId) return [];
    return awardees.filter((awardee) => awardee.provinceId === activeProvince.id);
  }, [activeProvince, awardees, regencyId]);

  const totalAwardee = provinces.reduce((sum, item) => sum + item.awardeeCount, 0);
  const totalActive = provinces.reduce((sum, item) => sum + item.activeAwardeeCount, 0);
  const totalAlumni = provinces.reduce((sum, item) => sum + item.alumniCount, 0);
  const filterLabel = filters.find((item) => item.key === filter)?.label ?? 'Awardee';

  const legendStops = [0, 0.25, 0.5, 0.75, 1].map((ratio) => ({
    ratio,
    color: ratio === 0 ? '#e4e6ec' : choroplethColor(ratio * maxValue, maxValue),
  }));

  function openProvince(id: string) {
    setProvinceId(id);
    setRegencyId(null);
    setQuery('');
    setHoveredId(null);
  }

  function pickRegency(id: string) {
    setRegencyId((current) => (current === id ? null : id));
  }

  function backToIndonesia() {
    setProvinceId(null);
    setRegencyId(null);
    setQuery('');
    setHoveredId(null);
  }

  function handleSelect(id: string) {
    if (drilled) pickRegency(id);
    else openProvince(id);
  }

  const mapLoading =
    provincesGeo.loading || (Boolean(provinceId) && regenciesGeo.loading && !drilled);
  const mapError = provincesGeo.error || (provinceId ? regenciesGeo.error : '');

  return (
    <main className="bg-navy-50">
      <section
        id="sebaran"
        className="mx-auto max-w-7xl scroll-mt-24 px-4 pb-2 pt-8 sm:px-6 sm:pt-10 lg:px-8"
      >
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600">
            Sebaran awardee
          </p>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
            <h1 className="font-serif text-3xl font-semibold text-navy-900 sm:text-4xl">
              {activeProvince ? activeProvince.name : 'Seluruh Indonesia'}
            </h1>
            {activeProvince && (
              <button
                onClick={backToIndonesia}
                className="rounded-lg bg-gold-400 px-4 py-2 text-sm font-semibold text-navy-900 hover:bg-gold-300"
              >
                Kembali ke Indonesia
              </button>
            )}
          </div>
          <p className="mt-3 text-sm leading-relaxed text-navy-600 sm:text-base">
            {drilled
              ? 'Satu Data Kelurahan LPDP UI membawa peta ini lebih dekat: dari provinsi, turun ke kabupaten dan kota. Pilih satu wilayah untuk melihat siapa yang ada di sana.'
              : 'Satu Data Kelurahan LPDP UI mengumpulkan rumah awardee dalam satu peta. Dari sini kelurahan melihat di mana jejaringnya hidup, lalu masuk lebih dalam sampai kabupaten dan kota.'}
          </p>
        </div>

        {!dataLoaded && (
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-gold-200 bg-gold-50 px-5 py-4 text-sm text-gold-800">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-gold-600" />
            <p>
              <strong>Status data: belum tersinkron, karena menggunakan Data Dummy sebagai testing Prototype.</strong> Angka provinsi masih
              data contoh. Angka kabupaten dan kota adalah pecahan ilustrasi dari
              total provinsi, bukan data resmi per wilayah.
            </p>
          </div>
        )}

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[
            { label: 'Total Awardee', value: totalAwardee, icon: Users },
            { label: 'Awardee Aktif', value: totalActive, icon: BadgeCheck },
            { label: 'Alumni', value: totalAlumni, icon: GraduationCap },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="flex items-center gap-3 rounded-2xl border border-navy-100 bg-white px-4 py-3 shadow-soft"
              >
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-navy-900 text-gold-300">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-serif text-2xl font-bold text-navy-900">
                    {item.value.toLocaleString('id-ID')}
                  </p>
                  <p className="text-xs text-navy-500">{item.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto mt-6 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative z-0 h-[calc(100dvh-4rem)] min-h-[440px] overflow-hidden rounded-2xl border border-navy-100 shadow-soft sm:h-[calc(100dvh-5rem)]">
        <div className="absolute inset-0 z-0">
          <IndonesiaMap
            areas={areas}
            filter={filter}
            maxValue={maxValue}
            selectedId={drilled ? regencyId : null}
            hoveredId={hoveredId}
            visibleIds={visibleIds}
            fitKey={fitKey}
            loading={mapLoading}
            error={mapError}
            onSelect={handleSelect}
            onHover={setHoveredId}
          />
        </div>

        <div className="pointer-events-none absolute inset-0 z-10">
          <div className="pointer-events-auto absolute left-3 top-3 sm:left-5 sm:top-5">
            <div className="rounded-2xl bg-white/95 px-3 py-2 shadow-soft backdrop-blur-sm">
              <div className="flex items-center gap-1.5 text-sm">
                {provinceId ? (
                  <button
                    onClick={backToIndonesia}
                    className="font-semibold text-navy-900 hover:text-gold-700"
                  >
                    Indonesia
                  </button>
                ) : (
                  <span className="font-semibold text-navy-900">Indonesia</span>
                )}
                {activeProvince && (
                  <>
                    <span className="text-navy-300">/</span>
                    <span className="max-w-[11rem] truncate font-semibold text-gold-700 sm:max-w-xs">
                      {activeProvince.name}
                    </span>
                  </>
                )}
              </div>
              <p className="mt-0.5 text-[11px] text-navy-500">
                {drilled
                  ? 'Klik kabupaten atau kota untuk melihat angkanya'
                  : 'Klik provinsi untuk masuk ke kabupaten dan kota'}
              </p>
            </div>
          </div>

          {provinceId && regenciesGeo.loading && (
            <p className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-navy-900 px-4 py-2 text-xs text-white shadow-soft">
              Membuka kabupaten dan kota…
            </p>
          )}

          {drilled && (
            <button
              onClick={backToIndonesia}
              className="pointer-events-auto absolute right-3 top-3 rounded-xl bg-gold-400 px-3 py-2 text-xs font-semibold text-navy-900 shadow-soft hover:bg-gold-300 sm:right-5 sm:top-5 sm:px-4 sm:text-sm"
            >
              Kembali
            </button>
          )}
        </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="flex flex-wrap items-center gap-2">
          {filters.map((item) => {
            const Icon = item.icon;
            const active = filter === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setFilter(item.key)}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                  active
                    ? 'bg-gold-400 text-navy-900 shadow-soft'
                    : 'border border-navy-200 bg-white text-navy-700 hover:border-gold-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="mt-5 rounded-2xl border border-navy-100 bg-white p-5 shadow-soft">
          <div className="flex items-end justify-between gap-3">
            <h2 className="text-sm font-semibold text-navy-900">
              Gradasi sebaran — {filterLabel}
            </h2>
            <p className="text-[11px] text-navy-500">
              {drilled ? 'Di dalam provinsi ini' : 'Antarprovinsi'}
            </p>
          </div>
          <div
            className="mt-3 h-3 rounded-full"
            style={{
              background: `linear-gradient(90deg, ${legendStops
                .map((stop) => `${stop.color} ${stop.ratio * 100}%`)
                .join(', ')})`,
            }}
          />
          <div className="mt-2 flex justify-between text-[11px] text-navy-500">
            <span>0 · abu-abu</span>
            <span className="font-semibold text-gold-700">
              {maxValue.toLocaleString('id-ID')} · kuning
            </span>
          </div>
        </div>

        <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <div className="rounded-2xl border border-navy-100 bg-white shadow-soft">
            <div className="flex flex-col gap-3 border-b border-navy-100 p-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="font-serif text-lg font-semibold text-navy-900">
                {drilled ? 'Kabupaten dan kota' : 'Provinsi'}
                <span className="ml-2 text-sm font-sans font-medium text-navy-400">
                  {ranked.length}
                </span>
              </h2>
              <label className="relative block sm:w-64">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={drilled ? 'Cari kabupaten atau kota' : 'Cari provinsi'}
                  className="w-full rounded-lg border border-navy-200 bg-navy-50 py-2 pl-9 pr-3 text-sm text-navy-900 outline-none focus:border-gold-400"
                />
              </label>
            </div>
            <ul className="max-h-[32rem] divide-y divide-navy-50 overflow-y-auto">
              {ranked.map((area, index) => (
                <AreaRow
                  key={area.id}
                  area={area}
                  rank={index + 1}
                  value={areaValue(area, filter)}
                  maxValue={maxValue}
                  active={area.id === (drilled ? regencyId : provinceId)}
                  hot={area.id === hoveredId}
                  onSelect={() => handleSelect(area.id)}
                  onHover={setHoveredId}
                />
              ))}
              {!ranked.length && (
                <li className="px-4 py-8 text-center text-sm text-navy-500">
                  {provincesGeo.loading || (provinceId && regenciesGeo.loading)
                    ? 'Memuat peta…'
                    : 'Tidak ada wilayah yang cocok.'}
                </li>
              )}
            </ul>
          </div>

          <aside className="rounded-2xl border border-navy-100 bg-white p-5 shadow-soft lg:sticky lg:top-24">
            {selected ? (
              <AreaDetail
                area={selected}
                filter={filter}
                awardees={selectedAwardees}
                drilledRegency={Boolean(regencyId)}
              />
            ) : (
              <div>
                <h2 className="font-serif text-xl font-semibold text-navy-900">
                  Pilih sebuah wilayah
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-navy-600">
                  Klik provinsi untuk menyelam ke kabupaten dan kota. Warna kuning
                  menandai jumlah yang lebih besar.
                </p>
              </div>
            )}
          </aside>
        </div>
      </section>
    </main>
  );
}

function AreaRow({
  area,
  rank,
  value,
  maxValue,
  active,
  hot,
  onSelect,
  onHover,
}: {
  area: MapArea;
  rank: number;
  value: number;
  maxValue: number;
  active: boolean;
  hot: boolean;
  onSelect: () => void;
  onHover: (id: string | null) => void;
}) {
  const color = choroplethColor(value, maxValue);
  const width = maxValue > 0 ? Math.max(value > 0 ? 6 : 0, (value / maxValue) * 100) : 0;

  return (
    <li>
      <button
        onClick={onSelect}
        onMouseEnter={() => onHover(area.id)}
        onMouseLeave={() => onHover(null)}
        className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
          active ? 'bg-gold-50' : hot ? 'bg-navy-50' : 'hover:bg-navy-50/70'
        }`}
      >
        <span className="w-6 shrink-0 text-xs font-semibold text-navy-400">
          {rank}
        </span>
        <span
          className="h-8 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: color }}
        />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-navy-900">
            {area.name}
          </span>
          <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-[#e4e6ec]">
            <span
              className="block h-full rounded-full"
              style={{ width: `${width}%`, backgroundColor: color }}
            />
          </span>
        </span>
        <span className="shrink-0 font-serif text-lg font-bold text-navy-900">
          {value.toLocaleString('id-ID')}
        </span>
      </button>
    </li>
  );
}

function AreaDetail({
  area,
  filter,
  awardees,
  drilledRegency,
}: {
  area: MapArea;
  filter: CountKey;
  awardees: { id: string; name: string; occupation: string; photoUrl: string; isSample?: boolean }[];
  drilledRegency: boolean;
}) {
  const metrics: { key: CountKey; label: string }[] = [
    { key: 'awardeeCount', label: 'Awardee' },
    { key: 'activeAwardeeCount', label: 'Awardee aktif' },
    { key: 'alumniCount', label: 'Alumni' },
  ];

  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gold-600">
        {area.illustrative ? 'Kabupaten / kota' : 'Provinsi'}
      </p>
      <h2 className="mt-1 font-serif text-2xl font-semibold text-navy-900">
        {area.name}
      </h2>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {metrics.map((metric) => {
          const active = filter === metric.key;
          return (
            <div
              key={metric.key}
              className={`rounded-xl px-2 py-3 text-center ${
                active ? 'bg-gold-400 text-navy-900' : 'bg-[#eef0f4] text-navy-900'
              }`}
            >
              <p className={`text-[10px] ${active ? 'text-navy-800' : 'text-navy-500'}`}>
                {metric.label}
              </p>
              <p className="font-serif text-xl font-bold">
                {area[metric.key].toLocaleString('id-ID')}
              </p>
            </div>
          );
        })}
      </div>

      {area.illustrative && (
        <p className="mt-4 text-xs leading-relaxed text-gold-700">
          Angka ini pecahan ilustrasi dari total provinsi, supaya sebaran di
          dalam wilayah bisa dilihat. Data resmi per kabupaten belum masuk.
        </p>
      )}

      {drilledRegency ? (
        <p className="mt-4 text-sm text-navy-600">
          Profil awardee per kabupaten belum dipecah. Daftar nama masih berada di
          tingkat provinsi.
        </p>
      ) : awardees.length > 0 ? (
        <div className="mt-5 border-t border-navy-100 pt-4">
          <h3 className="font-serif text-base font-semibold text-navy-900">
            Profil awardee
          </h3>
          <div className="mt-3 space-y-2">
            {awardees.map((awardee) => (
              <div
                key={awardee.id}
                className="flex items-center gap-3 rounded-xl bg-[#eef0f4] p-2.5"
              >
                <img
                  src={awardee.photoUrl}
                  alt=""
                  className="h-11 w-11 shrink-0 rounded-full object-cover"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-navy-900">
                    {awardee.name}
                  </p>
                  <p className="truncate text-xs text-navy-500">{awardee.occupation}</p>
                </div>
              </div>
            ))}
          </div>
          {awardees.some((awardee) => awardee.isSample) && (
            <p className="mt-3 text-[11px] font-medium text-gold-700">
              Profil masih data contoh.
            </p>
          )}
        </div>
      ) : (
        <p className="mt-4 text-sm text-navy-500">
          Belum ada profil awardee untuk provinsi ini.
        </p>
      )}
    </div>
  );
}
