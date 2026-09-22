import { CustomOverlayMap, Map, useKakaoLoader } from 'react-kakao-maps-sdk';
import { useEffect } from 'react';
import { MAP_CENTER } from '../data';
import type { MapMarker } from '../types';
import { AppIcon } from './AppIcon';
import { Spinner } from './ui/Spinner';

interface KakaoMapProps {
  appKey: string;
  markers: readonly MapMarker[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  /** 로딩에 실패하면 상위(MapPage)가 무료 지도로 즉시 폴백한다 */
  onLoadError: () => void;
}

export function KakaoMap({ appKey, markers, selectedId, onSelect, onLoadError }: KakaoMapProps) {
  const [loading, error] = useKakaoLoader({ appkey: appKey });

  useEffect(() => {
    if (error) onLoadError();
  }, [error, onLoadError]);

  if (error) return null;

  if (loading) {
    return (
      <div className="map map--loading">
        <Spinner label="카카오맵을 불러오는 중…" />
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
