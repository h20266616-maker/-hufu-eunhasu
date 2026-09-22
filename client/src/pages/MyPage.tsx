import {
  Award,
  Bell,
  Compass,
  LogIn,
  LogOut,
  MessagesSquare,
  Receipt,
  Shield,
  ShieldCheck,
  ShoppingBag,
  Stamp,
  User,
  UserX,
  Users,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { DemoPanel } from '../components/DemoPanel';
import { MenuRow } from '../components/MenuRow';
import { ScreenHeader } from '../components/ScreenHeader';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Tag } from '../components/ui/Tag';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useNav } from '../context/NavContext';
import { useToast } from '../context/ToastContext';
import { STAMP_SPOTS } from '../data';
import { formatWon } from '../utils/format';

const DEMO_TAP_COUNT = 5;
const DEMO_TAP_WINDOW_MS = 1200;

export function MyPage() {
  const { uid, isGuest, profile, cumulativeCashback, stamps, claimedRewards } = useApp();
  const { user, signOutUser, deleteAccountMock } = useAuth();
  const { push, switchTab } = useNav();
  const showToast = useToast();
  const [demoOpen, setDemoOpen] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const tapState = useRef({ count: 0, last: 0 });
  const loggedIn = uid !== null;
  const isRealAccount = loggedIn && !isGuest;

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

  const handleSignOut = async () => {
    await signOutUser();
    showToast('로그아웃했어요');
  };

  const handleDeleteAccount = async () => {
    await deleteAccountMock();
    setConfirmingDelete(false);
    showToast('탈퇴 처리했어요 (시연용 mock)');
  };

  return (
    <div className="page">
      <ScreenHeader title="MY" showBack={false} />

      {isGuest ? (
        <Card className="guest-banner">
          <div className="row">
            <div>
              <span className="guest-banner__tag">
                <Compass size={14} aria-hidden="true" /> 게스트로 체험 중입니다
              </span>
              <p className="sm">지금 쌓은 캐시·스탬프는 회원가입해야 계속 가져갈 수 있어요.</p>
            </div>
          </div>
          <Button icon={<LogIn size={16} aria-hidden="true" />} onClick={() => push({ name: 'login' })}>
            로그인 / 회원가입
          </Button>
        </Card>
      ) : null}

      {loggedIn ? (
        <Card className="profile">
          <div className="profile__head">
            <span className="profile__avatar">
              <User size={28} aria-hidden="true" />
            </span>
            <div>
              <strong className="profile__name">{profile.nickname}</strong>
              <div className="profile__badges">
                <Tag>{isGuest ? '게스트' : profile.role === 'owner' ? '사장님' : '여행자'}</Tag>
                {profile.soldierVerified ? (
                  <Tag>
                    <Shield size={12} aria-hidden="true" /> 군인 인증
                  </Tag>
                ) : null}
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
      ) : (
        <Card className="row">
          <div>
            <strong>로그인이 필요해요</strong>
            <div className="sm">{user?.email ? '다시 로그인해 주세요' : '내 정보와 캐시백을 보려면 로그인하세요'}</div>
          </div>
          <Button className="btn--small" icon={<LogIn size={16} aria-hidden="true" />} onClick={() => push({ name: 'login' })}>
            로그인
          </Button>
        </Card>
      )}

      <nav className="menu" aria-label="MY 메뉴">
        <MenuRow icon={ShoppingBag} label="특산물 상점" onClick={() => push({ name: 'shop' })} />
        <MenuRow icon={Users} label="커뮤니티" onClick={() => push({ name: 'community' })} />
        {loggedIn ? (
          <>
            <MenuRow icon={Receipt} label="내 영수증 내역" onClick={() => push({ name: 'receiptHistory' })} />
            <MenuRow icon={Stamp} label="내 스탬프" onClick={() => switchTab('stamp')} />
            <MenuRow icon={MessagesSquare} label="내 글·댓글" onClick={() => push({ name: 'myPosts' })} />
            <MenuRow icon={ShieldCheck} label="개인정보 관리" onClick={() => push({ name: 'personalInfo' })} />
            <MenuRow icon={Bell} label="알림 설정" onClick={() => push({ name: 'notifications' })} />
          </>
        ) : null}
      </nav>

      {isRealAccount ? (
        <nav className="menu" aria-label="계정 관리">
          <MenuRow icon={LogOut} label="로그아웃" onClick={() => void handleSignOut()} />
          <MenuRow icon={UserX} label="회원탈퇴" onClick={() => setConfirmingDelete(true)} />
        </nav>
      ) : null}

      {confirmingDelete ? (
        <Card>
          <strong>정말 탈퇴할까요?</strong>
          <p className="sm">시연용 mock이라 실제 데이터는 지워지지 않고 로그아웃돼요.</p>
          <div className="btn-pair">
            <Button variant="line" onClick={() => setConfirmingDelete(false)}>
              취소
            </Button>
            <Button onClick={() => void handleDeleteAccount()}>탈퇴하기</Button>
          </div>
        </Card>
      ) : null}

      {demoOpen ? <DemoPanel /> : null}

      <div className="spacer" />
      <button type="button" className="version" onClick={handleVersionTap} aria-label="버전 정보">
        화천 지역상생 영수증 · 시연 버전
      </button>
    </div>
  );
}
