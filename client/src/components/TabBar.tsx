import { Map as MapIcon, MessageCircle, Receipt, ShoppingBag, Stamp, User, type LucideIcon } from 'lucide-react';
import { useNav } from '../context/NavContext';
import type { TabId } from '../types';

interface TabItem {
  id: TabId;
  label: string;
  Icon: LucideIcon;
}

const TABS: readonly TabItem[] = [
  { id: 'receipt', label: '영수증 인증', Icon: Receipt },
  { id: 'map', label: '지도·자전거', Icon: MapIcon },
  { id: 'shop', label: '특산물 상점', Icon: ShoppingBag },
  { id: 'stamp', label: '스탬프', Icon: Stamp },
  { id: 'community', label: '커뮤니티', Icon: MessageCircle },
  { id: 'my', label: 'MY', Icon: User },
];

export function TabBar({ hidden }: { hidden: boolean }) {
  const { tab, switchTab } = useNav();
  return (
    <nav className={`tabbar${hidden ? ' tabbar--hidden' : ''}`} aria-label="주요 메뉴">
      {TABS.map(({ id, label, Icon }) => {
        const active = id === tab;
        return (
          <button
            key={id}
            type="button"
            className={`tabbar__item${active ? ' tabbar__item--on' : ''}`}
            aria-current={active ? 'page' : undefined}
            onClick={() => switchTab(id)}
          >
            <Icon size={22} strokeWidth={active ? 2.6 : 2} aria-hidden="true" />
            <span>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
