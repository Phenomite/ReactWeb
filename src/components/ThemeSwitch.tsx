import { Moon, Sun } from 'lucide-react';
import { memo } from 'react';
import { cn } from '@/lib/utils';
import { APP_STRINGS } from '@/strings';

interface ThemeSwitchProps {
  darkMode: boolean;
  onToggle: () => void;
  className?: string;
}

// Renders an accessible theme mode toggle switch control
export const ThemeSwitch = memo(({ darkMode, onToggle, className }: ThemeSwitchProps) => (
  <div
    className={cn(
      'flex select-none items-center justify-between rounded-lg border border-border bg-muted/60 px-3.5 py-2.5',
      className,
    )}
  >
    <div className="flex items-center gap-2 font-medium text-foreground text-xs">
      {darkMode ? (
        <Moon className="h-4 w-4 text-accent" aria-hidden="true" />
      ) : (
        <Sun className="h-4 w-4 text-amber-500" aria-hidden="true" />
      )}
      <span>{APP_STRINGS.SIDEBAR.LABEL_DARK_MODE}</span>
    </div>
    <button
      type="button"
      role="switch"
      aria-checked={darkMode}
      onClick={onToggle}
      aria-label={APP_STRINGS.SIDEBAR.SWITCH_THEME_ARIA_LABEL}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 cursor-pointer select-none rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-ring active:scale-95',
        darkMode ? 'bg-primary' : 'bg-muted-foreground/30',
      )}
    >
      <span
        className={cn(
          'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200',
          darkMode ? 'translate-x-5' : 'translate-x-0',
        )}
      />
    </button>
  </div>
));
