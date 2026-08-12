import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { Check, RefreshCw } from 'lucide-react';
import InstanceDetails from './InstanceDetails';
import InstanceLog from './InstanceLog';
import type { AppInstance } from '@generated/core/schemas';
import { useGetInstancesInstanceIdLogs } from '@generated/core/instances/instances';
import ContentDialog from '@app/components/ContentDialog';
import { unwrapSuccess } from '@app/api/unwrap';
import { getErrorMessage } from '@app/api/fetch-error';

interface InstanceInfoProps {
  instance: AppInstance;
  open: boolean;
  setOpen: (open: boolean) => void;
}

type InfoTab = 'general' | 'log';

export default function InstanceInfo({ instance, open, setOpen }: InstanceInfoProps) {
  const [tab, setTab] = useState<InfoTab>('general');
  const generalTabRef = useRef<HTMLButtonElement>(null);
  const logTabRef = useRef<HTMLButtonElement>(null);
  const refreshFeedbackTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [refreshSucceeded, setRefreshSucceeded] = useState(false);
  const [refreshAnimating, setRefreshAnimating] = useState(false);
  const generalPanelId = useId();
  const logPanelId = useId();
  const generalTabId = useId();
  const logTabId = useId();
  const {
    data: logResponse,
    error: logError,
    isFetching: logFetching,
    refetch: refreshLog,
  } = useGetInstancesInstanceIdLogs(instance.instanceId, {
    query: {
      enabled: open && tab === 'log',
      retry: false,
    },
  });
  const logs = unwrapSuccess(logResponse);
  const receivedLogText = [logs?.stdout, logs?.stderr].filter(Boolean).join('\n');
  const logText = receivedLogText || (logFetching ? '' : 'No log available.');
  const refreshBusy = logFetching || refreshAnimating;

  useEffect(
    () => () => {
      if (refreshFeedbackTimerRef.current) clearTimeout(refreshFeedbackTimerRef.current);
    },
    [],
  );

  const handleRefreshLog = async () => {
    setRefreshSucceeded(false);
    setRefreshAnimating(true);
    const startedAt = performance.now();
    let result: Awaited<ReturnType<typeof refreshLog>> | undefined;
    try {
      result = await refreshLog();
    } finally {
      const remainingAnimationMs = Math.max(0, 200 - (performance.now() - startedAt));
      if (remainingAnimationMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, remainingAnimationMs));
      }
      setRefreshAnimating(false);
    }
    if (!result?.isSuccess) return;
    setRefreshSucceeded(true);
    if (refreshFeedbackTimerRef.current) clearTimeout(refreshFeedbackTimerRef.current);
    refreshFeedbackTimerRef.current = setTimeout(() => setRefreshSucceeded(false), 1_400);
  };

  const selectTab = (nextTab: InfoTab, focus = false) => {
    setTab(nextTab);
    if (focus) {
      requestAnimationFrame(() =>
        (nextTab === 'general' ? generalTabRef : logTabRef).current?.focus(),
      );
    }
  };

  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const nextTab =
      event.key === 'Home'
        ? 'general'
        : event.key === 'End'
          ? 'log'
          : tab === 'general'
            ? 'log'
            : 'general';
    selectTab(nextTab, true);
  };

  const infoRows = [
    { name: 'Instance name', info: instance.instanceName || 'Not named' },
    { name: 'Version', info: instance.appKey.version, mono: true },
    { name: 'Instance ID', info: instance.instanceId, mono: true },
    { name: 'Status', info: instance.status },
    { name: 'Desired status', info: instance.desired },
  ];

  const actions = (
    <div className="flex w-full justify-end">
      <button
        type="button"
        className="rounded-lg px-4 py-2 text-sm font-semibold text-muted transition hover:bg-surface-hover hover:text-text-primary"
        onClick={() => setOpen(false)}
      >
        Close
      </button>
    </div>
  );

  return (
    <ContentDialog
      title="Info & logs"
      open={open}
      setOpen={setOpen}
      actions={actions}
      headerCloseButton
      panelClassName="flex h-[min(42rem,90vh)] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-border bg-surface-raised shadow-2xl"
      contentClassName="min-h-0 flex-1 overflow-hidden border-b border-border px-6 py-4"
    >
      <div className="flex h-full min-h-0 w-full flex-col">
        <div
          role="tablist"
          aria-label="Instance information"
          className="mb-4 flex shrink-0 border-b border-border"
        >
          <button
            ref={generalTabRef}
            id={generalTabId}
            role="tab"
            aria-controls={generalPanelId}
            aria-selected={tab === 'general'}
            tabIndex={tab === 'general' ? 0 : -1}
            onClick={() => selectTab('general')}
            onKeyDown={handleTabKeyDown}
            className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 ${tab === 'general' ? 'border-brand text-text-primary' : 'border-transparent text-muted hover:border-border-strong hover:text-text-primary'}`}
          >
            General
          </button>
          <button
            ref={logTabRef}
            id={logTabId}
            role="tab"
            aria-controls={logPanelId}
            aria-selected={tab === 'log'}
            tabIndex={tab === 'log' ? 0 : -1}
            onClick={() => selectTab('log')}
            onKeyDown={handleTabKeyDown}
            className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 ${tab === 'log' ? 'border-brand text-text-primary' : 'border-transparent text-muted hover:border-border-strong hover:text-text-primary'}`}
          >
            Log
          </button>
        </div>
        {tab === 'general' && (
          <div
            id={generalPanelId}
            role="tabpanel"
            aria-labelledby={generalTabId}
            className="min-h-0 flex-1 space-y-5 overflow-auto pr-1 [scrollbar-gutter:stable]"
          >
            <section aria-labelledby="instance-overview-heading">
              <h4
                id="instance-overview-heading"
                className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted"
              >
                Overview
              </h4>
              <dl className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface-subtle">
                {infoRows.map((row) => (
                  <div
                    key={row.name}
                    className="grid gap-1 px-4 py-3 text-sm sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-4"
                  >
                    <dt className="text-muted">{row.name}</dt>
                    <dd
                      className={`min-w-0 break-words font-medium text-text-primary ${row.mono ? 'font-mono text-xs' : ''}`}
                    >
                      {row.info}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
            <InstanceDetails instance={instance} />
          </div>
        )}
        {tab === 'log' && (
          <div
            id={logPanelId}
            role="tabpanel"
            aria-labelledby={logTabId}
            className="flex min-h-0 flex-1 flex-col"
          >
            <InstanceLog
              text={logText}
              loading={logFetching}
              error={
                logError ? `Could not refresh the log. ${getErrorMessage(logError)}` : undefined
              }
            />
            <div className="flex min-h-8 shrink-0 items-center gap-2 pt-3">
              <button
                type="button"
                aria-label={refreshBusy ? 'Refreshing log' : 'Refresh log'}
                className="inline-flex h-8 w-[7.25rem] items-center justify-center gap-1.5 rounded-md px-2.5 text-xs font-medium text-muted transition-colors duration-150 hover:bg-surface-hover hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 disabled:opacity-60"
                disabled={refreshBusy}
                onClick={() => void handleRefreshLog()}
              >
                <RefreshCw
                  size={14}
                  className={
                    refreshBusy
                      ? 'animate-[spin_400ms_linear_infinite] motion-reduce:animate-none'
                      : undefined
                  }
                />
                {refreshBusy ? 'Refreshing...' : 'Refresh log'}
              </button>
              {refreshSucceeded && (
                <span
                  role="status"
                  aria-label="Log refreshed successfully"
                  className="inline-flex items-center gap-1 text-xs font-medium text-success animate-[log-refresh-success_220ms_cubic-bezier(0.2,0.8,0.2,1)] motion-reduce:animate-none"
                >
                  <Check size={14} />
                  Updated
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </ContentDialog>
  );
}
