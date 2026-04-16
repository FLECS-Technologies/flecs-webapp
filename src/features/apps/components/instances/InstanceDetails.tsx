import React from 'react';
import CollapsableRow from '@app/components/CollapsableRow';
import VolumesTable from './VolumesTable';
import HostContainerTable from './HostContainerTable';
import { getInstancesInstanceId } from '@generated/core/instances/instances';
import type { AppInstance, GetInstancesInstanceId200 } from '@generated/core/schemas';
import { unwrapSuccess } from '@app/api/unwrap';

interface NetworkRow { name: string; info: string; }

interface InstanceDetailsProps {
  instance: AppInstance;
}

export default function InstanceDetails({ instance }: InstanceDetailsProps) {
  const executedRef = React.useRef(false);
  const [loadingDetails, setLoadingDetails] = React.useState(false);
  const [reloadDetails, setReloadDetails] = React.useState(false);
  const [networkDetails, setNetworkDetails] = React.useState<NetworkRow[]>([]);
  const [instanceDetails, setInstanceDetails] = React.useState<GetInstancesInstanceId200 | undefined>();

  React.useEffect(() => { if (executedRef.current) return; if (!loadingDetails) fetchDetails(); if (reloadDetails) setReloadDetails(false); executedRef.current = true; }, [reloadDetails]);

  const fetchDetails = async () => {
    setLoadingDetails(true);
    getInstancesInstanceId(instance.instanceId)
      .then((response) => { const data = unwrapSuccess(response); setNetworkDetails([{ name: 'IP Address', info: data?.ipAddress ?? '' }, { name: 'Hostname', info: data?.hostname ?? '' }]); setInstanceDetails(data); })
      .catch(console.log)
      .finally(() => setLoadingDetails(false));
  };

  return (
    <div className="overflow-x-auto" aria-label="instance-details-container">
      {networkDetails.length > 0 && (
        <table className="w-full text-sm">
          <thead><tr className="border-b border-white/10"><td className="px-4 py-2 font-semibold" colSpan={2}>Network information</td></tr></thead>
          <tbody>
            {networkDetails.map(row => <tr key={row.name}><td className="px-4 py-2">{row.name}</td><td className="px-4 py-2">{row.info}</td></tr>)}
            {(instanceDetails?.ports?.length ?? 0) > 0 && <CollapsableRow title="Ports"><HostContainerTable data={instanceDetails?.ports ?? []} /></CollapsableRow>}
          </tbody>
        </table>
      )}
      <table className="w-full text-sm">
        <thead><tr className="border-b border-white/10"><td className="px-4 py-2 font-semibold" colSpan={2}>Storage</td></tr></thead>
        <tbody>
          {(instanceDetails?.volumes?.length ?? 0) > 0 && <CollapsableRow title="Volumes"><VolumesTable volumes={instanceDetails?.volumes ?? []} /></CollapsableRow>}
          {(instanceDetails?.configFiles?.length ?? 0) > 0 && <CollapsableRow title="Configuration Files"><HostContainerTable data={instanceDetails?.configFiles ?? []} /></CollapsableRow>}
        </tbody>
      </table>
    </div>
  );
}
