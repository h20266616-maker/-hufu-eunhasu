import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useRef } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MAP_CENTER } from '../data';
import type { MapMarker } from '../types';
import { AppIcon } from './AppIcon';

interface LeafletMapProps {
  markers: readonly MapMarker[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const DEFAULT_ZOOM = 15;
const PIN_SIZE: [number, number] = [44, 44];
const PIN_ANCHOR: [number, number] = [22, 44];

function buildIcon(marker: MapMarker, selected: boolean): L.DivIcon {
  const html = renderToStaticMarkup(
    <span className={`pin pin--overlay pin--${marker.kind}${selected ? ' pin--on' : ''}`}>
      <AppIcon name={marker.icon} size={20} />
      {marker.badge === undefined ? null : <span className="pin__badge">{marker.badge}</span>}
    </span>,
  );
  return L.divIcon({ html, className: 'leaflet-pin', iconSize: PIN_SIZE, iconAnchor: PIN_ANCHOR });
}

/** OpenStreetMap 무료 타일을 쓰는 지도. 키 발급·도메인 등록이 필요 없다 */
export function LeafletMap({ markers, selectedId, onSelect }: LeafletMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  useEffect(() => {
    if (!containerRef.current) return undefined;
    const map = L.map(containerRef.current).setView([MAP_CENTER.lat, MAP_CENTER.lng], DEFAULT_ZOOM);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current.clear();
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const existing = markersRef.current;
    const nextIds = new Set(markers.map((item) => item.id));

    for (const [id, marker] of existing) {
      if (!nextIds.has(id)) {
        marker.remove();
        existing.delete(id);
      }
    }

    for (const item of markers) {
      const icon = buildIcon(item, item.id === selectedId);
      const current = existing.get(item.id);
      if (current) {
        current.setIcon(icon);
        current.setLatLng([item.lat, item.lng]);
      } else {
        const marker = L.marker([item.lat, item.lng], { icon, alt: item.label, keyboard: false }).addTo(map);
        marker.on('click', () => onSelectRef.current(item.id));
        existing.set(item.id, marker);
      }
    }
  }, [markers, selectedId]);

  return <div ref={containerRef} className="map" role="group" aria-label="화천 지도" />;
}
