import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'line' | 'ghost';
  icon?: ReactNode;
}

export function Button({ variant = 'primary', icon, className, children, type = 'button', ...rest }: ButtonProps) {
  const classes = ['btn', `btn--${variant}`, className].filter(Boolean).join(' ');
  return (
    <button type={type} className={classes} {...rest}>
      {icon}
      <span>{children}</span>
    </button>
  );
}
