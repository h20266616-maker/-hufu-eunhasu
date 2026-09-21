import { Heart, Lock, MessageCircle, Send } from 'lucide-react';
import { useId, useState, type SubmitEvent } from 'react';
import { ScreenHeader } from '../components/ScreenHeader';
import { Button } from '../components/ui/Button';
import { ErrorState } from '../components/ui/StateMessage';
import { Tag } from '../components/ui/Tag';
import { useApp } from '../context/AppContext';
import { useNav } from '../context/NavContext';
import { useToast } from '../context/ToastContext';
import { OWNER_READONLY_NOTICE } from '../data';
import { formatRelative } from '../utils/format';

const MAX_COMMENT_LENGTH = 200;

export function PostDetailPage({ postId }: { postId: string }) {
  const { posts, profile, toggleLike, addComment } = useApp();
  const { back } = useNav();
  const showToast = useToast();
  const [commentText, setCommentText] = useState('');
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

  const readOnly = post.board === 'owner' && profile.role !== 'owner';

  const handleLike = () => {
    if (readOnly) {
      showToast(OWNER_READONLY_NOTICE);
      return;
    }
    toggleLike(post.id);
  };

  const handleComment = (event: SubmitEvent) => {
    event.preventDefault();
    const body = commentText.trim();
    if (body === '') return;
    addComment(post.id, body, profile.nickname);
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
          <MessageCircle size={18} aria-hidden="true" /> 댓글 {post.comments.length}
        </h2>
        {post.comments.length === 0 ? (
          <p className="sm">아직 댓글이 없어요. 첫 댓글을 남겨보세요.</p>
        ) : (
          <ul className="comment-list">
            {post.comments.map((comment) => (
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

      {readOnly ? (
        <div className="notice" role="note">
          <Lock size={18} aria-hidden="true" />
          <div>
            <strong>{OWNER_READONLY_NOTICE}</strong>
            <p className="sm">읽기 전용이라 좋아요와 댓글은 사장님 회원만 남길 수 있어요.</p>
          </div>
        </div>
      ) : (
        <form className="comment-form" onSubmit={handleComment}>
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
          />
          <button type="submit" className="icon-btn icon-btn--primary" aria-label="댓글 등록" disabled={commentText.trim() === ''}>
            <Send size={20} aria-hidden="true" />
          </button>
        </form>
      )}
    </div>
  );
}
