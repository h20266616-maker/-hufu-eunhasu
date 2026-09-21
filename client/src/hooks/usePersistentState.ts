import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';

const STORAGE_PREFIX = 'hc:v2:';

export function usePersistentState<T>(key: string, createInitial: () => T): [T, Dispatch<SetStateAction<T>>] {
  const storageKey = STORAGE_PREFIX + key;

  const [state, setState] = useState<T>(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      return raw === null ? createInitial() : (JSON.parse(raw) as T);
    } catch {
      return createInitial();
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(state));
    } catch {
      // 저장 공간 부족·사생활 보호 모드에서는 메모리 상태만 유지한다
    }
  }, [storageKey, state]);

  return [state, setState];
}

export function clearPersistedState(): void {
  try {
    const keys: string[] = [];
    for (let i = 0; i < window.localStorage.length; i += 1) {
      const key = window.localStorage.key(i);
      if (key?.startsWith(STORAGE_PREFIX)) keys.push(key);
    }
    keys.forEach((key) => window.localStorage.removeItem(key));
  } catch {
    // 무시
  }
}
