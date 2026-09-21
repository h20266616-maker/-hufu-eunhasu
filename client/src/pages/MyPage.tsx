import { Award, Bell, MessagesSquare, Receipt, ShieldCheck, Stamp, User, Users } from 'lucide-react';
import { useRef, useState } from 'react';
import { DemoPanel } from '../components/DemoPanel';
import { MenuRow } from '../components/MenuRow';
import { ScreenHeader } from '../components/ScreenHeader';
import { Card } from '../components/ui/Card';
import { Tag } from '../components/ui/Tag';
import { useApp } from '../context/AppContext';
import { useNav } from '../context/NavContext';
import { STAMP_SPOTS } from '../data';
import { formatWon } from '../utils/format';

const DEMO_TAP_COUNT = 5;
const DEMO_TAP_WINDOW_MS = 1200;

export function MyPage() {
  const { profile, cumulativeCashback, stamps, claimedRewards } = useApp();
  const { push, switchTab } = useNav();
  const [demoOpen, setDemoOpen] = useState(false);
  const tapState = useRef({ count: 0, last: 0 });

  const handleVersionTap = () => {
    const now = Date.now();
    const state = tapState.current;
    state.count = now - state.last > DEMO_TAP_WINDOW_MS ? 1 : state.count + 1;
    state.last = now;
    if (state.count >= DEMO_TAP_COUNT) {
      state.count = 0;
      setDemoOpen((open) => !open);
    }
  };

  return (
    <div className="page">
      <ScreenHeader title="MY" showBack={false} />

      <Card className="profile">
        <div className="profile__head">
          <span className="profile__avatar">
            <User size={28} aria-hidden="true" />
          </span>
          <div>
            <strong className="profile__name">{profile.nickname}</strong>
            <div>
              <Tag>{profile.role === 'owner' ? '사장님' : '여행자'}</Tag>
            </div>
          </div>
        </div>
        <dl className="profile__stats">
          <div>
            <dt className="sm">누적 캐시백</dt>
            <dd>{formatWon(cumulativeCashback)}</dd>
          </div>
          <div>
            <dt className="sm">스탬프</dt>
            <dd>
              {stamps.length} / {STAMP_SPOTS.length}
            </dd>
          </div>
        </dl>
        {claimedRewards.includes('badge') ? (
          <p className="profile__badge">
            <Award size={16} aria-hidden="true" /> 화천 완주 배지 보유
          </p>
        ) : null}
      </Card>

      <nav className="menu" aria-label="MY 메뉴">
        <MenuRow icon={Receipt} label="내 영수증 내역" onClick={() => push({ name: 'receiptHistory' })} />
        <MenuRow icon={Stamp} label="내 스탬프" onClick={() => switchTab('stamp')} />
        <MenuRow icon={MessagesSquare} label="내 글·댓글" onClick={() => push({ name: 'myPosts' })} />
        <MenuRow icon={Users} label="커뮤니티" onClick={() => push({ name: 'community' })} />
        <MenuRow icon={ShieldCheck} label="개인정보 관리" onClick={() => push({ name: 'personalInfo' })} />
        <MenuRow icon={Bell} label="알림 설정" onClick={() => push({ name: 'notifications' })} />
      </nav>

      {demoOpen ? <DemoPanel /> : null}

      <div className="spacer" />
      <button type="button" className="version" onClick={handleVersionTap} aria-label="버전 정보">
        화천 지역상생 영수증 · 시연 버전
      </button>
    </div>
  );
}
