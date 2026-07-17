import React from 'react';
import { Archive, Check, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { unwrapSuccess } from '@app/api/unwrap';
import ContentDialog from '@app/components/ContentDialog';
import { useTenant } from '@app/theme/TenantContext';
import Import from '@features/system/components/data-transfer/Import';
import Export from '@features/system/components/data-transfer/Export';
import ExportList from '@features/system/components/ExportList';
import SystemOverview, {
  SystemCard,
  SystemHeader,
  SystemSkeleton,
} from '@features/system/components/SystemOverview';
import {
  useGetSystemInfo,
  useGetSystemPing,
  useGetSystemVersion,
} from '@generated/core/system/system';
import {
  useGetDeviceLicenseActivationStatus,
  useGetDeviceLicenseInfo,
} from '@generated/core/device/device';

function formatTimestamp(value?: string | number | Date) {
  if (value === undefined || value === null || value === '') return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  }).format(date);
}

export default function System() {
  const { app_title: appTitle, links } = useTenant();
  const [exportOpen, setExportOpen] = React.useState(false);
  const [importOpen, setImportOpen] = React.useState(false);
  const { data: infoResponse, isPending: infoPending } = useGetSystemInfo({
    query: { staleTime: 60_000 },
  });
  const { data: versionResponse, isPending: versionPending } = useGetSystemVersion({
    query: { staleTime: 60_000 },
  });
  const { isSuccess: coreConnected, isError: coreError } = useGetSystemPing({
    query: { refetchInterval: 30_000, retry: 1 },
  });
  const { data: activationResponse, isPending: activationPending } =
    useGetDeviceLicenseActivationStatus({ query: { staleTime: 60_000 } });
  const activated = unwrapSuccess(activationResponse)?.isValid ?? false;
  const { data: licenseResponse, isPending: licensePending } = useGetDeviceLicenseInfo({
    query: { queryKey: ['/device/license/info', activated] },
  });

  const info = unwrapSuccess(infoResponse);
  const version = unwrapSuccess(versionResponse);
  const license = licenseResponse?.data;
  const renewedAt = formatTimestamp(license?.sessionId?.timestamp);
  const initialLoading = infoPending || versionPending || activationPending || licensePending;

  if (initialLoading) {
    return (
      <div className="w-full pb-16 pt-3 sm:pt-5 lg:pt-7">
        <SystemHeader appTitle={appTitle} />
        <SystemSkeleton />
      </div>
    );
  }

  return (
    <div className="w-full pb-16 pt-3 sm:pt-5 lg:pt-7">
      <SystemHeader appTitle={appTitle} />
      <SystemOverview
        appTitle={appTitle}
        hostname={window.location.hostname}
        platformSummary={[info?.arch, info?.platform].filter(Boolean).join(' · ')}
        kernelBuild={info?.kernel?.build}
        coreConnected={coreConnected}
        coreError={coreError}
        activated={activated}
        renewedAt={renewedAt}
        licenseKey={license?.license}
        sessionId={license?.sessionId?.id}
        coreVersion={version?.core}
        apiVersion={version?.api}
        architecture={info?.arch}
        distribution={info?.distro?.name}
        distributionVersion={info?.distro?.version}
        kernelVersion={info?.kernel?.version}
      />

      <SystemCard title="Backup & migration">
        <div className="flex flex-col items-start justify-between gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-[0.82rem] font-medium">Export this device</p>
            <p className="mt-0.5 text-xs text-muted">
              Bundle installed apps and their configurations into an archive.
            </p>
          </div>
          <button
            type="button"
            className="shrink-0 cursor-pointer rounded-md border border-brand bg-surface-raised px-3 py-1.5 text-xs font-medium text-brand transition hover:bg-brand/10"
            onClick={() => setExportOpen(true)}
          >
            Create backup
          </button>
        </div>
        <div className="flex flex-col items-start justify-between gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-[0.82rem] font-medium">Import to this device</p>
            <p className="mt-0.5 text-xs text-muted">
              Restore apps and configurations from an export archive.
            </p>
          </div>
          <button
            type="button"
            className="shrink-0 cursor-pointer rounded-md border border-brand bg-surface-raised px-3 py-1.5 text-xs font-medium text-brand transition hover:bg-brand/10"
            onClick={() => setImportOpen(true)}
          >
            Restore backup
          </button>
        </div>
        <div className="flex items-center gap-2 border-b border-border bg-surface-overlay px-5 py-2.5 text-[0.67rem] font-semibold uppercase tracking-[0.08em] text-muted">
          <Archive size={13} />
          Recent exports
        </div>
        <ExportList />
      </SystemCard>

      <footer className="mt-8 flex items-center gap-3 border-t border-border pt-4 text-xs text-muted">
        <Link
          to="/open-source"
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-1 transition-colors hover:text-brand"
        >
          Open-source licenses
          <ChevronRight size={12} className="transition group-hover:translate-x-0.5" />
        </Link>
        <span className="text-border-strong" aria-hidden="true">
          ·
        </span>
        <a
          href={links.docs}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-1 transition-colors hover:text-brand"
        >
          Docs
          <ChevronRight size={12} className="transition group-hover:translate-x-0.5" />
        </a>
      </footer>

      <ContentDialog
        open={exportOpen}
        setOpen={setExportOpen}
        title="Create a device backup"
        panelClassName="bg-surface-raised rounded-2xl max-w-lg w-[calc(100%-2rem)] max-h-[90vh] flex flex-col shadow-2xl border border-border"
        actions={
          <>
            <button
              type="button"
              className="inline-flex h-9 items-center rounded-lg border border-border px-4 py-2 text-xs font-medium transition hover:bg-surface-hover"
              onClick={() => setExportOpen(false)}
            >
              Cancel
            </button>
            <Export
              buttonText="Create backup"
              onExportStarted={() => setExportOpen(false)}
              className="!inline-flex !h-9 !items-center !gap-2 !whitespace-nowrap !rounded-lg !border-brand !bg-brand !px-4 !py-2 !text-xs !font-semibold !text-white hover:!bg-brand-end"
            />
          </>
        }
      >
        <div className="space-y-4 p-1">
          <div className="flex gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-brand/20 bg-brand/5 text-brand">
              <Archive size={16} />
            </span>
            <div>
              <p className="text-sm font-medium">Back up your app setup</p>
              <p className="mt-1 text-xs leading-relaxed text-muted">
                Download one portable archive that can restore this device or move its setup to
                another {appTitle} device.
              </p>
            </div>
          </div>
          <div className="rounded-lg border border-border px-4 py-3">
            <p className="text-xs font-medium">Included in this backup</p>
            <ul className="mt-2 space-y-1.5 text-xs text-muted">
              <li className="flex items-center gap-2">
                <Check size={12} className="text-success" />
                Installed apps
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
      <ContentDialog
        open={importOpen}
        setOpen={setImportOpen}
        title="Restore from a backup"
        panelClassName="bg-surface-raised rounded-2xl max-w-lg w-[calc(100%-2rem)] max-h-[90vh] flex flex-col shadow-2xl border border-border"
      >
        <div className="space-y-4 p-1">
          <div>
            <p className="text-sm font-medium">Choose a {appTitle} backup file</p>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              Upload a device archive to restore its apps and instance configuration here.
            </p>
          </div>
          <div className="[&_[data-testid=import-dropzone]]:min-h-32 [&_[data-testid=import-dropzone]]:cursor-pointer [&_[data-testid=import-dropzone]]:justify-center [&_[data-testid=import-dropzone]]:py-8 [&_[data-testid=import-dropzone]]:text-center">
            <Import
              dropzone
              buttonText="Drop a backup here or browse"
              onImportStarted={() => setImportOpen(false)}
            />
          </div>
          <p className="text-xs text-muted">
            Accepts .tar, .tar.gz, and {appTitle} onboarding .json files.
          </p>
          <p className="rounded-lg border border-warning/30 bg-warning/5 px-3.5 py-3 text-xs text-muted">
            Restoring may replace configuration for apps that already exist on this device.
          </p>
        </div>
      </ContentDialog>
    </div>
  );
}
