import { memo } from 'react';
import { ShieldCheck } from 'lucide-react';
import { APP_STRINGS } from '@/strings';
import { cn } from '@/lib/utils';

interface UserBadgeProps {
  username?: string | null;
  role?: string | null;
  className?: string;
}

// Renders an authenticated user identity badge with a shield icon and role badge
export const UserBadge = memo(({ username, role, className }: UserBadgeProps) => (
  <div
    className={cn(
      'flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2 text-xs dark:border-slate-800 dark:bg-slate-800/40',
      className
    )}
  >
    <div className="flex min-w-0 items-center gap-2">
      <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-500" aria-hidden="true" />
      <span className="truncate font-medium text-slate-700 dark:text-slate-300">
        {username || APP_STRINGS.HEADER.BADGE_DEFAULT_USER}
      </span>
    </div>
    {role && (
      <span
        className={cn(
          'shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
          role.toLowerCase() === 'admin'
            ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
            : 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
        )}
      >
        {role}
      </span>
    )}
  </div>
));
