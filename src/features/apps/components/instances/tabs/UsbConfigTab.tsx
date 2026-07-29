import HelpButton from '@app/layout/HelpButton';
import { instancedeviceconfig } from '@app/layout/helplinks';
import type { UsbDraft } from '../useInstanceConfigDraft';
import UsbConfigCard from './UsbConfigCard';

interface UsbConfigTabProps {
  devices: UsbDraft[];
  onToggle: (port: string) => void;
}

const UsbConfigTab = ({ devices, onToggle }: UsbConfigTabProps) => (
  <div>
    <div className="mb-4 flex items-center gap-1">
      <p className="text-sm font-medium">Available devices</p>
      <HelpButton url={instancedeviceconfig} />
    </div>
    {devices.length === 0 ? (
      <div className="flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface-subtle px-6 text-center">
        <p className="text-sm font-medium">No USB devices found</p>
        <p className="mt-1 text-xs text-muted">
          Connect a USB device to the host and it will appear here.
        </p>
      </div>
    ) : (
      <div className="space-y-2">
        {devices.map((device) => (
          <UsbConfigCard key={device.port} device={device} onToggle={onToggle} />
        ))}
      </div>
    )}
  </div>
);

export default UsbConfigTab;
