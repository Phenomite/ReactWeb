import { memo, useEffect, useCallback } from 'react';
import {
  X,
  Trophy,
  ShieldCheck,
  Laptop,
  Users,
  Cloud,
  Database,
  Building2,
  Globe,
  MapPin,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import { Button } from '@/components/Button';
import { APP_STRINGS } from '@/strings';
import { cn } from '@/lib/utils';
import type { TenantRecord } from '@/types';

interface TenantDetailModalProps {
  tenant: TenantRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TenantDetailModal = memo(({ tenant, isOpen, onClose }: TenantDetailModalProps) => {
  const m = APP_STRINGS.VIEWS.MICROSOFT;

  // Handle escape key to close modal
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleKeyDown]);

  if (!isOpen || !tenant) return null;

  // Active status bubbles count
  const activeSignalsCount = [
    tenant.statusBubbles.sentinel,
    tenant.statusBubbles.mde,
    tenant.statusBubbles.mdi,
    tenant.statusBubbles.logAnalytics,
  ].filter(Boolean).length;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="tenant-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
    >
      <div
        className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl transition-all dark:border-slate-800 dark:bg-slate-900"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-lg border border-amber-300 bg-amber-50 px-2 py-0.5 text-xs font-black text-amber-700 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                <Trophy className="h-3 w-3" aria-hidden="true" />
                Rank #{tenant.rank}
              </span>
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {tenant.industry}
              </span>
            </div>
            <h2 id="tenant-modal-title" className="text-lg font-bold text-slate-900 dark:text-white">
              {tenant.name}
            </h2>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1 font-mono text-[11px]">
                <Globe className="h-3.5 w-3.5" aria-hidden="true" />
                {tenant.domain}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                {tenant.region}
              </span>
              <span className="flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5" aria-hidden="true" />
                {tenant.seatCount.toLocaleString()} Seats
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={m.BTN_CLOSE_MODAL}
            className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 active:scale-95 focus-visible:outline-2 focus-visible:outline-blue-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="mt-5 space-y-6 max-h-[70vh] overflow-y-auto pr-1">
          {/* Overall Score Highlight */}
          <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">
            <div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Composite Microsoft Secure Score
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-mono text-3xl font-black text-slate-900 dark:text-white">
                  {tenant.overallScore}%
                </span>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  {tenant.overallScore >= 80 ? 'Superior Protection' : tenant.overallScore >= 60 ? 'Moderate Posture' : 'Remediation Required'}
                </span>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-right shadow-2xs dark:border-slate-700 dark:bg-slate-900">
              <span className="text-[10px] font-semibold uppercase text-slate-400">Active Telemetry</span>
              <p className="font-mono text-base font-black text-accent">{activeSignalsCount} / 4</p>
            </div>
          </div>

          {/* Status Bubbles Details (positioned above categories) */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {m.LABEL_BUBBLES_SECTION}
            </h4>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              <div
                className={cn(
                  'rounded-xl border p-3 text-center',
                  tenant.statusBubbles.sentinel
                    ? 'border-emerald-200 bg-emerald-50/70 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/50 dark:text-emerald-300'
                    : 'border-slate-200 bg-slate-50 text-slate-400 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-500'
                )}
              >
                <p className="text-xs font-bold">{m.LABEL_BUBBLE_SENTINEL}</p>
                <p className="mt-1 text-[10px] font-medium">
                  {tenant.statusBubbles.sentinel ? 'Ingesting SIEM' : 'Not Connected'}
                </p>
              </div>

              <div
                className={cn(
                  'rounded-xl border p-3 text-center',
                  tenant.statusBubbles.mde
                    ? 'border-emerald-200 bg-emerald-50/70 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/50 dark:text-emerald-300'
                    : 'border-slate-200 bg-slate-50 text-slate-400 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-500'
                )}
              >
                <p className="text-xs font-bold">{m.LABEL_BUBBLE_MDE}</p>
                <p className="mt-1 text-[10px] font-medium">
                  {tenant.statusBubbles.mde ? 'EDR Active' : 'No Sensor'}
                </p>
              </div>

              <div
                className={cn(
                  'rounded-xl border p-3 text-center',
                  tenant.statusBubbles.mdi
                    ? 'border-emerald-200 bg-emerald-50/70 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/50 dark:text-emerald-300'
                    : 'border-slate-200 bg-slate-50 text-slate-400 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-500'
                )}
              >
                <p className="text-xs font-bold">{m.LABEL_BUBBLE_MDI}</p>
                <p className="mt-1 text-[10px] font-medium">
                  {tenant.statusBubbles.mdi ? 'Identity Defense' : 'Sensor Inactive'}
                </p>
              </div>

              <div
                className={cn(
                  'rounded-xl border p-3 text-center',
                  tenant.statusBubbles.logAnalytics
                    ? 'border-emerald-200 bg-emerald-50/70 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/50 dark:text-emerald-300'
                    : 'border-slate-200 bg-slate-50 text-slate-400 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-500'
                )}
              >
                <p className="text-xs font-bold">{m.LABEL_BUBBLE_LOG}</p>
                <p className="mt-1 text-[10px] font-medium">
                  {tenant.statusBubbles.logAnalytics ? 'Audit Streaming' : 'Logs Disabled'}
                </p>
              </div>
            </div>
          </div>

          {/* Secure Score Categories */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Secure Score Category Breakdown
            </h4>

            <div className="space-y-3 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Laptop className="h-4 w-4 text-blue-500" aria-hidden="true" />
                    <span className="font-semibold text-slate-900 dark:text-white">{m.CAT_DEVICE}</span>
                    <span className="text-[11px] text-slate-400">({m.CAT_DEVICE_DESC})</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {tenant.categories.device}%
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-blue-500"
                    style={{ width: `${tenant.categories.device}%` }}
                  />
                </div>
                <div className="flex items-center justify-between pt-0.5 text-[10px] text-slate-500 dark:text-slate-400">
                  <span>MDE Sensor: {tenant.statusBubbles.mde ? 'Active' : 'Missing'}</span>
                  <span>Defender for Servers: {tenant.statusBubbles.mde ? 'Enrolled' : 'Pending Deployment'}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-violet-500" aria-hidden="true" />
                    <span className="font-semibold text-slate-900 dark:text-white">{m.CAT_IDENTITIES}</span>
                    <span className="text-[11px] text-slate-400">({m.CAT_IDENTITIES_DESC})</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {tenant.categories.identities}%
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-violet-500"
                    style={{ width: `${tenant.categories.identities}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Cloud className="h-4 w-4 text-amber-500" aria-hidden="true" />
                    <span className="font-semibold text-slate-900 dark:text-white">{m.CAT_APPS}</span>
                    <span className="text-[11px] text-slate-400">({m.CAT_APPS_DESC})</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {tenant.categories.apps}%
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-amber-500"
                    style={{ width: `${tenant.categories.apps}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-emerald-500" aria-hidden="true" />
                    <span className="font-semibold text-slate-900 dark:text-white">{m.CAT_DATA}</span>
                    <span className="text-[11px] text-slate-400">({m.CAT_DATA_DESC})</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {tenant.categories.data}%
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{ width: `${tenant.categories.data}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Gamified Action Recommendations */}
          <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4 dark:border-blue-900/60 dark:bg-blue-950/30">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-900 dark:text-blue-300">
              <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" aria-hidden="true" />
              <span>{m.HEADING_RECOMMENDED_ACTIONS}</span>
            </div>
            <ul className="mt-2.5 space-y-2 text-xs text-blue-800 dark:text-blue-200">
              {/* MDE Sensor Category: Defender for Server Deployment */}
              {!tenant.statusBubbles.mde ? (
                <li className="flex items-start gap-1.5">
                  <ArrowUpRight className="h-3.5 w-3.5 mt-0.5 shrink-0 text-blue-500" aria-hidden="true" />
                  <span>
                    <strong>MDE Sensor Category:</strong> {m.TXT_REC_MDE_SERVERS}
                  </span>
                </li>
              ) : tenant.categories.device < 92 ? (
                <li className="flex items-start gap-1.5">
                  <ArrowUpRight className="h-3.5 w-3.5 mt-0.5 shrink-0 text-blue-500" aria-hidden="true" />
                  <span>
                    <strong>MDE Sensor Category:</strong> {m.TXT_REC_MDE_SERVERS_EXPAND}
                  </span>
                </li>
              ) : null}

              {!tenant.statusBubbles.mdi && (
                <li className="flex items-start gap-1.5">
                  <ArrowUpRight className="h-3.5 w-3.5 mt-0.5 shrink-0 text-blue-500" aria-hidden="true" />
                  <span>
                    <strong>Identities Category:</strong> {m.TXT_REC_MDI}
                  </span>
                </li>
              )}

              {!tenant.statusBubbles.sentinel && (
                <li className="flex items-start gap-1.5">
                  <ArrowUpRight className="h-3.5 w-3.5 mt-0.5 shrink-0 text-blue-500" aria-hidden="true" />
                  <span>
                    <strong>SIEM Integration:</strong> {m.TXT_REC_SENTINEL}
                  </span>
                </li>
              )}

              {!tenant.statusBubbles.logAnalytics && (
                <li className="flex items-start gap-1.5">
                  <ArrowUpRight className="h-3.5 w-3.5 mt-0.5 shrink-0 text-blue-500" aria-hidden="true" />
                  <span>
                    <strong>Audit Logging:</strong> {m.TXT_REC_AUDIT}
                  </span>
                </li>
              )}

              {activeSignalsCount === 4 && tenant.categories.device >= 92 && (
                <li className="flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-500" aria-hidden="true" />
                  <span>{m.TXT_REC_FULL_STACK}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end border-t border-slate-100 pt-4 dark:border-slate-800">
          <Button onClick={onClose} variant="secondary">
            {m.BTN_CLOSE_MODAL}
          </Button>
        </div>
      </div>
    </div>
  );
});

TenantDetailModal.displayName = 'TenantDetailModal';
