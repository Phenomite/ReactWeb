import { memo } from 'react';
import { ShieldCheck } from 'lucide-react';
import { APP_STRINGS } from '@/constants';
import { cn } from '@/lib/utils';

interface UserBadgeProps {
  username?: string | null;
  className?: string;
}

// Renders an authenticated user identity badge with a shield icon
export const UserBadge = memo(({ username, className }: UserBadgeProps) => (
  <div className={cn('flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2 text-xs dark:border-slate-800 dark:bg-slate-800/40', className)}>
    <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-500" aria-hidden="true" />
    <span className="truncate font-medium text-slate-700 dark:text-slate-300">
      {username || APP_STRINGS.HEADER.BADGE_DEFAULT_USER}
    </span>
  </div>
));
