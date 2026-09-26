import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import { ALL_TENANTS, INITIAL_SECURITY_INCIDENTS, AUTH_CONFIG } from '@/constants';
import { useToast } from '@/context/ToastContext';
import { APP_STRINGS } from '@/strings';
import type {
  TenantRecord,
  TenantScoreCategories,
  SecurityIncident,
  IncidentStatus,
  RealtimeConnectionStatus,
  RealtimeContextType,
  DataUpdateOptions,
  DataUpdateResult,
} from '@/types';

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

// Manages real-time Server-Sent Events (SSE) stream and live database synchronization
export function RealtimeProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<RealtimeConnectionStatus>('connecting');
  const [activeVisitors, setActiveVisitors] = useState<number>(1);
  const [tenants, setTenants] = useState<TenantRecord[]>(ALL_TENANTS);
  const [incidents, setIncidents] = useState<SecurityIncident[]>(INITIAL_SECURITY_INCIDENTS);
  const [entities, setEntities] = useState<Record<string, Record<string, unknown>>>({});
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);
  const { showToast } = useToast();

  // Internal updater that synchronizes incoming entity modification across specific or dynamic collections
  const applyEntityUpdate = useCallback((resource: string, id: string, data: Record<string, unknown>) => {
    if (resource === 'tenants') {
      const updatedTenant = data as unknown as TenantRecord;
      setTenants((prev) => {
        const index = prev.findIndex((t) => t.id === id);
        if (index === -1) return prev;
        const next = [...prev];
        next[index] = updatedTenant;
        return next.sort((a, b) => a.rank - b.rank);
      });
    } else if (resource === 'incidents') {
      const updatedIncident = data as unknown as SecurityIncident;
      setIncidents((prev) => {
        const exists = prev.some((i) => i.id === id);
        if (!exists) return [updatedIncident, ...prev];
        return prev.map((i) => (i.id === id ? { ...i, ...updatedIncident } : i));
      });
    } else {
      // Dynamic collection storage for arbitrary future database models
      setEntities((prev) => ({
        ...prev,
        [resource]: {
          ...(prev[resource] || {}),
          [id]: data,
        },
      }));
    }
  }, []);

  // Establish and manage real-time Server-Sent Events connection
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let reconnectTimeout: number | undefined;
    let isMounted = true;

    function connect() {
      if (!isMounted) return;
      setStatus('connecting');

      try {
        eventSource = new EventSource('/api/events');

        eventSource.onopen = () => {
          if (!isMounted) return;
          setStatus('connected');
          setLastSyncTime(Date.now());
        };

        // Handle initial full snapshot
        eventSource.addEventListener('init', (e: MessageEvent<string>) => {
          if (!isMounted) return;
          try {
            const data = JSON.parse(e.data) as {
              tenants?: TenantRecord[];
              incidents?: SecurityIncident[];
              activeVisitors?: number;
            };
            if (Array.isArray(data.tenants) && data.tenants.length > 0) {
              setTenants(data.tenants);
            }
            if (Array.isArray(data.incidents) && data.incidents.length > 0) {
              setIncidents(data.incidents);
            }
            if (typeof data.activeVisitors === 'number') {
              setActiveVisitors(data.activeVisitors);
            }
            setStatus('connected');
            setLastSyncTime(Date.now());
          } catch {
            // Keep existing state on parse error
          }
        });

        // Handle real-time visitor count update
        eventSource.addEventListener('visitors', (e: MessageEvent<string>) => {
          if (!isMounted) return;
          try {
            const data = JSON.parse(e.data) as { activeVisitors?: number };
            if (typeof data.activeVisitors === 'number') {
              setActiveVisitors(data.activeVisitors);
            }
          } catch {
            // Keep existing count
          }
        });

        // Handle generic real-time data update broadcast scaling across all database entities
        eventSource.addEventListener('data_updated', (e: MessageEvent<string>) => {
          if (!isMounted) return;
          try {
            const payload = JSON.parse(e.data) as {
              resource: string;
              id: string;
              data: Record<string, unknown>;
            };
            if (payload && payload.resource && payload.id && payload.data) {
              applyEntityUpdate(payload.resource, payload.id, payload.data);
              setLastSyncTime(Date.now());
            }
          } catch {
            // Silently keep previous state
          }
        });

        // Handle live tenant score modification broadcast
        eventSource.addEventListener('tenant_updated', (e: MessageEvent<string>) => {
          if (!isMounted) return;
          try {
            const updated = JSON.parse(e.data) as TenantRecord;
            if (updated && updated.id) {
              applyEntityUpdate('tenants', updated.id, updated as unknown as Record<string, unknown>);
              setLastSyncTime(Date.now());
            }
          } catch {
            // Silently keep previous state
          }
        });

        // Handle batch updates from in-cluster scripts or CronJobs
        eventSource.addEventListener('tenants_batch_updated', (e: MessageEvent<string>) => {
          if (!isMounted) return;
          try {
            const data = JSON.parse(e.data) as {
              updatedCount?: number;
              timestamp?: number;
              tenants?: TenantRecord[];
            };
            if (Array.isArray(data.tenants) && data.tenants.length > 0) {
              setTenants(data.tenants);
              setLastSyncTime(Date.now());
              showToast(APP_STRINGS.REALTIME.TXT_BATCH_SYNC, {
                type: 'info',
                description: `${data.updatedCount || data.tenants.length} tenants refreshed`,
              });
            }
          } catch {
            // Keep existing state
          }
        });

        // Handle live security incident alert broadcast
        eventSource.addEventListener('incident_created', (e: MessageEvent<string>) => {
          if (!isMounted) return;
          try {
            const newIncident = JSON.parse(e.data) as SecurityIncident;
            if (newIncident && newIncident.id) {
              setIncidents((prev) => [newIncident, ...prev.filter((i) => i.id !== newIncident.id)]);
              setLastSyncTime(Date.now());
              showToast(APP_STRINGS.REALTIME.TXT_THREAT_BROADCAST, {
                type: newIncident.severity === 'critical' ? 'error' : 'warning',
                description: `${newIncident.title} (${newIncident.severity.toUpperCase()})`,
              });
            }
          } catch {
            // Keep existing incidents
          }
        });

        // Handle live incident status update broadcast
        eventSource.addEventListener('incident_status_updated', (e: MessageEvent<string>) => {
          if (!isMounted) return;
          try {
            const payload = JSON.parse(e.data) as { id: string; status: IncidentStatus } | SecurityIncident;
            if (payload && 'id' in payload && payload.id) {
              if ('title' in payload) {
                applyEntityUpdate('incidents', payload.id, payload as unknown as Record<string, unknown>);
              } else if ('status' in payload) {
                setIncidents((prev) =>
                  prev.map((i) => (i.id === payload.id ? { ...i, status: payload.status } : i))
                );
              }
              setLastSyncTime(Date.now());
            }
          } catch {
            // Keep existing status
          }
        });

        eventSource.onerror = () => {
          if (!isMounted) return;
          setStatus('offline');
          if (eventSource) {
            eventSource.close();
            eventSource = null;
          }
          // Retry connection after 5 seconds
          reconnectTimeout = window.setTimeout(connect, 5000);
        };
      } catch {
        if (!isMounted) return;
        setStatus('offline');
        reconnectTimeout = window.setTimeout(connect, 5000);
      }
    }

    connect();

    return () => {
      isMounted = false;
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (eventSource) {
        eventSource.close();
        eventSource = null;
      }
    };
  }, [applyEntityUpdate, showToast]);

  /**
   * Data-agnostic update function that scales to any database entity.
   * Handles optimistic updates, optimistic concurrency control (OCC),
   * real-time state synchronization, and standardized error responses.
   *
   * @template T - The entity data type
   * @param resource - Database resource or collection name (e.g. 'tenants', 'incidents', 'site_metrics', or future tables)
   * @param id - Entity record primary key / identifier
   * @param updates - Object containing modified fields or updates payload
   * @param options - Configuration options (expectedVersion for OCC, custom endpoint/method, optimistic callback, etc.)
   * @returns Standardized DataUpdateResult with success, data, conflict status, and error details
   */
  const updateData = useCallback(
    async <T = Record<string, unknown>>(
      resource: string,
      id: string,
      updates: Partial<T> | Record<string, unknown>,
      options?: DataUpdateOptions<T>
    ): Promise<DataUpdateResult<T>> => {
      // 1. Optional optimistic local execution
      if (options?.optimisticUpdate) {
        if (resource === 'tenants') {
          setTenants((prev) => options.optimisticUpdate!(prev as unknown as T[]) as unknown as TenantRecord[]);
        } else if (resource === 'incidents') {
          setIncidents((prev) => options.optimisticUpdate!(prev as unknown as T[]) as unknown as SecurityIncident[]);
        }
      }

      // Check active admin session token before dispatching
      let activeSessionJson: string | null = null;
      if (typeof window !== 'undefined') {
        activeSessionJson = localStorage.getItem(AUTH_CONFIG.STORAGE_KEY_SESSION);
      }

      const targetEndpoint =
        options?.endpoint || `/api/${encodeURIComponent(resource)}/${encodeURIComponent(id)}`;
      const httpMethod = options?.method || 'PATCH';
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (activeSessionJson) {
        headers['Authorization'] = `Bearer ${activeSessionJson}`;
        headers['X-Auth-Session'] = activeSessionJson;
      }
      if (options?.updatedBy) {
        headers['X-Admin-User'] = options.updatedBy;
      }

      try {
        const res = await fetch(targetEndpoint, {
          method: httpMethod,
          headers,
          body: JSON.stringify({
            ...updates,
            expectedVersion: options?.expectedVersion,
          }),
        });

        // 2. Handle Unauthorized / Forbidden (Active admin role in namespace required)
        if (res.status === 401 || res.status === 403) {
          const errPayload = (await res.json().catch(() => ({}))) as { message?: string; error?: string };
          const errorMsg =
            errPayload.message ||
            'Forbidden: Modifying the database requires an active administrator role in the namespace.';
          showToast(errorMsg, { type: 'error' });
          return {
            success: false,
            error: errorMsg,
          };
        }

        // 2. Handle Optimistic Concurrency Conflict (HTTP 409)
        if (res.status === 409) {
          const conflictData = (await res.json()) as {
            current?: T;
            currentTenant?: TenantRecord;
            message?: string;
          };
          const currentRecord = (conflictData.current || conflictData.currentTenant) as T | undefined;

          if (currentRecord) {
            applyEntityUpdate(resource, id, currentRecord as Record<string, unknown>);
          }

          showToast(APP_STRINGS.REALTIME.TXT_CONFLICT_DETECTED, {
            type: 'warning',
            ...(conflictData.message ? { description: conflictData.message } : {}),
          });

          return {
            success: false,
            conflict: true,
            current: currentRecord,
            error: conflictData.message || 'Concurrency conflict detected',
          };
        }

        // 3. Handle Successful Update
        if (res.ok) {
          const payload = (await res.json()) as {
            success?: boolean;
            data?: T;
            tenant?: TenantRecord;
            record?: T;
          } & T;

          // Resolve entity payload whether returned in wrapper or directly
          const updatedData = (payload.data || payload.tenant || payload.record || payload) as T;

          if (updatedData) {
            applyEntityUpdate(resource, id, updatedData as Record<string, unknown>);
            setLastSyncTime(Date.now());
          }

          if (options?.successMessage !== false) {
            const message = options?.successMessage || APP_STRINGS.REALTIME.TXT_PUBLISH_SUCCESS;
            showToast(message, { type: 'success' });
          }

          return { success: true, data: updatedData };
        }

        // 4. Handle HTTP Error
        const errPayload = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        return {
          success: false,
          error: (errPayload as { error?: string }).error || `Request failed with status ${res.status}`,
        };
      } catch (err) {
        // Fallback for network error / offline operation
        return {
          success: false,
          error: err instanceof Error ? err.message : 'Network error',
        };
      }
    },
    [applyEntityUpdate, showToast]
  );

  // Retrieve all records for any resource collection dynamically
  const getResourceData = useCallback(
    <T = unknown>(resource: string): T[] => {
      if (resource === 'tenants') return tenants as unknown as T[];
      if (resource === 'incidents') return incidents as unknown as T[];
      const collection = entities[resource];
      return collection ? (Object.values(collection) as T[]) : [];
    },
    [tenants, incidents, entities]
  );

  // Retrieve a single record from any resource collection dynamically
  const getResourceRecord = useCallback(
    <T = unknown>(resource: string, id: string): T | undefined => {
      if (resource === 'tenants') return tenants.find((t) => t.id === id) as unknown as T;
      if (resource === 'incidents') return incidents.find((i) => i.id === id) as unknown as T;
      return entities[resource]?.[id] as T | undefined;
    },
    [tenants, incidents, entities]
  );

  // Backward-compatible tenant update wrapper delegating to data-agnostic updateData
  const publishTenantUpdate = useCallback(
    async (
      id: string,
      updates: Partial<TenantRecord>,
      expectedVersion?: number | undefined
    ): Promise<{ success: boolean; conflict?: boolean | undefined; current?: TenantRecord | undefined }> => {
      const res = await updateData<TenantRecord>('tenants', id, updates, {
        expectedVersion,
        successMessage: APP_STRINGS.REALTIME.TXT_PUBLISH_SUCCESS,
      });
      return {
        success: res.success,
        conflict: res.conflict,
        current: res.current,
      };
    },
    [updateData]
  );

  // Backward-compatible score update wrapper delegating to data-agnostic updateData
  const updateTenantScore = useCallback(
    async (id: string, score: number, categories?: Partial<TenantScoreCategories>): Promise<boolean> => {
      const res = await updateData<TenantRecord>(
        'tenants',
        id,
        { overallScore: score, categories },
        {
          endpoint: `/api/tenants/${encodeURIComponent(id)}/score`,
          successMessage: APP_STRINGS.REALTIME.TXT_SCORE_UPDATED,
        }
      );
      return res.success;
    },
    [updateData]
  );

  // Backward-compatible incident status update delegating to data-agnostic updateData
  const updateIncidentStatus = useCallback(
    async (id: string, nextStatus: IncidentStatus): Promise<boolean> => {
      const res = await updateData<SecurityIncident>(
        'incidents',
        id,
        { status: nextStatus },
        {
          endpoint: `/api/incidents/${encodeURIComponent(id)}/status`,
          successMessage: false,
        }
      );
      return res.success;
    },
    [updateData]
  );

  // Simulate threat signal via backend database with live broadcast
  const simulateThreatSignal = useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch('/api/incidents/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        return true;
      }
    } catch {
      // Local fallback handled if server is unreachable
    }
    return false;
  }, []);

  // Trigger immediate enterprise telemetry pulse across all active visitors
  const triggerTelemetryPulse = useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch('/api/telemetry/pulse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        showToast(APP_STRINGS.REALTIME.TXT_PULSE_SUCCESS, { type: 'info' });
        return true;
      }
    } catch {
      // Fallback
    }
    return false;
  }, [showToast]);

  const isLive = status === 'connected';

  const contextValue = useMemo<RealtimeContextType>(
    () => ({
      status,
      isLive,
      activeVisitors,
      tenants,
      incidents,
      entities,
      lastSyncTime,
      updateData,
      getResourceData,
      getResourceRecord,
      updateTenantScore,
      publishTenantUpdate,
      simulateThreatSignal,
      updateIncidentStatus,
      triggerTelemetryPulse,
    }),
    [
      status,
      isLive,
      activeVisitors,
      tenants,
      incidents,
      entities,
      lastSyncTime,
      updateData,
      getResourceData,
      getResourceRecord,
      updateTenantScore,
      publishTenantUpdate,
      simulateThreatSignal,
      updateIncidentStatus,
      triggerTelemetryPulse,
    ]
  );

  return <RealtimeContext.Provider value={contextValue}>{children}</RealtimeContext.Provider>;
}

export function useRealtime(): RealtimeContextType {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return context;
}
