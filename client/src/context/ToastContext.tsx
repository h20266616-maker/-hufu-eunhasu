import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

const TOAST_DURATION_MS = 2000;

type ShowToast = (message: string) => void;

const ToastContext = createContext<ShowToast | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState('');
  const [visible, setVisible] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  const show = useCallback<ShowToast>((next) => {
    window.clearTimeout(timer.current);
    setMessage(next);
    setVisible(true);
    timer.current = window.setTimeout(() => setVisible(false), TOAST_DURATION_MS);
  }, []);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className={`toast${visible ? ' toast--on' : ''}`} role="status" aria-live="polite">
        {message}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ShowToast {
  const value = useContext(ToastContext);
  if (!value) throw new Error('useToast는 ToastProvider 안에서만 사용할 수 있어요');
  return value;
}
