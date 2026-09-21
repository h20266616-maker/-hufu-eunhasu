import type { ButtonHTMLAttributes } from 'react';

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
}

export function Chip({ selected = false, className, children, type = 'button', ...rest }: ChipProps) {
  return (
    <button
      type={type}
      className={['chip', selected ? 'chip--on' : '', className].filter(Boolean).join(' ')}
      aria-pressed={selected}
      {...rest}
    >
      {children}
    </button>
  );
}
