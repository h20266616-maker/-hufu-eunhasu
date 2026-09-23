import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import type { Route, TabId } from '../types';

interface NavEntry {
  key: number;
  route: Route;
  tab: TabId;
}

interface NavContextValue {
  route: Route;
  tab: TabId;
  entryKey: number;
  canGoBack: boolean;
  push: (route: Route) => void;
  replace: (route: Route) => void;
  back: () => void;
  switchTab: (tab: TabId) => void;
  reset: (route: Route, tab: TabId) => void;
}

const TAB_ROOTS: Record<TabId, Route> = {
  receipt: { name: 'receipt' },
  map: { name: 'map' },
  shop: { name: 'shop' },
  stamp: { name: 'stamp' },
  community: { name: 'community' },
  my: { name: 'my' },
};

const NavContext = createContext<NavContextValue | null>(null);

export function NavProvider({ children }: { children: ReactNode }) {
  const nextKey = useRef(1);
  const createEntry = useCallback((route: Route, tab: TabId): NavEntry => {
    nextKey.current += 1;
    return { key: nextKey.current, route, tab };
  }, []);

  const [stack, setStack] = useState<NavEntry[]>(() => [{ key: 1, route: { name: 'landing' }, tab: 'receipt' }]);

  const push = useCallback(
    (route: Route) =>
      setStack((prev) => [...prev, createEntry(route, prev[prev.length - 1]?.tab ?? 'receipt')]),
    [createEntry],
  );

  const replace = useCallback(
    (route: Route) =>
      setStack((prev) => {
        const top = prev[prev.length - 1];
        if (!top) return prev;
        return [...prev.slice(0, -1), { ...top, route }];
      }),
    [],
  );

  const back = useCallback(() => setStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev)), []);

  const switchTab = useCallback(
    (tab: TabId) => setStack([createEntry(TAB_ROOTS[tab], tab)]),
    [createEntry],
  );

  const reset = useCallback(
    (route: Route, tab: TabId) => setStack([createEntry(route, tab)]),
    [createEntry],
  );

  const value = useMemo<NavContextValue>(() => {
    const top = stack[stack.length - 1] ?? { key: 1, route: { name: 'landing' } as Route, tab: 'receipt' as TabId };
    return {
      route: top.route,
      tab: top.tab,
      entryKey: top.key,
      canGoBack: stack.length > 1,
      push,
      replace,
      back,
      switchTab,
      reset,
    };
  }, [stack, push, replace, back, switchTab, reset]);

  return <NavContext.Provider value={value}>{children}</NavContext.Provider>;
}

export function useNav(): NavContextValue {
  const value = useContext(NavContext);
  if (!value) throw new Error('useNav는 NavProvider 안에서만 사용할 수 있어요');
  return value;
}
