import React, { useCallback, useMemo, useState } from 'react';
import { DeploymentNetwork, InstanceConfigNetwork, NetworkAdapter, NetworkKind, NetworkType } from '@generated/core/schemas';
import { useGetInstancesInstanceIdConfigNetworks, usePostInstancesInstanceIdConfigNetworks, useDeleteInstancesInstanceIdConfigNetworksNetworkId } from '@generated/core/instances/instances';
import { useGetSystemNetworkAdapters } from '@generated/core/system/system';
import { useGetDeploymentsDeploymentIdNetworks, usePostDeploymentsDeploymentIdNetworks, usePostDeploymentsDeploymentIdNetworksNetworkIdDhcpIpv4 } from '@generated/core/deployments/deployments';
import { useQueryClient } from '@tanstack/react-query';
import NetworkConfigCard from './networks/NetworkConfigCard';
import HelpButton from '@app/layout/HelpButton';
import { instancenicconfig } from '@app/layout/helplinks';
import ActionSnackbar from '@app/components/ActionSnackbar';

export interface NetworkState { id: string; name: string; net_type: string; is_connected: boolean; networks: NetworkAdapter['networks']; deploymentNetworkName: string; ipAddress: string; is_activated: boolean; }
interface NetworkConfigTabProps { instanceId: string; onChange: (hasChanges: boolean) => void; }

const NetworkConfigTab: React.FC<NetworkConfigTabProps> = ({ instanceId, onChange }) => {
  const queryClient = useQueryClient();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarState, setSnackbarState] = useState({ snackbarText: 'Info', alertSeverity: 'success', clipBoardContent: '' });
  const { data: networkAdaptersResponse, isLoading: loadingAdapters } = useGetSystemNetworkAdapters();
  const { data: deploymentNetworksResponse, isLoading: loadingDeployments } = useGetDeploymentsDeploymentIdNetworks('default');
  const { data: instanceNetworksResponse, isLoading: loadingInstance } = useGetInstancesInstanceIdConfigNetworks(instanceId);
  const { mutateAsync: createDeploymentNetwork } = usePostDeploymentsDeploymentIdNetworks();
  const { mutateAsync: reserveIp } = usePostDeploymentsDeploymentIdNetworksNetworkIdDhcpIpv4();
  const { mutateAsync: connectNetwork } = usePostInstancesInstanceIdConfigNetworks();
  const { mutateAsync: disconnectNetwork } = useDeleteInstancesInstanceIdConfigNetworksNetworkId();
  const loading = loadingAdapters || loadingDeployments || loadingInstance;

  const networks: NetworkState[] = useMemo(() => {
    const adaptersData = networkAdaptersResponse?.data as NetworkAdapter[] | undefined;
    const deploymentsData = deploymentNetworksResponse?.data as DeploymentNetwork[] | undefined;
    const instanceData = instanceNetworksResponse?.data as InstanceConfigNetwork[] | undefined;
    if (!adaptersData || !deploymentsData || !instanceData) return [];
    const networkAdapters = adaptersData.map(a => ({ id: a.name, name: a.name, net_type: a.net_type, is_connected: a.is_connected, networks: a.networks || [] }));
    const deploymentNetworks = deploymentsData.map(n => ({ parent: n.parent || '', name: n.name || '', type: 'deployment' }));
    const instanceNetworks = instanceData.map(n => ({ name: n.name || '', ipAddress: n.ipAddress }));
    return networkAdapters.filter(a => a.net_type === NetworkType.wired || a.net_type === NetworkType.wireless).sort((a, b) => a.name.localeCompare(b.name)).map(adapter => {
      const dep = deploymentNetworks.find(n => n.parent === adapter.id);
      const inst = instanceNetworks.find(n => n.name === dep?.name);
      return { ...adapter, deploymentNetworkName: dep?.name || '', ipAddress: inst?.ipAddress || '', is_activated: !!inst?.ipAddress };
    });
  }, [networkAdaptersResponse, deploymentNetworksResponse, instanceNetworksResponse]);

  const invalidateAll = () => { queryClient.invalidateQueries({ queryKey: [`/instances/${instanceId}/config/networks`] }); queryClient.invalidateQueries({ queryKey: [`/deployments/default/networks`] }); queryClient.invalidateQueries({ queryKey: [`/system/network/adapters`] }); };

  const handleNetworkActivationChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>, id: string, name: string) => {
    const isActivated = event.target.checked;
    const network = networks.find(n => n.id === id);
    if (!network) return;
    let deploymentNetworkName = network.deploymentNetworkName;
    try {
      if (isActivated) {
        if (!deploymentNetworkName) { const n = `flecs-ipvlan_l2-${name}`; await createDeploymentNetwork({ deploymentId: 'default', data: { network_id: n, network_kind: NetworkKind.ipvlanl2, parent_adapter: name } }); deploymentNetworkName = n; }
        const ipRes = await reserveIp({ deploymentId: 'default', networkId: deploymentNetworkName });
        const ip = (ipRes.data as { ipv4_address: string }).ipv4_address;
        await connectNetwork({ instanceId, data: { network_id: deploymentNetworkName, ipAddress: ip } });
      } else { await disconnectNetwork({ instanceId, networkId: network.deploymentNetworkName }); }
      setSnackbarState({ alertSeverity: 'success', snackbarText: 'Network config saved!', clipBoardContent: '' }); invalidateAll();
    } catch { setSnackbarState({ alertSeverity: 'error', snackbarText: 'Failed to save Network config!', clipBoardContent: '' }); }
    finally { setSnackbarOpen(true); }
  }, [networks, instanceId]);

  if (loading) return <div className="animate-spin h-5 w-5 border-2 border-brand border-t-transparent rounded-full" />;
  return (
    <div>
      <div className="flex items-center gap-2 mb-4"><h6 className="text-base font-semibold">Connect Network Interface to App</h6><HelpButton url={instancenicconfig} /></div>
      <div>{networks.map(n => <NetworkConfigCard network={n} onActivationChange={handleNetworkActivationChange} key={n.id} />)}</div>
      <ActionSnackbar text={snackbarState.snackbarText} open={snackbarOpen} setOpen={setSnackbarOpen} alertSeverity={snackbarState.alertSeverity} />
    </div>
  );
};
export default NetworkConfigTab;
