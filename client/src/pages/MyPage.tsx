import {
  Award,
  Bell,
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
import { CashbackBreakdown } from '../components/CashbackBreakdown';
import { DemoPanel } from '../components/DemoPanel';
import { GuestDemoCard } from '../components/GuestDemoCard';
import { MenuRow } from '../components/MenuRow';
import { ScreenHeader } from '../components/ScreenHeader';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Tag } from '../components/ui/Tag';
import { Toggle } from '../components/ui/Toggle';
import { useAccessibility } from '../context/AccessibilityContext';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useNav } from '../context/NavContext';
import { useToast } from '../context/ToastContext';
import { OWNER_MONTHLY_STATS, SOLDIER_CASHBACK_MULTIPLIER, STAMP_SPOTS } from '../data';

const DEMO_TAP_COUNT = 5;
const DEMO_TAP_WINDOW_MS = 1200;

export function MyPage() {
  const { uid, isGuest, profile, currentCashback, totalCashback, usedCashback, stamps, claimedRewards } = useApp();
  const { largeText, setLargeText } = useAccessibility();
  const { user, signOutUser, deleteAccountMock } = useAuth();
  const { push, switchTab } = useNav();
  const showToast = useToast();
  const [demoOpen, setDemoOpen] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const tapState = useRef({ count: 0, last: 0 });
  const loggedIn = uid !== null;

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
    showToast(isGuest ? '체험 세션을 종료했어요. 다음에 들어오면 새 체험 계정으로 시작해요' : '로그아웃했어요');
  };

  const handleDeleteAccount = async () => {
    await deleteAccountMock();
    setConfirmingDelete(false);
    showToast(isGuest ? '체험 계정을 종료했어요' : '탈퇴 처리했어요 (시연용 mock)');
  };

  return (
    <div className="page">
      <ScreenHeader title="MY" showBack={false} />

      {profile.role === 'owner' ? (
        <Card className="owner-stats">
          <strong>이번 달 우리 가게</strong>
          <div className="owner-stats__grid">
            <div>
              <strong>{OWNER_MONTHLY_STATS.receiptCount}건</strong>
              <span className="sm">영수증 인증</span>
            </div>
            <div>
              <strong>{OWNER_MONTHLY_STATS.newVisitorCount}명</strong>
              <span className="sm">신규 방문자</span>
            </div>
            <div>
              <strong>{OWNER_MONTHLY_STATS.cashUsedCount}건</strong>
              <span className="sm">캐시백 사용</span>
            </div>
          </div>
          <p className="sm">시연용 예시 숫자예요.</p>
        </Card>
      ) : null}

      {isGuest ? <GuestDemoCard /> : null}

      {loggedIn ? (
        <Card className="profile">
          <div className="profile__head">
            <span className="profile__avatar">
              <User size={28} aria-hidden="true" />
            </span>
            <div>
              <strong className="profile__name">{profile.nickname}</strong>
              <div className="profile__badges">
                <Tag>{isGuest ? '체험 계정' : profile.role === 'owner' ? '사장님' : '여행자'}</Tag>
                {profile.soldierVerified ? (
                  <Tag className="tag--soldier">
                    <Shield size={12} aria-hidden="true" /> 군인 인증
                  </Tag>
                ) : null}
              </div>
            </div>
          </div>
          {isGuest ? (
            <button type="button" className="link-btn" onClick={() => push({ name: 'login' })}>
              정식 회원가입하기 (지금 데이터 그대로 이어져요)
            </button>
          ) : null}
          <CashbackBreakdown total={totalCashback} current={currentCashback} used={usedCashback} />
          <div className="row">
            <strong className="sm">스탬프</strong>
            <Tag>
              {stamps.length} / {STAMP_SPOTS.length}
            </Tag>
          </div>
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

      {loggedIn ? (
        <Card className="soldier-card">
          <div className="row">
            <strong>군인 인증</strong>
            {profile.soldierVerified ? (
              <Tag className="tag--soldier">
                <ShieldCheck size={12} aria-hidden="true" /> 인증됨
              </Tag>
            ) : null}
          </div>
          {profile.soldierVerified ? (
            <div className="sm">
              {profile.soldierUnit} · 전역예정일 {profile.soldierDischargeDate}
            </div>
          ) : (
            <>
              <p className="sm">
                군 장병이면 캐시백 {SOLDIER_CASHBACK_MULTIPLIER}배를 받고, 스탬프 5개를 모으면 군인 전용 쿠폰도 받을 수 있어요.
              </p>
              <Button onClick={() => push({ name: 'soldierVerify' })}>군인 인증하기</Button>
            </>
          )}
        </Card>
      ) : null}

      <nav className="menu" aria-label="MY 메뉴">
        <MenuRow icon={ShoppingBag} label="온라인 상점" onClick={() => switchTab('shop')} />
        <MenuRow icon={Users} label="커뮤니티" onClick={() => switchTab('community')} />
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

      <Card className="row">
        <div>
          <strong>큰 글씨</strong>
          <div className="sm">글자와 아이콘을 더 크게 보여드려요</div>
        </div>
        <Toggle checked={largeText} onChange={setLargeText} label="큰 글씨 모드" />
      </Card>

      {loggedIn ? (
        <nav className="menu" aria-label="계정 관리">
          <MenuRow icon={LogOut} label="로그아웃" onClick={() => void handleSignOut()} />
          <MenuRow icon={UserX} label={isGuest ? '체험 계정 종료' : '회원탈퇴'} onClick={() => setConfirmingDelete(true)} />
        </nav>
      ) : null}

      {confirmingDelete ? (
        <Card>
          <strong>{isGuest ? '정말 체험 계정을 종료할까요?' : '정말 탈퇴할까요?'}</strong>
          <p className="sm">
            {isGuest
              ? '지금 세션에서 로그아웃돼요. 다음에 들어오면 새 체험 계정으로 다시 시작해요.'
              : '시연용 mock이라 실제 데이터는 지워지지 않고 로그아웃돼요.'}
          </p>
          <div className="btn-pair">
            <Button variant="line" onClick={() => setConfirmingDelete(false)}>
              취소
            </Button>
            <Button onClick={() => void handleDeleteAccount()}>{isGuest ? '종료하기' : '탈퇴하기'}</Button>
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
