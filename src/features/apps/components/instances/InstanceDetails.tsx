import CollapsableRow from '@app/components/CollapsableRow';
import VolumesTable from './VolumesTable';
import HostContainerTable from './HostContainerTable';
import { useGetInstancesInstanceId } from '@generated/core/instances/instances';
import type { AppInstance } from '@generated/core/schemas';
import { unwrapSuccess } from '@app/api/unwrap';
import { getErrorMessage } from '@app/api/fetch-error';

interface InstanceDetailsProps {
  instance: AppInstance;
}

export default function InstanceDetails({ instance }: InstanceDetailsProps) {
  const { data, error, isPending } = useGetInstancesInstanceId(instance.instanceId, {
    query: { retry: false, staleTime: 30_000 },
  });
  const details = unwrapSuccess(data);
  const networkDetails = [
    { name: 'IP address', info: details?.ipAddress },
    { name: 'Hostname', info: details?.hostname },
  ].filter((row) => row.info);
  const hasResources = Boolean(
    details?.ports?.length || details?.volumes?.length || details?.configFiles?.length,
  );

  if (isPending) {
    return (
      <div className="space-y-2" aria-label="Loading instance details">
        <div className="h-4 w-32 animate-pulse rounded bg-surface-hover" />
        <div className="h-24 animate-pulse rounded-xl border border-border bg-surface-subtle" />
      </div>
    );
  }

  if (error) {
    return (
      <div
        role="alert"
        className="rounded-xl border border-error/25 bg-error/5 px-4 py-3 text-sm text-error"
      >
        Could not load additional instance details. {getErrorMessage(error)}
      </div>
    );
  }

  return (
    <div className="space-y-5" aria-label="Instance details">
      {networkDetails.length > 0 && (
        <section aria-labelledby="network-information-heading">
          <h4
            id="network-information-heading"
            className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted"
          >
            Network
          </h4>
          <dl className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface-subtle">
            {networkDetails.map((row) => (
              <div
                key={row.name}
                className="grid gap-1 px-4 py-3 text-sm sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-4"
              >
                <dt className="text-muted">{row.name}</dt>
                <dd className="break-all font-mono text-xs font-medium text-text-primary">
                  {row.info}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {hasResources && (
        <section aria-labelledby="instance-resources-heading">
          <h4
            id="instance-resources-heading"
            className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted"
          >
            Resources
          </h4>
          <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface-subtle">
            {(details?.ports?.length ?? 0) > 0 && (
              <CollapsableRow title="Ports">
                <HostContainerTable data={details?.ports ?? []} />
              </CollapsableRow>
            )}
            {(details?.volumes?.length ?? 0) > 0 && (
              <CollapsableRow title="Volumes">
                <VolumesTable volumes={details?.volumes ?? []} />
              </CollapsableRow>
            )}
            {(details?.configFiles?.length ?? 0) > 0 && (
              <CollapsableRow title="Configuration files">
                <HostContainerTable data={details?.configFiles ?? []} />
              </CollapsableRow>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
