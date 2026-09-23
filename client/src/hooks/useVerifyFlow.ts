import { useCallback, useEffect, useRef, useState } from 'react';
import { useApp, type VerifyInput } from '../context/AppContext';
import { useNav } from '../context/NavContext';

export type VerifyStatus = 'idle' | 'loading' | 'error';

const UNKNOWN_ERROR_MESSAGE = '인증 중 문제가 생겼어요. 잠시 후 다시 시도해 주세요.';

export function useVerifyFlow() {
  const { verify } = useApp();
  const { replace } = useNav();
  const [status, setStatus] = useState<VerifyStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const submit = useCallback(
    async (input: VerifyInput) => {
      setStatus('loading');
      setErrorMessage(null);
      try {
        const outcome = await verify(input);
        if (!mounted.current) return;
        if (outcome.ok) {
          replace({
            name: 'verifyResult',
            receipt: outcome.receipt,
            stampId: outcome.stamp?.id ?? null,
            rewardIds: outcome.unlockedRewardIds,
          });
          return;
        }
        setStatus('error');
        setErrorMessage(outcome.message);
      } catch (error) {
        console.error('[useVerifyFlow] 인증 요청 중 예상치 못한 오류가 발생했어요', error);
        if (!mounted.current) return;
        setStatus('error');
        setErrorMessage(UNKNOWN_ERROR_MESSAGE);
      }
    },
    [replace, verify],
  );

  const reset = useCallback(() => {
    setStatus('idle');
    setErrorMessage(null);
  }, []);

  return { status, errorMessage, submit, reset };
}
