import { collectionGroup, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import type { Comment } from '../types';

interface CommentDoc {
  author: string;
  authorUid: string;
  body: string;
  createdAt: number;
}

/** posts/*​/comments 하위 컬렉션을 collectionGroup으로 모아 내가 쓴 댓글만 가져온다.
 *  Firestore 콘솔에서 comments 컬렉션 그룹에 (authorUid asc, createdAt desc) 복합 색인이 필요해요. */
export function useMyComments(uid: string | null) {
  const [comments, setComments] = useState<Comment[]>([]);

  useEffect(() => {
    if (!uid || !db) {
      setComments([]);
      return undefined;
    }
    const q = query(collectionGroup(db, 'comments'), where('authorUid', '==', uid), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        setComments(
          snap.docs.map((item) => {
            const data = item.data() as CommentDoc;
            const postId = item.ref.parent.parent?.id ?? '';
            return {
              id: item.id,
              postId,
              author: data.author,
              authorUid: data.authorUid,
              body: data.body,
              createdAt: data.createdAt,
              mine: true,
            };
          }),
        );
      },
      (error) => console.error('[useMyComments] 내 댓글을 불러오지 못했어요', error),
    );
    return unsubscribe;
  }, [uid]);

  return comments;
}
