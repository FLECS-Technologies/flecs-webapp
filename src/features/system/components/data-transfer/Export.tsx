import React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Archive, Check, FolderDown, Search } from 'lucide-react';
import { toast } from 'sonner';
import ContentDialog from '@app/components/ContentDialog';
import { getErrorMessage } from '@app/api/fetch-error';
import { unwrapSuccess } from '@app/api/unwrap';
import { useQuestActions } from '@features/notifications/quests/hooks';
import { questStateFinishedOk } from '@features/notifications/quests/QuestItem';
import { useGetApps } from '@generated/core/apps/apps';
import { useGetInstances } from '@generated/core/instances/instances';
import {
  getGetExportsExportIdQueryOptions,
  getGetExportsQueryKey,
  usePostExports,
} from '@generated/core/flecsport/flecsport';
import { useGetProvidersAuth } from '@generated/core/experimental/experimental';
import type { AppKey, ExportRequest } from '@generated/core/schemas';

interface ExportProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  appTitle: string;
}

const appKeyId = (appKey: AppKey) => `${appKey.name}\u0000${appKey.version}`;

export default function Export({ open, setOpen, appTitle }: ExportProps) {
  const queryClient = useQueryClient();
  const { fetchQuest, waitForQuest } = useQuestActions();
  const [selectedAppIds, setSelectedAppIds] = React.useState<Set<string> | null>(null);
  const [search, setSearch] = React.useState('');
  const [waitingForQuest, setWaitingForQuest] = React.useState(false);
  const selectAllRef = React.useRef<HTMLInputElement>(null);

  const appsQuery = useGetApps({ query: { enabled: open } });
  const instancesQuery = useGetInstances(undefined, { query: { enabled: open } });
  const authQuery = useGetProvidersAuth({ query: { enabled: open, retry: false } });
  const createExport = usePostExports();

  const installedApps = React.useMemo(() => {
    const uniqueApps = new Map<string, AppKey>();
    for (const app of unwrapSuccess(appsQuery.data) ?? []) {
      if (app.status === 'installed') uniqueApps.set(appKeyId(app.appKey), app.appKey);
    }
    return [...uniqueApps.values()].sort((left, right) => {
      const nameOrder = left.name.localeCompare(right.name, undefined, { sensitivity: 'base' });
      return nameOrder || left.version.localeCompare(right.version, undefined, { numeric: true });
    });
  }, [appsQuery.data]);

  const installedAppIds = React.useMemo(
    () => installedApps.map((appKey) => appKeyId(appKey)),
    [installedApps],
  );

  const effectiveSelectedAppIds = React.useMemo(
    () => selectedAppIds ?? new Set(installedAppIds),
    [installedAppIds, selectedAppIds],
  );
  const selectedCount = effectiveSelectedAppIds.size;
  const allSelected = installedApps.length > 0 && selectedCount === installedApps.length;
  const partlySelected = selectedCount > 0 && !allSelected;

  React.useEffect(() => {
    if (selectAllRef.current) selectAllRef.current.indeterminate = partlySelected;
  }, [partlySelected]);

  const visibleApps = React.useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    if (!query) return installedApps;
    return installedApps.filter(
      (appKey) =>
        appKey.name.toLocaleLowerCase().includes(query) ||
        appKey.version.toLocaleLowerCase().includes(query),
    );
  }, [installedApps, search]);

  const instances = React.useMemo(
    () => unwrapSuccess(instancesQuery.data) ?? [],
    [instancesQuery.data],
  );
  const instanceCounts = React.useMemo(() => {
    const counts = new Map<string, number>();
    for (const instance of instances) {
      const key = appKeyId(instance.appKey);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return counts;
  }, [instances]);

  const loading = appsQuery.isPending || instancesQuery.isPending || authQuery.isPending;
  const loadError = appsQuery.isError || instancesQuery.isError;
  const exporting = createExport.isPending || waitingForQuest;

  const toggleApp = (appKey: AppKey) => {
    const key = appKeyId(appKey);
    setSelectedAppIds((current) => {
      const next = new Set(current ?? installedAppIds);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleAll = () => {
    setSelectedAppIds(allSelected ? new Set() : new Set(installedAppIds));
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setSelectedAppIds(null);
      setSearch('');
    }
    setOpen(nextOpen);
  };

  const handleExport = async () => {
    if (!effectiveSelectedAppIds.size || loading || loadError) return;

    const selectedApps = installedApps.filter((appKey) =>
      effectiveSelectedAppIds.has(appKeyId(appKey)),
    );
    const selectedIds = new Set(selectedApps.map((appKey) => appKeyId(appKey)));
    const auth = unwrapSuccess(authQuery.data);
    const authProviderId =
      auth?.core === 'Default'
        ? auth.default
        : auth?.core && auth.core !== 'Default'
          ? auth.core
          : null;
    const selectedInstanceIds = [
      ...new Set(
        instances
          .filter(
            (instance) =>
              selectedIds.has(appKeyId(instance.appKey)) && instance.instanceId !== authProviderId,
          )
          .map((instance) => instance.instanceId),
      ),
    ];
    const request: ExportRequest = {
      apps: selectedApps,
      instances: selectedInstanceIds,
    };

    setWaitingForQuest(true);
    try {
      const response = await createExport.mutateAsync({ data: request });
      const exportData = unwrapSuccess(response);
      if (!exportData) throw new Error('Export request failed');
      await fetchQuest(exportData.jobId);
      handleOpenChange(false);
      const result = await waitForQuest(exportData.jobId);
      if (!questStateFinishedOk(result.state)) {
        throw new Error(result.detail || 'Export quest failed');
      }
      if (!result.result || typeof result.result !== 'string') {
        throw new Error('Invalid export ID');
      }
      const downloadResponse = await queryClient.fetchQuery(
        getGetExportsExportIdQueryOptions(result.result, {
          query: { retry: false, staleTime: Infinity },
        }),
      );
      const blob = unwrapSuccess(downloadResponse);
      if (!blob) throw new Error('Could not download the export file');
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `flecs-export-${result.result}.tar`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);
      toast.success('App export downloaded');
      void queryClient.invalidateQueries({ queryKey: getGetExportsQueryKey() });
    } catch (error: unknown) {
      toast.error('Export failed', { description: getErrorMessage(error) });
    } finally {
      setWaitingForQuest(false);
    }
  };

  const exportButtonText =
    selectedCount === 0
      ? 'Select at least one app'
      : `Export ${selectedCount} app${selectedCount === 1 ? '' : 's'}`;

  return (
    <ContentDialog
      open={open}
      setOpen={handleOpenChange}
      title="Create backup"
      panelClassName="bg-surface-raised rounded-2xl max-w-2xl w-[calc(100%-2rem)] max-h-[90vh] flex flex-col shadow-2xl border border-border"
      actions={
        <>
          <button
            type="button"
            className="inline-flex h-9 items-center rounded-lg border border-border px-4 py-2 text-xs font-medium transition hover:bg-surface-hover"
            onClick={() => handleOpenChange(false)}
          >
            Cancel
          </button>
          <button
            type="button"
            className="inline-flex h-9 items-center gap-2 whitespace-nowrap rounded-lg border border-brand bg-brand px-4 py-2 text-xs font-semibold text-white transition hover:bg-brand-end disabled:cursor-not-allowed disabled:opacity-50"
            disabled={loading || loadError || selectedCount === 0 || exporting}
            onClick={handleExport}
          >
            {exporting ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <FolderDown size={15} />
            )}
            {exporting ? 'Creating export...' : exportButtonText}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-brand/20 bg-brand/5 text-brand">
            <Archive size={16} />
          </span>
          <div>
            <p className="text-sm font-medium">Choose apps for this export</p>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              Include every installed app or create a smaller archive with only the apps you need.
            </p>
          </div>
        </div>

        {loadError ? (
          <div className="rounded-lg border border-error/30 bg-error/5 px-4 py-4">
            <p className="text-sm font-medium text-error">
              Could not load the installed app setup.
            </p>
            <button
              type="button"
              className="mt-3 rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-surface-hover"
              onClick={() => {
                void appsQuery.refetch();
                void instancesQuery.refetch();
              }}
            >
              Try again
            </button>
          </div>
        ) : loading ? (
          <div
            role="status"
            aria-label="Loading installed apps"
            className="flex min-h-40 items-center justify-center rounded-lg border border-border"
          >
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-brand border-t-transparent" />
          </div>
        ) : installedApps.length === 0 ? (
          <div className="rounded-lg border border-border px-4 py-8 text-center">
            <p className="text-sm font-medium">No installed apps available to export.</p>
            <p className="mt-1 text-xs text-muted">
              You can still restore an existing {appTitle} archive from the System page.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border">
            <div className="space-y-3 border-b border-border bg-surface-overlay px-4 py-3">
              <label className="relative block">
                <Search
                  size={14}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                />
                <span className="sr-only">Search installed apps</span>
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search apps"
                  className="h-9 w-full rounded-md border border-border bg-surface-raised pl-9 pr-3 text-xs outline-none transition placeholder:text-muted focus:border-brand focus:ring-2 focus:ring-brand/15"
                />
              </label>
              <label className="flex cursor-pointer items-center gap-3 text-xs font-medium">
                <input
                  ref={selectAllRef}
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  aria-label="Select all apps"
                  className="h-4 w-4 accent-brand"
                />
                <span className="flex-1">Select all apps</span>
                <span className="font-normal text-muted">
                  {selectedCount} of {installedApps.length} apps selected
                </span>
              </label>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {visibleApps.length === 0 ? (
                <p className="px-4 py-8 text-center text-xs text-muted">
                  No apps match “{search.trim()}”.
                </p>
              ) : (
                <ul
                  className="divide-y divide-border"
                  aria-label="Installed apps available to export"
                >
                  {visibleApps.map((appKey) => {
                    const key = appKeyId(appKey);
                    const count = instanceCounts.get(key) ?? 0;
                    return (
                      <li key={key}>
                        <label className="flex cursor-pointer items-center gap-3 px-4 py-3 transition hover:bg-surface-hover">
                          <input
                            type="checkbox"
                            checked={effectiveSelectedAppIds.has(key)}
                            onChange={() => toggleApp(appKey)}
                            aria-label={`${appKey.name} ${appKey.version}`}
                            className="h-4 w-4 shrink-0 accent-brand"
                          />
                          <span className="min-w-0 flex-1">
                            <span
                              className="block truncate text-xs font-medium"
                              title={appKey.name}
                            >
                              {appKey.name}
                            </span>
                            <span className="mt-0.5 block font-mono text-[0.7rem] text-muted">
                              {appKey.version}
                            </span>
                          </span>
                          <span className="shrink-0 text-[0.7rem] text-muted">
                            {count} instance{count === 1 ? '' : 's'}
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        )}

        <div className="rounded-lg border border-border px-4 py-3">
          <p className="text-xs font-medium">Included for each selected app</p>
          <ul className="mt-2 space-y-1.5 text-xs text-muted">
            <li className="flex items-center gap-2">
              <Check size={12} className="text-success" />
              Installed app package
            </li>
            <li className="flex items-center gap-2">
              <Check size={12} className="text-success" />
              Instance configuration
            </li>
          </ul>
        </div>
        <p className="text-xs leading-relaxed text-muted">
          Sign-in services are excluded so each device keeps its own authentication setup.
        </p>
      </div>
    </ContentDialog>
  );
}
