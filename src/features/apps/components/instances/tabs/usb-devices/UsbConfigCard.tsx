import React from 'react';
import { X, CheckCircle2, Usb } from 'lucide-react';
import { UsbDevice } from '../UsbConfigTab';

interface UsbConfigCardProps { device: UsbDevice; onEnable: (port: string, enabled: boolean) => void; }

const UsbConfigCard: React.FC<UsbConfigCardProps> = ({ device, onEnable }) => {
  return (
    <div className="flex items-center w-full p-4 mb-2 rounded-xl bg-dark-end border border-white/10">
      <span title={`USB device ${device.name} ${device.enabled ? 'enabled in app' : 'disabled in app'}`}>
        <Usb style={{ marginRight: 16 }} color={device.enabled ? 'var(--color-success)' : 'var(--color-error)'} size={24} />
      </span>
      <div className="flex-1 mr-2"><p className="text-sm font-medium">{device.port}</p><p className="text-xs text-muted">Port</p></div>
      <div className="flex-1 mr-2"><p className="text-sm font-medium">{device.name}</p><p className="text-xs text-muted">Name</p></div>
      <div className="flex-1 mr-2"><p className="text-sm font-medium">{device.vendor}</p><p className="text-xs text-muted">Vendor</p></div>
      <button className={`px-4 py-2 rounded-lg font-semibold transition inline-flex items-center gap-2 shrink-0 ${device.enabled ? 'text-error hover:bg-error/10' : 'text-success hover:bg-success/10'}`} onClick={() => onEnable(device.port, device.enabled)}>
        {device.enabled ? <X size={18} /> : <CheckCircle2 size={18} />} {device.enabled ? 'Disable' : 'Enable'}
      </button>
    </div>
  );
};
export default UsbConfigCard;
