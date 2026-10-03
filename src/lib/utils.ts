import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { TIER_CONFIG, type ScoreTierDefinition } from '@/constants';
import { APP_STRINGS } from '@/strings';
import type { TenantStatusBubbles, TenantScoreTier } from '@/types';

// Merges class names and resolves Tailwind CSS rule conflicts
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// Computes the number of active telemetry security signals without array allocation
export function getActiveSignalCount(bubbles: TenantStatusBubbles): number {
  return (
    (bubbles.sentinel ? 1 : 0) +
    (bubbles.mde ? 1 : 0) +
    (bubbles.mdi ? 1 : 0) +
    (bubbles.logAnalytics ? 1 : 0)
  );
}

// Resolves the corresponding score tier configuration and styling for a given score
export function getTierForScore(score: number): ScoreTierDefinition & { label: string } {
  const m = APP_STRINGS.VIEWS.MICROSOFT;
  const tier = TIER_CONFIG.find((t) => score >= t.min) ?? TIER_CONFIG[TIER_CONFIG.length - 1]!;
  const labelMap: Record<Exclude<TenantScoreTier, 'all'>, string> = {
    diamond: m.TIER_DIAMOND,
    gold: m.TIER_GOLD,
    silver: m.TIER_SILVER,
    bronze: m.TIER_BRONZE,
    critical: m.TIER_CRITICAL,
  };
  return {
    ...tier,
    label: labelMap[tier.id],
  };
}

// Clears all browser local storage cache, presents a feedback toast, and reloads the application
export function resetLocalStorageAndReload(
  showToast?: (message: string, options?: { type?: 'info' | 'success' | 'warning' | 'error' }) => void
): void {
  try {
    localStorage.clear();
    showToast?.(APP_STRINGS.TOAST.TXT_STORAGE_CLEARED, { type: 'info' });
    setTimeout(() => {
      window.location.reload();
    }, 150);
  } catch {
    window.location.reload();
  }
}

// Copies the active window URL to clipboard and presents a confirmation toast
export async function copyCurrentUrl(
  showToast?: (message: string, options?: { type?: 'info' | 'success' | 'warning' | 'error' }) => void
): Promise<void> {
  try {
    await navigator.clipboard.writeText(window.location.href);
    showToast?.(APP_STRINGS.TOAST.TXT_URL_COPIED, { type: 'success' });
  } catch {
    // Clipboard write failed or denied
  }
}

