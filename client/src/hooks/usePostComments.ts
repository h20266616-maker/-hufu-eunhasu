import { addDoc, collection, doc, increment, onSnapshot, orderBy, query, setDoc } from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import type { Comment } from '../types';

interface CommentDoc {
  author: string;
  authorUid: string;
  body: string;
  createdAt: number;
}

/** posts/{postId}/comments 하위 컬렉션을 구독한다 */
export function usePostComments(postId: string, uid: string | null) {
  const [comments, setComments] = useState<Comment[]>([]);

  useEffect(() => {
    if (!db) {
      setComments([]);
      return undefined;
    }
    const q = query(collection(db, 'posts', postId, 'comments'), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        setComments(
          snap.docs.map((item) => {
            const data = item.data() as CommentDoc;
            return {
              id: item.id,
              postId,
              author: data.author,
              authorUid: data.authorUid,
              body: data.body,
              createdAt: data.createdAt,
              mine: uid !== null && data.authorUid === uid,
            };
          }),
        );
      },
      (error) => console.error('[usePostComments] 댓글을 불러오지 못했어요', error),
    );
    return unsubscribe;
  }, [postId, uid]);

  const addComment = useCallback(
    async (body: string, author: string) => {
      if (!uid || !db) throw new Error('로그인이 필요해요');
      try {
        await addDoc(collection(db, 'posts', postId, 'comments'), {
          author,
          authorUid: uid,
          body,
          createdAt: Date.now(),
        });
        await setDoc(doc(db, 'posts', postId), { commentCount: increment(1) }, { merge: true });
      } catch (error) {
        console.error('[usePostComments] 댓글 작성에 실패했어요', error);
        throw error;
      }
    },
    [postId, uid],
  );

  return { comments, addComment };
}
