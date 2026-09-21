import {
  Apple,
  Bike,
  CupSoda,
  Fish,
  Landmark,
  Mountain,
  Route,
  Sailboat,
  Store,
  Trees,
  UtensilsCrossed,
  Waves,
  type LucideIcon,
  type LucideProps,
} from 'lucide-react';
import type { IconKey } from '../types';

const ICONS: Record<IconKey, LucideIcon> = {
  island: Trees,
  fish: Fish,
  lake: Waves,
  dam: Landmark,
  valley: Mountain,
  bridge: Route,
  market: Store,
  boat: Sailboat,
  restaurant: UtensilsCrossed,
  bike: Bike,
  produce: Apple,
  drink: CupSoda,
};

interface AppIconProps extends LucideProps {
  name: IconKey;
}

export function AppIcon({ name, ...props }: AppIconProps) {
  const Icon = ICONS[name];
  return <Icon aria-hidden="true" {...props} />;
}
