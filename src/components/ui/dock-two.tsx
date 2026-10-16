import * as React from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface DockItem {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  active?: boolean;
}

interface DockProps {
  className?: string;
  items: DockItem[];
  'aria-label'?: string;
}

export const Dock = React.forwardRef<HTMLElement, DockProps>(function Dock(
  { items, className, 'aria-label': ariaLabel = 'Primary navigation' },
  ref,
) {
  return <nav ref={ref} aria-label={ariaLabel} className={cn('atlas-dock', className)}>
    {items.map(({ icon: Icon, label, onClick, active }) => <motion.button
      key={label}
      type="button"
      aria-current={active ? 'page' : undefined}
      aria-label={label}
      title={label}
      onClick={onClick}
      whileHover={{ y: -1, scale: 1.015 }}
      whileTap={{ scale: 0.985 }}
      transition={{ type: 'spring', stiffness: 460, damping: 32 }}
      className={cn('atlas-dock-item', active && 'is-active')}
    >
      <Icon aria-hidden="true" size={15} strokeWidth={1.8} />
      <span>{label}</span>
    </motion.button>)}
  </nav>;
});

Dock.displayName = 'Dock';
