import { Lock, LogIn, MessageSquare, PenLine } from 'lucide-react';
import { useMemo, useState } from 'react';
import { PostCard } from '../components/PostCard';
import { ScreenHeader } from '../components/ScreenHeader';
import { Button } from '../components/ui/Button';
import { Chip } from '../components/ui/Chip';
import { SegmentControl } from '../components/ui/SegmentControl';
import { EmptyState } from '../components/ui/StateMessage';
import { useApp } from '../context/AppContext';
import { useNav } from '../context/NavContext';
import { useToast } from '../context/ToastContext';
import { BOARD_CATEGORIES, BOARD_LABELS, OWNER_READONLY_NOTICE } from '../data';
import type { Board } from '../types';

const ALL_CATEGORY = '전체';

const BOARD_OPTIONS: readonly { value: Board; label: string }[] = [
  { value: 'traveler', label: BOARD_LABELS.traveler },
  { value: 'owner', label: BOARD_LABELS.owner },
];

export function CommunityPage({ board = 'traveler' }: { board?: Board }) {
  const { uid, posts, profile } = useApp();
  const { push, replace } = useNav();
  const showToast = useToast();
  const [category, setCategory] = useState(ALL_CATEGORY);

  const loggedIn = uid !== null;
  const ownerLocked = board === 'owner' && profile.role !== 'owner';
  const readOnly = !loggedIn || ownerLocked;

  const visiblePosts = useMemo(
    () =>
      posts
        .filter((post) => post.board === board && (category === ALL_CATEGORY || post.category === category))
        .sort((a, b) => b.createdAt - a.createdAt),
    [posts, board, category],
  );

  const handleBoardChange = (next: Board) => {
    setCategory(ALL_CATEGORY);
    replace({ name: 'community', board: next });
  };

  const handleWrite = () => {
    if (!loggedIn) {
      push({ name: 'login' });
      return;
    }
    if (ownerLocked) {
      showToast(OWNER_READONLY_NOTICE);
      return;
    }
    push({ name: 'postWrite', board });
  };

  return (
    <div className="page">
      <ScreenHeader
        title="커뮤니티"
        showBack={false}
        right={
          <Button
            variant="line"
            className="btn--small"
            icon={readOnly ? <Lock size={16} aria-hidden="true" /> : <PenLine size={16} aria-hidden="true" />}
            onClick={handleWrite}
            aria-label={readOnly ? `글쓰기, 로그인 또는 사장님 인증이 필요해요` : '글쓰기'}
          >
            글쓰기
          </Button>
        }
      />

      <SegmentControl options={BOARD_OPTIONS} value={board} onChange={handleBoardChange} ariaLabel="커뮤니티 종류" />

      {!loggedIn ? (
        <div className="notice" role="note">
          <LogIn size={18} aria-hidden="true" />
          <div>
            <strong>로그인하면 글을 남길 수 있어요</strong>
            <p className="sm">지금은 목록만 읽을 수 있어요.</p>
            <Button variant="line" className="btn--small" onClick={() => push({ name: 'login' })}>
              로그인하기
            </Button>
          </div>
        </div>
      ) : ownerLocked ? (
        <div className="notice" role="note">
          <Lock size={18} aria-hidden="true" />
          <div>
            <strong>{OWNER_READONLY_NOTICE}</strong>
            <p className="sm">지금은 읽기 전용이에요. 사장님 회원으로 전환하면 글과 댓글을 남길 수 있어요.</p>
            <Button variant="line" className="btn--small" onClick={() => push({ name: 'personalInfo' })}>
              회원 유형 바꾸기
            </Button>
          </div>
        </div>
      ) : null}

      <div className="chips" role="group" aria-label="카테고리 필터">
        {[ALL_CATEGORY, ...BOARD_CATEGORIES[board]].map((item) => (
          <Chip key={item} selected={category === item} onClick={() => setCategory(item)}>
            {item}
          </Chip>
        ))}
      </div>

      {visiblePosts.length === 0 ? (
        <EmptyState icon={MessageSquare} title="이 카테고리에는 아직 글이 없어요" description="다른 카테고리를 살펴보세요." />
      ) : (
        <ul className="plain-list">
          {visiblePosts.map((post) => (
            <li key={post.id}>
              <PostCard post={post} onOpen={(postId) => push({ name: 'postDetail', postId })} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
