import { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import type { AwardeeProfile } from '@/types';

export interface ProvinceDatum {
  id: string;
  name: string;
  awardeeCount: number;
  activeAwardeeCount: number;
  alumniCount: number;
}

type FilterKey = 'awardeeCount' | 'activeAwardeeCount' | 'alumniCount';

interface IndonesiaMapProps {
  data: ProvinceDatum[];
  awardees: AwardeeProfile[];
  filter: FilterKey;
  dataLoaded: boolean;
}

const GEOJSON_URL = `${import.meta.env.BASE_URL}data/indonesia-provinces.geojson`;
const GEOJSON_SOURCE =
  'https://github.com/denyherianto/indonesia-geojson-topojson-maps-with-38-provinces';

interface FeatureProps {
  id?: string;
  KODE_PROV?: string;
  PROVINSI?: string;
  Propinsi?: string;
  NAME_1?: string;
  name?: string;
  [key: string]: unknown;
}

type GeoFeature = GeoJSON.Feature<GeoJSON.Geometry, FeatureProps>;

const NAME_ALIASES: Record<string, string> = {
  yogyakarta: 'daerahistimewayogyakarta',
  diyogyakarta: 'daerahistimewayogyakarta',
  jakartaraya: 'dkijakarta',
  bangkabelitung: 'kepulauanbangkabelitung',
};

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function canonicalName(value: string): string {
  const key = normalize(value);
  return NAME_ALIASES[key] ?? key;
}

function featureName(feature: GeoFeature): string {
  const name =
    feature.properties.PROVINSI ||
    feature.properties.Propinsi ||
    feature.properties.NAME_1 ||
    feature.properties.name ||
    '';
  return String(name).trim();
}

function matchDatum(
  feature: GeoFeature,
  data: ProvinceDatum[],
): ProvinceDatum | undefined {
  const name = featureName(feature);
  if (name) {
    const target = canonicalName(name);
    const byName = data.find((datum) => canonicalName(datum.name) === target);
    if (byName) return byName;
  }

  const featureId = String(feature.properties.id ?? '');
  if (!/^id-/i.test(featureId)) return undefined;
  return data.find((datum) => datum.id.toLowerCase() === featureId.toLowerCase());
}

// Warna choropleth: dari navy muda ke gold pekat.
function getColor(value: number, max: number): string {
  if (!value || value <= 0) return '#e9eef6';
  const ratio = Math.min(value / max, 1);
  const start = [174, 191, 233];
  const end = [178, 119, 22];
  const r = Math.round(start[0] + (end[0] - start[0]) * ratio);
  const g = Math.round(start[1] + (end[1] - start[1]) * ratio);
  const b = Math.round(start[2] + (end[2] - start[2]) * ratio);
  return `rgb(${r}, ${g}, ${b})`;
}

interface SelectedProvince {
  id: string;
  name: string;
}

function buildTooltip(
  provinceName: string,
  datum: ProvinceDatum | undefined,
): HTMLElement {
  const container = document.createElement('div');
  container.className = 'lpdp-map-tooltip-content';

  const title = document.createElement('div');
  title.className = 'lpdp-map-tooltip-title';
  title.textContent = provinceName;
  container.appendChild(title);

  if (!datum) {
    const empty = document.createElement('div');
    empty.className = 'lpdp-map-tooltip-empty';
    empty.textContent = 'Data awardee belum tersedia.';
    container.appendChild(empty);
    return container;
  }

  const rows: [string, number][] = [
    ['Awardee', datum.awardeeCount],
    ['Awardee Aktif', datum.activeAwardeeCount],
    ['Alumni', datum.alumniCount],
  ];

  rows.forEach(([label, value]) => {
    const row = document.createElement('div');
    row.className = 'lpdp-map-tooltip-row';

    const labelEl = document.createElement('span');
    labelEl.textContent = label;

    const valueEl = document.createElement('strong');
    valueEl.textContent = value.toLocaleString('id-ID');

    row.append(labelEl, valueEl);
    container.appendChild(row);
  });

  return container;
}

export default function IndonesiaMap({
  data,
  awardees,
  filter,
  dataLoaded,
}: IndonesiaMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const fittedRef = useRef(false);
  const [geojson, setGeojson] = useState<GeoJSON.FeatureCollection | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [selected, setSelected] = useState<SelectedProvince | null>(null);

  const maxValue = useMemo(() => {
    if (!data.length) return 1;
    return Math.max(...data.map((datum) => datum[filter] || 0), 1);
  }, [data, filter]);

  const selectedDatum = useMemo(
    () =>
      selected ? data.find((datum) => datum.id === selected.id) : undefined,
    [data, selected],
  );

  const selectedAwardees = useMemo(
    () =>
      selected
        ? awardees.filter(
            (awardee) => awardee.provinceId === selected.id,
          )
        : [],
    [awardees, selected],
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container || mapRef.current) return;

    const map = L.map(container, {
      center: [-2.5, 118],
      zoom: 5,
      scrollWheelZoom: false,
      minZoom: 4,
      maxZoom: 8,
    });

    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
      {
        attribution:
          'Tiles © <a href="https://www.esri.com/">Esri</a> — Esri, DeLorme, NAVTEQ',
        maxZoom: 16,
      },
    ).addTo(map);

    map.attributionControl.addAttribution(
      `Batas provinsi: <a href="${GEOJSON_SOURCE}">GeoJSON Indonesia 38 Provinsi</a> (MIT)`,
    );

    mapRef.current = map;
    const resizeObserver = new ResizeObserver(() => map.invalidateSize());
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
      fittedRef.current = false;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError('');

    fetch(GEOJSON_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Gagal memuat data peta (${response.status}).`);
        }
        return response.json() as Promise<GeoJSON.FeatureCollection>;
      })
      .then((collection) => {
        if (cancelled) return;
        setGeojson(collection);
        setLoading(false);
      })
      .catch((error: Error) => {
        if (cancelled) return;
        setLoadError(error.message || 'Gagal memuat peta.');
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !geojson) return;

    const styleFor = (feature?: GeoFeature): L.PathOptions => {
      const datum = feature ? matchDatum(feature, data) : undefined;
      const value = datum ? datum[filter] : 0;
      return {
        fillColor: getColor(value, maxValue),
        weight: 1,
        opacity: 1,
        color: '#102150',
        fillOpacity: 0.85,
      };
    };

    const layer = L.geoJSON(geojson, {
      style: (feature) => styleFor(feature as GeoFeature | undefined),
      onEachFeature: (feature, featureLayer) => {
        const geoFeature = feature as GeoFeature;
        const datum = matchDatum(geoFeature, data);
        const provName = datum?.name || featureName(geoFeature) || 'Provinsi';

        featureLayer.bindTooltip(buildTooltip(provName, datum), {
          sticky: true,
          direction: 'top',
          opacity: 1,
          className: 'lpdp-map-tooltip',
        });
        featureLayer.on({
          click: () => {
            setSelected(
              datum
                ? { id: datum.id, name: datum.name }
                : {
                    id: String(geoFeature.properties.id ?? provName),
                    name: provName,
                  },
            );
          },
          mouseover: (event: L.LeafletMouseEvent) => {
            event.target.setStyle({ weight: 2.5, color: '#e2ac34' });
          },
          mouseout: (event: L.LeafletMouseEvent) => {
            event.target.setStyle(styleFor(geoFeature));
          },
        });
      },
    });

    layer.addTo(map);

    if (!fittedRef.current) {
      try {
        map.fitBounds(layer.getBounds(), { padding: [20, 20] });
        fittedRef.current = true;
      } catch {
        /* bounds kosong diabaikan */
      }
    }

    return () => {
      map.removeLayer(layer);
    };
  }, [geojson, data, filter, maxValue]);

  const selectedName = selectedDatum?.name ?? selected?.name ?? '';

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className="h-[480px] w-full overflow-hidden rounded-2xl border border-navy-100 shadow-soft sm:h-[560px]"
      />

      {/* Selected province panel */}
      {selected && (
        <div className="mt-4 rounded-xl bg-white border border-navy-100 shadow-soft p-5 animate-fade-up">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-serif text-lg font-semibold text-navy-900">
              {selectedName}
            </h3>
            <button
              onClick={() => setSelected(null)}
              className="text-xs text-navy-500 hover:text-navy-900"
            >
              Tutup
            </button>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-lg bg-navy-50 p-3">
              <p className="text-xs text-navy-500">Awardee</p>
              <p className="font-serif text-xl font-bold text-navy-900">
                {selectedDatum?.awardeeCount ?? 0}
              </p>
            </div>
            <div className="rounded-lg bg-navy-50 p-3">
              <p className="text-xs text-navy-500">Awardee Aktif</p>
              <p className="font-serif text-xl font-bold text-navy-900">
                {selectedDatum?.activeAwardeeCount ?? 0}
              </p>
            </div>
            <div className="rounded-lg bg-navy-50 p-3">
              <p className="text-xs text-navy-500">Alumni</p>
              <p className="font-serif text-xl font-bold text-navy-900">
                {selectedDatum?.alumniCount ?? 0}
              </p>
            </div>
          </div>

          <div className="mt-5 border-t border-navy-100 pt-4">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <h4 className="font-serif text-base font-semibold text-navy-900">
                Profil Awardee
              </h4>
              {selectedDatum && (
                <p className="text-xs text-navy-500">
                  {selectedAwardees.length} profil ditampilkan dari{' '}
                  {selectedDatum.awardeeCount.toLocaleString('id-ID')} awardee
                </p>
              )}
            </div>

            {selectedAwardees.length > 0 ? (
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {selectedAwardees.map((awardee) => (
                  <div
                    key={awardee.id}
                    className="flex min-w-0 items-center gap-3 rounded-xl border border-navy-100 bg-navy-50/70 p-3"
                  >
                    <img
                      src={awardee.photoUrl}
                      alt={`Foto ${awardee.name}`}
                      loading="lazy"
                      className="h-12 w-12 shrink-0 rounded-full bg-navy-100 object-cover"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-navy-900">
                        {awardee.name}
                      </p>
                      <p className="truncate text-xs text-navy-500">
                        {awardee.occupation}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-navy-500">
                Belum ada profil awardee untuk provinsi ini.
              </p>
            )}

            {selectedAwardees.some((awardee) => awardee.isSample) && (
              <p className="mt-3 text-[11px] font-medium text-gold-600">
                Profil masih data contoh dan akan diganti dengan data resmi.
              </p>
            )}
          </div>

          {!dataLoaded && (
            <p className="mt-3 text-xs text-gold-600 font-medium">
              Data belum tersinkron — angka di atas berasal dari data contoh/lokal.
            </p>
          )}
        </div>
      )}

      {loading && (
        <div className="absolute inset-0 grid place-items-center rounded-2xl bg-white/70">
          <p className="text-sm text-navy-600">Memuat peta Indonesia…</p>
        </div>
      )}
      {loadError && (
        <div className="absolute inset-0 grid place-items-center rounded-2xl bg-white/80 px-6 text-center">
          <p className="text-sm text-red-600">
            Gagal memuat peta: {loadError} Periksa koneksi internet.
          </p>
        </div>
      )}
    </div>
  );
}
