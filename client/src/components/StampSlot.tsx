import { motion, useReducedMotion } from 'motion/react';
import type { StampRecord, StampSpot } from '../types';
import { formatShortDate } from '../utils/format';
import { AppIcon } from './AppIcon';

interface StampSlotProps {
  spot: StampSpot;
  record: StampRecord | undefined;
  fresh: boolean;
}

export function StampSlot({ spot, record, fresh }: StampSlotProps) {
  const reduceMotion = useReducedMotion();

  return (
    <li className="stamp-slot">
      {record ? (
        <motion.div
          className="stamp-slot__circle stamp-slot__circle--earned"
          initial={fresh && !reduceMotion ? { scale: 2.4, rotate: -34, opacity: 0 } : false}
          animate={{ scale: 1, rotate: -8, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 380, damping: 15 }}
        >
          <AppIcon name={spot.icon} size={30} strokeWidth={2.2} />
        </motion.div>
      ) : (
        <div className="stamp-slot__circle stamp-slot__circle--empty">
          <AppIcon name={spot.icon} size={26} />
        </div>
      )}
      <span className="stamp-slot__name">{spot.name}</span>
      <span className="stamp-slot__date">
        {record ? `${formatShortDate(record.earnedAt)} 획득` : '미획득'}
        <span className="visually-hidden">{record ? '' : ', 아직 찍지 않은 스탬프'}</span>
      </span>
    </li>
  );
}
