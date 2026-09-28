import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { usePersistentState } from '../hooks/usePersistentState';

interface AccessibilityContextValue {
  largeText: boolean;
  setLargeText: (next: boolean) => void;
}

const AccessibilityContext = createContext<AccessibilityContextValue | null>(null);

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [largeText, setLargeText] = usePersistentState('large-text', () => false);

  // 게스트를 포함해 앱 전체(탭바 포함)에 적용돼야 해서 html 자체에 속성을 건다.
  // 이 프로토타입은 폰트 크기를 px로 고정해 둔 곳이 많아, 일반 font-size 확대는
  // 화면 곳곳에 적용되지 않는다. zoom은 뷰포트 자체를 다시 계산해서 레이아웃이
  // 깨지지 않으면서 글자·아이콘·버튼이 함께 커진다.
  useEffect(() => {
    document.documentElement.dataset.textScale = largeText ? 'large' : '';
  }, [largeText]);

  return (
    <AccessibilityContext.Provider value={{ largeText, setLargeText }}>{children}</AccessibilityContext.Provider>
  );
}

export function useAccessibility(): AccessibilityContextValue {
  const value = useContext(AccessibilityContext);
  if (!value) throw new Error('useAccessibility는 AccessibilityProvider 안에서만 사용할 수 있어요');
  return value;
}
