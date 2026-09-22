import { useEffect, useRef } from 'react';
import { useNav } from '../context/NavContext';
import { useTabBarVisibility } from '../hooks/useTabBarVisibility';
import { Router } from './Router';
import { TabBar } from './TabBar';

export function AppShell() {
  const { route, entryKey } = useNav();
  const scrollRef = useRef<HTMLElement>(null);
  const showTabBar = route.name !== 'landing' && route.name !== 'login';
  const tabBarHidden = useTabBarVisibility(scrollRef, entryKey);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [entryKey, route.name]);

  return (
    <>
      <main ref={scrollRef} className={`app-scroll${showTabBar ? ' app-scroll--tabbar' : ''}`}>
        <Router key={entryKey} route={route} />
      </main>
      {showTabBar ? <TabBar hidden={tabBarHidden} /> : null}
    </>
  );
}
