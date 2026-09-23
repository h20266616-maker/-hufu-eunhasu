import { MapPinOff } from 'lucide-react';
import { useMemo, useState } from 'react';
import { BottomSheet } from '../components/BottomSheet';
import { KakaoMap } from '../components/KakaoMap';
import { LeafletMap } from '../components/LeafletMap';
import { ScreenHeader } from '../components/ScreenHeader';
import { Button } from '../components/ui/Button';
import { Chip } from '../components/ui/Chip';
import { useApp } from '../context/AppContext';
import { useNav } from '../context/NavContext';
import { useToast } from '../context/ToastContext';
import { BIKE_STATIONS, MAP_PLACES } from '../data';
import { useElapsedSeconds } from '../hooks/useElapsedSeconds';
import type { MapFilter, MapMarker } from '../types';
import { formatElapsed } from '../utils/format';

const FILTERS: readonly { value: MapFilter; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'eat', label: '먹을 곳' },
  { value: 'see', label: '볼 곳' },
  { value: 'bike', label: '자전거' },
];

const KAKAO_MAP_KEY = import.meta.env.VITE_KAKAO_MAP_KEY;

export function MapPage() {
  const { ride, bikeStock, startRide, endRide } = useApp();
  const { switchTab } = useNav();
  const showToast = useToast();
  const [filter, setFilter] = useState<MapFilter>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [kakaoFailed, setKakaoFailed] = useState(false);
  const elapsed = useElapsedSeconds(ride?.startedAt ?? null);
  const useKakao = Boolean(KAKAO_MAP_KEY) && !kakaoFailed;

  const markers = useMemo<MapMarker[]>(() => {
    const places: MapMarker[] = MAP_PLACES.filter((place) => filter === 'all' || place.kind === filter).map(
      (place) => ({ id: place.id, kind: place.kind, icon: place.icon, label: place.name, lat: place.lat, lng: place.lng }),
    );
    const stations: MapMarker[] =
      filter === 'all' || filter === 'bike'
        ? BIKE_STATIONS.map((station) => ({
            id: station.id,
            kind: 'bike' as const,
            icon: 'bike' as const,
            label: `${station.name} 대여소`,
            lat: station.lat,
            lng: station.lng,
            badge: bikeStock[station.id] ?? 0,
          }))
        : [];
    return [...places, ...stations];
  }, [filter, bikeStock]);

  const visibleSelectedId = markers.some((marker) => marker.id === selectedId) ? selectedId : null;
  const selectedStation = BIKE_STATIONS.find((station) => station.id === visibleSelectedId);
  const selectedPlace = MAP_PLACES.find((place) => place.id === visibleSelectedId);
  const rentedFrom = BIKE_STATIONS.find((station) => station.id === ride?.stationId);

  const handleRent = (stationId: string) => {
    showToast(startRide(stationId) ? '자전거 잠금이 해제되었습니다' : '지금은 자전거를 빌릴 수 없어요');
  };

  const handleReturn = (stationId: string) => {
    if (endRide(stationId) !== null) showToast('반납 완료 · 이용료 무료');
  };

  return (
    <div className="page page--map">
      <ScreenHeader title="지도·자전거" showBack={false} />

      {useKakao ? null : (
        <div className="map-notice" role="note">
          <MapPinOff size={16} aria-hidden="true" />
          {KAKAO_MAP_KEY
            ? '카카오맵을 불러오지 못했어요. 지금은 OpenStreetMap 지도로 보여드려요.'
            : '카카오맵 키를 등록해주세요. 지금은 OpenStreetMap 지도로 보여드려요.'}
        </div>
      )}

      <div className="chips" role="group" aria-label="지도 필터">
        {FILTERS.map((item) => (
          <Chip key={item.value} selected={filter === item.value} onClick={() => setFilter(item.value)}>
            {item.label}
          </Chip>
        ))}
      </div>

      {useKakao ? (
        <KakaoMap
          appKey={KAKAO_MAP_KEY as string}
          markers={markers}
          selectedId={visibleSelectedId}
          onSelect={setSelectedId}
          onLoadError={() => setKakaoFailed(true)}
          fitKey={filter}
        />
      ) : (
        <LeafletMap markers={markers} selectedId={visibleSelectedId} onSelect={setSelectedId} fitKey={filter} />
      )}

      <BottomSheet open label="지도 상세 정보">
        {ride ? (
          <div className="sheet__body">
            <div className="row">
              <div>
                <strong>자전거 이용 중</strong>
                <div className="sm">{rentedFrom ? `${rentedFrom.name}에서 대여함` : '대여 중'}</div>
              </div>
              <span className="ride-timer" aria-label={`이용 시간 ${formatElapsed(elapsed)}`}>
                {formatElapsed(elapsed)}
              </span>
            </div>
            <p className="sm">어느 대여소든 반납할 수 있어요.</p>
            <ul className="return-list">
              {BIKE_STATIONS.map((station) => (
                <li key={station.id}>
                  <Button
                    className="btn--small"
                    variant={station.id === visibleSelectedId ? 'primary' : 'line'}
                    onClick={() => handleReturn(station.id)}
                  >
                    {station.name}에 반납
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        ) : selectedStation ? (
          <div className="sheet__body">
            <div className="row">
              <div>
                <strong>{selectedStation.name} 대여소</strong>
                <div className="sm">
                  남은 자전거 {bikeStock[selectedStation.id] ?? 0}대 · {selectedStation.distance}
                </div>
              </div>
            </div>
            <Button onClick={() => handleRent(selectedStation.id)} disabled={(bikeStock[selectedStation.id] ?? 0) <= 0}>
              {(bikeStock[selectedStation.id] ?? 0) > 0 ? '여기서 대여하기' : '남은 자전거가 없어요'}
            </Button>
          </div>
        ) : selectedPlace ? (
          <div className="sheet__body">
            <strong>{selectedPlace.name}</strong>
            <div className="sm">{selectedPlace.description}</div>
            {selectedPlace.stampId ? <p className="sm">이곳 영수증을 인증하면 스탬프가 찍혀요.</p> : null}
            <Button variant="line" onClick={() => switchTab('receipt')}>
              영수증 인증하러 가기
            </Button>
          </div>
        ) : (
          <div className="sheet__body">
            <strong>핀을 눌러보세요</strong>
            <div className="sm">자전거 대여소를 누르면 바로 빌릴 수 있어요. 카드 결제가 되는 제휴 매장도 함께 보여드려요.</div>
          </div>
        )}
      </BottomSheet>
    </div>
  );
}
