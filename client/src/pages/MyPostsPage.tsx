import { MessageSquare } from 'lucide-react';
import { useMemo } from 'react';
import { AccountRequiredNotice } from '../components/AccountRequiredNotice';
import { PostCard } from '../components/PostCard';
import { ScreenHeader } from '../components/ScreenHeader';
import { Button } from '../components/ui/Button';
import { CardButton } from '../components/ui/Card';
import { EmptyState } from '../components/ui/StateMessage';
import { useApp } from '../context/AppContext';
import { useNav } from '../context/NavContext';
import { useMyComments } from '../hooks/useMyComments';
import { formatRelative } from '../utils/format';

export function MyPostsPage() {
  const { uid, isGuest, posts } = useApp();
  const { push } = useNav();
  const isRealAccount = uid !== null && !isGuest;
  const myComments = useMyComments(isRealAccount ? uid : null);

  const myPosts = useMemo(() => posts.filter((post) => post.mine).sort((a, b) => b.createdAt - a.createdAt), [posts]);

  const openPost = (postId: string) => push({ name: 'postDetail', postId });

  if (!isRealAccount) {
    return (
      <div className="page">
        <ScreenHeader title="내 글·댓글" />
        <AccountRequiredNotice isGuest={isGuest} description="내 글·댓글은 실제 계정으로 로그인한 뒤에 볼 수 있어요." />
      </div>
    );
  }

  return (
    <div className="page">
      <ScreenHeader title="내 글·댓글" />

      <section aria-labelledby="my-posts-title">
        <h2 id="my-posts-title" className="section-title">
          내가 쓴 글
        </h2>
        {myPosts.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="아직 쓴 글이 없어요"
            description="커뮤니티에서 첫 글을 남겨보세요."
            action={<Button onClick={() => push({ name: 'community' })}>커뮤니티 가기</Button>}
          />
        ) : (
          myPosts.map((post) => <PostCard key={post.id} post={post} onOpen={openPost} />)
        )}
      </section>

      <section aria-labelledby="my-comments-title">
        <h2 id="my-comments-title" className="section-title">
          내가 쓴 댓글
        </h2>
        {myComments.length === 0 ? (
          <p className="sm">아직 남긴 댓글이 없어요.</p>
        ) : (
          myComments.map((comment) => (
            <CardButton key={comment.id} onClick={() => openPost(comment.postId)} aria-label="댓글을 남긴 게시글 열기">
              <strong>{comment.body}</strong>
              <div className="sm">{formatRelative(comment.createdAt)}</div>
            </CardButton>
          ))
        )}
      </section>
    </div>
  );
}
