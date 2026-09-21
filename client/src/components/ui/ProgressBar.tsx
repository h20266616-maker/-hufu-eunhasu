interface ProgressBarProps {
  value: number;
  max: number;
  label: string;
  tone?: 'default' | 'onBrand';
}

export function ProgressBar({ value, max, label, tone = 'default' }: ProgressBarProps) {
  const percent = max <= 0 ? 0 : Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div
      className={`bar${tone === 'onBrand' ? ' bar--on-brand' : ''}`}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.min(value, max)}
    >
      <i style={{ width: `${percent}%` }} />
    </div>
  );
}
