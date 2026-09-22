import { Lock, LogIn } from 'lucide-react';
import { useNav } from '../context/NavContext';
import { Button } from './ui/Button';

interface AccountRequiredNoticeProps {
  /** true면 게스트 체험 중이라 "회원가입" 문구로, false면 완전 로그아웃 상태라 "로그인" 문구로 안내한다 */
  isGuest: boolean;
  description?: string;
}

/** 커뮤니티 글쓰기·개인정보 관리처럼 실제 계정이 필요한 기능 앞에 붙이는 공통 안내 */
export function AccountRequiredNotice({ isGuest, description }: AccountRequiredNoticeProps) {
  const { push } = useNav();

  return (
    <div className="notice" role="note">
      {isGuest ? <Lock size={18} aria-hidden="true" /> : <LogIn size={18} aria-hidden="true" />}
      <div>
        <strong>{isGuest ? '게스트는 체험만 가능해요' : '로그인이 필요해요'}</strong>
        <p className="sm">{description ?? (isGuest ? '회원가입하면 이 기능을 이용할 수 있어요.' : '이 기능을 쓰려면 먼저 로그인해 주세요.')}</p>
        <Button variant="line" className="btn--small" onClick={() => push({ name: 'login' })}>
          {isGuest ? '회원가입하기' : '로그인하기'}
        </Button>
      </div>
    </div>
  );
}
