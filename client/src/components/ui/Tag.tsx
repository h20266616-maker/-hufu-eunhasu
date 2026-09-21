import type { HTMLAttributes } from 'react';

export function Tag({ className, children, ...rest }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={['tag', className].filter(Boolean).join(' ')} {...rest}>
      {children}
    </span>
  );
}
