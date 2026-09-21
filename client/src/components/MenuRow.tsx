import { ChevronRight, type LucideIcon } from 'lucide-react';

interface MenuRowProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}

export function MenuRow({ icon: Icon, label, onClick }: MenuRowProps) {
  return (
    <button type="button" className="menu-row" onClick={onClick}>
      <Icon size={20} aria-hidden="true" />
      <span>{label}</span>
      <ChevronRight size={18} aria-hidden="true" />
    </button>
  );
}
