import { CustomOverlayMap, Map, useKakaoLoader } from 'react-kakao-maps-sdk';
import { useEffect, useRef } from 'react';
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
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<kakao.maps.Map | null>(null);

  useEffect(() => {
    if (error) onLoadError();
  }, [error, onLoadError]);

  // .map은 flex:1로 높이가 정해지는 요소라, 지도가 생성되는 시점에 아직 레이아웃이
  // 확정되지 않아 내부 높이를 0으로 읽어가는 경우가 있다. 컨테이너 크기가 바뀔 때마다
  // relayout()으로 다시 계산해서 지도가 항상 실제 크기에 맞게 그려지게 한다.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;
    const observer = new ResizeObserver(() => {
      mapRef.current?.relayout();
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [loading]);

  if (error) return null;

  if (loading) {
    return (
      <div className="map map--loading">
        <Spinner label="카카오맵을 불러오는 중…" />
      </div>
    );
  }

  return (
    <div className="map" ref={containerRef}>
      <Map
        center={MAP_CENTER}
        level={5}
        style={{ width: '100%', height: '100%' }}
        onCreate={(map) => {
          mapRef.current = map;
          requestAnimationFrame(() => map.relayout());
        }}
      >
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
