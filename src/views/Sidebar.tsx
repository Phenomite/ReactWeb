import { Cuboid, X } from 'lucide-react';
import { memo, useCallback } from 'react';
import { ThemeSwitch } from '@/components/ThemeSwitch';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ALL_TENANTS } from '@/constants';
import { cn } from '@/lib/utils';
import { APP_STRINGS } from '@/strings';
import type { ViewDefinition } from '@/types';
import { getVisibleViews } from '@/views/views';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  activeViewId: string;
  onSelectView: (view: ViewDefinition) => void;
}

// Sidebar top-left brand header with Cuboid icon and mobile close button
const SidebarBrandHeader = memo(({ onClose }: { onClose?: (() => void) | undefined }) => (
  <div className="flex h-16 shrink-0 items-center justify-between border-border border-b px-6">
    <div className="flex select-none items-center gap-2.5 font-bold text-foreground">
      <Cuboid className="h-5 w-5 text-accent" aria-hidden="true" />
      <span className="text-lg tracking-tight">{APP_STRINGS.SIDEBAR.HEADING_TITLE}</span>
    </div>
    {onClose && (
      <button
        type="button"
        onClick={onClose}
        aria-label={APP_STRINGS.SIDEBAR.BTN_CLOSE_ARIA_LABEL}
        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-muted-foreground hover:bg-muted md:hidden"
      >
        <X className="h-5 w-5" aria-hidden="true" />
      </button>
    )}
  </div>
));
SidebarBrandHeader.displayName = 'SidebarBrandHeader';

// Sidebar navigation button item with active state and badge
const SidebarNavItem = memo(
  ({
    view,
    isActive,
    onSelect,
  }: {
    view: ViewDefinition;
    isActive: boolean;
    onSelect: (v: ViewDefinition) => void;
  }) => {
    const Icon = view.icon;
    const handleClick = useCallback(() => {
      onSelect(view);
    }, [onSelect, view]);

    return (
      <button
        type="button"
        onClick={handleClick}
        aria-label={view.title}
        aria-current={isActive ? 'page' : undefined}
        className={cn(
          'flex w-full cursor-pointer select-none items-center justify-between rounded-lg px-3 py-2.5 font-medium text-sm transition-all focus-visible:outline-2 focus-visible:outline-ring active:scale-[0.98]',
          isActive
            ? 'bg-accent-soft font-semibold text-accent'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
        )}
      >
        <div className="flex items-center gap-3">
          <Icon
            className={cn('h-4 w-4 shrink-0', isActive ? 'text-accent' : 'text-muted-foreground')}
            aria-hidden="true"
          />
          <span>{view.title}</span>
        </div>
        {view.id === 'microsoft' && (
          <span className="rounded-full bg-blue-100 px-2 py-0.5 font-bold text-[10px] text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
            {ALL_TENANTS.length}
          </span>
        )}
      </button>
    );
  },
);
SidebarNavItem.displayName = 'SidebarNavItem';

// Sidebar content body reused in desktop aside and mobile sheet drawer
const SidebarNavContent = memo(
  ({
    onClose,
    darkMode,
    onToggleDarkMode,
    activeViewId,
    onSelectView,
  }: {
    onClose?: (() => void) | undefined;
    darkMode: boolean;
    onToggleDarkMode: () => void;
    activeViewId: string;
    onSelectView: (view: ViewDefinition) => void;
  }) => {
    const visibleViews = getVisibleViews();

    return (
      <div className="flex h-full w-full flex-col">
        <SidebarBrandHeader onClose={onClose} />
        <nav aria-label={APP_STRINGS.SIDEBAR.NAV_MAIN_ARIA_LABEL} className="flex-1 space-y-1 overflow-y-auto p-4">
          {visibleViews.map((view) => (
            <SidebarNavItem key={view.id} view={view} isActive={activeViewId === view.id} onSelect={onSelectView} />
          ))}
        </nav>
        <div className="shrink-0 space-y-3 border-border border-t p-4">
          <ThemeSwitch darkMode={darkMode} onToggle={onToggleDarkMode} />
        </div>
      </div>
    );
  },
);
SidebarNavContent.displayName = 'SidebarNavContent';

// Main sidebar container rendering desktop fixed aside and mobile Sheet drawer
export const Sidebar = memo(
  ({ isOpen, onClose, darkMode, onToggleDarkMode, activeViewId, onSelectView }: SidebarProps) => {
    const handleOpenChange = useCallback(
      (open: boolean) => {
        if (!open) onClose();
      },
      [onClose],
    );

    return (
      <>
        {/* Desktop Fixed Aside (Container 2) */}
        <aside className="hidden w-72 flex-col border-border border-r bg-card text-card-foreground md:flex">
          <SidebarNavContent
            darkMode={darkMode}
            onToggleDarkMode={onToggleDarkMode}
            activeViewId={activeViewId}
            onSelectView={onSelectView}
          />
        </aside>

        {/* Mobile Accessible Sheet Drawer */}
        <div className="md:hidden">
          <Sheet open={isOpen} onOpenChange={handleOpenChange}>
            <SheetContent side="left" showCloseButton={false} className="w-72 p-0">
              <SheetHeader className="sr-only">
                <SheetTitle>{APP_STRINGS.SIDEBAR.HEADING_TITLE}</SheetTitle>
                <SheetDescription>Application navigation sidebar</SheetDescription>
              </SheetHeader>
              <SidebarNavContent
                onClose={onClose}
                darkMode={darkMode}
                onToggleDarkMode={onToggleDarkMode}
                activeViewId={activeViewId}
                onSelectView={onSelectView}
              />
            </SheetContent>
          </Sheet>
        </div>
      </>
    );
  },
);
Sidebar.displayName = 'Sidebar';
