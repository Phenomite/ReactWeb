import { memo, type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CardProps {
  heading?: string;
  description?: string;
  icon?: LucideIcon;
  iconClassName?: string;
  headerRight?: ReactNode;
  children?: ReactNode;
  className?: string;
}

// Reusable card container component with optional heading, description, and icon badge
export const Card = memo(({ heading, description, icon: Icon, iconClassName, headerRight, children, className }: CardProps) => (
  <div className={cn('rounded-xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900', className)}>
    {(heading || description || Icon) && (
      <div className={cn('flex flex-col sm:flex-row sm:items-center justify-between gap-4', children && 'border-b border-slate-200 pb-4 dark:border-slate-800')}>
        <div className="flex items-center gap-3">
          {Icon && (
            <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400', iconClassName)}>
              <Icon className="h-5 w-5" aria-hidden="true" />
            </div>
          )}
          <div>
            {heading && <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">{heading}</h2>}
            {description && <p className="text-xs text-slate-600 dark:text-slate-400">{description}</p>}
          </div>
        </div>
        {headerRight}
      </div>
    )}
    {children}
  </div>
));
