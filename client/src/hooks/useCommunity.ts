import { useCallback } from 'react';
import { SEED_POSTS } from '../data';
import type { Board, Post } from '../types';
import { usePersistentState } from './usePersistentState';

const MINUTE_MS = 60_000;

function buildSeedPosts(): Post[] {
  const now = Date.now();
  return SEED_POSTS.map((seed, postIndex) => ({
    id: `seed-${postIndex}`,
    board: seed.board,
    category: seed.category,
    title: seed.title,
    body: seed.body,
    author: seed.author,
    createdAt: now - seed.minutesAgo * MINUTE_MS,
    likes: seed.likes,
    liked: false,
    mine: false,
    comments: seed.comments.map((comment, commentIndex) => ({
      id: `seed-${postIndex}-comment-${commentIndex}`,
      author: comment.author,
      body: comment.body,
      createdAt: now - comment.minutesAgo * MINUTE_MS,
      mine: false,
    })),
  }));
}

export interface NewPostInput {
  board: Board;
  category: string;
  title: string;
  body: string;
  author: string;
}

export function useCommunity() {
  const [posts, setPosts] = usePersistentState<Post[]>('posts', buildSeedPosts);

  const toggleLike = useCallback(
    (postId: string) => {
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? { ...post, liked: !post.liked, likes: post.likes + (post.liked ? -1 : 1) }
            : post,
        ),
      );
    },
    [setPosts],
  );

  const addComment = useCallback(
    (postId: string, body: string, author: string) => {
      const comment = { id: `comment-${Date.now()}`, author, body, createdAt: Date.now(), mine: true };
      setPosts((prev) =>
        prev.map((post) => (post.id === postId ? { ...post, comments: [...post.comments, comment] } : post)),
      );
    },
    [setPosts],
  );

  const addPost = useCallback(
    (input: NewPostInput): Post => {
      const post: Post = {
        id: `post-${Date.now()}`,
        ...input,
        createdAt: Date.now(),
        likes: 0,
        liked: false,
        comments: [],
        mine: true,
      };
      setPosts((prev) => [post, ...prev]);
      return post;
    },
    [setPosts],
  );

  return { posts, toggleLike, addComment, addPost };
}
