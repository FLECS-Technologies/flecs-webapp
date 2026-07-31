import React from 'react';
import { Check, Copy, Cpu, Globe2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import PageHeader from '@app/components/PageHeader';
import DeviceActivation from '@features/auth/components/DeviceActivation';
import redDeerMascot from '@assets/images/mascot-red-deer.svg?url';

interface SystemCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  id?: string;
  headingId?: string;
  tabIndex?: number;
}

export const SystemCard = React.forwardRef<HTMLElement, SystemCardProps>(function SystemCard(
  { title, children, className = '', id, headingId, tabIndex },
  ref,
) {
  const generatedHeadingId = React.useId();
  const resolvedHeadingId = headingId ?? generatedHeadingId;

  return (
    <section
      ref={ref}
      id={id}
      tabIndex={tabIndex}
      aria-labelledby={resolvedHeadingId}
      className={`overflow-hidden rounded-xl border border-border bg-surface-raised shadow-[0_1px_2px_rgba(0,0,0,0.03)] ${className}`}
    >
      <header className="flex min-h-14 items-center border-b border-border px-5">
        <h2 id={resolvedHeadingId} className="text-sm font-semibold tracking-[-0.01em]">
          {title}
        </h2>
      </header>
      {children}
    </section>
  );
});

export function SystemHeader({ appTitle }: { appTitle: string }) {
  return (
    <PageHeader
      title="System"
      description={`Device management and configuration for this ${appTitle} instance.`}
    />
  );
}

export function SystemSkeleton() {
  const line = 'animate-pulse rounded bg-surface-hover';
  return (
    <div role="status" aria-label="Loading system information" className="space-y-5">
      <div className="grid overflow-hidden rounded-xl border border-border lg:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div
            key={item}
            className="space-y-2 border-b border-border px-6 py-4 last:border-b-0 lg:border-b-0 lg:border-r lg:last:border-r-0"
          >
            <div className={`${line} h-3 w-20`} />
            <div className={`${line} h-4 w-3/5`} />
            <div className={`${line} h-3 w-2/5`} />
          </div>
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        {[0, 1].map((card) => (
          <div key={card} className="overflow-hidden rounded-xl border border-border">
            <div className="border-b border-border px-5 py-5">
              <div className={`${line} h-4 w-20`} />
            </div>
            <div className="space-y-4 px-5 py-5">
              {[0, 1, 2].map((row) => (
                <div key={row} className={`${line} h-4 w-full`} />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="overflow-hidden rounded-xl border border-border">
        <div className="border-b border-border px-5 py-5">
          <div className={`${line} h-4 w-28`} />
        </div>
        <div className="space-y-4 px-5 py-5">
          {[0, 1, 2, 3].map((row) => (
            <div key={row} className={`${line} h-4 w-full`} />
          ))}
        </div>
      </div>
    </div>
  );
}

function StatusDot({ state }: { state: 'ok' | 'warning' }) {
  return (
    <span
      className={`h-2 w-2 shrink-0 rounded-full ${state === 'ok' ? 'bg-success' : 'bg-warning'}`}
      aria-hidden="true"
    />
  );
}

function OverviewStat({
  icon,
  label,
  value,
  meta,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  meta?: React.ReactNode;
}) {
  return (
    <div className="min-w-0 border-b border-border px-5 py-4 last:border-b-0 sm:px-6 lg:border-b-0 lg:border-r lg:last:border-r-0">
      <div className="mb-2 flex items-center gap-2 text-xs text-muted">
        <span className="text-brand">{icon}</span>
        {label}
      </div>
      <div
        className="truncate font-mono text-[0.82rem] font-medium"
        title={typeof value === 'string' ? value : undefined}
      >
        {value}
      </div>
      {meta && <div className="mt-1 truncate text-xs text-muted">{meta}</div>}
    </div>
  );
}

function CopyValue({ value, label }: { value?: string; label: string }) {
  const [copied, setCopied] = React.useState(false);
  if (!value) return <span className="text-muted">Unavailable</span>;
  const displayValue = value.length > 24 ? `${value.slice(0, 10)}…${value.slice(-8)}` : value;

  return (
    <span className="flex min-w-0 items-center justify-end gap-2">
      <span className="truncate" title={value}>
        {displayValue}
      </span>
      <button
        type="button"
        className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-muted transition hover:bg-surface-hover hover:text-text-primary focus-visible:outline-2 focus-visible:outline-brand"
        aria-label={`Copy ${label.toLowerCase()}`}
        onClick={() => {
          navigator.clipboard?.writeText(value).then(() => toast.success(`${label} copied`));
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1200);
        }}
      >
        {copied ? <Check size={14} className="text-success" /> : <Copy size={13} />}
      </button>
    </span>
  );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid min-h-12 grid-cols-[minmax(100px,1fr)_minmax(0,1.5fr)] items-center gap-4 border-b border-border py-2.5 last:border-b-0">
      <dt className="text-[0.8rem] text-muted">{label}</dt>
      <dd className="min-w-0 text-right font-mono text-[0.76rem]">{children}</dd>
    </div>
  );
}

interface ReleaseInfo {
  semver: string;
  codenameKey: string;
  codename: string;
  build?: string;
}

/**
 * Split a build string like "5.3.0-red-deer-85332f2" into its release identity:
 * semver, a human codename ("Red Deer") plus its key ("red-deer"), and the short
 * commit that trails it. Returns null when there's nothing to show.
 */
function parseRelease(version?: string): ReleaseInfo | null {
  if (!version) return null;
  const [semver, ...rest] = version.split('-');
  if (rest.length === 0) return { semver, codenameKey: '', codename: '' };

  const last = rest[rest.length - 1];
  const build = /^[0-9a-f]{7,}$/i.test(last) ? last : undefined;
  const words = build ? rest.slice(0, -1) : rest;
  return {
    semver,
    codenameKey: words.join('-'),
    codename: words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    build,
  };
}

/**
 * Each FLECS release carries a mascot for its year. Keyed by codename so a future
 * release just adds its own entry (and drops its artwork in @assets/images).
 */
const RELEASE_MASCOTS: Record<string, { src: string; year: string }> = {
  'red-deer': { src: redDeerMascot, year: '2026' },
};

function ReleaseHero({ appTitle, coreVersion }: { appTitle: string; coreVersion?: string }) {
  const release = parseRelease(coreVersion ?? import.meta.env.VITE_APP_VERSION);
  const mascot = release?.codenameKey ? RELEASE_MASCOTS[release.codenameKey] : undefined;
  // Codename is the hero when there is one; otherwise fall back to the raw version
  // (never the card title, which already reads "appTitle" right above this).
  const heading = release?.codename || release?.semver || coreVersion || appTitle;
  const hasCodename = Boolean(release?.codename);

  return (
    <div className="group relative overflow-hidden border-b border-border">
      {/* Soft brand wash so the mascot reads as belonging in both light and dark. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand/[0.07] via-transparent to-transparent"
      />
      <div className="relative flex items-center justify-between gap-4 px-5 py-6">
        <div className="min-w-0">
          <h3
            className={`truncate text-2xl font-semibold leading-none tracking-[-0.02em] ${
              hasCodename ? 'text-brand' : ''
            }`}
          >
            {heading}
          </h3>
          {hasCodename && (
            <p className="mt-2.5 truncate font-mono text-[0.8rem]">
              <span className="text-text-primary">{release?.semver}</span>
              {release?.build && <span className="text-muted"> · build {release.build}</span>}
            </p>
          )}
        </div>
        {mascot && (
          <div className="relative shrink-0">
            <div
              aria-hidden="true"
              className="absolute inset-0 -m-3 rounded-full bg-brand/10 blur-xl"
            />
            <img
              src={mascot.src}
              alt={`${release?.codename} release mascot`}
              width={112}
              height={112}
              draggable={false}
              className="relative h-24 w-24 select-none drop-shadow-sm motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-out motion-safe:group-hover:-translate-y-1 sm:h-28 sm:w-28"
            />
          </div>
        )}
      </div>
    </div>
  );
}

interface SystemOverviewProps {
  appTitle: string;
  hostname: string;
  platformSummary: string;
  kernelBuild?: string;
  coreConnected: boolean;
  coreError: boolean;
  activated: boolean;
  renewedAt?: string;
  licenseKey?: string;
  sessionId?: string;
  coreVersion?: string;
  apiVersion?: string;
  architecture?: string;
  distribution?: string;
  distributionVersion?: string;
  kernelVersion?: string;
  onExportSbom: () => void;
}

export default function SystemOverview(props: SystemOverviewProps) {
  return (
    <>
      <section
        className="mb-5 grid overflow-hidden rounded-xl border border-border bg-surface-raised shadow-[0_1px_2px_rgba(0,0,0,0.03)] lg:grid-cols-3"
        aria-label="Device overview"
      >
        <OverviewStat
          icon={<Cpu size={14} />}
          label="Hostname"
          value={props.hostname}
          meta={
            <span className="inline-flex items-center gap-2">
              <StatusDot state={props.coreConnected ? 'ok' : 'warning'} />
              {props.coreConnected
                ? 'Core connected'
                : props.coreError
                  ? 'Core unreachable'
                  : 'Checking connection'}
            </span>
          }
        />
        <OverviewStat
          icon={<Globe2 size={14} />}
          label="Platform"
          value={props.platformSummary || 'Unavailable'}
          meta={props.kernelBuild ? `Kernel ${props.kernelBuild}` : 'Kernel information loading'}
        />
        <OverviewStat
          icon={<ShieldCheck size={14} />}
          label="License"
          value={
            <span className="inline-flex items-center gap-2">
              <StatusDot state={props.activated ? 'ok' : 'warning'} />
              {props.activated ? 'Activated' : 'Activation required'}
            </span>
          }
          meta={props.renewedAt ? `Renewed ${props.renewedAt}` : 'Renewal time unavailable'}
        />
      </section>

      <div className="mb-5 grid items-stretch gap-5 lg:grid-cols-2">
        <SystemCard title="License" className="flex flex-col">
          <dl className="flex-1 px-5 py-1">
            <DetailRow label="License key">
              <CopyValue value={props.licenseKey} label="License key" />
            </DetailRow>
            <DetailRow label="Session ID">
              <CopyValue value={props.sessionId} label="Session ID" />
            </DetailRow>
            <DetailRow label="Last renewal">
              {props.renewedAt ?? <span className="text-muted">Unavailable</span>}
            </DetailRow>
          </dl>
          {!props.activated && (
            <div className="border-t border-border px-5 py-4">
              <DeviceActivation variant="line" />
            </div>
          )}
        </SystemCard>

        <SystemCard title={`${props.appTitle} Version`} className="flex flex-col">
          <ReleaseHero appTitle={props.appTitle} coreVersion={props.coreVersion} />
          <dl className="flex-1 px-5 py-1">
            <DetailRow label="Core">{props.coreVersion ?? 'N/A'}</DetailRow>
            <DetailRow label="API">{props.apiVersion ?? 'N/A'}</DetailRow>
            <DetailRow label="Web app">{import.meta.env.VITE_APP_VERSION ?? 'N/A'}</DetailRow>
          </dl>
          <div className="flex items-center justify-between gap-4 border-t border-border px-5 py-3">
            <div>
              <p className="text-[0.8rem] font-medium">Software bill of materials</p>
              <p className="text-[0.7rem] text-muted">For compliance and security audits</p>
            </div>
            <button
              type="button"
              className="shrink-0 cursor-pointer rounded-md border border-brand bg-surface-raised px-3 py-1.5 text-xs font-medium text-brand transition hover:bg-brand/10"
              onClick={props.onExportSbom}
            >
              Export SBOM
            </button>
          </div>
        </SystemCard>
      </div>

      <SystemCard title="System details" className="mb-5">
        <dl className="px-5 py-1">
          <DetailRow label="Architecture">{props.architecture ?? 'Unavailable'}</DetailRow>
          <DetailRow label="Core runtime">
            {[props.distribution, props.distributionVersion].filter(Boolean).join(' ') ||
              'Not reported by Core'}
          </DetailRow>
          <DetailRow label="Kernel version">{props.kernelVersion ?? 'Unavailable'}</DetailRow>
          <DetailRow label="Kernel build">{props.kernelBuild ?? 'Unavailable'}</DetailRow>
        </dl>
      </SystemCard>
    </>
  );
}
