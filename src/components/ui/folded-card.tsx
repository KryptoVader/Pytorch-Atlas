import * as React from 'react';
import { useId } from 'react';
import { cn } from '@/lib/utils';

const CLIP = 'polygon(0 8px, 8px 0, calc(100% - 40px) 0, 100% 40px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0 calc(100% - 8px))';

export const FoldedCard = React.memo(function FoldedCard({ className, style, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('folded-card-root', className)} style={style} {...props} />;
});

export const FoldedCardFold = React.memo(function FoldedCardFold({ className, ...props }: React.ComponentProps<'div'>) {
  const id = useId().replaceAll(':', '');
  return <div className={cn('folded-card-fold', className)} {...props} aria-hidden="true">
    <svg viewBox="0 0 40 40" className="h-full w-full" fill="none">
      <defs><linearGradient id={id} x1="100%" x2="0%" y1="0%" y2="100%"><stop offset="0%" stopColor="var(--panel)"/><stop offset="100%" stopColor="var(--line-strong)"/></linearGradient></defs>
      <path d="M0 0 L40 40 L40 0 Z" fill={`url(#${id})`} />
      <path d="M0 0L40 40" stroke="var(--line-strong)" strokeWidth="1"/>
    </svg>
  </div>;
});

export const FoldedCardLink = React.memo(function FoldedCardLink({ className, style, href = '#', ...props }: React.ComponentProps<'a'>) {
  return <a href={href} className={cn('folded-card-link', className)} style={{ clipPath: CLIP, ...style }} {...props} />;
});

export function FoldedCardBorder({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('folded-card-border', className)} aria-hidden="true" {...props} />;
}

export function FoldedCardPreview({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('folded-card-preview', className)} {...props} />;
}

export const FoldedCardGrid = React.memo(function FoldedCardGrid({ className, rows = 4, columns = 4, ...props }: React.ComponentProps<'div'> & { rows?: number; columns?: number }) {
  return <div className={cn('folded-card-grid', className)} aria-hidden="true" {...props}>
    {Array.from({ length: Math.max(1, Math.floor(rows)) - 1 }, (_, i) => <span key={`row-${i}`} className="folded-grid-row" style={{ top: `${((i + 1) / Math.max(1, Math.floor(rows))) * 100}%` }} />)}
    {Array.from({ length: Math.max(1, Math.floor(columns)) - 1 }, (_, i) => <span key={`col-${i}`} className="folded-grid-column" style={{ left: `${((i + 1) / Math.max(1, Math.floor(columns))) * 100}%` }} />)}
  </div>;
});

export function FoldedCardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('folded-card-footer', className)} {...props} />;
}
export function FoldedCardHeading({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('folded-card-heading', className)} {...props} />;
}
export function FoldedCardTitle({ className, ...props }: React.ComponentProps<'h3'>) {
  return <h3 className={cn('folded-card-title', className)} {...props} />;
}
export function FoldedCardBadge({ className, ...props }: React.ComponentProps<'span'>) {
  return <span className={cn('folded-card-badge', className)} {...props} />;
}
export function FoldedCardDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return <p className={cn('folded-card-description', className)} {...props} />;
}
