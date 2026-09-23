import { CustomOverlayMap, Map, useKakaoLoader } from 'react-kakao-maps-sdk';
import { useCallback, useEffect, useRef } from 'react';
import { MAP_CENTER } from '../data';
import { useLatest } from '../hooks/useLatest';
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
  /** 이 값이 바뀔 때만(필터 전환 등) 지금 핀들이 다 보이도록 지도 범위를 다시 맞춘다.
   * 자전거 대여/반납처럼 markers 내용만 바뀌는 경우에는 사용자가 보던 화면을 건드리지 않는다 */
  fitKey: string;
}

export function KakaoMap({ appKey, markers, selectedId, onSelect, onLoadError, fitKey }: KakaoMapProps) {
  const [loading, error] = useKakaoLoader({ appkey: appKey });
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<kakao.maps.Map | null>(null);
  const markersRef = useLatest(markers);

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

  // 화천읍내에서 멀리 떨어진 핀(간동면 상점, 평화의 댐 등)도 필터 전환 시 화면 안에 들어오게 한다
  const fitToMarkers = useCallback(
    (map: kakao.maps.Map) => {
      const current = markersRef.current;
      if (current.length === 0) return;
      const only = current.length === 1 ? current[0] : undefined;
      if (only) {
        map.setLevel(5);
        map.setCenter(new kakao.maps.LatLng(only.lat, only.lng));
        return;
      }
      const bounds = new kakao.maps.LatLngBounds();
      current.forEach((marker) => bounds.extend(new kakao.maps.LatLng(marker.lat, marker.lng)));
      map.setBounds(bounds, 56, 40, 160, 40);
    },
    [markersRef],
  );

  // <Map>이 실제로 kakao.maps.Map을 만드는 시점은 이 컴포넌트가 loading=false로 렌더된 시점보다
  // 한 박자 늦다(내부 isLoaded 상태가 따로 있음). 그래서 마운트 직후의 첫 fit은 onCreate에서 직접 하고,
  // 이후 필터가 바뀔 때의 fit만 이 effect가 담당한다
  useEffect(() => {
    if (mapRef.current) fitToMarkers(mapRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fitKey]);

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
        style={{ position: 'absolute', inset: 0 }}
        onCreate={(map) => {
          mapRef.current = map;
          requestAnimationFrame(() => {
            map.relayout();
            fitToMarkers(map);
          });
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
