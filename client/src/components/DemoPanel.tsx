import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Chip } from './ui/Chip';
import { Toggle } from './ui/Toggle';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { STAMP_SPOTS } from '../data';
import { formatWon } from '../utils/format';

const DEMO_CASH_AMOUNT = 10000;
const DEMO_USE_AMOUNT = 5000;

export function DemoPanel() {
  const { uid, stamps, toggleStamp, clearStamps, addCashDemo, spendCash, failNextVerify, setFailNextVerify } = useApp();
  const showToast = useToast();

  const handleUseDemo = async () => {
    const ok = await spendCash(DEMO_USE_AMOUNT);
    showToast(ok ? `캐시백 ${formatWon(DEMO_USE_AMOUNT)}을 사용했어요` : '사용 가능한 캐시백이 부족해요');
  };

  if (!uid) {
    return (
      <Card className="demo" aria-label="시연 도구">
        <strong>시연 도구</strong>
        <p className="sm">스탬프·캐시를 다루는 도구는 로그인 후 쓸 수 있어요.</p>
      </Card>
    );
  }

  return (
    <Card className="demo" aria-label="시연 도구">
      <strong>시연 도구</strong>
      <p className="sm">심사 시연 중 상태를 빠르게 바꾸는 숨김 기능이에요. 모두 Firestore에 실제로 저장돼요.</p>

      <div className="demo__section">
        <span className="demo__label">스탬프 수동 찍기 (다시 누르면 해제)</span>
        <div className="demo__chips">
          {STAMP_SPOTS.map((spot) => (
            <Chip
              key={spot.id}
              selected={stamps.some((stamp) => stamp.spotId === spot.id)}
              onClick={() => void toggleStamp(spot.id)}
            >
              {spot.name}
            </Chip>
          ))}
        </div>
        <Button variant="line" onClick={() => void clearStamps()}>
          스탬프 모두 지우기
        </Button>
      </div>

      <div className="demo__section">
        <Button
          variant="line"
          onClick={() => {
            void addCashDemo(DEMO_CASH_AMOUNT);
            showToast(`캐시 ${formatWon(DEMO_CASH_AMOUNT)}을 넣었어요`);
          }}
        >
          캐시 +{formatWon(DEMO_CASH_AMOUNT)}
        </Button>
        <Button variant="line" onClick={() => void handleUseDemo()}>
          캐시백 {formatWon(DEMO_USE_AMOUNT)} 사용
        </Button>
      </div>

      <div className="demo__section row">
        <span>다음 영수증 인증을 실패시키기</span>
        <Toggle checked={failNextVerify} onChange={setFailNextVerify} label="다음 영수증 인증 실패시키기" />
      </div>
    </Card>
  );
}
