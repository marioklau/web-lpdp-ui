import { useEffect, useRef } from 'react';
import L from 'leaflet';
import {
  areaValue,
  choroplethColor,
  type CountKey,
  type MapArea,
} from '@/lib/mapChoropleth';

interface IndonesiaMapProps {
  areas: MapArea[];
  filter: CountKey;
  maxValue: number;
  selectedId: string | null;
  hoveredId: string | null;
  visibleIds: string[] | null;
  fitKey: string;
  loading: boolean;
  error: string;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
}

const GEOJSON_SOURCE =
  'https://github.com/denyherianto/indonesia-geojson-topojson-maps-with-38-provinces';

function buildTooltip(area: MapArea | undefined): HTMLElement {
  const container = document.createElement('div');
  container.className = 'lpdp-map-tooltip-content';

  const title = document.createElement('div');
  title.className = 'lpdp-map-tooltip-title';
  title.textContent = area?.name ?? 'Wilayah';
  container.appendChild(title);

  if (!area) return container;

  const rows: [string, number][] = [
    ['Awardee', area.awardeeCount],
    ['Awardee aktif', area.activeAwardeeCount],
    ['Alumni', area.alumniCount],
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

  if (area.illustrative) {
    const note = document.createElement('div');
    note.className = 'lpdp-map-tooltip-empty';
    note.textContent = 'Ilustrasi dari total provinsi';
    container.appendChild(note);
  }

  return container;
}

export default function IndonesiaMap({
  areas,
  filter,
  maxValue,
  selectedId,
  hoveredId,
  visibleIds,
  fitKey,
  loading,
  error,
  onSelect,
  onHover,
}: IndonesiaMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.GeoJSON | null>(null);
  const pathsRef = useRef<Map<string, L.Path>>(new Map());
  const fittedRef = useRef('');
  const onSelectRef = useRef(onSelect);
  const onHoverRef = useRef(onHover);
  const styleRef = useRef<(id: string) => L.PathOptions>(() => ({}));

  onSelectRef.current = onSelect;
  onHoverRef.current = onHover;

  const values = new Map(areas.map((area) => [area.id, areaValue(area, filter)]));
  const visible = visibleIds ? new Set(visibleIds) : null;
  styleRef.current = (id: string) => {
    const hot = id === hoveredId || id === selectedId;
    const dimmed = Boolean(visible && !visible.has(id));
    return {
      fillColor: choroplethColor(values.get(id) ?? 0, maxValue),
      fillOpacity: dimmed ? 0.28 : hot ? 1 : 0.92,
      color: hot ? '#0a1638' : '#ffffff',
      weight: id === selectedId ? 2.6 : hot ? 2 : 1.1,
      opacity: 1,
    };
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container || mapRef.current) return;

    const map = L.map(container, {
      center: [-2.2, 118],
      zoom: 5,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      minZoom: 4,
      maxZoom: 11,
      zoomControl: false,
      attributionControl: true,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);
    map.attributionControl.addAttribution(
      `Provinsi: <a href="${GEOJSON_SOURCE}">GeoJSON 38 Provinsi</a> · Kab/kota: BIG BATASWILAYAH 2026`,
    );

    mapRef.current = map;
    let lastWidth = container.clientWidth;
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
      const width = container.clientWidth;
      if (Math.abs(width - lastWidth) < 48) return;
      lastWidth = width;
      const layer = layerRef.current;
      if (!layer) return;
      const bounds = layer.getBounds();
      if (!bounds.isValid()) return;
      const national = fittedRef.current === 'indonesia';
      map.fitBounds(bounds, {
        padding: [28, 28],
        animate: false,
        maxZoom: national ? 6 : 10,
      });
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
      fittedRef.current = '';
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (layerRef.current) {
      map.removeLayer(layerRef.current);
      layerRef.current = null;
    }
    pathsRef.current.clear();
    if (!areas.length) return;

    const byId = new Map(areas.map((area) => [area.id, area]));
    const collection: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: areas.map((area) => area.feature),
    };

    const layer = L.geoJSON(collection, {
      style: (feature) =>
        styleRef.current(String(feature?.properties?.id ?? '')),
      onEachFeature: (feature, featureLayer) => {
        const id = String(feature.properties?.id ?? '');
        const path = featureLayer as L.Path;
        pathsRef.current.set(id, path);
        path.bindTooltip(buildTooltip(byId.get(id)), {
          sticky: true,
          direction: 'top',
          opacity: 1,
          className: 'lpdp-map-tooltip',
        });
        path.on({
          click: () => onSelectRef.current(id),
          mouseover: () => {
            path.bringToFront();
            path.setStyle({ weight: 2.4, color: '#0a1638', fillOpacity: 1 });
            onHoverRef.current(id);
          },
          mouseout: () => {
            path.setStyle(styleRef.current(id));
            onHoverRef.current(null);
          },
        });
      },
    });

    layer.addTo(map);
    layerRef.current = layer;

    if (fittedRef.current !== fitKey) {
      const bounds = layer.getBounds();
      if (bounds.isValid()) {
        const padding: L.FitBoundsOptions = { padding: [28, 28] };
        if (fittedRef.current === '') {
          map.fitBounds(bounds, { ...padding, animate: false, maxZoom: 6 });
        } else {
          map.flyToBounds(bounds, { ...padding, duration: 0.85, maxZoom: 10 });
        }
        fittedRef.current = fitKey;
      }
    }

    return () => {
      map.removeLayer(layer);
      if (layerRef.current === layer) layerRef.current = null;
      pathsRef.current.clear();
    };
  }, [areas, fitKey]);

  useEffect(() => {
    pathsRef.current.forEach((path, id) => {
      path.setStyle(styleRef.current(id));
      if (id === hoveredId || id === selectedId) path.bringToFront();
    });
  }, [hoveredId, selectedId, visibleIds, filter, maxValue, areas]);

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="lpdp-map h-full w-full" />
      {loading && !areas.length && (
        <div className="absolute inset-0 grid place-items-center bg-[#eef2fb]/80">
          <p className="text-sm text-navy-600">Memuat peta Indonesia…</p>
        </div>
      )}
      {error && !areas.length && (
        <div className="absolute inset-0 grid place-items-center bg-white/85 px-6 text-center">
          <p className="text-sm text-red-600">Gagal memuat peta: {error}</p>
        </div>
      )}
      {error && areas.length > 0 && (
        <p className="absolute bottom-4 left-1/2 z-[500] max-w-sm -translate-x-1/2 rounded-full bg-white px-4 py-2 text-center text-xs text-red-600 shadow-soft">
          {error}
        </p>
      )}
    </div>
  );
}
