import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, type ReactNode } from 'react';

interface BottomSheetProps {
  open: boolean;
  label: string;
  onClose?: () => void;
  /** true면 배경을 어둡게 하고 닫기 전까지 뒤 화면을 막는다. false면 탭바 위에 붙는 시트 */
  modal?: boolean;
  children: ReactNode;
}

export function BottomSheet({ open, label, onClose, modal = false, children }: BottomSheetProps) {
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!open || !modal || !onClose) return undefined;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, modal, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <>
          {modal ? (
            <motion.button
              type="button"
              className="sheet-backdrop"
              aria-label="닫기"
              onClick={onClose}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          ) : null}
          <motion.section
            className={`sheet${modal ? ' sheet--modal' : ' sheet--docked'}`}
            role={modal ? 'dialog' : 'region'}
            aria-modal={modal ? true : undefined}
            aria-label={label}
            initial={reduceMotion ? false : { y: '100%' }}
            animate={{ y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { y: '100%' }}
            transition={{ type: 'spring', stiffness: 420, damping: 38 }}
          >
            {children}
          </motion.section>
        </>
      ) : null}
    </AnimatePresence>
  );
}
