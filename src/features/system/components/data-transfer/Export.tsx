import React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Archive, FolderDown, Search } from 'lucide-react';
import { toast } from 'sonner';
import ContentDialog from '@app/components/ContentDialog';
import { getErrorMessage } from '@app/api/fetch-error';
import { unwrapSuccess } from '@app/api/unwrap';
import { useTenant } from '@app/theme/TenantContext';
import { enrichInstalledApps } from '@features/apps/app-queries';
import InstalledAppIdentity from '@features/apps/components/InstalledAppIdentity';
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
import { useGetApiV2ProductsApps } from '@generated/console/products/products';
import type { AppInstance, AppKey, ExportRequest } from '@generated/core/schemas';
import type { GetApiV2ProductsAppsParams } from '@generated/console/schemas';

interface ExportProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  appTitle: string;
}

const appKeyId = (appKey: AppKey) => `${appKey.name}\u0000${appKey.version}`;
const instanceLabel = (instance: AppInstance) =>
  instance.instanceName.trim() || `Instance ${instance.instanceId}`;

export default function Export({ open, setOpen, appTitle }: ExportProps) {
  const queryClient = useQueryClient();
  const { vendor_id } = useTenant();
  const { fetchQuest, waitForQuest } = useQuestActions();
  const [selectedInstanceIds, setSelectedInstanceIds] = React.useState<Set<string> | null>(null);
  const [search, setSearch] = React.useState('');
  const [waitingForQuest, setWaitingForQuest] = React.useState(false);
  const selectAllRef = React.useRef<HTMLInputElement>(null);
  const marketplaceParams: GetApiV2ProductsAppsParams | undefined =
    vendor_id > 0 ? { store_id: vendor_id } : undefined;

  const appsQuery = useGetApps({ query: { enabled: open } });
  const instancesQuery = useGetInstances(undefined, { query: { enabled: open } });
  const authQuery = useGetProvidersAuth({ query: { enabled: open, retry: false } });
  const productsQuery = useGetApiV2ProductsApps(marketplaceParams, {
    query: { enabled: open, staleTime: 300_000 },
  });
  const createExport = usePostExports();

  const apps = React.useMemo(() => unwrapSuccess(appsQuery.data) ?? [], [appsQuery.data]);
  const instances = React.useMemo(
    () => unwrapSuccess(instancesQuery.data) ?? [],
    [instancesQuery.data],
  );
  const products = React.useMemo(
    () => unwrapSuccess(productsQuery.data)?.data?.products ?? [],
    [productsQuery.data],
  );
  const installedApps = React.useMemo(
    () =>
      enrichInstalledApps(products, apps, instances)
        .filter((app) => app.status === 'installed')
        .sort((left, right) => {
          const leftTitle = left.title ?? left.appKey.name;
          const rightTitle = right.title ?? right.appKey.name;
          const titleOrder = leftTitle.localeCompare(rightTitle, undefined, {
            sensitivity: 'base',
          });
          return (
            titleOrder ||
            left.appKey.version.localeCompare(right.appKey.version, undefined, { numeric: true })
          );
        }),
    [apps, instances, products],
  );

  const auth = unwrapSuccess(authQuery.data);
  const authProviderId =
    auth?.core === 'Default'
      ? auth.default
      : auth?.core && auth.core !== 'Default'
        ? auth.core
        : null;
  const instanceRows = React.useMemo(
    () =>
      installedApps.flatMap((app) =>
        instances
          .filter(
            (instance) =>
              appKeyId(instance.appKey) === appKeyId(app.appKey) &&
              instance.instanceId !== authProviderId,
          )
          .sort((left, right) => {
            const nameOrder = instanceLabel(left).localeCompare(instanceLabel(right), undefined, {
              sensitivity: 'base',
            });
            return nameOrder || left.instanceId.localeCompare(right.instanceId);
          })
          .map((instance) => ({ app, instance })),
      ),
    [authProviderId, installedApps, instances],
  );
  const instanceIds = React.useMemo(
    () => instanceRows.map(({ instance }) => instance.instanceId),
    [instanceRows],
  );
  const instanceCountsByApp = React.useMemo(() => {
    const counts = new Map<string, number>();
    for (const { app } of instanceRows) {
      const appId = appKeyId(app.appKey);
      counts.set(appId, (counts.get(appId) ?? 0) + 1);
    }
    return counts;
  }, [instanceRows]);
  const effectiveSelectedInstanceIds = React.useMemo(
    () => selectedInstanceIds ?? new Set(instanceIds),
    [instanceIds, selectedInstanceIds],
  );
  const selectedInstanceCount = effectiveSelectedInstanceIds.size;
  const allSelected = instanceRows.length > 0 && selectedInstanceCount === instanceRows.length;
  const partlySelected = selectedInstanceCount > 0 && !allSelected;

  React.useEffect(() => {
    if (selectAllRef.current) selectAllRef.current.indeterminate = partlySelected;
  }, [partlySelected]);

  const visibleInstanceRows = React.useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    if (!query) return instanceRows;
    return instanceRows.filter(({ app, instance }) =>
      [
        app.title,
        app.author,
        app.appKey.name,
        app.appKey.version,
        instanceLabel(instance),
        instance.instanceId,
      ].some((value) => value?.toLocaleLowerCase().includes(query)),
    );
  }, [instanceRows, search]);

  const loading =
    appsQuery.isPending ||
    instancesQuery.isPending ||
    authQuery.isPending ||
    productsQuery.isPending;
  const loadError = appsQuery.isError || instancesQuery.isError;
  const exporting = createExport.isPending || waitingForQuest;

  const toggleInstance = (instance: AppInstance) => {
    setSelectedInstanceIds((current) => {
      const next = new Set(current ?? instanceIds);
      if (next.has(instance.instanceId)) next.delete(instance.instanceId);
      else next.add(instance.instanceId);
      return next;
    });
  };

  const toggleAll = () => {
    setSelectedInstanceIds(allSelected ? new Set() : new Set(instanceIds));
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setSelectedInstanceIds(null);
      setSearch('');
    }
    setOpen(nextOpen);
  };

  const handleExport = async () => {
    if (!selectedInstanceCount || loading || loadError) return;

    const selectedInstances = instanceRows
      .map(({ instance }) => instance)
      .filter((instance) => effectiveSelectedInstanceIds.has(instance.instanceId));
    const selectedAppIds = new Set(selectedInstances.map((instance) => appKeyId(instance.appKey)));
    const request: ExportRequest = {
      apps: installedApps
        .filter((app) => selectedAppIds.has(appKeyId(app.appKey)))
        .map((app) => app.appKey),
      instances: selectedInstances.map((instance) => instance.instanceId),
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
      toast.success('Backup downloaded');
      void queryClient.invalidateQueries({ queryKey: getGetExportsQueryKey() });
    } catch (error: unknown) {
      toast.error('Backup failed', { description: getErrorMessage(error) });
    } finally {
      setWaitingForQuest(false);
    }
  };

  const exportButtonText =
    selectedInstanceCount === 0 ? 'Select at least one app' : 'Create backup';

  return (
    <ContentDialog
      open={open}
      setOpen={handleOpenChange}
      title="Create backup"
      panelClassName="bg-surface-raised rounded-2xl max-w-3xl w-[calc(100%-2rem)] max-h-[90vh] flex flex-col shadow-2xl border border-border"
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
            disabled={loading || loadError || selectedInstanceCount === 0 || exporting}
            onClick={handleExport}
          >
            {exporting ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <FolderDown size={15} />
            )}
            {exporting ? 'Creating backup...' : exportButtonText}
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
            <p className="text-sm font-medium">Choose apps</p>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              Everything each app needs to run is bundled in automatically.
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
            aria-label="Loading apps"
            className="flex min-h-40 items-center justify-center rounded-xl border border-border"
          >
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-brand border-t-transparent" />
          </div>
        ) : instanceRows.length === 0 ? (
          <div className="rounded-xl border border-border px-4 py-8 text-center">
            <p className="text-sm font-medium">No apps available to back up.</p>
            <p className="mt-1 text-xs text-muted">
              You can still restore an existing {appTitle} backup from the System page.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border">
            <div className="space-y-3 border-b border-border bg-surface-overlay px-5 py-3">
              <label className="relative block">
                <Search
                  size={14}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                />
                <span className="sr-only">Search apps</span>
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
                  {selectedInstanceCount} app{selectedInstanceCount === 1 ? '' : 's'} selected
                </span>
              </label>
            </div>
            <div className="max-h-[25rem] overflow-y-auto">
              {visibleInstanceRows.length === 0 ? (
                <p className="px-4 py-8 text-center text-xs text-muted">
                  No apps match “{search.trim()}”.
                </p>
              ) : (
                <ul className="divide-y divide-border" aria-label="Apps to back up">
                  {visibleInstanceRows.map(({ app, instance }) => {
                    const title = app.title ?? app.appKey.name;
                    const label = instanceLabel(instance);
                    return (
                      <li key={instance.instanceId}>
                        <label className="flex cursor-pointer items-center gap-4 px-5 py-3 transition hover:bg-surface-hover">
                          <input
                            type="checkbox"
                            checked={effectiveSelectedInstanceIds.has(instance.instanceId)}
                            onChange={() => toggleInstance(instance)}
                            aria-label={`Include ${title} ${label}`}
                            className="h-4 w-4 shrink-0 accent-brand"
                          />
                          <InstalledAppIdentity
                            app={app}
                            instance={instance}
                            instanceDisplayName={
                              (instanceCountsByApp.get(appKeyId(app.appKey)) ?? 0) > 1
                                ? label
                                : undefined
                            }
                            showStatus={false}
                          />
                        </label>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </ContentDialog>
  );
}
