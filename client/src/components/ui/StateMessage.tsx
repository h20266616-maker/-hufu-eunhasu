import { AlertTriangle, Inbox, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface StateMessageProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  tone?: 'empty' | 'error';
}

function StateMessage({ icon, title, description, action, tone = 'empty' }: StateMessageProps) {
  const Icon = icon ?? (tone === 'error' ? AlertTriangle : Inbox);
  return (
    <div className={`state state--${tone}`} role={tone === 'error' ? 'alert' : undefined}>
      <span className="state__icon">
        <Icon size={26} aria-hidden="true" />
      </span>
      <strong className="state__title">{title}</strong>
      {description ? <p className="state__desc">{description}</p> : null}
      {action}
    </div>
  );
}

export function EmptyState(props: Omit<StateMessageProps, 'tone'>) {
  return <StateMessage {...props} tone="empty" />;
}

export function ErrorState(props: Omit<StateMessageProps, 'tone'>) {
  return <StateMessage {...props} tone="error" />;
}
