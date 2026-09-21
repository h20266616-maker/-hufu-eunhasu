import type { ReactNode } from 'react';

export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="stage">
      <div className="frame">{children}</div>
    </div>
  );
}
