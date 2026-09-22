import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  doc,
} from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import type { Board, Post } from '../types';
import { useLatest } from './useLatest';

interface PostDoc {
  board: Board;
  category: string;
  title: string;
  body: string;
  author: string;
  authorUid: string;
  createdAt: number;
  likedBy: string[];
  commentCount: number;
}

export interface NewPostInput {
  board: Board;
  category: string;
  title: string;
  body: string;
  author: string;
}

/** posts 컬렉션을 실시간 구독한다. 로그인하지 않아도 목록은 읽을 수 있다 */
export function useCommunity(uid: string | null) {
  const [posts, setPosts] = useState<Post[]>([]);
  const postsRef = useLatest(posts);

  useEffect(() => {
    if (!db) {
      setPosts([]);
      return undefined;
    }
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      setPosts(
        snap.docs.map((item) => {
          const data = item.data() as PostDoc;
          const likedBy = data.likedBy ?? [];
          return {
            id: item.id,
            board: data.board,
            category: data.category,
            title: data.title,
            body: data.body,
            author: data.author,
            authorUid: data.authorUid,
            createdAt: data.createdAt,
            likes: likedBy.length,
            liked: uid !== null && likedBy.includes(uid),
            commentCount: data.commentCount ?? 0,
            mine: uid !== null && data.authorUid === uid,
          };
        }),
      );
    });
    return unsubscribe;
  }, [uid]);

  const toggleLike = useCallback(
    async (postId: string) => {
      if (!uid || !db) return;
      const post = postsRef.current.find((item) => item.id === postId);
      if (!post) return;
      await updateDoc(doc(db, 'posts', postId), {
        likedBy: post.liked ? arrayRemove(uid) : arrayUnion(uid),
      });
    },
    [postsRef, uid],
  );

  const addPost = useCallback(
    async (input: NewPostInput): Promise<string> => {
      if (!uid || !db) throw new Error('로그인이 필요해요');
      const ref = await addDoc(collection(db, 'posts'), {
        ...input,
        authorUid: uid,
        createdAt: Date.now(),
        likedBy: [],
        commentCount: 0,
      });
      return ref.id;
    },
    [uid],
  );

  return { posts, toggleLike, addPost };
}
