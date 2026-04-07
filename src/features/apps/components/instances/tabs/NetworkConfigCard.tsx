import React from 'react';
import { NetworkState } from './NetworkConfigTab';
import { X, CheckCircle2, Wifi, WifiOff } from 'lucide-react';

interface NetworkConfigCardProps { network: NetworkState; onActivationChange: (event: React.ChangeEvent<HTMLInputElement>, id: string, name: string) => void; }

const NetworkConfigCard: React.FC<NetworkConfigCardProps> = ({ network, onActivationChange }) => {
  const Icon = network.is_connected ? Wifi : WifiOff;
  return (
    <div className="flex items-center w-full p-4 mb-2 rounded-xl bg-dark-end border border-white/10">
      <span title={`Adapter ${network.name} ${network.is_connected ? 'connected' : 'not connected'}`}>
        <Icon style={{ marginRight: 16 }} color={network.is_activated ? 'var(--color-success)' : 'var(--color-error)'} size={24} />
      </span>
      <div className="flex-1 mr-2"><p className="text-sm font-medium">{network.name}</p><p className="text-xs text-muted">Adapter</p></div>
      {network.ipAddress && <div className="flex-1 mr-2"><p className="text-sm font-medium">{network.ipAddress}</p><p className="text-xs text-muted">IP Address</p></div>}
      <button className={`px-4 py-2 rounded-lg font-semibold transition inline-flex items-center gap-2 shrink-0 ${network.is_activated ? 'text-error hover:bg-error/10' : 'text-success hover:bg-success/10'}`} onClick={() => onActivationChange({ target: { checked: !network.is_activated } } as React.ChangeEvent<HTMLInputElement>, network.id, network.name)}>
        {network.is_activated ? <X size={18} /> : <CheckCircle2 size={18} />} {network.is_activated ? 'Disconnect' : 'Connect'}
      </button>
    </div>
  );
};
export default NetworkConfigCard;
