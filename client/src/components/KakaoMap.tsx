import { CustomOverlayMap, Map, useKakaoLoader } from 'react-kakao-maps-sdk';
import { useCallback, useEffect, useRef, useState } from 'react';
import { MAP_CENTER } from '../data';
import { useLatest } from '../hooks/useLatest';
import type { MapMarker } from '../types';
import { AppIcon } from './AppIcon';
import { Spinner } from './ui/Spinner';

interface MarkerGroup {
  /** 묶인 핀들의 id를 이어붙인 값. 묶음 구성이 바뀔 때마다 자연히 새 키가 된다 */
  id: string;
  lat: number;
  lng: number;
  markers: readonly MapMarker[];
}

/** 화면 픽셀 기준으로 이 거리 안에 있는 핀들은 하나로 묶는다 (핀 하나가 44px 정도라 그보다 살짝 크게) */
const CLUSTER_PIXEL_DISTANCE = 50;

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

/** 이보다 더 축소해야 한다면 가장 멀리 있는 핀은 포기하고 가까운 핀들의 간격을 지킨다 */
const MAX_FIT_LEVEL = 10;

export function KakaoMap({ appKey, markers, selectedId, onSelect, onLoadError, fitKey }: KakaoMapProps) {
  const [loading, error] = useKakaoLoader({ appkey: appKey });
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<kakao.maps.Map | null>(null);
  const markersRef = useLatest(markers);
  const [groups, setGroups] = useState<MarkerGroup[]>([]);

  useEffect(() => {
    if (error) onLoadError();
  }, [error, onLoadError]);

  // .map은 flex:1로 높이가 정해지는 요소라, 지도가 생성되는 시점에 아직 레이아웃이
  // 확정되지 않아 내부 높이를 0으로 읽어가는 경우가 있다. 컨테이너 크기가 바뀔 때마다
  // relayout()으로 다시 계산해서 지도가 항상 실제 크기에 맞게 그려지게 한다.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;
    let lastWidth = -1;
    let lastHeight = -1;
    const observer = new ResizeObserver(([entry]) => {
      const box = entry?.contentBoxSize?.[0];
      const width = box?.inlineSize ?? container.clientWidth;
      const height = box?.blockSize ?? container.clientHeight;
      // relayout() 자체가 아주 미세한 크기 변화를 만들 수 있어서, 실제로 크기가
      // 달라졌을 때만 다시 계산한다. 그렇지 않으면 옵저버가 스스로를 계속 다시 깨운다
      if (width === lastWidth && height === lastHeight) return;
      lastWidth = width;
      lastHeight = height;
      mapRef.current?.relayout();
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [loading]);

  // 화천읍내에서 멀리 떨어진 핀(간동면 상점, 평화의 댐 등)도 필터 전환 시 화면 안에 들어오게 한다
  const fitToMarkers = useCallback(
    (map: kakao.maps.Map) => {
      let group = markersRef.current;
      if (group.length === 0) return;

      const apply = (list: readonly MapMarker[]) => {
        const only = list.length === 1 ? list[0] : undefined;
        if (only) {
          map.setLevel(5);
          map.setCenter(new kakao.maps.LatLng(only.lat, only.lng));
          return;
        }
        const bounds = new kakao.maps.LatLngBounds();
        list.forEach((marker) => bounds.extend(new kakao.maps.LatLng(marker.lat, marker.lng)));
        map.setBounds(bounds, 56, 40, 160, 40);
      };

      apply(group);
      // 평화의 댐처럼 아주 멀리 떨어진 핀 하나 때문에 화천읍·간동면처럼 가까이 모인 핀들까지
      // 너무 축소돼서 서로 겹쳐 누를 수 없게 되는 걸 막는다. 가장 먼 핀부터 하나씩 빼고
      // 나머지끼리만 다시 맞춰서, 멀리 있는 핀은 패닝으로 찾게 한다
      while (map.getLevel() > MAX_FIT_LEVEL && group.length > 1) {
        const center = map.getCenter();
        let farthestIndex = 0;
        let farthestDist = -1;
        group.forEach((marker, index) => {
          const dist = Math.hypot(marker.lat - center.getLat(), marker.lng - center.getLng());
          if (dist > farthestDist) {
            farthestDist = dist;
            farthestIndex = index;
          }
        });
        group = group.filter((_, index) => index !== farthestIndex);
        apply(group);
      }
    },
    [markersRef],
  );

  // 화면상 픽셀 거리가 가까운 핀들을 하나로 묶는다. 줌·이동이 끝날 때(idle)와 markers가
  // 바뀔 때(필터 전환, 자전거 대여/반납) 다시 계산한다
  const recomputeGroups = useCallback(
    (map: kakao.maps.Map) => {
      // 화면 밖 멀리 떨어진 핀은 투영 좌표가 극단적으로 커져서 서로 엉뚱하게 묶일 수 있다.
      // 지금 보이는 범위 안의 핀만 클러스터링 대상으로 삼는다
      const bounds = map.getBounds();
      const list = markersRef.current.filter((marker) => bounds.contain(new kakao.maps.LatLng(marker.lat, marker.lng)));
      const projection = map.getProjection();
      const placed: { point: kakao.maps.Point; markers: MapMarker[] }[] = [];

      for (const marker of list) {
        const point = projection.containerPointFromCoords(new kakao.maps.LatLng(marker.lat, marker.lng));
        const bucket = placed.find(
          (item) => Math.hypot(item.point.x - point.x, item.point.y - point.y) <= CLUSTER_PIXEL_DISTANCE,
        );
        if (bucket) bucket.markers.push(marker);
        else placed.push({ point, markers: [marker] });
      }

      setGroups(
        placed.map((bucket) => ({
          id: bucket.markers.map((marker) => marker.id).join('|'),
          lat: bucket.markers.reduce((sum, marker) => sum + marker.lat, 0) / bucket.markers.length,
          lng: bucket.markers.reduce((sum, marker) => sum + marker.lng, 0) / bucket.markers.length,
          markers: bucket.markers,
        })),
      );
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

  useEffect(() => {
    if (mapRef.current) recomputeGroups(mapRef.current);
  }, [markers, recomputeGroups]);

  // onCreate/onIdle을 인라인 함수로 넘기면 매 렌더마다 다른 참조가 되어, <Map> 내부의
  // [map, onCreate] 의존 effect가 계속 다시 실행되며 무한 루프가 생긴다. useCallback으로
  // 참조를 고정해야 한다
  const handleMapCreate = useCallback(
    (map: kakao.maps.Map) => {
      mapRef.current = map;
      requestAnimationFrame(() => {
        map.relayout();
        fitToMarkers(map);
        recomputeGroups(map);
      });
    },
    [fitToMarkers, recomputeGroups],
  );

  const handleGroupClick = (group: MarkerGroup) => {
    const map = mapRef.current;
    if (!map) return;
    const [only] = group.markers;
    if (group.markers.length === 1 && only) {
      onSelect(only.id);
      return;
    }
    const bounds = new kakao.maps.LatLngBounds();
    group.markers.forEach((marker) => bounds.extend(new kakao.maps.LatLng(marker.lat, marker.lng)));
    map.setBounds(bounds, 56, 40, 160, 40);
  };

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
      <Map center={MAP_CENTER} level={5} style={{ position: 'absolute', inset: 0 }} onCreate={handleMapCreate} onIdle={recomputeGroups}>
        {groups.map((group) => {
          const [only] = group.markers;
          if (group.markers.length === 1 && only) {
            const selected = only.id === selectedId;
            return (
              <CustomOverlayMap key={group.id} position={{ lat: only.lat, lng: only.lng }} xAnchor={0.5} yAnchor={1}>
                <button
                  type="button"
                  className={`pin pin--overlay pin--${only.kind}${selected ? ' pin--on' : ''}`}
                  aria-label={only.badge === undefined ? only.label : `${only.label}, 남은 자전거 ${only.badge}대`}
                  aria-pressed={selected}
                  onClick={() => handleGroupClick(group)}
                >
                  <AppIcon name={only.icon} size={20} />
                  {only.badge === undefined ? null : <span className="pin__badge">{only.badge}</span>}
                </button>
              </CustomOverlayMap>
            );
          }
          return (
            <CustomOverlayMap key={group.id} position={{ lat: group.lat, lng: group.lng }} xAnchor={0.5} yAnchor={0.5}>
              <button
                type="button"
                className="pin pin--cluster"
                aria-label={`${group.markers.length}개 장소 묶음, 눌러서 확대`}
                onClick={() => handleGroupClick(group)}
              >
                {group.markers.length}
              </button>
            </CustomOverlayMap>
          );
        })}
      </Map>
    </div>
  );
}
