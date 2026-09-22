import { Heart, Lock, MessageCircle, Send } from 'lucide-react';
import { useId, useState, type SubmitEvent } from 'react';
import { AccountRequiredNotice } from '../components/AccountRequiredNotice';
import { ScreenHeader } from '../components/ScreenHeader';
import { Button } from '../components/ui/Button';
import { ErrorState } from '../components/ui/StateMessage';
import { Tag } from '../components/ui/Tag';
import { useApp } from '../context/AppContext';
import { useNav } from '../context/NavContext';
import { useToast } from '../context/ToastContext';
import { OWNER_READONLY_NOTICE } from '../data';
import { usePostComments } from '../hooks/usePostComments';
import { formatRelative } from '../utils/format';

const MAX_COMMENT_LENGTH = 200;

export function PostDetailPage({ postId }: { postId: string }) {
  const { uid, isGuest, posts, profile, toggleLike } = useApp();
  const { comments, addComment } = usePostComments(postId, uid);
  const { push, back } = useNav();
  const showToast = useToast();
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const inputId = useId();

  const post = posts.find((item) => item.id === postId);

  if (!post) {
    return (
      <div className="page">
        <ScreenHeader title="게시글" />
        <ErrorState
          title="게시글을 찾을 수 없어요"
          description="삭제되었거나 잘못된 주소예요."
          action={<Button onClick={back}>목록으로 돌아가기</Button>}
        />
      </div>
    );
  }

  const isRealAccount = uid !== null && !isGuest;
  const ownerLocked = post.board === 'owner' && profile.role !== 'owner';
  const readOnly = !isRealAccount || ownerLocked;

  const handleLike = () => {
    if (!isRealAccount) {
      push({ name: 'login' });
      return;
    }
    if (ownerLocked) {
      showToast(OWNER_READONLY_NOTICE);
      return;
    }
    void toggleLike(post.id);
  };

  const handleComment = async (event: SubmitEvent) => {
    event.preventDefault();
    const body = commentText.trim();
    if (body === '' || readOnly) return;
    setSubmitting(true);
    await addComment(body, profile.nickname);
    setSubmitting(false);
    setCommentText('');
  };

  return (
    <div className="page">
      <ScreenHeader title={post.board === 'owner' ? '사장님 커뮤니티' : '여행자 커뮤니티'} />

      <article className="post">
        <Tag>{post.category}</Tag>
        <h2 className="post__title">{post.title}</h2>
        <p className="sm">
          {post.author} · {formatRelative(post.createdAt)}
        </p>
        <p className="post__body">{post.body}</p>
        <button
          type="button"
          className={`like-btn${post.liked ? ' like-btn--on' : ''}`}
          onClick={handleLike}
          aria-pressed={post.liked}
          aria-label={`좋아요 ${post.likes}개`}
        >
          <Heart size={18} aria-hidden="true" fill={post.liked ? 'currentColor' : 'none'} />
          <span>{post.likes}</span>
        </button>
      </article>

      <section aria-labelledby="comments-title">
        <h2 id="comments-title" className="section-title">
          <MessageCircle size={18} aria-hidden="true" /> 댓글 {comments.length}
        </h2>
        {comments.length === 0 ? (
          <p className="sm">아직 댓글이 없어요. 첫 댓글을 남겨보세요.</p>
        ) : (
          <ul className="comment-list">
            {comments.map((comment) => (
              <li key={comment.id} className="comment">
                <div className="sm">
                  <strong>{comment.author}</strong> · {formatRelative(comment.createdAt)}
                </div>
                <p>{comment.body}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {!isRealAccount ? (
        <AccountRequiredNotice
          isGuest={isGuest}
          description={isGuest ? '좋아요와 댓글은 회원가입 후 남길 수 있어요.' : '로그인하면 좋아요와 댓글을 남길 수 있어요.'}
        />
      ) : ownerLocked ? (
        <div className="notice" role="note">
          <Lock size={18} aria-hidden="true" />
          <div>
            <strong>{OWNER_READONLY_NOTICE}</strong>
            <p className="sm">읽기 전용이라 좋아요와 댓글은 사장님 회원만 남길 수 있어요.</p>
          </div>
        </div>
      ) : (
        <form className="comment-form" onSubmit={(event) => void handleComment(event)}>
          <label htmlFor={inputId} className="visually-hidden">
            댓글 입력
          </label>
          <input
            id={inputId}
            className="field__input"
            value={commentText}
            onChange={(event) => setCommentText(event.target.value)}
            placeholder="댓글을 입력하세요"
            maxLength={MAX_COMMENT_LENGTH}
            disabled={submitting}
          />
          <button
            type="submit"
            className="icon-btn icon-btn--primary"
            aria-label="댓글 등록"
            disabled={submitting || commentText.trim() === ''}
          >
            <Send size={20} aria-hidden="true" />
          </button>
        </form>
      )}
    </div>
  );
}
