import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react';

export function Card({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={['card', className].filter(Boolean).join(' ')} {...rest}>
      {children}
    </div>
  );
}

interface CardButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export function CardButton({ className, children, type = 'button', ...rest }: CardButtonProps) {
  return (
    <button type={type} className={['card', 'card--button', className].filter(Boolean).join(' ')} {...rest}>
      {children}
    </button>
  );
}
