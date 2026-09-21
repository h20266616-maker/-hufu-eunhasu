import { useCallback, useMemo } from 'react';
import type { ReceiptCategory, ReceiptRecord, ReceiptSource } from '../types';
import { calcCashback, getNextTier, getTier } from '../utils/cashback';
import { useLatest } from './useLatest';
import { usePersistentState } from './usePersistentState';

export interface CommitReceiptInput {
  shop: string;
  amount: number;
  category: ReceiptCategory;
  source: ReceiptSource;
}

export function useWallet() {
  const [cash, setCash] = usePersistentState<number>('cash', () => 0);
  const [receipts, setReceipts] = usePersistentState<ReceiptRecord[]>('receipts', () => []);
  const cashRef = useLatest(cash);
  const receiptsRef = useLatest(receipts);

  const getReceiptCount = useCallback(() => receiptsRef.current.length, [receiptsRef]);

  const commitReceipt = useCallback(
    (input: CommitReceiptInput): ReceiptRecord => {
      const tier = getTier(receiptsRef.current.length);
      const cashback = calcCashback(input.amount, tier.rate);
      const record: ReceiptRecord = {
        id: `receipt-${Date.now()}`,
        shop: input.shop,
        amount: input.amount,
        category: input.category,
        source: input.source,
        rate: tier.rate,
        cashback,
        createdAt: new Date().toISOString(),
      };
      setReceipts((prev) => [record, ...prev]);
      setCash((prev) => prev + cashback);
      return record;
    },
    [receiptsRef, setCash, setReceipts],
  );

  const addCash = useCallback((amount: number) => setCash((prev) => prev + amount), [setCash]);

  const spendCash = useCallback(
    (price: number): boolean => {
      if (cashRef.current < price) return false;
      setCash((prev) => prev - price);
      return true;
    },
    [cashRef, setCash],
  );

  const derived = useMemo(
    () => ({
      cumulativeCashback: receipts.reduce((sum, receipt) => sum + receipt.cashback, 0),
      currentTier: getTier(receipts.length),
      nextTier: getNextTier(receipts.length),
    }),
    [receipts],
  );

  return { cash, receipts, ...derived, getReceiptCount, commitReceipt, addCash, spendCash };
}
