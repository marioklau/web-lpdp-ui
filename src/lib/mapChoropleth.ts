export interface CountDatum {
  id: string;
  name: string;
  awardeeCount: number;
  activeAwardeeCount: number;
  alumniCount: number;
}

export type CountKey = 'awardeeCount' | 'activeAwardeeCount' | 'alumniCount';

export interface AreaFeatureProps {
  id: string;
  name: string;
}

export interface MapArea extends CountDatum {
  illustrative: boolean;
  feature: GeoJSON.Feature<GeoJSON.Geometry, AreaFeatureProps>;
}

const EMPTY = '#e4e6ec';
const GRAY: [number, number, number] = [186, 190, 199];
const GOLD: [number, number, number] = [226, 172, 52];

export function choroplethColor(value: number, max: number): string {
  if (value <= 0 || max <= 0) return EMPTY;
  const ratio = Math.sqrt(Math.min(value / max, 1));
  const channel = (index: 0 | 1 | 2) =>
    Math.round(GRAY[index] + (GOLD[index] - GRAY[index]) * ratio);
  return `rgb(${channel(0)}, ${channel(1)}, ${channel(2)})`;
}

export function canonicalPlace(value: string): string {
  const key = value.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (
    key === 'dkijakarta' ||
    key === 'daerahkhususibukotajakarta' ||
    key === 'jakartaraya'
  ) {
    return 'dkijakarta';
  }
  if (
    key === 'yogyakarta' ||
    key === 'diyogyakarta' ||
    key === 'daerahistimewayogyakarta'
  ) {
    return 'daerahistimewayogyakarta';
  }
  if (key === 'bangkabelitung') return 'kepulauanbangkabelitung';
  return key;
}

function hashWeight(id: string): number {
  let hash = 2166136261;
  for (let index = 0; index < id.length; index += 1) {
    hash ^= id.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) % 80 + 25;
}

function apportion(total: number, weights: number[]): number[] {
  if (!weights.length) return [];
  if (total <= 0) return weights.map(() => 0);
  const sum = weights.reduce((totalWeight, weight) => totalWeight + weight, 0) || 1;
  const raw = weights.map((weight) => (total * weight) / sum);
  const base = raw.map((value) => Math.floor(value));
  const remain = total - base.reduce((totalCount, count) => totalCount + count, 0);
  const order = raw
    .map((value, index) => ({ index, fraction: value - Math.floor(value) }))
    .sort((a, b) => b.fraction - a.fraction || a.index - b.index);
  for (let index = 0; index < remain; index += 1) {
    base[order[index].index] += 1;
  }
  return base;
}

function matchProvince(name: string, data: CountDatum[]): CountDatum | undefined {
  const target = canonicalPlace(name);
  return data.find((item) => canonicalPlace(item.name) === target);
}

export function buildProvinceAreas(
  collection: GeoJSON.FeatureCollection,
  data: CountDatum[],
): MapArea[] {
  return collection.features.map((feature) => {
    const props = (feature.properties ?? {}) as { PROVINSI?: string };
    const sourceName = String(props.PROVINSI || 'Provinsi').trim();
    const datum = matchProvince(sourceName, data);
    const name = datum?.name ?? sourceName;
    const id = datum?.id ?? `geo-${canonicalPlace(sourceName)}`;
    return {
      id,
      name,
      awardeeCount: datum?.awardeeCount ?? 0,
      activeAwardeeCount: datum?.activeAwardeeCount ?? 0,
      alumniCount: datum?.alumniCount ?? 0,
      illustrative: false,
      feature: {
        type: 'Feature',
        properties: { id, name },
        geometry: feature.geometry,
      },
    };
  });
}

export function buildRegencyAreas(
  collection: GeoJSON.FeatureCollection,
  provinceName: string,
  datum: CountDatum | undefined,
): MapArea[] {
  const target = canonicalPlace(provinceName);
  const features = collection.features.filter((feature) => {
    const props = (feature.properties ?? {}) as { provinsi?: string };
    return canonicalPlace(String(props.provinsi || '')) === target;
  });
  const weights = features.map((feature) => {
    const props = (feature.properties ?? {}) as { kode?: string };
    return hashWeight(String(props.kode || ''));
  });
  const awardee = apportion(datum?.awardeeCount ?? 0, weights);
  const activeShare =
    datum && datum.awardeeCount > 0
      ? datum.activeAwardeeCount / datum.awardeeCount
      : 0;

  return features.map((feature, index) => {
    const props = (feature.properties ?? {}) as { kode?: string; nama?: string };
    const id = String(props.kode || index);
    const name = String(props.nama || 'Kabupaten/Kota');
    const total = awardee[index] ?? 0;
    const active = Math.min(total, Math.round(total * activeShare));
    return {
      id,
      name,
      awardeeCount: total,
      activeAwardeeCount: active,
      alumniCount: total - active,
      illustrative: true,
      feature: {
        type: 'Feature',
        properties: { id, name },
        geometry: feature.geometry,
      },
    };
  });
}

export function areaValue(area: CountDatum, key: CountKey): number {
  return area[key] || 0;
}
