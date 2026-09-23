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
  /** 이 값이 바뀔 때만(필터 전환 등) 지금 핀들이 다 보이도록 지도 범위를 다시 맞춘다 */
  fitKey: string;
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
export function LeafletMap({ markers, selectedId, onSelect, fitKey }: LeafletMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  const latestMarkersRef = useRef(markers);
  latestMarkersRef.current = markers;

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

  // 화천읍내에서 멀리 떨어진 핀도 필터 전환 시 화면 안에 들어오게 한다
  useEffect(() => {
    const map = mapRef.current;
    const current = latestMarkersRef.current;
    if (!map || current.length === 0) return;
    const only = current.length === 1 ? current[0] : undefined;
    if (only) {
      map.setView([only.lat, only.lng], DEFAULT_ZOOM);
      return;
    }
    const bounds = L.latLngBounds(current.map((item) => [item.lat, item.lng]));
    map.fitBounds(bounds, { paddingTopLeft: [40, 56], paddingBottomRight: [40, 160] });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fitKey]);

  return <div ref={containerRef} className="map" role="group" aria-label="화천 지도" />;
}
