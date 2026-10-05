import type { LucideIcon } from 'lucide-react';
import { type HTMLAttributes, memo, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  heading?: string;
  description?: string;
  icon?: LucideIcon;
  iconClassName?: string;
  headerRight?: ReactNode;
  children?: ReactNode;
  className?: string;
}

// Reusable card container component with optional heading, description, and icon badge
export const Card = memo(
  ({ heading, description, icon: Icon, iconClassName, headerRight, children, className, ...rest }: CardProps) => (
    <div
      className={cn('rounded-xl border border-border bg-card p-6 text-card-foreground shadow-xs', className)}
      {...rest}
    >
      {(heading || description || Icon) && (
        <div
          className={cn(
            'flex flex-col justify-between gap-4 sm:flex-row sm:items-center',
            children && 'border-border border-b pb-4',
          )}
        >
          <div className="flex items-center gap-3">
            {Icon && (
              <div
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent',
                  iconClassName,
                )}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
            )}
            <div>
              {heading && <h2 className="font-bold text-foreground text-xl tracking-tight">{heading}</h2>}
              {description && <p className="text-muted-foreground text-xs">{description}</p>}
            </div>
          </div>
          {headerRight}
        </div>
      )}
      {children}
    </div>
  ),
);
