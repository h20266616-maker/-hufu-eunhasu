import { useEffect, useRef, useState, type RefObject } from 'react';

const HIDE_THRESHOLD_PX = 6;

/** 아래로 스크롤하면 숨기고 위로 올리면 보인다. resetKey가 바뀌면(탭 전환 등) 즉시 다시 보인다 */
export function useTabBarVisibility(scrollRef: RefObject<HTMLElement | null>, resetKey: unknown): boolean {
  const [hidden, setHidden] = useState(false);
  const lastTop = useRef(0);

  useEffect(() => {
    setHidden(false);
    lastTop.current = scrollRef.current?.scrollTop ?? 0;
    // resetKey가 바뀔 때만 다시 보이게 하면 된다. scrollRef는 마운트 동안 같은 노드를 가리킨다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return undefined;
    const handleScroll = () => {
      const top = el.scrollTop;
      const delta = top - lastTop.current;
      if (top <= 0) {
        setHidden(false);
      } else if (delta > HIDE_THRESHOLD_PX) {
        setHidden(true);
      } else if (delta < -HIDE_THRESHOLD_PX) {
        setHidden(false);
      }
      if (Math.abs(delta) > HIDE_THRESHOLD_PX) lastTop.current = top;
    };
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [scrollRef]);

  return hidden;
}
