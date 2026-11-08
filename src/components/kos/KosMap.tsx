import { useEffect, useRef } from 'react';
import L from 'leaflet';
import {
  KOS_CAMPUSES,
  campusInfo,
  formatKosPrice,
  formatKosRating,
  kosRatingValue,
} from '@/lib/kos';
import type { KosCampus, KosListing } from '@/types';

interface KosMapProps {
  listings: KosListing[];
  campus: KosCampus | 'all';
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const CAMPUS_COLORS: Record<KosCampus, string> = {
  depok: '#e2ac34',
  salemba: '#1f3a8a',
};

function buildTooltip(listing: KosListing): HTMLElement {
  const container = document.createElement('div');
  container.className = 'lpdp-map-tooltip-content';

  const title = document.createElement('div');
  title.className = 'lpdp-map-tooltip-title';
  title.textContent = listing.name;
  container.appendChild(title);

  const meta = document.createElement('div');
  meta.className = 'lpdp-map-tooltip-row';
  const metaLabel = document.createElement('span');
  metaLabel.textContent = campusInfo(listing.campus).label;
  const metaValue = document.createElement('strong');
  metaValue.textContent = `${formatKosPrice(listing.price)}/bln`;
  meta.append(metaLabel, metaValue);
  container.appendChild(meta);

  const rating = document.createElement('div');
  rating.className = 'lpdp-map-tooltip-row';
  const ratingLabel = document.createElement('span');
  ratingLabel.textContent = 'Rating';
  const ratingValue = document.createElement('strong');
  ratingValue.textContent = listing.ratingCount
    ? `★ ${formatKosRating(kosRatingValue(listing))} (${listing.ratingCount})`
    : 'Belum ada rating';
  rating.append(ratingLabel, ratingValue);
  container.appendChild(rating);

  const hint = document.createElement('div');
  hint.className = 'lpdp-map-tooltip-empty';
  hint.textContent = 'Klik untuk melihat detail kos';
  container.appendChild(hint);

  return container;
}

export default function KosMap({
  listings,
  campus,
  selectedId,
  onSelect,
}: KosMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const fittedRef = useRef('');
  const onSelectRef = useRef(onSelect);

  onSelectRef.current = onSelect;

  useEffect(() => {
    const container = containerRef.current;
    if (!container || mapRef.current) return;

    const map = L.map(container, {
      center: [-6.278, 106.838],
      zoom: 11,
      scrollWheelZoom: false,
      zoomControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    mapRef.current = map;
    const resizeObserver = new ResizeObserver(() => map.invalidateSize());
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
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

    const group = L.layerGroup();
    const visibleCampuses =
      campus === 'all'
        ? KOS_CAMPUSES
        : KOS_CAMPUSES.filter((info) => info.id === campus);

    visibleCampuses.forEach((info) => {
      L.circle([info.center.lat, info.center.lng], {
        radius: 700,
        color: CAMPUS_COLORS[info.id],
        weight: 1.4,
        dashArray: '6 8',
        fillColor: CAMPUS_COLORS[info.id],
        fillOpacity: 0.07,
      }).addTo(group);

      L.circleMarker([info.center.lat, info.center.lng], {
        radius: 6,
        color: '#ffffff',
        weight: 2,
        fillColor: '#0a1638',
        fillOpacity: 1,
      })
        .bindTooltip(info.label, {
          permanent: true,
          direction: 'top',
          className: 'kos-map-campus-label',
          opacity: 1,
        })
        .addTo(group);
    });

    listings.forEach((listing) => {
      const selected = listing.id === selectedId;
      const marker = L.circleMarker([listing.lat, listing.lng], {
        radius: selected ? 12 : 8.5,
        color: selected ? '#0a1638' : '#ffffff',
        weight: selected ? 3 : 2,
        fillColor: CAMPUS_COLORS[listing.campus],
        fillOpacity: 0.95,
      });

      marker.bindTooltip(buildTooltip(listing), {
        direction: 'top',
        className: 'lpdp-map-tooltip',
        opacity: 1,
      });
      marker.on('click', () => onSelectRef.current(listing.id));
      marker.addTo(group);
    });

    group.addTo(map);
    layerRef.current = group;

    const fitKey = campus;
    if (fittedRef.current !== fitKey) {
      const points: L.LatLngExpression[] = visibleCampuses.map((info) => [
        info.center.lat,
        info.center.lng,
      ]);
      listings.forEach((listing) => points.push([listing.lat, listing.lng]));

      if (points.length) {
        const bounds = L.latLngBounds(points);
        if (bounds.isValid()) {
          const options: L.FitBoundsOptions = {
            padding: [40, 40],
            maxZoom: 14,
          };
          if (fittedRef.current === '') {
            map.fitBounds(bounds, { ...options, animate: false });
          } else {
            map.flyToBounds(bounds, { ...options, duration: 0.7 });
          }
        }
      }
      fittedRef.current = fitKey;
    }

    return () => {
      map.removeLayer(group);
      if (layerRef.current === group) layerRef.current = null;
    };
  }, [listings, campus, selectedId]);

  return <div ref={containerRef} className="lpdp-map h-full w-full" />
}
