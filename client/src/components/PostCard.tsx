import { Heart, MessageCircle } from 'lucide-react';
import type { Post } from '../types';
import { formatRelative } from '../utils/format';
import { CardButton } from './ui/Card';
import { Tag } from './ui/Tag';

interface PostCardProps {
  post: Post;
  onOpen: (postId: string) => void;
}

export function PostCard({ post, onOpen }: PostCardProps) {
  return (
    <CardButton className="post-card" onClick={() => onOpen(post.id)} aria-label={`${post.title} 게시글 열기`}>
      <Tag>{post.category}</Tag>
      <strong className="post-card__title">{post.title}</strong>
      <p className="post-card__preview">{post.body}</p>
      <div className="post-card__meta">
        <span>
          {post.author} · {formatRelative(post.createdAt)}
        </span>
        <span className="post-card__counts">
          <span aria-label={`좋아요 ${post.likes}개`}>
            <Heart size={14} aria-hidden="true" fill={post.liked ? 'currentColor' : 'none'} /> {post.likes}
          </span>
          <span aria-label={`댓글 ${post.commentCount}개`}>
            <MessageCircle size={14} aria-hidden="true" /> {post.commentCount}
          </span>
        </span>
      </div>
    </CardButton>
  );
}
