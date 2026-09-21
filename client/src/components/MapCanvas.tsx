import type { IconKey } from '../types';
import { AppIcon } from './AppIcon';

export interface MapMarker {
  id: string;
  kind: 'eat' | 'see' | 'bike';
  icon: IconKey;
  label: string;
  x: number;
  y: number;
  badge?: number;
}

interface MapCanvasProps {
  markers: readonly MapMarker[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function MapCanvas({ markers, selectedId, onSelect }: MapCanvasProps) {
  return (
    <div className="map" role="group" aria-label="화천 지도">
      <svg className="map__svg" viewBox="0 0 300 300" preserveAspectRatio="none" aria-hidden="true">
        <path className="map__river" d="M0 150 Q90 120 150 165 T300 150" />
        <path className="map__road" d="M30 0 L120 300" />
        <path className="map__road" d="M0 210 L300 190" />
      </svg>
      {markers.map((marker) => {
        const selected = marker.id === selectedId;
        return (
          <button
            key={marker.id}
            type="button"
            className={`pin pin--${marker.kind}${selected ? ' pin--on' : ''}`}
            style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
            aria-label={marker.badge === undefined ? marker.label : `${marker.label}, 남은 자전거 ${marker.badge}대`}
            aria-pressed={selected}
            onClick={() => onSelect(marker.id)}
          >
            <AppIcon name={marker.icon} size={20} />
            {marker.badge === undefined ? null : <span className="pin__badge">{marker.badge}</span>}
          </button>
        );
      })}
    </div>
  );
}
