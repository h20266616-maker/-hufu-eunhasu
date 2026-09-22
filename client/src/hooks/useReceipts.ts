import { addDoc, collection, increment, onSnapshot, orderBy, query, setDoc, doc, where } from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import type { ReceiptCategory, ReceiptRecord, ReceiptSource } from '../types';
import { calcCashback, getEffectiveRate, getTier } from '../utils/cashback';
import { useLatest } from './useLatest';

export interface CommitReceiptInput {
  shop: string;
  amount: number;
  category: ReceiptCategory;
  source: ReceiptSource;
}

/** receipts 컬렉션을 uid로 필터링해 구독하고, 인증 시 receipts 문서 생성 + users 문서 캐시 증액을 함께 한다 */
export function useReceipts(uid: string | null) {
  const [receipts, setReceipts] = useState<ReceiptRecord[]>([]);
  const receiptsRef = useLatest(receipts);

  useEffect(() => {
    if (!uid || !db) {
      setReceipts([]);
      return undefined;
    }
    const q = query(collection(db, 'receipts'), where('uid', '==', uid), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        setReceipts(snap.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<ReceiptRecord, 'id'>) })));
      },
      (error) => console.error('[useReceipts] 영수증 목록을 불러오지 못했어요', error),
    );
    return unsubscribe;
  }, [uid]);

  const commitReceipt = useCallback(
    async (input: CommitReceiptInput, isSoldier: boolean): Promise<ReceiptRecord> => {
      if (!uid || !db) throw new Error('로그인이 필요해요');
      const tier = getTier(receiptsRef.current.length);
      const rate = getEffectiveRate(tier.rate, isSoldier);
      const cashback = calcCashback(input.amount, rate);
      const createdAt = new Date().toISOString();
      try {
        const ref = await addDoc(collection(db, 'receipts'), { uid, ...input, rate, cashback, createdAt });
        await setDoc(
          doc(db, 'users', uid),
          { cash: increment(cashback), cumulativeCashback: increment(cashback) },
          { merge: true },
        );
        return { id: ref.id, ...input, rate, cashback, createdAt };
      } catch (error) {
        console.error('[useReceipts] 영수증 저장에 실패했어요', error);
        throw error;
      }
    },
    [receiptsRef, uid],
  );

  return { receipts, commitReceipt };
}
