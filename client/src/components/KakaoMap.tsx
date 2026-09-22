import { CustomOverlayMap, Map, useKakaoLoader } from 'react-kakao-maps-sdk';
import { MAP_CENTER } from '../data';
import type { IconKey } from '../types';
import { AppIcon } from './AppIcon';
import { Spinner } from './ui/Spinner';

export interface KakaoMapMarker {
  id: string;
  kind: 'eat' | 'see' | 'bike';
  icon: IconKey;
  label: string;
  lat: number;
  lng: number;
  badge?: number;
}

interface KakaoMapProps {
  appKey: string;
  markers: readonly KakaoMapMarker[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function KakaoMap({ appKey, markers, selectedId, onSelect }: KakaoMapProps) {
  const [loading, error] = useKakaoLoader({ appkey: appKey });

  if (error) {
    return (
      <div className="map map--message" role="alert">
        카카오맵을 불러오지 못했어요. 키와 등록된 도메인을 확인해 주세요.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="map map--message">
        <Spinner label="지도를 불러오는 중…" />
      </div>
    );
  }

  return (
    <div className="map">
      <Map center={MAP_CENTER} level={5} style={{ width: '100%', height: '100%' }}>
        {markers.map((marker) => {
          const selected = marker.id === selectedId;
          return (
            <CustomOverlayMap key={marker.id} position={{ lat: marker.lat, lng: marker.lng }} xAnchor={0.5} yAnchor={1}>
              <button
                type="button"
                className={`pin pin--overlay pin--${marker.kind}${selected ? ' pin--on' : ''}`}
                aria-label={marker.badge === undefined ? marker.label : `${marker.label}, 남은 자전거 ${marker.badge}대`}
                aria-pressed={selected}
                onClick={() => onSelect(marker.id)}
              >
                <AppIcon name={marker.icon} size={20} />
                {marker.badge === undefined ? null : <span className="pin__badge">{marker.badge}</span>}
              </button>
            </CustomOverlayMap>
          );
        })}
      </Map>
    </div>
  );
}
