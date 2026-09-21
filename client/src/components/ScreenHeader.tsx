import { ChevronLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import { useNav } from '../context/NavContext';

interface ScreenHeaderProps {
  title: string;
  showBack?: boolean;
  right?: ReactNode;
}

export function ScreenHeader({ title, showBack = true, right }: ScreenHeaderProps) {
  const { back } = useNav();
  return (
    <header className="hdr">
      {showBack ? (
        <button type="button" className="icon-btn" onClick={back} aria-label="뒤로 가기">
          <ChevronLeft size={24} aria-hidden="true" />
        </button>
      ) : null}
      <h1 className="hdr__title">{title}</h1>
      {right ? <div className="hdr__right">{right}</div> : null}
    </header>
  );
}
