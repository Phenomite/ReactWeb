import {
  ArrowUpRight,
  Building2,
  Cloud,
  Database,
  Edit3,
  Globe,
  Laptop,
  ListChecks,
  MapPin,
  Save,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
  X,
} from 'lucide-react';
import { type ChangeEvent, memo, useCallback, useEffect, useId, useMemo, useState } from 'react';
import { Button } from '@/components/Button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { TOTAL_TELEMETRY_SIGNALS } from '@/constants';
import { useRealtime } from '@/context/RealtimeContext';
import { cn, getActiveSignalCount } from '@/lib/utils';
import { APP_STRINGS } from '@/strings';
import type { TenantRecord } from '@/types';

interface TenantDetailModalProps {
  tenant: TenantRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TenantDetailModal = memo(({ tenant: initialTenant, isOpen, onClose }: TenantDetailModalProps) => {
  const overallScoreInputId = useId();
  const seatCountInputId = useId();
  const m = APP_STRINGS.VIEWS.MICROSOFT;
  const r = APP_STRINGS.REALTIME;
  const { tenants, updateData } = useRealtime();

  // Always resolve the live, real-time tenant record from the context store
  const tenant = useMemo(() => {
    if (!initialTenant) return null;
    return tenants.find((t) => t.id === initialTenant.id) ?? initialTenant;
  }, [tenants, initialTenant]);

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [score, setScore] = useState<number>(tenant?.overallScore ?? 0);
  const [deviceScore, setDeviceScore] = useState<number>(tenant?.categories.device ?? 0);
  const [identitiesScore, setIdentitiesScore] = useState<number>(tenant?.categories.identities ?? 0);
  const [appsScore, setAppsScore] = useState<number>(tenant?.categories.apps ?? 0);
  const [dataScore, setDataScore] = useState<number>(tenant?.categories.data ?? 0);
  const [sentinelActive, setSentinelActive] = useState<boolean>(tenant?.statusBubbles.sentinel ?? false);
  const [mdeActive, setMdeActive] = useState<boolean>(tenant?.statusBubbles.mde ?? false);
  const [mdiActive, setMdiActive] = useState<boolean>(tenant?.statusBubbles.mdi ?? false);
  const [logActive, setLogActive] = useState<boolean>(tenant?.statusBubbles.logAnalytics ?? false);
  const [seatCount, setSeatCount] = useState<number>(tenant?.seatCount ?? 0);

  // Sync form inputs when tenant changes or updates via SSE
  useEffect(() => {
    if (tenant && !isEditing) {
      setScore(tenant.overallScore);
      setDeviceScore(tenant.categories.device);
      setIdentitiesScore(tenant.categories.identities);
      setAppsScore(tenant.categories.apps);
      setDataScore(tenant.categories.data);
      setSentinelActive(tenant.statusBubbles.sentinel);
      setMdeActive(tenant.statusBubbles.mde);
      setMdiActive(tenant.statusBubbles.mdi);
      setLogActive(tenant.statusBubbles.logAnalytics);
      setSeatCount(tenant.seatCount);
    }
  }, [tenant, isEditing]);

  // Reset editing mode whenever modal closes
  useEffect(() => {
    if (!isOpen) {
      setIsEditing(false);
    }
  }, [isOpen]);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        onClose();
      }
    },
    [onClose],
  );

  const handlePublish = useCallback(async () => {
    if (!tenant) return;
    setIsPublishing(true);
    try {
      const res = await updateData<TenantRecord>(
        'tenants',
        tenant.id,
        {
          overallScore: Number(score),
          seatCount: Number(seatCount),
          categories: {
            device: Number(deviceScore),
            identities: Number(identitiesScore),
            apps: Number(appsScore),
            data: Number(dataScore),
          },
          statusBubbles: {
            sentinel: sentinelActive,
            mde: mdeActive,
            mdi: mdiActive,
            logAnalytics: logActive,
          },
        },
        {
          expectedVersion: tenant.version,
          updatedBy: 'operator',
          successMessage: APP_STRINGS.REALTIME.TXT_PUBLISH_SUCCESS,
        },
      );

      if (res.success) {
        setIsEditing(false);
      }
    } finally {
      setIsPublishing(false);
    }
  }, [
    tenant,
    updateData,
    score,
    seatCount,
    deviceScore,
    identitiesScore,
    appsScore,
    dataScore,
    sentinelActive,
    mdeActive,
    mdiActive,
    logActive,
  ]);

  const handleToggleEditing = useCallback(() => {
    setIsEditing((prev) => !prev);
  }, []);

  const handleCancelEditing = useCallback(() => {
    setIsEditing(false);
  }, []);

  const handleScoreChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setScore(Number(e.target.value));
  }, []);

  const handleSeatCountChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setSeatCount(Number(e.target.value));
  }, []);

  const handleToggleSentinel = useCallback(() => {
    setSentinelActive((prev) => !prev);
  }, []);

  const handleToggleMde = useCallback(() => {
    setMdeActive((prev) => !prev);
  }, []);

  const handleToggleMdi = useCallback(() => {
    setMdiActive((prev) => !prev);
  }, []);

  const handleToggleLog = useCallback(() => {
    setLogActive((prev) => !prev);
  }, []);

  if (!tenant) return null;

  const activeSignalsCount = getActiveSignalCount(tenant.statusBubbles);

  const bubbleConfigs = [
    {
      name: m.LABEL_BUBBLE_SENTINEL,
      active: tenant.statusBubbles.sentinel,
      onText: m.STATUS_SENTINEL_ON,
      offText: m.STATUS_SENTINEL_OFF,
    },
    {
      name: m.LABEL_BUBBLE_MDE,
      active: tenant.statusBubbles.mde,
      onText: m.STATUS_MDE_ON,
      offText: m.STATUS_MDE_OFF,
    },
    {
      name: m.LABEL_BUBBLE_MDI,
      active: tenant.statusBubbles.mdi,
      onText: m.STATUS_MDI_ON,
      offText: m.STATUS_MDI_OFF,
    },
    {
      name: m.LABEL_BUBBLE_LOG,
      active: tenant.statusBubbles.logAnalytics,
      onText: m.STATUS_LOG_ON,
      offText: m.STATUS_LOG_OFF,
    },
  ];

  const categoryConfigs = [
    {
      key: 'device' as const,
      label: m.CAT_DEVICE,
      desc: m.CAT_DEVICE_DESC,
      icon: Laptop,
      score: tenant.categories.device,
      color: 'bg-blue-500',
      iconColor: 'text-blue-500',
      extra: (
        <div className="flex items-center justify-between pt-0.5 text-muted-foreground text-xs">
          <span>
            {m.LABEL_MDE_SENSOR}: {tenant.statusBubbles.mde ? m.STATUS_ACTIVE : m.STATUS_MISSING}
          </span>
          <span>
            {m.LABEL_DEFENDER_SERVERS}: {tenant.statusBubbles.mde ? m.STATUS_ENROLLED : m.STATUS_PENDING}
          </span>
        </div>
      ),
    },
    {
      key: 'identities' as const,
      label: m.CAT_IDENTITIES,
      desc: m.CAT_IDENTITIES_DESC,
      icon: Users,
      score: tenant.categories.identities,
      color: 'bg-violet-500',
      iconColor: 'text-violet-500',
    },
    {
      key: 'apps' as const,
      label: m.CAT_APPS,
      desc: m.CAT_APPS_DESC,
      icon: Cloud,
      score: tenant.categories.apps,
      color: 'bg-amber-500',
      iconColor: 'text-amber-500',
    },
    {
      key: 'data' as const,
      label: m.CAT_DATA,
      desc: m.CAT_DATA_DESC,
      icon: Database,
      score: tenant.categories.data,
      color: 'bg-emerald-500',
      iconColor: 'text-emerald-500',
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex max-h-[calc(100vh-2rem)] max-w-2xl flex-col overflow-hidden p-6 sm:max-h-[calc(100vh-3rem)] sm:max-w-2xl"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{tenant.name}</DialogTitle>
          <DialogDescription>
            {tenant.domain} - {tenant.industry}
          </DialogDescription>
        </DialogHeader>

        {/* Visible Header */}
        <div className="flex shrink-0 items-start justify-between gap-4 border-border border-b pb-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                title={
                  tenant.rank === 1
                    ? m.TOOLTIP_RANK_1
                    : tenant.rank === 2
                      ? m.TOOLTIP_RANK_2
                      : tenant.rank === 3
                        ? m.TOOLTIP_RANK_3
                        : undefined
                }
                className="inline-flex items-center gap-1 rounded-lg border border-amber-300 bg-amber-50 px-2 py-0.5 font-black text-amber-700 text-xs dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
              >
                <Trophy className="h-3 w-3" aria-hidden="true" />
                Rank #{tenant.rank}
              </span>
              <span className="rounded-md bg-muted px-2 py-0.5 font-semibold text-muted-foreground text-xs">
                {tenant.industry}
              </span>
              <span className="rounded-md border border-border bg-muted/60 px-2 py-0.5 font-mono text-muted-foreground text-xs">
                rev v{tenant.version ?? 1}
              </span>
              {tenant.lastUpdatedBy && (
                <span className="rounded-md bg-blue-50 px-2 py-0.5 font-medium text-blue-700 text-xs dark:bg-blue-950/60 dark:text-blue-300">
                  by {tenant.lastUpdatedBy}
                </span>
              )}
            </div>
            <h2 className="font-bold text-foreground text-lg">{tenant.name}</h2>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground text-xs">
              <span className="flex items-center gap-1 font-mono text-xs">
                <Globe className="h-3.5 w-3.5" aria-hidden="true" />
                {tenant.domain}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                {tenant.region}
              </span>
              <span className="flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5" aria-hidden="true" />
                {tenant.seatCount.toLocaleString()} {m.LABEL_USERS}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleToggleEditing}
              className={cn(
                'flex h-8 cursor-pointer items-center gap-1.5 rounded-lg px-2.5 font-semibold text-xs transition-all focus-visible:outline-2 focus-visible:outline-ring active:scale-95',
                isEditing
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80',
              )}
              aria-label="Toggle edit mode"
            >
              <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{isEditing ? 'Cancel Edit' : 'Edit'}</span>
            </button>

            <DialogClose asChild>
              <button
                type="button"
                onClick={onClose}
                aria-label={m.BTN_CLOSE_MODAL}
                className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring active:scale-95"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </DialogClose>
          </div>
        </div>

        {/* Modal Body */}
        <div className="mt-5 min-h-0 flex-1 space-y-6 overflow-y-auto pr-1">
          {/* Edit Mode Panel */}
          {isEditing && (
            <div className="space-y-4 rounded-xl border border-amber-200 bg-amber-50/70 p-4 dark:border-amber-900/60 dark:bg-amber-950/30">
              <div className="flex items-center justify-between border-amber-200 border-b pb-2.5 dark:border-amber-900/60">
                <div className="flex items-center gap-2 font-bold text-amber-900 text-xs dark:text-amber-200">
                  <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                  <span>{r.LABEL_EDIT_MODE} (Multi-Operator Safe)</span>
                </div>
                <span className="font-mono text-amber-700 text-xs dark:text-amber-400">
                  Lock Base: v{tenant.version ?? 1}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor={overallScoreInputId} className="font-semibold text-foreground text-xs">
                    Overall Secure Score (%):
                  </label>
                  <input
                    id={overallScoreInputId}
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={score}
                    onChange={handleScoreChange}
                    className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 font-mono text-foreground text-sm"
                  />
                </div>

                <div>
                  <label htmlFor={seatCountInputId} className="font-semibold text-foreground text-xs">
                    Seat Count:
                  </label>
                  <input
                    id={seatCountInputId}
                    type="number"
                    min="1"
                    value={seatCount}
                    onChange={handleSeatCountChange}
                    className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 font-mono text-foreground text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="block font-semibold text-foreground text-xs">Telemetry Defense Signals:</span>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <button
                    type="button"
                    onClick={handleToggleSentinel}
                    className={cn(
                      'cursor-pointer rounded-md border px-2.5 py-1.5 font-semibold text-xs transition-all',
                      sentinelActive
                        ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                        : 'border-border bg-muted/50 text-muted-foreground',
                    )}
                  >
                    Sentinel: {sentinelActive ? 'ON' : 'OFF'}
                  </button>

                  <button
                    type="button"
                    onClick={handleToggleMde}
                    className={cn(
                      'cursor-pointer rounded-md border px-2.5 py-1.5 font-semibold text-xs transition-all',
                      mdeActive
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'border-border bg-muted/50 text-muted-foreground',
                    )}
                  >
                    MDE: {mdeActive ? 'ON' : 'OFF'}
                  </button>

                  <button
                    type="button"
                    onClick={handleToggleMdi}
                    className={cn(
                      'cursor-pointer rounded-md border px-2.5 py-1.5 font-semibold text-xs transition-all',
                      mdiActive
                        ? 'border-violet-500 bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300'
                        : 'border-border bg-muted/50 text-muted-foreground',
                    )}
                  >
                    MDI: {mdiActive ? 'ON' : 'OFF'}
                  </button>

                  <button
                    type="button"
                    onClick={handleToggleLog}
                    className={cn(
                      'cursor-pointer rounded-md border px-2.5 py-1.5 font-semibold text-xs transition-all',
                      logActive
                        ? 'border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                        : 'border-border bg-muted/50 text-muted-foreground',
                    )}
                  >
                    Log Analytics: {logActive ? 'ON' : 'OFF'}
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 border-amber-200 border-t pt-2 dark:border-amber-900/60">
                <Button variant="secondary" onClick={handleCancelEditing} disabled={isPublishing}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handlePublish}
                  disabled={isPublishing}
                  className="gap-1.5"
                  aria-label={r.BTN_PUBLISH_ARIA_LABEL}
                >
                  <Save className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{isPublishing ? 'Publishing...' : r.BTN_PUBLISH_UPDATE}</span>
                </Button>
              </div>
            </div>
          )}

          {/* Overall Score Highlight */}
          <div className="flex items-center justify-between rounded-xl bg-muted/50 p-4">
            <div>
              <span className="font-bold text-muted-foreground text-xs uppercase tracking-wider">
                {m.HEADING_COMPOSITE_SCORE}
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-black font-mono text-3xl text-foreground">{tenant.overallScore}%</span>
                <span className="font-semibold text-emerald-600 text-sm dark:text-emerald-400">
                  {tenant.overallScore >= 80
                    ? m.TXT_POSTURE_SUPERIOR
                    : tenant.overallScore >= 60
                      ? m.TXT_POSTURE_MODERATE
                      : m.TXT_POSTURE_CRITICAL}
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card px-3 py-2 text-right shadow-2xs">
              <span className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                {m.LABEL_ACTIVE_TELEMETRY}
              </span>
              <p className="font-black font-mono text-accent text-lg">
                {activeSignalsCount} / {TOTAL_TELEMETRY_SIGNALS}
              </p>
            </div>
          </div>

          {/* Telemetry Status Bubbles Inspection */}
          <div className="space-y-2">
            <h4 className="font-bold text-muted-foreground text-xs uppercase tracking-wider">
              {m.LABEL_BUBBLES_SECTION}
            </h4>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {bubbleConfigs.map((b) => (
                <div
                  key={b.name}
                  className={cn(
                    'rounded-xl border p-3 text-center',
                    b.active
                      ? 'border-emerald-200 bg-emerald-50/70 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/50 dark:text-emerald-300'
                      : 'border-border bg-muted/40 text-muted-foreground',
                  )}
                >
                  <p className="font-bold text-sm">{b.name}</p>
                  <p className="mt-1 font-medium text-xs">{b.active ? b.onText : b.offText}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Category Score Breakdowns */}
          <div className="space-y-3">
            <h4 className="font-bold text-muted-foreground text-xs uppercase tracking-wider">
              {m.HEADING_CATEGORY_BREAKDOWN}
            </h4>
            <div className="mt-3 space-y-3">
              {categoryConfigs.map((cat) => {
                const Icon = cat.icon;
                return (
                  <div key={cat.key} className="rounded-lg border border-border bg-muted/30 p-3">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Icon className={cn('h-4 w-4', cat.iconColor)} aria-hidden="true" />
                        <div>
                          <span className="font-semibold text-foreground text-sm">{cat.label}</span>
                          <span className="ml-2 text-muted-foreground text-xs">{cat.desc}</span>
                        </div>
                      </div>
                      <span className="font-bold font-mono text-foreground text-sm">{cat.score}%</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn('h-full transition-all duration-300', cat.color)}
                        style={{ width: `${cat.score}%` }}
                      />
                    </div>

                    {/* Extra sensor detail */}
                    {cat.extra && <div className="mt-1.5">{cat.extra}</div>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Gamified Action Recommendations */}
          <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4 dark:border-blue-900/60 dark:bg-blue-950/30">
            <div className="flex items-center gap-2 font-bold text-blue-900 text-sm dark:text-blue-300">
              <ListChecks className="h-4 w-4 text-blue-600 dark:text-blue-400" aria-hidden="true" />
              <span>{m.HEADING_RECOMMENDED_ACTIONS}</span>
            </div>
            <ul className="mt-2.5 space-y-2 text-blue-800 text-xs dark:text-blue-200">
              {!tenant.statusBubbles.mde ? (
                <li className="flex items-start gap-1.5">
                  <ArrowUpRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-500" aria-hidden="true" />
                  <span>
                    <strong>{m.LABEL_REC_MDE_CATEGORY}:</strong> {m.TXT_REC_MDE_SERVERS}
                  </span>
                </li>
              ) : tenant.categories.device < 92 ? (
                <li className="flex items-start gap-1.5">
                  <ArrowUpRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-500" aria-hidden="true" />
                  <span>
                    <strong>{m.LABEL_REC_MDE_CATEGORY}:</strong> {m.TXT_REC_MDE_SERVERS_EXPAND}
                  </span>
                </li>
              ) : null}

              {!tenant.statusBubbles.mdi && (
                <li className="flex items-start gap-1.5">
                  <ArrowUpRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-500" aria-hidden="true" />
                  <span>
                    <strong>{m.LABEL_REC_IDENTITIES_CATEGORY}:</strong> {m.TXT_REC_MDI}
                  </span>
                </li>
              )}

              {!tenant.statusBubbles.sentinel && (
                <li className="flex items-start gap-1.5">
                  <ArrowUpRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-500" aria-hidden="true" />
                  <span>
                    <strong>{m.LABEL_REC_SIEM_CATEGORY}:</strong> {m.TXT_REC_SENTINEL}
                  </span>
                </li>
              )}

              {!tenant.statusBubbles.logAnalytics && (
                <li className="flex items-start gap-1.5">
                  <ArrowUpRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-500" aria-hidden="true" />
                  <span>
                    <strong>{m.LABEL_REC_AUDIT_CATEGORY}:</strong> {m.TXT_REC_AUDIT}
                  </span>
                </li>
              )}

              {activeSignalsCount === TOTAL_TELEMETRY_SIGNALS && tenant.categories.device >= 92 && (
                <li className="flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-500" aria-hidden="true" />
                  <span>{m.TXT_REC_FULL_STACK}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex shrink-0 justify-end border-border border-t pt-4">
          <DialogClose asChild>
            <Button onClick={onClose} variant="secondary">
              {m.BTN_CLOSE_MODAL}
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
});

TenantDetailModal.displayName = 'TenantDetailModal';
