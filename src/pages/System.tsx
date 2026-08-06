import React from 'react';
import { ArrowRight, Archive, ChevronRight } from 'lucide-react';
import { Link, useLocation } from 'react-router';
import { unwrapSuccess } from '@app/api/unwrap';
import ContentDialog from '@app/components/ContentDialog';
import { useTenant } from '@app/theme/TenantContext';
import Import from '@features/system/components/data-transfer/Import';
import Export from '@features/system/components/data-transfer/Export';
import ExportList from '@features/system/components/ExportList';
import SbomDialog from '@features/system/components/SbomDialog';
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
  const { search } = useLocation();
  const backupMigrationRef = React.useRef<HTMLElement>(null);
  const [sbomOpen, setSbomOpen] = React.useState(false);
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

  React.useEffect(() => {
    if (initialLoading) return;
    if (new URLSearchParams(search).get('section') !== 'backup-migration') return;

    const frame = window.requestAnimationFrame(() => {
      const section = backupMigrationRef.current;
      if (!section) return;
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      section.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      section.focus({ preventScroll: true });
      if (!reduceMotion) {
        section.animate?.(
          [
            { boxShadow: '0 0 0 2px color-mix(in srgb, var(--color-brand) 45%, transparent)' },
            { boxShadow: '0 0 0 0 transparent' },
          ],
          { duration: 1_200, easing: 'ease-out' },
        );
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, [initialLoading, search]);

  if (initialLoading) {
    return (
      <div className="w-full pb-16">
        <SystemHeader appTitle={appTitle} />
        <SystemSkeleton />
      </div>
    );
  }

  return (
    <div className="w-full pb-16">
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
        onExportSbom={() => setSbomOpen(true)}
      />

      <SystemCard
        ref={backupMigrationRef}
        id="backup-migration"
        headingId="backup-migration-heading"
        title="Backup & migration"
        tabIndex={-1}
        className="scroll-mt-5 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        <div className="flex flex-col items-start justify-between gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-[0.82rem] font-medium">Create a backup</p>
            <p className="mt-0.5 text-xs text-muted">
              Bundle installed apps and their configuration into an archive to keep or move to
              another device.
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
            <p className="text-[0.82rem] font-medium">Restore from a backup</p>
            <p className="mt-0.5 text-xs text-muted">
              Restore apps and configuration from a backup archive.
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
          Recent backups
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
          <span className="relative h-3 w-3 shrink-0">
            <ChevronRight
              size={12}
              className="absolute inset-0 transition-all duration-200 ease-out group-hover:scale-75 group-hover:opacity-0"
            />
            <ArrowRight
              size={12}
              className="absolute inset-0 scale-75 opacity-0 transition-all duration-200 ease-out group-hover:scale-100 group-hover:opacity-100"
            />
          </span>
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
          <span className="relative h-3 w-3 shrink-0">
            <ChevronRight
              size={12}
              className="absolute inset-0 transition-all duration-200 ease-out group-hover:scale-75 group-hover:opacity-0"
            />
            <ArrowRight
              size={12}
              className="absolute inset-0 scale-75 opacity-0 transition-all duration-200 ease-out group-hover:scale-100 group-hover:opacity-100"
            />
          </span>
        </a>
      </footer>

      <SbomDialog
        open={sbomOpen}
        coreVersion={version?.core}
        appTitle={appTitle}
        onClose={() => setSbomOpen(false)}
      />
      <Export open={exportOpen} setOpen={setExportOpen} appTitle={appTitle} />
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
              Upload a backup archive to restore its apps and their configuration. This may replace
              configuration for apps that already exist on this device.
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
        </div>
      </ContentDialog>
    </div>
  );
}
