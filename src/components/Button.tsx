import { memo, type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'warning';

interface ButtonProps {
  children?: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: ButtonVariant;
  icon?: LucideIcon;
  iconRight?: LucideIcon;
  disabled?: boolean;
  className?: string;
  'aria-label'?: string;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 focus-visible:outline-blue-600',
  secondary: 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700/60 focus-visible:outline-blue-600',
  danger: 'border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300 focus-visible:outline-rose-600',
  warning: 'bg-amber-600 text-white hover:bg-amber-700 focus-visible:outline-amber-600',
};

// Reusable accessible interactive button with tactile scale transitions and variants
export const Button = memo(({ children, onClick, type = 'button', variant = 'primary', icon: Icon, iconRight: IconRight, disabled = false, className, 'aria-label': ariaLabel }: ButtonProps) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    aria-label={ariaLabel}
    className={cn(
      'flex h-9 cursor-pointer select-none items-center justify-center gap-2 rounded-lg px-3.5 text-xs font-semibold shadow-xs transition-all duration-150 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2',
      !children && 'w-9 px-0',
      VARIANT_CLASSES[variant],
      className
    )}
  >
    {Icon && <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
    {children && <span>{children}</span>}
    {IconRight && <IconRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
  </button>
));
